package com.chatapp.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.models.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
}
