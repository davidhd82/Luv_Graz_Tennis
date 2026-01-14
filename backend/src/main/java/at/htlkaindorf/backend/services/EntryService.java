package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.dtos.CreateEntryRequest;
import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.entities.Entry;
import at.htlkaindorf.backend.entities.EntryType;
import at.htlkaindorf.backend.entities.TennisCourt;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.ids.EntryId;
import at.htlkaindorf.backend.mapper.EntryMapper;
import at.htlkaindorf.backend.repositories.EntryRepository;
import at.htlkaindorf.backend.repositories.EntryTypeRepository;
import at.htlkaindorf.backend.repositories.TennisCourtRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EntryService {
    private final EntryRepository entryRepository;
    private final EntryTypeRepository entryTypeRepository;
    private final TennisCourtRepository tennisCourtRepository;
    private final UserService userService;
    private final EntryMapper entryMapper;

    public List<EntryDto> getEntriesByDateAndCourt(LocalDate date, Long courtId) {
        return entryRepository.findAllByEntryId_EntryDateAndTennisCourt_TennisCourtId(date, courtId)
                .stream()
                .map(entryMapper::toDto)
                .collect(Collectors.toList());
    }

    public EntryDto createEntry(CreateEntryRequest request) {
        User user = userService.getCurrentUserEntity();
        TennisCourt court = tennisCourtRepository.findById(request.getTennisCourtId())
                .orElseThrow(() -> new RuntimeException("Tennis court not found"));
        EntryType entryType = entryTypeRepository.findById(request.getEntryTypeId())
                .orElseThrow(() -> new RuntimeException("Entry type not found"));

        EntryId id = new EntryId(request.getTennisCourtId(), request.getEntryDate(), request.getStartHour());

        if (entryRepository.existsById(id)) {
            throw new RuntimeException("This time slot is already booked!");
        }

        long bookedCount = entryRepository.countByUser_UserIdAndEntryId_EntryDate(
                user.getUserId(), request.getEntryDate());
        if (!user.isAdmin() && bookedCount >= user.getMaxDailyBookingHours()) {
            return null;
        }

        Entry entry = new Entry();
        entry.setEntryId(id);
        entry.setTennisCourt(court);
        entry.setEntryType(entryType);
        entry.setUser(user);

        Entry saved = entryRepository.save(entry);
        return entryMapper.toDto(saved);
    }

    public void deleteEntry(LocalDate date, Integer hour, Long courtId) {
        EntryId id = new EntryId(courtId, date, hour);
        Entry entry = entryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));

        User currentUser = userService.getCurrentUserEntity();

        if (!entry.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("You can only delete your own bookings!");
        }

        entryRepository.delete(entry);
    }
}
