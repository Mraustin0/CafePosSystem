package com.cafepos.repository;

import com.cafepos.domain.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

/**
 * Users are read through their profile: UserProfile owns the one-to-one (shared primary key),
 * so "profile join user" is a single query, while loading profiles from User would be one query per user.
 */
public interface UserProfileRepository extends JpaRepository<UserProfile, Long>, JpaSpecificationExecutor<UserProfile> {

    @Override
    @EntityGraph(attributePaths = "user")
    Page<UserProfile> findAll(Specification<UserProfile> spec, Pageable pageable);

    /** id = user id (shared primary key). */
    @Override
    @EntityGraph(attributePaths = "user")
    Optional<UserProfile> findById(Long userId);
}
