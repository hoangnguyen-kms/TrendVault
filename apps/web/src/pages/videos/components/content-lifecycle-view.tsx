import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@vibe/core';
import { Activity, Download, Upload, Video, MoveArrowRightNarrow } from '@vibe/icons';
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
    icon: Activity,
    iconColor: 'var(--color-working_orange)',
    bgColor: 'var(--color-working_orange-selected)',
  },
  {
    key: 'download',
    label: 'Downloaded',
    icon: Download,
    iconColor: 'var(--primary-color)',
    bgColor: 'var(--primary-selected-color)',
  },
  {
    key: 'upload',
    label: 'Uploaded',
    icon: Upload,
    iconColor: 'var(--color-purple)',
    bgColor: 'var(--color-purple-selected)',
  },
  {
    key: 'published',
    label: 'Published',
    icon: Video,
    iconColor: 'var(--positive-color)',
    bgColor: 'var(--positive-color-selected)',
  },
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
        <CardTitle>
          <span style={{ font: 'var(--font-text1-medium)' }}>Content Lifecycle</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 overflow-x-auto">
          {steps.map((step, i) => {
            const sd = stepData[step.key];
            return (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`min-w-[160px] rounded-lg border p-3 ${sd.exists ? '' : 'border-dashed opacity-50'}`}
                  style={{ borderColor: 'var(--ui-border-color)' }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <div className="rounded p-1" style={{ backgroundColor: step.bgColor }}>
                      <Icon icon={step.icon} iconSize={12} style={{ color: step.iconColor }} />
                    </div>
                    <span
                      style={{
                        font: 'var(--font-text3-medium)',
                        color: 'var(--primary-text-color)',
                      }}
                    >
                      {step.label}
                    </span>
                    {sd.exists && (
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        Done
                      </Badge>
                    )}
                  </div>
                  {sd.lines.map((line, j) => (
                    <p
                      key={j}
                      style={{
                        font: 'var(--font-text3-normal)',
                        color: 'var(--secondary-text-color)',
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
                {i < steps.length - 1 && (
                  <Icon
                    icon={MoveArrowRightNarrow}
                    iconSize={16}
                    className="flex-shrink-0"
                    style={{ color: 'var(--disabled-text-color)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
