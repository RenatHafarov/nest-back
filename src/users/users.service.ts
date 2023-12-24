import { convertToSecondsUtil } from '@common/common/utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role, User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';
import { JwtPayLoad } from 'src/auth/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(
        private prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly configService: ConfigService
    ) { }


    async createUser(user: Partial<User>) {
        const hashedPassword = this.hashPassword(user.password);
        return this.prismaService.user.create({

            data: {
                email: user.email,
                password: hashedPassword,
                roles: ['USER']
            }
        })


    }

    async findOne(idOrEmail: string, isReset = false): Promise<User> {
        if (isReset) {
            await this.cacheManager.del(idOrEmail);
        }
        const user = await this.cacheManager.get<User>(idOrEmail);
        if (!user) {
            const user = await this.prismaService.user.findFirst({
                where: {
                    OR: [{ id: idOrEmail }, { email: idOrEmail }],
                },
            });
            if (!user) {
                return null;
            }
            await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')));
            return user;
        }
        return user;
    }



    async deleteUser(id: string, user: JwtPayLoad) {
        if (user.id != id && !user.roles.includes(Role.ADMIN)) {
            throw new ForbiddenException()
        }
        await Promise.all([
            this.cacheManager.del(id),
            this.cacheManager.del(user.email)
        ]);

        return this.prismaService.user.delete({ where: { id }, select: { id: true } });
    }



    private hashPassword(password: string) {
        return hashSync(password, genSaltSync(10));
    }


}
