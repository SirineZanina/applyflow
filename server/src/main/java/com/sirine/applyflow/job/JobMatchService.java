package com.sirine.applyflow.job;

public interface JobMatchService {

    JobMatchResult score(String userId, JobListing listing);
}
