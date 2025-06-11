export const getExpiresAt = (expiresAt: Date | null, filesSumSize: number) => {
  return expiresAt 
    ? expiresAt.getTime()
    : getMaxExpiration(filesSumSize)
}

const bytesInMb = 1000*1000
const msInDay = 1000*60*60*24
export const getMaxExpiration = (filesSumSize: number): number => {
  if(filesSumSize < 10*bytesInMb) {
    return Date.now() + msInDay*364.5
  } if(filesSumSize < 50*bytesInMb) {
    return Date.now() + msInDay*149.5
  } else if(filesSumSize < 100*bytesInMb) {
    return Date.now() + msInDay*49.5
  } else {
    return Date.now() + msInDay*29.5
  }
}