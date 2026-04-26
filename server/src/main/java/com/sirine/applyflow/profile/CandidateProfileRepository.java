package com.sirine.applyflow.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, String> {

    Optional<CandidateProfile> findByUser_Id(String userId);
    boolean existsByUser_Id(String userId);

    /** Eagerly fetches desiredRoles + desiredLocations in a single query. */
    @Query("SELECT DISTINCT p FROM CandidateProfile p LEFT JOIN FETCH p.desiredRoles LEFT JOIN FETCH p.desiredLocations")
    List<CandidateProfile> findAllWithCollections();
}
