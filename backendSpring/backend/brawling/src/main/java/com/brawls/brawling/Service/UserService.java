package com.brawls.brawling.Service;

import org.springframework.stereotype.Service;
import com.brawls.brawling.models.User;
import com.brawls.brawling.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    // Constructor injection (no need for @Autowired here)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Method to register a user
    public User registerUser(User user) {
        // Check if the username or email already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists.");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists.");
        }

        // No password encoding, just save the user as it is
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();  // Returns all users
    }

    // Method to find a user by username
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
