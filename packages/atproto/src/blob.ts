/*
 * MIT License
 *
 * Copyright (c) 2026 manikineko.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type {DID} from './types';

export interface Blob {
	ref: {
		$link: string;
	};
	mimeType: string;
	size: number;
}

export interface BlobRef {
	$link: string;
}

export class BlobManager {
	private blobs: Map<string, Blob> = new Map();
	private blobStorage: Map<string, Uint8Array> = new Map();

	async uploadBlob(did: DID, data: Uint8Array, mimeType: string): Promise<Blob> {
		const hash = await this.computeHash(data);
		const ref = {ref: {$link: hash}};
		
		const blob: Blob = {
			ref: {$link: hash},
			mimeType,
			size: data.length,
		};
		
		this.blobs.set(hash, blob);
		this.blobStorage.set(hash, data);
		
		return blob;
	}

	async getBlob(hash: string): Promise<Blob | null> {
		return this.blobs.get(hash) || null;
	}

	async getBlobData(hash: string): Promise<Uint8Array | null> {
		return this.blobStorage.get(hash) || null;
	}

	async deleteBlob(hash: string): Promise<void> {
		this.blobs.delete(hash);
		this.blobStorage.delete(hash);
	}

	async listBlobs(did: DID): Promise<Blob[]> {
		return Array.from(this.blobs.values());
	}

	private async computeHash(data: Uint8Array): Promise<string> {
		if (typeof crypto !== 'undefined' && crypto.subtle) {
			const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
			return hashHex;
		} else {
			// Fallback simple hash for environments without Web Crypto
			let hash = 0;
			for (let i = 0; i < data.length; i++) {
				const byte = data[i];
				hash = ((hash << 5) - hash) + byte;
				hash = hash & hash;
			}
			return Math.abs(hash).toString(16).padStart(64, '0');
		}
	}
}

export const blobManager = new BlobManager();
