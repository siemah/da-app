const CHANNELS = {
  PRAYER_NOTIFICATION: "prayer_notification",
} as const;

type CE = typeof CHANNELS;
export type ChannelEnum = CE[keyof CE];
export default CHANNELS;