package com.sirine.applyflow.job;

import com.sirine.applyflow.job.response.JobCardResponse;
import com.sirine.applyflow.job.response.JobDetailResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface JobService {

    Page<JobCardResponse> list(String userId, String query, Boolean remoteOnly, Integer minMatch, List<String> roleTypes, int page, int size);

    JobDetailResponse get(String id, String userId);
}
