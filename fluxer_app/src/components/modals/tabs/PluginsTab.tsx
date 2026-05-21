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

import PluginShop from '@app/components/modals/tabs/plugins_tab/PluginShop';
import InstalledPlugins from '@app/components/modals/tabs/plugins_tab/InstalledPlugins';
import {SettingsTabContainer} from '@app/components/modals/shared/SettingsTabLayout';
import {Trans} from '@lingui/react/macro';
import styles from '@app/components/modals/tabs/plugins_tab/PluginsTab.module.css';
import type React from 'react';
import {useState} from 'react';

type PluginsTabType = 'installed' | 'store';

interface PluginsTabProps {
	subtab?: PluginsTabType;
}

const PluginsTab: React.FC<PluginsTabProps> = ({subtab = 'installed'}) => {
	const [activeSubtab, setActiveSubtab] = useState<PluginsTabType>(subtab);

	return (
		<SettingsTabContainer>
			<div className={styles['plugins-tab']}>
				<div className={styles['plugins-tab-header']}>
					<button
						type="button"
						className={`${styles['plugins-tab-button']} ${activeSubtab === 'installed' ? styles.active : ''}`}
						onClick={() => setActiveSubtab('installed')}
					>
						<Trans>Installed</Trans>
					</button>
					<button
						type="button"
						className={`${styles['plugins-tab-button']} ${activeSubtab === 'store' ? styles.active : ''}`}
						onClick={() => setActiveSubtab('store')}
					>
						<Trans>Plugin Shop</Trans>
					</button>
				</div>
				<div className={styles['plugins-tab-content']}>
					{activeSubtab === 'installed' && <InstalledPlugins />}
					{activeSubtab === 'store' && <PluginShop />}
				</div>
			</div>
		</SettingsTabContainer>
	);
};

export default PluginsTab;
