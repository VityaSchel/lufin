import { storage } from "$storage";
import { closeDb, db } from "$db";

const gracePeriod = process.env.GRACE_PERIOD
	? parseInt(process.env.GRACE_PERIOD, 10)
	: 7200;

export async function cleanup() {
	const expirationTime = Date.now() - gracePeriod * 1000;

	const pages = await db.getPagesExpiredBefore(new Date(expirationTime));

	console.log(
		"Found",
		pages.length,
		"pages that had expired before",
		new Date(expirationTime).toISOString(),
	);

	let deletedCount = 0,
		filesDeleted = 0;

	const chunkSize = 1000;
	const chunks = Math.ceil(pages.length / chunkSize);
	for (let i = 0; i < chunks; i++) {
		const chunk = pages.slice(i * chunkSize, (i + 1) * chunkSize);
		deletedCount += await db.deletePages(chunk.map((p) => p.pageId));
		const files = pages.flatMap((p) => p.files);
		await Promise.all(files.map((file) => storage.del(file.storageId)));
		filesDeleted += files.length;
	}

	console.log("Deleted", filesDeleted, "files in", deletedCount, "pages");

	return filesDeleted;
}

await cleanup();
await closeDb();
process.exit(0);
