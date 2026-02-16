import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCompactNumber } from '@/lib/format-utils';

interface EngagementChartProps {
  data: Array<{
    id: string;
    title: string;
    viewCount: number;
    likeCount: number;
    publishedAt: string | null;
  }>;
}

export function EngagementChart({ data }: EngagementChartProps) {
  const chartData = data
    .filter((v) => v.publishedAt)
    .sort((a, b) => new Date(a.publishedAt!).getTime() - new Date(b.publishedAt!).getTime())
    .map((v) => ({
      date: new Date(v.publishedAt!).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      views: v.viewCount,
      likes: v.likeCount,
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No video data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis tickFormatter={(v) => formatCompactNumber(v)} fontSize={12} />
            <Tooltip formatter={(v: number | undefined) => formatCompactNumber(v ?? 0)} />
            <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="likes" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
