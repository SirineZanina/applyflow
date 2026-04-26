package com.sirine.applyflow.ingestion;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "adzuna")
public class AdzunaProperties {

    private boolean enabled = false;
    private String appId;
    private String apiKey;
    /** ISO country code used in the Adzuna URL path (gb, fr, de, us…). */
    private String country = "gb";
    private int resultsPerPage = 20;
}
