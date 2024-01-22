import { ipcMain, Notification } from 'electron';
import { cancelJob, scheduleJob } from 'node-schedule';
import Store from 'electron-store';
import CHANNELS from '../../config/channels';

type IPCPrayerNotificationData = {
  id: string;
  date: Date;
};
const store = new Store();

/**
 * Handle the communication between the ui and the backend
 * to schedule a notification for prayers times
 */
export default function prayersNotificationsScheduler() {
  // schedule job to fire a notification at a given date
  ipcMain.on(
    CHANNELS.PRAYER_NOTIFICATION,
    async (_, { id, date }: IPCPrayerNotificationData) => {
      const job = scheduleJob(date, () => {
        const notification = new Notification({
          title: 'Prayer time',
          body: "It's time for prayer time",
          sound: 'adhan',
        });
        // notification.silent=true;
        notification.show();
      });
      store.set(id, job.name);
    },
  );
  // cancel a job
  ipcMain.on(
    CHANNELS.CANCEL_NOTIFICATION,
    async (_, { id }: IPCPrayerNotificationData) => {
      const jobName = store.get(id) as string;
      cancelJob(jobName);
    },
  );
}
