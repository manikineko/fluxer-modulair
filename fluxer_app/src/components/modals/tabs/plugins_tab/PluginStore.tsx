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

interface ShopPlugin {
	id: string;
	name: string;
	version: string;
	description: string;
	author: string;
	license: string;
	category: string;
	downloads: number;
	rating: number;
	installed: boolean;
}

const PluginStore: React.FC = observer(() => {
	const [plugins, setPlugins] = useState<Array<ShopPlugin>>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<string>('all');

	// Sample plugin data - in production this would come from the plugin shop API
	const samplePlugins: Array<ShopPlugin> = [
		{
			id: 'atproto-pds',
			name: 'ATProto PDS Server',
			version: '1.0.0',
			description: 'Transforms Fluxer into an AT Protocol Personal Data Server (PDS)',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'social',
			downloads: 500,
			rating: 5.0,
			installed: false,
		},
		{
			id: 'discord-decos',
			name: 'Discord Decorations',
			version: '1.0.0',
			description: 'Adds Discord-style profile decorations (avatar decorations, banners, profile effects)',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'social',
			downloads: 750,
			rating: 4.8,
			installed: false,
		},
		{
			id: 'bluesky',
			name: 'Bluesky',
			version: '1.0.0',
			description: 'Bluesky social network implementation using ATProto features',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'social',
			downloads: 300,
			rating: 4.7,
			installed: false,
		},
		{
			id: 'ipfs',
			name: 'IPFS Storage',
			version: '1.0.0',
			description: 'IPFS-based file storage and sharing plugin',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'storage',
			downloads: 200,
			rating: 4.5,
			installed: false,
		},
		{
			id: 's3-storage',
			name: 'S3 Storage',
			version: '1.0.0',
			description: 'AWS S3-compatible storage backend for file uploads',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'storage',
			downloads: 150,
			rating: 4.3,
			installed: false,
		},
	];

	useEffect(() => {
		// Simulate loading plugins from store
		setTimeout(() => {
			setPlugins(samplePlugins);
			setLoading(false);
		}, 500);
	}, []);

	const categories = ['all', ...new Set(samplePlugins.map((p) => p.category))];

	const filteredPlugins =
		selectedCategory === 'all' ? plugins : plugins.filter((p) => p.category === selectedCategory);

	const handleInstall = async (pluginId: string) => {
		console.log(`Installing plugin: ${pluginId}`);
		// In production, this would call the plugin shop API to install
		setPlugins(plugins.map((p) => (p.id === pluginId ? {...p, installed: true} : p)));
	};

	const handleUninstall = async (pluginId: string) => {
		console.log(`Uninstalling plugin: ${pluginId}`);
		// In production, this would call the plugin shop API to uninstall
		setPlugins(plugins.map((p) => (p.id === pluginId ? {...p, installed: false} : p)));
	};

	if (loading) {
		return (
			<SettingsTabSection title={<Trans>Plugin Store</Trans>}>
				<div className={styles['plugins-loading']}>
					<Trans>Loading plugin store...</Trans>
				</div>
			</SettingsTabSection>
		);
	}

	return (
		<div className={styles['plugin-store']}>
			<SettingsTabSection
				title={<Trans>Plugin Store</Trans>}
				description={<Trans>Browse and install plugins to extend Fluxer functionality.</Trans>}
			>
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
								<span>{plugin.license}</span>
							</div>
							<div className={styles['plugin-card-stats']}>
								<span className={styles['plugin-card-rating']}>★ {plugin.rating.toFixed(1)}</span>
								<span>{plugin.downloads} downloads</span>
							</div>
							<div className={styles['plugin-card-actions']}>
								{plugin.installed ? (
									<Button
										variant="danger-secondary"
										onClick={() => handleUninstall(plugin.id)}
									>
										<Trans>Uninstall</Trans>
									</Button>
								) : (
									<Button variant="primary" onClick={() => handleInstall(plugin.id)}>
										<Trans>Install</Trans>
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
			</SettingsTabSection>
		</div>
	);
});

export default PluginStore;
