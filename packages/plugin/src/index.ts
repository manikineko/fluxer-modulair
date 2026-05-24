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

// Export React for plugins to use
export {default as React} from 'react';

export type {
	PluginManifest,
	PluginHooks as PluginHooksType,
	PluginAssets,
	PluginContext,
	PluginAPI,
	PluginState,
	EventHandler,
	PluginPermissions,
} from './types';

export {loadManifest, validateManifest} from './manifest';
export {pluginRegistry} from './registry';
export {pluginHooks, HOOKS, registerPluginHooks, unregisterPluginHooks} from './hooks';
export {pluginLifecycle, PluginLifecycle} from './lifecycle';
export {PluginManager, type PluginManagerOptions} from './managers/PluginManager';

import {pluginRegistry} from './registry';
import {pluginLifecycle} from './lifecycle';
import {pluginHooks} from './hooks';

export const PluginSystem = {
	registry: pluginRegistry,
	lifecycle: pluginLifecycle,
	hooks: pluginHooks,
};

export {channelTypeRegistry, type ChannelTypePlugin, type ChannelViewProps, type MessageRenderProps, type ChannelSettingsProps, type SSRConfig, type LexiconSupport, customMessageTypeRegistry, type CustomMessageType, serverTypeRegistry, type ServerTypePlugin, type ServerSettingsProps} from './channelTypes';
