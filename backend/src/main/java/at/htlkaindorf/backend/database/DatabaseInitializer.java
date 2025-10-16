package at.htlkaindorf.backend.database;

import at.htlkaindorf.backend.entities.EntryType;
import at.htlkaindorf.backend.entities.TennisCourt;
import at.htlkaindorf.backend.repositories.EntryTypeRepository;
import at.htlkaindorf.backend.repositories.TennisCourtRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer {

    private final TennisCourtRepository tennisCourtRepository;
    private final EntryTypeRepository entryTypeRepository;

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
        }
    }
}
