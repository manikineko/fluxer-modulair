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
import type {Session} from '@fluxer/admin/src/types/App';
import type {AdminConfig as Config} from '@fluxer/admin/src/types/Config';

export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description: string;
	author?: string;
	license?: string;
	main: string;
	target: 'client' | 'server' | 'both';
	permissions?: Record<string, unknown>;
	hooks?: Record<string, string>;
}

export interface PluginInfo {
	manifest: PluginManifest;
	enabled: boolean;
	loaded: boolean;
}

export interface PluginsResponse {
	plugins: Array<PluginInfo>;
}

export async function getPlugins(config: Config, session: Session): Promise<ApiResult<PluginsResponse>> {
	const client = new ApiClient(config, session);
	return client.get<PluginsResponse>('/plugins');
}

export async function enablePlugin(config: Config, session: Session, pluginId: string): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.post<{success: boolean}>(`/plugins/${pluginId}/enable`, {});
}

export async function disablePlugin(config: Config, session: Session, pluginId: string): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.post<{success: boolean}>(`/plugins/${pluginId}/disable`, {});
}

export async function reloadPlugin(config: Config, session: Session, pluginId: string): Promise<ApiResult<{success: boolean}>> {
	const client = new ApiClient(config, session);
	return client.post<{success: boolean}>(`/plugins/${pluginId}/reload`, {});
}

export async function uploadPlugin(config: Config, session: Session, formData: FormData): Promise<ApiResult<{success: boolean; pluginId: string}>> {
	const client = new ApiClient(config, session);
	return client.postWithFile<{success: boolean; pluginId: string}>('/plugins/upload', formData);
}

export interface UIComponentDescriptor {
	id: string;
	name: string;
	component: string;
	location: 'settings' | 'channel_header' | 'message' | 'user_popout' | 'guild_menu' | 'sidebar';
	priority?: number;
	props?: Record<string, unknown>;
}

export interface UIComponentsResponse {
	components: Array<UIComponentDescriptor>;
}

export async function getUIComponents(config: Config, session: Session, location?: string): Promise<ApiResult<UIComponentsResponse>> {
	const client = new ApiClient(config, session);
	const query = location ? `?location=${location}` : '';
	return client.get<UIComponentsResponse>(`/plugins/ui-components${query}`);
}
