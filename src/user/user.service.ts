import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';

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
    user1.nickName = 'Rainyrou';
    user1.username = 'Rainyrou';
    user1.password = md5('2333333');
    user1.email = 'Rainyrou@gamil.com';
    user1.iponeNumber = '13233323333';
    user1.isAdmin = true;

    const user2 = new User();
    user2.username = 'Clown';
    user2.nickName = 'Clown';
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
    newUser.nickName = user.nickName;
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

  async login(loginUserDto: LoginUserDto, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        username: loginUserDto.username,
        isAdmin,
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
      nickName: user.nickName,
      email: user.email,
      iponeNumber: user.iponeNumber,
      avatar: user.avatar,
      createTime: user.createTime,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
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

  async findUserById(userId: number, isAdmin: boolean) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        isAdmin,
      },
      relations: ['roles', 'roles.permissions'],
    });
    return {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
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
}
