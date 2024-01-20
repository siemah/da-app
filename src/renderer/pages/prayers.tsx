import Layout from '@/renderer/components/layout';
import usePrayerTimes, {
  PrayerTimeResult,
} from '@/renderer/hook/use-prayer-time';
import CHANNELS from '@/config/channels';

export default function Prayers() {
  const [{ loading, data: prayerTimes }] = usePrayerTimes({
    latitude: 36.143104,
    longitude: 4.6759936,
  });
  const renderItems = () => {
    if (loading) {
      return (
        <span className="flex h-full items-center justify-center text-2xl text-white">
          Loading...
        </span>
      );
    }

    const onSwitch = (item: PrayerTimeResult) => () => {
      const [hh, mm] = item.time.split(':');
      const date = new Date();
      date.setHours(Number(hh));
      date.setMinutes(Number(mm));
      date.setSeconds(date.getSeconds() + 10);
      window.electron.ipcRenderer.sendMessage(
        CHANNELS.PRAYER_NOTIFICATION,
        date,
      );
    };
    return prayerTimes?.map((item) => (
      <li
        className="flex justify-between items-center text-white"
        key={`prayer-item-${item.name}`}
      >
        <div className="flex-1">
          <span className="font-semibold capitalize">{item.name}</span>
          {`: `}
          {item.time}
        </div>
        <button
          type="button"
          aria-label="switch"
          onClick={onSwitch(item)}
          className="h-10 w-10 bg-indigo-950"
        />
      </li>
    ));
  };

  return (
    <Layout title="Prayer" className="h-svh">
      <div className="flex-1">
        <h1 className="text-white text-4xl uppercase font-semibold">Prayers</h1>
        <ul className="flex-1 flex flex-col gap-4 h-full">{renderItems()}</ul>
      </div>
    </Layout>
  );
}
