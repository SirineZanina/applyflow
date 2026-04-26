package com.sirine.applyflow.job;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobListingRepository extends JpaRepository<JobListing, String> {

    List<JobListing> findByActiveTrueOrderByPostedAtDesc();

    Optional<JobListing> findByIdAndActiveTrue(String id);

    Optional<JobListing> findByExternalSourceAndExternalId(String externalSource, String externalId);
}
