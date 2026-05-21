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

import type {Nullish} from '@fluxer/api/src/types/UtilTypes';
import type {UserID} from '@fluxer/api/src/BrandedTypes';

// Partner Types
export interface PartnerRow {
	partner_id: string;
	name: string;
	description: Nullish<string>;
	icon_hash: Nullish<string>;
	banner_hash: Nullish<string>;
	website_url: Nullish<string>;
	support_url: Nullish<string>;
	privacy_policy_url: Nullish<string>;
	terms_of_service_url: Nullish<string>;
	owner_user_id: UserID;
	assigned_by_user_id: UserID;
	assigned_at: Date;
	expires_at: Nullish<Date>;
	is_active: boolean;
	partner_type: 'community' | 'developer' | 'content_creator' | 'enterprise' | 'other';
	metadata: Nullish<string>; // JSON string for additional data
	created_at: Date;
	updated_at: Date;
}

export const PARTNER_COLUMNS = [
	'partner_id',
	'name',
	'description',
	'icon_hash',
	'banner_hash',
	'website_url',
	'support_url',
	'privacy_policy_url',
	'terms_of_service_url',
	'owner_user_id',
	'assigned_by_user_id',
	'assigned_at',
	'expires_at',
	'is_active',
	'partner_type',
	'metadata',
	'created_at',
	'updated_at',
] as const satisfies ReadonlyArray<keyof PartnerRow>;

// Badge Types
export interface BadgeRow {
	badge_id: string;
	name: string;
	description: string;
	icon_hash: string;
	icon_color: Nullish<number>;
	badge_type: 'system' | 'partner' | 'achievement' | 'event' | 'custom';
	is_active: boolean;
	is_visible: boolean;
	priority: number; // Display order, higher = more prominent
	granted_count: number; // How many users have this badge
	created_at: Date;
	updated_at: Date;
}

export const BADGE_COLUMNS = [
	'badge_id',
	'name',
	'description',
	'icon_hash',
	'icon_color',
	'badge_type',
	'is_active',
	'is_visible',
	'priority',
	'granted_count',
	'created_at',
	'updated_at',
] as const satisfies ReadonlyArray<keyof BadgeRow>;

// User Badges (junction table)
export interface UserBadgeRow {
	user_id: UserID;
	badge_id: string;
	granted_by_user_id: Nullish<UserID>; // null if system-granted
	granted_at: Date;
	expires_at: Nullish<Date>;
	is_active: boolean;
	metadata: Nullish<string>; // JSON string for additional data (e.g., reason for badge)
}

export const USER_BADGE_COLUMNS = [
	'user_id',
	'badge_id',
	'granted_by_user_id',
	'granted_at',
	'expires_at',
	'is_active',
	'metadata',
] as const satisfies ReadonlyArray<keyof UserBadgeRow>;

// Partner Badges (badges specifically for partners)
export interface PartnerBadgeRow {
	partner_id: string;
	badge_id: string;
	created_at: Date;
}

export const PARTNER_BADGE_COLUMNS = [
	'partner_id',
	'badge_id',
	'created_at',
] as const satisfies ReadonlyArray<keyof PartnerBadgeRow>;

// Default badges to auto-create
export const DEFAULT_BADGES = [
	{
		badge_id: 'staff',
		name: 'Staff',
		description: 'Official Fluxer Staff member',
		icon_hash: 'staff_badge',
		icon_color: 0xFF0000,
		badge_type: 'system' as const,
		priority: 1000,
	},
	{
		badge_id: 'partner',
		name: 'Partner',
		description: 'Official Fluxer Partner',
		icon_hash: 'partner_badge',
		icon_color: 0x5865F2,
		badge_type: 'partner' as const,
		priority: 900,
	},
	{
		badge_id: 'ctp',
		name: 'CTP',
		description: 'Certified Test Pilot - Early adopter and tester',
		icon_hash: 'ctp_badge',
		icon_color: 0x00FF00,
		badge_type: 'achievement' as const,
		priority: 800,
	},
	{
		badge_id: 'bug_hunter',
		name: 'Bug Hunter',
		description: 'Found and reported critical bugs',
		icon_hash: 'bug_hunter_badge',
		icon_color: 0xFFD700,
		badge_type: 'achievement' as const,
		priority: 700,
	},
	{
		badge_id: 'bug_hunter_gold',
		name: 'Bug Hunter Gold',
		description: 'Found and reported 5+ critical bugs',
		icon_hash: 'bug_hunter_gold_badge',
		icon_color: 0xFFD700,
		badge_type: 'achievement' as const,
		priority: 750,
	},
	{
		badge_id: 'verified_developer',
		name: 'Verified Developer',
		description: 'Verified bot or integration developer',
		icon_hash: 'verified_dev_badge',
		icon_color: 0x3498DB,
		badge_type: 'achievement' as const,
		priority: 600,
	},
	{
		badge_id: 'content_creator',
		name: 'Content Creator',
		description: 'Active content creator in the community',
		icon_hash: 'content_creator_badge',
		icon_color: 0xE91E63,
		badge_type: 'achievement' as const,
		priority: 500,
	},
	{
		badge_id: 'community_hero',
		name: 'Community Hero',
		description: 'Helped countless community members',
		icon_hash: 'community_hero_badge',
		icon_color: 0x9C27B0,
		badge_type: 'achievement' as const,
		priority: 400,
	},
	{
		badge_id: 'early_supporter',
		name: 'Early Supporter',
		description: 'Supported Fluxer in the early days',
		icon_hash: 'early_supporter_badge',
		icon_color: 0x1ABC9C,
		badge_type: 'achievement' as const,
		priority: 300,
	},
	{
		badge_id: 'premium_early_supporter',
		name: 'Premium Early Supporter',
		description: 'Premium subscriber since early access',
		icon_hash: 'premium_early_badge',
		icon_color: 0xF1C40F,
		badge_type: 'achievement' as const,
		priority: 350,
	},
	{
		badge_id: 'event_winner',
		name: 'Event Winner',
		description: 'Won an official Fluxer event',
		icon_hash: 'event_winner_badge',
		icon_color: 0xFF5722,
		badge_type: 'event' as const,
		priority: 200,
	},
	{
		badge_id: 'event_participant',
		name: 'Event Participant',
		description: 'Participated in an official Fluxer event',
		icon_hash: 'event_participant_badge',
		icon_color: 0x795548,
		badge_type: 'event' as const,
		priority: 150,
	},
	{
		badge_id: 'translator',
		name: 'Translator',
		description: 'Helped translate Fluxer to other languages',
		icon_hash: 'translator_badge',
		icon_color: 0x607D8B,
		badge_type: 'achievement' as const,
		priority: 250,
	},
	{
		badge_id: 'nitro_booster',
		name: 'Server Booster',
		description: 'Boosted a community server',
		icon_hash: 'nitro_booster_badge',
		icon_color: 0xF47FFF,
		badge_type: 'achievement' as const,
		priority: 100,
	},
	{
		badge_id: 'legacy_username',
		name: 'Legacy Username',
		description: 'Kept a rare username through the migration',
		icon_hash: 'legacy_username_badge',
		icon_color: 0x95A5A6,
		badge_type: 'system' as const,
		priority: 50,
	},
] as const;
