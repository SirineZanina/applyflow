package com.sirine.applyflow.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByEmailIgnoreCase(String mail);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByPhoneNumber(String phoneNumber);
}
