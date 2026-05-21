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

import type {DID, Session} from './types';
import {lexiconManager} from './lexicon';

export interface BlueskyPost {
	uri: string;
	cid: string;
	author: {
		did: string;
		handle: string;
		displayName?: string;
		avatar?: string;
	};
	text: string;
	createdAt: string;
	likes: number;
	reposts: number;
	replies: number;
	liked: boolean;
	reposted: boolean;
}

export interface BlueskyNotification {
	id: string;
	type: 'like' | 'repost' | 'follow' | 'reply';
	actor: {
		did: string;
		handle: string;
		displayName?: string;
	};
	post?: {
		uri: string;
		cid: string;
		text: string;
	};
	createdAt: string;
}

export interface BlueskyProfile {
	did: string;
	handle: string;
	displayName?: string;
	description?: string;
	avatar?: string;
	banner?: string;
	followersCount: number;
	followingCount: number;
	postsCount: number;
}

export class BlueskyClient {
	private static readonly API_BASE = 'https://api.bsky.app/xrpc';
	private session: Session | null = null;

	constructor(session?: Session) {
		if (session) {
			this.session = session;
		}
	}

	async login(identifier: string, password: string): Promise<Session> {
		const response = await fetch(`${BlueskyClient.API_BASE}/com.atproto.server.createSession`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({identifier, password}),
		});

		if (!response.ok) {
			throw new Error('Failed to login to Bluesky');
		}

		const data = await response.json();
		this.session = data;
		return data;
	}

	async getTimeline(cursor?: string, limit: number = 50): Promise<BlueskyPost[]> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		const params = new URLSearchParams({limit: limit.toString()});
		if (cursor) params.set('cursor', cursor);

		const response = await fetch(`${BlueskyClient.API_BASE}/app.bsky.feed.getTimeline?${params}`, {
			headers: {'Authorization': `Bearer ${this.session.accessJwt}`},
		});

		if (!response.ok) {
			throw new Error('Failed to fetch timeline');
		}

		const data = await response.json();
		return this.transformPosts(data.feed || []);
	}

	async getNotifications(limit: number = 50): Promise<BlueskyNotification[]> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		const response = await fetch(`${BlueskyClient.API_BASE}/app.bsky.notification.listNotifications?limit=${limit}`, {
			headers: {'Authorization': `Bearer ${this.session.accessJwt}`},
		});

		if (!response.ok) {
			throw new Error('Failed to fetch notifications');
		}

		const data = await response.json();
		return this.transformNotifications(data.notifications || []);
	}

	async getProfile(handle: string): Promise<BlueskyProfile> {
		const response = await fetch(`${BlueskyClient.API_BASE}/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`);

		if (!response.ok) {
			throw new Error('Failed to fetch profile');
		}

		const data = await response.json();
		return {
			did: data.did,
			handle: data.handle,
			displayName: data.displayName,
			description: data.description,
			avatar: data.avatar,
			banner: data.banner,
			followersCount: data.followersCount || 0,
			followingCount: data.followsCount || 0,
			postsCount: data.postsCount || 0,
		};
	}

	async getOwnProfile(): Promise<BlueskyProfile> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		return this.getProfile(this.session.did);
	}

	async createPost(text: string, replyTo?: {uri: string; cid: string}): Promise<BlueskyPost> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		const post = {
			$text: 'app.bsky.feed.post',
			text,
			createdAt: new Date().toISOString(),
			...(replyTo && {
				reply: {
					root: replyTo,
					parent: replyTo,
				},
			}),
		};

		// Validate against lexicon
		const validation = lexiconManager.validate(post, 'app.bsky.feed.post');
		if (!validation.valid) {
			throw new Error(`Invalid post: ${validation.errors.join(', ')}`);
		}

		const response = await fetch(`${BlueskyClient.API_BASE}/com.atproto.repo.createRecord`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.session.accessJwt}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				repo: this.session.did,
				collection: 'app.bsky.feed.post',
				record: post,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to create post');
		}

		const data = await response.json();
		return this.transformPost(data);
	}

	async likePost(uri: string, cid: string): Promise<void> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		const like = {
			$text: 'app.bsky.feed.like',
			subject: {uri, cid},
			createdAt: new Date().toISOString(),
		};

		const validation = lexiconManager.validate(like, 'app.bsky.feed.like');
		if (!validation.valid) {
			throw new Error(`Invalid like: ${validation.errors.join(', ')}`);
		}

		const response = await fetch(`${BlueskyClient.API_BASE}/com.atproto.repo.createRecord`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.session.accessJwt}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				repo: this.session.did,
				collection: 'app.bsky.feed.like',
				record: like,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to like post');
		}
	}

	async unlikePost(uri: string): Promise<void> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		const response = await fetch(`${BlueskyClient.API_BASE}/com.atproto.repo.deleteRecord`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.session.accessJwt}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				repo: this.session.did,
				collection: 'app.bsky.feed.like',
				rkey: uri.split('/').pop(),
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to unlike post');
		}
	}

	async repostPost(uri: string, cid: string): Promise<void> {
		if (!this.session) {
			throw new Error('Not authenticated');
		}

		const repost = {
			$text: 'app.bsky.feed.repost',
			subject: {uri, cid},
			createdAt: new Date().toISOString(),
		};

		const validation = lexiconManager.validate(repost, 'app.bsky.feed.repost');
		if (!validation.valid) {
			throw new Error(`Invalid repost: ${validation.errors.join(', ')}`);
		}

		const response = await fetch(`${BlueskyClient.API_BASE}/com.atproto.repo.createRecord`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${this.session.accessJwt}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				repo: this.session.did,
				collection: 'app.bsky.feed.repost',
				record: repost,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to repost post');
		}
	}

	private transformPosts(posts: unknown[]): BlueskyPost[] {
		return posts.map(post => this.transformPost(post));
	}

	private transformPost(post: unknown): BlueskyPost {
		const p = post as any;
		return {
			uri: p.post.uri,
			cid: p.post.cid,
			author: {
				did: p.post.author.did,
				handle: p.post.author.handle,
				displayName: p.post.author.displayName,
				avatar: p.post.author.avatar,
			},
			text: p.post.record?.text || '',
			createdAt: p.post.record?.createdAt || p.post.indexedAt,
			likes: p.post.likeCount || 0,
			reposts: p.post.repostCount || 0,
			replies: p.post.replyCount || 0,
			liked: !!p.viewer?.like,
			reposted: !!p.viewer?.repost,
		};
	}

	private transformNotifications(notifications: unknown[]): BlueskyNotification[] {
		return notifications.map(notif => {
			const n = notif as any;
			return {
				id: n.uri,
				type: this.mapNotificationType(n.reason),
				actor: {
					did: n.author.did,
					handle: n.author.handle,
					displayName: n.author.displayName,
				},
				post: n.record ? {
					uri: n.record.uri,
					cid: n.record.cid,
					text: n.record.text || '',
				} : undefined,
				createdAt: n.indexedAt || n.createdAt,
			};
		});
	}

	private mapNotificationType(reason: string): BlueskyNotification['type'] {
		switch (reason) {
			case 'like':
				return 'like';
			case 'repost':
				return 'repost';
			case 'follow':
				return 'follow';
			case 'reply':
				return 'reply';
			default:
				return 'like';
		}
	}
}
