
export interface UserDto {
  id?: string;
  username?: string;
  password?: string;
  email?: string;
  scope?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthenticationDto {
  authorization: string;
}

export type UserWithAuthenticationDto = UserDto & AuthenticationDto;

export interface RegisterUserDto {
  username?: string;
  password?: string;
  passwordConfirm?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
