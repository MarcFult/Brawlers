package com.brawls.brawling.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.brawls.brawling.models.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);  // This should exist

    Optional<User> findByEmail(String email);
}