/**
 * Normalizes a string by:
 * 1. Converting to lowercase
 * 2. Removing accents (diacritics)
 * 3. Removing special characters and spaces
 */
export const normalizePalavra = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/ç/g, "c") // Handle cedilla specifically if NFD doesn't catch it all
    .replace(/[^a-z0-9]/g, ""); // Remove anything that's not a letter or number
};
