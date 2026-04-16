import type { ConversionSettings, JobStatus } from "../types/image";

export type Language = "en" | "ru";

type ResizeMode = ConversionSettings["resizeMode"];

export interface AppText {
  actionBar: {
    active: string;
    clearQueue: string;
    convertBatch: string;
    downloadZip: string;
    failed: string;
    processing: string;
    ready: string;
    title: string;
  };
  app: {
    subtitle: string;
    title: string;
  };
  dropzone: {
    browseFiles: string;
    idle: string;
    loaded: (currentCount: number, maxCount: number) => string;
    reading: string;
    title: string;
  };
  fileItem: {
    delta: string;
    download: string;
    grewBy: (size: string) => string;
    none: string;
    out: string;
    output: string;
    preview: string;
    prog: string;
    remove: string;
    saved: (size: string) => string;
    status: string;
    wait: string;
  };
  fileList: {
    queue: (count: number) => string;
  };
  language: {
    label: string;
  };
  resizeModes: Record<ResizeMode, string>;
  resultPanel: {
    delta: string;
    downloadShort: string;
    empty: string;
    inTotal: string;
    outTotal: string;
    saved: string;
    title: (count: number) => string;
    wait: string;
  };
  settings: {
    height: string;
    keepAspectRatio: string;
    lossless: string;
    outputFormat: string;
    quality: string;
    resizeMode: string;
    title: string;
    width: string;
  };
  status: Record<JobStatus, string>;
}

const EN_TEXT: AppText = {
  app: {
    title: "Local Image Converter",
    subtitle: "Client-side PNG/JPEG/WebP.",
  },
  language: {
    label: "Language",
  },
  dropzone: {
    title: "Image Importer",
    reading: "Reading...",
    idle: "Drop images here or click to choose",
    browseFiles: "Browse Files",
    loaded: (currentCount, maxCount) => `${currentCount} / ${maxCount} loaded`,
  },
  fileList: {
    queue: (count) => `Queue [${count}]`,
  },
  fileItem: {
    preview: "Preview",
    status: "Status",
    download: "Download",
    remove: "Remove",
    prog: "Prog",
    out: "Out",
    delta: "Delta",
    wait: "Wait",
    output: "Output",
    saved: (size) => `Saved ${size}`,
    grewBy: (size) => `Grew by ${size}`,
    none: "none",
  },
  settings: {
    title: "Settings",
    outputFormat: "Output Format",
    quality: "Quality",
    lossless: "Lossless",
    resizeMode: "Resize Mode",
    width: "Width",
    height: "Height",
    keepAspectRatio: "Keep Aspect Ratio",
  },
  resizeModes: {
    none: "Original",
    width: "Set Width",
    height: "Set Height",
    exact: "Fit Box",
  },
  actionBar: {
    title: "Batch Actions",
    processing: "Processing...",
    convertBatch: "Convert Batch",
    downloadZip: "Download ZIP",
    clearQueue: "Clear Queue",
    ready: "Ready",
    failed: "Failed",
    active: "Active",
  },
  resultPanel: {
    title: (count) => `Results [${count}]`,
    inTotal: "In Total",
    outTotal: "Out Total",
    delta: "Delta",
    saved: "Saved",
    downloadShort: "Download",
    empty: "Results will appear here.",
    wait: "Wait",
  },
  status: {
    idle: "Idle",
    queued: "Queued",
    processing: "Processing",
    done: "Done",
    error: "Error",
  },
};

const RU_TEXT: AppText = {
  app: {
    title: "Локальный конвертер изображений",
    subtitle: "Конвертер PNG/JPEG/WebP.",
  },
  language: {
    label: "Язык",
  },
  dropzone: {
    title: "Импорт изображений",
    reading: "Чтение...",
    idle: "Перетащите изображения сюда",
    browseFiles: "Выбрать файлы",
    loaded: (currentCount, maxCount) =>
      `Загружено: ${currentCount} / ${maxCount}`,
  },
  fileList: {
    queue: (count) => `Очередь [${count}]`,
  },
  fileItem: {
    preview: "Превью",
    status: "Статус",
    download: "Скачать",
    remove: "Удалить",
    prog: "Прогресс",
    out: "Размер",
    delta: "Изм.",
    wait: "Ожидание",
    output: "Результат",
    saved: (size) => `Сэкономлено ${size}`,
    grewBy: (size) => `Увеличилось на ${size}`,
    none: "нет",
  },
  settings: {
    title: "Настройки",
    outputFormat: "Формат вывода",
    quality: "Качество",
    lossless: "Без потерь",
    resizeMode: "Режим изменения размера",
    width: "Ширина",
    height: "Высота",
    keepAspectRatio: "Сохранять пропорции",
  },
  resizeModes: {
    none: "Оригинал",
    width: "Задать ширину",
    height: "Задать высоту",
    exact: "Задать размер",
  },
  actionBar: {
    title: "Действия",
    processing: "Обработка...",
    convertBatch: "Конвертировать",
    downloadZip: "Скачать ZIP",
    clearQueue: "Очистить очередь",
    ready: "Готово",
    failed: "Ошибки",
    active: "Активно",
  },
  resultPanel: {
    title: (count) => `Результаты [${count}]`,
    inTotal: "Вход",
    outTotal: "Выход",
    delta: "Изменение",
    saved: "Экономия",
    downloadShort: "Скачать",
    empty: "Здесь появятся результаты.",
    wait: "Ожидание",
  },
  status: {
    idle: "Ожидание",
    queued: "В очереди",
    processing: "Обработка",
    done: "Готово",
    error: "Ошибка",
  },
};

export const APP_TEXT: Record<Language, AppText> = {
  en: EN_TEXT,
  ru: RU_TEXT,
};
