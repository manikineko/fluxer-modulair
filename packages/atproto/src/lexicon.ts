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

import type {BlobRef} from './blob';

export interface LexiconDef {
	$id?: string;
	$schema?: string;
	description?: string;
	defs?: Record<string, LexiconDef>;
	type?: 'object' | 'array' | 'string' | 'boolean' | 'number' | 'ref' | 'union';
	properties?: Record<string, LexiconDef>;
	required?: string[];
	items?: LexiconDef;
	const?: unknown;
	enum?: unknown[];
	ref?: string;
	minLength?: number;
	maxLength?: number;
	minItems?: number;
	maxItems?: number;
	minimum?: number;
	maximum?: number;
	pattern?: string;
	format?: string;
}

export interface LexiconRecord {
	uri: string;
	cid: string;
	value: unknown;
}

export class LexiconManager {
	private lexicons: Map<string, LexiconDef> = new Map();

	registerLexicon(id: string, def: LexiconDef): void {
		this.lexicons.set(id, def);
	}

	getLexicon(id: string): LexiconDef | undefined {
		return this.lexicons.get(id);
	}

	validate(value: unknown, lexiconId: string): {valid: boolean; errors: string[]} {
		const lexicon = this.getLexicon(lexiconId);
		if (!lexicon) {
			return {valid: false, errors: [`Lexicon ${lexiconId} not found`]};
		}

		return this.validateAgainstDef(value, lexicon);
	}

	private validateAgainstDef(value: unknown, def: LexiconDef): {valid: boolean; errors: string[]} {
		const errors: string[] = [];

		if (def.type === 'string') {
			if (typeof value !== 'string') {
				errors.push(`Expected string, got ${typeof value}`);
			}
		} else if (def.type === 'boolean') {
			if (typeof value !== 'boolean') {
				errors.push(`Expected boolean, got ${typeof value}`);
			}
		} else if (def.type === 'number') {
			if (typeof value !== 'number') {
				errors.push(`Expected number, got ${typeof value}`);
			}
		} else if (def.type === 'array') {
			if (!Array.isArray(value)) {
				errors.push(`Expected array, got ${typeof value}`);
			} else {
				if (def.items) {
					value.forEach((item, index) => {
						const result = this.validateAgainstDef(item, def.items!);
						if (!result.valid) {
							errors.push(...result.errors.map(e => `Item ${index}: ${e}`));
						}
					});
				}
			}
		} else if (def.type === 'object') {
			if (typeof value !== 'object' || value === null || Array.isArray(value)) {
				errors.push(`Expected object, got ${typeof value}`);
			} else {
				const obj = value as Record<string, unknown>;
				
				// Check required properties
				if (def.required) {
					for (const req of def.required) {
						if (!(req in obj)) {
							errors.push(`Missing required property: ${req}`);
						}
					}
				}
				
				// Validate properties
				if (def.properties) {
					for (const [propName, propDef] of Object.entries(def.properties)) {
						if (propName in obj) {
							const result = this.validateAgainstDef(obj[propName], propDef);
							if (!result.valid) {
								errors.push(...result.errors.map(e => `Property ${propName}: ${e}`));
							}
						}
					}
				}
			}
		} else if (def.type === 'ref') {
			if (def.ref) {
				const refLexicon = this.getLexicon(def.ref);
				if (refLexicon) {
					const result = this.validateAgainstDef(value, refLexicon);
					if (!result.valid) {
						errors.push(...result.errors.map(e => `Ref ${def.ref}: ${e}`));
					}
				}
			}
		} else if (def.type === 'union') {
			// Try to validate against each option in the union
			let valid = false;
			if (def.enum) {
				valid = def.enum.includes(value);
			}
			if (!valid) {
				errors.push(`Value does not match any union option`);
			}
		}

		return {valid: errors.length === 0, errors};
	}

	private isValidUri(value: string): boolean {
		try {
			new URL(value);
			return true;
		} catch {
			return false;
		}
	}

	// Register standard Bluesky lexicons
	registerStandardLexicons(): void {
		// app.bsky.feed.post
		this.registerLexicon('app.bsky.feed.post', {
			$id: 'app.bsky.feed.post',
			type: 'object',
			required: ['text', 'createdAt'],
			properties: {
				text: {
					type: 'string',
					maxLength: 300,
					description: 'The post text',
				},
				createdAt: {
					type: 'string',
					format: 'datetime',
					description: 'Timestamp of the post',
				},
				embed: {
					type: 'ref',
					ref: 'app.bsky.embed.images',
					description: 'Post embed',
				},
				reply: {
					type: 'ref',
					ref: 'app.bsky.feed.post#replyRef',
					description: 'Reply reference',
				},
				entities: {
					type: 'array',
					items: {
						type: 'ref',
						ref: 'app.bsky.richtext.facet',
					},
					description: 'Rich text entities',
				},
				langs: {
					type: 'array',
					items: {type: 'string'},
					description: 'Languages',
				},
				tags: {
					type: 'array',
					items: {type: 'string'},
					description: 'Hashtags',
				},
			},
		});

		// app.bsky.feed.like
		this.registerLexicon('app.bsky.feed.like', {
			$id: 'app.bsky.feed.like',
			type: 'object',
			required: ['subject', 'createdAt'],
			properties: {
				subject: {
					type: 'ref',
					ref: 'com.atproto.repo.strongRef',
					description: 'The post being liked',
				},
				createdAt: {
					type: 'string',
					format: 'datetime',
					description: 'Timestamp of the like',
				},
			},
		});

		// app.bsky.feed.repost
		this.registerLexicon('app.bsky.feed.repost', {
			$id: 'app.bsky.feed.repost',
			type: 'object',
			required: ['subject', 'createdAt'],
			properties: {
				subject: {
					type: 'ref',
					ref: 'com.atproto.repo.strongRef',
					description: 'The post being reposted',
				},
				createdAt: {
					type: 'string',
					format: 'datetime',
					description: 'Timestamp of the repost',
				},
			},
		});

		// com.atproto.repo.strongRef
		this.registerLexicon('com.atproto.repo.strongRef', {
			$id: 'com.atproto.repo.strongRef',
			type: 'object',
			required: ['uri', 'cid'],
			properties: {
				uri: {type: 'string', format: 'uri'},
				cid: {type: 'string'},
			},
		});

		// app.bsky.embed.images
		this.registerLexicon('app.bsky.embed.images', {
			$id: 'app.bsky.embed.images',
			type: 'object',
			required: ['images'],
			properties: {
				images: {
					type: 'array',
					minItems: 1,
					maxItems: 4,
					items: {
						type: 'object',
						required: ['image', 'alt'],
						properties: {
							image: {
								type: 'ref',
								ref: 'com.atproto.repo.blobRef',
							},
							alt: {type: 'string'},
						},
					},
				},
			},
		});

		// com.atproto.repo.blobRef
		this.registerLexicon('com.atproto.repo.blobRef', {
			$id: 'com.atproto.repo.blobRef',
			type: 'object',
			required: ['$link', 'mimeType'],
			properties: {
				$link: {type: 'string'},
				mimeType: {type: 'string'},
			},
		});
	}
}

export const lexiconManager = new LexiconManager();
