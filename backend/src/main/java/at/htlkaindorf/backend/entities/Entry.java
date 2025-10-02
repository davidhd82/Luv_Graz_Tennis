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
@IdClass(EntryId.class)
public class Entry {

    @Id
    private LocalDate entryDate;

    @Id
    private Integer startHour;

    @Id
    private Long tennisCourtId;

    @ManyToOne
    @JoinColumn(name = "tennisCourtId")
    private TennisCourt tennisCourt;

    @ManyToOne
    @JoinColumn(name = "entryTypeId")
    private EntryType entryType;

    @ManyToOne
    @JoinColumn(name = "userId")
    private User user;
}
