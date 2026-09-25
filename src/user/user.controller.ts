import { Controller,  Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { Register } from './dto/register.dto';
import { Login } from './dto/login.dto';

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

}
