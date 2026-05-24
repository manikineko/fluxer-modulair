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
	context.log('Fluxer Server Type plugin loaded');
}

export async function onEnable(context: PluginContext): Promise<void> {
	context.log('Fluxer Server Type plugin enabled');
	
	// Register the Fluxer instance server type
	serverTypeRegistry.register({
		id: 'fluxer-instance',
		name: 'Fluxer Instance',
		description: 'A federated Fluxer instance for cross-instance communication',
		icon: '🌐',
		iconType: 'emoji',
		category: 'fluxer',
		supportsFederation: true,
		supportsRealtime: true,
		supportsHistory: true,
		supportsVoice: true,
		supportsFiles: true,
		configSchema: {
			instanceUrl: {
				type: 'string',
				required: true,
				description: 'The URL of the Fluxer instance'
			},
			apiKey: {
				type: 'string',
				required: false,
				description: 'API key for authentication'
			},
			autoSync: {
				type: 'boolean',
				default: true,
				description: 'Automatically sync data'
			}
		},
		validateConfig: (config: any) => {
			return !!(config.instanceUrl && config.instanceUrl.startsWith('http'));
		},
		handleConnect: async (config: any) => {
			context.log(`Connecting to Fluxer instance: ${config.instanceUrl}`);
			// Implementation would connect to the instance
		},
		handleDisconnect: async () => {
			context.log('Disconnecting from Fluxer instance');
			// Implementation would disconnect
		},
		handleSync: async () => {
			context.log('Syncing with Fluxer instance');
			// Implementation would sync data
		},
		renderSettings: (props: any) => {
			const {React} = context;
			return React.createElement('div', {className: 'fluxer-server-settings'},
				React.createElement('h3', null, 'Fluxer Instance Settings'),
				React.createElement('input', {
					type: 'text',
					placeholder: 'Instance URL',
					defaultValue: props.serverData.instanceUrl || '',
					onChange: (e: any) => props.onUpdate({...props.serverData, instanceUrl: e.target.value})
				}),
				React.createElement('input', {
					type: 'password',
					placeholder: 'API Key (optional)',
					defaultValue: props.serverData.apiKey || '',
					onChange: (e: any) => props.onUpdate({...props.serverData, apiKey: e.target.value})
				}),
				React.createElement('button', {
					onClick: props.onConnect
				}, 'Connect'),
				React.createElement('button', {
					onClick: props.onDisconnect
				}, 'Disconnect'),
				React.createElement('button', {
					onClick: props.onSync
				}, 'Sync Now')
			);
		}
	});
}

export async function onDisable(context: PluginContext): Promise<void> {
	context.log('Fluxer Server Type plugin disabled');
	serverTypeRegistry.unregister('fluxer-instance');
}
