import { nanoid } from 'nanoid'

export function normalizeFileFilename(file: File): File {
  const normalizedFilename = normalizeFilename(file.name)
  if(file.name !== normalizedFilename) {
    return new File([file], normalizedFilename, { type: file.type })
  } else {
    return file
  }
}

export function normalizeFilename(filename: string): string {
  const diactricSignsRegex = '\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f' //'À-ÖØ-öø-įĴ-őŔ-žǍ-ǰǴ-ǵǸ-țȞ-ȟȤ-ȳɃɆ-ɏḀ-ẞƀ-ƓƗ-ƚƝ-ơƤ-ƥƫ-ưƲ-ƶẠ-ỿ'
  filename = filename.replaceAll(new RegExp(`[^A-zА-яёЁ0-9_\\. ()${diactricSignsRegex}]`,'gu'), '')
  filename = filename || 'File'
  return filename
}

export function getRandomFileName(ext?: string) {
  return nanoid(16) + (ext ? `.${ext}` : '')
}