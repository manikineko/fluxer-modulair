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

import {requireAdminACL} from '@fluxer/api/src/middleware/AdminMiddleware';
import {RateLimitMiddleware} from '@fluxer/api/src/middleware/RateLimitMiddleware';
import {AdminRateLimitConfigs} from '@fluxer/api/src/rate_limit_configs/AdminRateLimitConfig';
import type {HonoApp} from '@fluxer/api/src/types/HonoEnv';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';
import type {PluginManifest} from '@fluxer/plugin';

export function PluginController(app: HonoApp) {
	app.get('/plugins', async (ctx) => {
		const {PluginSystem} = await import('@fluxer/plugin');
		const plugins = PluginSystem.registry.getAll();
		return ctx.json({plugins});
	});

	app.get('/plugins/ui-components', async (ctx) => {
		const {PluginSystem} = await import('@fluxer/plugin');
		const location = ctx.req.query('location') as string | undefined;
		if (location) {
			const components = PluginSystem.registry.getUIComponentsByLocation(location);
			return ctx.json({components});
		}
		const components = PluginSystem.registry.getUIComponents();
		return ctx.json({components});
	});

	app.get('/plugins/:pluginId', async (ctx) => {
		const {PluginSystem} = await import('@fluxer/plugin');
		const pluginId = ctx.req.param('pluginId');
		if (!pluginId) {
			return ctx.json({error: 'Plugin ID required'}, 400);
		}
		const plugin = PluginSystem.registry.get(pluginId);
		if (!plugin) {
			return ctx.json({error: 'Plugin not found'}, 404);
		}
		return ctx.json({plugin});
	});

	app.post(
		'/plugins/:pluginId/enable',
		RateLimitMiddleware(AdminRateLimitConfigs.ADMIN_USER_MODIFY),
		requireAdminACL(AdminACLs.INSTANCE_CONFIG_VIEW),
		async (ctx) => {
			try {
				const {PluginSystem} = await import('@fluxer/plugin');
				const pluginId = ctx.req.param('pluginId');
				if (!pluginId) {
					return ctx.json({error: 'Plugin ID required'}, 400);
				}

				const plugin = PluginSystem.registry.get(pluginId);
				if (!plugin) {
					return ctx.json({error: 'Plugin not found'}, 404);
				}

				// If already enabled, return success
				if (plugin.enabled) {
					return ctx.json({success: true, enabled: true, message: 'Plugin already enabled'});
				}

				// If not loaded, try to load it
				if (!plugin.loaded) {
					try {
						const pluginPath = `/usr/src/app/plugins/${pluginId}`;
						await PluginSystem.lifecycle.load(pluginPath);
					} catch (loadError) {
						// If already registered error, it's already loaded
						if (loadError instanceof Error && loadError.message.includes('already registered')) {
							// Mark as loaded if it exists in registry
							const existingPlugin = PluginSystem.registry.get(pluginId);
							if (existingPlugin) {
								existingPlugin.loaded = true;
							}
						} else {
							throw loadError;
						}
					}
				}

				await PluginSystem.lifecycle.enable(pluginId);
				return ctx.json({success: true, enabled: true});
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				console.error(`Failed to enable plugin:`, error);
				return ctx.json({error: 'Failed to enable plugin', details: errorMessage}, 500);
			}
		},
	);

	app.post(
		'/plugins/:pluginId/disable',
		RateLimitMiddleware(AdminRateLimitConfigs.ADMIN_USER_MODIFY),
		requireAdminACL(AdminACLs.INSTANCE_CONFIG_VIEW),
		async (ctx) => {
			const {PluginSystem} = await import('@fluxer/plugin');
			const pluginId = ctx.req.param('pluginId');
			if (!pluginId) {
				return ctx.json({error: 'Plugin ID required'}, 400);
			}
			await PluginSystem.lifecycle.disable(pluginId);
			return ctx.json({success: true});
		},
	);

	app.post(
		'/plugins/:pluginId/reload',
		RateLimitMiddleware(AdminRateLimitConfigs.ADMIN_USER_MODIFY),
		requireAdminACL(AdminACLs.INSTANCE_CONFIG_VIEW),
		async (ctx) => {
			const {PluginSystem} = await import('@fluxer/plugin');
			const pluginId = ctx.req.param('pluginId');
			if (!pluginId) {
				return ctx.json({error: 'Plugin ID required'}, 400);
			}
			const plugin = PluginSystem.registry.get(pluginId);
			if (!plugin) {
				return ctx.json({error: 'Plugin not found'}, 404);
			}
			await PluginSystem.lifecycle.reload(pluginId, `/usr/src/app/plugins/${pluginId}`);
			return ctx.json({success: true});
		},
	);

	app.post(
		'/plugins/upload',
		RateLimitMiddleware(AdminRateLimitConfigs.ADMIN_USER_MODIFY),
		requireAdminACL(AdminACLs.INSTANCE_CONFIG_UPDATE),
		async (ctx) => {
			const {PluginSystem} = await import('@fluxer/plugin');
			const formData = await ctx.req.formData();
			const file = formData.get('file') as File;

			console.log('Upload request received, file:', file ? file.name : 'null');

			if (!file) {
				console.log('No file provided');
				return ctx.json({error: 'No file provided'}, 400);
			}

			if (!file.name.endsWith('.zip')) {
				console.log('File is not a zip:', file.name);
				return ctx.json({error: 'File must be a .zip file'}, 400);
			}

			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const AdmZip = (await import('adm-zip')).default;
			const zip = new AdmZip(buffer);
			const zipEntries = zip.getEntries();

			const manifestEntry = zipEntries.find((entry: {entryName: string}) => entry.entryName.endsWith('manifest.json'));
			if (!manifestEntry) {
				console.log('No manifest.json found in zip');
				return ctx.json({error: 'Plugin must contain a manifest.json file'}, 400);
			}

			let manifest: Record<string, unknown>;
			try {
				manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
				console.log('Manifest parsed:', manifest.id);
			} catch {
				console.log('Failed to parse manifest.json');
				return ctx.json({error: 'Invalid manifest.json'}, 400);
			}

			if (!manifest.id || typeof manifest.id !== 'string') {
				console.log('Invalid manifest id:', manifest.id);
				return ctx.json({error: 'Plugin manifest must contain a valid id'}, 400);
			}

			const fs = await import('fs');
			const path = await import('path');
			const pluginDir = path.join('/usr/src/app/plugins', manifest.id);

			if (fs.existsSync(pluginDir)) {
				console.log('Plugin already exists:', manifest.id);
				return ctx.json({error: 'Plugin with this id already exists'}, 400);
			}

			fs.mkdirSync(pluginDir, {recursive: true});
			zip.extractAllTo(pluginDir, true);
			console.log('Plugin extracted to:', pluginDir);

			PluginSystem.registry.register(manifest as unknown as PluginManifest);
			const pluginPath = `/usr/src/app/plugins/${manifest.id}`;
			await PluginSystem.lifecycle.load(pluginPath);
			console.log('Plugin loaded:', manifest.id);

			return ctx.json({success: true, pluginId: manifest.id});
		},
	);
}
