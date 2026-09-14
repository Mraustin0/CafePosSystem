package com.cafepos.controller.api;

import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.request.StatusUpdateRequest;
import com.cafepos.dto.response.AddOnResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.cafepos.common.NotImplementedYet.error;

/** F-20 – F-23 */
@RestController
@RequestMapping("/api/v1/add-ons")
public class AddOnController {

    @GetMapping
    public List<AddOnResponse> findAll(@RequestParam(required = false) Boolean active) {
        throw error();
    }

    @GetMapping("/{id}")
    public AddOnResponse findById(@PathVariable Long id) {
        throw error();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddOnResponse create(@Valid @RequestBody AddOnRequest request) {
        throw error();
    }

    @PutMapping("/{id}")
    public AddOnResponse update(@PathVariable Long id, @Valid @RequestBody AddOnRequest request) {
        throw error();
    }

    @PatchMapping("/{id}/status")
    public AddOnResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        throw error();
    }
}
