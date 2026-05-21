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

import type React from 'react';
import {channelTypeRegistry} from '@app/lib/plugins/ChannelTypeRegistry';
import {PluginStateManager} from '@app/lib/plugins/PluginStateManager';
import {GuildChannelView} from '@app/components/channel/channel_view/GuildChannelView';
import {TextChannelView} from '@app/components/channel/channel_view/TextChannelView';
import {VoiceChannelView} from '@app/components/channel/channel_view/VoiceChannelView';
import {ChannelTypes} from '@fluxer/constants/src/ChannelConstants';

// Plugin imports
import {
	PLUGIN_ID as FORUM_PLUGIN_ID,
	forumChannelType,
	loadForumComponent,
} from './channelTypes/ForumChannelPlugin';
import {
	PLUGIN_ID as STAGE_PLUGIN_ID,
	stageChannelType,
	loadStageComponent,
} from './channelTypes/StageChannelPlugin';
import {
	PLUGIN_ID as ANNOUNCEMENT_PLUGIN_ID,
	announcementChannelType,
	loadAnnouncementComponent,
} from './channelTypes/AnnouncementChannelPlugin';
import {
	PLUGIN_ID as BLUESKY_PLUGIN_ID,
	blueskyFeedChannelType,
	loadBlueskyComponent,
} from './channelTypes/BlueskyFeedPlugin';
import {
	PLUGIN_ID as SSR_PLUGIN_ID,
	ssrRenderChannelType,
	loadSSRRenderComponent,
} from './channelTypes/SSRRenderPlugin';

// Track lazy-loaded component loaders
const pluginComponentLoaders = new Map<string, () => Promise<{default: React.ComponentType<{channelId: string}>}>>();

// Cache resolved components after first load
const resolvedPluginComponents = new Map<string, React.ComponentType<{channelId: string}>>();

// Map channelTypeId -> pluginId
const channelTypeToPluginId = new Map<string, string>();

export function initializeBuiltInChannelTypes(): void {
	// Register core Discord channel types (always enabled, direct imports)
	channelTypeRegistry.registerChannelType({
		id: String(ChannelTypes.GUILD_TEXT),
		name: 'Text',
		description: 'Standard text channel',
		icon: 'hashtag',
		component: TextChannelView,
	});

	channelTypeRegistry.registerChannelType({
		id: String(ChannelTypes.GUILD_VOICE),
		name: 'Voice',
		description: 'Voice channel',
		icon: 'volume',
		component: VoiceChannelView,
	});

	channelTypeRegistry.registerChannelType({
		id: String(ChannelTypes.GUILD_LINK),
		name: 'Link',
		description: 'Link to another channel',
		icon: 'link',
		component: GuildChannelView,
	});

	// Register plugin-based channel types (eagerly pre-loaded)
	registerPluginChannelType(FORUM_PLUGIN_ID, forumChannelType, loadForumComponent);
	registerPluginChannelType(STAGE_PLUGIN_ID, stageChannelType, loadStageComponent);
	registerPluginChannelType(ANNOUNCEMENT_PLUGIN_ID, announcementChannelType, loadAnnouncementComponent);
	registerPluginChannelType(BLUESKY_PLUGIN_ID, blueskyFeedChannelType, loadBlueskyComponent);
	registerPluginChannelType(SSR_PLUGIN_ID, ssrRenderChannelType, loadSSRRenderComponent);

	console.log('[ChannelTypeInitializer] Registered all channel types (core + plugins)');

	// Eagerly pre-load all plugin components in the background so they are
	// ready instantly when the user first navigates to them.
	void preloadAllPluginComponents();
}

function registerPluginChannelType(
	pluginId: string,
	channelType: {id: string; name: string; description: string; icon: string},
	loader: () => Promise<{default: React.ComponentType<{channelId: string}>}>,
): void {
	PluginStateManager.registerPlugin(pluginId, {
		enabled: true,
		loaded: false,
		errorCount: 0,
	});

	pluginComponentLoaders.set(channelType.id, loader);
	channelTypeToPluginId.set(channelType.id, pluginId);

	channelTypeRegistry.registerChannelType({
		...channelType,
		component: null,
	});

	console.log(`[ChannelTypeInitializer] Registered plugin channel type: ${channelType.name} (${pluginId})`);
}

async function preloadAllPluginComponents(): Promise<void> {
	const entries = Array.from(pluginComponentLoaders.entries());
	await Promise.allSettled(
		entries.map(async ([channelTypeId, loader]) => {
			const pluginId = channelTypeToPluginId.get(channelTypeId);
			if (!pluginId || !PluginStateManager.isPluginEnabled(pluginId)) return;
			try {
				const module = await loader();
				resolvedPluginComponents.set(channelTypeId, module.default);
				// Register the resolved component directly in the registry so
				// ChannelIndexPage can use it synchronously without LazyPluginComponent.
				channelTypeRegistry.registerComponent(channelTypeId, module.default);
				PluginStateManager.markPluginLoaded(pluginId);
				console.log(`[ChannelTypeInitializer] Pre-loaded plugin: ${pluginId}`);
			} catch (err) {
				console.error(`[ChannelTypeInitializer] Failed to pre-load plugin ${pluginId}:`, err);
				if (pluginId) {
					PluginStateManager.recordPluginError(
						pluginId,
						err instanceof Error ? err.message : 'Pre-load failed',
					);
				}
			}
		}),
	);
}

// Export for use by ChannelIndexPage
export function getPluginComponentLoader(channelTypeId: string) {
	return pluginComponentLoaders.get(channelTypeId);
}

export function getPluginId(channelTypeId: string): string | undefined {
	return channelTypeToPluginId.get(channelTypeId);
}

export function isPluginChannelType(channelTypeId: string): boolean {
	return pluginComponentLoaders.has(channelTypeId);
}
