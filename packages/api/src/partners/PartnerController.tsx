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
import {PartnerRepository} from './repositories/PartnerRepository';
import type {PartnerRow} from '../database/types/PartnerBadgeTypes';
import {z} from 'zod';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';
import type {User} from '../models/User';
import type {UserID} from '../BrandedTypes';
import {createMiddleware} from 'hono/factory';
import {UnauthorizedError} from '@fluxer/errors/src/domains/core/UnauthorizedError';
import {MissingACLError} from '@fluxer/errors/src/domains/core/MissingACLError';
import type {HonoEnv} from '@fluxer/api/src/types/HonoEnv';

// Custom middleware that does NOT allow wildcard to bypass
function requireAdminACLNoWildcard(requiredACL: string) {
	return createMiddleware<HonoEnv>(async (ctx, next) => {
		const adminUser = ctx.get('user');
		if (!adminUser) throw new UnauthorizedError();

		const tokenType = ctx.get('authTokenType');
		if (tokenType !== 'bearer' && tokenType !== 'session' && tokenType !== 'admin_api_key')
			throw new UnauthorizedError();

		if (tokenType === 'bearer') {
			const oauthScopes = ctx.get('oauthBearerScopes');
			if (!oauthScopes || !oauthScopes.has('admin')) {
				throw new UnauthorizedError();
			}
		}

		const userAcls: Set<string> =
			tokenType === 'admin_api_key' ? (ctx.get('adminApiKeyAcls') ?? new Set()) : adminUser.acls;

		if (!adminUser.acls.has(AdminACLs.AUTHENTICATE)) {
			throw new UnauthorizedError();
		}

		// Explicitly check for the required ACL - wildcard does NOT bypass this
		if (!userAcls.has(requiredACL)) {
			throw new MissingACLError(requiredACL);
		}

		ctx.set('adminUserId', adminUser.id);
		ctx.set('adminUserAcls', userAcls);
		await next();
	});
}

const partnerRepo = new PartnerRepository();

// Validation schemas
const createPartnerSchema = z.object({
	name: z.string().min(1).max(100),
	description: z.string().optional(),
	icon_hash: z.string().optional(),
	banner_hash: z.string().optional(),
	website_url: z.string().url().optional(),
	support_url: z.string().url().optional(),
	privacy_policy_url: z.string().url().optional(),
	terms_of_service_url: z.string().url().optional(),
	owner_user_id: z.string(),
	partner_type: z.enum(['community', 'developer', 'content_creator', 'enterprise', 'other']),
	metadata: z.string().optional(),
});

const updatePartnerSchema = z.object({
	name: z.string().min(1).max(100).optional(),
	description: z.string().optional(),
	icon_hash: z.string().optional(),
	banner_hash: z.string().optional(),
	website_url: z.string().url().optional(),
	support_url: z.string().url().optional(),
	privacy_policy_url: z.string().url().optional(),
	terms_of_service_url: z.string().url().optional(),
	is_active: z.boolean().optional(),
	partner_type: z.enum(['community', 'developer', 'content_creator', 'enterprise', 'other']).optional(),
	metadata: z.string().optional(),
	expires_at: z.string().datetime().optional().nullable(),
});

export function registerPartnerRoutes(app: Hono) {
	// Get all partners (public)
	app.get('/partners', async (c) => {
		const showInactive = c.req.query('show_inactive') === 'true';
		const partners = showInactive
			? await partnerRepo.findAll()
			: await partnerRepo.findActive();
		return c.json({partners});
	});

	// Get partner by ID (public)
	app.get('/partners/:partnerId', async (c) => {
		const partnerId = c.req.param('partnerId');
		const partner = await partnerRepo.findById(partnerId);

		if (!partner) {
			return c.json({error: 'Partner not found'}, 404);
		}

		return c.json({partner});
	});

	// Create partner (global staff only)
	app.post(
		'/partners',
		requireAdminACLNoWildcard(AdminACLs.PARTNER_CREATE),
		async (c) => {
			const user = c.get('user') as User;
			const body = await c.req.json();
			const result = createPartnerSchema.safeParse(body);
			
			if (!result.success) {
				return c.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			const partnerId = `partner_${Date.now()}_${Math.random().toString(36).substring(7)}`;
			
			const partner: PartnerRow = {
				partner_id: partnerId,
				name: data.name,
				description: data.description ?? null,
				icon_hash: data.icon_hash ?? null,
				banner_hash: data.banner_hash ?? null,
				website_url: data.website_url ?? null,
				support_url: data.support_url ?? null,
				privacy_policy_url: data.privacy_policy_url ?? null,
				terms_of_service_url: data.terms_of_service_url ?? null,
				owner_user_id: BigInt(data.owner_user_id) as UserID,
				assigned_by_user_id: user.id,
				assigned_at: new Date(),
				expires_at: null,
				is_active: true,
				partner_type: data.partner_type,
				metadata: data.metadata ?? null,
				created_at: new Date(),
				updated_at: new Date(),
			};

			const created = await partnerRepo.create(partner);
			return c.json({partner: created}, 201);
		}
	);

	// Update partner (global staff only)
	app.patch(
		'/partners/:partnerId',
		requireAdminACLNoWildcard(AdminACLs.PARTNER_UPDATE),
		async (c) => {
			const partnerId = c.req.param('partnerId');
			const existing = await partnerRepo.findById(partnerId);
			
			if (!existing) {
				return c.json({error: 'Partner not found'}, 404);
			}

			const body = await c.req.json();
			const result = updatePartnerSchema.safeParse(body);
			
			if (!result.success) {
				return c.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			const updated: PartnerRow = {
				...existing,
				...(data.name !== undefined && {name: data.name}),
				...(data.description !== undefined && {description: data.description}),
				...(data.icon_hash !== undefined && {icon_hash: data.icon_hash}),
				...(data.banner_hash !== undefined && {banner_hash: data.banner_hash}),
				...(data.website_url !== undefined && {website_url: data.website_url}),
				...(data.support_url !== undefined && {support_url: data.support_url}),
				...(data.privacy_policy_url !== undefined && {privacy_policy_url: data.privacy_policy_url}),
				...(data.terms_of_service_url !== undefined && {terms_of_service_url: data.terms_of_service_url}),
				...(data.is_active !== undefined && {is_active: data.is_active}),
				...(data.partner_type !== undefined && {partner_type: data.partner_type}),
				...(data.metadata !== undefined && {metadata: data.metadata}),
				...(data.expires_at !== undefined && {expires_at: data.expires_at ? new Date(data.expires_at) : null}),
				updated_at: new Date(),
			};

			const saved = await partnerRepo.update(updated);
			return c.json({partner: saved});
		}
	);

	// Delete partner (global staff only)
	app.delete(
		'/partners/:partnerId',
		requireAdminACLNoWildcard(AdminACLs.PARTNER_DELETE),
		async (c) => {
			const partnerId = c.req.param('partnerId');
			await partnerRepo.delete(partnerId);
			return c.json({success: true});
		}
	);

	// Add badge to partner (global staff only)
	app.post(
		'/partners/:partnerId/badges/:badgeId',
		requireAdminACLNoWildcard(AdminACLs.BADGE_GRANT),
		async (c) => {
			const partnerId = c.req.param('partnerId');
			const badgeId = c.req.param('badgeId');
			
			await partnerRepo.addBadgeToPartner(partnerId, badgeId);
			return c.json({success: true});
		}
	);

	// Remove badge from partner (global staff only)
	app.delete(
		'/partners/:partnerId/badges/:badgeId',
		requireAdminACLNoWildcard(AdminACLs.BADGE_REVOKE),
		async (c) => {
			const partnerId = c.req.param('partnerId');
			const badgeId = c.req.param('badgeId');
			
			await partnerRepo.removeBadgeFromPartner(partnerId, badgeId);
			return c.json({success: true});
		}
	);
}
