import type { LufinStorageBuilder } from "src/storage/interface";
import fs from "fs/promises";
import path from "path";

export const localUploadsDir: LufinStorageBuilder<string> = (uploadsDir) => ({
	download(id, preferStream) {
		const file = Bun.file(path.join(uploadsDir, id));
		return preferStream ? file.stream() : file.bytes();
	},
	async upload(file: File) {
		await Bun.write(Bun.file(path.join(uploadsDir, file.name)), file);
	},
	async del(id: string) {
		await Bun.file(path.join(uploadsDir, id)).delete();
	},
	async close() {},
});

export async function openLocalUploadsDir(uploadsDir: string) {
	console.log("Opening local uploads dir...");
	await fs.mkdir(uploadsDir, { recursive: true });
	console.log("Opened local uploads dir");
	return localUploadsDir(uploadsDir);
}
