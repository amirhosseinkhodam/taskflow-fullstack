import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function buildDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const host = process.env.PGHOST ?? 'localhost';
  const port = process.env.PGPORT ?? '5432';
  const user = process.env.PGUSER ?? 'postgres';
  const password = process.env.PGPASSWORD ?? 'postgres';
  const database = process.env.PGDATABASE ?? 'taskflow';
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ datasourceUrl: buildDatabaseUrl() });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
