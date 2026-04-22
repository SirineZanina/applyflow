package com.sirine.applyflow.auth;

import com.sirine.applyflow.auth.request.AuthenticationRequest;
import com.sirine.applyflow.auth.request.RegistrationRequest;

public interface AuthenticationService {

    AuthTokenPair login(AuthenticationRequest request);

    void register(RegistrationRequest request);

    AuthTokenPair refreshToken(String rawRefreshToken);

    void logout(String rawRefreshToken);
}
