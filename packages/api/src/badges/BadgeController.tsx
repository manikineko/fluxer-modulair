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
import {BadgeRepository} from './repositories/BadgeRepository';
import type {BadgeRow, UserBadgeRow} from '../database/types/PartnerBadgeTypes';
import {z} from 'zod';
import {requireAdminACL} from '../middleware/AdminMiddleware';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';
import type {User} from '../models/User';
import type {UserID} from '../BrandedTypes';

const badgeRepo = new BadgeRepository();

// Validation schemas
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

export function registerBadgeRoutes(app: Hono) {
	// Get all badges (public)
	app.get('/api/badges', async (c) => {
		const showInactive = c.req.query('show_inactive') === 'true';
		const badges = showInactive 
			? await badgeRepo.findAll()
			: await badgeRepo.findActive();
		return c.json({badges});
	});

	// Get badge by ID (public)
	app.get('/api/badges/:badgeId', async (c) => {
		const badgeId = c.req.param('badgeId');
		const badge = await badgeRepo.findById(badgeId);
		
		if (!badge) {
			return c.json({error: 'Badge not found'}, 404);
		}
		
		return c.json({badge});
	});

	// Get user's badges (public)
	app.get('/api/users/:userId/badges', async (c) => {
		const userId = BigInt(c.req.param('userId')) as UserID;
		const userBadges = await badgeRepo.findUserBadges(userId);
		
		// Fetch full badge details for each
		const badgeDetails = await Promise.all(
			userBadges
				.filter(ub => ub.is_active)
				.map(async ub => {
					const badge = await badgeRepo.findById(ub.badge_id);
					return badge ? {...badge, granted_at: ub.granted_at, metadata: ub.metadata} : null;
				})
		);
		
		return c.json({badges: badgeDetails.filter(Boolean)});
	});

	// Create badge (global staff only)
	app.post(
		'/api/badges',
		requireAdminACL(AdminACLs.BADGE_CREATE),
		async (c) => {
			const body = await c.req.json();
			const result = createBadgeSchema.safeParse(body);
			
			if (!result.success) {
				return c.json({error: 'Invalid input', details: result.error.issues}, 400);
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
			return c.json({badge: created}, 201);
		}
	);

	// Update badge (global staff only)
	app.patch(
		'/api/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_UPDATE),
		async (c) => {
			const badgeId = c.req.param('badgeId');
			const existing = await badgeRepo.findById(badgeId);
			
			if (!existing) {
				return c.json({error: 'Badge not found'}, 404);
			}

			const body = await c.req.json();
			const result = updateBadgeSchema.safeParse(body);
			
			if (!result.success) {
				return c.json({error: 'Invalid input', details: result.error.issues}, 400);
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
			return c.json({badge: saved});
		}
	);

	// Delete badge (global staff only)
	app.delete(
		'/api/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_DELETE),
		async (c) => {
			const badgeId = c.req.param('badgeId');
			await badgeRepo.delete(badgeId);
			return c.json({success: true});
		}
	);

	// Grant badge to user (global staff only)
	app.post(
		'/api/badges/grant',
		requireAdminACL(AdminACLs.BADGE_GRANT),
		async (c) => {
			const user = c.get('user') as User;
			const body = await c.req.json();
			const result = grantBadgeSchema.safeParse(body);
			
			if (!result.success) {
				return c.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			
			// Verify badge exists
			const badge = await badgeRepo.findById(data.badge_id);
			if (!badge) {
				return c.json({error: 'Badge not found'}, 404);
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
			return c.json({success: true}, 201);
		}
	);

	// Revoke badge from user (global staff only)
	app.post(
		'/api/badges/revoke',
		requireAdminACL(AdminACLs.BADGE_REVOKE),
		async (c) => {
			const body = await c.req.json();
			const {user_id, badge_id} = body;
			
			if (!user_id || !badge_id) {
				return c.json({error: 'user_id and badge_id are required'}, 400);
			}
			
			await badgeRepo.revokeBadgeFromUser(BigInt(user_id) as UserID, badge_id);
			return c.json({success: true});
		}
	);
}
