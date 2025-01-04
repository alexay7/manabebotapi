import { IsObject } from 'class-validator';

export class CalcTicketsDto {
  @IsObject()
  results: {
    anime: {
      voters: string[];
      winner: string;
    };
    manga: {
      voters: string[];
      winner: string;
    };
    novel: {
      voters: string[];
      winner: string;
    };
    vn: {
      voters: string[];
      winner: string;
    };
    live: {
      voters: string[];
      winner: string;
    };
  };
}
