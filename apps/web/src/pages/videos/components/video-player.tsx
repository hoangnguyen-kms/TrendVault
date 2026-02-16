interface VideoPlayerProps {
  src?: string | null;
  title?: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  if (!src) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
        <p className="text-sm text-gray-400">Video preview not available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-black">
      <video controls className="aspect-video w-full" title={title} preload="metadata">
        <source src={src} type="video/mp4" />
        Your browser does not support the video element.
      </video>
    </div>
  );
}
