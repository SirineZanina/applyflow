package com.sirine.applyflow.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sirine.applyflow.ai.AiClient;
import com.sirine.applyflow.ai.AiProperties;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ai.provider", havingValue = "gemini")
public class GeminiAiClient implements AiClient {

    private static final String API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    // One shared instance — HttpClient is thread-safe.
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    private final AiProperties props;
    private final ObjectMapper objectMapper;

    @Override
    public String complete(final String systemPrompt, final String userPrompt) {
        return callGemini(systemPrompt, userPrompt, props.getDefaultMaxTokens(), null);
    }

    @Override
    public String complete(final String systemPrompt, final String userPrompt, final int maxTokens) {
        return callGemini(systemPrompt, userPrompt, maxTokens, null);
    }

    /**
     * Uses Gemini's native JSON mode ({@code responseMimeType: "application/json"}) instead of
     * injecting a system prompt instruction and stripping fences. The model guarantees valid JSON.
     */
    @Override
    public <T> T completeJson(final String systemPrompt, final String userPrompt, final Class<T> responseType) {
        final String raw = callGemini(systemPrompt, userPrompt, props.getDefaultMaxTokens(), "application/json");
        try {
            return objectMapper.readValue(raw, responseType);
        } catch (Exception e) {
            log.error("Failed to parse Gemini response as {}: {}", responseType.getSimpleName(), raw, e);
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_FAILED, e.getMessage());
        }
    }

    private String callGemini(
            final String systemPrompt,
            final String userPrompt,
            final int maxTokens,
            final String responseMimeType) {

        final String requestBody = buildRequestBody(systemPrompt, userPrompt, maxTokens, responseMimeType);

        final HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL.formatted(props.getModel())))
                // API key in a header, not the URL — keeps it out of server access logs.
                .header("x-goog-api-key", props.getApiKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        final HttpResponse<String> response;
        try {
            response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            log.error("Gemini HTTP I/O error", e);
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, e.getMessage());
        } catch (InterruptedException _) {
            Thread.currentThread().interrupt();
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, "Request interrupted");
        }

        if (response.statusCode() != 200) {
            log.error("Gemini API returned HTTP {}: {}", response.statusCode(), response.body());
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, "HTTP " + response.statusCode());
        }

        return extractText(response.body());
    }

    private String buildRequestBody(
            final String systemPrompt,
            final String userPrompt,
            final int maxTokens,
            final String responseMimeType) {
        try {
            final Map<String, Object> body = new LinkedHashMap<>();

            if (systemPrompt != null && !systemPrompt.isBlank()) {
                body.put("systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))));
            }

            body.put("contents", List.of(
                    Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))));

            final Map<String, Object> generationConfig = new LinkedHashMap<>();
            generationConfig.put("maxOutputTokens", maxTokens);
            generationConfig.put("temperature", 0.1);
            if (responseMimeType != null) {
                generationConfig.put("responseMimeType", responseMimeType);
            }
            body.put("generationConfig", generationConfig);

            return objectMapper.writeValueAsString(body);
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, "Failed to serialize request: " + e.getMessage());
        }
    }

    private String extractText(final String responseBody) {
        try {
            final JsonNode root = objectMapper.readTree(responseBody);
            final String text = root
                    .path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText(null);

            if (text == null || text.isBlank()) {
                // Check for a prompt block (safety filter, quota, etc.) to give a useful error.
                final JsonNode blockReason = root.path("promptFeedback").path("blockReason");
                if (!blockReason.isMissingNode()) {
                    log.warn("Gemini blocked prompt: {}", blockReason.asText());
                    throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, "Blocked: " + blockReason.asText());
                }
                log.error("Gemini returned empty text, full response: {}", responseBody);
                throw new BusinessException(ErrorCode.AI_REQUEST_FAILED, "Empty response from Gemini");
            }

            return text;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini response structure", e);
            throw new BusinessException(ErrorCode.AI_RESPONSE_PARSE_FAILED, e.getMessage());
        }
    }
}
