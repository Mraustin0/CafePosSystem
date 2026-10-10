package com.cafepos.service.impl;

import com.cafepos.domain.entity.User;
import com.cafepos.domain.entity.UserProfile;
import com.cafepos.domain.enums.Role;
import com.cafepos.dto.request.*;
import com.cafepos.dto.response.PageResponse;
import com.cafepos.dto.response.UserResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.UserMapper;
import com.cafepos.repository.UserProfileRepository;
import com.cafepos.repository.UserRepository;
import com.cafepos.repository.UserSpecifications;
import com.cafepos.exception.BadRequestException;
import com.cafepos.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserProfileRepository profileRepository,
                           UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getProfile(id));
    }

    @Override
    @Transactional
    public UserResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        UserProfile profile = getProfile(userId);
        if (request.username() != null && !request.username().isBlank()) {
            String newUsername = request.username().trim();
            if (!newUsername.equalsIgnoreCase(profile.getUser().getUsername()) &&
                    userRepository.existsByUsernameIgnoreCase(newUsername)) {
                throw new ConflictException("Username already taken: " + newUsername);
            }
            User user = profile.getUser();
            user.setUsername(newUsername);
            userRepository.save(user);
        }
        userMapper.updateProfile(profile, request);
        return userMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getProfile(userId).getUser();
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            // 400, not 401: the session is valid, only the form input is wrong (401 would log the user out).
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Override
    public PageResponse<UserResponse> findAll(Role role, Boolean active, Pageable pageable) {
        return PageResponse.of(profileRepository.findAll(UserSpecifications.filter(role, active), pageable),
                userMapper::toResponse);
    }

    @Override
    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String username = request.username().trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ConflictException("Username already exists: " + username);
        }
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());

        UserProfile profile = new UserProfile();
        profile.setUser(userRepository.save(user));
        userMapper.updateProfile(profile, new ProfileUpdateRequest(request.fullName(), request.phone(), request.email(), null));
        return userMapper.toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request, Long actorId) {
        UserProfile profile = getProfile(id);
        if (id.equals(actorId) && request.role() != profile.getUser().getRole()) {
            throw new ConflictException("You cannot change your own role");
        }
        User user = profile.getUser();
        user.setRole(request.role());
        userRepository.save(user);
        userMapper.updateProfile(profile, new ProfileUpdateRequest(request.fullName(), request.phone(), request.email(), null));
        return userMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long id, boolean active, Long actorId) {
        UserProfile profile = getProfile(id);
        if (id.equals(actorId) && !active) {
            throw new ConflictException("You cannot deactivate your own account");
        }
        User user = profile.getUser();
        user.setActive(active);
        userRepository.save(user);
        return userMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest request, Long actorId) {
        // Admins route their own password through changePassword (requires current). This path is
        // for issuing a credential to someone else only.
        if (id.equals(actorId)) {
            throw new BadRequestException("Use /me/password to change your own password");
        }
        UserProfile profile = getProfile(id);
        User user = profile.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private UserProfile getProfile(Long userId) {
        return profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }
}
