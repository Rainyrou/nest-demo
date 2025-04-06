import { ApiProperty } from '@nestjs/swagger';

class User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  iphone_number: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  is_frozen: boolean;

  @ApiProperty()
  create_time: Date;
}

export class UserListVo {
  @ApiProperty({ type: [User] })
  users: User[];

  @ApiProperty()
  total_count: number;
}
