import { Controller,  Post, Body, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Register } from './dto/register.dto';
import { Login } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';

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

  @Get("private")
  @UseGuards(AuthGuard())
  testingAuth(@GetUser() user: any, @GetUser("email") email:string){
    console.log(user)
    return {
      message: "Done"
    }
  }

}
