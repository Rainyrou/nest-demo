import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { UserListVo } from './vo/user-list.vo';

@Injectable()
export class UserService {
  private logger = new Logger();

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private redisService: RedisService;

  async initData() {
    const user1 = new User();
    user1.nickname = 'Rainyrou';
    user1.username = 'Rainyrou';
    user1.password = md5('2333333');
    user1.email = 'Rainyrou@gamil.com';
    user1.iphone_number = '13233323333';
    user1.is_admin = true;

    const user2 = new User();
    user2.username = 'Clown';
    user2.nickname = 'Clown';
    user2.password = md5('6666666');
    user2.email = 'Clown@qq.com';

    const role1 = new Role();
    role1.name = 'Administrator';
    const role2 = new Role();
    role2.name = 'General';

    user1.roles = [role1];
    user2.roles = [role2];

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = 'Access ccc interface';
    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = 'Access ddd interface';

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.userRepository.save([user1, user2]);
    await this.roleRepository.save([role1, role2]);
    await this.permissionRepository.save([permission1, permission2]);
  }

  async register(user: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha_${user.email}`);
    if (!captcha)
      throw new HttpException(
        'Verification code has expired',
        HttpStatus.BAD_REQUEST,
      );
    if (user.captcha !== captcha)
      throw new HttpException(
        'Verification code is incorrect',
        HttpStatus.BAD_REQUEST,
      );

    const userHasFound = await this.userRepository.findOneBy({
      username: user.username,
    });
    if (userHasFound)
      throw new HttpException('User has existed', HttpStatus.BAD_REQUEST);

    const newUser = new User();
    newUser.nickname = user.nickname;
    newUser.username = user.username;
    newUser.password = md5(user.password);
    newUser.email = user.email;

    try {
      await this.userRepository.save(newUser);
      return 'Register success';
    } catch (err) {
      this.logger.error(err, UserService);
      return 'Register fail';
    }
  }

  async login(loginUserDto: LoginUserDto, is_admin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        is_admin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user)
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    if (user.password !== md5(loginUserDto.password))
      throw new HttpException('Password is uncorrect', HttpStatus.BAD_REQUEST);

    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      iphone_number: user.iphone_number,
      avatar: user.avatar,
      create_time: user.create_time,
      is_frozen: user.is_frozen,
      is_admin: user.is_admin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          const found = arr.find((p) => p.code === permission.code);
          if (!found) arr.push(permission);
        });
        return arr;
      }, []),
    };
    return vo;
  }

  async findUserById(userId: number, is_admin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        is_admin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    return {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
      roles: user.roles.map((item) => item.name),
      permissions: user.roles.reduce((arr, item) => {
        item.permissions.forEach((permission) => {
          const found = arr.find((p) => p.code === permission.code);
          if (!found) arr.push(permission);
        });
        return arr;
      }, []),
    };
  }

  async findUserDetailById(userId: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    return user;
  }

  async updatePassword(
    userId: number,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const captcha = await this.redisService.get(
      `update_password_captcha_${updateUserPasswordDto.email}`,
    );
    if (!captcha)
      throw new HttpException(
        'Verification code has expired',
        HttpStatus.BAD_REQUEST,
      );
    if (updateUserPasswordDto.captcha !== captcha)
      throw new HttpException(
        'Verification code is incorrect',
        HttpStatus.BAD_REQUEST,
      );

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });
    foundUser.password = md5(updateUserPasswordDto.password);
    try {
      await this.userRepository.save(foundUser);
      return 'Password change success';
    } catch (err) {
      this.logger.error(err, UserService);
      return 'Password change fail';
    }
  }

  async update(userId: number, updateUserDto: UpdateUserDto) {
    const captcha = await this.redisService.get(
      `update_user_captcha_${updateUserDto.email}`,
    );
    if (!captcha)
      throw new HttpException(
        'Verification code has expired',
        HttpStatus.BAD_REQUEST,
      );
    if (updateUserDto.captcha !== captcha)
      throw new HttpException(
        'Verification code is incorrect',
        HttpStatus.BAD_REQUEST,
      );

    const foundUser = await this.userRepository.findOneBy({
      id: userId,
    });
    if (updateUserDto.nickname) foundUser.nickname = updateUserDto.nickname;
    if (updateUserDto.avatar) foundUser.avatar = updateUserDto.avatar;
    try {
      await this.userRepository.save(foundUser);
      return 'UserInfo change success';
    } catch (err) {
      this.logger.error(err, UserService);
      return 'UserInfo change fail';
    }
  }

  async freezeUserById(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
    });
    user.is_frozen = true;
    await this.userRepository.save(user);
  }

  async findUserByPage(
    currentPage: number,
    pageSize: number,
    username: string,
    nickname: string,
    email: string,
  ) {
    const skip = (currentPage - 1) * pageSize;
    const condition: Record<string, any> = {};
    if (username) condition.username = Like(`%${username}%`);
    if (nickname) condition.nickname = Like(`%${nickname}%`);
    if (email) condition.email = Like(`%${email}%`);
    const [users, totalCount] = await this.userRepository.findAndCount({
      select: [
        'id',
        'username',
        'password',
        'nickname',
        'avatar',
        'email',
        'iphone_number',
        'is_frozen',
        'create_time',
      ],
      skip: skip,
      take: pageSize,
      where: condition,
    });
    const userListVo = new UserListVo();
    userListVo.users = users;
    userListVo.total_count = totalCount;
    return userListVo;
  }
}
