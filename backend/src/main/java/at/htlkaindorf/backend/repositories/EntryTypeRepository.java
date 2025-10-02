package at.htlkaindorf.backend.repositories;

import at.htlkaindorf.backend.entities.EntryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntryTypeRepository extends JpaRepository<EntryType, Long> {
}
