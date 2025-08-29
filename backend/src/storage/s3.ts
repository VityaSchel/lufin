import { S3Client, write } from "bun";
import type { LufinStorageBuilder } from "src/storage/interface";

export const s3: LufinStorageBuilder<S3Client> = (client) => ({
	download(id: string, stream = false) {
		const file = client.file(id, {
			partSize: 5 * 1024 * 1024,
			queueSize: 4,
		});
		return stream ? file.stream() : file.bytes();
	},
	async upload(file: File) {
		await write(
			client.file(file.name, {
				partSize: 5 * 1024 * 1024,
				queueSize: 4,
			}),
			file,
		);
	},
	async del(id: string) {
		return await client.file(id).delete();
	},
	async close() {},
});

export async function connectS3({
	bucket,
	region,
	endpoint,
	accessKeyId,
	secretAccessKey,
}: {
	bucket: string;
	region?: string;
	endpoint: string;
	accessKeyId: string;
	secretAccessKey: string;
}) {
	console.log("Connecting to S3...");
	const client = new S3Client({
		bucket,
		region,
		endpoint,
		accessKeyId,
		secretAccessKey,
	});
	console.log("Connected to S3 bucket", bucket);
	return s3(client);
}
