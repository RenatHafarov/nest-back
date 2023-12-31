
import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { v4 } from 'uuid';
import { LoginDto, RegisterDto } from './dto';
import { Tokens } from './interfaces';
import { add } from 'date-fns';

@Injectable()
export class AuthService {




    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly prismaService: PrismaService
    ) { }


    async register(dto: RegisterDto) {
        const user: User = await this.userService.findOne(dto.email).catch(err => {
            this.logger.error(err)
            return null;
        })

        if (user) { throw new ConflictException('Пользователь с таким email уже зарегистрирован.') }

        return this.userService.createUser(dto).catch(err => {
            this.logger.error(err)
            return null;
        });

    }

    async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {

        const token = await this.prismaService.token.findFirst({ where: { token: refreshToken } })

        if (!token) { throw new UnauthorizedException(); }

        await this.prismaService.token.delete({ where: { token: refreshToken } });

        if (new Date(token.exp) < new Date()) {

            throw new UnauthorizedException();

        }

        await this.prismaService.token.delete({ where: { token: refreshToken } })
        const user = await this.userService.findOne(token.userId)
        return this.generateTokens(user, agent)

    }



    async login(dto: LoginDto, agent: string): Promise<Tokens> {
        const user: User = await this.userService.findOne(dto.email, true).catch(err => {
            this.logger.error(err)
            return null;
        })

        if (!user || !compareSync(dto.password, user.password)) { throw new UnauthorizedException('Не верный логин или пороль') }


        return this.generateTokens(user, agent);

    }

    async deleteRefreshToken(token: string) {

        return this.prismaService.token.delete({ where: { token } })


    }



    private async generateTokens(user: User, agent: string): Promise<Tokens> {

        const accessToken = 'Bearer ' + this.jwtService.sign({ id: user.id, email: user.email, roles: user.roles })

        const refreshToken = await this.getRefreshToken(user.id, agent);
        return { accessToken, refreshToken };



    }


    private async getRefreshToken(userId: string, agent: string): Promise<Token> {

        const _token = await this.prismaService.token.findFirst({
            where: {
                userId,
                userAgent: agent

            }
        })

        const token = _token?.token ?? '';

        return this.prismaService.token.upsert({
            where: { token },
            update: {
                token: v4(),
                exp: add(new Date(), { months: 1 }),
            },
            create:
            {
                token: v4(),
                exp: add(new Date(), { months: 1 }),
                userId,
                userAgent: agent,

            }
        })

    }






}



