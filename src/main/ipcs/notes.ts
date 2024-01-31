import { ipcMain } from 'electron';
import { Note } from '@/types/data';
import CHANNELS from '../../config/channels';
import prisma from '../config/db';

export default function notesIPC() {
  ipcMain.on(CHANNELS.FETCH_NOTES, async (event) => {
    const notes = await prisma.notes.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    event.reply(CHANNELS.FETCH_NOTES, notes);
  });
  ipcMain.on(
    CHANNELS.SAVE_NOTE,
    async (event, noteData: Omit<Note, 'id'> & Partial<Note>) => {
      const data = {
        title: noteData.title,
        content: noteData.content,
      };
      const note = await prisma.notes.upsert({
        create: data,
        update: {
          ...data,
          updatedAt: new Date(),
        },
        where: {
          id: noteData.id || -1,
        },
        select: {
          id: true,
          title: true,
          content: true,
          updatedAt: true,
        },
      });
      event.reply(CHANNELS.SAVE_NOTE, {
        message:
          noteData.id !== null
            ? 'Note updated with success'
            : 'Note created with success',
        data: note,
        isUpdate: !!noteData.id,
      });
    },
  );
  ipcMain.on(CHANNELS.DELETE_NOTE, async (event, noteId: number) => {
    const note = await prisma.notes.delete({
      where: {
        id: noteId,
      },
    });
    event.reply(CHANNELS.DELETE_NOTE, {
      message: 'Note deleted with success',
      data: note,
    });
  });
}
