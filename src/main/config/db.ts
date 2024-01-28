import { app } from 'electron';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { RESOURCES_PATH } from '../utils';

const platformToExecutables = {
  win32: {
    migrationEngine:
      'node_modules/@prisma/engines/migration-engine-windows.exe',
    queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
  },
  linux: {
    migrationEngine:
      'node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x',
    queryEngine:
      'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node',
  },
  darwin: {
    migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin',
    queryEngine:
      'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node',
  },
};
export const qePath = path.join(
  app.getAppPath().replace('app.asar', ''),
  // @ts-expect-error
  platformToExecutables[process.platform]?.queryEngine,
);
const prismaDBClient = new PrismaClient({
  // @ts-ignore
  __internal: {
    engine: {
      binaryPath: qePath,
    },
  },
  datasources: {
    db: {
      url: `file:${RESOURCES_PATH}/data.db`,
    },
  },
});

export default prismaDBClient;
