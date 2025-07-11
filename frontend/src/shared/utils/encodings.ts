// CREDIT: https://gist.github.com/jonleighton/958841
// MIT License
export function uint8ToBase64Fast(bytes: Uint8Array) {
  let base64 = ''
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  const byteLength = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength = byteLength - byteRemainder

  let a, b, c, d
  let chunk

  for (let i = 0; i < mainLength; i = i + 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    a = (chunk & 16515072) >> 18
    b = (chunk & 258048) >> 12
    c = (chunk & 4032) >> 6
    d = chunk & 63

    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2

    b = (chunk & 3) << 4

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10
    b = (chunk & 1008) >> 4

    c = (chunk & 15) << 2

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }

  return base64
}

export function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// export function fileToMD5Hash(file: Blob) {
//   const blobSlice = File.prototype.slice,
//     chunkSize = 2097152,
//     chunks = Math.ceil(file.size / chunkSize)
//   let currentChunk = 0
//   const spark = new SparkMD5.ArrayBuffer()
//   const fileReader = new FileReader()

//   fileReader.onload = function (e) {
//     spark.append(e.target!.result as ArrayBuffer)
//     currentChunk++

//     if (currentChunk < chunks) {
//       loadNext()
//     } else {
//       console.info('computed hash', spark.end())
//     }
//   }

//   function loadNext() {
//     const start = currentChunk * chunkSize
//     const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize

//     fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
//   }

//   loadNext()
// }
