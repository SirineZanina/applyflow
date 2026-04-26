package com.sirine.applyflow.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.profile.CandidateProfile;
import com.sirine.applyflow.resume.ResumeDocument;
import com.sirine.applyflow.resume.ResumeSection;
import com.sirine.applyflow.resume.SectionType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiDocumentGenerator {

    private static final String SYSTEM_RESUME =
            "You are an expert CV writer. Write a concise, ATS-optimised tailored resume in clean markdown. " +
            "Return ONLY valid JSON: {\"markdown\": \"<full resume in markdown>\", \"summary\": \"<one sentence why this candidate fits>\"}. " +
            "No commentary outside the JSON.";

    private static final String SYSTEM_COVER_LETTER =
            "You are an expert cover letter writer. Write a compelling, specific cover letter in clean markdown. " +
            "Return ONLY valid JSON: {\"markdown\": \"<full cover letter in markdown>\", \"summary\": \"<one sentence key selling point>\"}. " +
            "No commentary outside the JSON.";

    private final AiClient aiClient;
    private final ObjectMapper objectMapper;

    public AiDocumentOutput generateResume(
            final CandidateProfile profile,
            final ResumeDocument resume,
            final JobListing listing,
            final String tone) {

        final String prompt = buildResumePrompt(profile, resume, listing, tone);
        return callWithFallback(SYSTEM_RESUME, prompt, "resume");
    }

    public AiDocumentOutput generateCoverLetter(
            final CandidateProfile profile,
            final ResumeDocument resume,
            final JobListing listing,
            final String tone) {

        final String prompt = buildCoverLetterPrompt(profile, resume, listing, tone);
        return callWithFallback(SYSTEM_COVER_LETTER, prompt, "cover letter");
    }

    private AiDocumentOutput callWithFallback(final String system, final String prompt, final String docType) {
        try {
            final String raw = aiClient.complete(system, prompt, 4096);
            final String cleaned = stripFences(raw);
            final JsonNode node = objectMapper.readTree(cleaned);
            return new AiDocumentOutput(
                    node.path("markdown").asText(null),
                    node.path("summary").asText(null)
            );
        } catch (Exception e) {
            log.warn("AI {} generation failed, returning null for fallback: {}", docType, e.getMessage());
            return null;
        }
    }

    private String buildResumePrompt(
            final CandidateProfile profile,
            final ResumeDocument resume,
            final JobListing listing,
            final String tone) {

        return """
                TONE: %s

                === CANDIDATE PROFILE ===
                Name/Headline: %s
                Years of experience: %s
                Skills: %s
                Summary: %s
                Experience: %s

                === TARGET JOB ===
                Company: %s
                Title: %s
                Location: %s
                Required skills: %s
                Description (first 800 chars): %s

                Write a tailored resume for this candidate applying to this job. Keep it to 1 page. Lead with the most relevant experience and skills. Quantify bullets where data is available in the profile.
                """.formatted(
                toneInstruction(tone),
                headline(profile),
                yearsExp(profile),
                skills(profile),
                summary(profile),
                experience(resume),
                company(listing),
                title(listing),
                location(listing),
                requiredSkills(listing),
                description(listing)
        );
    }

    private String buildCoverLetterPrompt(
            final CandidateProfile profile,
            final ResumeDocument resume,
            final JobListing listing,
            final String tone) {

        return """
                TONE: %s

                === CANDIDATE PROFILE ===
                Headline: %s
                Years of experience: %s
                Skills: %s
                Summary: %s

                === TARGET JOB ===
                Company: %s
                Title: %s
                Description (first 800 chars): %s

                Write a cover letter. 3 paragraphs max. Be specific — reference the company and role directly. Do not use generic filler sentences.
                """.formatted(
                toneInstruction(tone),
                headline(profile),
                yearsExp(profile),
                skills(profile),
                summary(profile),
                company(listing),
                title(listing),
                description(listing)
        );
    }

    private String toneInstruction(final String tone) {
        if (tone == null) return "Professional and confident.";
        return switch (tone.toUpperCase()) {
            case "CASUAL" -> "Conversational, warm, and approachable — avoid corporate jargon.";
            case "CONCISE" -> "Extremely concise. Every word must earn its place. No filler.";
            default -> "Professional, confident, and direct.";
        };
    }

    private String headline(final CandidateProfile p) {
        return p != null && p.getHeadline() != null ? p.getHeadline() : "N/A";
    }

    private String yearsExp(final CandidateProfile p) {
        return p != null && p.getYearsExperience() != null ? p.getYearsExperience() + " years" : "N/A";
    }

    private String skills(final CandidateProfile p) {
        if (p == null || p.getSkills() == null || p.getSkills().isEmpty()) return "N/A";
        return String.join(", ", p.getSkills());
    }

    private String summary(final CandidateProfile p) {
        return p != null && p.getSummary() != null ? p.getSummary() : "N/A";
    }

    private String experience(final ResumeDocument resume) {
        if (resume == null || resume.getSections() == null) return "N/A";
        return resume.getSections().stream()
                .filter(s -> s.getType() == SectionType.EXPERIENCE)
                .findFirst()
                .map(ResumeSection::getRawJson)
                .map(raw -> raw.length() > 1200 ? raw.substring(0, 1200) : raw)
                .orElse("N/A");
    }

    private String company(final JobListing l) { return l != null ? l.getCompanyName() : "N/A"; }
    private String title(final JobListing l) { return l != null ? l.getTitle() : "N/A"; }
    private String location(final JobListing l) { return l != null ? l.getLocation() : "N/A"; }

    private String requiredSkills(final JobListing l) {
        if (l == null || l.getRequiredSkills() == null || l.getRequiredSkills().isEmpty()) return "N/A";
        return String.join(", ", l.getRequiredSkills());
    }

    private String description(final JobListing l) {
        if (l == null || l.getDescription() == null) return "N/A";
        return l.getDescription().length() > 800 ? l.getDescription().substring(0, 800) : l.getDescription();
    }

    private String stripFences(final String s) {
        String t = s.trim();
        if (t.startsWith("```")) {
            final int nl = t.indexOf('\n');
            if (nl > 0) t = t.substring(nl + 1);
            if (t.endsWith("```")) t = t.substring(0, t.length() - 3);
        }
        return t.trim();
    }
}
