import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'Username must be filled' })
  @ApiProperty()
  username: string;

  @IsNotEmpty({ message: 'Password must be filled' })
  @MinLength(6, { message: 'Password cannot be less than 6 characters' })
  @ApiProperty()
  password: string;
}
