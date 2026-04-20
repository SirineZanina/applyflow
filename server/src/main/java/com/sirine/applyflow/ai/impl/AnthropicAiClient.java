package com.sirine.applyflow.ai.impl;

import com.anthropic.client.AnthropicClient;
import com.anthropic.models.messages.ContentBlock;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sirine.applyflow.ai.AiClient;
import com.sirine.applyflow.ai.AiProperties;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ai.provider", havingValue = "anthropic")
public class AnthropicAiClient implements AiClient {

    private static final String JSON_INSTRUCTION =
            "\n\nRespond with ONLY a single valid JSON object. No markdown fences, no prose, no commentary.";

    private final AnthropicClient client;
    private final AiProperties props;
    private final ObjectMapper objectMapper;

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        return complete(systemPrompt, userPrompt, props.getDefaultMaxTokens());
    }

    @Override
    public String complete(String systemPrompt, String userPrompt, int maxTokens) {
        try {
            MessageCreateParams.Builder builder = MessageCreateParams.builder()
                    .model(props.getModel())
                    .maxTokens(maxTokens)
                    .addUserMessage(userPrompt);
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                builder.system(systemPrompt);
            }
            Message message = client.messages().create(builder.build());
            return extractText(message);
        } catch (Exception e) {
            log.error("Anthropic request failed", e);
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, e.getMessage());
        }
    }

    @Override
    public <T> T completeJson(String systemPrompt, String userPrompt, Class<T> responseType) {
        String enrichedSystem = (systemPrompt == null ? "" : systemPrompt) + JSON_INSTRUCTION;
        String raw = complete(enrichedSystem, userPrompt);
        String cleaned = stripFences(raw);
        try {
            return objectMapper.readValue(cleaned, responseType);
        } catch (Exception e) {
            log.error("Failed to parse AI response as {}: {}", responseType.getSimpleName(), cleaned, e);
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_FAILED, e.getMessage());
        }
    }

    private String extractText(Message message) {
        StringBuilder out = new StringBuilder();
        for (ContentBlock block : message.content()) {
            block.text().ifPresent(t -> out.append(t.text()));
        }
        return out.toString();
    }

    private String stripFences(String s) {
        String trimmed = s.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline > 0) trimmed = trimmed.substring(firstNewline + 1);
            if (trimmed.endsWith("```")) trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
