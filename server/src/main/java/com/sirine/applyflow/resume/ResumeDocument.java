package com.sirine.applyflow.resume;

import com.sirine.applyflow.common.BaseEntity;
import com.sirine.applyflow.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@Table(name = "resume_documents")
public class ResumeDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name= "label")
    private String label;

    @Column(name = "storage_key", nullable = false)
    private String storageKey;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "parsed_at")
    private LocalDateTime parsedAt;

    @Column(name = "is_primary")
    private boolean primary;

    @OneToMany(mappedBy = "resume", cascade =
            CascadeType.ALL, orphanRemoval = true)
    private List<ResumeSection> sections = new
            ArrayList<>();
}
