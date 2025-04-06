import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  nickname: string;

  @ApiProperty()
  avatar: string;

  @IsNotEmpty({ message: 'Email must be filled' })
  @IsEmail({}, { message: 'It is not a legal email format' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Verification code must be filled' })
  @ApiProperty()
  captcha: string;
}
