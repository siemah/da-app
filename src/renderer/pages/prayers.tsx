import { GoAlertFill } from 'react-icons/go';
import { useEffect, useState, FormEvent } from 'react';
import Layout from '@/renderer/components/layout';
import usePrayerTimes, {
  PrayerTimeResult,
} from '@/renderer/hook/use-prayer-time';
import CHANNELS from '@/config/channels';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Skeleton } from '../components/ui/skeleton';

export default function Prayers() {
  const [coordinates, setCoordinates] = useState({
    isFectched: true,
    coords: {
      latitude: null,
      longitude: null,
    },
    message: null,
  });
  const [{ loading, data: prayerTimes }] = usePrayerTimes(coordinates.coords);
  const onSwitch = (item: PrayerTimeResult) => (checked: boolean) => {
    const [hh, mm] = item.time.split(':');
    const date = new Date();
    date.setHours(Number(hh));
    date.setMinutes(Number(mm));
    // date.setSeconds(date.getSeconds() + 10);
    const ipcData = {
      date,
      id: item.name,
    };

    if (checked === true) {
      window.electron.ipcRenderer.sendMessage(
        CHANNELS.PRAYER_NOTIFICATION,
        ipcData,
      );
    } else {
      window.electron.ipcRenderer.sendMessage(
        CHANNELS.CANCEL_NOTIFICATION,
        ipcData,
      );
    }
  };
  const renderItems = () => {
    if (loading) {
      return Array(6)
        .fill(null)
        .map((_, index) => (
          <div
            className="flex items-center justify-between space-x-4"
            key={`skeleton-prayer-item-${index.toString(16)}`}
          >
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20 bg-[#be7097]" />
              <Skeleton className="h-6 w-10 bg-[#be7097]" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full bg-[#be7097]" />
          </div>
        ));
    }

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
        <Switch id={`prayer-${item.name}`} onCheckedChange={onSwitch(item)} />
      </li>
    ));
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { latitude, longitude } = event.currentTarget;
    setCoordinates({
      coords: {
        latitude: latitude.value.trim() || 36.143104,
        longitude: longitude.value.trim() || 4.6759936,
      },
      isFectched: true,
      message: null,
    });
  };
  const onClose = () => {
    setCoordinates({
      ...coordinates,
      message: null,
    });
  };

  useEffect(() => {
    async function fetchGeolocation() {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setCoordinates({
            ...coordinates,
            isFectched: true,
            // @ts-ignore
            coords,
          });
        },
        (error) => {
          if (error.PERMISSION_DENIED) {
            setCoordinates({
              ...coordinates,
              // @ts-ignore
              message: `Please allow the app to acces your location`,
            });
          } else if (error.POSITION_UNAVAILABLE) {
            setCoordinates({
              ...coordinates,
              // @ts-ignore
              message: "We can't get your position",
            });
          }
        },
      );
    }
    fetchGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout title="Prayer" className="h-svh py-10 pr-10">
      <div className="flex-1 flex flex-col gap-8">
        <h1 className="text-white text-4xl capitalize font-semibold">
          Prayers
        </h1>
        <ul className="flex-1 flex flex-col gap-4 h-full">{renderItems()}</ul>
        <AlertDialog open={!!coordinates.message}>
          <AlertDialogContent>
            <div className="absolute flex gap-2 top-4 left-4">
              <Button
                className="w-4 p-0 h-4 rounded-full"
                variant="destructive"
                onClick={onClose}
              />
              <Button className="w-4 p-0 h-4 rounded-full bg-slate-300" />
              <Button className="w-4 p-0 h-4 rounded-full bg-slate-300" />
            </div>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <AlertDialogHeader className="flex flex-col gap-10">
                <div className="flex flex-col gap-4 items-center">
                  <GoAlertFill className="h-32 w-32 text-red-500" />
                  <AlertDialogTitle className="text-center">
                    {coordinates?.message}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="max-w-[80%] text-center">
                    {`Please enter your coordinates to use them because we can't fetch them because of some issues:`}
                  </AlertDialogDescription>
                </div>
                <div className="flex flex-row gap-4 w-full">
                  <div className="flex flex-col flex-1 gap-4">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      className="h-8"
                      name="latitude"
                      id="latitude"
                      placeholder="36.143104"
                      type="number"
                      step={0.000001}
                    />
                  </div>
                  <div className="flex flex-col flex-1 gap-4">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      className="h-8"
                      name="longitude"
                      id="longitude"
                      placeholder="4.675993"
                      type="number"
                      step={0.000001}
                    />
                  </div>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="rounded-lg px-14 py-2 h-9 bg-slate-300 focus-visible:ring-slate-500"
                  onClick={onClose}
                >
                  Casncel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  className="rounded-lg px-14 py-2 h-9 bg-blue-500 hover:bg-blue-400 focus-visible:ring-blue-500"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
