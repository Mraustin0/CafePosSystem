package com.cafepos.mapper;

import com.cafepos.domain.entity.User;
import com.cafepos.domain.entity.UserProfile;
import com.cafepos.dto.request.ProfileUpdateRequest;
import com.cafepos.dto.response.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public void updateProfile(UserProfile profile, ProfileUpdateRequest request) {
        profile.setFullName(request.fullName().trim());
        profile.setPhone(blankToNull(request.phone()));
        profile.setEmail(blankToNull(request.email()));
    }

    public UserResponse toResponse(UserProfile profile) {
        User user = profile.getUser();
        return new UserResponse(user.getId(), user.getUsername(), user.getRole(), user.isActive(),
                profile.getFullName(), profile.getPhone(), profile.getEmail(), user.getCreatedAt());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
