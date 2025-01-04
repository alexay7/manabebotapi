import { Medio } from 'src/dto/searchlog.dto';

export function normalizeMedia(
  media: keyof typeof Medio,
): 'anime' | 'manga' | 'novel' | 'vn' | 'live' | undefined {
  switch (media) {
    case 'ANIME':
      return 'anime';
    case 'MANGA':
      return 'manga';
    case 'LECTURA':
    case 'TIEMPOLECTURA':
    case 'LIBRO':
      return 'novel';
    case 'VN':
      return 'vn';
    case 'VIDEO':
    case 'AUDIO':
      return 'live';
    default:
      return undefined;
  }
}
