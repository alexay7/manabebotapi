import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  AnkiFinishedDto,
  Medio,
  SearchLogQuery,
  Sort,
} from 'src/dto/searchlog.dto';
import {
  Client,
  Events,
  GatewayIntentBits,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import { CalcTicketsDto } from 'src/dto/calctickets.dto';
import { Request } from 'express';
import { updateCloudflareDNSIP } from 'src/helpers/cloudflare';
import { checkCacheIP } from 'src/helpers/cache';

@Controller()
@ApiTags('Logs')
export class AppController {
  discordClient: Client | undefined = undefined;
  constructor(private readonly appService: AppService) {
    this.discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

    this.discordClient.once(Events.ClientReady, (readyClient) => {
      console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    });

    this.discordClient.login(process.env.BOT_TOKEN);
  }

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

  @Post('anki')
  @ApiExcludeEndpoint()
  @ApiOkResponse({ description: 'Log created' })
  async ankiFinished(@Body() body: AnkiFinishedDto) {
    if (!this.discordClient) return;
    const channel = this.discordClient.channels.cache.get(
      process.env.KANKEN_THREAD as string,
    );

    // If the channel is not found or is not a TextChannel, return
    if (
      !channel ||
      !(channel instanceof TextChannel || channel instanceof ThreadChannel)
    )
      return;

    const message = {
      embeds: [
        {
          title: 'Anki',
          description: `<@${body.userId}> ha completado sus repasos de hoy`,
          footer: {
            text: new Date().toLocaleString(),
          },
          thumbnail: {
            url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Anki-icon.svg/640px-Anki-icon.svg.png',
          },
          fields: [
            {
              name: 'Repasos',
              value: body.reviews.toString(),
            },
            {
              name: 'Cartas nuevas',
              value: body.newCards.toString(),
            },
          ],
          color: 0x57ade8,
        },
      ],
    };

    if (body.allCards && body.studiedCards) {
      message.embeds[0].fields.push({
        name: 'Progreso del mazo',
        value: `${body.studiedCards}/${body.allCards} cartas`,
      });
    }

    // Send embed
    await channel.send(message);
  }

  @Post('calculate-tickets')
  @ApiExcludeEndpoint()
  async calculateTickets(
    @Query('month') month: number,
    @Body() body: CalcTicketsDto,
  ) {
    if (!month) month = new Date().getMonth();

    console.log(month);

    return this.appService.calculateTickets(month, body.results);
  }

  @Post('audiobooksip')
  @ApiExcludeEndpoint()
  async hitogiip(
    @Req() req: Request,
    @Body() body: { key: string; ip: string },
  ) {
    const { ip, key } = body;

    if (key !== process.env.AUDIOBOOKS_IP_KEY) {
      throw new UnauthorizedException('Falta contraseña');
    }

    const needsUpdate = await checkCacheIP(ip);

    if (!needsUpdate) return { msg: 'success' };

    console.log('Updating Cloudflare IP to', ip);

    // If the ip is local ignore it
    if (!ip || ip === '::1' || ip.includes('192.168') || typeof ip !== 'string')
      throw new BadRequestException('No se admiten ips locales');

    return updateCloudflareDNSIP({ subdomain: 'audiobooks.manabe.es', ip });
  }
}
