package com.sirine.applyflow.document.impl;

import com.sirine.applyflow.document.DocumentType;
import com.sirine.applyflow.document.GeneratedDocument;
import com.sirine.applyflow.document.GeneratedDocumentRepository;
import com.sirine.applyflow.document.GeneratedDocumentService;
import com.sirine.applyflow.document.request.UpdateGeneratedDocumentRequest;
import com.sirine.applyflow.document.response.GeneratedDocumentResponse;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.storage.StorageService;
import com.sirine.applyflow.user.User;
import com.sirine.applyflow.user.UserRepository;
import com.sirine.applyflow.validation.ValidationConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.Normalizer;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeneratedDocumentServiceImpl implements GeneratedDocumentService {

    private static final Duration VIEW_URL_TTL = Duration.ofMinutes(10);
    private static final long MAX_FILE_SIZE_BYTES = ValidationConstants.FILE_MAX_BYTES;
    private static final Map<String, String> ACCEPTED_MIMES = Map.of(
            "application/pdf", "pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx",
            "image/png", "png",
            "image/jpeg", "jpg"
    );

    private final GeneratedDocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final Tika tika;

    @Override
    @Transactional(readOnly = true)
    public List<GeneratedDocumentResponse> list(final String userId) {
        return documentRepository.findByUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(document -> toResponse(document, false))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GeneratedDocumentResponse get(final String id, final String userId) {
        return toResponse(findOwnedDocument(id, userId), true);
    }

    @Override
    @Transactional
    public GeneratedDocumentResponse uploadPortfolio(final String userId, final String title, final MultipartFile file) {
        final String detectedMime = validateAndDetectMime(file);

        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
        final String extension = ACCEPTED_MIMES.get(detectedMime);
        final String storageKey = "users/%s/documents/%s.%s".formatted(
                userId,
                UUID.randomUUID(),
                extension);

        try {
            storageService.upload(storageKey, file.getInputStream(), file.getSize(), detectedMime);
        } catch (IOException e) {
            log.error("Failed to upload generated document for user {}", userId, e);
            throw new BusinessException(ErrorCode.STORAGE_UPLOAD_FAILED, storageKey);
        }

        final GeneratedDocument document = documentRepository.save(GeneratedDocument.builder()
                .user(user)
                .type(DocumentType.PORTFOLIO)
                .title(resolveTitle(title, file.getOriginalFilename()))
                .storageKey(storageKey)
                .mimeType(detectedMime)
                .sizeBytes(file.getSize())
                .build());

        return toResponse(document, true);
    }

    private String validateAndDetectMime(final MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.DOCUMENT_INVALID_UPLOAD);
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.RESUME_FILE_TOO_LARGE, MAX_FILE_SIZE_BYTES);
        }
        final String mime;
        try {
            mime = tika.detect(file.getBytes());
        } catch (IOException e) {
            log.error("Failed to read upload bytes for MIME detection", e);
            throw new BusinessException(ErrorCode.DOCUMENT_INVALID_UPLOAD);
        }
        if (!ACCEPTED_MIMES.containsKey(mime)) {
            throw new BusinessException(ErrorCode.DOCUMENT_INVALID_UPLOAD);
        }
        return mime;
    }

    @Override
    @Transactional
    public GeneratedDocumentResponse update(final String id, final String userId, final UpdateGeneratedDocumentRequest request) {
        final GeneratedDocument document = findOwnedDocument(id, userId);
        if (request.title() != null) {
            document.setTitle(sanitizeTitle(request.title()));
        }
        if (request.content() != null && document.getStorageKey() == null) {
            document.setContent(request.content());
            document.setSizeBytes((long) request.content().length());
            if (document.getMimeType() == null) {
                document.setMimeType("text/markdown");
            }
        }
        return toResponse(documentRepository.save(document), true);
    }

    @Override
    @Transactional
    public void delete(final String id, final String userId) {
        final GeneratedDocument document = findOwnedDocument(id, userId);
        if (document.getStorageKey() != null) {
            storageService.delete(document.getStorageKey());
        }
        documentRepository.delete(document);
    }

    private GeneratedDocument findOwnedDocument(final String id, final String userId) {
        return documentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOCUMENT_NOT_FOUND, id));
    }

    private GeneratedDocumentResponse toResponse(final GeneratedDocument document, final boolean includeContent) {
        return new GeneratedDocumentResponse(
                document.getId(),
                document.getApplication() != null ? document.getApplication().getId() : null,
                document.getType(),
                document.getTitle(),
                includeContent ? document.getContent() : null,
                document.getMimeType(),
                document.getSizeBytes(),
                document.getStorageKey() != null ? storageService.presignedGetUrl(document.getStorageKey(), VIEW_URL_TTL).toString() : null,
                document.getCreatedDate(),
                document.getLastModifiedDate()
        );
    }

    private String resolveTitle(final String title, final String fallback) {
        final String sanitized = sanitizeTitle(title);
        if (!sanitized.isBlank()) {
            return sanitized;
        }
        return sanitizeTitle(fallback);
    }

    private String sanitizeTitle(final String value) {
        if (value == null) {
            return "";
        }
        final String normalized = Normalizer.normalize(value, Normalizer.Form.NFKC);
        return normalized.replaceAll("[\\p{Cntrl}\\p{Cf}]", "").strip();
    }
}
