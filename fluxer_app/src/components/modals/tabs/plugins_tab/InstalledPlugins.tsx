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

import {Button} from '@app/components/uikit/button/Button';
import {SettingsTabSection} from '@app/components/modals/shared/SettingsTabLayout';
import Config from '@app/Config';
import {usePluginUIComponents} from '@app/hooks/usePluginUIComponents';
import {Trans} from '@lingui/react/macro';
import styles from '@app/components/modals/tabs/plugins_tab/PluginsTab.module.css';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useEffect, useState} from 'react';

interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description: string;
	author?: string;
	license?: string;
}

interface PluginInfo {
	manifest: PluginManifest;
	enabled: boolean;
	loaded: boolean;
}

const InstalledPlugins: React.FC = observer(() => {
	const [plugins, setPlugins] = useState<Array<PluginInfo>>([]);
	const [loading, setLoading] = useState(true);
	const {components: pluginUIComponents, loading: uiLoading} = usePluginUIComponents('settings');
	const apiUrl = Config.PUBLIC_BOOTSTRAP_API_ENDPOINT;

	console.log('InstalledPlugins rendering, Config.PUBLIC_BOOTSTRAP_API_ENDPOINT:', Config.PUBLIC_BOOTSTRAP_API_ENDPOINT);
	console.log('InstalledPlugins rendering, apiUrl:', apiUrl);

	useEffect(() => {
		const loadPlugins = async () => {
			console.log('Loading plugins from:', `${apiUrl}/plugins`);
			setLoading(true);
			try {
				const response = await fetch(`${apiUrl}/plugins`);
				console.log('Plugins response status:', response.status);
				const data = await response.json();
				console.log('Plugins data:', data);
				setPlugins(data.plugins || []);
			} catch (error) {
				console.error('Failed to load plugins:', error);
			} finally {
				setLoading(false);
			}
		};

		loadPlugins();
	}, [apiUrl]);

	const handleEnable = async (pluginId: string) => {
		try {
			await fetch(`${apiUrl}/plugins/${pluginId}/enable`, {method: 'POST'});
			const response = await fetch(`${apiUrl}/plugins`);
			const data = await response.json();
			setPlugins(data.plugins || []);
		} catch (error) {
			console.error('Failed to enable plugin:', error);
		}
	};

	const handleDisable = async (pluginId: string) => {
		try {
			await fetch(`${apiUrl}/plugins/${pluginId}/disable`, {method: 'POST'});
			const response = await fetch(`${apiUrl}/plugins`);
			const data = await response.json();
			setPlugins(data.plugins || []);
		} catch (error) {
			console.error('Failed to disable plugin:', error);
		}
	};

	const handleReload = async (pluginId: string) => {
		try {
			await fetch(`${apiUrl}/plugins/${pluginId}/reload`, {method: 'POST'});
			const response = await fetch(`${apiUrl}/plugins`);
			const data = await response.json();
			setPlugins(data.plugins || []);
		} catch (error) {
			console.error('Failed to reload plugin:', error);
		}
	};

	return (
		<>
			{pluginUIComponents.length > 0 && (
				<SettingsTabSection title={<Trans>Plugin UI Components</Trans>}>
					{uiLoading ? (
						<div className={styles['plugins-loading']}>
							<Trans>Loading plugin UI components...</Trans>
						</div>
					) : (
						<div style={{marginTop: '0.5rem'}}>
							{pluginUIComponents.map((component) => (
								<div key={component.id} style={{padding: '0.25rem 0', borderBottom: '1px solid var(--background-modifier-accent)'}}>
									<h4 style={{fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.25rem 0'}}>
										{component.name}
									</h4>
									<p style={{fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0}}>
										Location: {component.location} | Priority: {component.priority}
									</p>
								</div>
							))}
						</div>
					)}
				</SettingsTabSection>
			)}
			<SettingsTabSection
				title={<Trans>Instance Plugins</Trans>}
				description={<Trans>Manage instance-wide plugins that apply to all users.</Trans>}
			>
				{loading ? (
					<div className={styles['plugins-loading']}>
						<Trans>Loading instance plugins...</Trans>
					</div>
				) : plugins.length === 0 ? (
					<div className={styles['plugins-empty']}>
						<Trans>No plugins installed</Trans>
					</div>
				) : (
					<div className={styles['plugins-list']}>
						{plugins.map((plugin) => (
							<div key={plugin.manifest.id} className={styles['plugin-item']}>
								<div className={styles['plugin-info']}>
									<h3 className={styles['plugin-name']}>{plugin.manifest.name}</h3>
									<p className={styles['plugin-version']}>v{plugin.manifest.version}</p>
									<p className={styles['plugin-description']}>{plugin.manifest.description}</p>
									{plugin.manifest.author && (
										<p className={styles['plugin-author']}>
											<Trans>by {plugin.manifest.author}</Trans>
										</p>
									)}
									<div className={styles['plugin-status']}>
										<span className={`${styles['status-badge']} ${plugin.enabled ? styles.enabled : styles.disabled}`}>
											{plugin.enabled ? <Trans>Enabled</Trans> : <Trans>Disabled</Trans>}
										</span>
										<span className={`${styles['status-badge']} ${plugin.loaded ? styles.loaded : styles.unloaded}`}>
											{plugin.loaded ? <Trans>Loaded</Trans> : <Trans>Not Loaded</Trans>}
										</span>
									</div>
								</div>
								<div className={styles['plugin-actions']}>
									{plugin.enabled ? (
										<Button
											variant="danger-secondary"
											onClick={() => handleDisable(plugin.manifest.id)}
										>
											<Trans>Disable</Trans>
										</Button>
									) : (
										<Button
											variant="primary"
											onClick={() => handleEnable(plugin.manifest.id)}
										>
											<Trans>Enable</Trans>
										</Button>
									)}
									<Button
										variant="secondary"
										onClick={() => handleReload(plugin.manifest.id)}
									>
										<Trans>Reload</Trans>
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</SettingsTabSection>
		</>
	);
});

export default InstalledPlugins;
