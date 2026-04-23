package com.sirine.applyflow.storage.impl;

import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.storage.StorageProperties;
import com.sirine.applyflow.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final StorageProperties props;

    @Override
    public void upload(final String key, final InputStream data, final long contentLength, final String contentType) {
        final byte[] bytes;
        try {
            bytes = data.readAllBytes();
        } catch (IOException e) {
            log.error("Failed to buffer stream for key {}", key, e);
            throw new BusinessException(ErrorCode.STORAGE_UPLOAD_FAILED, key);
        }
        log.info("Uploading key={} expectedBytes={} actualBytes={} contentType={}", key, contentLength, bytes.length, contentType);
        try {
            s3Client.putObject(
                    req -> req.bucket(props.getBucket())
                            .key(key)
                            .contentType(contentType)
                            .contentLength((long) bytes.length),
                    RequestBody.fromBytes(bytes));
        } catch (S3Exception e) {
            log.error("S3 upload failed for key {}", key, e);
            throw new BusinessException(ErrorCode.STORAGE_UPLOAD_FAILED, key);
        }
    }

    @Override
    public InputStream download(final String key) {
        try {
            return s3Client.getObject(req -> req.bucket(props.getBucket()).key(key));
        } catch (NoSuchKeyException _) {
            throw new BusinessException(ErrorCode.STORAGE_OBJECT_NOT_FOUND, key);
        }
    }

    @Override
    public URL presignedGetUrl(final String key, final Duration ttl) {
        return s3Presigner.presignGetObject(p -> p
                .signatureDuration(ttl)
                .getObjectRequest(r -> r.bucket(props.getBucket()).key(key))
        ).url();
    }

    @Override
    public URL presignedPutUrl(final String key, final Duration ttl, final String contentType) {
        return s3Presigner.presignPutObject(p -> p
                .signatureDuration(ttl)
                .putObjectRequest(r -> r
                        .bucket(props.getBucket())
                        .key(key)
                        .contentType(contentType))
        ).url();
    }

    @Override
    public void delete(final String key) {
        s3Client.deleteObject(req -> req.bucket(props.getBucket()).key(key));
    }

    @Override
    public boolean exists(final String key) {
        try {
            s3Client.headObject(req -> req.bucket(props.getBucket()).key(key));
            return true;
        } catch (NoSuchKeyException _) {
            return false;
        }
    }
}
