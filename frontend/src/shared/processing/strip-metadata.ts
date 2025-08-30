// CREDIT: https://github.com/mshibl/Exif-Stripper/blob/master/exif-stripper.js
// Open Source License
export async function removeExifFromJpeg(imageFile: File) {
  const imageArrayBuffer = await imageFile.arrayBuffer()

  const dv = new DataView(imageArrayBuffer)

  let offset = 0,
    recess = 0
  const pieces: { recess: number; offset: number }[] = []
  let i = 0
  if (dv.getUint16(offset) == 0xffd8) {
    offset += 2
    let app1 = dv.getUint16(offset)
    offset += 2
    while (offset < dv.byteLength) {
      if (app1 == 0xffe1) {
        pieces[i] = { recess: recess, offset: offset - 2 }
        recess = offset + dv.getUint16(offset)
        i++
      } else if (app1 == 0xffda) {
        break
      }
      offset += dv.getUint16(offset)
      app1 = dv.getUint16(offset)
      offset += 2
    }
    if (pieces.length > 0) {
      const newPieces: ArrayBuffer[] = []
      pieces.forEach((v) => {
        newPieces.push(imageArrayBuffer.slice(v.recess, v.offset))
      })
      newPieces.push(imageArrayBuffer.slice(recess))
      const blob = new Blob(newPieces)
      return blob
    } else {
      throw new Error('Could not costruct new file out of zero pieces')
    }
  } else {
    throw new Error("Specified file is not JPEG (couldn't find EXIF marker)")
  }
}
