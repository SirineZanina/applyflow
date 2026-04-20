package com.sirine.applyflow.resume;

import com.sirine.applyflow.resume.request.ResumeUploadRequest;
import com.sirine.applyflow.resume.response.ResumeDocumentResponse;

import java.util.List;

public interface ResumeService {

    ResumeDocumentResponse upload(ResumeUploadRequest request, String userId);

    List<ResumeDocumentResponse> list(String userId);

    ResumeDocumentResponse get(String resumeId, String userId);

    ResumeDocumentResponse setPrimary(String resumeId, String userId);

    void delete(String resumeId, String userId);

    ResumeDocumentResponse reparse(String resumeId, String userId);
}
