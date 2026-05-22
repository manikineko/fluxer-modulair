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

import {BadgeRepository} from '@fluxer/api/src/badges/repositories/BadgeRepository';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';
import {requireAdminACL} from '@fluxer/api/src/middleware/AdminMiddleware';
import type {HonoApp} from '@fluxer/api/src/types/HonoEnv';
import {z} from 'zod';
import type {BadgeRow, UserBadgeRow} from '@fluxer/api/src/database/types/PartnerBadgeTypes';
import type {User} from '@fluxer/api/src/models/User';
import type {UserID} from '@fluxer/api/src/BrandedTypes';

const badgeRepo = new BadgeRepository();

const createBadgeSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().min(1).max(500),
	icon_hash: z.string().min(1),
	icon_color: z.number().optional(),
	badge_type: z.enum(['system', 'partner', 'achievement', 'event', 'custom']),
	is_visible: z.boolean().optional(),
	priority: z.number().min(0).max(10000).optional(),
});

const updateBadgeSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().min(1).max(500).optional(),
	icon_hash: z.string().optional(),
	icon_color: z.number().optional(),
	badge_type: z.enum(['system', 'partner', 'achievement', 'event', 'custom']).optional(),
	is_active: z.boolean().optional(),
	is_visible: z.boolean().optional(),
	priority: z.number().min(0).max(10000).optional(),
});

const grantBadgeSchema = z.object({
	user_id: z.string(),
	badge_id: z.string(),
	reason: z.string().optional(),
	expires_at: z.string().datetime().optional(),
});

export function BadgeAdminController(app: HonoApp) {
	// List all badges
	app.get(
		'/admin/badges',
		requireAdminACL(AdminACLs.BADGE_CREATE),
		async (ctx) => {
			const badges = await badgeRepo.findAll();
			return ctx.json({badges});
		},
	);

	// Get badge by ID
	app.get(
		'/admin/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_CREATE),
		async (ctx) => {
			const badgeId = ctx.req.param('badgeId');
			const badge = await badgeRepo.findById(badgeId);
			if (!badge) {
				return ctx.json({error: 'Badge not found'}, 404);
			}
			return ctx.json({badge});
		},
	);

	// Create badge
	app.post(
		'/admin/badges',
		requireAdminACL(AdminACLs.BADGE_CREATE),
		async (ctx) => {
			const body = await ctx.req.json();
			const result = createBadgeSchema.safeParse(body);
			if (!result.success) {
				return ctx.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			const badgeId = `badge_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			const badge: BadgeRow = {
				badge_id: badgeId,
				name: data.name,
				description: data.description,
				icon_hash: data.icon_hash,
				icon_color: data.icon_color ?? null,
				badge_type: data.badge_type,
				is_active: true,
				is_visible: data.is_visible ?? true,
				priority: data.priority ?? 100,
				granted_count: 0,
				created_at: new Date(),
				updated_at: new Date(),
			};

			const created = await badgeRepo.create(badge);
			return ctx.json({badge: created}, 201);
		},
	);

	// Update badge
	app.patch(
		'/admin/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_UPDATE),
		async (ctx) => {
			const badgeId = ctx.req.param('badgeId');
			const existing = await badgeRepo.findById(badgeId);
			if (!existing) {
				return ctx.json({error: 'Badge not found'}, 404);
			}

			const body = await ctx.req.json();
			const result = updateBadgeSchema.safeParse(body);
			if (!result.success) {
				return ctx.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			const updated: BadgeRow = {
				...existing,
				...(data.name !== undefined && {name: data.name}),
				...(data.description !== undefined && {description: data.description}),
				...(data.icon_hash !== undefined && {icon_hash: data.icon_hash}),
				...(data.icon_color !== undefined && {icon_color: data.icon_color}),
				...(data.badge_type !== undefined && {badge_type: data.badge_type}),
				...(data.is_active !== undefined && {is_active: data.is_active}),
				...(data.is_visible !== undefined && {is_visible: data.is_visible}),
				...(data.priority !== undefined && {priority: data.priority}),
				updated_at: new Date(),
			};

			const saved = await badgeRepo.update(updated);
			return ctx.json({badge: saved});
		},
	);

	// Delete badge
	app.delete(
		'/admin/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_DELETE),
		async (ctx) => {
			const badgeId = ctx.req.param('badgeId');
			await badgeRepo.delete(badgeId);
			return ctx.json({success: true});
		},
	);

	// Grant badge to user
	app.post(
		'/admin/badges/grant',
		requireAdminACL(AdminACLs.BADGE_GRANT),
		async (ctx) => {
			const user = ctx.get('user') as User;
			const body = await ctx.req.json();
			const result = grantBadgeSchema.safeParse(body);
			if (!result.success) {
				return ctx.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;

			// Verify badge exists
			const badge = await badgeRepo.findById(data.badge_id);
			if (!badge) {
				return ctx.json({error: 'Badge not found'}, 404);
			}

			const userBadge: UserBadgeRow = {
				user_id: BigInt(data.user_id) as UserID,
				badge_id: data.badge_id,
				granted_by_user_id: user.id,
				granted_at: new Date(),
				expires_at: data.expires_at ? new Date(data.expires_at) : null,
				is_active: true,
				metadata: data.reason ? JSON.stringify({reason: data.reason}) : null,
			};

			await badgeRepo.grantBadgeToUser(userBadge);
			return ctx.json({success: true}, 201);
		},
	);

	// Revoke badge from user
	app.post(
		'/admin/badges/revoke',
		requireAdminACL(AdminACLs.BADGE_REVOKE),
		async (ctx) => {
			const body = await ctx.req.json();
			const {user_id, badge_id} = body;
			if (!user_id || !badge_id) {
				return ctx.json({error: 'user_id and badge_id are required'}, 400);
			}

			await badgeRepo.revokeBadgeFromUser(BigInt(user_id) as UserID, badge_id);
			return ctx.json({success: true});
		},
	);
}
