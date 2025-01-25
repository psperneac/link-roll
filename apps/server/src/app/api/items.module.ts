import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  Module,
  Param,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  InjectModel,
  MongooseModule,
  Prop,
  Schema,
  SchemaFactory,
} from '@nestjs/mongoose';
import { ItemDto, TagDto, TagRef } from '../models';

import { omit } from 'lodash';
import moment from 'moment';
import { HydratedDocument, Model, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { LoggedIn } from '../auth/authentication.guards';
import { AuthenticationModule } from '../auth/authentication.module';
import { AllExceptionsFilter } from '../utils/all-exceptions.filter';
import ParamsWithMongoId from '../utils/params-with-mongo-id';
import { UserDocument } from '../auth/user';
import { Context, createRequestContext } from '../utils/context';
import { TagsModule, TagsService } from './tags.module';
import * as Mongoose from 'mongoose';

@Schema()
export class Item {
  @Prop(Date)
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  createdBy: ObjectId;

  @Prop(Date)
  modifiedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  modifiedBy: ObjectId;

  @Prop()
  public name: string;

  @Prop()
  public description: string;

  @Prop()
  public url: string;

  @Prop()
  public tagIds: ObjectId[];

  @Prop()
  public type: string;

  @Prop()
  public access: string;
}

export type ItemDocument = HydratedDocument<Item>;

export const ItemSchema = SchemaFactory.createForClass(Item);

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    private tagsService: TagsService,
  ) {}

  toDto(item: ItemDocument, tagRefs?: TagRef[]): ItemDto {
    const obj = omit(item.toObject({ getters: true }), [
      '_id',
      '__v',
      'tagIds',
    ]);
    return {
      ...obj,
      createdAt: item.createdAt?.toISOString(),
      modifiedAt: item.modifiedAt?.toISOString(),
      createdBy: item.createdBy?.toString(),
      modifiedBy: item.modifiedBy?.toString(),
      tags: tagRefs || [],
    };
  }

  toDomain(item: ItemDto): Partial<Item> {
    // tag handling do be done in main method
    return {
      name: item.name,
      description: item.description,
      url: item.url,
      type: item.type,
      access: item.access,
    } as Partial<Item>;
  }

  async getAll(ctx: Context) {
    const user = ctx.getType<UserDocument>('user');

    this.logger.debug(`Getting all items for user ${user?.email}`);

    const items = await this.itemModel
      .find({ createdBy: user._id })
      .sort({ modifiedAt: 'desc' })
      .exec();
    if (items && items.length > 0) {
      return await Promise.all(
        items.map(async (item) =>
          this.toDto(item, await this.tagsService.getTagRefsByIds(item.tagIds)),
        ),
      );
    }

    return [];
  }

  async findByTags(ctx: Context, tags: string[]) {
    const user = ctx.getType<UserDocument>('user');

    const tagIds = await this.tagsService.getIdsByName(tags);

    this.logger.debug(`Getting items by tags for user ${user?.email} ${tags}`);
    const ret = await this.itemModel
      .find({ tags: { $all: tagIds } })
      .sort({ modifiedAt: 'desc' })
      .exec();

    if (ret && ret.length > 0) {
      return await Promise.all(
        ret.map(async (item) =>
          this.toDto(item, await this.tagsService.getTagRefsByIds(item.tagIds)),
        ),
      );
    }

    return [];
  }

  async getOne(ctx: Context, id: string) {
    const item = await this.itemModel.findById(id).exec();

    if (item) {
      return this.toDto(
        item,
        await this.tagsService.getTagRefsByIds(item.tagIds),
      );
    }
    throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
  }

  async create(ctx: Context, itemDto: ItemDto) {
    const user = ctx.getType<UserDocument>('user');

    const now = moment().toISOString();
    const item = await new this.itemModel({
      ...this.toDomain(itemDto),
      createdAt: now,
      createdBy: user?._id,
      modifiedAt: now,
      modifiedBy: user?._id,
      // TODO: add tag processing
    }).save();
    return item ? this.toDto(item) : null;
  }

  async update(ctx: Context, id: string, itemDto: ItemDto) {
    const user = ctx.getType<UserDocument>('user');

    const item = await this.itemModel
      .findByIdAndUpdate(id, {
        ...this.toDomain(itemDto),
        modifiedAt: moment().toISOString(),
        modifiedBy: user?._id,
        // TODO: add tag processing
      })
      .setOptions({ overwrite: true, new: true })
      .exec();

    if (item) {
      return this.toDto(item);
    }

    throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
  }

  async delete(ctx: Context, id: string) {
    const item = await this.itemModel.findByIdAndDelete(id).exec();

    if (item) {
      return this.toDto(item);
    }

    throw new HttpException('Item not found', HttpStatus.NOT_FOUND);
  }

  async transformTags(ctx: Context) {
    const user = ctx.getType<UserDocument>('user');

    const allTags = await this.itemModel
      .find()
      .exec()
      .then((items) => {
        const allTags = [];

        items.forEach(async (item) => {
          console.log(item);
          if (item['tags']) {
            item['tags'].forEach((tag: string) => {
              console.log('...', tag);
              allTags.push(tag.trim());
            });
          }
        });

        return allTags;
      });

    const allIds = [];
    const allIdsMap = {};
    for (const tag of allTags) {
      let tagItem = await this.tagsService.getByName(tag);
      if (!tagItem) {
        const tagObj = {
          name: tag,
          description: tag + ' description',
          type: 'TAG',
          access: 'PUBLIC',
          translations: {
            ['en-US']: tag,
          },
        } as TagDto;
        tagItem = await this.tagsService.create(ctx, tagObj);
        console.log('tagItem', tagItem);
        allIds.push(tagItem['id']);
      }
      allIdsMap[tag] = new Mongoose.Types.ObjectId(tagItem.id);
    }

    this.itemModel
      .find()
      .exec()
      .then((items) => {
        items.forEach(async (item) => {
          if (item['tags']) {
            const tagIds = item['tags'].map(
              (tag: string) => allIdsMap[tag.trim()],
            );
            item.tagIds = tagIds;
            item.modifiedBy = user?._id as any as ObjectId;
            item.modifiedAt = moment().toDate();
            item['tags'] = undefined;
            console.log('saving item', item);
            await item.save().catch((err) => {
              console.error('Error at', item, err);
            });
          }
        });
      });

    return allIds;
  }
}

@Controller('items')
@UseFilters(AllExceptionsFilter)
@UseGuards(LoggedIn)
export class ItemsController {
  constructor(private readonly service: ItemsService) {}

  @Get()
  getAllItems(@Req() req) {
    return this.service.getAll(createRequestContext(req));
  }

  @Get('tags/:tags')
  getItemsByTags(@Param('tags') tags: string, @Req() req) {
    return this.service.findByTags(createRequestContext(req), tags.split(','));
  }

  @Get(':id')
  getItemById(@Param() { id }: ParamsWithMongoId, @Req() req) {
    return this.service.getOne(createRequestContext(req), id);
  }

  @Post()
  async createItem(@Body() item: ItemDto, @Req() req) {
    return this.service.create(createRequestContext(req), item);
  }

  @Post('transformTags')
  async transformTags(@Req() req) {
    return this.service.transformTags(createRequestContext(req));
  }

  @Put(':id')
  async updateItem(
    @Param() { id }: ParamsWithMongoId,
    @Body() item: ItemDto,
    @Req() req,
  ) {
    return this.service.update(createRequestContext(req), id, item);
  }

  @Delete('/:id')
  async deleteItem(@Param() { id }: ParamsWithMongoId, @Req() req) {
    return this.service.delete(createRequestContext(req), id);
  }
}

@Module({
  imports: [
    Item,
    MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]),
    AuthenticationModule,
    TagsModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [Item],
})
export class ItemsModule {}
