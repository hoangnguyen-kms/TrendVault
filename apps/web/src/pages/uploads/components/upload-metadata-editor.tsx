interface UploadMetadataEditorProps {
  uploadAsShort: boolean;
}

/**
 * Displays contextual guidance text for metadata when uploading as a Short.
 * Intended to be rendered beneath the metadata fields in the upload form.
 */
export function UploadMetadataEditor({ uploadAsShort }: UploadMetadataEditorProps) {
  if (!uploadAsShort) return null;

  return (
    <p style={{ font: 'var(--font-text3-normal)', color: 'var(--secondary-text-color)' }}>
      Shorts work best with vertical video (9:16 ratio) under 60 seconds. Title should be concise;
      description limited to 2,200 chars.
    </p>
  );
}
