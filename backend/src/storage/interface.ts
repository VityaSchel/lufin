export interface LufinStorage {
	download(
		id: string,
		preferStream?: boolean,
	): Promise<Uint8Array> | NodeJS.ReadableStream | ReadableStream;
	upload(file: File): Promise<void>;
	del(id: string): Promise<void>;
	close(): Promise<void>;
}

export type LufinStorageBuilder<T> = (client: T) => LufinStorage;
