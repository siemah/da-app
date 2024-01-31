import clientsIPC from './clients';
import notesIPC from './notes';
import prayersNotificationsScheduler from './prayer-notification';

export default function ipcEvents() {
  prayersNotificationsScheduler();
  notesIPC();
  clientsIPC();
}
