package at.htlkaindorf.backend.entities;

import at.htlkaindorf.backend.ids.EntryId;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Entry {

    @EmbeddedId
    private EntryId entryId;

    @ManyToOne
    @MapsId("tennisCourtId")
    @JoinColumn(name = "tennis_court_id", nullable = false)
    private TennisCourt tennisCourt;

    @ManyToOne
    @JoinColumn(name = "entryTypeId")
    private EntryType entryType;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;
}
