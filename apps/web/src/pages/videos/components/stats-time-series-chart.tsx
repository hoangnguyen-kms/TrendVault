import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { formatCompactNumber } from '@/lib/format-utils';

interface StatsTimeSeriesChartProps {
  data:
    | {
        labels: string[];
        views: number[];
        likes: number[];
        comments: number[];
        shares: number[];
      }
    | undefined;
  metric: 'views' | 'likes' | 'comments' | 'all';
  dateRange: string;
}

const COLORS = {
  views: '#3b82f6',
  likes: '#ef4444',
  comments: '#10b981',
  shares: '#f59e0b',
};

export function StatsTimeSeriesChart({ data, metric, dateRange }: StatsTimeSeriesChartProps) {
  if (!data || data.labels.length === 0) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}
      >
        No stats data available for this period.
      </div>
    );
  }

  const fmt = dateRange === '7d' ? 'MMM dd HH:mm' : 'MMM dd';
  const chartData = data.labels.map((label, i) => ({
    date: format(new Date(label), fmt),
    views: data.views[i],
    likes: data.likes[i],
    comments: data.comments[i],
    shares: data.shares[i],
  }));

  const showLine = (key: string) => metric === 'all' || metric === key;

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={12} />
        <YAxis tickFormatter={(v) => formatCompactNumber(v)} fontSize={12} />
        <Tooltip formatter={(v: number | undefined) => formatCompactNumber(v ?? 0)} />
        <Legend />
        {showLine('views') && (
          <Line type="monotone" dataKey="views" stroke={COLORS.views} strokeWidth={2} dot={false} />
        )}
        {showLine('likes') && (
          <Line type="monotone" dataKey="likes" stroke={COLORS.likes} strokeWidth={2} dot={false} />
        )}
        {showLine('comments') && (
          <Line
            type="monotone"
            dataKey="comments"
            stroke={COLORS.comments}
            strokeWidth={2}
            dot={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
