package com.chatapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatapp.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);
}
