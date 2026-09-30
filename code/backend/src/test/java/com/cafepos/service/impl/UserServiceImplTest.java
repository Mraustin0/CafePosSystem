package com.cafepos.service.impl;

import com.cafepos.domain.entity.User;
import com.cafepos.domain.entity.UserProfile;
import com.cafepos.domain.enums.Role;
import com.cafepos.dto.request.ChangePasswordRequest;
import com.cafepos.dto.request.CreateUserRequest;
import com.cafepos.dto.request.UpdateUserRequest;
import com.cafepos.exception.ConflictException;
import com.cafepos.mapper.UserMapper;
import com.cafepos.repository.UserProfileRepository;
import com.cafepos.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserProfileRepository profileRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4); // low cost: fast tests
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository, profileRepository, new UserMapper(), passwordEncoder);
    }

    @Test
    void create_hashesPassword_andSavesProfile() {
        when(userRepository.existsByUsernameIgnoreCase("bob")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(profileRepository.save(any(UserProfile.class))).thenAnswer(inv -> inv.getArgument(0));

        userService.create(new CreateUserRequest(" bob ", "secret123", Role.CASHIER, "Bob", " ", null));

        ArgumentCaptor<User> user = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(user.capture());
        assertThat(user.getValue().getUsername()).isEqualTo("bob");
        assertThat(user.getValue().getPasswordHash()).isNotEqualTo("secret123");
        assertThat(passwordEncoder.matches("secret123", user.getValue().getPasswordHash())).isTrue();
    }

    @Test
    void create_throwsConflict_whenUsernameTaken() {
        when(userRepository.existsByUsernameIgnoreCase("admin")).thenReturn(true);

        assertThatThrownBy(() -> userService.create(new CreateUserRequest("admin", "secret123", Role.ADMIN, "X", null, null)))
                .isInstanceOf(ConflictException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void update_blocksChangingOwnRole() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile(1L, Role.ADMIN, "x")));

        assertThatThrownBy(() -> userService.update(1L, new UpdateUserRequest(Role.CASHIER, "Me", null, null), 1L))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void update_allowsChangingOtherUsersRole() {
        when(profileRepository.findById(2L)).thenReturn(Optional.of(profile(2L, Role.CASHIER, "x")));

        assertThat(userService.update(2L, new UpdateUserRequest(Role.ADMIN, "Promoted", null, null), 1L).role())
                .isEqualTo(Role.ADMIN);
    }

    @Test
    void updateStatus_blocksDeactivatingSelf() {
        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile(1L, Role.ADMIN, "x")));

        assertThatThrownBy(() -> userService.updateStatus(1L, false, 1L)).isInstanceOf(ConflictException.class);
    }

    @Test
    void changePassword_rejectsWrongCurrentPassword() {
        when(profileRepository.findById(2L)).thenReturn(Optional.of(profile(2L, Role.CASHIER, passwordEncoder.encode("old-pass1"))));

        assertThatThrownBy(() -> userService.changePassword(2L, new ChangePasswordRequest("wrong", "new-pass1")))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void changePassword_storesNewHash() {
        UserProfile profile = profile(2L, Role.CASHIER, passwordEncoder.encode("old-pass1"));
        when(profileRepository.findById(2L)).thenReturn(Optional.of(profile));

        userService.changePassword(2L, new ChangePasswordRequest("old-pass1", "new-pass1"));

        assertThat(passwordEncoder.matches("new-pass1", profile.getUser().getPasswordHash())).isTrue();
    }

    private static UserProfile profile(Long id, Role role, String passwordHash) {
        User user = new User();
        user.setId(id);
        user.setUsername("user" + id);
        user.setRole(role);
        user.setPasswordHash(passwordHash);
        UserProfile profile = new UserProfile();
        profile.setId(id);
        profile.setUser(user);
        profile.setFullName("User " + id);
        return profile;
    }
}
