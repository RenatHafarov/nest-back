import { Cookie, Public, UserAgent } from '@common/common/decorators';
import { BadRequestException, ClassSerializerInterceptor, HttpStatus, Req, Res, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { UserResponse } from 'src/users/responses';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { Tokens } from './interfaces';

const REFRESH_TOKEN = 'refreshtoken'

@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly configService: ConfigService) { }


    @UseInterceptors(ClassSerializerInterceptor)
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const user = await this.authService.register(dto);
        if (!user) { throw new BadRequestException(`Не получаеться зарегистрировать пользователя с данными ${JSON.stringify(dto)}`) }

        return new UserResponse(user);
    }

    @Post('login')
    async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent: string) {


        const tokens = await this.authService.login(dto, agent)

        if (!tokens) { throw new BadRequestException(`Не получаеться войти с данными ${JSON.stringify(dto)}`) }
        this.setRefreshTokenToCokies(tokens, res)
        return { accessToken: (tokens.accessToken) }

    }


    @Get('logout')
    async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {

        if(!refreshToken){ 
            res.sendStatus(HttpStatus.OK);
            return;
        
        }

        await this.authService.deleteRefreshToken(refreshToken);
        res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() });
        res.sendStatus(HttpStatus.OK)

    }

    @Get('refresh-tokens')
    async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {

        if (!refreshToken) { throw new UnauthorizedException() }

        const tokens = await this.authService.refreshTokens(refreshToken, agent);


        if (!tokens) { throw new UnauthorizedException() }
        this.setRefreshTokenToCokies(tokens, res)



    }


    private setRefreshTokenToCokies(tokens: Tokens, res: Response) {
        if (!tokens) { throw new UnauthorizedException() }
        res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {

            httpOnly: true,
            sameSite: 'lax',
            expires: new Date(tokens.refreshToken.exp),
            secure: this.configService.get('NODE_ENV', 'development') === 'production',
            path: '/'
        })


        res.status(HttpStatus.CREATED).json({ accesstokens: tokens.accessToken })
    }






}
