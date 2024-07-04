import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty({ message: 'Password must be filled' })
  @MinLength(6, { message: 'Password cannot be less than 6 characters' })
  @ApiProperty()
  password: string;

  @IsNotEmpty({ message: 'Email must be filled' })
  @IsEmail({}, { message: 'It is not a legal email format' })
  @ApiProperty()
  email: string;

  @IsNotEmpty({ message: 'Verification code must be filled' })
  @ApiProperty()
  captcha: string;
}
