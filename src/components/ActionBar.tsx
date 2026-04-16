import type { BatchSummary } from "../hooks/useConverter";
import type { AppText } from "../i18n/text";

interface ActionBarProps {
  canConvert: boolean;
  canDownloadAll: boolean;
  hasJobs: boolean;
  isProcessing: boolean;
  summary: BatchSummary;
  text: AppText["actionBar"];
  onClear: () => void;
  onConvert: () => void;
  onDownloadAll: () => void;
}

export function ActionBar({
  canConvert,
  canDownloadAll,
  hasJobs,
  isProcessing,
  summary,
  text,
  onClear,
  onConvert,
  onDownloadAll,
}: ActionBarProps) {
  return (
    <section className="panel">
      <div className="window-title">
        <span>{text.title}</span>
      </div>
      <div className="grid gap-2">
        <button
          className="btn btn-success w-full py-2 text-lg"
          disabled={!canConvert}
          type="button"
          onClick={onConvert}
        >
          {isProcessing ? text.processing : text.convertBatch}
        </button>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            className="btn w-full"
            disabled={!canDownloadAll}
            type="button"
            onClick={onDownloadAll}
          >
            {text.downloadZip}
          </button>
          <button
            className="btn w-full"
            disabled={!hasJobs || isProcessing}
            type="button"
            onClick={onClear}
          >
            {text.clearQueue}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label={text.ready} value={`${summary.completed}`} />
        <Metric label={text.failed} value={`${summary.failed}`} />
        <Metric label={text.active} value={`${summary.processing}`} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel-inset flex flex-col items-center">
      <div className="text-xs font-bold mb-1">{label}</div>
      <div className="text-lg">{value}</div>
    </div>
  );
}
