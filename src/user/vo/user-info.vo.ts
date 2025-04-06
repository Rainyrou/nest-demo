import { ApiProperty } from '@nestjs/swagger';

export class UserInfoVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  iphone_number: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  create_time: Date;

  @ApiProperty()
  is_frozen: boolean;
}
