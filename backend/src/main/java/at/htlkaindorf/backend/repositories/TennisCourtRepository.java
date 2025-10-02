package at.htlkaindorf.backend.repositories;

import at.htlkaindorf.backend.entities.TennisCourt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TennisCourtRepository extends JpaRepository<TennisCourt, Long> {
}
