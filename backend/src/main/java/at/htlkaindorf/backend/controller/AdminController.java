package at.htlkaindorf.backend.controller;

import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.dtos.UserDto;
import at.htlkaindorf.backend.services.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/admin-status")
    public ResponseEntity<UserDto> updateAdminStatus(@PathVariable Long id,
                                                     @RequestParam boolean isAdmin) {
        return ResponseEntity.ok(adminService.updateAdminStatus(id, isAdmin));
    }

    @PutMapping("/users/{id}/membership-status")
    public ResponseEntity<UserDto> updateMembershipStatus(@PathVariable Long id,
                                                          @RequestParam boolean membershipPaid) {
        return ResponseEntity.ok(adminService.updateMembershipStatus(id, membershipPaid));
    }

    @GetMapping("/entries")
    public ResponseEntity<List<EntryDto>> getFutureEntries() {
        return ResponseEntity.ok(adminService.getFutureEntries());
    }

    @DeleteMapping("/entries/{courtId}/{date}/{hour}")
    public ResponseEntity<Void> deleteEntryAdmin(@PathVariable Long courtId,
                                                 @PathVariable LocalDate date,
                                                 @PathVariable Integer hour) {
        adminService.deleteEntryAdmin(courtId, date, hour);
        return ResponseEntity.noContent().build();
    }
}
