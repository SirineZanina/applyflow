package com.sirine.applyflow.profile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, String> {

    Optional<CandidateProfile> findByUser_Id(String userId);
    boolean existsByUser_Id(String userId);

}