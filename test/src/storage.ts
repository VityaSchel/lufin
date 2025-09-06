import { S3Client } from "bun";
import { readdir } from "fs/promises";
import path from "path";

const s3AccessKey = process.env.S3_ACCESS_KEY;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3Endpoint = process.env.S3_ENDPOINT;
const s3Bucket = process.env.S3_BUCKET;
const s3Region = process.env.S3_REGION;

const uploadsDir = process.env.UPLOADS_DIR;

const s3Envs =
	s3AccessKey || s3SecretAccessKey || s3Endpoint || s3Bucket || s3Region;

if ([Boolean(s3Envs), Boolean(uploadsDir)].filter(Boolean).length !== 1) {
	throw new Error("Please set only S3 variables or UPLOADS_DIR");
}

if (s3Envs) {
	if (!s3AccessKey || !s3SecretAccessKey || !s3Endpoint || !s3Bucket) {
		throw new Error(
			"Please set all S3 variables: S3_ACCESS_KEY, S3_SECRET_ACCESS_KEY, S3_ENDPOINT, S3_BUCKET",
		);
	}
}

interface StorageShim {
	getUploadsCount: () => Promise<number>;
	list(): Promise<string[]>;
	read(id: string): Promise<string>;
}

export function getStorage(): {
	storage: StorageShim;
	storageName: string;
} {
	if (s3Envs) {
		const s3 = new S3Client({
			endpoint: process.env.S3_ENDPOINT,
			accessKeyId: process.env.S3_ACCESS_KEY,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			bucket: process.env.S3_BUCKET,
		});
		return {
			storageName: "S3",
			storage: {
				getUploadsCount: async () => {
					return await s3.list().then((res) => res.keyCount ?? 0);
				},
				read: async (id: string) => {
					return await s3.file(id).text();
				},
				list: async () => {
					return await s3
						.list()
						.then((res) => res.contents?.map((c) => c.key!) ?? []);
				},
			},
		};
	} else if (uploadsDir) {
		return {
			storageName: "local uploads fs",
			storage: {
				getUploadsCount: async () => {
					return await readdir(uploadsDir).then((res) => res.length);
				},
				read: async (id: string) => {
					return await Bun.file(path.join(uploadsDir, id)).text();
				},
				list: async () => {
					return await readdir(uploadsDir);
				},
			},
		};
	} else {
		throw new Error("Either S3 variables or UPLOADS_DIR must be set");
	}
}
