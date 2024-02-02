import { ipcMain } from 'electron';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import CHANNELS from '../../config/channels';
import prisma from '../config/db';
import { Client } from '../../types/data';

const select = {
  id: true,
  name: true,
  email: true,
  phone_number: true,
  updatedAt: true,
};
export default function clientsIPC() {
  ipcMain.on(CHANNELS.FETCH_CLIENTS, async (event) => {
    let response;
    try {
      const clients = await prisma.clients.findMany({
        select,
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
  ipcMain.on(
    CHANNELS.SAVE_CLIENT,
    async (event, newClient: Omit<Client, 'id'> & Partial<Client>) => {
      let response;

      try {
        const client = await prisma.clients.create({
          data: newClient,
          select,
        });
        response = {
          data: client,
          message: `Client ${newClient.name} created with success!`,
        };
      } catch (error) {
        let errorMessage = 'Something went wrong!';

        if (error instanceof PrismaClientValidationError) {
          errorMessage = 'Please enter a valid data';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        response = {
          errors: {
            global: errorMessage,
          },
        };
      }

      event.reply(CHANNELS.SAVE_CLIENT, response);
    },
  );
}
