import { storage } from "$storage";
import { db } from "$db";
import { sendUpdate as sendWsUpdate } from "../ws";

export async function uploadFiles({
	pageId,
	wsChannelId,
	files,
}: {
	pageId: string;
	wsChannelId: string;
	files: { fieldname: string; file: File }[];
}) {
	try {
		for (const { fieldname, file } of files) {
			const id = crypto.randomUUID();
			await storage.upload(
				new File([await file.bytes()], id, { type: file.type }),
			);
			sendWsUpdate(wsChannelId, {
				type: "progress",
				fileField: fieldname,
				status: "SAVED",
			});
			await db.pushFile(
				{ pageId },
				{
					storageId: id,
					filename: file.name,
					filesizeInBytes: file.size,
					mimeType: file.type,
				},
			);
		}
	} catch (e) {
		console.error(e);
		sendWsUpdate(wsChannelId, {
			type: "upload_errored",
			error: "Could not upload file to file storage",
		});
	}
}
