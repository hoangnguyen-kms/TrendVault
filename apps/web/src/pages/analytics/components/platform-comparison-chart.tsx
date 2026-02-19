import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCompactNumber } from '@/lib/format-utils';

interface PlatformComparisonChartProps {
  data:
    | {
        platformBreakdown?: Array<{
          platform: string;
          views: number;
          likes: number;
          videos: number;
        }>;
      }
    | undefined;
}

export function PlatformComparisonChart({ data }: PlatformComparisonChartProps) {
  if (!data?.platformBreakdown || data.platformBreakdown.length === 0) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}
      >
        No platform data available.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data.platformBreakdown}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="platform" fontSize={12} />
        <YAxis tickFormatter={(v) => formatCompactNumber(v)} fontSize={12} />
        <Tooltip formatter={(v: number | undefined) => formatCompactNumber(v ?? 0)} />
        <Legend />
        <Bar dataKey="views" fill="#3b82f6" name="Views" />
        <Bar dataKey="likes" fill="#ef4444" name="Likes" />
      </BarChart>
    </ResponsiveContainer>
  );
}
