package com.sirine.applyflow.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RefreshRequest {

    @NotBlank(message = "VALIDATION.REFRESH.TOKEN.NOT_BLANK")
    private String refreshToken;
}
