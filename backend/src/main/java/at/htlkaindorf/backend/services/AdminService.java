package at.htlkaindorf.backend.services;

import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.dtos.UserDto;
import at.htlkaindorf.backend.entities.Entry;
import at.htlkaindorf.backend.ids.EntryId;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.mapper.EntryMapper;
import at.htlkaindorf.backend.mapper.UserMapper;
import at.htlkaindorf.backend.repositories.EntryRepository;
import at.htlkaindorf.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final EntryRepository entryRepository;
    private final EntryMapper entryMapper;

    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserDTO)
                .collect(Collectors.toList());
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        if (user.isAdmin()) throw new RuntimeException("Cannot delete admin user");
        userRepository.delete(user);
    }

    public UserDto updateAdminStatus(Long id, boolean isAdmin) {
        User user = userRepository.findById(id).orElseThrow();
        user.setAdmin(isAdmin);
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public UserDto updateMembershipStatus(Long id, boolean membershipPaid) {
        User user = userRepository.findById(id).orElseThrow();
        user.setMembershipPaid(membershipPaid);
        return userMapper.toUserDTO(userRepository.save(user));
    }

    public List<EntryDto> getFutureEntries() {
        LocalDate today = LocalDate.now();
        int hour = LocalTime.now().getHour();

        List<Entry> future = new ArrayList<>();

        future.addAll(entryRepository.findAllByEntryId_EntryDateAfter(today));

        entryRepository.findAllByEntryId_EntryDate(today)
                .stream()
                .filter(e -> e.getEntryId().getStartHour() >= hour)
                .forEach(future::add);

        return future.stream()
                .map(entryMapper::toDto)
                .collect(Collectors.toList());
    }

    public void deleteEntryAdmin(Long courtId, LocalDate date, Integer hour) {
        entryRepository.deleteById(new EntryId(courtId, date, hour));
    }

    public UserDto updateMaxDailyBookingHours(Long id, int hours) {
        User user = userRepository.findById(id).orElseThrow();
        if (hours < 0) {
            throw new RuntimeException("Hours must be >= 0");
        }
        user.setMaxDailyBookingHours(hours);
        return userMapper.toUserDTO(userRepository.save(user));
    }

}
