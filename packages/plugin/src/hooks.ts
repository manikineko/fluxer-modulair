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

import type {EventHandler, PluginState} from './types';

export class PluginHooks {
	private static instance: PluginHooks;
	private eventListeners: Map<string, Set<EventHandler>> = new Map();

	static getInstance(): PluginHooks {
		if (!PluginHooks.instance) {
			PluginHooks.instance = new PluginHooks();
		}
		return PluginHooks.instance;
	}

	register(eventName: string, handler: EventHandler): void {
		if (!this.eventListeners.has(eventName)) {
			this.eventListeners.set(eventName, new Set());
		}
		const listeners = this.eventListeners.get(eventName);
		if (listeners) {
			listeners.add(handler);
		}
	}

	unregister(eventName: string, handler: EventHandler): void {
		const listeners = this.eventListeners.get(eventName);
		if (listeners) {
			listeners.delete(handler);
		}
	}

	async emit(eventName: string, ...args: Array<unknown>): Promise<void> {
		const listeners = this.eventListeners.get(eventName);
		if (!listeners) return;

		const promises = Array.from(listeners).map(async (handler) => {
			try {
				await handler(...args);
			} catch (error) {
				console.error(`Error in event handler for ${eventName}:`, error);
			}
		});

		await Promise.all(promises);
	}

	async emitSequential(eventName: string, ...args: Array<unknown>): Promise<void> {
		const listeners = this.eventListeners.get(eventName);
		if (!listeners) return;

		for (const handler of listeners) {
			try {
				await handler(...args);
			} catch (error) {
				console.error(`Error in event handler for ${eventName}:`, error);
			}
		}
	}

	clear(): void {
		this.eventListeners.clear();
	}

	getListenerCount(eventName: string): number {
		return this.eventListeners.get(eventName)?.size ?? 0;
	}

	getAllEvents(): Array<string> {
		return Array.from(this.eventListeners.keys());
	}
}

export const pluginHooks = PluginHooks.getInstance();

// Built-in hook names
export const HOOKS = {
	// Lifecycle
	ON_LOAD: 'plugin:onLoad',
	ON_UNLOAD: 'plugin:onUnload',
	ON_ENABLE: 'plugin:onEnable',
	ON_DISABLE: 'plugin:onDisable',
	
	// Client hooks
	ON_MESSAGE_CREATE: 'message:onCreate',
	ON_MESSAGE_UPDATE: 'message:onUpdate',
	ON_MESSAGE_DELETE: 'message:onDelete',
	ON_CHANNEL_CREATE: 'channel:onCreate',
	ON_CHANNEL_UPDATE: 'channel:onUpdate',
	ON_CHANNEL_DELETE: 'channel:onDelete',
	
	// Server hooks
	ON_REQUEST: 'server:onRequest',
	ON_RESPONSE: 'server:onResponse',
	ON_ERROR: 'server:onError',
	
	// UI hooks
	ON_UI_COMPONENT_REGISTER: 'ui:onComponentRegister',
	ON_UI_COMPONENT_UNREGISTER: 'ui:onComponentUnregister',
	ON_UI_RENDER: 'ui:onRender',
} as const;

export async function registerPluginHooks(plugin: PluginState, pluginModule?: unknown): Promise<void> {
	const {manifest, context} = plugin;
	if (!context) return;

	const {hooks} = manifest;
	if (!hooks) return;

	// Use provided module or import it
	let resolvedModule = pluginModule;
	if (!resolvedModule) {
		const pluginPath = `/usr/src/app/plugins/${manifest.id}`;
		resolvedModule = await import(`${pluginPath}/${manifest.main}`);
	}

	if (hooks.onLoad && typeof hooks.onLoad === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onLoad];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_LOAD, hookFunc as EventHandler);
		}
	}
	if (hooks.onUnload && typeof hooks.onUnload === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onUnload];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_UNLOAD, hookFunc as EventHandler);
		}
	}
	if (hooks.onEnable && typeof hooks.onEnable === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onEnable];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_ENABLE, hookFunc as EventHandler);
		}
	}
	if (hooks.onDisable && typeof hooks.onDisable === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onDisable];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_DISABLE, hookFunc as EventHandler);
		}
	}
	if (hooks.onMessageCreate && typeof hooks.onMessageCreate === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onMessageCreate];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_MESSAGE_CREATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onMessageUpdate && typeof hooks.onMessageUpdate === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onMessageUpdate];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_MESSAGE_UPDATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onMessageDelete && typeof hooks.onMessageDelete === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onMessageDelete];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_MESSAGE_DELETE, hookFunc as EventHandler);
		}
	}
	if (hooks.onChannelCreate && typeof hooks.onChannelCreate === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onChannelCreate];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_CHANNEL_CREATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onChannelUpdate && typeof hooks.onChannelUpdate === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onChannelUpdate];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_CHANNEL_UPDATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onChannelDelete && typeof hooks.onChannelDelete === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onChannelDelete];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_CHANNEL_DELETE, hookFunc as EventHandler);
		}
	}
	if (hooks.onRequest && typeof hooks.onRequest === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onRequest];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_REQUEST, hookFunc as EventHandler);
		}
	}
	if (hooks.onResponse && typeof hooks.onResponse === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onResponse];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_RESPONSE, hookFunc as EventHandler);
		}
	}
	if (hooks.onError && typeof hooks.onError === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onError];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_ERROR, hookFunc as EventHandler);
		}
	}
	if (hooks.onUIComponentRegister && typeof hooks.onUIComponentRegister === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onUIComponentRegister];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_UI_COMPONENT_REGISTER, hookFunc as EventHandler);
		}
	}
	if (hooks.onUIComponentUnregister && typeof hooks.onUIComponentUnregister === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onUIComponentUnregister];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_UI_COMPONENT_UNREGISTER, hookFunc as EventHandler);
		}
	}
	if (hooks.onUIRender && typeof hooks.onUIRender === 'string') {
		const hookFunc = (resolvedModule as Record<string, unknown>)[hooks.onUIRender];
		if (typeof hookFunc === 'function') {
			pluginHooks.register(HOOKS.ON_UI_RENDER, hookFunc as EventHandler);
		}
	}
}

export async function unregisterPluginHooks(plugin: PluginState): Promise<void> {
	const {manifest} = plugin;
	const {hooks} = manifest;
	if (!hooks) return;

	// Import the plugin module to resolve hook functions
	const pluginPath = `/usr/src/app/plugins/${manifest.id}`;
	const pluginModule = await import(`${pluginPath}/${manifest.main}`);

	if (hooks.onLoad && typeof hooks.onLoad === 'string') {
		const hookFunc = pluginModule[hooks.onLoad];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_LOAD, hookFunc as EventHandler);
		}
	}
	if (hooks.onUnload && typeof hooks.onUnload === 'string') {
		const hookFunc = pluginModule[hooks.onUnload];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_UNLOAD, hookFunc as EventHandler);
		}
	}
	if (hooks.onEnable && typeof hooks.onEnable === 'string') {
		const hookFunc = pluginModule[hooks.onEnable];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_ENABLE, hookFunc as EventHandler);
		}
	}
	if (hooks.onDisable && typeof hooks.onDisable === 'string') {
		const hookFunc = pluginModule[hooks.onDisable];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_DISABLE, hookFunc as EventHandler);
		}
	}
	if (hooks.onMessageCreate && typeof hooks.onMessageCreate === 'string') {
		const hookFunc = pluginModule[hooks.onMessageCreate];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_MESSAGE_CREATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onMessageUpdate && typeof hooks.onMessageUpdate === 'string') {
		const hookFunc = pluginModule[hooks.onMessageUpdate];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_MESSAGE_UPDATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onMessageDelete && typeof hooks.onMessageDelete === 'string') {
		const hookFunc = pluginModule[hooks.onMessageDelete];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_MESSAGE_DELETE, hookFunc as EventHandler);
		}
	}
	if (hooks.onChannelCreate && typeof hooks.onChannelCreate === 'string') {
		const hookFunc = pluginModule[hooks.onChannelCreate];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_CHANNEL_CREATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onChannelUpdate && typeof hooks.onChannelUpdate === 'string') {
		const hookFunc = pluginModule[hooks.onChannelUpdate];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_CHANNEL_UPDATE, hookFunc as EventHandler);
		}
	}
	if (hooks.onChannelDelete && typeof hooks.onChannelDelete === 'string') {
		const hookFunc = pluginModule[hooks.onChannelDelete];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_CHANNEL_DELETE, hookFunc as EventHandler);
		}
	}
	if (hooks.onRequest && typeof hooks.onRequest === 'string') {
		const hookFunc = pluginModule[hooks.onRequest];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_REQUEST, hookFunc as EventHandler);
		}
	}
	if (hooks.onResponse && typeof hooks.onResponse === 'string') {
		const hookFunc = pluginModule[hooks.onResponse];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_RESPONSE, hookFunc as EventHandler);
		}
	}
	if (hooks.onError && typeof hooks.onError === 'string') {
		const hookFunc = pluginModule[hooks.onError];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_ERROR, hookFunc as EventHandler);
		}
	}
	if (hooks.onUIComponentRegister && typeof hooks.onUIComponentRegister === 'string') {
		const hookFunc = pluginModule[hooks.onUIComponentRegister];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_UI_COMPONENT_REGISTER, hookFunc as EventHandler);
		}
	}
	if (hooks.onUIComponentUnregister && typeof hooks.onUIComponentUnregister === 'string') {
		const hookFunc = pluginModule[hooks.onUIComponentUnregister];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_UI_COMPONENT_UNREGISTER, hookFunc as EventHandler);
		}
	}
	if (hooks.onUIRender && typeof hooks.onUIRender === 'string') {
		const hookFunc = pluginModule[hooks.onUIRender];
		if (typeof hookFunc === 'function') {
			pluginHooks.unregister(HOOKS.ON_UI_RENDER, hookFunc as EventHandler);
		}
	}
}
