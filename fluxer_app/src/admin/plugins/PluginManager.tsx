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

import {useEffect, useState} from 'react';
import {clientPluginManager} from '@app/lib/plugins/PluginManager';

interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description: string;
}

interface PluginInfo {
	manifest: PluginManifest;
	enabled: boolean;
	loaded: boolean;
}

export function PluginManager() {
	const [plugins, setPlugins] = useState<PluginInfo[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadPlugins = async () => {
			try {
				await clientPluginManager.initialize();
				const pluginList = clientPluginManager.getPlugins() as PluginInfo[];
				setPlugins(pluginList);
			} catch (error) {
				console.error('Failed to load plugins:', error);
			} finally {
				setLoading(false);
			}
		};

		loadPlugins();
	}, []);

	const handleEnable = async (pluginId: string) => {
		try {
			await clientPluginManager.enablePlugin(pluginId);
			const pluginList = clientPluginManager.getPlugins() as PluginInfo[];
			setPlugins(pluginList);
		} catch (error) {
			console.error('Failed to enable plugin:', error);
		}
	};

	const handleDisable = async (pluginId: string) => {
		try {
			await clientPluginManager.disablePlugin(pluginId);
			const pluginList = clientPluginManager.getPlugins() as PluginInfo[];
			setPlugins(pluginList);
		} catch (error) {
			console.error('Failed to disable plugin:', error);
		}
	};

	const handleReload = async (pluginId: string) => {
		try {
			await clientPluginManager.reloadPlugin(pluginId);
			const pluginList = clientPluginManager.getPlugins() as PluginInfo[];
			setPlugins(pluginList);
		} catch (error) {
			console.error('Failed to reload plugin:', error);
		}
	};

	if (loading) {
		return <div>Loading plugins...</div>;
	}

	return (
		<div className="plugin-manager">
			<h2>Plugin Manager</h2>
			{plugins.length === 0 ? (
				<p>No plugins installed</p>
			) : (
				<ul>
					{plugins.map((plugin) => (
						<li key={plugin.manifest.id}>
							<div>
								<strong>{plugin.manifest.name}</strong>
								<span>v{plugin.manifest.version}</span>
								<span>{plugin.manifest.description}</span>
								<span>Status: {plugin.enabled ? 'Enabled' : 'Disabled'}</span>
								<span>Loaded: {plugin.loaded ? 'Yes' : 'No'}</span>
							</div>
							<div>
								{plugin.enabled ? (
									<button type="button" onClick={() => handleDisable(plugin.manifest.id)}>Disable</button>
								) : (
									<button type="button" onClick={() => handleEnable(plugin.manifest.id)}>Enable</button>
								)}
								<button type="button" onClick={() => handleReload(plugin.manifest.id)}>Reload</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
