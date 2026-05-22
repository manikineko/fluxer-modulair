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

export interface Partner {
	partner_id: string;
	name: string;
	description: string | null;
	icon_hash: string | null;
	banner_hash: string | null;
	website_url: string | null;
	support_url: string | null;
	privacy_policy_url: string | null;
	terms_of_service_url: string | null;
	owner_user_id: bigint;
	assigned_by_user_id: bigint;
	assigned_at: Date;
	expires_at: Date | null;
	is_active: boolean;
	partner_type: 'community' | 'developer' | 'content_creator' | 'enterprise' | 'other';
	metadata: string | null;
	created_at: Date;
	updated_at: Date;
}

export async function getPartners(
	config: Config,
	session: Session,
	showInactive: boolean = false,
): Promise<ApiResult<{partners: Array<Partner>}>> {
	const client = new ApiClient(config, session);
	const query = showInactive ? '?show_inactive=true' : '';
	return client.get<{partners: Array<Partner>}>(`/partners${query}`);
}

export async function getPartner(
	config: Config,
	session: Session,
	partnerId: string,
): Promise<ApiResult<{partner: Partner}>> {
	const client = new ApiClient(config, session);
	return client.get<{partner: Partner}>(`/partners/${partnerId}`);
}

export interface CreatePartnerInput {
	name: string;
	description?: string;
	icon_hash?: string;
	banner_hash?: string;
	website_url?: string;
	support_url?: string;
	privacy_policy_url?: string;
	terms_of_service_url?: string;
	owner_user_id: string;
	partner_type: 'community' | 'developer' | 'content_creator' | 'enterprise' | 'other';
	metadata?: string;
	[key: string]: unknown;
}

export async function createPartner(
	config: Config,
	session: Session,
	data: CreatePartnerInput,
): Promise<ApiResult<{partner: Partner}>> {
	const client = new ApiClient(config, session);
	return client.post<{partner: Partner}>('/partners', data as JsonObject);
}

export interface UpdatePartnerInput {
	name?: string;
	description?: string;
	icon_hash?: string;
	banner_hash?: string;
	website_url?: string;
	support_url?: string;
	privacy_policy_url?: string;
	terms_of_service_url?: string;
	is_active?: boolean;
	partner_type?: 'community' | 'developer' | 'content_creator' | 'enterprise' | 'other';
	metadata?: string;
	expires_at?: string | null;
	[key: string]: unknown;
}

export async function updatePartner(
	config: Config,
	session: Session,
	partnerId: string,
	data: UpdatePartnerInput,
): Promise<ApiResult<{partner: Partner}>> {
	const client = new ApiClient(config, session);
	return client.patch<{partner: Partner}>(`/partners/${partnerId}`, data as JsonObject);
}

export async function deletePartner(
	config: Config,
	session: Session,
	partnerId: string,
): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.delete<{success: boolean}>(`/partners/${partnerId}`);
}

export async function addBadgeToPartner(
	config: Config,
	session: Session,
	partnerId: string,
	badgeId: string,
): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.post<{success: boolean}>(`/partners/${partnerId}/badges/${badgeId}`, {});
}

export async function removeBadgeFromPartner(
	config: Config,
	session: Session,
	partnerId: string,
	badgeId: string,
): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.delete<{success: boolean}>(`/partners/${partnerId}/badges/${badgeId}`);
}
