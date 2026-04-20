package com.sirine.applyflow.profile.impl;

import com.sirine.applyflow.exception.BusinessException;
import com.sirine.applyflow.exception.ErrorCode;
import com.sirine.applyflow.profile.CandidateProfile;
import com.sirine.applyflow.profile.CandidateProfileMapper;
import com.sirine.applyflow.profile.CandidateProfileRepository;
import com.sirine.applyflow.profile.CandidateProfileService;
import com.sirine.applyflow.profile.request.CandidateProfileRequest;
import com.sirine.applyflow.profile.response.CandidateProfileResponse;
import com.sirine.applyflow.user.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class CandidateProfileServiceImpl implements CandidateProfileService {

    private final CandidateProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final CandidateProfileMapper profileMapper;

    @Override
    @Transactional
    public CandidateProfileResponse upsert(final CandidateProfileRequest request, String userId) {
        final CandidateProfile profile = profileRepository.findByUser_Id(userId)
                .map(existing -> {
                    profileMapper.updateEntity(request, existing);
                    return existing;
                })
                .orElseGet(() -> {
                    final var user = userRepository.findById(userId)
                            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, userId));
                    final CandidateProfile created = profileMapper.toEntity(request);
                    created.setUser(user);
                    return created;
                });
        return profileMapper.toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public CandidateProfileResponse getByUserId(final String userId) {
        return profileRepository.findByUser_Id(userId)
                .map(profileMapper::toResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.CANDIDATE_PROFILE_NOT_FOUND, userId));
    }
}
