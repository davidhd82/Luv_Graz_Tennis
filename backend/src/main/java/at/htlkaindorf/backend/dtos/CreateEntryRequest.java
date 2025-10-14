package at.htlkaindorf.backend.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateEntryRequest {
    private LocalDate entryDate;
    private Integer startHour;
    private Long tennisCourtId;
    private Long entryTypeId;
}
