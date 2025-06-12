import cyrTransformer from 'cyrillic-to-translit-js'

/**
 * Normalizes input string for use in filename
 * @param inString Any string needed to be used as filename for .zip archive
 */
export function nmZipFilename(inString: string): string {
  if (inString.endsWith('.zip')) inString = inString.slice(0, -4)
  const sanitizedString = inString.replaceAll(/[^a-zA-Z0-9а-яА-Я_ ]/g, '')
  const baseName = cyrTransformer().transform(sanitizedString, '_').toLowerCase()
  return baseName ? baseName + '.zip' : ''
}
