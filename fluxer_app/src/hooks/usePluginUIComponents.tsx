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

import {PluginComponentRegistry} from '@app/lib/plugins/PluginComponentRegistry';
import type React from 'react';
import {useState, useEffect, useMemo} from 'react';

export interface UIComponentDescriptor {
	id: string;
	name: string;
	component: string;
	location: 'settings' | 'channel_header' | 'message' | 'user_popout' | 'guild_menu' | 'sidebar';
	priority?: number;
	props?: Record<string, unknown>;
}

export interface ResolvedUIComponent {
	id: string;
	name: string;
	component: React.ComponentType<Record<string, unknown>>;
	location: string;
	priority: number;
	props?: Record<string, unknown>;
}

export interface UIComponentsResponse {
	components: Array<UIComponentDescriptor>;
}

/**
 * Hook to get plugin UI components for a specific location.
 * Components are registered at runtime by plugins via the plugin API.
 */
export function usePluginUIComponents(location?: string) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Get components directly from the registry
	const resolvedComponents = useMemo((): Array<ResolvedUIComponent> => {
		try {
			const registeredComponents = location 
				? PluginComponentRegistry.getComponentsByLocation(location)
				: [];
			
			console.log(`[usePluginUIComponents] Found ${registeredComponents.length} components for location ${location || 'all'}`);
			
			return registeredComponents
				.map((desc): ResolvedUIComponent | null => {
					const Component = PluginComponentRegistry.resolveComponent(desc.component);
					if (!Component) {
						console.warn(`Component ${desc.id} from plugin ${desc.pluginId} could not be resolved`);
						return null;
					}
					return {
						id: desc.id,
						name: desc.name,
						component: Component,
						location: desc.location,
						priority: desc.priority ?? 0,
						props: desc.props,
					};
				})
				.filter((c): c is ResolvedUIComponent => c !== null)
				.sort((a, b) => b.priority - a.priority);
		} catch (err) {
			console.error('Error resolving plugin UI components:', err);
			setError(err as Error);
			return [];
		}
	}, [location]);

	// Set loading to false after initial resolution
	useEffect(() => {
		setLoading(false);
	}, [location]);

	return {components: resolvedComponents, loading, error};
}
