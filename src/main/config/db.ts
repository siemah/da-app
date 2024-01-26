import { PrismaClient } from '@prisma/client';
import { RESOURCES_PATH } from '../utils';

const prismaDBClient = new PrismaClient({
  datasources: {
    db: {
      url: `file:${RESOURCES_PATH}/data.db`,
    },
  },
});

export default prismaDBClient;
