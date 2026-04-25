package com.sirine.applyflow.document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GeneratedDocumentRepository extends JpaRepository<GeneratedDocument, String> {

    List<GeneratedDocument> findByUserIdOrderByCreatedDateDesc(String userId);

    Optional<GeneratedDocument> findByIdAndUserId(String id, String userId);

    Optional<GeneratedDocument> findByUserIdAndApplicationIdAndType(String userId, String applicationId, DocumentType type);

    void deleteByUserId(String userId);
}
