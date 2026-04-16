import { useDropzone } from "react-dropzone";
import { APP_LIMITS } from "../features/converter/constants";
import type { AppText } from "../i18n/text";
import { ACCEPTED_FILE_MAP } from "../features/converter/mime-support";

interface DropzoneProps {
  busy: boolean;
  currentCount: number;
  disabled: boolean;
  text: AppText["dropzone"];
  onFilesAccepted: (files: File[]) => void;
}

export function Dropzone({
  busy,
  currentCount,
  disabled,
  text,
  onFilesAccepted,
}: DropzoneProps) {
  const { getInputProps, getRootProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_FILE_MAP,
    disabled,
    multiple: true,
    noClick: true,
    onDrop: onFilesAccepted,
  });

  return (
    <section className="panel">
      <div className="window-title">
        <span>{text.title}</span>
      </div>
      <div
        {...getRootProps()}
        className={`panel-inset text-center py-8 h-[248px] ${
          disabled ? "opacity-50" : isDragActive ? "bg-blue-100" : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="font-bold mb-4 text-lg">
          {busy ? text.reading : text.idle}
        </div>
        <button
          className="btn"
          disabled={disabled}
          type="button"
          onClick={open}
        >
          {text.browseFiles}
        </button>
        <div className="mt-4 text-sm text-(--text-muted)">
          {text.loaded(currentCount, APP_LIMITS.maxBatchFiles)}
        </div>
      </div>
    </section>
  );
}
