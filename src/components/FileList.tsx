import type { ConversionJob } from "../types/image";
import type { AppText } from "../i18n/text";
import { FileItem } from "./FileItem";

interface FileListProps {
  fileItemText: AppText["fileItem"];
  isProcessing: boolean;
  jobs: ConversionJob[];
  statusText: AppText["status"];
  text: AppText["fileList"];
  onDownload: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}

export function FileList({
  fileItemText,
  isProcessing,
  jobs,
  statusText,
  text,
  onDownload,
  onRemove,
}: FileListProps) {
  if (jobs.length === 0) return null;

  return (
    <section>
      <div className="window-title mb-2">
        <span>{text.queue(jobs.length)}</span>
      </div>
      <ul>
        {jobs.map((job) => (
          <FileItem
            key={job.id}
            busy={isProcessing}
            job={job}
            statusText={statusText}
            text={fileItemText}
            onDownload={onDownload}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </section>
  );
}
