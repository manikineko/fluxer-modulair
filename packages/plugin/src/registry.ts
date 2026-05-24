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

import type {PluginManifest, PluginState, UIComponentDescriptor} from './types';
import {customMessageTypeRegistry, type CustomMessageType, channelTypeRegistry, type ChannelTypePlugin, serverTypeRegistry, type ServerTypePlugin} from './channelTypes';

export class PluginRegistry {
	private plugins: Map<string, PluginState> = new Map();
	private hooks: Map<string, Array<(...args: Array<unknown>) => unknown>> = new Map();
	private uiComponents: Map<string, Array<UIComponentDescriptor>> = new Map();

	register(manifest: PluginManifest): void {
		if (this.plugins.has(manifest.id)) {
			throw new Error(`Plugin ${manifest.id} is already registered`);
		}

		this.plugins.set(manifest.id, {
			loaded: false,
			enabled: false,
			manifest,
			context: undefined,
		});

		// Register custom message types from manifest
		if (manifest.messageTypes) {
			for (const messageType of manifest.messageTypes) {
				customMessageTypeRegistry.register(messageType as CustomMessageType);
			}
		}

		// Register server types from manifest
		if (manifest.serverTypes) {
			for (const serverType of manifest.serverTypes) {
				serverTypeRegistry.register(serverType as ServerTypePlugin);
			}
		}

		// Register channel types from manifest
		if (manifest.channelTypes) {
			for (const channelType of manifest.channelTypes) {
				channelTypeRegistry.register(channelType as ChannelTypePlugin);
			}
		}
	}

	unregister(pluginId: string): void {
		const plugin = this.plugins.get(pluginId);
		if (plugin) {
			// Unregister custom message types
			if (plugin.manifest.messageTypes) {
				for (const messageType of plugin.manifest.messageTypes) {
					customMessageTypeRegistry.unregister(messageType.id);
				}
			}

			// Unregister server types
			if (plugin.manifest.serverTypes) {
				for (const serverType of plugin.manifest.serverTypes) {
					serverTypeRegistry.unregister(serverType.id);
				}
			}

			// Unregister channel types
			if (plugin.manifest.channelTypes) {
				for (const channelType of plugin.manifest.channelTypes) {
					channelTypeRegistry.unregister(channelType.id);
				}
			}
		}

		this.plugins.delete(pluginId);
		this.uiComponents.delete(pluginId);
	}

	get(pluginId: string): PluginState | undefined {
		return this.plugins.get(pluginId);
	}

	getAll(): Array<PluginState> {
		return Array.from(this.plugins.values());
	}

	getById(id: string): PluginState | undefined {
		return this.plugins.get(id);
	}

	getByTarget(target: 'client' | 'server' | 'both'): Array<PluginState> {
		return Array.from(this.plugins.values()).filter(
			(p) => p.manifest.target === target || p.manifest.target === 'both',
		);
	}

	registerHook(hookName: string, handler: (...args: Array<unknown>) => unknown): void {
		if (!this.hooks.has(hookName)) {
			this.hooks.set(hookName, [] as Array<(...args: Array<unknown>) => unknown>);
		}
		const handlers = this.hooks.get(hookName);
		if (handlers) {
			handlers.push(handler);
		}
	}

	unregisterHook(hookName: string, handler: (...args: Array<unknown>) => unknown): void {
		const handlers = this.hooks.get(hookName);
		if (handlers) {
			const index = handlers.indexOf(handler);
			if (index > -1) {
				handlers.splice(index, 1);
			}
		}
	}

	async executeHook(hookName: string, ...args: Array<unknown>): Promise<void> {
		const handlers = this.hooks.get(hookName);
		if (!handlers) return;

		for (const handler of handlers) {
			try {
				await handler(...args);
			} catch (error) {
				console.error(`Error executing hook ${hookName}:`, error);
			}
		}
	}

	registerUIComponent(pluginId: string, component: UIComponentDescriptor): void {
		if (!this.uiComponents.has(pluginId)) {
			this.uiComponents.set(pluginId, []);
		}
		const components = this.uiComponents.get(pluginId);
		if (components) {
			components.push(component);
		}
	}

	unregisterUIComponent(pluginId: string, componentId: string): void {
		const components = this.uiComponents.get(pluginId);
		if (components) {
			const index = components.findIndex((c) => c.id === componentId);
			if (index > -1) {
				components.splice(index, 1);
			}
		}
	}

	getUIComponents(pluginId?: string): Array<UIComponentDescriptor> {
		if (pluginId) {
			return this.uiComponents.get(pluginId) || [];
		}
		const allComponents: Array<UIComponentDescriptor> = [];
		for (const components of this.uiComponents.values()) {
			allComponents.push(...components);
		}
		return allComponents;
	}

	getUIComponentsByLocation(location: string): Array<UIComponentDescriptor> {
		const allComponents: Array<UIComponentDescriptor> = [];
		for (const components of this.uiComponents.values()) {
			allComponents.push(...components.filter((c) => c.location === location));
		}
		// Sort by priority (higher priority first)
		return allComponents.sort((a, b) => (b.priority || 0) - (a.priority || 0));
	}

	clear(): void {
		this.plugins.clear();
		this.hooks.clear();
		this.uiComponents.clear();
	}

	clearUIComponents(pluginId: string): void {
		this.uiComponents.delete(pluginId);
	}
}

export const pluginRegistry = new PluginRegistry();
