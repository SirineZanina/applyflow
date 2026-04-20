package com.sirine.applyflow.auth;

import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.request.RefreshRequest;
import com.sirine.applyflow.auth.request.RegistrationRequest;
import com.sirine.applyflow.auth.response.AuthenticationResponse;

public interface AuthenticationService {

    AuthenticationResponse login(AuthenticationRequest request);

    void register(RegistrationRequest request);

    AuthenticationResponse refreshToken(RefreshRequest request);

    void logout(RefreshRequest request);
}
