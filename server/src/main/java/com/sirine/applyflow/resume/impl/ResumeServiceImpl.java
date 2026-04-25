package com.sirine.applyflow.resume.impl;

import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.resume.*;
import com.sirine.applyflow.resume.request.ResumeReplaceFileRequest;
import com.sirine.applyflow.resume.request.ResumeUpdateLabelRequest;
import com.sirine.applyflow.resume.request.ResumeUploadRequest;
import com.sirine.applyflow.resume.response.ResumeDocumentResponse;
import com.sirine.applyflow.storage.StorageService;
import com.sirine.applyflow.user.UserRepository;
import com.sirine.applyflow.validation.ValidationConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
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
public class ResumeServiceImpl implements ResumeService {

    private static final long MAX_FILE_SIZE_BYTES = ValidationConstants.FILE_MAX_BYTES;
    private static final Duration VIEW_URL_TTL = Duration.ofMinutes(10);

    private static final Map<String, String> ACCEPTED_MIMES = Map.of(
            "application/pdf", "pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "docx"
    );

    private final ResumeDocumentRepository resumeRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ResumeParsingService parsingService;
    private final ResumeMapper resumeMapper;
    private final Tika tika;


    @Override
    @Transactional
    public ResumeDocumentResponse upload(final ResumeUploadRequest request, final String userId) {
        final MultipartFile file = request.file();
        final String mime = validateFileAndDetectMime(file);

        final var user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));

        final String extension = ACCEPTED_MIMES.get(mime);
        final String storageKey = "users/%s/resumes/%s.%s".formatted(userId, UUID.randomUUID(), extension);
        try {
            storageService.upload(storageKey, file.getInputStream(), file.getSize(), mime);
        } catch (IOException e) {
            log.error("Failed to read multipart file for user {}", userId, e);
            throw new BusinessException(ErrorCode.RESUME_FILE_READ_FAILED);
        }

        // If the DB transaction rolls back after the upload, clean up the orphaned S3 object.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(final int status) {
                if (status == STATUS_ROLLED_BACK) {
                    try {
                        storageService.delete(storageKey);
                    } catch (Exception e) {
                        log.error("S3 cleanup failed for key {} after rollback", storageKey, e);
                    }
                }
            }
        });

        final boolean firstUpload = resumeRepository.findByUser_IdAndPrimaryTrue(userId).isEmpty();
        
        final String resolvedLabel = resolveLabel(request.label(), file);

        final ResumeDocument saved = resumeRepository.save(ResumeDocument.builder()
                .user(user)
                .label(resolvedLabel)
                .storageKey(storageKey)
                .mimeType(mime)
                .sizeBytes(file.getSize())
                .primary(firstUpload)
                .parseStatus(ResumeParseStatus.PROCESSING)
                .parseError(null)
                .build());

        // Dispatch parsing after the transaction commits so the async thread sees the persisted row.
        final String resumeId = saved.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                parsingService.parseAsync(resumeId);
            }
        });

        return resumeMapper.toResponse(saved);
    }



    @Override
    @Transactional(readOnly = true)
    public List<ResumeDocumentResponse> list(final String userId) {
        return resumeRepository.findByUser_IdOrderByCreatedDateDesc(userId)
                .stream()
                .map(resumeMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeDocumentResponse get(final String resumeId, final String userId) {
        return resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .map(resumeMapper::toResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));
    }

    @Override
    @Transactional
    public ResumeDocumentResponse setPrimary(final String resumeId, final String userId) {
        final ResumeDocument resume = resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));
        resumeRepository.clearPrimaryExcept(userId, resumeId);
        resume.setPrimary(true);
        return resumeMapper.toResponse(resumeRepository.save(resume));
    }

    @Override
    @Transactional
    public ResumeDocumentResponse reparse(final String resumeId, final String userId) {
        final ResumeDocument resume = resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));

        resume.setParseStatus(ResumeParseStatus.PROCESSING);
        resume.setParseError(null);

        final String id = resume.getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                parsingService.parseAsync(id);
            }
        });

        return resumeMapper.toResponse(resume);
    }

    @Override
    @Transactional(readOnly = true)
    public String getViewUrl(String resumeId, String userId) {
        final ResumeDocument resume = resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));
        return storageService.presignedGetUrl(resume.getStorageKey(), VIEW_URL_TTL).toString();
    }

    @Override
    @Transactional
    public ResumeDocumentResponse updateLabel(
            final String resumeId,
            final ResumeUpdateLabelRequest request,
            final String userId) {
        final ResumeDocument resume = findOwnedResume(resumeId, userId);
        resume.setLabel(sanitizeLabel(request.label()));
        return resumeMapper.toResponse(resumeRepository.save(resume));
    }

    @Override
    @Transactional
    public ResumeDocumentResponse replaceFile(
            final String resumeId,
            final ResumeReplaceFileRequest request,
            final String userId) {
        final ResumeDocument resume = findOwnedResume(resumeId, userId);

        final MultipartFile file = request.file();
        final String mime = validateFileAndDetectMime(file);
        final String extension = ACCEPTED_MIMES.get(mime);

        final String oldStorageKey = resume.getStorageKey();
        final String newStorageKey = "users/%s/resumes/%s.%s".formatted(
                userId, UUID.randomUUID(), extension);

        try {
            storageService.upload(newStorageKey, file.getInputStream(), file.getSize(), mime);
        } catch (IOException e) {
            log.error("Failed to read replacement multipart file for resume {}", resumeId, e);
            throw new BusinessException(ErrorCode.RESUME_FILE_READ_FAILED);
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(final int status) {
                if (status == STATUS_ROLLED_BACK) {
                    try {
                        storageService.delete(newStorageKey);
                    } catch (Exception e) {
                        log.error("S3 cleanup failed for key {} after rollback", newStorageKey, e);
                    }
                }
            }
        });

        resume.setStorageKey(newStorageKey);
        resume.setMimeType(mime);
        resume.setSizeBytes(file.getSize());
        resume.setParsedAt(null);
        resume.setParseStatus(ResumeParseStatus.PROCESSING);
        resume.setParseError(null);
        resume.getSections().clear();

        if (request.label() != null) {
            resume.setLabel(sanitizeLabel(request.label()));
        } else if (resume.getLabel() == null) {
            resume.setLabel(fallbackLabelFromFile(file));
        }

        final ResumeDocument saved = resumeRepository.save(resume);
        final String id = saved.getId();

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                try {
                    storageService.delete(oldStorageKey);
                } catch (Exception e) {
                    log.error("Failed to delete old storage key {} after file replacement", oldStorageKey, e);
                }
                parsingService.parseAsync(id);
            }
        });

        return resumeMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(final String resumeId, final String userId) {
        final ResumeDocument resume = resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));
        storageService.delete(resume.getStorageKey());
        resumeRepository.delete(resume);
    }

    private String sanitizeLabel(final String label) {
        if (label == null) {
            return null;
        }
        // NFKC normalization converts compatibility characters (half-width, ligatures, etc.)
        // to their canonical equivalents before we strip anything, so homoglyphs are defused first.
        final String normalized = Normalizer.normalize(label, Normalizer.Form.NFKC);
        // Strip ASCII/Unicode control characters (\p{Cntrl}) and Unicode format characters
        // (\p{Cf}: includes RTL override U+202E, BOM U+FEFF, soft-hyphen, etc.).
        final String cleaned = normalized.replaceAll("[\\p{Cntrl}\\p{Cf}]", "").strip();
        return cleaned.isEmpty() ? null : cleaned;
    }

    private String validateFileAndDetectMime(final MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.RESUME_FILE_EMPTY);
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.RESUME_FILE_TOO_LARGE, MAX_FILE_SIZE_BYTES);
        }
        final String mime;
        try {
            mime = tika.detect(file.getBytes());
        } catch (IOException e) {
            log.error("Failed to read file bytes for MIME detection", e);
            throw new BusinessException(ErrorCode.RESUME_FILE_READ_FAILED);
        }
        if (!ACCEPTED_MIMES.containsKey(mime)) {
            throw new BusinessException(ErrorCode.RESUME_INVALID_FILE, mime);
        }
        return mime;
    }

    private ResumeDocument findOwnedResume(final String resumeId, final String userId) {
        return resumeRepository.findByIdAndUser_Id(resumeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESUME_NOT_FOUND, resumeId));
    }


    private String resolveLabel(final String label, final MultipartFile file) {
        final String sanitized = sanitizeLabel(label);
        return (sanitized != null) ? sanitized : fallbackLabelFromFile(file);
    }

    private String fallbackLabelFromFile(final MultipartFile file) {
        final String original = file.getOriginalFilename();
        if (original == null || original.isBlank()) {
            return "Untitled resume";
        }
        final int dot = original.lastIndexOf('.');
        final String base = dot > 0 ? original.substring(0, dot) : original;
        final String sanitized = sanitizeLabel(base);
        return sanitized != null ? sanitized : "Untitled resume";
    }
}
