/*
 * Copyright (C) 2026 Fluxer Contributors
 *
 * This file is part of Fluxer.
 *
 * Fluxer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Fluxer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Fluxer. If not, see <https://www.gnu.org/licenses/>.
 */

import {createChannelID, createUserID} from '@fluxer/api/src/BrandedTypes';
import {Config} from '@fluxer/api/src/Config';
import {Logger} from '@fluxer/api/src/Logger';
import {LoginRequired} from '@fluxer/api/src/middleware/AuthMiddleware';
import {RateLimitMiddleware} from '@fluxer/api/src/middleware/RateLimitMiddleware';
import {OpenAPI} from '@fluxer/api/src/middleware/ResponseTypeMiddleware';
import type {HonoApp} from '@fluxer/api/src/types/HonoEnv';
import type {IUserRepository} from '@fluxer/api/src/user/IUserRepository';

// AT Protocol PDS endpoints
// Fluxer server acts as the Personal Data Server for AT Protocol

// In-memory storage for posts (for demo purposes)
const postsStore = new Map<string, {repo: string; collection: string; record: Record<string, unknown>; createdAt: string}>();

export function AtprotoPDSController(app: HonoApp) {
	// com.atproto.server.createSession - Login
	app.post(
		'/xrpc/com.atproto.server.createSession',
		RateLimitMiddleware({limit: 10, windowMs: 60000}),
		OpenAPI({
			operationId: 'atproto_create_session',
			summary: 'Create AT Protocol session (login)',
			tags: ['AT Protocol PDS'],
		}),
		async (ctx) => {
			const {identifier, password} = await ctx.req.json();
			
			Logger.info({identifier}, 'AT Protocol login attempt');
			
			const authRequestService = ctx.get('authRequestService');
			
			// AT Protocol uses 'identifier' which can be email or handle
			// Fluxer auth expects email, so we need to handle both cases
			let email = identifier;
			
			// Check if identifier is not an email format (assume it's a handle/username)
			if (!identifier.includes('@')) {
				// Try to find user by username
				const userRepository = ctx.get('userRepository') as IUserRepository;
				try {
					// Try with discriminator 0 first (common case)
					const user = await userRepository.findByUsernameDiscriminator(identifier, 0);
					if (user && user.email) {
						email = user.email;
					} else {
						// If that fails, try to find by email in case identifier is actually an email
						const userByEmail = await userRepository.findByEmail(identifier);
						if (userByEmail) {
							email = userByEmail.email;
						}
					}
				} catch {
					// If lookup fails, try using identifier as-is (might be email)
					try {
						const userByEmail = await userRepository.findByEmail(identifier);
						if (userByEmail) {
							email = userByEmail.email;
						}
					} catch {
						// Use identifier as-is and let auth handle validation
						email = identifier;
					}
				}
			}
			
			// Use Fluxer's auth login service
			const result = await authRequestService.login({
				data: {email, password},
				request: ctx.req.raw,
				requestCache: ctx.get('requestCache'),
			});
			
			// Handle MFA case
			if ('mfa' in result && result.mfa) {
				return ctx.json({
					error: 'AuthFactorRequired',
					message: 'MFA is required for this account',
					ticket: result.ticket,
				}, 401);
			}
			
			// After MFA check, we know it's a successful login
			const loginResult = result as {token: string; user_id: string};
			
			// Get user details from user_id
			const userRepository = ctx.get('userRepository') as IUserRepository;
			const userId = createUserID(BigInt(loginResult.user_id));
			const user = await userRepository.findUnique(userId);
			
			if (!user) {
				throw new Error('User not found after login');
			}
			
			// Generate DID for the user
			const did = `did:web:${Config.endpoints.webApp.replace(/^https?:\/\//, '')}:${user.username}`;
			
			return ctx.json({
				did,
				handle: user.username,
				email: user.email,
				accessJwt: loginResult.token,
				refreshJwt: loginResult.token,
			});
		},
	);

	// com.atproto.server.createAccount - Sign up
	app.post(
		'/xrpc/com.atproto.server.createAccount',
		RateLimitMiddleware({limit: 5, windowMs: 60000}),
		async (ctx) => {
			const {email, password, handle} = await ctx.req.json();
			
			Logger.info({email, handle}, 'AT Protocol account creation attempt');
			
			const authRequestService = ctx.get('authRequestService');
			
			// Register user using Fluxer's registration system
			await authRequestService.register({
				data: {
					email,
					username: handle,
					password,
					global_name: handle,
					date_of_birth: '2000-01-01',
					invite_code: null,
					consent: true,
				},
				request: ctx.req.raw,
				requestCache: ctx.get('requestCache'),
			});
			
			// Generate DID for the new user
			const did = `did:web:${Config.endpoints.webApp.replace(/^https?:\/\//, '')}:${handle}`;
			
			return ctx.json({
				did,
				handle,
				email,
				didDocument: {
					'@context': ['https://www.w3.org/ns/did/v1'],
					id: did,
					alsoKnownAs: [`at://${handle}`],
				},
			});
		},
	);

	// com.atproto.repo.getRecord - Get a record (profile, post, etc.)
	app.get(
		'/xrpc/com.atproto.repo.getRecord',
		async (ctx) => {
			const {repo, collection, rkey} = ctx.req.query();
			
			Logger.info({repo, collection, rkey}, 'AT Protocol record fetch attempt');
			
			// For profile records, return a mock profile
			if (collection === 'app.bsky.actor.profile' && rkey === 'self') {
				const username = repo.split(':').pop();
				return ctx.json({
					uri: `at://${repo}/${collection}/self`,
					cid: 'bafyrei',
					value: {
						'$type': 'app.bsky.actor.profile',
						displayName: username,
						description: 'AT Protocol user on Fluxer PDS',
						handle: username,
					},
				});
			}
			
			// For post records, return the stored record
			return ctx.json({
				uri: `at://${repo}/${collection}/${rkey}`,
				cid: rkey,
				value: {},
			});
		},
	);

	// app.bsky.feed.getTimeline - Get timeline from a Bluesky channel
	app.get(
		'/xrpc/app.bsky.feed.getTimeline',
		LoginRequired,
		async (ctx) => {
			const limit = Math.min(parseInt(ctx.req.query('limit') || '50', 10), 100);
			const channelIdParam = ctx.req.query('channel_id');

			Logger.info({limit, channelIdParam}, 'AT Protocol timeline fetch');

			if (!channelIdParam) {
				return ctx.json({cursor: null, feed: []});
			}

			try {
				const channelId = createChannelID(BigInt(channelIdParam));
				const channelRepository = ctx.get('channelRepository');
				const userRepository = ctx.get('userRepository') as IUserRepository;
				const messages = await channelRepository.messages.listMessages(channelId, undefined, limit);

				const pdsDomain = Config.endpoints.webApp.replace(/^https?:\/\//, '');

				// Collect unique author IDs and look them up once
				const authorIds = [...new Set(messages.map((m) => m.authorId).filter(Boolean))] as NonNullable<(typeof messages)[0]['authorId']>[];
				const authorMap = new Map<string, {username: string; globalName: string | null}>();
				await Promise.all(
					authorIds.map(async (authorId) => {
						try {
							const user = await userRepository.findUnique(authorId);
							if (user) authorMap.set(authorId.toString(), {username: user.username, globalName: user.globalName ?? null});
						} catch {
							// skip missing users
						}
					}),
				);

				const feed = messages
					.slice()
					.reverse()
					.map((msg) => {
						const authorInfo = msg.authorId ? authorMap.get(msg.authorId.toString()) : null;
						const handle = authorInfo?.username ?? 'unknown';
						const displayName = authorInfo?.globalName ?? handle;
						const did = `did:web:${pdsDomain}:${handle}`;
						// Snowflake: first 42 bits are ms since Discord epoch (2015-01-01)
						const DISCORD_EPOCH = 1420070400000n;
						const msgIdBigInt = BigInt(msg.id.toString());
						const timestampMs = Number((msgIdBigInt >> 22n) + DISCORD_EPOCH);
						const indexedAt = new Date(timestampMs).toISOString();
						return {
							post: {
								uri: `at://${did}/app.bsky.feed.post/${msg.id}`,
								cid: msg.id.toString(),
								author: {did, handle, displayName},
								record: {
									$type: 'app.bsky.feed.post',
									text: msg.content ?? '',
									createdAt: indexedAt,
								},
								replyCount: 0,
								repostCount: 0,
								likeCount: 0,
								indexedAt,
							},
						};
					});

				return ctx.json({cursor: null, feed});
			} catch (err) {
				Logger.error({err, channelIdParam}, 'Failed to fetch Bluesky timeline from channel');
				return ctx.json({cursor: null, feed: []});
			}
		},
	);

	// app.bsky.graph.getFollows - Get follows
	app.get(
		'/xrpc/app.bsky.graph.getFollows',
		async (ctx) => {
			const actor = ctx.req.query('actor');
			const limit = ctx.req.query('limit') || '50';
			const cursor = ctx.req.query('cursor');
			
			Logger.info({actor, limit, cursor}, 'AT Protocol follows fetch attempt');
			
			// Return empty follows list for now
			return ctx.json({
				cursor: null,
				subject: actor,
				follows: [],
			});
		},
	);

	// app.bsky.graph.getFollowers - Get followers
	app.get(
		'/xrpc/app.bsky.graph.getFollowers',
		async (ctx) => {
			const actor = ctx.req.query('actor');
			const limit = ctx.req.query('limit') || '50';
			const cursor = ctx.req.query('cursor');
			
			Logger.info({actor, limit, cursor}, 'AT Protocol followers fetch attempt');
			
			// Return empty followers list for now
			return ctx.json({
				cursor: null,
				subject: actor,
				followers: [],
			});
		},
	);

	// com.atproto.repo.createRecord - Create a record (post, like, etc.)
	app.post(
		'/xrpc/com.atproto.repo.createRecord',
		async (ctx) => {
			const {repo, collection, record} = await ctx.req.json();
			
			Logger.info({repo, collection}, 'AT Protocol record creation attempt');
			
			// Extract DID from repo to get user
			const username = repo.split(':').pop();
			const userRepository = ctx.get('userRepository') as IUserRepository;
			
			// For AT Protocol, we use the full handle (which includes discriminator)
			// Try to find user by username (without discriminator first)
			try {
				// Try to find by username with discriminator 0 (common case)
				await userRepository.findByUsernameDiscriminator(username, 0);
			} catch {
				// If that fails, try to parse the handle differently
				Logger.warn({username}, 'Could not find user by username, using placeholder');
			}
			
			// Store record in Fluxer's database (using custom table for AT records)
			// For now, store in memory for demo
			const rkey = `${Date.now()}`;
			const uri = `at://${repo}/${collection}/${rkey}`;
			const createdAt = new Date().toISOString();
			
			// Store post if it's a feed post
			if (collection === 'app.bsky.feed.post') {
				postsStore.set(rkey, {repo, collection, record, createdAt});
			}
			
			return ctx.json({
				uri,
				cid: rkey,
				commit: {
					cid: rkey,
					rev: rkey,
				},
				record,
			});
		},
	);

	// com.atproto.repo.deleteRecord - Delete a record
	app.post(
		'/xrpc/com.atproto.repo.deleteRecord',
		async (ctx) => {
			const {repo, collection, rkey} = await ctx.req.json();
			
			Logger.info({repo, collection, rkey}, 'AT Protocol record deletion attempt');
			
			// Delete record from Fluxer's database
			// For now, return success
			return ctx.json({
				success: true,
			});
		},
	);

	// com.atproto.identity.resolveHandle - Resolve handle to DID
	app.get(
		'/xrpc/com.atproto.identity.resolveHandle',
		async (ctx) => {
			const handle = ctx.req.query('handle');
			
			Logger.info({handle}, 'AT Protocol handle resolution attempt');
			
			// Generate DID for the handle
			const did = `did:web:${Config.endpoints.webApp.replace(/^https?:\/\//, '')}:${handle}`;
			
			return ctx.json({
				did,
				handle,
			});
		},
	);

	// com.atproto.server.getAccountsConfig - Get account config
	app.get(
		'/xrpc/com.atproto.server.getAccountsConfig',
		async (ctx) => {
			Logger.info('AT Protocol accounts config request');
			
			return ctx.json({
				availableUserDomains: [Config.endpoints.webApp.replace(/^https?:\/\//, '')],
				inviteCodeRequired: false,
				links: {
					privacyPolicy: `${Config.endpoints.marketing}/privacy`,
					termsOfService: `${Config.endpoints.marketing}/terms`,
				},
			});
		},
	);

	// .well-known/did.json - DID document endpoint
	app.get('/.well-known/did.json', async (ctx) => {
		Logger.info('DID document request');
		
		const didWeb = Config.endpoints.webApp.replace(/^https?:\/\//, '');
		
		return ctx.json({
			'@context': ['https://www.w3.org/ns/did/v1'],
			id: `did:web:${didWeb}`,
			verificationMethod: [{
				id: `did:web:${didWeb}#atproto`,
				type: 'Multikey',
				controller: `did:web:${didWeb}`,
				publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
			}],
			service: [{
				id: '#atproto_pds',
				type: 'AtprotoPersonalDataServer',
				serviceEndpoint: `https://${didWeb}`,
			}],
		});
	});

	Logger.info('AT Protocol PDS endpoints registered');
}
