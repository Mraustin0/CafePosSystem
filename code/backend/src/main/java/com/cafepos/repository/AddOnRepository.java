package com.cafepos.repository;

import com.cafepos.domain.entity.AddOn;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddOnRepository extends JpaRepository<AddOn, Long> {

    List<AddOn> findByActive(boolean active, Sort sort);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
