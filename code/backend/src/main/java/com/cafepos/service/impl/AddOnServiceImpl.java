package com.cafepos.service.impl;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.response.AddOnResponse;
import com.cafepos.exception.ConflictException;
import com.cafepos.exception.ResourceNotFoundException;
import com.cafepos.mapper.AddOnMapper;
import com.cafepos.repository.AddOnRepository;
import com.cafepos.service.AddOnService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AddOnServiceImpl implements AddOnService {

    private static final Sort BY_NAME = Sort.by("name");

    private final AddOnRepository addOnRepository;
    private final AddOnMapper addOnMapper;

    public AddOnServiceImpl(AddOnRepository addOnRepository, AddOnMapper addOnMapper) {
        this.addOnRepository = addOnRepository;
        this.addOnMapper = addOnMapper;
    }

    @Override
    public List<AddOnResponse> findAll(Boolean active) {
        List<AddOn> addOns = active == null
                ? addOnRepository.findAll(BY_NAME)
                : addOnRepository.findByActive(active, BY_NAME);
        return addOns.stream().map(addOnMapper::toResponse).toList();
    }

    @Override
    public AddOnResponse findById(Long id) {
        return addOnMapper.toResponse(getAddOn(id));
    }

    @Override
    @Transactional
    public AddOnResponse create(AddOnRequest request) {
        if (addOnRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new ConflictException("Add-on name already exists: " + request.name());
        }
        return addOnMapper.toResponse(addOnRepository.save(addOnMapper.toEntity(request)));
    }

    @Override
    @Transactional
    public AddOnResponse update(Long id, AddOnRequest request) {
        AddOn addOn = getAddOn(id);
        if (addOnRepository.existsByNameIgnoreCaseAndIdNot(request.name().trim(), id)) {
            throw new ConflictException("Add-on name already exists: " + request.name());
        }
        addOnMapper.updateEntity(addOn, request);
        return addOnMapper.toResponse(addOn);
    }

    @Override
    @Transactional
    public AddOnResponse updateStatus(Long id, boolean active) {
        AddOn addOn = getAddOn(id);
        addOn.setActive(active);
        return addOnMapper.toResponse(addOn);
    }

    private AddOn getAddOn(Long id) {
        return addOnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Add-on", id));
    }
}
