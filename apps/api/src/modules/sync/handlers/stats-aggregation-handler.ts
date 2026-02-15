import { prisma } from '../../../lib/prisma-client.js';

const AGGREGATION_THRESHOLD_DAYS = 90;

export async function handleStatsAggregation(): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - AGGREGATION_THRESHOLD_DAYS);

  console.log(`[sync:stats-aggregation] Aggregating snapshots older than ${cutoffDate.toISOString()}`);

  // Find daily snapshots older than threshold that haven't been aggregated
  const oldSnapshots = await prisma.videoStatsSnapshot.findMany({
    where: {
      snapshotAt: { lt: cutoffDate },
      isWeeklySummary: false,
    },
    orderBy: { snapshotAt: 'asc' },
  });

  if (oldSnapshots.length === 0) {
    console.log('[sync:stats-aggregation] No snapshots to aggregate');
    return;
  }

  // Group by publishedVideoId + ISO week
  const groups = new Map<string, typeof oldSnapshots>();
  for (const snap of oldSnapshots) {
    const weekStart = getISOWeekStart(snap.snapshotAt);
    const key = `${snap.publishedVideoId}:${weekStart.toISOString()}`;
    const group = groups.get(key) ?? [];
    group.push(snap);
    groups.set(key, group);
  }

  let aggregated = 0;
  let deleted = 0;

  for (const [key, snapshots] of groups) {
    if (snapshots.length <= 1) continue; // Skip single-snapshot weeks

    const [videoId, weekStartStr] = key.split(':');
    const weekStart = new Date(weekStartStr);

    // Calculate averages
    const avgViews = avgBigInt(snapshots.map((s) => s.viewCount));
    const avgLikes = avgBigInt(snapshots.map((s) => s.likeCount));
    const avgComments = avgBigInt(snapshots.map((s) => s.commentCount));
    const avgShares = avgBigInt(snapshots.map((s) => s.shareCount));
    const avgEngagement = snapshots.reduce((sum, s) => sum + (s.engagementRate ?? 0), 0) / snapshots.length;

    // Insert weekly summary
    await prisma.videoStatsSnapshot.create({
      data: {
        publishedVideoId: videoId,
        viewCount: avgViews,
        likeCount: avgLikes,
        commentCount: avgComments,
        shareCount: avgShares,
        engagementRate: avgEngagement,
        isWeeklySummary: true,
        snapshotAt: weekStart,
      },
    });
    aggregated++;

    // Delete the original daily snapshots
    const ids = snapshots.map((s) => s.id);
    await prisma.videoStatsSnapshot.deleteMany({ where: { id: { in: ids } } });
    deleted += ids.length;
  }

  console.log(`[sync:stats-aggregation] Created ${aggregated} weekly summaries, deleted ${deleted} daily snapshots`);
}

function getISOWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function avgBigInt(values: bigint[]): bigint {
  if (values.length === 0) return 0n;
  const sum = values.reduce((a, b) => a + b, 0n);
  return sum / BigInt(values.length);
}
