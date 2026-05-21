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

import type React from 'react';

export interface UIComponentDescriptor {
	id: string;
	name: string;
	location: string;
	component: React.ComponentType<Record<string, unknown>>;
	props?: Record<string, unknown>;
	priority?: number;
}

export class UIComponentRegistry {
	private static instance: UIComponentRegistry;
	private components: Map<string, Map<string, UIComponentDescriptor>> = new Map();

	static getInstance(): UIComponentRegistry {
		if (!UIComponentRegistry.instance) {
			UIComponentRegistry.instance = new UIComponentRegistry();
		}
		return UIComponentRegistry.instance;
	}

	registerComponent(pluginId: string, component: UIComponentDescriptor): void {
		if (!this.components.has(pluginId)) {
			this.components.set(pluginId, new Map());
		}
		const pluginComponents = this.components.get(pluginId);
		if (pluginComponents) {
			pluginComponents.set(component.id, component);
		}
		console.log(`[UIComponentRegistry] Registered component ${component.id} from plugin ${pluginId}`);
	}

	unregisterComponent(pluginId: string, componentId: string): void {
		const pluginComponents = this.components.get(pluginId);
		if (pluginComponents) {
			pluginComponents.delete(componentId);
			console.log(`[UIComponentRegistry] Unregistered component ${componentId} from plugin ${pluginId}`);
		}
	}

	unregisterPluginComponents(pluginId: string): void {
		this.components.delete(pluginId);
		console.log(`[UIComponentRegistry] Unregistered all components from plugin ${pluginId}`);
	}

	getComponentsByLocation(location: string): Array<UIComponentDescriptor> {
		const allComponents: Array<UIComponentDescriptor> = [];
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

	getComponent(pluginId: string, componentId: string): UIComponentDescriptor | null {
		const pluginComponents = this.components.get(pluginId);
		if (pluginComponents) {
			return pluginComponents.get(componentId) ?? null;
		}
		return null;
	}

	getAllComponents(): Map<string, Map<string, UIComponentDescriptor>> {
		return new Map(this.components);
	}

	clear(): void {
		this.components.clear();
	}
}

export const uiComponentRegistry = UIComponentRegistry.getInstance();
