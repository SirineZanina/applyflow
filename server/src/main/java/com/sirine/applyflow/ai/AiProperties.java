package com.sirine.applyflow.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@Component
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    private String provider;
    private String model;

    @NotBlank(message = "Set AI_API_KEY (or GEMINI_API_KEY / ANTHROPIC_API_KEY) in server/.env before starting")
    private String apiKey;

    private int defaultMaxTokens = 4096;
}
