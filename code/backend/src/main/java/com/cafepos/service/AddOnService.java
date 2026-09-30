package com.cafepos.service;

import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.response.AddOnResponse;

import java.util.List;

public interface AddOnService {

    /** active = null returns all add-ons. */
    List<AddOnResponse> findAll(Boolean active);

    AddOnResponse findById(Long id);

    AddOnResponse create(AddOnRequest request);

    AddOnResponse update(Long id, AddOnRequest request);

    AddOnResponse updateStatus(Long id, boolean active);
}
