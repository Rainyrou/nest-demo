import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest<Request>();
    if (!request.user) return true;
    const permissions = request.user.permissions;
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'require-permission',
      [context.getClass(), context.getHandler()],
    );
    if (!requiredPermissions) return true;
    for (let i = 0; i < requiredPermissions.length; ++i) {
      const hasFound = permissions.find(
        (item) => item.code === requiredPermissions[i],
      );
      if (!hasFound)
        throw new UnauthorizedException(
          'You do not have permission to access this interface',
        );
    }
    return true;
  }
}
