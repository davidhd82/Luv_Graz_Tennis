package at.htlkaindorf.backend.repositories;

import at.htlkaindorf.backend.entities.Entry;
import at.htlkaindorf.backend.ids.EntryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EntryRepository extends JpaRepository<Entry, EntryId> {

    List<Entry> findAllByEntryId_EntryDateAndTennisCourt_TennisCourtId(LocalDate entryDate, Long tennisCourtId);

}
