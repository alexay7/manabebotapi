import * as fs from 'fs/promises';
import * as path from 'path';

export async function checkCacheIP(ip: string): Promise<boolean> {
  try {
    const data = await fs.readFile(path.join(__dirname, '../../cache.json'));
    const cache = JSON.parse(data.toString());

    // If the ip does not match, replace it
    if (cache.ip !== ip) {
      cache.ip = ip;
      await fs.writeFile(
        path.join(__dirname, '../../cache.json'),
        JSON.stringify(cache),
      );
      // IP modified, needs update
      return true;
    }

    // Same IP, no need to update
    return false;
  } catch (error) {
    // Create the file
    await fs.writeFile(
      path.join(__dirname, '../../cache.json'),
      JSON.stringify({}),
    );

    // IP modified, needs update
    return true;
  }
}
