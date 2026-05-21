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

import type {DID, ATRecord, Repository} from './types';

export class RepositoryManager {
	private repositories: Map<DID, Repository> = new Map();

	async createRepository(did: DID): Promise<Repository> {
		const repository: Repository = {
			did,
			records: {},
			head: '',
		};
		
		this.repositories.set(did, repository);
		return repository;
	}

	async getRepository(did: DID): Promise<Repository | null> {
		return this.repositories.get(did) || null;
	}

	async putRecord(did: DID, collection: string, rkey: string, record: ATRecord): Promise<void> {
		const repository = this.repositories.get(did);
		if (!repository) {
			throw new Error(`Repository not found for DID: ${did}`);
		}

		const uri = `at://${did}/${collection}/${rkey}`;
		repository.records[uri] = record;
	}

	async getRecord(did: DID, collection: string, rkey: string): Promise<ATRecord | null> {
		const repository = this.repositories.get(did);
		if (!repository) {
			return null;
		}

		const uri = `at://${did}/${collection}/${rkey}`;
		return repository.records[uri] || null;
	}

	async deleteRecord(did: DID, collection: string, rkey: string): Promise<void> {
		const repository = this.repositories.get(did);
		if (!repository) {
			throw new Error(`Repository not found for DID: ${did}`);
		}

		const uri = `at://${did}/${collection}/${rkey}`;
		delete repository.records[uri];
	}

	async listRecords(did: DID, collection?: string): Promise<ATRecord[]> {
		const repository = this.repositories.get(did);
		if (!repository) {
			return [];
		}

		const records = Object.values(repository.records);
		
		if (collection) {
			return records.filter(record => record.uri.startsWith(`at://${did}/${collection}/`));
		}
		
		return records;
	}
}

export const repositoryManager = new RepositoryManager();
