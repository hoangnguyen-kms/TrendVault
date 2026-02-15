import { prisma } from '../../../lib/prisma-client.js';

export async function handlePartitionManagement(): Promise<void> {
  // Create partitions for next 2 months (safety margin)
  const now = new Date();

  for (let offset = 1; offset <= 2; offset++) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const nextMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1);

    const year = targetMonth.getFullYear();
    const month = String(targetMonth.getMonth() + 1).padStart(2, '0');
    const partitionName = `video_stats_snapshots_${year}${month}`;
    const fromDate = targetMonth.toISOString().split('T')[0];
    const toDate = nextMonth.toISOString().split('T')[0];

    try {
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "${partitionName}"
         PARTITION OF "video_stats_snapshots"
         FOR VALUES FROM ('${fromDate}') TO ('${toDate}')`,
      );
      console.log(`[sync:partition] Created/verified partition: ${partitionName}`);
    } catch (err) {
      // Partition may already exist or table is not partitioned yet
      console.warn(`[sync:partition] Could not create ${partitionName}:`, err);
    }
  }
}
