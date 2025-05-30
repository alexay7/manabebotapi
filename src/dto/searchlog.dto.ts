import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Medio {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  ANIME = 'ANIME',
  LIBRO = 'LIBRO',
  OUTPUT = 'OUTPUT',
  JUEGO = 'JUEGO',
  LECTURA = 'LECTURA',
  MANGA = 'MANGA',
  VN = 'VN',
  TIEMPOLECTURA = 'TIEMPOLECTURA',
}

export enum Sort {
  DATE_ASC = 'createdAt_asc',
  DATE_DESC = 'createdAt_desc',
  PUNTOS_ASC = 'puntos_asc',
  PUNTOS_DESC = 'puntos_desc',
}

export class SearchLogQuery {
  @IsString()
  @IsEnum(Medio)
  @IsOptional()
  medio?: keyof typeof Medio;

  @IsNumberString()
  @IsOptional()
  user?: number;

  @IsISO8601()
  @IsOptional()
  startDate?: Date;

  @IsISO8601()
  @IsOptional()
  endDate?: Date;

  @IsNumberString()
  @IsOptional()
  limit?: number;

  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsString()
  @IsEnum(Sort)
  @IsOptional()
  sort?: keyof typeof Sort;
}

export class AnkiFinishedDto {
  @IsString()
  userId: string;

  @IsNumber()
  reviews: number;

  @IsNumber()
  newCards: number;

  @IsOptional()
  @IsNumber()
  allCards?: number;

  @IsOptional()
  @IsNumber()
  studiedCards?: number;
}
