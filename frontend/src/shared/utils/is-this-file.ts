export function isThisAFile(file: File) {
  return new Promise<boolean>((resolve, reject) => {
    if (file.type !== '') { 
      return resolve(true) 
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.error) {
        if(
          reader.error.name === 'NotFoundError' ||
          reader.error.name === 'NotReadableError'
        ) {
          return resolve(false)
        } else {
          reject(reader.error)
        }
      } else {
        resolve(true)
      }
    }
    reader.readAsBinaryString(file)
  })
}