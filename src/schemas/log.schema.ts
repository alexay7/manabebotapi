import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { Medio } from 'src/dto/searchlog.dto';

export type LogDocument = Log & mongoose.Document;

@Schema()
export class Log {
  _id: Types.ObjectId;

  @Prop({
    type: Date,
    required: true,
  })
  createdAt: Date;

  @Prop({
    type: String,
    required: true,
  })
  descripcion: string;

  @Prop({
    type: String,
    required: true,
  })
  medio: keyof typeof Medio;

  @Prop({
    type: Number,
    required: true,
  })
  parametro: number;

  @Prop({
    type: Boolean,
    required: true,
  })
  bonus: boolean;

  @Prop({
    type: Number,
    required: true,
  })
  puntos: number;

  @Prop({
    type: Number,
    required: true,
  })
  id: number;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: Number,
    required: false,
  })
  tiempo: number;

  @Prop({
    type: Number,
    required: false,
  })
  caracteres: number;
}

export const LogSchema = SchemaFactory.createForClass(Log);
