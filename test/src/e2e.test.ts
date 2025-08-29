import { afterAll, beforeAll, describe, test } from "bun:test";
import { expect } from "earl";
import { nanoidRegex } from "./utils";
import z from "zod";
import { getDb, Table } from "./db";
import { encryptFiles } from "lufin-lib";
import { getStorage } from "./storage";

const { db, dbName, open, close } = getDb();
const { storage, storageName } = getStorage();

beforeAll(async () => {
	await open();
});

afterAll(async () => {
	await close();
});

console.log("Starting tests...");

describe(`Lufin with ${dbName}+${storageName}`, async () => {
	await test("should return correct limits", async () => {
		const req = await fetch("http://backend:3000/limits");
		expect(req.status).toEqual(200);
		const res = await req.json();
		expect(res).toEqual([
			{
				limit: 10,
				seconds: 31536000,
			},
			{
				limit: 50,
				seconds: 12960000,
			},
			{
				limit: 100,
				seconds: 4320000,
			},
		]);
	});

	await test("should throw for nonpositive expiration time", async () => {
		const body = new FormData();
		body.append("expiresAt", "1");
		body.append("deleteAtFirstDownload", "false");
		body.append("encrypted", "false");
		const req = await fetch("http://backend:3000/upload", {
			method: "POST",
			body,
		});
		expect(req.ok).toBeFalsy();
		const res = await req.json();
		expect(res).toEqual({
			ok: false,
			error: "EXPIRY_DATE_INVALID",
		});
	});

	await test("should throw for expiration time in past", async () => {
		const body = new FormData();
		body.append("expiresAt", String(Date.now() - 1));
		body.append("deleteAtFirstDownload", "false");
		body.append("encrypted", "false");
		const req = await fetch("http://backend:3000/upload", {
			method: "POST",
			body,
		});
		expect(req.ok).toBeFalsy();
		const res = await req.json();
		expect(res).toEqual({
			ok: false,
			error: "EXPIRY_DATE_INVALID",
		});
	});

	await test("should throw for expiration time in too far future", async () => {
		const body = new FormData();
		body.append("expiresAt", String(Date.now() + (31536000 + 1) * 1000));
		body.append("deleteAtFirstDownload", "false");
		body.append("encrypted", "false");
		const req = await fetch("http://backend:3000/upload", {
			method: "POST",
			body,
		});
		expect(req.ok).toBeFalsy();
		const res = await req.json();
		expect(res).toEqual({
			ok: false,
			error: "EXPIRY_DATE_INVALID",
		});
	});

	const unencryptedSingleFile = new File(["test"], "unencrypted.txt", {
		type: "text/plain;charset=utf-8",
	});
	const unencryptedSingleFileBody = new FormData();
	unencryptedSingleFileBody.append("file", unencryptedSingleFile);

	await test("should throw on invalid upload request for non existing page", async () => {
		const req = await fetch("http://backend:3000/upload/invalidvalue", {
			method: "POST",
			body: unencryptedSingleFileBody,
		});
		expect(req.status).toEqual(404);
		const res = await req.json();
		expect(res).toEqual({
			ok: false,
			error: "NOT_FOUND",
		});
	});

	await test("should throw on invalid upload page for non existing page", async () => {
		const req = await fetch("http://backend:3000/upload/invalidvalue", {
			method: "POST",
			body: unencryptedSingleFileBody,
		});
		expect(req.status).toEqual(404);
		const res = await req.json();
		expect(res).toEqual({
			ok: false,
			error: "NOT_FOUND",
		});
	});

	await test("should have empty initialized storage", async () => {
		expect(await storage.getUploadsCount()).toEqual(0);
	});

	async function runTestWith({
		file,
		testName,
		content,
		encrypted,
		checksum,
	}: {
		file: File;
		testName: string;
		content: string;
		encrypted: boolean;
		checksum?: string;
	}) {
		await describe(testName, async () => {
			const pageSchema = z
				.object({
					ok: z.literal(true),
					websocketChannelId: z.string().length(16).regex(nanoidRegex),
					tmpUploadId: z.string().length(16).regex(nanoidRegex),
					links: z
						.object({
							download: z.string().length(12).regex(nanoidRegex),
							delete: z.string().length(32).regex(nanoidRegex),
						})
						.strict(),
				})
				.strict();

			let page: z.infer<typeof pageSchema>;
			await test("should create a pending page", async () => {
				const body = new FormData();
				body.append("expiresAt", (Date.now() + 2500).toString());
				body.append("deleteAtFirstDownload", "false");
				body.append("encrypted", String(encrypted));
				if (checksum) body.append("checksum", checksum);
				const req = await fetch("http://backend:3000/upload", {
					method: "POST",
					body,
				});
				expect(req.status).toEqual(200);
				const res = await req.json();
				expect(res).toMatchSchema(pageSchema);
				page = pageSchema.parse(res);
			});

			await test("should throw on invalid upload request", async () => {
				const body = new FormData();
				const req = await fetch(
					"http://backend:3000/upload/" + page.tmpUploadId,
					{
						method: "POST",
						body,
					},
				);
				expect(req.status).toEqual(400);
				const res = await req.json();
				expect(res).toEqual({
					ok: false,
					error: "INVALID_BODY_SCHEMA",
					validationError: "You must pass at least one file",
				});
			});

			await test("should accept uploads", async () => {
				const ws = new WebSocket(
					"ws://backend:3000/updates/" + page.websocketChannelId,
				);
				const promise = new Promise<void>((resolve) => {
					ws.onmessage = (e) => {
						ws.close();
						z.object({ status: z.literal("SAVED") }).parse(JSON.parse(e.data));
						resolve();
					};
				});
				const body = new FormData();
				body.append("file", file);
				const response = await fetch(
					"http://backend:3000/upload/" + page.tmpUploadId,
					{
						method: "POST",
						body,
					},
				).then((res) => res.json());
				expect(() =>
					z.object({ ok: z.literal(true) }).parse(response),
				).not.toThrow();
				await promise;
			}, 100);

			await test("should upload file to storage", async () => {
				expect(await storage.getUploadsCount()).toEqual(1);
				const content = await storage.read(
					await storage.list().then((res) => res[0]!),
				);
				expect(content).toEqual(content);
			});

			await test("should save file to the pending_pages table", async () => {
				const result = await db.getMatchesCount(Table.PendingPages, {
					tmp_upload_id: page.tmpUploadId,
				});
				expect(result).toEqual(1);
			});

			await test("should not have saved to the pages table", async () => {
				const result = await db.getMatchesCount(Table.Pages, {
					page_id: page.links.download,
				});
				expect(result).toEqual(0);
			});

			await test("should throw on get page request while it's pending", async () => {
				const req = await fetch(
					"http://backend:3000/page/" + page.links.download,
				);
				expect(req.status).toEqual(404);
			});

			await test("should throw on delete page request while it's pending", async () => {
				const req = await fetch("http://backend:3000/page", {
					method: "DELETE",
					headers: { Authorization: page.links.delete },
				});
				expect(req.status).toEqual(404);
			});

			await test("should finish upload", async () => {
				const ws = new WebSocket(
					"ws://backend:3000/updates/" + page.websocketChannelId,
				);
				const promise = new Promise<void>((resolve) => {
					ws.onmessage = (e) => {
						ws.close();
						z.object({
							update_type: z.literal("upload_success"),
							author_token: z.string().length(32).regex(nanoidRegex),
						}).parse(JSON.parse(e.data));
						resolve();
					};
				});
				const req = await fetch(
					"http://backend:3000/upload/" + page.tmpUploadId + "/finish",
					{ method: "POST" },
				);
				expect(req.ok).toBeTruthy();
				await promise;
			}, 500);

			await test("should delete from pending_pages table", async () => {
				const result = await db.getMatchesCount(Table.PendingPages);
				expect(result).toEqual(0);
			});

			await test("should save to pages table", async () => {
				const result = await db.getMatchesCount(Table.Pages, {
					page_id: page.links.download,
				});
				expect(result).toEqual(1);
			});

			await test("should throw on invalid page", async () => {
				const req = await fetch("http://backend:3000/page/invalidvalue");
				expect(req.status).toEqual(404);
			});

			await test("should return page files", async () => {
				const req = await fetch(
					"http://backend:3000/page/" + page.links.download,
				);
				expect(req.status).toEqual(200);
				const res = await req.json();
				const schema = z
					.object({
						ok: z.literal(true),
						encrypted: z.literal(encrypted),
						...(checksum && { checksum: z.literal(checksum) }),
						files: z
							.array(
								z
									.object({
										filename: z.literal(file.name),
										sizeInBytes: z.literal(file.size),
										mimeType: z.literal(file.type),
									})
									.strict(),
							)
							.length(1),
					})
					.strict();
				try {
					expect(res).toMatchSchema(schema);
				} catch (e) {
					console.error(res);
					throw e;
				}
				schema.parse(res);
			});

			await test("should return file content by its name", async () => {
				const req = await fetch(
					"http://backend:3000/page/" + page.links.download + "/" + file.name,
				);
				expect(req.status).toEqual(200);
				expect(req.headers.get("content-type")).toEqual(
					encrypted ? "application/octet-stream" : file.type,
				);
				expect(await req.text()).toEqual(content);
			});

			await test("should return file content by its index", async () => {
				const req = await fetch(
					"http://backend:3000/page/" + page.links.download + "/0",
				);
				expect(req.status).toEqual(200);
				expect(req.headers.get("content-type")).toEqual(
					encrypted ? "application/octet-stream" : file.type,
				);
				expect(await req.text()).toEqual(content);
			});

			await test("should throw on invalid basic page info request", async () => {
				const req = await fetch(
					"http://backend:3000/page/" + page.links.download + "/info",
					{ headers: { Authorization: "invalidvalue" } },
				);
				expect(req.status).toEqual(404);
			});

			await test("should delete page", async () => {
				const req = await fetch("http://backend:3000/page", {
					headers: { Authorization: page.links.delete },
					method: "DELETE",
				});
				const response = await req.json();
				expect(req.status).toEqual(200);
				expect(() =>
					z.object({ ok: z.literal(true) }).parse(response),
				).not.toThrow();
			});

			await test("should delete page from db", async () => {
				const result = await db.getMatchesCount(Table.Pages);
				expect(result).toEqual(0);
			});

			await test("should have empty storage after deletion", async () => {
				expect(await storage.getUploadsCount()).toEqual(0);
			});
		});
	}

	await runTestWith({
		file: unencryptedSingleFile,
		testName: "with unencrypted single file",
		content: "test",
		encrypted: false,
	});
	const encrypted = await encryptFiles([unencryptedSingleFile]);
	const encryptedSingleFile = encrypted.result.files[0]!;
	await runTestWith({
		file: encryptedSingleFile,
		testName: "with encrypted single file",
		content: await encryptedSingleFile.text(),
		encrypted: true,
		checksum: encrypted.checksum,
	});

	async function quickUpload(file: File) {
		const createPageBody = new FormData();
		createPageBody.append("expiresAt", (Date.now() + 2500).toString());
		createPageBody.append("deleteAtFirstDownload", "true");
		createPageBody.append("encrypted", "false");
		const req = await fetch("http://backend:3000/upload", {
			method: "POST",
			body: createPageBody,
		});
		if (!req.ok) {
			throw new Error(await req.text());
		}
		const res = await req.json();
		const page = z
			.object({
				tmpUploadId: z.string().length(16).regex(nanoidRegex),
				websocketChannelId: z.string().length(16).regex(nanoidRegex),
				links: z.object({
					download: z.string().length(12).regex(nanoidRegex),
				}),
			})
			.parse(res);
		const ws = new WebSocket(
			"ws://backend:3000/updates/" + page.websocketChannelId,
		);
		const waitForSaved = new Promise<void>((resolve) => {
			const onMsg = (e: MessageEvent) => {
				z.object({ status: z.literal("SAVED") }).parse(JSON.parse(e.data));
				ws.removeEventListener("message", onMsg);
				resolve();
			};
			ws.addEventListener("message", onMsg);
		});
		const uploadFileBody = new FormData();
		uploadFileBody.append("file", file);
		const response = await fetch(
			"http://backend:3000/upload/" + page.tmpUploadId,
			{
				method: "POST",
				body: uploadFileBody,
			},
		).then((res) => res.json());
		expect(() =>
			z.object({ ok: z.literal(true) }).parse(response),
		).not.toThrow();
		await waitForSaved;
		const waitForFinish = new Promise<void>((resolve) => {
			ws.onmessage = (e) => {
				ws.close();
				z.object({
					update_type: z.literal("upload_success"),
				}).parse(JSON.parse(e.data));
				resolve();
			};
		});
		await fetch("http://backend:3000/upload/" + page.tmpUploadId + "/finish", {
			method: "POST",
		});
		await waitForFinish;
		return page.links.download;
	}

	let oneTimePageId: string;
	await test("should accept request to delete after first download", async () => {
		oneTimePageId = await quickUpload(new File(["test"], "test.txt"));
	});

	await test("should delete after first download", async () => {
		const req1 = await fetch(
			"http://backend:3000/page/" + oneTimePageId + "/0",
		);
		expect(req1.status).toEqual(200);
		const req2 = await fetch(
			"http://backend:3000/page/" + oneTimePageId + "/0",
		);
		expect(req2.status).toEqual(404);
	});
});
