package at.htlkaindorf.backend.mapper;

import at.htlkaindorf.backend.dtos.EntryDto;
import at.htlkaindorf.backend.entities.Entry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntryMapper {
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(target = "userName", expression = "java(entry.getUser() != null ? entry.getUser().getFirstName() + \" \" + entry.getUser().getLastName() : \"\")")
    @Mapping(source = "user.firstName", target = "userFirstName") // NEU
    @Mapping(source = "user.lastName", target = "userLastName")   // NEU
    @Mapping(target = "userInitials", expression = "java(getUserInitials(entry.getUser()))") // NEU
    @Mapping(source = "tennisCourt.tennisCourtId", target = "tennisCourtId")
    @Mapping(source = "tennisCourt.name", target = "tennisCourtName")
    @Mapping(source = "entryType.name", target = "entryTypeName")
    @Mapping(source = "entryId.entryDate", target = "entryDate")
    @Mapping(source = "entryId.startHour", target = "startHour")
    EntryDto toDto(Entry entry);

    default String getUserInitials(at.htlkaindorf.backend.entities.User user) {
        if (user == null) {
            return "";
        }

        String firstName = user.getFirstName();
        String lastName = user.getLastName();

        if (firstName != null && lastName != null &&
                !firstName.isEmpty() && !lastName.isEmpty()) {
            return (firstName.charAt(0) + String.valueOf(lastName.charAt(0))).toUpperCase();
        } else if (firstName != null && !firstName.isEmpty()) {
            return firstName.substring(0, 1).toUpperCase();
        } else if (lastName != null && !lastName.isEmpty()) {
            return lastName.substring(0, 1).toUpperCase();
        } else {
            String email = user.getEmail();
            if (email != null && !email.isEmpty()) {
                return email.substring(0, Math.min(2, email.length())).toUpperCase();
            }
            return "??";
        }
    }
}