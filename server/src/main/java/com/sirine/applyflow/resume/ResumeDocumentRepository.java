package com.sirine.applyflow.resume;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ResumeDocumentRepository extends JpaRepository<ResumeDocument, String> {

    List<ResumeDocument> findByUser_IdOrderByCreatedDateDesc(String userId);

    Optional<ResumeDocument> findByUser_IdAndPrimaryTrue(String userId);

    Optional<ResumeDocument> findByIdAndUser_Id(String id, String userId);

    void deleteByUser_Id(String userId);

    @Modifying
    @Query("update ResumeDocument r set r.primary = false where r.user.id = :userId and r.id <> :keepId")
    void clearPrimaryExcept(String userId, String keepId);

}
