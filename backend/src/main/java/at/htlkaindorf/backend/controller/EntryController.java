package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.CreateEntryRequest;
import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.services.EntryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/entries")
@RequiredArgsConstructor
@Slf4j
public class EntryController {

    private final EntryService entryService;

    @GetMapping("/{courtId}/{date}")
    public ResponseEntity<List<EntryDto>> getEntriesByDateAndCourt(
            @PathVariable Long courtId,
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(entryService.getEntriesByDateAndCourt(date, courtId));
    }

    @PostMapping
    public ResponseEntity<EntryDto> createEntry(@RequestBody CreateEntryRequest request) {
        log.info(request.toString());
        return ResponseEntity.ok(entryService.createEntry(request));
    }

    @DeleteMapping("/{courtId}/{date}/{hour}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long courtId,
            @PathVariable LocalDate date,
            @PathVariable Integer hour) {
        entryService.deleteEntry(date, hour, courtId);
        return ResponseEntity.noContent().build();
    }
}
