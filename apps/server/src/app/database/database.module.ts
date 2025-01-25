import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('MONGO_USERNAME');
        const password = configService.get('MONGO_PASSWORD');
        const database = configService.get('MONGO_DATABASE');
        const host = configService.get('MONGO_HOST');

        // https://mongoosejs.com/docs/connections.html
        const config = {
          uri: `mongodb://${username}:${password}@${host}/${database}?ssl=false`,
          dbName: database,
        };

        return config;
      },
      inject: [ConfigService],
    })
  ]
})
export class DatabaseModule {

}
