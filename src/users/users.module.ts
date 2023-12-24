import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService, PrismaService],
  exports:[UsersService],
  controllers: [UsersController],
  imports: [CacheModule.register()]
})
export class UsersModule {}
