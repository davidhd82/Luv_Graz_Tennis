package at.htlkaindorf.backend.repositories;

import at.htlkaindorf.backend.entities.Entry;
import at.htlkaindorf.backend.ids.EntryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface EntryRepository extends JpaRepository<Entry, EntryId> {

    long countByUser_UserIdAndEntryId_EntryDate(Long userId, LocalDate entryDate);

    java.util.List<Entry> findAllByEntryId_EntryDateAfter(LocalDate date);

    java.util.List<Entry> findAllByEntryId_EntryDate(LocalDate date);

    java.util.List<Entry> findAllByEntryId_EntryDateAndTennisCourt_TennisCourtId(LocalDate entryDate, Long courtId);
}
