import { IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateUserDto {
  nickName: string;
  avatar: string;

  @IsNotEmpty({ message: 'Email must be filled' })
  @IsEmail({}, { message: 'It is not a legal email format' })
  email: string;

  @IsNotEmpty({ message: 'Verification code must be filled' })
  captcha: string;
}
