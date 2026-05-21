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

import {PluginSystem} from '../index';
import type {PluginManifest, PluginState} from '../types';

export interface PluginManagerOptions {
	pluginDirectory: string;
	target?: 'client' | 'server' | 'both';
	autoLoad?: boolean;
	hotReload?: boolean;
	environment?: 'development' | 'production' | 'test';
	logger?: {
		info: (message: string) => void;
		error: (message: string, error?: unknown) => void;
		warn: (message: string) => void;
	};
}

export class PluginManager {
	private options: PluginManagerOptions;
	private initialized = false;
	private watchers: Map<string, {close: () => void}> = new Map();
	private hotReloadEnabled = false;

	constructor(options: PluginManagerOptions) {
		this.options = {
			target: 'both',
			autoLoad: true,
			hotReload: false,
			environment: 'production',
			logger: console,
			...options,
		};
	}

	async initialize(): Promise<void> {
		if (this.initialized) {
			this.options.logger?.info('PluginManager already initialized');
			return;
		}

		this.options.logger?.info(`Initializing PluginManager with directory: ${this.options.pluginDirectory}`);

		if (this.options.autoLoad) {
			await this.discoverAndLoadPlugins();
		}

		if (this.options.hotReload) {
			this.enableHotReload();
		}

		this.initialized = true;
		this.options.logger?.info('PluginManager initialized successfully');
	}

	async discoverAndLoadPlugins(): Promise<void> {
		// Dynamic import to avoid errors in non-Node environments
		let fs: typeof import('fs') | null = null;
		let path: typeof import('path') | null = null;
		
		try {
			fs = await import('fs');
			path = await import('path');
		} catch {
			this.options.logger?.warn('File system not available, skipping plugin discovery');
			return;
		}

		if (!fs || !path) {
			this.options.logger?.warn('File system not available, skipping plugin discovery');
			return;
		}

		const {existsSync, readdirSync} = fs;
		const {join} = path;
		const {loadManifest} = await import('../manifest');

		if (!existsSync(this.options.pluginDirectory)) {
			this.options.logger?.info(`Plugin directory does not exist: ${this.options.pluginDirectory}`);
			return;
		}

		const pluginDirs = readdirSync(this.options.pluginDirectory, {withFileTypes: true})
			.filter((dirent: {isDirectory: () => boolean}) => dirent.isDirectory())
			.map((dirent: {name: string}) => dirent.name);

		for (const pluginDir of pluginDirs) {
			const pluginPath = join(this.options.pluginDirectory, pluginDir);
			const manifestPath = join(pluginPath, 'manifest.json');

			if (!existsSync(manifestPath)) continue;

			try {
				const manifest = await loadManifest(manifestPath);
				
				if (this.options.target && this.options.target !== 'both') {
					if (manifest.target !== this.options.target && manifest.target !== 'both') {
						this.options.logger?.info(`Skipping plugin ${manifest.id} (target mismatch)`);
						continue;
					}
				}
				
				PluginSystem.registry.register(manifest);
				this.options.logger?.info(`Discovered plugin: ${manifest.id} v${manifest.version}`);
			} catch (error) {
				this.options.logger?.error(`Failed to load manifest for ${pluginDir}:`, error);
			}
		}

		await this.loadPlugins();
	}

	async loadPlugins(): Promise<void> {
		const plugins = PluginSystem.registry.getAll();
		
		for (const plugin of plugins) {
			if (!plugin.loaded) {
				if (this.options.target && this.options.target !== 'both') {
					if (plugin.manifest.target !== this.options.target && plugin.manifest.target !== 'both') {
						continue;
					}
				}

				try {
					const pluginPath = `${this.options.pluginDirectory}/${plugin.manifest.id}`;
					await PluginSystem.lifecycle.load(pluginPath);
					this.options.logger?.info(`Loaded plugin: ${plugin.manifest.id}`);
					
					if (plugin.manifest.hooks?.onEnable) {
						await PluginSystem.lifecycle.enable(plugin.manifest.id);
						this.options.logger?.info(`Enabled plugin: ${plugin.manifest.id}`);
					}
				} catch (error) {
					this.options.logger?.error(`Failed to load plugin ${plugin.manifest.id}:`, error);
				}
			}
		}
	}

	async enablePlugin(pluginId: string): Promise<void> {
		await PluginSystem.lifecycle.enable(pluginId);
		this.options.logger?.info(`Enabled plugin: ${pluginId}`);
	}

	async disablePlugin(pluginId: string): Promise<void> {
		await PluginSystem.lifecycle.disable(pluginId);
		this.options.logger?.info(`Disabled plugin: ${pluginId}`);
	}

	async reloadPlugin(pluginId: string): Promise<void> {
		const plugin = PluginSystem.registry.get(pluginId);
		if (!plugin) {
			throw new Error(`Plugin ${pluginId} not found`);
		}

		const pluginPath = `${this.options.pluginDirectory}/${pluginId}`;
		await PluginSystem.lifecycle.reload(pluginId, pluginPath);
		this.options.logger?.info(`Reloaded plugin: ${pluginId}`);
	}

	getPlugins(): Array<PluginState> {
		const allPlugins = PluginSystem.registry.getAll();
		
		if (this.options.target && this.options.target !== 'both') {
			return allPlugins.filter(
				(p: PluginState) => p.manifest.target === this.options.target || p.manifest.target === 'both'
			);
		}
		
		return allPlugins;
	}

	getPlugin(pluginId: string): PluginState | undefined {
		return PluginSystem.registry.get(pluginId);
	}

	async registerPlugin(manifest: PluginManifest): Promise<void> {
		PluginSystem.registry.register(manifest);
		this.options.logger?.info(`Registered plugin: ${manifest.id}`);
	}

	async unregisterPlugin(pluginId: string): Promise<void> {
		const plugin = PluginSystem.registry.get(pluginId);
		if (plugin) {
			if (plugin.enabled) {
				await this.disablePlugin(pluginId);
			}
			if (plugin.loaded) {
				await PluginSystem.lifecycle.unload(pluginId);
			}
			PluginSystem.registry.unregister(pluginId);
			this.options.logger?.info(`Unregistered plugin: ${pluginId}`);
		}
	}

	async executeHook(hookName: string, ...args: Array<unknown>): Promise<void> {
		await PluginSystem.registry.executeHook(hookName, ...args);
	}

	isInitialized(): boolean {
		return this.initialized;
	}

	private enableHotReload(): void {
		if (this.hotReloadEnabled) return;
		
		try {
			// Hot-reload is Node.js only
			if (typeof global !== 'undefined' && global.process && global.process.versions && global.process.versions.node) {
				// Node.js environment - proceed with hot-reload
			} else {
				this.options.logger?.warn('Hot-reload not supported in browser environment');
				return;
			}
			
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const fs = require('fs');
			
			const watcher = fs.watch(this.options.pluginDirectory, {recursive: true}, (_eventType: string, filename: string | null) => {
				if (filename?.endsWith('manifest.json')) {
					this.options.logger?.info(`Detected manifest change: ${filename}`);
					this.handlePluginChange(filename);
				}
			});
			
			this.watchers.set('default', watcher);
			this.hotReloadEnabled = true;
			this.options.logger?.info('Plugin hot-reload enabled');
		} catch (error) {
			this.options.logger?.warn(`Failed to enable plugin hot-reload: ${error}`);
		}
	}

	private async handlePluginChange(filename: string): Promise<void> {
		let path: typeof import('path') | null = null;
		
		try {
			path = await import('path');
		} catch {
			this.options.logger?.error('Path module not available for hot-reload');
			return;
		}

		if (!path) return;

		const {join} = path;
		const {loadManifest} = await import('../manifest');
		
		try {
			const manifestPath = join(this.options.pluginDirectory, filename);
			
			const manifest = await loadManifest(manifestPath);
			const existingPlugin = PluginSystem.registry.get(manifest.id);
			
			if (existingPlugin) {
				await this.reloadPlugin(manifest.id);
			} else {
				PluginSystem.registry.register(manifest);
				const pluginPath = `${this.options.pluginDirectory}/${manifest.id}`;
				await PluginSystem.lifecycle.load(pluginPath);
				this.options.logger?.info(`Auto-loaded new plugin: ${manifest.id}`);
			}
		} catch (error) {
			this.options.logger?.error(`Failed to handle plugin change for ${filename}:`, error);
		}
	}

	disableHotReload(): void {
		for (const [, watcher] of this.watchers) {
			watcher.close();
		}
		this.watchers.clear();
		this.hotReloadEnabled = false;
		this.options.logger?.info('Plugin hot-reload disabled');
	}

	async shutdown(): Promise<void> {
		this.disableHotReload();
		
		const plugins = this.getPlugins();
		for (const plugin of plugins) {
			if (plugin.enabled) {
				await this.disablePlugin(plugin.manifest.id);
			}
			if (plugin.loaded) {
				await PluginSystem.lifecycle.unload(plugin.manifest.id);
			}
		}
		
		this.initialized = false;
		this.options.logger?.info('PluginManager shut down');
	}
}
