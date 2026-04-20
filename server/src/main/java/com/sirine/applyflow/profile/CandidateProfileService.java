package com.sirine.applyflow.profile;

import com.sirine.applyflow.profile.request.CandidateProfileRequest;
import com.sirine.applyflow.profile.response.CandidateProfileResponse;

public interface CandidateProfileService {

    CandidateProfileResponse upsert(CandidateProfileRequest request, String userId);

    CandidateProfileResponse getByUserId(String userId);
}
