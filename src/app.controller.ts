import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Medio, SearchLogQuery, Sort } from 'src/dto/searchlog.dto';

@Controller()
@ApiTags('Logs')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiQuery({ name: 'medio', required: false, enum: Medio, type: String })
  @ApiQuery({ name: 'user', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 25 })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'sort', required: false, enum: Sort })
  @ApiOkResponse({ description: 'Logs found' })
  async getLogs(@Query() query: SearchLogQuery) {
    if (!query.page) query.page = 1;

    if (!query.limit) query.limit = 25;

    return this.appService.findLogs(query);
  }
}
