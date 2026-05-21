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

/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {ApiClient, type ApiResult} from '@fluxer/admin/src/api/Client';
import type {JsonObject} from '@fluxer/admin/src/api/JsonTypes';
import type {Session} from '@fluxer/admin/src/types/App';
import type {AdminConfig as Config} from '@fluxer/admin/src/types/Config';

export interface Badge {
	badge_id: string;
	name: string;
	description: string;
	icon_hash: string;
	icon_color: number | null;
	badge_type: 'system' | 'partner' | 'achievement' | 'event' | 'custom';
	is_active: boolean;
	is_visible: boolean;
	priority: number;
	granted_count: number;
	created_at: Date;
	updated_at: Date;
}

export interface UserBadge {
	user_id: bigint;
	badge_id: string;
	granted_by_user_id: bigint;
	granted_at: Date;
	expires_at: Date | null;
	is_active: boolean;
	metadata: string | null;
}

export async function getBadges(
	config: Config,
	session: Session,
	showInactive: boolean = false,
): Promise<ApiResult<{badges: Array<Badge>}>> {
	const client = new ApiClient(config, session);
	const query = showInactive ? '?show_inactive=true' : '';
	return client.get<{badges: Array<Badge>}>(`/api/badges${query}`);
}

export async function getBadge(
	config: Config,
	session: Session,
	badgeId: string,
): Promise<ApiResult<{badge: Badge}>> {
	const client = new ApiClient(config, session);
	return client.get<{badge: Badge}>(`/api/badges/${badgeId}`);
}

export async function getUserBadges(
	config: Config,
	session: Session,
	userId: string,
): Promise<ApiResult<{badges: Array<Badge & {granted_at: Date; metadata: string | null}>}>> {
	const client = new ApiClient(config, session);
	return client.get<{badges: Array<Badge & {granted_at: Date; metadata: string | null}>}>(`/api/users/${userId}/badges`);
}

export interface CreateBadgeInput {
	name: string;
	description: string;
	icon_hash: string;
	icon_color?: number;
	badge_type: 'system' | 'partner' | 'achievement' | 'event' | 'custom';
	is_visible?: boolean;
	priority?: number;
	[key: string]: unknown;
}

export async function createBadge(
	config: Config,
	session: Session,
	data: CreateBadgeInput,
): Promise<ApiResult<{badge: Badge}>> {
	const client = new ApiClient(config, session);
	return client.post<{badge: Badge}>('/api/badges', data as JsonObject);
}

export interface UpdateBadgeInput {
	name?: string;
	description?: string;
	icon_hash?: string;
	icon_color?: number;
	badge_type?: 'system' | 'partner' | 'achievement' | 'event' | 'custom';
	is_active?: boolean;
	is_visible?: boolean;
	priority?: number;
	[key: string]: unknown;
}

export async function updateBadge(
	config: Config,
	session: Session,
	badgeId: string,
	data: UpdateBadgeInput,
): Promise<ApiResult<{badge: Badge}>> {
	const client = new ApiClient(config, session);
	return client.patch<{badge: Badge}>(`/api/badges/${badgeId}`, data as JsonObject);
}

export async function deleteBadge(
	config: Config,
	session: Session,
	badgeId: string,
): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.delete<{success: boolean}>(`/api/badges/${badgeId}`);
}

export interface GrantBadgeInput {
	user_id: string;
	badge_id: string;
	reason?: string;
	expires_at?: string;
	[key: string]: unknown;
}

export async function grantBadge(
	config: Config,
	session: Session,
	data: GrantBadgeInput,
): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.post<{success: boolean}>('/api/badges/grant', data as JsonObject);
}

export interface RevokeBadgeInput {
	user_id: string;
	badge_id: string;
	[key: string]: unknown;
}

export async function revokeBadge(
	config: Config,
	session: Session,
	data: RevokeBadgeInput,
): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.post<{success: boolean}>('/api/badges/revoke', data as JsonObject);
}
