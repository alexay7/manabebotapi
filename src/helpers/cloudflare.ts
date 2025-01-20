import { InternalServerErrorException } from '@nestjs/common';
import Cloudflare from 'cloudflare';

export async function updateCloudflareDNSIP({
  subdomain,
  ip,
}: {
  subdomain: string;
  ip: string;
}) {
  const cf = new Cloudflare({
    apiToken: process.env.CLOUDFLARE_TOKEN,
  });
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!zoneId) {
    throw new InternalServerErrorException('Falta id de zona');
  }

  const dnsRecords = await cf.dns.records.list({ zone_id: zoneId });

  const record = dnsRecords.result.find((record) => record.name === subdomain);

  if (!record) {
    // Create the record
    await cf.dns.records.create({
      type: 'A',
      name: subdomain,
      content: ip,
      ttl: 1,
      zone_id: zoneId,
    });

    return { msg: 'success' };
  }

  // Update the record
  await cf.dns.records.edit(record.id, {
    type: 'A',
    name: subdomain,
    content: ip,
    ttl: 1,
    zone_id: zoneId,
  });

  return { msg: 'success' };
}
