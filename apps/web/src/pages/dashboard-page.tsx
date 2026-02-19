import { Icon } from '@vibe/core';
import { Activity, Download, Upload, Chart, MoveArrowRightNarrow } from '@vibe/icons';

const upcomingFeatures = [
  {
    title: 'Trending',
    description: 'Discover trending videos and analyze viral patterns',
    icon: Activity,
    iconColor: 'var(--color-working_orange)',
    bgColor: 'var(--color-working_orange-selected)',
  },
  {
    title: 'Downloads',
    description: 'Download and manage your video collection',
    icon: Download,
    iconColor: 'var(--positive-color)',
    bgColor: 'var(--positive-color-selected)',
  },
  {
    title: 'Uploads',
    description: 'Upload and organize your video content',
    icon: Upload,
    iconColor: 'var(--primary-color)',
    bgColor: 'var(--primary-selected-color)',
  },
  {
    title: 'Analytics',
    description: 'Deep insights and performance metrics',
    icon: Chart,
    iconColor: 'var(--color-purple)',
    bgColor: 'var(--color-purple-selected)',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1
          className="mb-2"
          style={{ font: 'var(--font-h1-bold)', color: 'var(--primary-text-color)' }}
        >
          Welcome to TrendVault
        </h1>
        <p style={{ font: 'var(--font-text1-normal)', color: 'var(--secondary-text-color)' }}>
          Your central hub for video content management and analytics
        </p>
      </div>

      <div
        className="mb-12 rounded-lg border p-8"
        style={{
          backgroundColor: 'var(--primary-background-color)',
          borderColor: 'var(--ui-border-color)',
          boxShadow: 'var(--box-shadow-xs)',
        }}
      >
        <h2
          className="mb-4"
          style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}
        >
          Getting Started
        </h2>
        <p
          className="mb-6"
          style={{ font: 'var(--font-text1-normal)', color: 'var(--secondary-text-color)' }}
        >
          TrendVault is currently in development. Explore the upcoming features below to see what's
          coming soon.
        </p>
        <div className="flex items-center gap-2">
          <span style={{ font: 'var(--font-text2-medium)', color: 'var(--primary-color)' }}>
            Stay tuned for updates
          </span>
          <Icon
            icon={MoveArrowRightNarrow}
            iconSize={16}
            style={{ color: 'var(--primary-color)' }}
          />
        </div>
      </div>

      <div>
        <h2
          className="mb-6"
          style={{ font: 'var(--font-h3-bold)', color: 'var(--primary-text-color)' }}
        >
          Upcoming Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border p-6 transition-shadow"
              style={{
                backgroundColor: 'var(--primary-background-color)',
                borderColor: 'var(--ui-border-color)',
                boxShadow: 'var(--box-shadow-xs)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--box-shadow-small)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--box-shadow-xs)';
              }}
            >
              <div
                className="inline-flex rounded-lg p-3 mb-4"
                style={{ backgroundColor: feature.bgColor }}
              >
                <Icon icon={feature.icon} iconSize={24} style={{ color: feature.iconColor }} />
              </div>
              <h3
                className="mb-2"
                style={{ font: 'var(--font-text1-bold)', color: 'var(--primary-text-color)' }}
              >
                {feature.title}
              </h3>
              <p
                className="mb-4"
                style={{ font: 'var(--font-text2-normal)', color: 'var(--secondary-text-color)' }}
              >
                {feature.description}
              </p>
              <div className="flex items-center gap-1">
                <span
                  style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}
                >
                  Coming soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
