package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.CreateEntryRequest;
import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.services.EntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/entries")
@RequiredArgsConstructor
public class EntryController {

    private final EntryService entryService;

    @GetMapping("/{date}")
    public ResponseEntity<List<EntryDto>> getEntriesByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(entryService.getEntriesByDate(date));
    }

    @PostMapping
    public ResponseEntity<EntryDto> createEntry(@RequestBody CreateEntryRequest request) {
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
