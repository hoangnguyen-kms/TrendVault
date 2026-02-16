import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Download, Upload, Video, ArrowRight } from 'lucide-react';
import { formatDate, formatCompactNumber } from '@/lib/format-utils';

interface ContentLifecycleViewProps {
  data:
    | {
        trending: {
          id: string;
          platform: string;
          title: string;
          viewCount: number | null;
          region: string;
          fetchedAt: string;
        } | null;
        download: { id: string; status: string; downloadedAt: string | null } | null;
        upload: { id: string; status: string; uploadedAt: string | null } | null;
        published: {
          id: string;
          platform: string;
          title: string;
          viewCount: number | null;
          likeCount: number | null;
          publishedAt: string | null;
        };
      }
    | undefined;
}

const steps = [
  {
    key: 'trending',
    label: 'Trending Source',
    icon: TrendingUp,
    color: 'bg-orange-50 text-orange-700',
  },
  { key: 'download', label: 'Downloaded', icon: Download, color: 'bg-blue-50 text-blue-700' },
  { key: 'upload', label: 'Uploaded', icon: Upload, color: 'bg-purple-50 text-purple-700' },
  { key: 'published', label: 'Published', icon: Video, color: 'bg-green-50 text-green-700' },
] as const;

export function ContentLifecycleView({ data }: ContentLifecycleViewProps) {
  if (!data) return null;

  const stepData: Record<string, { exists: boolean; lines: string[] }> = {
    trending: {
      exists: !!data.trending,
      lines: data.trending
        ? [
            `${data.trending.platform} - ${data.trending.region}`,
            `${formatCompactNumber(data.trending.viewCount)} views`,
            formatDate(data.trending.fetchedAt),
          ]
        : ['No trending source'],
    },
    download: {
      exists: !!data.download,
      lines: data.download
        ? [`Status: ${data.download.status}`, formatDate(data.download.downloadedAt)]
        : ['Direct upload'],
    },
    upload: {
      exists: !!data.upload,
      lines: data.upload
        ? [`Status: ${data.upload.status}`, formatDate(data.upload.uploadedAt)]
        : ['No upload record'],
    },
    published: {
      exists: true,
      lines: [
        data.published.platform,
        `${formatCompactNumber(data.published.viewCount)} views`,
        formatDate(data.published.publishedAt),
      ],
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Content Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 overflow-x-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const sd = stepData[step.key];
            return (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`min-w-[160px] rounded-lg border p-3 ${sd.exists ? '' : 'border-dashed opacity-50'}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className={`rounded p-1 ${step.color}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-medium">{step.label}</span>
                    {sd.exists && (
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        Done
                      </Badge>
                    )}
                  </div>
                  {sd.lines.map((line, j) => (
                    <p key={j} className="text-xs text-gray-500">
                      {line}
                    </p>
                  ))}
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
