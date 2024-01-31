import { ipcMain } from 'electron';
import CHANNELS from '../../config/channels';
import prisma from '../config/db';

export default function clientsIPC() {
  ipcMain.on(CHANNELS.FETCH_CLIENTS, async (event) => {
    let response;
    try {
      const clients = await prisma.clients.findMany({
        select: {
          id: true,
          name: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      response = {
        data: clients,
      };
    } catch (error) {
      response = {
        errors: {
          global:
            error instanceof Error ? error.message : 'Something went wrong!',
        },
      };
    }
    event.reply(CHANNELS.FETCH_CLIENTS, response);
  });
}
