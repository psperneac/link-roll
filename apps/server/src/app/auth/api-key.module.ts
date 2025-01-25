import { Body, Controller, Delete, Get, HttpException, HttpStatus, Injectable, Logger, Module, Param, Post, Put, Req, UseFilters, UseGuards } from '@nestjs/common';
import { InjectModel, MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { omit } from 'lodash';
import { HydratedDocument, Model, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Context, createRequestContext } from '../utils/context';
import moment from 'moment';
import { UserDocument } from './user';
import { AllExceptionsFilter } from '../utils/all-exceptions.filter';
import { LoggedIn } from './authentication.guards';
import ParamsWithMongoId from '../utils/params-with-mongo-id';

export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

@Schema()
export class ApiKey {
  @Prop()
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  createdBy: ObjectId;

  @Prop()
  modifiedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  modifiedBy: ObjectId;

  @Prop()
  expiresAt: Date;

  @Prop({
    required: true,
    index: true,
    type: MongooseSchema.Types.ObjectId
  })
  public userId: ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true
  })
  public apiKey: string;

  @Prop({ type: String, enum: ApiKeyStatus, default: ApiKeyStatus.ACTIVE })
  @IsEnum(ApiKeyStatus)
  public status: string;
}

export type ApiKeyDocument = HydratedDocument<ApiKey>;

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>
  ) {
  }

  toDto(item: ApiKeyDocument) {
    const obj = omit(item.toObject({ getters: true }), ['_id', '__v']);
    return ({
      ...obj,
      createdBy: item.createdBy?.toString(),
      modifiedBy: item.modifiedBy?.toString(),
      userId: item.userId?.toString()
    });
  }

  async getApiKeysByUsedId(ctx: Context) {
    const user = ctx.getType<UserDocument>('user');
    const ret = await this.apiKeyModel.find({ userId: user.id }).exec();

    if (ret && ret.length > 0) {
      return ret.map(item => this.toDto(item));
    }

    return [];
  }

  async getApiKeyById(ctx: Context, id: string) {
    const user = ctx.getType<UserDocument>('user');
    console.log('In service', id);
    const ret = await this.apiKeyModel.findOne({ _id: id }).exec();
    console.log('In service', ret);

    if (ret && ret.userId.toString() === user.id.toString()) {
      return this.toDto(ret);
    }

    throw new HttpException('Api key not found', HttpStatus.NOT_FOUND);
  }

  async getApiKeyByApiKey(ctx: Context, apiKey: string) {
    const user = ctx.getType<UserDocument>('user');
    const ret = await this.apiKeyModel.findOne({ userId: user.id, apiKey }).exec();

    if (ret) {
      return this.toDto(ret);
    }

    throw new HttpException('Api key not found', HttpStatus.NOT_FOUND);
  }

  async getApiKeyByApiKeyInternal(apiKey: string): Promise<ApiKey> {
    console.log('getApiKeyByApiKeyInternal.beforeFindOne', apiKey);
    const ret = await this.apiKeyModel.findOne({ apiKey }).exec();
    console.log('getApiKeyByApiKeyInternal', ret);

    if (ret) {
      return ret;
    }

    return null;
  }

  async create(ctx: Context, apiKey: ApiKey) {
    const user = ctx.getType<UserDocument>('user');
    const now = moment().toISOString();
    const apiKeyItem = await new this.apiKeyModel({
      ...apiKey,
      createdAt: now,
      createdBy: user?._id,
      modifiedAt: now,
      modifiedBy: user?._id,
      userId: user?.id
    }).save();
    return apiKeyItem ? this.toDto(apiKeyItem) : null;
  }

  async update(ctx: Context, id: string, apiKey: ApiKey) {
    const user = ctx.getType<UserDocument>('user');
    const item = await this.apiKeyModel
      .findOneAndUpdate({ _id: id, userId: user.id }, {
        ...apiKey,
        modifiedAt: moment().toISOString(),
        modifiedBy: user?.id,
        userId: user?.id
      })
      .setOptions({ new: true, overwrite: true })
      .exec();

    if (!item) {
      throw new HttpException('Api key not found', HttpStatus.NOT_FOUND);
    }

    return this.toDto(item);
  }

  async delete(ctx: Context, id: string) {
    const user = ctx.getType<UserDocument>('user');
    const item = await this.apiKeyModel.findOneAndDelete({ _id: id, userId: user.id } ).exec();

    if (!item) {
      throw new HttpException('Api key not found', HttpStatus.NOT_FOUND);
    }

    return this.toDto(item);
  }
}

@Controller('api-keys')
@UseFilters(AllExceptionsFilter)
@UseGuards(LoggedIn)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {
  }

  @Get()
  async getApiKeys(@Req() req) {
    const ctx = createRequestContext(req);
    return this.apiKeyService.getApiKeysByUsedId(ctx);
  }

  @Get(':id')
  async getApiKey(@Param('id') id: string, @Req() req) {
    const ctx = createRequestContext(req);
    console.log(id);
    return this.apiKeyService.getApiKeyById(ctx, id);
  }

  @Get('by-key/:apiKey')
  async getApiKeyByApiKey(@Param('apiKey') apiKey: string, @Req() req) {
    const ctx = createRequestContext(req);
    return this.apiKeyService.getApiKeyByApiKey(ctx, apiKey);
  }

  @Post()
  async createApiKey(@Body() apiKey: ApiKey, @Req() req) {
    const ctx = createRequestContext(req);
    return this.apiKeyService.create(ctx, apiKey);
  }

  @Put(':id')
  async updateApiKey(@Param() { id }: ParamsWithMongoId, @Body() apiKey: ApiKey, @Req() req) {
    const ctx = createRequestContext(req);
    return this.apiKeyService.update(ctx, id, apiKey);
  }

  @Delete(':id')
  async deleteApiKey(@Param('id') id: string, @Req() req) {
    const ctx = createRequestContext(req);
    return this.apiKeyService.delete(ctx, id);
  }
}

@Module({
  imports: [ApiKey, MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }])],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKey, ApiKeyService]
})
export class ApiKeyModule {}
