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
      <p
        className="py-6 text-center"
        style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}
      >
        No cross-channel content found. Upload the same video to multiple channels to see
        comparisons.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ font: 'var(--font-text2-normal)' }}>
        <thead>
          <tr
            style={{
              borderBottom: '1px solid var(--ui-border-color)',
              color: 'var(--secondary-text-color)',
              textAlign: 'left',
            }}
          >
            <th className="pb-2 pr-4" style={{ font: 'var(--font-text2-medium)' }}>
              Source Video
            </th>
            <th className="pb-2 pr-4" style={{ font: 'var(--font-text2-medium)' }}>
              Channel
            </th>
            <th className="pb-2 pr-4" style={{ font: 'var(--font-text2-medium)' }}>
              Platform
            </th>
            <th className="pb-2 pr-4 text-right" style={{ font: 'var(--font-text2-medium)' }}>
              Views
            </th>
            <th className="pb-2 text-right" style={{ font: 'var(--font-text2-medium)' }}>
              Likes
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) =>
            item.publishedVersions.map((ver, idx) => (
              <tr
                key={ver.publishedVideoId}
                style={{
                  borderBottom:
                    idx < item.publishedVersions.length - 1
                      ? '1px solid var(--ui-border-color)'
                      : undefined,
                }}
              >
                {idx === 0 && (
                  <td
                    className="py-2 pr-4"
                    style={{ font: 'var(--font-text2-medium)' }}
                    rowSpan={item.publishedVersions.length}
                  >
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
