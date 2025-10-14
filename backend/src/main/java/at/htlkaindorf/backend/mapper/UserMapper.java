package at.htlkaindorf.backend.mapper;

import at.htlkaindorf.backend.dtos.AuthResponseDto;
import at.htlkaindorf.backend.dtos.UserDto;
import at.htlkaindorf.backend.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto toUserDTO(User user);

    AuthResponseDto toAuthDTO(User user);

    User toUserEntity(UserDto userDto);
}
