package com.sirine.applyflow.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private String provider;
    private String endpoint;
    private String region;
    private String bucket;
    private String accessKey;
    private String secretKey;
    private boolean pathStyleAccess = true;
}
