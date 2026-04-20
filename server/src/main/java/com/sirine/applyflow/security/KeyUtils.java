package com.sirine.applyflow.security;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public final class KeyUtils {

    private KeyUtils() {}

    public static PrivateKey loadPrivateKey(final Path pemPath) throws GeneralSecurityException, IOException {
        final String body = readPemBody(pemPath, "PRIVATE KEY");
        final byte[] decoded = Base64.getDecoder().decode(body);
        return KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(decoded));
    }

    public static PublicKey loadPublicKey(final Path pemPath) throws GeneralSecurityException, IOException {
        final String body = readPemBody(pemPath, "PUBLIC KEY");
        final byte[] decoded = Base64.getDecoder().decode(body);
        return KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(decoded));
    }

    private static String readPemBody(final Path pemPath, final String label) throws IOException {
        if (!Files.isReadable(pemPath)) {
            throw new IllegalStateException("Key file not readable at " + pemPath.toAbsolutePath());
        }
        return Files.readString(pemPath)
                .replace("-----BEGIN " + label + "-----", "")
                .replace("-----END " + label + "-----", "")
                .replaceAll("\\s+", "");
    }
}
