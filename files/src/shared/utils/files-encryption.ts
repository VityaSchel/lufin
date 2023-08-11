import { base64toUint8, uint8ToBase64Fast } from '@/shared/utils/encodings'

export async function encryptFiles(files: File[]): Promise<{ files: File[], privateDecryptionKey: string }> {
  const encryptedBuffers: ArrayBuffer[] = []

  const iv = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.generateKey({ 'name': 'AES-CBC', 'length': 128 }, true, ['encrypt', 'decrypt'])

  for(const file of files) {
    encryptedBuffers.push(
      await encryptFile(file, iv, key)
    )
  }

  const encryptedFiles = encryptedBuffers.map((buf, i) => {
    const blob = new Blob([buf], { type: files[i].type })
    const srcFile = files[i]
    return new File([blob], srcFile.name)
  })

  const keyUint = new Uint8Array(await crypto.subtle.exportKey('raw', key))
  const concatPrivateKey = new Uint8Array(iv.length + keyUint.length)
  concatPrivateKey.set(iv)
  concatPrivateKey.set(keyUint, iv.length)
  const privateDecryptionKey = uint8ToBase64Fast(concatPrivateKey)

  return {
    files: encryptedFiles,
    privateDecryptionKey: privateDecryptionKey
  }
}

function encryptFile(file: File, iv: Uint8Array, key: CryptoKey) {
  return new Promise<ArrayBuffer>(resolve => {
    const fileReader = new FileReader()
    
    fileReader.addEventListener('load', async (e) => {
      const data = e.target!.result as ArrayBuffer
      const encrypted = await crypto.subtle.encrypt({ 'name': 'AES-CBC', iv }, key, data)
      resolve(encrypted)
    })

    fileReader.readAsArrayBuffer(file)
  })
}

export type DecryptionKey = { iv: ArrayBuffer, key: CryptoKey }
export function decryptFile(decryptionKey: DecryptionKey, content: Blob) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fileReader = new FileReader()
    
    fileReader.addEventListener('load', async (e) => {
      const data = e.target!.result as ArrayBuffer
      try {
        const decrypted = await crypto.subtle.decrypt({ 'name': 'AES-CBC', iv: decryptionKey.iv }, decryptionKey.key, data)
        resolve(decrypted)
      } catch(e) {
        reject(e)
      }
    })

    fileReader.readAsArrayBuffer(content)
  })
}

export async function getDecryptionKey(encodedKey: string): Promise<DecryptionKey> {
  const uint8array = base64toUint8(encodedKey, 0)
  if (uint8array.length !== 33) {
    throw new Error('Invalid decryption key length. Expected 32 bytes. Found ' + (uint8array.length - 1) + ' bytes.')
  }
  const iv = uint8array.slice(0, 16)
  const keyUint = uint8array.slice(16, 32)
  const key = await crypto.subtle.importKey('raw', keyUint, { name: 'AES-CBC' }, true, ['encrypt', 'decrypt'])
  return { iv, key }
}

export const decodeDecryptionKey = async () => {
  try {
    const encodedKey = window.location.hash
    const key = await getDecryptionKey(encodedKey.startsWith('#') ? encodedKey.substring(1) : encodedKey)
    return key
  } catch(e) {
    console.error('Error while decoding decryption key', e)
    return 'error'
  }
}