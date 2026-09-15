package com.cafepos.controller.api;

import com.cafepos.dto.request.AddOnRequest;
import com.cafepos.dto.request.StatusUpdateRequest;
import com.cafepos.dto.response.AddOnResponse;
import com.cafepos.service.AddOnService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/** F-20 – F-23 */
@RestController
@RequestMapping("/api/v1/add-ons")
public class AddOnController {

    private final AddOnService addOnService;

    public AddOnController(AddOnService addOnService) {
        this.addOnService = addOnService;
    }

    @GetMapping
    public List<AddOnResponse> findAll(@RequestParam(required = false) Boolean active) {
        return addOnService.findAll(active);
    }

    @GetMapping("/{id}")
    public AddOnResponse findById(@PathVariable Long id) {
        return addOnService.findById(id);
    }

    @PostMapping
    public ResponseEntity<AddOnResponse> create(@Valid @RequestBody AddOnRequest request) {
        AddOnResponse created = addOnService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(created.id()).toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public AddOnResponse update(@PathVariable Long id, @Valid @RequestBody AddOnRequest request) {
        return addOnService.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public AddOnResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return addOnService.updateStatus(id, request.active());
    }
}
