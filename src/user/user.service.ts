import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Register } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import bcrypt from "bcrypt";
import { Login } from './dto/login.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger("UserService");
  
  constructor(
    @InjectRepository(User)
    private readonly userRepository : Repository<User>
  ){}

  async create(registerDto: Register) {
    const {password, ...userDetails} = registerDto;
    try{
      const user = this.userRepository.create({
        ...userDetails,
        password: this.encryptPassword(password)
      })
      await this.userRepository.save(user);
      delete user.password;
      return user;
    }catch(error){
      this.handleException(error);
    }
  }

  encryptPassword(password:string){
    return bcrypt.hashSync(password, 10);
  }

  async login(loginDto: Login){
    const {email, password} = loginDto;
    const user = await this.userRepository.findOne({
      where: {email},
      select: {email: true, password: true, id: true}
    })

    if(!user) throw new UnauthorizedException(`Email or password incorrect`);

    if(!bcrypt.compareSync(password, user.password!))
      throw new UnauthorizedException(`Email or password incorrect`);

    delete user.password;
    return user;
  }

  private handleException(error:any){
          this.logger.error(error);
          if(error.code === '23505'){
              throw new InternalServerErrorException(error.detail);
          }
  }

 
}
