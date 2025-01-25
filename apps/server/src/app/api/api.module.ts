import { Module } from "@nestjs/common";
import { ItemsModule } from './items.module';
import { TagsModule } from './tags.module';

@Module({
  imports: [
    ItemsModule,
    TagsModule
  ]
})
export class ApiModule {}
