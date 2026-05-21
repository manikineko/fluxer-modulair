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

import type {Context, Next} from 'hono';
import type {HonoEnv} from '@fluxer/api/src/types/HonoEnv';
import {PluginSystem} from '@fluxer/plugin';

let pluginSystemInitialized = false;

export async function pluginMiddleware(c: Context<HonoEnv>, next: Next): Promise<void> {
	// Initialize plugin system if not already done
	if (!pluginSystemInitialized) {
		try {
			const pluginDir = process.env.FLUXER_PLUGIN_DIR || '/usr/src/app/plugins';
			const autoLoad = process.env.FLUXER_PLUGIN_AUTOLOAD === 'true';
			
			if (autoLoad) {
				const {readdirSync, existsSync} = await import('fs');
				const {join} = await import('path');
				const {loadManifest} = await import('@fluxer/plugin');
				
				if (existsSync(pluginDir)) {
					const pluginDirs = readdirSync(pluginDir, {withFileTypes: true})
						.filter(dirent => dirent.isDirectory())
						.map(dirent => dirent.name);

					for (const pluginDir of pluginDirs) {
						const pluginPath = join(pluginDir, pluginDir);
						const manifestPath = join(pluginPath, 'manifest.json');

						if (existsSync(manifestPath)) {
							try {
								const manifest = await loadManifest(manifestPath);
								PluginSystem.registry.register(manifest);
								console.log(`Registered plugin: ${manifest.id} v${manifest.version}`);
							} catch (error) {
								console.error(`Failed to register plugin ${pluginDir}:`, error);
							}
						}
					}
				}
			}
			
			pluginSystemInitialized = true;
		} catch (error) {
			console.error('Failed to initialize plugin system:', error);
		}
	}

	await PluginSystem.registry.executeHook('onRequest', c);
	
	try {
		await next();
		await PluginSystem.registry.executeHook('onResponse', c);
	} catch (error) {
		await PluginSystem.registry.executeHook('onError', error);
		throw error;
	}
}
