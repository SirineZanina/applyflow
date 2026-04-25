package com.sirine.applyflow.document;

import com.sirine.applyflow.document.request.UpdateGeneratedDocumentRequest;
import com.sirine.applyflow.document.response.GeneratedDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface GeneratedDocumentService {

    List<GeneratedDocumentResponse> list(String userId);

    GeneratedDocumentResponse get(String id, String userId);

    GeneratedDocumentResponse uploadPortfolio(String userId, String title, MultipartFile file);

    GeneratedDocumentResponse update(String id, String userId, UpdateGeneratedDocumentRequest request);

    void delete(String id, String userId);
}
