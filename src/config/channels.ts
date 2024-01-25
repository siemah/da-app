const CHANNELS = {
  PRAYER_NOTIFICATION: 'prayer_notification',
  CANCEL_NOTIFICATION: 'cancel_notification',
  FETCH_NOTES: 'fetch_notes',
  SAVE_NOTE: 'save_note',
} as const;

type CE = typeof CHANNELS;
export type ChannelEnum = CE[keyof CE];
export default CHANNELS;
