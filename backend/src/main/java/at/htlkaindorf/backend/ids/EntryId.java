package at.htlkaindorf.backend.ids;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class EntryId implements Serializable {
    private Long tennisCourtId;
    private LocalDate entryDate;
    private Integer startHour;
}
