/*
 * Copyright (C) 2026 Fluxer Contributors
 *
 * This file is part of Fluxer.
 *
 * Fluxer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import type {Hono} from 'hono';
import {z} from 'zod';
import {requireAdminACL} from '../middleware/AdminMiddleware';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';
import type {User} from '../models/User';
import {UserFlags} from '@fluxer/constants/src/UserConstants';

// In-memory system bot configuration (can be persisted to database later)
interface SystemBotConfig {
	username: string;
	discriminator: number;
	global_name: string | null;
	avatar_hash: string | null;
	avatar_color: number | null;
	banner_hash: string | null;
	banner_color: number | null;
	bio: string | null;
	pronouns: string | null;
	accent_color: number | null;
	flags: bigint;
	custom_tag: string | null;
	updated_at: Date;
	updated_by: bigint | null;
}

let systemBotConfig: SystemBotConfig = {
	username: 'Fluxer',
	discriminator: 0,
	global_name: null,
	avatar_hash: null,
	avatar_color: null,
	banner_hash: null,
	banner_color: null,
	bio: 'The official Fluxer system bot.',
	pronouns: null,
	accent_color: null,
	flags: BigInt(UserFlags.SYSTEM | UserFlags.BOT),
	custom_tag: null,
	updated_at: new Date(),
	updated_by: null,
};

// Validation schemas
const updateSystemBotSchema = z.object({
	username: z.string().min(1).max(32).optional(),
	discriminator: z.number().int().min(0).max(9999).optional(),
	global_name: z.string().max(32).optional().nullable(),
	avatar_hash: z.string().optional().nullable(),
	avatar_color: z.number().optional().nullable(),
	banner_hash: z.string().optional().nullable(),
	banner_color: z.number().optional().nullable(),
	bio: z.string().max(190).optional().nullable(),
	pronouns: z.string().max(40).optional().nullable(),
	accent_color: z.number().optional().nullable(),
	flags: z.string().optional(), // bigint as string
	custom_tag: z.string().max(16).optional().nullable(),
});

export function registerSystemBotRoutes(app: Hono) {
	// Get system bot configuration (public)
	app.get('/api/system-bot', async (c) => {
		return c.json({
			config: {
				...systemBotConfig,
				flags: systemBotConfig.flags.toString(),
			},
		});
	});

	// Update system bot (admin only)
	app.patch(
		'/api/system-bot',
		requireAdminACL(AdminACLs.USER_UPDATE_BOT_STATUS),
		async (c) => {
			const user = c.get('user') as User;
			const body = await c.req.json();
			const result = updateSystemBotSchema.safeParse(body);
			
			if (!result.success) {
				return c.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			
			// Update config
			if (data.username !== undefined) {
				systemBotConfig.username = data.username;
			}
			if (data.discriminator !== undefined) {
				systemBotConfig.discriminator = data.discriminator;
			}
			if (data.global_name !== undefined) {
				systemBotConfig.global_name = data.global_name;
			}
			if (data.avatar_hash !== undefined) {
				systemBotConfig.avatar_hash = data.avatar_hash;
			}
			if (data.avatar_color !== undefined) {
				systemBotConfig.avatar_color = data.avatar_color;
			}
			if (data.banner_hash !== undefined) {
				systemBotConfig.banner_hash = data.banner_hash;
			}
			if (data.banner_color !== undefined) {
				systemBotConfig.banner_color = data.banner_color;
			}
			if (data.bio !== undefined) {
				systemBotConfig.bio = data.bio;
			}
			if (data.pronouns !== undefined) {
				systemBotConfig.pronouns = data.pronouns;
			}
			if (data.accent_color !== undefined) {
				systemBotConfig.accent_color = data.accent_color;
			}
			if (data.flags !== undefined) {
				systemBotConfig.flags = BigInt(data.flags);
			}
			if (data.custom_tag !== undefined) {
				systemBotConfig.custom_tag = data.custom_tag;
			}
			
			systemBotConfig.updated_at = new Date();
			systemBotConfig.updated_by = user.id;

			return c.json({
				config: {
					...systemBotConfig,
					flags: systemBotConfig.flags.toString(),
				},
			});
		}
	);

	// Reset system bot to defaults (admin only)
	app.post(
		'/api/system-bot/reset',
		requireAdminACL(AdminACLs.USER_UPDATE_BOT_STATUS),
		async (c) => {
			const user = c.get('user') as User;
			
			systemBotConfig = {
				username: 'Fluxer',
				discriminator: 0,
				global_name: null,
				avatar_hash: null,
				avatar_color: null,
				banner_hash: null,
				banner_color: null,
				bio: 'The official Fluxer system bot.',
				pronouns: null,
				accent_color: null,
				flags: BigInt(UserFlags.SYSTEM | UserFlags.BOT),
				custom_tag: null,
				updated_at: new Date(),
				updated_by: user.id,
			};

			return c.json({
				config: {
					...systemBotConfig,
					flags: systemBotConfig.flags.toString(),
				},
			});
		}
	);

	// Get available user flags (public)
	app.get('/api/system-bot/flags', async (c) => {
		return c.json({
			flags: {
				STAFF: UserFlags.STAFF,
				CTP_MEMBER: UserFlags.CTP_MEMBER,
				PARTNER: UserFlags.PARTNER,
				BUG_HUNTER: UserFlags.BUG_HUNTER,
				SYSTEM: UserFlags.SYSTEM,
				BOT: UserFlags.BOT,
				FRIENDLY_BOT: UserFlags.FRIENDLY_BOT,
				FRIENDLY_BOT_MANUAL_APPROVAL: UserFlags.FRIENDLY_BOT_MANUAL_APPROVAL,
				HIGH_GLOBAL_RATE_LIMIT: UserFlags.HIGH_GLOBAL_RATE_LIMIT,
				RATE_LIMIT_BYPASS: UserFlags.RATE_LIMIT_BYPASS,
			},
		});
	});
}

// Export for use in UserRepository to get the current system bot config
export function getSystemBotConfig(): SystemBotConfig {
	return {...systemBotConfig};
}
