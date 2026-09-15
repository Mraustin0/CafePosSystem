package com.cafepos.mapper;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.response.AddOnResponse;
import org.springframework.stereotype.Component;

@Component
public class AddOnMapper {

    public AddOn toEntity(AddOnRequest request) {
        AddOn addOn = new AddOn();
        updateEntity(addOn, request);
        return addOn;
    }

    public void updateEntity(AddOn addOn, AddOnRequest request) {
        addOn.setName(request.name().trim());
        addOn.setPrice(request.price());
    }

    public AddOnResponse toResponse(AddOn addOn) {
        return new AddOnResponse(addOn.getId(), addOn.getName(), addOn.getPrice(), addOn.isActive());
    }
}
