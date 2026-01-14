package at.htlkaindorf.backend.dtos;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EntryDto {
    private LocalDate entryDate;
    private Integer startHour;
    private Long tennisCourtId;
    private String tennisCourtName;
    private String entryTypeName;
    private String userEmail;
    private String userName;
}
