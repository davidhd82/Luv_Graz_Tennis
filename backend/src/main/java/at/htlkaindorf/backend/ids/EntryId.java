package at.htlkaindorf.backend.ids;

import java.io.Serializable;
import java.time.LocalDate;
import lombok.Data;

@Data
public class EntryId implements Serializable {
    private Long tennisCourtId;
    private LocalDate entryDate;
    private Integer startHour;
}
