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

import {PluginSystem} from '@fluxer/plugin';
import type {PluginState} from '@fluxer/plugin';

export class PluginService {
	async getPlugins(): Promise<PluginState[]> {
		return PluginSystem.registry.getAll();
	}

	async getPlugin(pluginId: string): Promise<PluginState | null> {
		const plugin = PluginSystem.registry.get(pluginId);
		return plugin || null;
	}

	async enablePlugin(pluginId: string): Promise<void> {
		await PluginSystem.lifecycle.enable(pluginId);
	}

	async disablePlugin(pluginId: string): Promise<void> {
		await PluginSystem.lifecycle.disable(pluginId);
	}

	async reloadPlugin(pluginId: string): Promise<void> {
		const plugin = PluginSystem.registry.get(pluginId);
		if (!plugin) {
			throw new Error(`Plugin ${pluginId} not found`);
		}

		const pluginDirectory = process.env.FLUXER_PLUGIN_DIR || '/app/plugins';
		const pluginPath = `${pluginDirectory}/${pluginId}`;
		await PluginSystem.lifecycle.reload(pluginId, pluginPath);
	}
}
