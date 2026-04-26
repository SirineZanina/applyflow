package com.sirine.applyflow.job;

import com.sirine.applyflow.common.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "job_listings")
public class JobListing extends BaseEntity {

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_logo_text")
    private String companyLogoText;

    @Column(name = "company_color")
    private String companyColor;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "remote_eligible", nullable = false)
    private boolean remoteEligible;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @ElementCollection
    @CollectionTable(name = "job_listing_required_skills", joinColumns = @JoinColumn(name = "job_listing_id"))
    @Column(name = "skill")
    private List<String> requiredSkills = new ArrayList<>();

    @Column(name = "role_type", nullable = false)
    private String roleType;

    @Column(name = "source_url", length = 500)
    private String sourceUrl;

    @Column(name = "posted_at", nullable = false)
    private LocalDate postedAt;

    @Column(name = "active", nullable = false)
    private boolean active;

    @Column(name = "external_source", length = 50)
    private String externalSource;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "external_url", length = 500)
    private String externalUrl;
}
