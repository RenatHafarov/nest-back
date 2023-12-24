
import { IsEmail, IsNotEmpty, IsString, MinLength, Validate, Validator } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

 


}

