import {
  Controller,
  Delete,
  Get,
  Injectable,
  Logger,
  Module, Post, Put, Req,
  UseFilters,
  UseGuards
} from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { omit } from 'lodash';
import { HydratedDocument, Model, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { AuthenticationModule } from '../auth/authentication.module';
import { Context, createRequestContext } from '../utils/context';
import { UserDocument } from '../auth/user';
import moment from 'moment/moment';
import { AllExceptionsFilter } from '../utils/all-exceptions.filter';
import { LoggedIn } from '../auth/authentication.guards';
import { TagDto, TagRef } from '../models';

@Schema()
export class Tag {
  @Prop()
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  createdBy: ObjectId;

  @Prop()
  modifiedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  modifiedBy: ObjectId;

  @Prop()
  public name: string;

  @Prop()
  public description: string;

  @Prop()
  public translations: Map<string, string>;

  @Prop()
  type: string;

  @Prop()
  access: string;
}

export type TagDocument = HydratedDocument<Tag>;

export const TagSchema = SchemaFactory.createForClass(Tag);

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name);

  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

  toDto(item: TagDocument): TagDto {
    const obj = omit(item.toObject({ getters: true }), ['_id', '__v']);
    return ({
      ...obj,
      createdBy: item.createdBy?.toString(),
      modifiedBy: item.modifiedBy?.toString()
    } as unknown) as TagDto;
  }

  toDomain(dto: TagDto): Partial<Tag> {
    return {
      iu: dto.id,
      name: dto.name,
      description: dto.description,
      translations: dto.translations ? new Map(Object.entries(dto.translations)) : undefined,
      type: dto.type,
      access: dto.access
    } as Partial<Tag>;
  }

  /**
   *
   * @param ctx Returns all tags in db
   * @returns all tags
   */
  async getAll() {
    this.logger.debug('getAll Tags');

    const ret = await this.tagModel.find().sort({name: 'asc'}).exec();
    if (ret && ret.length > 0) {
      return ret.map(item => this.toDto(item));
    }

    return [];
  }

  async getById(id: string) {
    this.logger.debug(`getById Tag ${id}`);

    const ret = await this.tagModel.findById(id).exec();
    if (ret) {
      return this.toDto(ret);
    }

    return undefined;
  }

  async getByName(name: string): Promise<TagDto> {
    this.logger.debug(`getByName Tag ${name}`);

    const ret = await this.tagModel.findOne({name: name}).exec();
    if (ret) {
      return this.toDto(ret);
    }

    return undefined;
  }

  async getByIds(ids: string[] | ObjectId[]) {
    this.logger.debug(`getByIds Tags ${ids}`);

    const ret = await this.tagModel.find({_id: {$in: ids}}).exec();
    if (ret && ret.length > 0) {
      return ret.map(item => this.toDto(item));
    }

    return [];
  }

  async getTagRefsByIds(ids: string[] | ObjectId[]): Promise<TagRef[]> {
    this.logger.debug(`getTagRefsByIds Tags ${ids}`);

    const ret = await this.tagModel.find({_id: {$in: ids}}).exec();
    if (ret && ret.length > 0) {
      return ret.map(item => ({id: item._id.toString(), name: item.name}));
    }

    return [];
  }

  async getIdsByName(names: string[]) {
    this.logger.debug(`getIdsByName Tags ${names}`);

    const ret = await this.tagModel.find({name: {$in: names}}).exec();
    if (ret && ret.length > 0) {
      return ret.map(item => item._id);
    }

    return [];
  }

  async getByNames(names: string[]) {
    this.logger.debug(`getByNames Tags ${names}`);

    const ret = await this.tagModel.find({name: {$in: names}}).exec();
    if (ret && ret.length > 0) {
      return ret.map(item => this.toDto(item));
    }

    return [];
  }

  async getByNameLike(name: string) {
    this.logger.debug(`getByNameLike Tag ${name}`);

    const ret = await this.tagModel.find({name: {$regex: name, $options: 'i'}}).exec();
    if (ret && ret.length > 0) {
      return ret.map(item => this.toDto(item));
    }

    return [];
  }

  async create(ctx: Context, tag: TagDto) {
    const user = ctx.getType<UserDocument>('user');

    this.logger.debug(`create Tag ${tag.name}`);

    const now = moment().toISOString();

    const newTag = await new this.tagModel({
      ...this.toDomain(tag),
      createdAt: now,
      createdBy: user?._id,
      modifiedAt: now,
      modifiedBy: user?._id
    }).save();
    return newTag ? this.toDto(newTag) : null;
  }

  async update(ctx: Context, id: string, tag: Tag) {
    const user = ctx.getType<UserDocument>('user');
    this.logger.debug(`update Tag ${id}`);

    const now = moment().toISOString();
    const updatedTag = await this.tagModel.findByIdAndUpdate(id, {
      ...tag,
      modifiedAt: now,
      modifiedBy: user?._id
    }, {overwrite: true, new: true}).exec();
    return updatedTag ? this.toDto(updatedTag) : null;
  }

  async delete(ctx: Context, id: string) {
    this.logger.debug(`delete Tag ${id}`);

    const ret = await this.tagModel.findByIdAndDelete(id).exec();
    return ret ? this.toDto(ret) : null;
  }
}

@Controller('tags')
@UseFilters(AllExceptionsFilter)
@UseGuards(LoggedIn)
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  constructor(private readonly tagsService: TagsService) {}

  @Get()
  getAllTags(@Req() req) {
    return this.tagsService.getAll();
  }

  @Get(':id')
  getTagById(@Req() req) {
    return this.tagsService.getById(req.params.id);
  }

  @Get('name/:name')
  getTagByName(@Req() req) {
    return this.tagsService.getByName(req.params.name);
  }

  @Get('ids/:ids')
  getTagsByIds(@Req() req) {
    return this.tagsService.getByIds(req.params.ids.split(','));
  }

  @Get('names/:names')
  getTagsByNames(@Req() req) {
    return this.tagsService.getByNames(req.params.names.split(','));
  }

  @Get('nameLike/:name')
  getTagsByNameLike(@Req() req) {
    return this.tagsService.getByNameLike(req.params.name);
  }

  @Post()
  createTag(@Req() req) {
    return this.tagsService.create(createRequestContext(req), req.body);
  }

  @Put(':id')
  updateTag(@Req() req) {
    return this.tagsService.update(createRequestContext(req), req.params.id, req.body);
  }

  @Delete(':id')
  deleteTag(@Req() req) {
    return this.tagsService.delete(createRequestContext(req), req.params.id);
  }
}

@Module({
  imports: [Tag, MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]), AuthenticationModule],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [Tag, TagsService]
})
export class TagsModule {}
