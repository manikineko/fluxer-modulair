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

import {PartnerRepository} from '@fluxer/api/src/partners/repositories/PartnerRepository';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';
import {requireAdminACL} from '@fluxer/api/src/middleware/AdminMiddleware';
import type {HonoApp} from '@fluxer/api/src/types/HonoEnv';
import {z} from 'zod';
import type {PartnerRow} from '@fluxer/api/src/database/types/PartnerBadgeTypes';
import type {UserID} from '@fluxer/api/src/BrandedTypes';
import type {User} from '@fluxer/api/src/models/User';

const partnerRepo = new PartnerRepository();

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

export function PartnerAdminController(app: HonoApp) {
	// List all partners
	app.get(
		'/admin/partners',
		requireAdminACL(AdminACLs.PARTNER_CREATE),
		async (ctx) => {
			const partners = await partnerRepo.findAll();
			return ctx.json({partners});
		},
	);

	// Get partner by ID
	app.get(
		'/admin/partners/:partnerId',
		requireAdminACL(AdminACLs.PARTNER_CREATE),
		async (ctx) => {
			const partnerId = ctx.req.param('partnerId');
			const partner = await partnerRepo.findById(partnerId);
			if (!partner) {
				return ctx.json({error: 'Partner not found'}, 404);
			}
			return ctx.json({partner});
		},
	);

	// Create partner
	app.post(
		'/admin/partners',
		requireAdminACL(AdminACLs.PARTNER_CREATE),
		async (ctx) => {
			const user = ctx.get('user') as User;
			const body = await ctx.req.json();
			const result = createPartnerSchema.safeParse(body);
			if (!result.success) {
				return ctx.json({error: 'Invalid input', details: result.error.issues}, 400);
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
			return ctx.json({partner: created}, 201);
		},
	);

	// Update partner
	app.patch(
		'/admin/partners/:partnerId',
		requireAdminACL(AdminACLs.PARTNER_UPDATE),
		async (ctx) => {
			const partnerId = ctx.req.param('partnerId');
			const existing = await partnerRepo.findById(partnerId);
			if (!existing) {
				return ctx.json({error: 'Partner not found'}, 404);
			}

			const body = await ctx.req.json();
			const result = updatePartnerSchema.safeParse(body);
			if (!result.success) {
				return ctx.json({error: 'Invalid input', details: result.error.issues}, 400);
			}

			const data = result.data;
			const updated: PartnerRow = {
				...existing,
				...(data.name !== undefined && {name: data.name}),
				...(data.description !== undefined && {description: data.description}),
				...(data.website_url !== undefined && {website_url: data.website_url}),
				...(data.partner_type !== undefined && {partner_type: data.partner_type}),
				...(data.is_active !== undefined && {is_active: data.is_active}),
				updated_at: new Date(),
			};

			const saved = await partnerRepo.update(updated);
			return ctx.json({partner: saved});
		},
	);

	// Delete partner
	app.delete(
		'/admin/partners/:partnerId',
		requireAdminACL(AdminACLs.PARTNER_DELETE),
		async (ctx) => {
			const partnerId = ctx.req.param('partnerId');
			await partnerRepo.delete(partnerId);
			return ctx.json({success: true});
		},
	);

	// Add badge to partner
	app.post(
		'/admin/partners/:partnerId/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_GRANT),
		async (ctx) => {
			const partnerId = ctx.req.param('partnerId');
			const badgeId = ctx.req.param('badgeId');
			await partnerRepo.addBadgeToPartner(partnerId, badgeId);
			return ctx.json({success: true});
		},
	);

	// Remove badge from partner
	app.delete(
		'/admin/partners/:partnerId/badges/:badgeId',
		requireAdminACL(AdminACLs.BADGE_REVOKE),
		async (ctx) => {
			const partnerId = ctx.req.param('partnerId');
			const badgeId = ctx.req.param('badgeId');
			await partnerRepo.removeBadgeFromPartner(partnerId, badgeId);
			return ctx.json({success: true});
		},
	);
}
