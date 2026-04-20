package com.sirine.applyflow.auth;

import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.response.AuthenticationResponse;
import com.sirine.applyflow.role.RoleRepository;
import com.sirine.applyflow.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthenticationController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthenticationControllerWebMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthenticationService authenticationService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    @MockitoBean
    private RoleRepository roleRepository;

    @Test
    void authenticateReturnsSnakeCaseTokenPayload() throws Exception {
        when(authenticationService.login(any(AuthenticationRequest.class)))
                .thenReturn(AuthenticationResponse.builder()
                        .accessToken("access-token")
                        .refreshToken("refresh-token")
                        .tokenType("Bearer")
                        .build());

        mockMvc.perform(post("/api/v1/auth/authenticate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "john.doe@example.com",
                                  "password": "P@ssw0rd!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access_token").value("access-token"))
                .andExpect(jsonPath("$.refresh_token").value("refresh-token"))
                .andExpect(jsonPath("$.token_type").value("Bearer"))
                .andExpect(jsonPath("$.email").doesNotExist());
    }

}
