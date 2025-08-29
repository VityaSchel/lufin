export type DecryptionKey = { iv: Uint8Array<ArrayBuffer>; key: CryptoKey };

const ivLength = 12;
const secretLength = 16;

const base64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function utob(u: Uint8Array): string {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64#browser_compatibility
  if ("toBase64" in (u as { toBase64?: Uint8Array["toBase64"] }))
    return u.toBase64();

  // Credit: https://stackoverflow.com/a/62362724/13689893
  const bin = (n: number) => n.toString(2).padStart(8, "0");
  let result = "";

  for (let i = 0; i <= (u.length - 1) / 3; i++) {
    const c1 = i * 3 + 1 >= u.length;
    const c2 = i * 3 + 2 >= u.length;
    const chunk =
      bin(u[3 * i]!) +
      bin(c1 ? 0 : u[3 * i + 1]!) +
      bin(c2 ? 0 : u[3 * i + 2]!);
    const r = chunk
      .match(/.{1,6}/g)!
      .map((x, j) =>
        j == 3 && c2 ? "=" : j == 2 && c1 ? "=" : base64[+("0b" + x)]
      );
    result += r.join("");
  }

  return result;
}

function btou(b: string): Uint8Array {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64#browser_compatibility
  if (
    "fromBase64" in
    (Uint8Array as { fromBase64?: (typeof Uint8Array)["fromBase64"] })
  )
    return Uint8Array.fromBase64(b);

  // Credit: https://stackoverflow.com/a/62364519/13689893
  const result: number[] = [];

  for (let i = 0; i < b.length / 4; i++) {
    const chunk = [...b.slice(4 * i, 4 * i + 4)];
    const bin = chunk
      .map((x) => base64.indexOf(x).toString(2).padStart(6, "0"))
      .join("");
    const bytes = bin.match(/.{1,8}/g)?.map((x) => +("0b" + x)) ?? [];
    result.push(
      ...bytes.slice(
        0,
        3 - Number(b[4 * i + 2] === "=") - Number(b[4 * i + 3] === "=")
      )
    );
  }

  return new Uint8Array(result);
}

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
  const iv = crypto.getRandomValues(new Uint8Array(ivLength));
  const secret = crypto.getRandomValues(new Uint8Array(secretLength));
  const key = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const checksum = await calculateChecksum({ iv, key });

  const encryptedFiles: File[] = [];
  for (const file of files) {
    const encryptedContent = await encrypt(file, { iv, key });
    const encryptedFile = new File([encryptedContent], file.name, {
      type: file.type,
    });
    encryptedFiles.push(encryptedFile);
  }

  const decryptionKey = new Uint8Array(ivLength + secretLength);
  decryptionKey.set(iv, 0);
  decryptionKey.set(secret, ivLength);

  const encodedDecryptionKey = utob(decryptionKey);

  return {
    result: {
      files: encryptedFiles,
      privateDecryptionKey: encodedDecryptionKey,
    },
    checksum,
  };
}

export async function encrypt(content: Blob, { iv, key }: DecryptionKey) {
  const decrypted = await content.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer },
    key,
    decrypted
  );
  return encrypted;
}

export async function decrypt(content: Blob, { iv, key }: DecryptionKey) {
  const encrypted = await content.arrayBuffer();
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer },
    key,
    encrypted
  );
  return decrypted;
}

const isArrayBuffer = (
  b: Uint8Array<ArrayBufferLike>
): b is Uint8Array<ArrayBuffer> => b.buffer instanceof ArrayBuffer;

async function getDecryptionKey(encodedKey: string): Promise<DecryptionKey> {
  const key: Uint8Array = btou(encodedKey);
  if (key.length !== 28) {
    throw new Error(
      `Invalid decryption key length. Expected 28 bytes (12 IV + 16 key). Found ${key.length} bytes.`
    );
  }
  const iv = key.slice(0, 12);
  const secret1 = key.slice(12, 28);
  if (!isArrayBuffer(iv) || !isArrayBuffer(secret1)) {
    throw new Error("Invalid decryption key format");
  }
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    secret1,
    { name: "AES-GCM" },
    true,
    ["decrypt", "encrypt"]
  );
  return { iv, key: cryptoKey };
}

export async function decodeDecryptionKey({
  checksum,
  encodedKey,
}: {
  checksum?: string;
  encodedKey: string;
}) {
  if (encodedKey.length === 0) {
    return null;
  }
  const key = await getDecryptionKey(
    encodedKey.startsWith("#") ? encodedKey.substring(1) : encodedKey
  );
  if (checksum) {
    if (checksum !== (await calculateChecksum(key))) {
      throw new Error("Checksum verification failed");
    }
  }
  return key;
}
