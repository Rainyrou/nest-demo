import { ApiProperty } from '@nestjs/swagger';

class UserInfo {
  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  iphone_number: string;

  @ApiProperty()
  is_frozen: boolean;

  @ApiProperty()
  is_admin: boolean;

  @ApiProperty()
  create_time: Date;

  @ApiProperty()
  roles: string[];

  @ApiProperty()
  permissions: string[];
}

export class LoginUserVo {
  @ApiProperty()
  userInfo: UserInfo;

  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
