import { CurrentUser, Roles } from '@common/common/decorators';
import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { JwtPayLoad } from 'src/auth/interfaces';
import { UserResponse } from './responses';
import { CreateUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async findOneUser(@Param('idOrEmail') idOrEmail: string) {
        const user = await this.usersService.findOne(idOrEmail);
        return new UserResponse(user);
    }


    @UseInterceptors(ClassSerializerInterceptor)
    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayLoad) {

        return this.usersService.deleteUser(id, user);

    }

    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    me(@CurrentUser() user: JwtPayLoad) {

        return user;

    }


}
