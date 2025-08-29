function transformCyrillic(input: string): string {
  const letters = {
    а: 'a',
    б: 'b',
    в: 'v',
    д: 'd',
    з: 'z',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    ь: '',

    г: 'g',
    и: 'i',
    ъ: '',
    ы: 'i',
    э: 'e',

    ё: 'yo',
    ж: 'zh',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ю: 'yu',
    я: 'ya',
    е: 'ye'
  }

  const nonFirstLetters = Object.assign({}, letters, { й: 'i' }, { е: 'e' })

  let output = ''
  let isWordBoundary = false
  for (let i = 0; i < input.length; i++) {
    let char = input[i]
    const isUppercase = char === char.toUpperCase()
    char = char.toLowerCase()

    if (char === ' ') {
      output += '_'
      isWordBoundary = true
      continue
    }

    let newLetter: string | undefined

    if (i === 0 || isWordBoundary) {
      newLetter = letters[char]
      isWordBoundary = false
    } else {
      newLetter = nonFirstLetters[char]
    }

    if (newLetter === undefined) {
      output += input[i]
    } else {
      if (isUppercase) {
        output +=
          newLetter.length > 1
            ? newLetter[0].toUpperCase() + newLetter.slice(1)
            : newLetter.toUpperCase()
      } else {
        output += newLetter
      }
    }
  }

  return output
}

/**
 * Normalizes input string for use in filename
 * @param inString Any string needed to be used as filename for .zip archive
 */
export function nmZipFilename(input: string): string {
  if (input.endsWith('.zip')) input = input.slice(0, -4)
  input = input
    .normalize()
    .replaceAll(/[^a-zA-Z0-9а-яА-Я_ ]/g, '')
    .toLowerCase()
  input = transformCyrillic(input)
  return input && input + '.zip'
}
