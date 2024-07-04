import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserInfoVo } from './vo/user-info.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/udpate-user.dto';
import { generateParseIntPipe } from 'src/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RefreshTokenVo } from './vo/refresh-token.vo';

@ApiTags('user management module')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Verification code is expired or incorrect/User has existed',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Register success or fail',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @ApiQuery({
    name: 'address',
    type: String,
    description: 'email',
    required: true,
    example: 'Rainyrou@gmail.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Send success',
    type: String,
  })
  @Get('register-captcha')
  async captcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);
    await this.emailService.sendMail({
      to: address,
      subject: 'register code',
      html: `<p>your register code is ${code}</p>`,
    });
    return 'Send success';
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return 'Done';
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User does not exist/Password is incorrect',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information with token',
    type: LoginUserDto,
  })
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );
    return vo;
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User does not exist/Password is incorrect',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information with token',
    type: LoginUserDto,
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);
    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
      },
      {
        expiresIn:
          this.configService.get('jwt_access_token_expires_time') || '30m',
      },
    );
    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );
    return vo;
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: 'Refresh token',
    required: true,
    example: 'abcdef',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The token is invalid, please login again',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refresh success',
    type: RefreshTokenVo,
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, false);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      const refreshTokenVo = new RefreshTokenVo();
      refreshTokenVo.access_token = access_token;
      refreshTokenVo.refresh_token = refresh_token;
      return refreshTokenVo;
    } catch (err) {
      throw new UnauthorizedException(
        'The token has expired, please login again',
      );
    }
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: 'Refresh token',
    required: true,
    example: 'abcdef',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'The token is invalid, please login again',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refresh success',
    type: RefreshTokenVo,
  })
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    try {
      const data = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(data.userId, false);
      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );
      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );
      const refreshTokenVo = new RefreshTokenVo();
      refreshTokenVo.access_token = access_token;
      refreshTokenVo.refresh_token = refresh_token;
      return refreshTokenVo;
    } catch (err) {
      throw new UnauthorizedException(
        'The token has expired, please login again',
      );
    }
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Success',
    type: UserInfoVo,
  })
  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);
    const vo = new UserInfoVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nickName;
    vo.email = user.email;
    vo.iphoneNumber = user.iphoneNumber;
    vo.avatar = user.avatar;
    vo.createTime = user.createTime;
    vo.isFrozen = user.isFrozen;
    return vo;
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiResponse({
    type: String,
    description: 'Verification code is expired or incorrect',
  })
  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() passwordDto: UpdateUserPasswordDto,
  ) {
    return this.userService.updatePassword(userId, passwordDto);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'address',
    description: 'email',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: 'Send success',
  })
  @Get('update_password/captcha')
  @RequireLogin()
  async updatePasswordCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);
    await this.redisService.set(
      `update_password_captcha_${address}`,
      code,
      10 * 60,
    );
    await this.emailService.sendMail({
      to: address,
      subject: 'Change password verification code',
      html: `<p>Your password change verification code is: ${code}</p>"`,
    });
    return 'Send success';
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Verification code is expired or incorrect',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update success',
    type: String,
  })
  @Post(['update', 'admin/update'])
  @RequireLogin()
  async update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'address',
    description: 'email',
    type: String,
  })
  @ApiResponse({
    type: String,
    description: 'Send success',
  })
  @RequireLogin()
  @Get('update/captcha')
  async updateCaptcha(@Query('address') address: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(
      `update_user_captcha_${address}`,
      code,
      10 * 60,
    );

    await this.emailService.sendMail({
      to: address,
      subject: 'Change userInfo verification code',
      html: `<p>Your userInfo change verification code is: ${code}</p>"`,
    });
    return 'Send success';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'Freeze success',
  })
  @RequireLogin()
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'Success';
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'currentPage',
    description: 'currentPage',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'pageSize',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: 'username',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'nickName',
    description: 'nickName',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'email',
    description: 'email',
    type: String,
    required: false,
  })
  @ApiResponse({
    type: String,
    description: 'User list',
  })
  @Get('list')
  @RequireLogin()
  async list(
    @Query(
      'currentPage',
      new DefaultValuePipe(1),
      generateParseIntPipe('currentPage'),
    )
    currentPage: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(5),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username')
    username: string,
    @Query('nickName')
    nickName: string,
    @Query('email')
    email: string,
  ) {
    return await this.userService.findUserByPage(
      currentPage,
      pageSize,
      username,
      nickName,
      email,
    );
  }
}
