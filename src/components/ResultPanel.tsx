import { useObjectUrl } from "../hooks/useObjectUrl";
import type { BatchSummary } from "../hooks/useConverter";
import type { AppText } from "../i18n/text";
import { formatDimensions, getFormatLabel } from "../lib/format";
import { formatBytes, formatSignedPercent } from "../lib/filesize";
import type { ConversionJob } from "../types/image";

interface ResultPanelProps {
  jobs: ConversionJob[];
  summary: BatchSummary;
  text: AppText["resultPanel"];
  onDownload: (jobId: string) => void;
}

export function ResultPanel({ jobs, summary, text, onDownload }: ResultPanelProps) {
  const completedJobs = jobs.filter(
    (job) => job.status === "done" && job.result,
  );

  return (
    <section className="panel">
      <div className="window-title">
        <span>{text.title(completedJobs.length)}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 mb-4">
        <SummaryCard
          label={text.inTotal}
          value={formatBytes(summary.totalInputBytes)}
        />
        <SummaryCard
          label={text.outTotal}
          value={
            summary.completed > 0
              ? formatBytes(summary.totalOutputBytes)
              : text.wait
          }
        />
        <SummaryCard
          label={text.delta}
          value={formatSignedPercent(summary.netSavingsPercent)}
        />
        <SummaryCard
          label={text.saved}
          value={formatBytes(Math.abs(summary.netSavingsBytes))}
        />
      </div>

      {completedJobs.length === 0 ? (
        <div className="panel-inset text-center py-4">
          {text.empty}
        </div>
      ) : (
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {completedJobs.map((job) => (
            <ResultRow key={job.id} job={job} text={text} onDownload={onDownload} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-inset flex justify-between px-2 py-1">
      <div className="font-bold">{label}:</div>
      <div>{value}</div>
    </div>
  );
}

function ResultRow({
  job,
  text,
  onDownload,
}: {
  job: ConversionJob;
  text: AppText["resultPanel"];
  onDownload: (jobId: string) => void;
}) {
  const resultPreviewUrl = useObjectUrl(job.result?.blob ?? null);

  if (!job.result) return null;

  return (
    <li className="panel-inset flex gap-2 items-center p-1">
      <div className="w-12 h-12 shrink-0 bg-gray-200 border border-gray-400 p-0.5">
        {resultPreviewUrl && (
          <img
            alt=""
            className="w-full h-full object-contain"
            src={resultPreviewUrl}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{job.result.fileName}</div>
        <div className="text-xs">
          {getFormatLabel(job.result.outputFormat)} |{" "}
          {formatBytes(job.result.outputSize)} |{" "}
          {formatDimensions(job.result.outputWidth, job.result.outputHeight)}
        </div>
      </div>
      <button
        className="btn text-xs py-1 px-2"
        type="button"
        onClick={() => onDownload(job.id)}
      >
        {text.downloadShort}
      </button>
    </li>
  );
}
