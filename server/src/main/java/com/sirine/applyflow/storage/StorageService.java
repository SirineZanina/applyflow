package com.sirine.applyflow.storage;

import java.io.InputStream;
import java.net.URL;
import java.time.Duration;

public interface StorageService {

    void upload(String key, InputStream data, long contentLength, String contentType);

    InputStream download(String key);

    URL presignedGetUrl(String key, Duration ttl);

    URL presignedPutUrl(String key, Duration ttl, String contentType);

    void delete(String key);

    boolean exists(String key);
}
