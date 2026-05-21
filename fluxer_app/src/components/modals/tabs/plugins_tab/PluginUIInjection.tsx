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

import {clientPluginManager} from '@app/lib/plugins/PluginManager';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useEffect, useState} from 'react';

interface PluginUIInjectionProps {
	location: string;
	props?: Record<string, unknown>;
}

const PluginUIInjection: React.FC<PluginUIInjectionProps> = observer(({location, props = {}}) => {
	const [components, setComponents] = useState<Array<unknown>>([]);

	useEffect(() => {
		const loadComponents = () => {
			if (clientPluginManager.isInitialized()) {
				const pluginComponents = clientPluginManager.getUIComponents(location);
				setComponents(pluginComponents);
			}
		};

		loadComponents();

		// Re-load components when plugins are enabled/disabled
		const interval = setInterval(loadComponents, 5000);
		return () => clearInterval(interval);
	}, [location]);

	if (components.length === 0) {
		return null;
	}

	return (
		<div className="plugin-ui-injection">
			{components.map((component: unknown, index: number) => {
				const comp = component as {id: string; name: string; component: unknown; props?: Record<string, unknown>};
				if (!comp.component) return null;
				
				const Component = comp.component as React.ComponentType<Record<string, unknown>>;
				return (
					<div key={`${comp.id}-${index}`} className="plugin-ui-component">
						<Component {...props} {...comp.props} />
					</div>
				);
			})}
		</div>
	);
});

export default PluginUIInjection;
