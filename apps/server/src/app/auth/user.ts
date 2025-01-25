import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
  @Prop()
  createdAt: Date;

  @Prop()
  modifiedAt: Date;

  @Prop()
  username: string;

  @Prop({ lowercase: true, unique: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop()
  scope: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);
