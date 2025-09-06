import { openLocalUploadsDir } from "$storage/local-uploads-dir";
import type { LufinStorage } from "src/storage/interface";
import { connectS3 } from "src/storage/s3";

export let storage: LufinStorage;
try {
	const s3AccessKey = process.env.S3_ACCESS_KEY;
	const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
	const s3Endpoint = process.env.S3_ENDPOINT;
	const s3Bucket = process.env.S3_BUCKET;
	const s3Region = process.env.S3_REGION;

	const uploadsDir = process.env.UPLOADS_DIR;

	const s3Envs =
		s3AccessKey || s3SecretAccessKey || s3Endpoint || s3Bucket || s3Region;

	if ([Boolean(s3Envs), Boolean(uploadsDir)].filter(Boolean).length !== 1) {
		throw new Error("Please set either S3 variables or UPLOADS_DIR");
	}

	if (s3Envs) {
		if (!s3AccessKey || !s3SecretAccessKey || !s3Endpoint || !s3Bucket) {
			throw new Error(
				"Please set all S3 variables: S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET",
			);
		}
		storage = await connectS3({
			endpoint: s3Endpoint,
			bucket: s3Bucket,
			region: s3Region,
			accessKeyId: s3AccessKey,
			secretAccessKey: s3SecretAccessKey,
		});
	} else if (uploadsDir) {
		storage = await openLocalUploadsDir(uploadsDir);
	} else {
		throw new Error("Please set either S3 variables or UPLOADS_DIR");
	}
} catch (e) {
	console.error(e instanceof Error ? e.message : e);
	process.exit(1);
}

let closing = false;
export async function closeStorage() {
	if (closing) return;
	closing = true;
	await storage.close();
}
