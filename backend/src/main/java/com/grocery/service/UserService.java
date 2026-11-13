package com.grocery.service;

import com.grocery.dto.ChangePasswordRequest;
import com.grocery.dto.ProfileUpdateRequest;
import com.grocery.entity.User;
import com.grocery.exception.BadRequestException;
import com.grocery.exception.ResourceNotFoundException;
import com.grocery.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already taken by another account");
            }
            user.setEmail(request.getEmail());
        }

        user.setName(request.getName());
        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());

        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
