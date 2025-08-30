import ImageCompressor from 'compressorjs'

function isCanvasExtractionAllowed() {
  return document
    .createElement('canvas')
    .getContext('2d')
    ?.getImageData(0, 0, 1, 1)
    .data.every((v) => v === 0)
}

export async function compressImage(input: Blob) {
  try {
    const output = await new Promise<Blob>((resolve, reject) => {
      if (!isCanvasExtractionAllowed()) {
        return reject(new Error('Canvas extraction is blocked'))
      }
      new ImageCompressor(input, {
        quality: 0.5,
        success: (file) => {
          if (file.size < input.size) {
            resolve(file)
          } else {
            reject(new Error(`Could not make image size smaller (${input.size} -> ${file.size})`))
          }
        },
        error: reject
      })
    })
    return output
  } catch (e) {
    console.error(e)
    return null
  }
}
