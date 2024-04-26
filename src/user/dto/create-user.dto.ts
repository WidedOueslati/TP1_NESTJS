import { Cv } from "@/cv/entities/cv.entity";
import { IsEmail, IsNotEmpty, IsStrongPassword } from "class-validator";

export class CreateUserDto {


    @IsNotEmpty()
    username: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
     @IsStrongPassword()
    password: string;

}
