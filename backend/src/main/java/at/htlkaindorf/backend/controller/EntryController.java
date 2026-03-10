package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.CreateEntryRequest;
import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.services.EntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entries")
@RequiredArgsConstructor
public class EntryController {

    private final EntryService entryService;

    @GetMapping("/date/{date}")
    public ResponseEntity<Map<Long, List<EntryDto>>> getEntriesByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(entryService.getEntriesByDate(date));
    }

    @GetMapping("/{courtId}/{date}")
    public ResponseEntity<List<EntryDto>> getEntriesByDateAndCourt(
            @PathVariable Long courtId,
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(entryService.getEntriesByDateAndCourt(date, courtId));
    }

    @PostMapping
    public ResponseEntity<List<EntryDto>> createEntry(@RequestBody CreateEntryRequest request) {
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
