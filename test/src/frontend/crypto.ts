import { base64ToUint8, uint8ToBase64Fast } from "./encodings";

export type DecryptionKey = { iv: Uint8Array<ArrayBuffer>; key: CryptoKey };

async function calculateChecksum({ iv, key }: DecryptionKey) {
	const encoded = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		new TextEncoder().encode("hloth")
	);
	const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
	const checksum = Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return checksum;
}

export async function encryptFiles(files: File[]): Promise<{
	result: { files: File[]; privateDecryptionKey: string };
	checksum: string;
}> {
	const encryptedBuffers: ArrayBuffer[] = [];

	const iv = crypto.getRandomValues(new Uint8Array(12));
	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 128 },
		true,
		["encrypt", "decrypt"]
	);

	for (const file of files) {
		encryptedBuffers.push(await encryptFile(file, iv, key));
	}

	const encryptedFiles = encryptedBuffers.map((buf, i) => {
		const blob = new Blob([buf], { type: files[i]!.type });
		const srcFile = files[i]!;
		return new File([blob], srcFile.name);
	});

	const keyUint = new Uint8Array(await crypto.subtle.exportKey("raw", key));
	const concatPrivateKey = new Uint8Array(iv.length + keyUint.length);
	concatPrivateKey.set(iv);
	concatPrivateKey.set(keyUint, iv.length);
	const privateDecryptionKey = uint8ToBase64Fast(concatPrivateKey);

	return {
		result: {
			files: encryptedFiles,
			privateDecryptionKey: privateDecryptionKey,
		},
		checksum: await calculateChecksum({ iv, key }),
	};
}

async function encryptFile(
	file: File,
	iv: Uint8Array<ArrayBuffer>,
	key: CryptoKey
) {
	const data = await file.arrayBuffer();
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv.buffer },
		key,
		data
	);
	return encrypted;
}

export async function verifyChecksum(
	storedChecksum: string,
	decryptionKey: DecryptionKey
) {
	const calculatedChecksum = await calculateChecksum(decryptionKey);
	return storedChecksum === calculatedChecksum;
}

export async function decryptFile(decryptionKey: DecryptionKey, content: Blob) {
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: decryptionKey.iv.buffer },
		decryptionKey.key,
		await content.arrayBuffer()
	);
	return decrypted;
}

export async function getDecryptionKey(
	encodedKey: string
): Promise<DecryptionKey> {
	const uint8array = base64ToUint8(encodedKey);
	if (uint8array.length !== 28) {
		throw new Error(
			"Invalid decryption key length. Expected 28 bytes (12 IV + 16 key). Found " +
				uint8array.length +
				" bytes."
		);
	}
	const iv = uint8array.slice(0, 12);
	const keyUint = uint8array.slice(12, 28);
	const key = await crypto.subtle.importKey(
		"raw",
		keyUint,
		{ name: "AES-GCM" },
		true,
		["encrypt", "decrypt"]
	);
	return { iv, key };
}

export const decodeDecryptionKey = async ({
	checksum,
	encodedKey,
}: {
	checksum?: string;
	encodedKey: string;
}) => {
	try {
		if (encodedKey.length === 0) {
			return null;
		}
		const key = await getDecryptionKey(
			encodedKey.startsWith("#") ? encodedKey.substring(1) : encodedKey
		);
		if (checksum) {
			if (!(await verifyChecksum(checksum, key))) {
				throw new Error("Checksum verification failed");
			}
		}
		return key;
	} catch (e) {
		console.error("Error while decoding decryption key", e);
		return "error";
	}
};
