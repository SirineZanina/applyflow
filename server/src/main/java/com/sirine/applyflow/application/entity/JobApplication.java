package com.sirine.applyflow.application.entity;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.job.JobListing;
import com.sirine.applyflow.common.BaseEntity;
import com.sirine.applyflow.resume.ResumeDocument;
import com.sirine.applyflow.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "job_applications", indexes = {
        @Index(name = "idx_job_applications_user_id", columnList = "user_id"),
        @Index(name = "idx_job_applications_status", columnList = "status")
})
public class JobApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private ResumeDocument resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_listing_id")
    private JobListing jobListing;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "job_url", length = 500)
    private String jobUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ApplicationStatus status = ApplicationStatus.SAVED;

    @Column(name = "applied_at")
    private LocalDate appliedAt;

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(name = "next_step")
    private String nextStep;

    @Column(name = "next_step_at")
    private java.time.LocalDateTime nextStepAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "ai_prepared", nullable = false)
    private boolean aiPrepared;
}
