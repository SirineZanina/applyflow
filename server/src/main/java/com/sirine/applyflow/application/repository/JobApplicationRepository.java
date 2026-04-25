package com.sirine.applyflow.application.repository;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.application.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, String> {

    Page<JobApplication> findByUserId(String userId, Pageable pageable);

    Page<JobApplication> findByUserIdAndStatus(String userId, ApplicationStatus status, Pageable pageable);

    @Query("select count(a) from JobApplication a where a.user.id = :userId")
    long countByUserId(@Param("userId") String userId);

    @Query("select count(a) from JobApplication a where a.user.id = :userId and a.status = :status")
    long countByUserIdAndStatus(@Param("userId") String userId, @Param("status") ApplicationStatus status);

    Optional<JobApplication> findByIdAndUserId(String id, String userId);

    Optional<JobApplication> findByUserIdAndJobListingId(String userId, String jobListingId);

    List<JobApplication> findByUserIdAndJobListingIdIn(String userId, Collection<String> jobListingIds);

    List<JobApplication> findByUserIdOrderByCreatedDateDesc(String userId);

    List<JobApplication> findTop5ByUserIdAndNextStepAtAfterOrderByNextStepAtAsc(String userId, LocalDateTime nextStepAt);

    void deleteByUserId(String userId);
}
