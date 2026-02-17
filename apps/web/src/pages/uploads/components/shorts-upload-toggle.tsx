import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ShortsUploadToggleProps {
  sourceIsShort: boolean;
  sourceAspectRatio: number | null;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ShortsUploadToggle({
  sourceIsShort: _sourceIsShort,
  sourceAspectRatio,
  value,
  onChange,
}: ShortsUploadToggleProps) {
  const isVertical = sourceAspectRatio !== null ? sourceAspectRatio < 0.7 : false;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Switch checked={value} onCheckedChange={onChange} id="upload-as-short" />
        <Label htmlFor="upload-as-short">Upload as Short</Label>
      </div>
      {value && !isVertical && (
        <p className="text-sm text-yellow-600">
          Source video may not be vertical (9:16). YouTube may not classify as Short.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Sets category and adds #Shorts tag. YouTube auto-detects from aspect ratio + duration.
      </p>
    </div>
  );
}
