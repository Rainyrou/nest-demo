import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Nickname must be filled' })
  nickName: string;

  @IsNotEmpty({ message: 'Username must be filled' })
  username: string;

  @IsNotEmpty({ message: 'Password must be filled' })
  @MinLength(6, { message: 'Password cannot be less than 6 characters' })
  password: string;

  @IsNotEmpty({ message: 'Email must be filled' })
  @IsEmail({}, { message: 'It is not a legal email format' })
  email: string;

  @IsNotEmpty({ message: 'Verification code must be filled' })
  captcha: string;
}
