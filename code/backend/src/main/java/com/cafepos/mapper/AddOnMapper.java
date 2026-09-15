package com.cafepos.mapper;

import com.cafepos.domain.entity.AddOn;
import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.response.AddOnResponse;
import org.springframework.stereotype.Component;

import java.math.RoundingMode;

@Component
public class AddOnMapper {

    public AddOn toEntity(AddOnRequest request) {
        AddOn addOn = new AddOn();
        updateEntity(addOn, request);
        return addOn;
    }

    public void updateEntity(AddOn addOn, AddOnRequest request) {
        addOn.setName(request.name().trim());
        addOn.setPrice(request.price().setScale(2, RoundingMode.HALF_UP)); // match NUMERIC(10,2) so responses show 70.00, not 70
    }

    public AddOnResponse toResponse(AddOn addOn) {
        return new AddOnResponse(addOn.getId(), addOn.getName(), addOn.getPrice(), addOn.isActive());
    }
}
