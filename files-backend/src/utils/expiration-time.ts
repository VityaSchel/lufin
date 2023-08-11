const MBinB = 1000*1000
const dayInMs = 1000*60*60*24

/**
 * Convert files sizes to a maximum expiration time
 * @param sumFileSizeBytes All files sizes in bytes
 * @returns Maximum milliseconds since now
 */
export function getMaxExpirationTime(sumFileSizeBytes: number): number {
  if(sumFileSizeBytes < 10*MBinB) {
    return 365*dayInMs
  } else if(sumFileSizeBytes < 50*MBinB) {
    return 150*dayInMs
  } else if(sumFileSizeBytes < 100*MBinB) {
    return 50*dayInMs
  } else {
    return 30*dayInMs
  }
}

/**
 * Convert expiration time to maximum files sizes
 * @param expirationTime Milliseconds since now
 * @returns Maximum files sizes in bytes
 */
export function getMaxFilesSize(expirationTime: number): number {
  if(expirationTime < 30*dayInMs) {
    return 500*MBinB
  } else if(expirationTime < 50*dayInMs) {
    return 100*MBinB
  } else if(expirationTime < 150*dayInMs) {
    return 50*MBinB
  } else {
    return 10*MBinB
  }
}