package com.sirine.applyflow.application.service;

import com.sirine.applyflow.application.ApplicationStatus;
import com.sirine.applyflow.application.request.CreateJobApplicationRequest;
import com.sirine.applyflow.application.request.UpdateJobApplicationRequest;
import com.sirine.applyflow.application.response.GenerateDocumentsResponse;
import com.sirine.applyflow.application.response.JobApplicationResponse;
import com.sirine.applyflow.application.response.PrepareJobApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobApplicationService {

    Page<JobApplicationResponse> list(String userId, ApplicationStatus filter, Pageable pageable);

    JobApplicationResponse get(String id, String userId);

    JobApplicationResponse create(String userId, CreateJobApplicationRequest request);

    JobApplicationResponse update(String id, String userId, UpdateJobApplicationRequest request);

    JobApplicationResponse patchStatus(String id, String userId, ApplicationStatus newStatus);

    JobApplicationResponse saveForListing(String listingId, String userId);

    PrepareJobApplicationResponse prepareForListing(String listingId, String userId);

    GenerateDocumentsResponse generateDocuments(String applicationId, String userId, String tone);

    void delete(String id, String userId);

    long countByUserId(String userId);

    long countByUserIdAndStatus(String userId, ApplicationStatus status);
}
