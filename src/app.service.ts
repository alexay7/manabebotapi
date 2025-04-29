import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CalcTicketsDto } from 'src/dto/calctickets.dto';
import { Medio, SearchLogQuery } from 'src/dto/searchlog.dto';
import { normalizeMedia } from 'src/helper';
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

  async calculateTickets(
    month: number,
    voters: CalcTicketsDto['results'],
  ): Promise<
    {
      userId: string;
      status: 'bonus' | 'penalty';
    }[]
  > {
    const startDate = new Date(new Date().getFullYear(), month, 1);
    const endDate = new Date();

    const logs = await this.logModel
      .aggregate<{
        _id: string;
        mediaInfo: {
          medio: keyof typeof Medio;
          points: number;
        }[];
      }>()
      .match({
        createdAt: { $gte: startDate, $lte: endDate },
        bonus: true,
      })
      .group({
        _id: {
          userId: '$userId',
          medio: '$medio',
        },
        points: { $sum: '$puntos' },
      })
      .project({
        user: '$_id.userId',
        medio: '$_id.medio',
        points: 1,
      })
      .group({
        _id: '$user',
        mediaInfo: {
          $push: {
            medio: '$medio',
            points: '$points',
          },
        },
      });

    // First calculate the users that deserve a ticket, this means, at least 100 points in any media
    const ticketUsers = logs
      .filter((log) =>
        log.mediaInfo.some((media) => {
          if (media.points >= 100) {
            console.log('El usuario', log._id, 'tiene bonus por', media.medio);
            return true;
          }
        }),
      )
      .map((log) => {
        return { userId: log._id, status: 'bonus' } as const;
      });

    const penalties: { userId: string; media: string }[] = [];

    // Add to penalty users the users that are in the voter list in any media and have less than 30 points
    const penaltyUsers = Object.entries(voters).map(([media, allVoters]) => {
      // Search every user that has voted in this media in the logs
      const votersWithoutPoints = allVoters.voters.filter((voter) => {
        // Search the user in the logs
        const user = logs.find((log) => log._id === voter);

        // If the user is not found, return true
        if (!user) {
          console.log('El usuario', voter, 'tiene multa por', media);
          penalties.push({
            userId: voter,
            media: media,
          });
          return true;
        }

        // Get info about current media
        const mediaInfo = user.mediaInfo.find((mediaInfo) => {
          const normalizedMedia = normalizeMedia(mediaInfo.medio);
          return normalizedMedia === media;
        });

        // If no info is found, return true
        if (!mediaInfo) {
          console.log('El usuario', voter, 'tiene multa por', media);
          penalties.push({
            userId: voter,
            media: media,
          });
          return true;
        }

        // Return if the user has less than 45 points
        if (mediaInfo.points < 45) {
          console.log('El usuario', voter, 'tiene multa por', media);
          penalties.push({
            userId: voter,
            media: media,
          });
          return true;
        }
      });

      return votersWithoutPoints;
    }, []);

    // Flatten the array without duplicates and convert it to the final object
    const mergedUsers = Array.from(new Set(penaltyUsers.flat())).map(
      (userId) => {
        const failedMedias = penalties
          .filter((penalty) => penalty.userId === userId)
          .map((x) => x.media);

        return { userId, status: 'penalty', medias: failedMedias } as const;
      },
    );

    // Users in both arrays
    const bothArrays = ticketUsers
      .filter((ticketUser) =>
        mergedUsers.some(
          (mergedUser) => mergedUser.userId === ticketUser.userId,
        ),
      )
      .map((user) => user.userId);

    // Final array without duplicates
    const finalList = Array.from(new Set([...ticketUsers, ...mergedUsers]));

    console.log(finalList.filter((user) => !bothArrays.includes(user.userId)));

    // Remove users that are in both arrays
    return finalList.filter((user) => !bothArrays.includes(user.userId));
  }
}
