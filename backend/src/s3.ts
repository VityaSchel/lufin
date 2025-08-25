import { S3Client, write } from "bun";

const bucket = process.env.S3_BUCKET;
if (
	!process.env.S3_ENDPOINT ||
	!process.env.S3_ACCESS_KEY ||
	!process.env.S3_SECRET_ACCESS_KEY ||
	!bucket
) {
	throw new Error(
		"Fill S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, S3_BUCKET in .env file",
	);
}

const s3 = new S3Client({
	bucket: bucket,
	region: process.env.S3_REGION || undefined,
	endpoint: process.env.S3_ENDPOINT,
	accessKeyId: process.env.S3_ACCESS_KEY,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

export async function get(id: string) {
	return await s3.file(id);
}

export async function download(id: string) {
	return await s3.file(id).stream();
}

export async function upload(file: File) {
	return await write(
		s3.file(file.name, {
			partSize: 5 * 1024 * 1024,
			queueSize: 4,
		}),
		file,
	);
}

export async function del(id: string) {
	return await s3.file(id).delete();
}
