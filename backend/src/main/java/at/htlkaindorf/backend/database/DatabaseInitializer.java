package at.htlkaindorf.backend.database;

import at.htlkaindorf.backend.entities.EntryType;
import at.htlkaindorf.backend.entities.TennisCourt;
import at.htlkaindorf.backend.entities.User;
import at.htlkaindorf.backend.repositories.EntryTypeRepository;
import at.htlkaindorf.backend.repositories.TennisCourtRepository;
import at.htlkaindorf.backend.repositories.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final TennisCourtRepository tennisCourtRepository;
    private final EntryTypeRepository entryTypeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initDatabase() {
        if (tennisCourtRepository.count() == 0 && entryTypeRepository.count() == 0) {

            for (int i = 1; i <= 5; i++) {
                TennisCourt court = new TennisCourt();
                court.setName("Tennisplatz " + i);
                tennisCourtRepository.save(court);
            }

            String[] entryTypeNames = {"Buchung", "Kurs", "Turnier", "Gesperrt"};
            for (String typeName : entryTypeNames) {
                EntryType type = new EntryType();
                type.setName(typeName);
                entryTypeRepository.save(type);
            }

            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("clemens.muenzer@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPostalCode("0000");
            admin.setCity("System");
            admin.setStreet("Systemstraße 1");
            admin.setMobile("0000000000");
            admin.setSalutation("Herr");
            admin.setTitle("");
            admin.setEnabled(true);
            admin.setAdmin(true);
            admin.setMembershipPaid(true);

            userRepository.save(admin);
        }
    }
}
