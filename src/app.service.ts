import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchLogQuery } from 'src/dto/searchlog.dto';
import { Log } from 'src/schemas/log.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {}

  async findLogs({
    medio,
    user,
    startDate,
    endDate,
    limit,
    page,
    sort,
  }: SearchLogQuery): Promise<Log[]> {
    const baseAggr = this.logModel.find();

    if (medio) baseAggr.where({ medio });

    if (user) {
      baseAggr.where({ userId: user });
    }

    if (startDate) {
      baseAggr.where({ createdAt: { $gte: startDate } });
    }

    if (endDate) {
      baseAggr.where({ createdAt: { $lte: endDate } });
    }

    if (limit && page) baseAggr.skip((page - 1) * limit).limit(limit);

    if (sort) {
      const [field, order] = sort.split('_');
      baseAggr.sort({ [field]: order === 'asc' ? 1 : -1 });
    }

    return baseAggr.exec();
  }
}
