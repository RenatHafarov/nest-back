import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { options } from './config';
import { GUARDS } from './guards';
import { STRATEGIE } from './strategies';


@Module({
    controllers: [AuthController],
    providers: [AuthService, ...STRATEGIE, ...GUARDS],
    imports: [PassportModule, JwtModule.registerAsync(options()), UsersModule]
})
export class AuthModule {}