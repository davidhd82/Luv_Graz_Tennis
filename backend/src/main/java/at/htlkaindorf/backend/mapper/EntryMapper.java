package at.htlkaindorf.backend.mapper;

import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.entities.Entry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntryMapper {
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(target = "userName", expression = "java(entry.getUser() != null ? entry.getUser().getFirstName() + \" \" + entry.getUser().getLastName() : \"\")")
    @Mapping(source = "tennisCourt.tennisCourtId", target = "tennisCourtId")
    @Mapping(source = "tennisCourt.name", target = "tennisCourtName")
    @Mapping(source = "entryType.name", target = "entryTypeName")
    @Mapping(source = "entryId.entryDate", target = "entryDate")
    @Mapping(source = "entryId.startHour", target = "startHour")
    EntryDto toDto(Entry entry);
}
