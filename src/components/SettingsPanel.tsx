import type { ConversionSettings, OutputFormat } from "../types/image";
import {
  OUTPUT_FORMAT_OPTIONS,
  getOutputFormatLabel,
} from "../features/converter/mime-support";
import type { AppText } from "../i18n/text";

interface SettingsPanelProps {
  availableOutputFormats: OutputFormat[];
  disabled: boolean;
  resizeModes: AppText["resizeModes"];
  settings: ConversionSettings;
  text: AppText["settings"];
  onChange: (next: Partial<ConversionSettings>) => void;
}

export function SettingsPanel({
  availableOutputFormats,
  disabled,
  resizeModes,
  settings,
  text,
  onChange,
}: SettingsPanelProps) {
  const qualityDisabled = settings.outputFormat === "image/png";
  const showHeightField =
    settings.resizeMode === "height" || settings.resizeMode === "exact";
  const showWidthField =
    settings.resizeMode === "width" || settings.resizeMode === "exact";

  return (
    <section className="panel">
      <div className="window-title">
        <span>{text.title}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-bold mb-1 block">{text.outputFormat}</label>
          <div className="flex gap-2">
            {OUTPUT_FORMAT_OPTIONS.map((option) => {
              const unavailable = !availableOutputFormats.includes(
                option.value,
              );
              return (
                <button
                  key={option.value}
                  className={`btn flex-1 ${
                    settings.outputFormat === option.value ? "bg-white" : ""
                  }`}
                  disabled={unavailable || disabled}
                  type="button"
                  onClick={() => onChange({ outputFormat: option.value })}
                  style={
                    settings.outputFormat === option.value
                      ? {
                          borderTop: "2px solid var(--border-dark)",
                          borderLeft: "2px solid var(--border-dark)",
                          borderBottom: "2px solid var(--border-light)",
                          borderRight: "2px solid var(--border-light)",
                        }
                      : {}
                  }
                >
                  {getOutputFormatLabel(option.value)}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="font-bold">{text.quality}</label>
            <span>
              {qualityDisabled
                ? text.lossless
                : `${Math.round(settings.quality * 100)}%`}
            </span>
          </div>
          <input
            className="slider"
            disabled={qualityDisabled || disabled}
            max="1"
            min="0.4"
            step="0.05"
            type="range"
            value={settings.quality}
            onChange={(e) =>
              onChange({ quality: Number.parseFloat(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="font-bold mb-1 block">{text.resizeMode}</label>
          <select
            className="input-inset"
            disabled={disabled}
            value={settings.resizeMode}
            onChange={(e) =>
              onChange({
                resizeMode: e.target.value as ConversionSettings["resizeMode"],
              })
            }
          >
            <option value="none">{resizeModes.none}</option>
            <option value="width">{resizeModes.width}</option>
            <option value="height">{resizeModes.height}</option>
            <option value="exact">{resizeModes.exact}</option>
          </select>
        </div>

        {(showWidthField || showHeightField) && (
          <div className="flex gap-2">
            {showWidthField && (
              <div className="flex-1">
                <label className="font-bold mb-1 block">{text.width}</label>
                <input
                  className="input-inset"
                  disabled={disabled}
                  inputMode="numeric"
                  min={1}
                  type="number"
                  value={settings.width ?? ""}
                  onChange={(e) =>
                    onChange({
                      width: toOptionalNumber(e.target.value),
                    })
                  }
                />
              </div>
            )}
            {showHeightField && (
              <div className="flex-1">
                <label className="font-bold mb-1 block">{text.height}</label>
                <input
                  className="input-inset"
                  disabled={disabled}
                  inputMode="numeric"
                  min={1}
                  type="number"
                  value={settings.height ?? ""}
                  onChange={(e) =>
                    onChange({
                      height: toOptionalNumber(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            checked={settings.keepAspectRatio}
            disabled={disabled || settings.resizeMode === "none"}
            type="checkbox"
            id="keepAspect"
            onChange={(e) =>
              onChange({ keepAspectRatio: e.target.checked })
            }
          />
          <label htmlFor="keepAspect" className="font-bold">
            {text.keepAspectRatio}
          </label>
        </div>
      </div>
    </section>
  );
}

function toOptionalNumber(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}
