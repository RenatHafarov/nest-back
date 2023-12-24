
import { IsPasswordsMatchingConstraint } from "@common/common/decorators";
import { IsEmail, IsNotEmpty, IsString, MinLength, Validate, Validator } from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @Validate(IsPasswordsMatchingConstraint)
    passwordRepeat: string;



}
