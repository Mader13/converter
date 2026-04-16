import { useDeferredValue, useEffect, useState } from "react";
import { ActionBar } from "../components/ActionBar";
import { Dropzone } from "../components/Dropzone";
import { FileList } from "../components/FileList";
import { ResultPanel } from "../components/ResultPanel";
import { SettingsPanel } from "../components/SettingsPanel";
import { useConverter } from "../hooks/useConverter";
import { APP_TEXT, type Language } from "../i18n/text";

const LANGUAGE_STORAGE_KEY = "converter-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedLanguage === "ru" ? "ru" : "en";
}

export function App() {
  const {
    jobs,
    settings,
    summary,
    isLoadingFiles,
    isProcessing,
    availableOutputFormats,
    addFiles,
    removeJob,
    clearJobs,
    convertAll,
    downloadResult,
    downloadAllResults,
    updateSettings,
  } = useConverter();

  const [language, setLanguage] = useState<Language>(() => getInitialLanguage());
  const text = APP_TEXT[language];
  const deferredJobs = useDeferredValue(jobs);
  const hasJobs = deferredJobs.length > 0;
  const hasResults = summary.completed > 0;

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <header className="panel mb-4">
        <div className="window-title text-xl py-1 flex items-center justify-between gap-4">
          <span>{text.app.title}</span>
          <div className="language-switch-wrap">
            <span className="text-sm">{text.language.label}</span>
            <div className="language-switch-control">
              <span
                className={`language-switch-label ${
                  language === "en" ? "is-active" : ""
                }`}
              >
                EN
              </span>
              <button
                aria-checked={language === "ru"}
                aria-label={text.language.label}
                className={`language-switch ${language === "ru" ? "is-ru" : ""}`}
                role="switch"
                type="button"
                onClick={() => setLanguage(language === "en" ? "ru" : "en")}
              >
                <span className="language-switch-thumb" />
              </button>
              <span
                className={`language-switch-label ${
                  language === "ru" ? "is-active" : ""
                }`}
              >
                RU
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm font-bold">{text.app.subtitle}</p>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Dropzone
          disabled={isProcessing || isLoadingFiles}
          busy={isLoadingFiles}
          currentCount={jobs.length}
          text={text.dropzone}
          onFilesAccepted={addFiles}
        />
        <SettingsPanel
          availableOutputFormats={availableOutputFormats}
          disabled={isProcessing}
          settings={settings}
          resizeModes={text.resizeModes}
          text={text.settings}
          onChange={updateSettings}
        />
        <ActionBar
          canConvert={hasJobs && !isProcessing}
          canDownloadAll={hasResults && !isProcessing}
          hasJobs={hasJobs}
          isProcessing={isProcessing}
          summary={summary}
          text={text.actionBar}
          onClear={clearJobs}
          onConvert={convertAll}
          onDownloadAll={downloadAllResults}
        />

        <ResultPanel
          jobs={deferredJobs}
          summary={summary}
          text={text.resultPanel}
          onDownload={downloadResult}
        />
        <div className="col-span-2">
          <FileList
            jobs={deferredJobs}
            isProcessing={isProcessing}
            text={text.fileList}
            fileItemText={text.fileItem}
            statusText={text.status}
            onDownload={downloadResult}
            onRemove={removeJob}
          />
        </div>
      </main>
    </div>
  );
}
