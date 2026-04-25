package com.sirine.applyflow.resume;

import com.sirine.applyflow.resume.request.ResumeReplaceFileRequest;
import com.sirine.applyflow.resume.request.ResumeUpdateLabelRequest;
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

    String getViewUrl(String resumeId, String userId);

    ResumeDocumentResponse updateLabel(String resumeId, ResumeUpdateLabelRequest request,
                                       String userId);

    ResumeDocumentResponse replaceFile(String resumeId, ResumeReplaceFileRequest request,
                                       String userId);
}
