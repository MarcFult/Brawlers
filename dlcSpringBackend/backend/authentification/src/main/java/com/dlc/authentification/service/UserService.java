package com.dlc.authentification.service;

import com.dlc.authentification.model.User;
import com.dlc.authentification.repository.UserRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    @Autowired
    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public User register(String email, String rawPassword) {
        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        User u = new User();
        u.setEmail(email);
        u.setPassword(encoder.encode(rawPassword));
        return repo.save(u);
    }

    public Optional<User> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    public Long getUserIdByEmail(String email) {
        return findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email: " + email));
    }

    public User getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("No user with id: " + id));
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }

}
