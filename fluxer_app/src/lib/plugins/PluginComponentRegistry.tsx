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

import React from 'react';

// Plugin UI Components - registered by the app
// These map component names (from plugin manifests) to actual React components
// The actual component implementations are in @app/components/channel/channel_header_components/
const PLUGIN_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {};

export interface RegisteredComponent {
	id: string;
	name: string;
	pluginId: string;
	component: unknown; // Can be a React component or a factory function
	location: string;
	priority: number;
	props?: Record<string, unknown>;
}

/**
 * PluginComponentRegistry - Dynamic registry for plugin UI components.
 * 
 * Plugins register their UI components at runtime via the plugin API.
 * The registry stores components and resolves factory functions to actual React components.
 */
class PluginComponentRegistryClass {
	private components: Map<string, Map<string, RegisteredComponent>> = new Map();
	private componentFactories: Map<string, React.ComponentType<Record<string, unknown>>> = new Map();

	constructor() {
		// Register plugin component factories
		for (const [name, component] of Object.entries(PLUGIN_COMPONENTS)) {
			this.componentFactories.set(name, component);
		}
	}

	/**
	 * Register a React component for a given component name.
	 * This is called by the app to register the actual UI implementation for a plugin component.
	 */
	registerComponentFactory(name: string, component: React.ComponentType<Record<string, unknown>>): void {
		this.componentFactories.set(name, component);
	}

	/**
	 * Resolve a component to an actual React component.
	 * If the component is a factory function, call it with React to get the actual component.
	 */
	resolveComponent(component: unknown): React.ComponentType<Record<string, unknown>> | null {
		// If it's a function, it might be a factory that needs React
		if (typeof component === 'function') {
			try {
				// Try calling it with React to get the actual component
				const result = (component as (React: unknown) => unknown)(React);
				if (typeof result === 'function') {
					return result as React.ComponentType<Record<string, unknown>>;
				}
			} catch {
				// If it fails, it might already be a React component
				return component as React.ComponentType<Record<string, unknown>>;
			}
		}
		
		// If it's already a React component, return it
		if (component && typeof component === 'object' && '$$typeof' in component) {
			return component as React.ComponentType<Record<string, unknown>>;
		}
		
		return null;
	}

	/**
	 * Register a component from a plugin.
	 * Called by the plugin API when a plugin calls ctx.api.registerUIComponent()
	 */
	registerComponent(pluginId: string, component: RegisteredComponent): void {
		if (!this.components.has(pluginId)) {
			this.components.set(pluginId, new Map());
		}
		const pluginComponents = this.components.get(pluginId);
		if (pluginComponents) {
			pluginComponents.set(component.id, component);
		}
		console.log(`[PluginComponentRegistry] Registered component ${component.id} from plugin ${pluginId}`);
	}

	/**
	 * Unregister a specific component from a plugin.
	 */
	unregisterComponent(pluginId: string, componentId: string): void {
		const pluginComponents = this.components.get(pluginId);
		if (pluginComponents) {
			pluginComponents.delete(componentId);
			console.log(`[PluginComponentRegistry] Unregistered component ${componentId} from plugin ${pluginId}`);
		}
	}

	/**
	 * Unregister all components from a plugin.
	 */
	unregisterPluginComponents(pluginId: string): void {
		this.components.delete(pluginId);
		console.log(`[PluginComponentRegistry] Unregistered all components from plugin ${pluginId}`);
	}

	/**
	 * Get all components registered for a specific location.
	 */
	getComponentsByLocation(location: string): Array<RegisteredComponent> {
		const allComponents: Array<RegisteredComponent> = [];
		for (const pluginComponents of this.components.values()) {
			for (const component of pluginComponents.values()) {
				if (component.location === location) {
					allComponents.push(component);
				}
			}
		}
		// Sort by priority (higher priority first)
		return allComponents.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
	}

	/**
	 * Get a specific component by plugin ID and component ID.
	 */
	getComponent(pluginId: string, componentId: string): RegisteredComponent | null {
		const pluginComponents = this.components.get(pluginId);
		if (pluginComponents) {
			return pluginComponents.get(componentId) ?? null;
		}
		return null;
	}

	/**
	 * Clear all registered components.
	 */
	clear(): void {
		this.components.clear();
	}
}

export const PluginComponentRegistry = new PluginComponentRegistryClass();

/**
 * Register a plugin UI component.
 * Called by the app during initialization to register the actual React component
 * that implements a plugin's UI.
 */
export function registerPluginComponent(name: string, component: React.ComponentType<Record<string, unknown>>): void {
	PLUGIN_COMPONENTS[name] = component;
	// Also register with the registry instance
	PluginComponentRegistry.registerComponentFactory(name, component);
}
