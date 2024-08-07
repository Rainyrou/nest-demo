import { ApiProperty } from '@nestjs/swagger';

export class UserInfoVo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  iphoneNumber: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  createTime: Date;

  @ApiProperty()
  isFrozen: boolean;
}
