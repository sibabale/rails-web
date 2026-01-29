import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
} from 'recharts';
import { ledgerApi, type LedgerEntry } from '../lib/api';

export interface SettledVolumeBucket {
  hourLabel: string;
  entryCount: number;
  amountSum: number;
}

interface SettledVolumeChartProps {
  session: any;
  range: 'ALL' | '1D' | '1H';
  onStatsChange?: (stats: { totalAmount: number; currency: string; buckets: SettledVolumeBucket[] }) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  const amount = payload[0]?.payload?.amountSum;
  const currency = payload[0]?.payload?.currency || 'USD';
  if (typeof amount !== 'number') return null;
  return (
    <div className="text-[10px] font-mono bg-zinc-800 text-white px-2 py-0.5 rounded">
      {formatCurrency(amount, currency)}
    </div>
  );
};

const SettledVolumeChart: React.FC<SettledVolumeChartProps> = ({ session, range, onStatsChange, onLoadingChange }) => {
  const [buckets, setBuckets] = useState<(SettledVolumeBucket & { currency: string })[]>([]);
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);

  const parseAmount = (value: string | number | undefined) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const normalized = value.replace(/,/g, '');
      return Number(normalized);
    }
    return NaN;
  };

  const buildTimeBuckets = (
    entries: LedgerEntry[],
    now: Date,
    bucketMinutes: number,
    bucketCount: number
  ): SettledVolumeBucket[] => {
    const bucketMs = bucketMinutes * 60 * 1000;
    const endBucket = new Date(now.getTime() - (now.getTime() % bucketMs));
    const result: SettledVolumeBucket[] = [];
    const bucketIndexByTime = new Map<number, number>();

    for (let i = bucketCount - 1; i >= 0; i -= 1) {
      const bucketStart = new Date(endBucket.getTime() - (i * bucketMs));
      const hourLabel = bucketStart.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      bucketIndexByTime.set(bucketStart.getTime(), result.length);
      result.push({ hourLabel, entryCount: 0, amountSum: 0 });
    }

    entries.forEach((entry) => {
      const createdAt = new Date(entry.created_at);
      if (Number.isNaN(createdAt.getTime())) return;
      const bucketStartMs = createdAt.getTime() - (createdAt.getTime() % bucketMs);
      const bucketIndex = bucketIndexByTime.get(bucketStartMs);
      if (bucketIndex === undefined) return;

      const amount = parseAmount(entry.amount);
      if (!Number.isFinite(amount)) return;

      result[bucketIndex].entryCount += 1;
      result[bucketIndex].amountSum += amount;
    });

    return result;
  };

  const buildDailyBuckets = (entries: LedgerEntry[]): SettledVolumeBucket[] => {
    if (entries.length === 0) return [];

    const bucketMap = new Map<string, { entryCount: number; amountSum: number }>();
    let minDate: Date | null = null;
    let maxDate: Date | null = null;
    entries.forEach((entry) => {
      const createdAt = new Date(entry.created_at);
      if (Number.isNaN(createdAt.getTime())) return;
      const dayKey = createdAt.toISOString().slice(0, 10);
      const dayDate = new Date(dayKey);
      if (!minDate || dayDate < minDate) minDate = dayDate;
      if (!maxDate || dayDate > maxDate) maxDate = dayDate;
      const current = bucketMap.get(dayKey) || { entryCount: 0, amountSum: 0 };
      const amount = parseAmount(entry.amount);
      if (!Number.isFinite(amount)) return;
      current.entryCount += 1;
      current.amountSum += amount;
      bucketMap.set(dayKey, current);
    });

    if (!minDate || !maxDate) return [];

    const minSpanDays = 7;
    const totalDays = Math.max(1, Math.round((maxDate.getTime() - minDate.getTime()) / (24 * 60 * 60 * 1000)) + 1);
    const paddedStart = totalDays >= minSpanDays
      ? minDate
      : new Date(maxDate.getTime() - ((minSpanDays - 1) * 24 * 60 * 60 * 1000));

    const buckets: SettledVolumeBucket[] = [];
    for (let i = 0; i < Math.max(totalDays, minSpanDays); i += 1) {
      const day = new Date(paddedStart.getTime() + (i * 24 * 60 * 60 * 1000));
      const key = day.toISOString().slice(0, 10);
      const current = bucketMap.get(key) || { entryCount: 0, amountSum: 0 };
      buckets.push({
        hourLabel: key,
        entryCount: current.entryCount,
        amountSum: current.amountSum,
      });
    }

    return buckets;
  };

  const fetchAllLedgerEntries = async () => {
    const perPage = 100;
    let page = 1;
    let totalPages = 1;
    let allEntries: LedgerEntry[] = [];

    while (page <= totalPages) {
      const response = await ledgerApi.listEntries(session, undefined, page, perPage);
      const entries = response.data || [];
      totalPages = response.pagination?.total_pages ?? page;
      allEntries = allEntries.concat(entries);
      page += 1;
    }

    return allEntries;
  };

  useEffect(() => {
    if (!session) return;
    let isActive = true;
    setIsLoading(true);
    onLoadingChange?.(true);

    const now = new Date();
    const sinceTimestamp = now.getTime() - (24 * 60 * 60 * 1000);

    fetchAllLedgerEntries()
      .then((entries) => {
        if (!isActive) return;
        const chartBuckets = range === 'ALL'
          ? buildDailyBuckets(entries)
          : range === '1H'
          ? buildTimeBuckets(entries.filter((entry) => {
            const createdAt = new Date(entry.created_at).getTime();
            return Number.isFinite(createdAt) && createdAt >= sinceTimestamp;
          }), now, 5, 12)
          : buildTimeBuckets(entries.filter((entry) => {
            const createdAt = new Date(entry.created_at).getTime();
            return Number.isFinite(createdAt) && createdAt >= sinceTimestamp;
          }), now, 60, 24);

        const totalAmount = chartBuckets.reduce((sum, bucket) => sum + bucket.amountSum, 0);
        const nextCurrency = entries.find((entry) => entry.currency)?.currency || 'USD';
        const chartData = chartBuckets.map((bucket) => ({
          ...bucket,
          currency: nextCurrency,
        }));
        setBuckets(chartData);
        setCurrency(nextCurrency);
        onStatsChange?.({ totalAmount, currency: nextCurrency, buckets: chartBuckets });
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
          onLoadingChange?.(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [session, range]);

  const isEmpty = useMemo(
    () => buckets.length === 0 || buckets.every((bucket) => bucket.entryCount === 0),
    [buckets]
  );

  const maxCount = buckets.reduce((max, bucket) => Math.max(max, bucket.entryCount), 0);

  if (isLoading) {
    return (
      <div className="h-24 w-full flex items-end gap-1 px-1" data-testid="settled-volume-chart-loader">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={`loader-${index}`}
            className="flex-1 bg-zinc-200 dark:bg-white/20 rounded-t-sm animate-pulse"
            style={{ height: `${20 + (index % 5) * 12}%` }}
          />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return <div className="h-24 w-full" data-testid="settled-volume-chart-empty" />;
  }

  return (
    <div className="h-24 w-full" data-testid="settled-volume-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="hourLabel" hide />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="entryCount"
            radius={[3, 3, 0, 0]}
            className="fill-zinc-200 dark:fill-white/20 hover:fill-zinc-400 dark:hover:fill-white"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SettledVolumeChart;
