export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export const ALLOWED_FILE_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg"] as const;

export const ACCEPTED_FILE_TYPES = ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",");

export const ALLOWED_EXTENSIONS_LABEL = ALLOWED_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(", ");

