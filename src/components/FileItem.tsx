import { formatDimensions, getFormatLabel } from "../lib/format";
import { formatBytes, formatSignedPercent } from "../lib/filesize";
import type { ConversionJob } from "../types/image";
import type { AppText } from "../i18n/text";

interface FileItemProps {
  busy: boolean;
  job: ConversionJob;
  statusText: AppText["status"];
  text: AppText["fileItem"];
  onDownload: (jobId: string) => void;
  onRemove: (jobId: string) => void;
}

export function FileItem({
  busy,
  job,
  statusText,
  text,
  onDownload,
  onRemove,
}: FileItemProps) {
  return (
    <li className="panel mb-4 p-2">
      <div className="flex items-stretch gap-4">
        <div className="flex w-24 shrink-0">
          <PreviewCard label={text.preview} src={job.source.previewUrl} text={text} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div>
              <div className="font-bold truncate" title={job.source.name}>
                {job.source.name}
              </div>
              <div className="text-sm">
                {text.status}: {statusText[job.status]}
              </div>
              <div className="text-sm text-(--text-muted)">
                {getFormatLabel(job.source.type)} |{" "}
                {formatBytes(job.source.size)} |{" "}
                {formatDimensions(job.source.width, job.source.height)}
              </div>
            </div>

            <div className="flex gap-2">
              {job.result && (
                <button
                  className="btn"
                  type="button"
                  onClick={() => onDownload(job.id)}
                >
                  {text.download}
                </button>
              )}
              <button
                className="btn btn-danger"
                disabled={busy}
                type="button"
                onClick={() => onRemove(job.id)}
              >
                {text.remove}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <StatBlock label={text.prog} value={`${job.progress}%`} />
            <StatBlock
              label={text.out}
              value={job.result ? formatBytes(job.result.outputSize) : text.wait}
            />
            <StatBlock
              label={text.delta}
              value={
                job.result
                  ? formatSignedPercent(job.result.savingsPercent)
                  : text.wait
              }
            />
          </div>

          {job.result && (
            <div className="panel-inset text-sm mt-2">
              {text.output}:{" "}
              {formatDimensions(
                job.result.outputWidth,
                job.result.outputHeight,
              )}
              .{" "}
              {job.result.savingsBytes >= 0
                ? text.saved(formatBytes(job.result.savingsBytes))
                : text.grewBy(formatBytes(Math.abs(job.result.savingsBytes)))}
            </div>
          )}

          {job.error && (
            <div className="panel-inset bg-red-100 text-red-900 text-sm mt-2 font-bold">
              {job.error}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function PreviewCard({
  label,
  src,
  text,
}: {
  label: string;
  src: string | null;
  text: AppText["fileItem"];
}) {
  return (
    <div className="panel-inset flex h-full min-h-24 w-full flex-col p-1">
      <div className="text-xs font-bold text-center border-b border-(--border-dark) mb-1">
        {label}
      </div>
      <div className="flex-1 bg-gray-200 overflow-hidden flex items-center justify-center">
        {src ? (
          <img
            alt=""
            className="h-full w-full object-contain"
            loading="lazy"
            src={src}
          />
        ) : (
          <span className="text-xs">{text.none}</span>
        )}
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-inset flex flex-col px-1 py-0.5 items-center">
      <div className="text-xs font-bold">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
