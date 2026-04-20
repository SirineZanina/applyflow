package com.sirine.applyflow.user;

import com.sirine.applyflow.common.SecurityUtils;
import com.sirine.applyflow.user.request.ChangePasswordRequest;
import com.sirine.applyflow.user.request.ProfileUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@Tag(name = "User", description = "User API")
public class UserController {

    private final UserService userService;

    @PatchMapping("/me")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void updateProfileInfo(
            @RequestBody
            @Valid
            final ProfileUpdateRequest request,
            final Authentication principal
            ) {
        this.userService.updateProfileInfo(request, SecurityUtils.extractUserId(principal));
    }

    @PostMapping("/me/password")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void changePassword(
            @RequestBody
            @Valid
            final ChangePasswordRequest request,
            final Authentication principal
            ) {
        this.userService.changePassword(request, SecurityUtils.extractUserId(principal));
    }

    @PatchMapping("/me/deactivate")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deactivateAccount(final Authentication principal){
        this.userService.deactivateAccount(SecurityUtils.extractUserId(principal));
    }

    @PatchMapping("/me/reactivate")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void reactivateAccount(final Authentication principal){
        this.userService.reactivateAccount(SecurityUtils.extractUserId(principal));
    }

    @DeleteMapping("/me")
    @ResponseStatus(code = HttpStatus.NO_CONTENT)
    public void deleteAccount(final Authentication principal){
        this.userService.deleteAccount(SecurityUtils.extractUserId(principal));
    }

}
