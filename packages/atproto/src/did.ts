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

import type {DID, DIDDocument} from './types';

export class DIDResolver {
	private plcUrl = 'https://plc.directory';
	private cache: Map<DID, DIDDocument> = new Map();

	async resolve(did: DID): Promise<DIDDocument> {
		// Check cache first
		const cached = this.cache.get(did);
		if (cached) {
			return cached;
		}

		// Determine DID method
		if (did.startsWith('did:plc:')) {
			return await this.resolvePLC(did);
		} else if (did.startsWith('did:web:')) {
			return await this.resolveWeb(did);
		} else {
			throw new Error(`Unsupported DID method: ${did}`);
		}
	}

	private async resolvePLC(did: DID): Promise<DIDDocument> {
		const url = `${this.plcUrl}/${did}`;
		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`Failed to resolve PLC DID: ${response.statusText}`);
		}

		const document = await response.json() as DIDDocument;
		this.cache.set(did, document);
		return document;
	}

	private async resolveWeb(did: DID): Promise<DIDDocument> {
		// TODO: Implement Web DID resolution
		throw new Error('Web DID resolution not yet implemented');
	}

	clearCache(): void {
		this.cache.clear();
	}
}

export const didResolver = new DIDResolver();
