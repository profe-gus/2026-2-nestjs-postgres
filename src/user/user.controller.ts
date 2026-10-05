import { Controller,  Post, Body, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { UserService } from './user.service';
import { Register } from './dto/register.dto';
import { Login } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { Test } from './decorators/test.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './enums/valid-roles.enum';
import { Auth } from './decorators/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signup")
  create(@Body() registerDto: Register) {
    return this.userService.create(registerDto);
  }

  @Post("auth")
  login(@Body() loginDto: Login){
    return this.userService.login(loginDto);
  }

  @Post("private")
  @Auth()
  testingAuth(@GetUser() user: User){
    console.log("🚀 ~ :25 ~ UserController ~ testingAuth ~ test:", user)
    return {
      message: "Done"
    }
  }

}
