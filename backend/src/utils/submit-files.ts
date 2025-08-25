import * as s3 from "../s3";
import { sendUpdate as sendWsUpdate } from "../ws";
import { pushFile } from "$db";

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
			await s3.upload(new File([file], id, { type: file.type }));
			sendWsUpdate(wsChannelId, {
				type: "progress",
				fileField: fieldname,
				status: "SAVED",
			});
			await pushFile(
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
