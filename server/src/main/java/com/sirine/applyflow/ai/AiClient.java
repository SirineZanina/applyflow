package com.sirine.applyflow.ai;

public interface AiClient {

    String complete(String systemPrompt, String userPrompt);

    String complete(String systemPrompt, String userPrompt, int maxTokens);

    <T> T completeJson(String systemPrompt, String userPrompt, Class<T> responseType);
}
