interface VideoPlayerProps {
  src?: string | null;
  title?: string;
}

export function VideoPlayer({ src, title }: VideoPlayerProps) {
  if (!src) {
    return (
      <div
        className="flex aspect-video items-center justify-center rounded-lg"
        style={{ backgroundColor: 'var(--allgrey-background-color)' }}
      >
        <p style={{ font: 'var(--font-text2-normal)', color: 'var(--disabled-text-color)' }}>
          Video preview not available
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg" style={{ backgroundColor: '#000' }}>
      <video controls className="aspect-video w-full" title={title} preload="metadata">
        <source src={src} type="video/mp4" />
        Your browser does not support the video element.
      </video>
    </div>
  );
}
