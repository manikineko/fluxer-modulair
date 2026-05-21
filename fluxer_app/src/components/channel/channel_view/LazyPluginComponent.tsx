/*
 * Copyright (C) 2026 Fluxer Contributors
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

import {PluginErrorBoundary} from '@app/components/channel/channel_view/PluginErrorBoundary';
import {PluginStateManager} from '@app/lib/plugins/PluginStateManager';
import {observer} from 'mobx-react-lite';
import React, {useEffect, useState} from 'react';

interface LazyPluginComponentProps {
	pluginId: string;
	loader: () => Promise<{default: React.ComponentType<{channelId: string}>}>;
	channelId: string;
	fallback?: React.ReactNode;
}

const LoadingFallback = ({pluginName}: {pluginName?: string}) => (
	<div
		style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: '100%',
			gap: '16px',
			color: 'rgba(255,255,255,0.6)',
		}}
	>
		<div
			style={{
				width: '40px',
				height: '40px',
				border: '3px solid rgba(255,255,255,0.1)',
				borderTopColor: 'var(--brand-experiment, #5865f2)',
				borderRadius: '50%',
				animation: 'lazyPluginSpin 0.7s linear infinite',
			}}
		/>
		<style>{`@keyframes lazyPluginSpin { to { transform: rotate(360deg); } }`}</style>
		<span style={{fontSize: '14px', fontWeight: 500}}>
			{pluginName ? `Loading ${pluginName}…` : 'Loading…'}
		</span>
	</div>
);

const DisabledFallback = ({pluginName}: {pluginName: string}) => (
	<div
		style={{
			padding: '20px',
			margin: '16px',
			background: 'rgba(255, 255, 255, 0.05)',
			borderRadius: '12px',
			color: 'rgba(255, 255, 255, 0.6)',
			textAlign: 'center',
			fontSize: '14px',
		}}
	>
        🔌 {pluginName} is disabled
	</div>
);

export const LazyPluginComponent = observer(
	({pluginId, loader, channelId, fallback}: LazyPluginComponentProps) => {
		const [Component, setComponent] = useState<React.ComponentType<{channelId: string}> | null>(null);
		const [loadError, setLoadError] = useState<string | null>(null);

		const isEnabled = PluginStateManager.isPluginEnabled(pluginId);

		useEffect(() => {
			if (!isEnabled) {
				return;
			}

			let mounted = true;

			const loadComponent = async () => {
				try {
					const module = await loader();
					if (mounted) {
						setComponent(() => module.default);
						PluginStateManager.markPluginLoaded(pluginId);
					}
				} catch (error) {
					console.error(`[LazyPluginComponent] Failed to load ${pluginId}:`, error);
					if (mounted) {
						setLoadError(error instanceof Error ? error.message : 'Failed to load plugin');
						PluginStateManager.recordPluginError(
							pluginId,
							error instanceof Error ? error.message : 'Failed to load plugin',
						);
					}
				}
			};

			void loadComponent();

			return () => {
				mounted = false;
			};
		}, [pluginId, loader, isEnabled]);

		if (!isEnabled) {
			return <DisabledFallback pluginName={pluginId} />;
		}

		if (loadError) {
			return (
				<div
					style={{
						padding: '20px',
						margin: '16px',
						background: 'rgba(255, 107, 107, 0.2)',
						borderRadius: '12px',
						color: '#ff6b6b',
						textAlign: 'center',
					}}
				>
					<p style={{margin: '0 0 8px 0', fontWeight: 600}}>{pluginId} failed to load</p>
					<p style={{margin: 0, fontSize: '13px', opacity: 0.8}}>{loadError}</p>
				</div>
			);
		}

		if (!Component) {
			return fallback ? <>{fallback}</> : <LoadingFallback pluginName={pluginId} />;
		}

		return (
			<PluginErrorBoundary
				pluginName={pluginId}
				onError={(error) => {
					PluginStateManager.recordPluginError(pluginId, error.message);
				}}
			>
				<Component channelId={channelId} />
			</PluginErrorBoundary>
		);
	},
);
