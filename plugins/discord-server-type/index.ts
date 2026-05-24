/*
 * MIT License
 *
 * Copyright (c) 2026 manikineko.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type {PluginContext} from '@fluxer/plugin';
import {serverTypeRegistry} from '@fluxer/plugin';

export async function onLoad(context: PluginContext): Promise<void> {
	context.log('Discord Server Type plugin loaded');
}

export async function onEnable(context: PluginContext): Promise<void> {
	context.log('Discord Server Type plugin enabled');
	
	// Register the Discord guild server type
	serverTypeRegistry.register({
		id: 'discord-guild',
		name: 'Discord Guild',
		description: 'A Discord server/guild for integration and bridging',
		icon: '🎮',
		iconType: 'emoji',
		category: 'discord',
		supportsFederation: false,
		supportsRealtime: true,
		supportsHistory: true,
		supportsVoice: true,
		supportsFiles: true,
		configSchema: {
			botToken: {
				type: 'string',
				required: true,
				description: 'Discord bot token'
			},
			guildId: {
				type: 'string',
				required: true,
				description: 'Discord guild ID'
			},
			bridgeChannels: {
				type: 'array',
				required: false,
				description: 'Channel mapping for bridging'
			}
		},
		validateConfig: (config: any) => {
			return !!(config.botToken && config.guildId);
		},
		handleConnect: async (config: any) => {
			context.log(`Connecting to Discord guild: ${config.guildId}`);
			// Implementation would connect via Discord API
		},
		handleDisconnect: async () => {
			context.log('Disconnecting from Discord guild');
			// Implementation would disconnect
		},
		handleSync: async () => {
			context.log('Syncing with Discord guild');
			// Implementation would sync messages/users
		}
	});
}

export async function onDisable(context: PluginContext): Promise<void> {
	context.log('Discord Server Type plugin disabled');
	serverTypeRegistry.unregister('discord-guild');
}
