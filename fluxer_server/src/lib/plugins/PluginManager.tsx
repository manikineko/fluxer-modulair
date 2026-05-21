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

import {PluginManager, type PluginManagerOptions} from '@fluxer/plugin';

const logger = console;

export class ServerPluginManager extends PluginManager {
	constructor() {
		const options: PluginManagerOptions = {
			pluginDirectory: process.env.FLUXER_PLUGIN_DIR || '/usr/src/app/plugins',
			target: 'server',
			autoLoad: process.env.FLUXER_PLUGIN_AUTOLOAD === 'true',
			hotReload: process.env.FLUXER_PLUGIN_HOT_RELOAD === 'true',
			environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'production',
			logger: {
				info: (message: string) => logger.info(message),
				error: (message: string, error?: unknown) => logger.error(message, error),
				warn: (message: string) => logger.warn(message),
			},
		};
		super(options);
	}
}

export const serverPluginManager = new ServerPluginManager();
