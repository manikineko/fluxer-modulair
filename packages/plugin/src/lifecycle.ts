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

import type {PluginContext, PluginState, PluginAPI, PluginManifest} from './types';
import {pluginRegistry} from './registry';
import {registerPluginHooks, unregisterPluginHooks} from './hooks';

export class PluginLifecycle {
	async load(pluginPath: string): Promise<PluginState> {
		const {loadManifest} = await import('./manifest');
		const manifest = await loadManifest(`${pluginPath}/manifest.json`);

		// Validate dependencies before loading
		await this.validateDependencies(manifest);

		let plugin = pluginRegistry.get(manifest.id);
		if (!plugin) {
			try {
				pluginRegistry.register(manifest);
			} catch (error) {
				// If already registered by another process, just get it
				if (error instanceof Error && error.message.includes('already registered')) {
					plugin = pluginRegistry.get(manifest.id);
					if (!plugin) {
						throw new Error(`Plugin ${manifest.id} is registered but not found in registry`);
					}
				} else {
					throw error;
				}
			}
		}
		if (!plugin) {
			plugin = pluginRegistry.get(manifest.id);
			if (!plugin) {
				throw new Error(`Failed to get plugin ${manifest.id} from registry`);
			}
		}

		try {
			const pluginModule = await import(`${pluginPath}/${manifest.main}`);

			const config: Record<string, unknown> = {};

			const api: PluginAPI = {
				getConfig: (key: string) => config[key],
				setConfig: (key: string, value: unknown) => {
					config[key] = value;
				},
				log: (message: string) => console.log(`[${manifest.id}] ${message}`),
				error: (message: string) => console.error(`[${manifest.id}] ${message}`),
				warn: (message: string) => console.warn(`[${manifest.id}] ${message}`),
				emit: (_eventName: string, _data: unknown) => {
					// Event emission handled by hooks system
				},
				on: (eventName: string, handler: (...args: Array<unknown>) => unknown) => {
					pluginRegistry.registerHook(eventName, handler);
				},
				off: (eventName: string, handler: (...args: Array<unknown>) => unknown) => {
					pluginRegistry.unregisterHook(eventName, handler);
				},
				getStorage: (_key: string) => {
					// Storage implementation would go here
					return undefined;
				},
				setStorage: (_key: string, _value: unknown) => {
					// Storage implementation would go here
				},
				removeStorage: (_key: string) => {
					// Storage implementation would go here
				},
				hasPermission: (_permission: string) => {
					// Permission checking implementation
					return true;
				},
				registerUIComponent: (component: unknown) => {
					pluginRegistry.registerUIComponent(manifest.id, component as unknown as import('./types').UIComponentDescriptor);
				},
				unregisterUIComponent: (componentId: string) => {
					pluginRegistry.unregisterUIComponent(manifest.id, componentId);
				},
			};

			// Import React to inject into plugin context
			const React = await import('react');

			const context: PluginContext = {
				pluginId: manifest.id,
				version: manifest.version,
				environment: process.env.NODE_ENV as 'development' | 'production' | 'test' || 'production',
				config,
				permissions: manifest.permissions || {},
				api,
				React,
			};

			plugin.context = context;
			plugin.loaded = true;

			await registerPluginHooks(plugin, pluginModule);

			// Register declarative UI components from manifest
			if (manifest.uiComponents && Array.isArray(manifest.uiComponents)) {
				for (const component of manifest.uiComponents) {
					// Resolve component name to actual function from plugin module
					const componentName = component.component as string;
					if (componentName && typeof componentName === 'string') {
						const componentFunction = pluginModule[componentName as keyof typeof pluginModule];
						if (typeof componentFunction === 'function') {
							// Replace the string name with the actual function
							pluginRegistry.registerUIComponent(manifest.id, {
								...component,
								component: componentFunction,
							});
						} else {
							console.warn(`Component function ${componentName} not found in plugin module`);
						}
					} else {
						// If component is already a function, register it directly
						pluginRegistry.registerUIComponent(manifest.id, component);
					}
				}
			}

			if (manifest.hooks?.onLoad && typeof manifest.hooks.onLoad === 'string') {
				const hookFunction = pluginModule[manifest.hooks.onLoad as keyof typeof pluginModule];
				if (typeof hookFunction === 'function') {
					await hookFunction(context);
				}
			}

			return plugin;
		} catch (error) {
			plugin.loaded = false;
			throw error;
		}
	}

	async validateDependencies(manifest: PluginManifest): Promise<void> {
		if (manifest.dependencies) {
			for (const [depId, _requiredVersion] of Object.entries(manifest.dependencies)) {
				const depPlugin = pluginRegistry.get(depId);
				if (!depPlugin) {
					throw new Error(`Plugin ${manifest.id} requires plugin ${depId} but it is not installed`);
				}
				if (!depPlugin.loaded) {
					throw new Error(`Plugin ${manifest.id} requires plugin ${depId} to be loaded`);
				}
				if (!depPlugin.enabled) {
					throw new Error(`Plugin ${manifest.id} requires plugin ${depId} to be enabled`);
				}
				// Version check could be added here using _requiredVersion
			}
		}

		if (manifest.peerDependencies) {
			for (const [depId, _requiredVersion] of Object.entries(manifest.peerDependencies)) {
				const depPlugin = pluginRegistry.get(depId);
				if (depPlugin && !depPlugin.enabled) {
					console.warn(`Plugin ${manifest.id} has peer dependency ${depId} which is not enabled`);
				}
			}
		}
	}

	async unload(pluginId: string): Promise<void> {
		const plugin = pluginRegistry.get(pluginId);
		if (!plugin) {
			throw new Error(`Plugin ${pluginId} not found`);
		}

		if (plugin.manifest.hooks?.onUnload && plugin.context && typeof plugin.manifest.hooks.onUnload === 'string') {
			const pluginPath = `/usr/src/app/plugins/${pluginId}`;
			const pluginModule = await import(`${pluginPath}/${plugin.manifest.main}`);
			const hookFunction = pluginModule[plugin.manifest.hooks.onUnload as keyof typeof pluginModule];
			if (typeof hookFunction === 'function') {
				await hookFunction(plugin.context);
			}
		}

		await unregisterPluginHooks(plugin);

		// Clear UI components when unloading
		pluginRegistry.clearUIComponents(pluginId);

		plugin.loaded = false;
		plugin.context = undefined;
	}

	async enable(pluginId: string): Promise<void> {
		const plugin = pluginRegistry.get(pluginId);
		if (!plugin) {
			throw new Error(`Plugin ${pluginId} not found`);
		}

		if (!plugin.loaded) {
			throw new Error(`Plugin ${pluginId} is not loaded`);
		}

		if (plugin.manifest.hooks?.onEnable && plugin.context && typeof plugin.manifest.hooks.onEnable === 'string') {
			const pluginPath = `/usr/src/app/plugins/${pluginId}`;
			const pluginModule = await import(`${pluginPath}/${plugin.manifest.main}`);
			const hookFunction = pluginModule[plugin.manifest.hooks.onEnable as keyof typeof pluginModule];
			if (typeof hookFunction === 'function') {
				await hookFunction(plugin.context);
			}
		}

		plugin.enabled = true;
	}

	async disable(pluginId: string): Promise<void> {
		const plugin = pluginRegistry.get(pluginId);
		if (!plugin) {
			throw new Error(`Plugin ${pluginId} not found`);
		}

		if (!plugin.loaded) {
			throw new Error(`Plugin ${pluginId} is not loaded`);
		}

		if (plugin.manifest.hooks?.onDisable && plugin.context && typeof plugin.manifest.hooks.onDisable === 'string') {
			const pluginPath = `/usr/src/app/plugins/${pluginId}`;
			const pluginModule = await import(`${pluginPath}/${plugin.manifest.main}`);
			const hookFunction = pluginModule[plugin.manifest.hooks.onDisable as keyof typeof pluginModule];
			if (typeof hookFunction === 'function') {
				await hookFunction(plugin.context);
			}
		}

		plugin.enabled = false;
	}

	async reload(pluginId: string, pluginPath: string): Promise<PluginState> {
		const plugin = pluginRegistry.get(pluginId);
		if (plugin) {
			if (plugin.enabled) {
				await this.disable(pluginId);
			}
			if (plugin.loaded) {
				await this.unload(pluginId);
			}
		}

		return await this.load(pluginPath);
	}
}

export const pluginLifecycle = new PluginLifecycle();
