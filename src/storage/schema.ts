import { MMKV } from 'react-native-mmkv'
import { Language } from '@app/translations/languages'

export interface Device {
	language: Language
}

/**
 * Generic storage class. DO NOT use this directly. Instead, use the exported
 * storage instances below.
 */
export class MMKVStorage<Scopes extends unknown[], Schema> {
	protected sep = ':'
	protected store: MMKV

	constructor({ id, encryptionKey }: { id: string; encryptionKey?: string }) {
		this.store = new MMKV({ id, encryptionKey })
	}

	/**
	 * Store a value in storage based on scopes and/or keys
	 *
	 *   `set([key], value)`
	 *   `set([scope, key], value)`
	 */
	set<Key extends keyof Schema>(scopes: [...Scopes, Key], data: Schema[Key]): void {
		// stored as `{ data: <value> }` structure to ease stringification
		this.store.set(scopes.join(this.sep), JSON.stringify({ data }))
	}

	/**
	 * Get a value from storage based on scopes and/or keys
	 *
	 *   `get([key])`
	 *   `get([scope, key])`
	 */
	get<Key extends keyof Schema>(scopes: [...Scopes, Key]): Schema[Key] | undefined {
		const res = this.store.getString(scopes.join(this.sep))
		if (!res) return undefined
		// parsed from storage structure `{ data: <value> }`
		return JSON.parse(res).data
	}

	/**
	 * Remove a value from storage based on scopes and/or keys
	 *
	 *   `remove([key])`
	 *   `remove([scope, key])`
	 */
	remove<Key extends keyof Schema>(scopes: [...Scopes, Key]) {
		this.store.delete(scopes.join(this.sep))
	}

	/**
	 * Clear all values from storage
	 */
	clear() {
		this.store.clearAll()
	}

	/**
	 * Remove many values from the same storage scope by keys
	 *
	 *   `removeMany([], [key])`
	 *   `removeMany([scope], [key])`
	 */
	removeMany<Key extends keyof Schema>(scopes: [...Scopes], keys: Key[]) {
		keys.forEach(key => this.remove([...scopes, key]))
	}

	/**
	 * Encrypt the storage with a new key
	 * @param newEncryptionKey - The new encryption key
	 */
	encrypt(newEncryptionKey: string): void {
		this.store.recrypt(newEncryptionKey)
	}

	/**
	 * Remove encryption from the storage
	 */
	removeEncryption(): void {
		this.store.recrypt(undefined)
	}
}
