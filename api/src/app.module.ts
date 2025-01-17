import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule,ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Room } from './room/entities/room.entity';
import { RoomModule } from './room/room.module';
import {FriendRequest} from './user/entities/request.entity'

@Module({
  imports: [
     AuthModule,
     UserModule,
     ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:'./.env'
      //...
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        // autoLoadEntities: true,
        entities:[User,Room,FriendRequest],
        synchronize: true,
      }),
    }),
    RoomModule,
     
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
