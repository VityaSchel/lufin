import { config } from "src/config";

const MBinB = 1000 * 1000;

/**
 * Convert files sizes to a maximum expiration time
 * @param sumFileSizeBytes All files sizes in bytes
 * @returns Maximum milliseconds since now
 */
export function getMaxExpirationTime(sumFileSizeBytes: number): number {
	const limitConfig = config.find(
		({ limit }) => sumFileSizeBytes <= limit * MBinB,
	);
	if (!limitConfig) {
		return 0;
	}
	return limitConfig.seconds * 1000;
}

/**
 * Convert expiration time to maximum files sizes
 * @param expirationTime Milliseconds since now
 * @returns Maximum files sizes in bytes
 */
export function getMaxFilesSize(expirationTime: number): number {
	const limitConfig = config.find(
		({ seconds }) => expirationTime < seconds * 1000,
	);
	if (!limitConfig) {
		return 0;
	}
	return limitConfig.limit * MBinB;
}
