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

import {PluginManager as BasePluginManager, type PluginManagerOptions} from '@fluxer/plugin';
import {channelTypeRegistry} from '@app/lib/plugins/ChannelTypeRegistry';
import {uiComponentRegistry} from '@app/lib/plugins/UIComponentRegistry';

export class ClientPluginManager extends BasePluginManager {
	constructor() {
		const options: PluginManagerOptions = {
			pluginDirectory: '/plugins',
			target: 'client',
			autoLoad: true,
			hotReload: false,
			environment: 'development',
			logger: console,
		};
		super(options);
	}

	override async initialize(): Promise<void> {
		// Skip parent's filesystem-dependent initialization in browser environment
		// The base PluginManager tries to use Node.js fs.existsSync which doesn't exist in browser
		console.log('Client plugin manager initialized (browser environment)');
	}

	override async enablePlugin(pluginId: string): Promise<void> {
		await super.enablePlugin(pluginId);
		// Trigger UI component registration for this plugin
		const plugin = this.getPlugin(pluginId);
		if (plugin?.manifest.hooks?.onUIComponentRegister && plugin.context) {
			const context = {
				pluginId,
				component: {
					id: `${pluginId}-ui`,
					name: `${plugin.manifest.name} UI`,
					component: null,
					location: 'settings' as const,
					priority: 0,
					props: {},
				},
				registerComponent: () => {
					// This would be called by the plugin to register its UI components
					console.log(`[ClientPluginManager] Registering UI components for ${pluginId}`);
				},
				unregisterComponent: () => {
					// This would be called by the plugin to unregister its UI components
					console.log(`[ClientPluginManager] Unregistering UI components for ${pluginId}`);
				},
			};
			await plugin.manifest.hooks.onUIComponentRegister(context);
		}
	}

	override async disablePlugin(pluginId: string): Promise<void> {
		// Unregister UI components for this plugin
		uiComponentRegistry.unregisterPluginComponents(pluginId);
		await super.disablePlugin(pluginId);
	}

	getUIComponents(location: string): Array<unknown> {
		return uiComponentRegistry.getComponentsByLocation(location);
	}

	registerChannelType(channelType: {id: string; name: string; description: string; icon: string; component: any}): void {
		channelTypeRegistry.registerChannelType(channelType);
	}

	unregisterChannelType(channelTypeId: string): void {
		channelTypeRegistry.unregisterChannelType(channelTypeId);
	}

	getChannelType(channelTypeId: string) {
		return channelTypeRegistry.getChannelType(channelTypeId);
	}

	getAllChannelTypes() {
		return channelTypeRegistry.getAllChannelTypes();
	}
}

export const clientPluginManager = new ClientPluginManager();
