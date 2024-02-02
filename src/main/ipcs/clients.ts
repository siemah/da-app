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
      const { id, ...data } = newClient;
      const isUpdate = !!id;
      let response;

      try {
        const client = await prisma.clients.upsert({
          create: data,
          update: {
            ...data,
            updatedAt: new Date(),
          },
          where: {
            id: parseInt(`${id}`, 10) || -1,
          },
          select,
        });
        response = {
          data: client,
          isUpdate,
          message:
            isUpdate === true
              ? `Client "${newClient.name}" updated successfully!`
              : `Client "${newClient.name}" created with success!`,
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
  ipcMain.on(CHANNELS.DELETE_CLIENT, async (event, id: number) => {
    let response;

    try {
      const client = await prisma.clients.delete({
        where: {
          id,
        },
      });
      response = {
        message: `Client "${client.name}" removed successfully!`,
        data: client,
      };
    } catch (error) {
      let errorMessage = 'Something went wrong!';

      if (error instanceof PrismaClientValidationError) {
        errorMessage = 'Please select an existing client!';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      response = {
        errors: {
          global: errorMessage,
        },
      };
    }

    event.reply(CHANNELS.DELETE_CLIENT, response);
  });
}
