/**
 * returns extension name from a filename
 * @param name filename
 * @returns extension, with leading period
 */
export function extname(name: string) {
  const match = name.match(/.+(\.[^.]+)$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * narrows the type of a file system entry
 * @param handle file system entry
 * @param handle.isFile anything
 * @returns true if entry is a file
 */
export function isFileEntry(handle: {
  isFile: boolean;
}): handle is FileSystemFileEntry {
  return handle.isFile;
}

/**
 * narrows the type of a file system handle
 * @param handle file system handle
 * @returns true if handle is a dir
 */
export function isDirectoryHandle(
  handle: FileSystemHandle
): handle is FileSystemDirectoryHandle {
  return handle.kind === "directory";
}

/**
 * narrows the type of a file system handle
 * @param handle file system handle
 * @returns true if handle is a dir
 */
export function isDirectoryEntry(
  handle: FileSystemEntry
): handle is FileSystemDirectoryEntry {
  return handle.isDirectory;
}
