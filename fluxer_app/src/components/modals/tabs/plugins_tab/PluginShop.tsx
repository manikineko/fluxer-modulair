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
import {Trans} from '@lingui/react/macro';
import styles from '@app/components/modals/tabs/plugins_tab/PluginsTab.module.css';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useEffect, useState} from 'react';

interface ServerPlugin {
	id: string;
	version: string;
	name: string;
	description: string;
	author: string;
	enabled: boolean;
	loaded: boolean;
}

const PluginShop: React.FC = observer(() => {
	const [plugins, setPlugins] = useState<Array<ServerPlugin>>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');

	const categories = ['all', 'discord', 'media', 'utilities', 'social'];

	useEffect(() => {
		const loadPlugins = async () => {
			setLoading(true);
			try {
				const response = await fetch('/plugins');
				const data = await response.json();
				setPlugins(data.plugins || []);
			} catch (error) {
				console.error('Failed to load plugins:', error);
			} finally {
				setLoading(false);
			}
		};

		loadPlugins();
	}, []);

	const filteredPlugins = plugins.filter(plugin => {
		const matchesCategory = selectedCategory === 'all' || plugin.name.toLowerCase().includes(selectedCategory);
		return matchesCategory;
	});

	const handleEnable = async (pluginId: string) => {
		try {
			await fetch(`/plugins/${pluginId}/enable`, {method: 'POST'});
			setPlugins(plugins.map(p => 
				p.id === pluginId ? {...p, enabled: true} : p
			));
		} catch (error) {
			console.error(`Error enabling plugin ${pluginId}:`, error);
		}
	};

	const handleDisable = async (pluginId: string) => {
		try {
			await fetch(`/plugins/${pluginId}/disable`, {method: 'POST'});
			setPlugins(plugins.map(p => 
				p.id === pluginId ? {...p, enabled: false} : p
			));
		} catch (error) {
			console.error(`Error disabling plugin ${pluginId}:`, error);
		}
	};

	if (loading) {
		return (
			<SettingsTabSection title={<Trans>Instance Plugins</Trans>}>
				<div className={styles['plugins-loading']}>
					<Trans>Loading instance plugins...</Trans>
				</div>
			</SettingsTabSection>
		);
	}

	return (
		<SettingsTabSection
			title={<Trans>Instance Plugins</Trans>}
			description={<Trans>Manage instance-wide plugins that apply to all users.</Trans>}
		>
			<div className={styles['plugin-store']}>
				<div className={styles['plugin-store-header']}>
					<div className={styles['plugin-categories']}>
						{categories.map((category) => (
							<button
								key={category}
								type="button"
								className={`${styles['category-button']} ${selectedCategory === category ? styles.active : ''}`}
								onClick={() => setSelectedCategory(category)}
							>
								{category === 'all' ? <Trans>All</Trans> : category.charAt(0).toUpperCase() + category.slice(1)}
							</button>
						))}
					</div>
				</div>

				<div className={styles['plugin-store-grid']}>
					{filteredPlugins.map((plugin) => (
						<div key={plugin.id} className={styles['plugin-card']}>
							<div className={styles['plugin-card-header']}>
								<h3 className={styles['plugin-card-name']}>{plugin.name}</h3>
								<span className={styles['plugin-card-version']}>v{plugin.version}</span>
							</div>
							<p className={styles['plugin-card-description']}>{plugin.description}</p>
							<div className={styles['plugin-card-meta']}>
								<span className={styles['plugin-author']}>
									<Trans>by {plugin.author}</Trans>
								</span>
							</div>
							<div className={styles['plugin-card-stats']}>
								<span className={styles.enabled}>
									{plugin.enabled ? '✓ Enabled' : '○ Disabled'}
								</span>
								<span className={styles.loaded}>
									{plugin.loaded ? '✓ Loaded' : '○ Not Loaded'}
								</span>
							</div>
							<div className={styles['plugin-card-actions']}>
								{plugin.enabled ? (
									<Button
										variant="danger-secondary"
										onClick={() => handleDisable(plugin.id)}
									>
										<Trans>Disable</Trans>
									</Button>
								) : (
									<Button variant="primary" onClick={() => handleEnable(plugin.id)}>
										<Trans>Enable</Trans>
									</Button>
								)}
							</div>
						</div>
					))}
				</div>

				{filteredPlugins.length === 0 && (
					<div className={styles['plugins-empty']}>
						<Trans>No plugins found matching your criteria.</Trans>
					</div>
				)}
			</div>
		</SettingsTabSection>
	);
});

export default PluginShop;
