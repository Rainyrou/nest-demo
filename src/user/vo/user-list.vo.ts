import { ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nickName: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  iphoneNumber: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  isFrozen: boolean;

  @ApiProperty()
  createTime: Date;
}

export class UserListVo {
  @ApiProperty({ type: [User] })
  users: User[];

  @ApiProperty()
  totalCount: number;
}
