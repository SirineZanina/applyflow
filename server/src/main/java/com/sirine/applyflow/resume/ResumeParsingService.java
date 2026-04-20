package com.sirine.applyflow.resume;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sirine.applyflow.ai.AiClient;
import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeParsingService {

    private static final String SYSTEM_PROMPT = """
            You are a resume parser. Extract structured sections from the candidate's resume.
            Return a single JSON object with these keys:
            - summary: string (professional summary, or null)
            - experience: array of {title, company, startDate, endDate, bullets} (bullets is string array)
            - education: array of {institution, degree, field, startDate, endDate}
            - skills: array of strings
            - projects: array of {name, description}
            - certifications: array of {name, issuer, date}
            Use null for unknown fields. Dates in ISO 8601 where possible.
            """;

    private final ResumeDocumentRepository resumeDocumentRepository;
    private final StorageService storageService;
    private final AiClient aiClient;
    private final ObjectMapper objectMapper;
    private final Tika tika;

    /**
     * IMPORTANT — proxy constraints:
     * - {@code @Async}: Spring wraps this class in a proxy. Calling {@code parseAsync} from within
     *   this class (e.g. a retry helper) bypasses the proxy, so the async dispatch won't happen.
     *   Always invoke it from an external caller (e.g. via TransactionSynchronizationManager.afterCommit).
     * - {@code @Transactional}: the transaction opens in the async thread, not the caller's thread.
     *   {@code ApplicationAuditorAware} returns "system" when no SecurityContext is present,
     *   which is correct here — sections are created by the system, not a logged-in user.
     */
    @Async
    @Transactional
    public void parseAsync(final String resumeId) {
        final ResumeDocument document = resumeDocumentRepository.findById(resumeId).orElse(null);
        if (document == null) {
            log.warn("parseAsync: resume {} not found, skipping", resumeId);
            return;
        }

        log.info("Starting parsing for resume {}", resumeId);

        final String extractedText;
        try {
            extractedText = extractText(document);
        } catch (TikaException e) {
            log.error("Tika parsing failed for resume {}", resumeId, e);
            return;
        } catch (IOException e) {
            log.error("I/O error during text extraction for resume {}", resumeId, e);
            return;
        } catch (BusinessException e) {
            log.error("Storage error during text extraction for resume {}: {}", resumeId, e.getMessage());
            return;
        }

        if (extractedText == null || extractedText.isBlank()) {
            log.warn("parseAsync: no text extracted from resume {}", resumeId);
            return;
        }

        final ResumeExtraction extraction;
        try {
            extraction = aiClient.completeJson(SYSTEM_PROMPT, extractedText, ResumeExtraction.class);
        } catch (BusinessException e) {
            log.error("AI extraction failed for resume {}: {}", resumeId, e.getMessage());
            return;
        }

        // Build the new sections before touching the collection so that, if serialization fails
        // mid-way, we haven't partially mutated document.getSections() yet.
        final List<ResumeSection> built = buildSections(document, extraction);
        document.getSections().clear();
        document.getSections().addAll(built);
        document.setParsedAt(LocalDateTime.now());
        resumeDocumentRepository.save(document);

        log.info("Parsing complete for resume {} — {} sections saved", resumeId, document.getSections().size());
    }

    private String extractText(final ResumeDocument document) throws TikaException, IOException {
        try (InputStream stream = storageService.download(document.getStorageKey())) {
            return tika.parseToString(stream);
        }
    }

    private List<ResumeSection> buildSections(final ResumeDocument document, final ResumeExtraction extraction) {
        final List<ResumeSection> sections = new ArrayList<>();
        int order = 0;

        order = addSection(sections, document, SectionType.SUMMARY, extraction.summary(), order);
        order = addSection(sections, document, SectionType.EXPERIENCE, extraction.experience(), order);
        order = addSection(sections, document, SectionType.EDUCATION, extraction.education(), order);
        order = addSection(sections, document, SectionType.SKILL, extraction.skills(), order);
        order = addSection(sections, document, SectionType.PROJECT, extraction.projects(), order);
        addSection(sections, document, SectionType.CERTIFICATION, extraction.certifications(), order);

        return sections;
    }

    private int addSection(
            final List<ResumeSection> target,
            final ResumeDocument document,
            final SectionType type,
            final Object value,
            final int orderIndex) {
        if (value == null) {
            return orderIndex;
        }
        if (value instanceof List<?> list && list.isEmpty()) {
            return orderIndex;
        }
        if (value instanceof String str && str.isBlank()) {
            return orderIndex;
        }
        try {
            final String json = objectMapper.writeValueAsString(value);
            target.add(ResumeSection.builder()
                    .resume(document)
                    .type(type)
                    .rawJson(json)
                    .orderIndex(orderIndex)
                    .build());
            return orderIndex + 1;
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize section {} for resume {}", type, document.getId(), e);
            return orderIndex;
        }
    }
}
