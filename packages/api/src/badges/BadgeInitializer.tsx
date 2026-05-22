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
import {Logger} from '@fluxer/api/src/Logger';
import type {BadgeRow} from '@fluxer/api/src/database/types/PartnerBadgeTypes';

const DEFAULT_BADGES: Array<Omit<BadgeRow, 'badge_id' | 'created_at' | 'updated_at' | 'granted_count'>> = [
	{
		name: 'Staff',
		description: 'Official staff member',
		icon_hash: 'staff_badge',
		icon_color: 0x5865f2,
		badge_type: 'system',
		is_active: true,
		is_visible: true,
		priority: 1000,
	},
	{
		name: 'Administrator',
		description: 'Platform administrator',
		icon_hash: 'admin_badge',
		icon_color: 0xed4245,
		badge_type: 'system',
		is_active: true,
		is_visible: true,
		priority: 999,
	},
	{
		name: 'Moderator',
		description: 'Community moderator',
		icon_hash: 'mod_badge',
		icon_color: 0x57f287,
		badge_type: 'system',
		is_active: true,
		is_visible: true,
		priority: 998,
	},
	{
		name: 'Premium',
		description: 'Premium subscriber',
		icon_hash: 'premium_badge',
		icon_color: 0xf1c40f,
		badge_type: 'system',
		is_active: true,
		is_visible: true,
		priority: 900,
	},
	{
		name: 'Early Adopter',
		description: 'Joined during the early access period',
		icon_hash: 'early_adopter',
		icon_color: 0x9b59b6,
		badge_type: 'achievement',
		is_active: true,
		is_visible: true,
		priority: 800,
	},
	{
		name: 'Bug Hunter',
		description: 'Reported a security vulnerability',
		icon_hash: 'bug_hunter',
		icon_color: 0xe74c3c,
		badge_type: 'achievement',
		is_active: true,
		is_visible: true,
		priority: 850,
	},
	{
		name: 'Contributor',
		description: 'Contributed to the project',
		icon_hash: 'contributor',
		icon_color: 0x3498db,
		badge_type: 'achievement',
		is_active: true,
		is_visible: true,
		priority: 750,
	},
	{
		name: 'Partner',
		description: 'Official partner',
		icon_hash: 'partner_badge',
		icon_color: 0x00b894,
		badge_type: 'partner',
		is_active: true,
		is_visible: true,
		priority: 700,
	},
	{
		name: 'Verified Developer',
		description: 'Verified developer',
		icon_hash: 'verified_dev',
		icon_color: 0x6c5ce7,
		badge_type: 'partner',
		is_active: true,
		is_visible: true,
		priority: 699,
	},
];

export class BadgeInitializer {
	async initialize(): Promise<void> {
		try {
			const repository = new BadgeRepository();
			const existingBadges = await repository.findAll();

			if (existingBadges.length === 0) {
				Logger.info(`[BadgeInitializer] Creating ${DEFAULT_BADGES.length} default badges...`);
				
				for (const badgeData of DEFAULT_BADGES) {
					const badgeId = `${badgeData.name.toLowerCase().replace(/\s+/g, '_')}_badge`;
					const badge: BadgeRow = {
						...badgeData,
						badge_id: badgeId,
						created_at: new Date(),
						updated_at: new Date(),
						granted_count: 0,
					};
					await repository.create(badge);
					Logger.info(`[BadgeInitializer] Created badge: ${badge.name}`);
				}
				
				Logger.info(`[BadgeInitializer] Successfully created ${DEFAULT_BADGES.length} default badges`);
			} else {
				Logger.info(`[BadgeInitializer] Found ${existingBadges.length} existing badges, skipping initialization`);
			}
		} catch (error) {
			Logger.error({error}, '[BadgeInitializer] Failed to create default badges');
			throw error;
		}
	}
}
