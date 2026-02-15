import {
  TrendingUp,
  Download,
  Upload,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const upcomingFeatures = [
  {
    title: 'Trending',
    description: 'Discover trending videos and analyze viral patterns',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    title: 'Downloads',
    description: 'Download and manage your video collection',
    icon: Download,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    title: 'Uploads',
    description: 'Upload and organize your video content',
    icon: Upload,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    title: 'Analytics',
    description: 'Deep insights and performance metrics',
    icon: BarChart3,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to TrendVault
        </h1>
        <p className="text-lg text-gray-600">
          Your central hub for video content management and analytics
        </p>
      </div>

      <div className="mb-12 rounded-lg border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Getting Started
        </h2>
        <p className="text-gray-600 mb-6">
          TrendVault is currently in development. Explore the upcoming features
          below to see what's coming soon.
        </p>
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <span className="font-medium">Stay tuned for updates</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Upcoming Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`inline-flex rounded-lg p-3 ${feature.bgColor} mb-4`}
                >
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <span>Coming soon</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
