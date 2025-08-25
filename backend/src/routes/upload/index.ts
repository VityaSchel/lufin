import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import { getMaxExpirationTime } from "src/utils/expiration-time";
import { createUpdatesChannel } from "src/ws";
import { insertPage } from "$db";

export const uploadRoute = new Elysia().post(
	"/upload",
	async ({ body, set }) => {
		if (body.expiresAt) {
			const tooLittleTimeToExpire =
				new Date(body.expiresAt).getTime() < Date.now() + 1 * 1000;
			const tooMuchTimeToExpire =
				new Date(body.expiresAt).getTime() >
				Date.now() + getMaxExpirationTime(0);
			if (tooLittleTimeToExpire || tooMuchTimeToExpire) {
				set.status = 400;
				return {
					ok: false,
					error: "EXPIRY_DATE_INVALID",
				};
			}
		}

		const channelId = createUpdatesChannel();
		const tmpUploadId = nanoid(16);
		const pageId = nanoid(12);
		const deleteToken = nanoid(32);
		const passwordHash =
			body.password && (await Bun.password.hash(body.password));

		const fiveMinutesToUploadFiles = Date.now() + 1000 * 60 * 5;

		await insertPage({
			pageId,
			checksum: body.checksum ?? null,
			expiresAt: new Date(fiveMinutesToUploadFiles),
			setExpiresAtTo: body.expiresAt ? new Date(body.expiresAt) : null,
			deleteAtFirstDownload: body.deleteAtFirstDownload,
			deleteToken: deleteToken,
			passwordHash: passwordHash ?? null,
			tmpUploadId: tmpUploadId,
			wsChannelId: channelId,
			encrypted: body.encrypted,
		});

		return {
			ok: true,
			websocketChannelId: channelId,
			tmpUploadId,
			links: { download: pageId, delete: deleteToken },
		};
	},
	{
		body: t.Object({
			expiresAt: t.Optional(
				t
					.Transform(t.Union([t.String(), t.Number()]))
					.Decode((value) => {
						const num = typeof value === "string" ? Number(value) : value;
						if (!Number.isInteger(num) || num <= 0 || num > 33247742400000) {
							throw new Error("Invalid expiresAt value");
						}
						return num;
					})
					.Encode((value) => value),
			),

			checksum: t.Optional(
				t.String({
					minLength: 64,
					maxLength: 64,
					pattern: "^[a-f0-9]{64}$",
				}),
			),

			password: t.Optional(t.String({ minLength: 1, maxLength: 128 })),

			deleteAtFirstDownload: t
				.Transform(t.Union([t.Literal("true"), t.Literal("false")]))
				.Decode((value) => value === "true")
				.Encode((value) => (value ? "true" : "false")),

			encrypted: t
				.Transform(t.Union([t.Literal("true"), t.Literal("false")]))
				.Decode((value) => value !== "false")
				.Encode((value) => (value ? "true" : "false")),
		}),
	},
);
