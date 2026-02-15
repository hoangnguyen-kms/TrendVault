export interface VideoStats {
  platformVideoId: string;
  viewCount: bigint;
  likeCount: bigint;
  commentCount: bigint;
  shareCount: bigint;
}

export interface ChannelMetadata {
  name: string;
  avatarUrl: string | null;
  subscriberCount: bigint | null;
  videoCount: number | null;
  viewCount: bigint | null;
}

export interface PlatformVideo {
  platformVideoId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  publishedAt: Date | null;
  tags: string[];
  privacyStatus: string | null;
}

export interface IPlatformStatsFetcher {
  fetchChannelMetadata(accessToken: string, platformChannelId: string): Promise<ChannelMetadata>;
  fetchVideoList(
    accessToken: string,
    platformChannelId: string,
    pageToken?: string,
  ): Promise<{ videos: PlatformVideo[]; nextPageToken?: string }>;
  fetchVideoStats(accessToken: string, platformVideoIds: string[]): Promise<VideoStats[]>;
}
