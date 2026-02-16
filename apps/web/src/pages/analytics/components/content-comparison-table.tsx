import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCompactNumber } from '@/lib/format-utils';

interface ContentComparisonTableProps {
  data:
    | Array<{
        sourceTitle: string;
        sourcePlatform: string;
        publishedVersions: Array<{
          publishedVideoId: string;
          channelName: string;
          platform: string;
          viewCount: number;
          likeCount: number;
          commentCount: number;
        }>;
      }>
    | undefined;
  isLoading: boolean;
}

export function ContentComparisonTable({ data, isLoading }: ContentComparisonTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No cross-channel content found. Upload the same video to multiple channels to see
        comparisons.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-2 pr-4 font-medium">Source Video</th>
            <th className="pb-2 pr-4 font-medium">Channel</th>
            <th className="pb-2 pr-4 font-medium">Platform</th>
            <th className="pb-2 pr-4 text-right font-medium">Views</th>
            <th className="pb-2 text-right font-medium">Likes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) =>
            item.publishedVersions.map((ver, idx) => (
              <tr key={ver.publishedVideoId} className="border-b last:border-0">
                {idx === 0 && (
                  <td className="py-2 pr-4 font-medium" rowSpan={item.publishedVersions.length}>
                    <div className="flex items-center gap-2">
                      <span className="line-clamp-1">{item.sourceTitle}</span>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {item.sourcePlatform}
                      </Badge>
                    </div>
                  </td>
                )}
                <td className="py-2 pr-4">{ver.channelName}</td>
                <td className="py-2 pr-4">
                  <Badge variant="outline" className="text-xs">
                    {ver.platform}
                  </Badge>
                </td>
                <td className="py-2 pr-4 text-right">{formatCompactNumber(ver.viewCount)}</td>
                <td className="py-2 text-right">{formatCompactNumber(ver.likeCount)}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
