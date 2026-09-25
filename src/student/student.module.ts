import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Grades } from './entities/grades.entity';

@Module({
  controllers: [StudentController],
  imports:[
    TypeOrmModule.forFeature([Student, Grades])
    
  ],
  providers: [StudentService],
})
export class StudentModule {}
