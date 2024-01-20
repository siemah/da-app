import { useQuery } from 'react-query';
import { useEffect } from 'react';
import httpRequest from '@/renderer/lib/http';

type UsePrayerTimes = {
  latitude: number;
  longitude: number;
};

export type PrayerTimeResult = {
  name: string;
  time: `${number}:${number}`;
};

/**
 * Get prayer times of the day
 * @param config user gps coordinate
 * @returns prayer times of the current day
 * @see http://islamicfinder.us/index.php/api/index
 * @xample http://islamicfinder.us/index.php/api/prayer_times?latitude=36.410172&longitude=4.894720&timezone=Africa/Algiers&method=5&juristic=Maliki&time_format=0
 */
function getPrayerTimes(config: UsePrayerTimes) {
  return async () => {
    const prayerTimesUrl = 'https://dachu-app-api.zzenz.workers.dev';
    const response = await httpRequest<PrayerTimeResult[]>({
      url: `${prayerTimesUrl}/prayer?latitude=${config?.latitude}&longitude=${config?.longitude}`,
    });

    return response;
  };
}

export default function usePrayerTimes(config: UsePrayerTimes) {
  const query = useQuery<any, unknown, PrayerTimeResult[]>({
    queryKey: `prayer-times`,
    queryFn: getPrayerTimes(config),
    enabled: false,
  });
  const data = query.data ?? [];

  useEffect(() => {
    if (config?.latitude !== undefined && config?.longitude !== undefined) {
      query.refetch({
        queryKey: `prayer-times`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.latitude, config.longitude]);

  return [
    {
      loading: query.isFetching,
      data,
    },
    query,
  ] as const;
}
