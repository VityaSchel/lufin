export function uint8toHex(uint8: Uint8Array): string {
  return Array.from(uint8)
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
}

// Comparison using console.time:
// uint8ToBase64Fast  0.01318359375 ms
// uint8ToBase64      0.37109375 ms
// uint8ToBase64Fast is 28x-60x times faster
export async function uint8ToBase64(uint8: Uint8Array) {
  const base64url = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(new Blob([uint8]))
  })

  return base64url.substring(base64url.indexOf(',')+1)
}

// CREDIT: https://gist.github.com/jonleighton/958841
// MIT License
export function uint8ToBase64Fast(bytes: Uint8Array) {
  let base64    = ''
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  const byteLength    = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength    = byteLength - byteRemainder

  let a, b, c, d
  let chunk

  for (let i = 0; i < mainLength; i = i + 3) {
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    a = (chunk & 16515072) >> 18
    b = (chunk & 258048)   >> 12
    c = (chunk & 4032)     >>  6
    d = chunk & 63              

    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2

    b = (chunk & 3)   << 4

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10
    b = (chunk & 1008)  >>  4

    c = (chunk & 15)    <<  2

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  
  return base64
}

export function stringToBase64(text: string) {
  const bytes = new TextEncoder().encode(text)
  const binString = Array.from(bytes, x => String.fromCodePoint(x)).join('')
  return btoa(binString)
}

export function base64ToString(base64: string) {
  const binString = atob(base64)
  const data = Uint8Array.from(binString, m => m.codePointAt(0) as number)
  new TextDecoder().decode(data)
}

// export async function base64toUint8(base64: string):  {
//   await (await fetch("data:application/octet;base64," + base64data)).arrayBuffer()
// }

export function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

function b64ToUint6(nChr: number) {
  return nChr > 64 && nChr < 91
    ? nChr - 65
    : nChr > 96 && nChr < 123
      ? nChr - 71
      : nChr > 47 && nChr < 58
        ? nChr + 4
        : nChr === 43
          ? 62
          : nChr === 47
            ? 63
            : 0
}

export function base64toUint8(sB64Enc: string, nBlocksSize: number) {
  const nInLen = sB64Enc.length
  const nOutLen = nBlocksSize
    ? Math.ceil(((nInLen * 3 + 1) >> 2) / nBlocksSize) * nBlocksSize
    : (nInLen * 3 + 1) >> 2
  const taBytes = new Uint8Array(nOutLen)

  let nMod3
  let nMod4
  let nUint24 = 0
  let nOutIdx = 0
  for (let nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << (6 * (3 - nMod4))
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      nMod3 = 0
      while (nMod3 < 3 && nOutIdx < nOutLen) {
        taBytes[nOutIdx] = (nUint24 >>> ((16 >>> nMod3) & 24)) & 255
        nMod3++
        nOutIdx++
      }
      nUint24 = 0
    }
  }

  return taBytes
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