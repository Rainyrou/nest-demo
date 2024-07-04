import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Nickname must be filled' })
  @ApiProperty()
  nickName: string;

  @IsNotEmpty({ message: 'Username must be filled' })
  @ApiProperty()
  username: string;

  @IsNotEmpty({ message: 'Password must be filled' })
  @MinLength(6, { message: 'Password cannot be less than 6 characters' })
  @ApiProperty({ minLength: 6 })
  password: string;

  @IsNotEmpty({ message: 'Email must be filled' })
  @IsEmail({}, { message: 'It is not a legal email format' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Verification code must be filled' })
  @ApiProperty()
  captcha: string;
}
