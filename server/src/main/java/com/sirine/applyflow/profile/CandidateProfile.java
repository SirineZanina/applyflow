package com.sirine.applyflow.profile;

import com.sirine.applyflow.common.BaseEntity;
import com.sirine.applyflow.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "candidate_profiles")
public class CandidateProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "headline")
    private String headline;

    @Column(name= "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @ElementCollection
    @CollectionTable(name= "profile_desired_roles",
    joinColumns = @JoinColumn(name= "profile_id"))
    @Column(name= "role")
    private List<String> desiredRoles = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name= "profile_desired_locations",
            joinColumns = @JoinColumn(name= "profile_id"))
    @Column(name = "location")
    private List<String> desiredLocations = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "profile_skills",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "profile_company_sizes",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "company_size")
    private List<String> companySizes = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "remote_preference")
    private RemotePreference remotePreference;

    @Column(name= "salary_min")
    private Integer salaryMin;

    @Column(name= "salary_max")
    private Integer salaryMax;

    @Column(name= "currency", length = 3)
    private String currency= "EUR";
}
