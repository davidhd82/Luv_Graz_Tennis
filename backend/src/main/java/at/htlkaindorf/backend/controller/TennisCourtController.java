package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.entities.TennisCourt;
import at.htlkaindorf.backend.repositories.TennisCourtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tennis-courts")
@RequiredArgsConstructor
public class TennisCourtController {

    private final TennisCourtRepository tennisCourtRepository;

    @GetMapping
    public ResponseEntity<List<TennisCourt>> getAllTennisCourts() {
        List<TennisCourt> courts = tennisCourtRepository.findAll();
        return ResponseEntity.ok(courts);
    }
}
