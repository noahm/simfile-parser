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
