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

import '@app/components/modals/SudoVerificationModal';
import 'highlight.js/styles/github-dark.css';
import 'katex/dist/katex.min.css';
import styles from '@app/App.module.css';
import * as ModalActionCreators from '@app/actions/ModalActionCreators';
import * as WindowActionCreators from '@app/actions/WindowActionCreators';
import Config from '@app/Config';
import {DndContext} from '@app/components/layout/DndContext';
import GlobalOverlays from '@app/components/layout/GlobalOverlays';
import {NativeTitlebar} from '@app/components/layout/NativeTitlebar';
import {NativeTrafficLightsBackdrop} from '@app/components/layout/NativeTrafficLightsBackdrop';
import {UserSettingsModal} from '@app/components/modals/UserSettingsModal';
import {QUICK_SWITCHER_PORTAL_ID} from '@app/components/quick_switcher/QuickSwitcherConstants';
import FocusRingScope from '@app/components/uikit/focus_ring/FocusRingScope';
import {SVGMasks} from '@app/components/uikit/SVGMasks';
import {IncomingCallManager} from '@app/components/voice/IncomingCallManager';
import {type LayoutVariant, LayoutVariantProvider} from '@app/contexts/LayoutVariantContext';
import {showMyselfTypingHelper} from '@app/devtools/ShowMyselfTypingHelper';
import {useActivityRecorder} from '@app/hooks/useActivityRecorder';
import {useElectronScreenSharePicker} from '@app/hooks/useElectronScreenSharePicker';
import {useNativePlatform} from '@app/hooks/useNativePlatform';
import {useTextInputContextMenu} from '@app/hooks/useTextInputContextMenu';
import CaptchaInterceptorStore from '@app/lib/CaptchaInterceptor';
import FocusManager from '@app/lib/FocusManager';
import KeybindManager from '@app/lib/KeybindManager';
import {Logger} from '@app/lib/Logger';
import {startReadStateCleanup} from '@app/lib/ReadStateCleanup';
import {PluginComponentRegistry} from '@app/lib/plugins/PluginComponentRegistry';
import {clientPluginManager} from '@app/lib/plugins/PluginManager';
import {initializeBuiltInChannelTypes} from '@app/lib/plugins/ChannelTypeInitializer';
import {Outlet, RouterProvider} from '@app/lib/router/React';
import {router} from '@app/Router';
import RuntimeConfigStore from '@app/stores/RuntimeConfigStore';
import AccessibilityStore, {HdrDisplayMode} from '@app/stores/AccessibilityStore';
import ModalStore from '@app/stores/ModalStore';
import PopoutStore from '@app/stores/PopoutStore';
import ReadStateStore from '@app/stores/ReadStateStore';
import RuntimeCrashStore from '@app/stores/RuntimeCrashStore';
import ThemeStore from '@app/stores/ThemeStore';
import UserStore from '@app/stores/UserStore';
import MediaEngineStore from '@app/stores/voice/MediaEngineFacade';
import {ensureAutostartDefaultEnabled} from '@app/utils/AutostartUtils';
import {startDeepLinkHandling} from '@app/utils/DeepLinkUtils';
import {attachExternalLinkInterceptor, getElectronAPI, getNativePlatform} from '@app/utils/NativeUtils';
import {i18n} from '@lingui/core';
import {I18nProvider} from '@lingui/react';
import {RoomAudioRenderer, RoomContext} from '@livekit/components-react';
import {IconContext} from '@phosphor-icons/react';
import * as Sentry from '@sentry/react';
import {observer} from 'mobx-react-lite';
import React, {type ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';

const logger = new Logger('App');

interface AppWrapperProps {
	children: ReactNode;
}

export const AppWrapper = observer(({children}: AppWrapperProps) => {
	const saturationFactor = AccessibilityStore.saturationFactor;
	const alwaysUnderlineLinks = AccessibilityStore.alwaysUnderlineLinks;
	const enableTextSelection = AccessibilityStore.textSelectionEnabled;
	const fontSize = AccessibilityStore.fontSize;
	const messageGutter = AccessibilityStore.messageGutter;
	const messageGroupSpacing = AccessibilityStore.messageGroupSpacingValue;
	const reducedMotion = AccessibilityStore.useReducedMotion;
	const hdrDisplayMode = AccessibilityStore.hdrDisplayMode;
	const {platform, isNative, isMacOS} = useNativePlatform();
	useElectronScreenSharePicker();
	const customThemeCss = AccessibilityStore.customThemeCss;
	const effectiveTheme = ThemeStore.effectiveTheme;
	const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>('app');
	const layoutVariantContextValue = useMemo(
		() => ({variant: layoutVariant, setVariant: setLayoutVariant}),
		[layoutVariant],
	);

	const popouts = PopoutStore.getPopouts();
	const topPopout = popouts.length ? popouts[popouts.length - 1] : null;
	const topPopoutRequiresBackdrop = Boolean(topPopout && !topPopout.disableBackdrop);

	const room = MediaEngineStore.room;
	const ringsContainerRef = useRef<HTMLDivElement>(null);
	const overlayScopeRef = useRef<HTMLDivElement>(null);

	const recordActivity = useActivityRecorder();
	const handleUserActivity = useCallback(() => recordActivity(), [recordActivity]);
	const handleImmediateActivity = useCallback(() => recordActivity(true), [recordActivity]);
	const handleResize = useCallback(() => WindowActionCreators.resized(), []);
	useTextInputContextMenu();

	const hasBlockingModal = ModalStore.hasModalOpen();

	useEffect(() => {
		const node = ringsContainerRef.current;
		if (!node) return;

		const shouldBlockBackground = hasBlockingModal || topPopoutRequiresBackdrop;

		node.toggleAttribute('inert', shouldBlockBackground);

		return () => {
			node.removeAttribute('inert');
		};
	}, [hasBlockingModal, topPopoutRequiresBackdrop]);

	useEffect(() => {
		showMyselfTypingHelper.start();
		return () => showMyselfTypingHelper.stop();
	}, []);

	useEffect(() => {
		startReadStateCleanup();
	}, []);

	useEffect(() => {
		// Initialize client plugin system
		clientPluginManager.initialize().catch((error) => {
			logger.error('Failed to initialize client plugin system', error);
		});

		// Initialize built-in channel types
		initializeBuiltInChannelTypes();

		// Manually register plugin components (browser environment workaround)
		// Copy component code directly since imports from /plugins won't work in browser
		const registerPluginComponents = () => {
			try {
				// Simple channel type registry in browser (inline to avoid import issues)
				const channelTypes = new Map();
				const messageTypes = new Map();
				
				// Register Bluesky channel type
				channelTypes.set('bluesky-feed', {
					id: 'bluesky-feed',
					name: 'Bluesky Feed',
					icon: '🦋',
					category: 'feed',
					supportsMessages: true,
					supportsVoice: false,
					botAccessible: true,
					userAccessible: true,
				});
				
				// Register SSR rendering channel type
				channelTypes.set('ssr-render', {
					id: 'ssr-render',
					name: 'SSR Render',
					icon: '🎨',
					category: 'ssr',
					supportsMessages: true,
					supportsVoice: false,
					botAccessible: true,
					userAccessible: true,
				});
				
				// Register Discord channel types
				channelTypes.set('discord-text', {
					id: 'discord-text',
					name: 'Text Channel',
					icon: '#',
					category: 'text',
					supportsMessages: true,
					supportsVoice: false,
					botAccessible: true,
					userAccessible: true,
				});
				
				channelTypes.set('discord-voice', {
					id: 'discord-voice',
					name: 'Voice Channel',
					icon: '🔊',
					category: 'voice',
					supportsMessages: false,
					supportsVoice: true,
					botAccessible: true,
					userAccessible: true,
				});
				
				// Register custom message types
				messageTypes.set('poll', {
					id: 'poll',
					name: 'Poll',
					icon: '📊',
					userAccessible: true,
					botAccessible: true,
				});
				
				messageTypes.set('embed', {
					id: 'embed',
					name: 'Embed',
					icon: '🔗',
					userAccessible: true,
					botAccessible: true,
				});
				
				messageTypes.set('code', {
					id: 'code',
					name: 'Code',
					icon: '💻',
					userAccessible: true,
					botAccessible: true,
				});
				
				// Make registries globally accessible for debugging
				(window as any).channelTypes = channelTypes;
				(window as any).messageTypes = messageTypes;
				
				console.log('[ChannelTypes] Registered channel types:', Array.from(channelTypes.values()));
				console.log('[ChannelTypes] Registered message types:', Array.from(messageTypes.values()));
				
				// Debug: Channel Types Display Component
				const ChannelTypesDebugComponent = (React: unknown) => {
					const R = React as {createElement: (...args: Array<unknown>) => unknown; useState: <T>(initial: T) => [T, (val: T) => void]};
					
					return function ChannelTypesDebug(_props: Record<string, unknown>) {
						const [isOpen, setIsOpen] = R.useState(false);
						
						return R.createElement('div', null,
							R.createElement('button', {
								onClick: () => setIsOpen(!isOpen),
								style: {
									padding: '8px 12px',
									background: 'var(--brand-experiment)',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									fontSize: '14px',
									fontWeight: 600,
									cursor: 'pointer',
									marginRight: '8px',
								}
							}, 'Channel Types'),
							isOpen && R.createElement('div', {
								style: {
									position: 'absolute',
									top: '100%',
									right: '0',
									marginTop: '8px',
									padding: '16px',
									background: 'var(--background-primary)',
									border: '1px solid var(--background-modifier-accent)',
									borderRadius: '8px',
									boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
									zIndex: 1000,
									minWidth: '300px',
									maxHeight: '400px',
									overflowY: 'auto',
								}
							},
								R.createElement('h4', {style: {fontSize: '16px', fontWeight: 700, color: 'var(--text-normal)', marginBottom: '12px'}}, 'Registered Channel Types'),
								...Array.from(channelTypes.values()).map((ct: Record<string, unknown>) =>
									R.createElement('div', {
										key: ct.id as string,
										style: {
											padding: '8px',
											background: 'var(--background-secondary)',
											borderRadius: '4px',
											marginBottom: '8px',
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
										}
									},
										R.createElement('span', {style: {fontSize: '20px'}}, ct.icon),
										R.createElement('div', null,
											R.createElement('div', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)'}}, ct.name),
											R.createElement('div', {style: {fontSize: '12px', color: 'var(--text-muted)'}}, `${ct.category} - ${ct.supportsMessages ? 'messages' : ''} ${ct.supportsVoice ? 'voice' : ''}`)
										)
									)
								),
								R.createElement('h4', {style: {fontSize: '16px', fontWeight: 700, color: 'var(--text-normal)', marginBottom: '12px', marginTop: '16px'}}, 'Registered Message Types'),
								...Array.from(messageTypes.values()).map((mt: Record<string, unknown>) =>
									R.createElement('div', {
										key: mt.id as string,
										style: {
											padding: '8px',
											background: 'var(--background-secondary)',
											borderRadius: '4px',
											marginBottom: '8px',
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
										}
									},
										R.createElement('span', {style: {fontSize: '20px'}}, mt.icon),
										R.createElement('div', null,
											R.createElement('div', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)'}}, mt.name),
											R.createElement('div', {style: {fontSize: '12px', color: 'var(--text-muted)'}}, `${mt.userAccessible ? 'users' : ''} ${mt.botAccessible ? 'bots' : ''}`)
										)
									)
								)
							)
						);
					};
				};
				
				PluginComponentRegistry.registerComponent('channel-types-debug', {
					id: 'channel-types-debug',
					name: 'Channel Types Debug',
					pluginId: 'channel-types',
					component: ChannelTypesDebugComponent,
					location: 'channel_header',
					priority: 1000,
				});
				// Emoji Picker Component
				const EmojiPickerComponent = (React: unknown) => {
					const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
					
					return function EmojiPickerButton(_props: Record<string, unknown>) {
						const [isOpen, setIsOpen] = R.useState(false);
						const [emojiList] = R.useState<Array<{id: string; name: string; char: string}>>([
							{id: 'smile', name: 'Smile', char: '😀'},
							{id: 'laugh', name: 'Laugh', char: '😂'},
							{id: 'love', name: 'Love', char: '😍'},
							{id: 'heart', name: 'Heart', char: '❤️'},
							{id: 'fire', name: 'Fire', char: '🔥'},
							{id: 'thumbs_up', name: 'Thumbs Up', char: '👍'},
							{id: 'thumbs_down', name: 'Thumbs Down', char: '👎'},
							{id: 'party', name: 'Party', char: '🥳'},
							{id: 'cool', name: 'Cool', char: '😎'},
							{id: 'thinking', name: 'Thinking', char: '🤔'},
							{id: 'sleepy', name: 'Sleepy', char: '😴'},
							{id: 'scared', name: 'Scared', char: '😱'},
							{id: 'sparkles', name: 'Sparkles', char: '✨'},
							{id: 'broken_heart', name: 'Broken Heart', char: '💔'},
							{id: 'wave', name: 'Wave', char: '👋'},
							{id: 'clap', name: 'Clap', char: '👏'},
						]);

						const selectEmoji = (emoji: {id: string; name: string; char: string}) => {
							const event = new CustomEvent('plugin-emoji-selected', {detail: {emoji: emoji.char, id: emoji.id}});
							window.dispatchEvent(event);
							console.log('Selected emoji:', emoji.char, '(', emoji.id, ')');
							setIsOpen(false);
						};

						return R.createElement('div', {style: {position: 'relative', display: 'inline-block'}},
							R.createElement('button', {
								onClick: () => setIsOpen(!isOpen),
								style: {
									padding: '10px 14px',
									borderRadius: '8px',
									border: '1px solid transparent',
									background: isOpen ? 'var(--background-modifier-selected)' : 'transparent',
									cursor: 'pointer',
									fontSize: '22px',
									color: 'var(--text-normal)',
									transition: 'all 0.15s ease',
								},
								title: 'Open Emoji Picker',
							}, '😀'),
							isOpen && R.createElement('div', {
								style: {
									position: 'absolute',
									top: '100%',
									left: '0',
									marginTop: '8px',
									padding: '12px',
									background: 'var(--background-primary)',
									border: '1px solid var(--background-modifier-accent)',
									borderRadius: '8px',
									boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
									zIndex: 1000,
									minWidth: '300px',
									maxHeight: '400px',
									overflowY: 'auto',
								},
							},
								R.createElement('div', {style: {fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}, 'Emoji Picker'),
								R.createElement('div', {style: {display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px'}},
									...emojiList.map(emoji =>
										R.createElement('button', {
											key: emoji.id,
											onClick: () => selectEmoji(emoji),
											style: {
												padding: '8px',
												fontSize: '24px',
												background: 'transparent',
												border: 'none',
												borderRadius: '4px',
												cursor: 'pointer',
												transition: 'background 0.15s',
											},
											onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
												e.target.style.background = 'var(--background-modifier-hover)';
											},
											onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
												e.target.style.background = 'transparent';
											},
											title: emoji.name,
										}, emoji.char)
									)
								)
							)
						);
					};
				};

				// Soundboard Component
				const SoundboardComponent = (React: unknown) => {
					const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown};
					
					return function SoundboardButton(_props: Record<string, unknown>) {
						const [isOpen, setIsOpen] = R.useState(false);
						const [isPlaying, setIsPlaying] = R.useState<string | null>(null);
						const [soundList] = R.useState<Array<{id: string; name: string; emoji: string; volume: number}>>([
							{id: 'clap', name: 'Clap', emoji: '👏', volume: 100},
							{id: 'celebration', name: 'Celebration', emoji: '🎉', volume: 100},
							{id: 'laugh', name: 'Laugh', emoji: '😂', volume: 100},
							{id: 'scream', name: 'Scream', emoji: '😱', volume: 100},
							{id: 'ding', name: 'Ding', emoji: '🔔', volume: 100},
							{id: 'announce', name: 'Announce', emoji: '📢', volume: 100},
							{id: 'music', name: 'Music', emoji: '🎵', volume: 100},
							{id: 'airhorn', name: 'Airhorn', emoji: '📯', volume: 100},
						]);

						const playSound = (sound: {id: string; name: string; emoji: string; volume: number}) => {
							setIsPlaying(sound.id);
							const event = new CustomEvent('plugin-sound-play', {detail: {soundId: sound.id, name: sound.name, volume: sound.volume}});
							window.dispatchEvent(event);
							console.log('Playing sound:', sound.name, '(', sound.id, ')');
							setTimeout(() => setIsPlaying(null), 1000);
						};

						return R.createElement('div', {style: {position: 'relative', display: 'inline-block'}},
							R.createElement('button', {
								onClick: () => setIsOpen(!isOpen),
								style: {
									padding: '10px 14px',
									borderRadius: '8px',
									border: '1px solid transparent',
									background: isOpen ? 'var(--background-modifier-selected)' : 'transparent',
									cursor: 'pointer',
									fontSize: '22px',
									color: 'var(--text-normal)',
									transition: 'all 0.15s ease',
								},
								title: 'Open Soundboard',
							}, '🔊'),
							isOpen && R.createElement('div', {
								style: {
									position: 'absolute',
									top: '100%',
									right: '0',
									marginTop: '8px',
									padding: '12px',
									background: 'var(--background-primary)',
									border: '1px solid var(--background-modifier-accent)',
									borderRadius: '8px',
									boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
									zIndex: 1000,
									minWidth: '280px',
								},
							},
								R.createElement('div', {style: {fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}, 'Soundboard'),
								R.createElement('div', {style: {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'}},
									...soundList.map(sound =>
										R.createElement('button', {
											key: sound.id,
											onClick: () => playSound(sound),
											disabled: isPlaying !== null,
											style: {
												padding: '12px',
												background: isPlaying === sound.id ? 'var(--background-modifier-selected)' : 'transparent',
												border: '1px solid var(--background-modifier-accent)',
												borderRadius: '6px',
												cursor: isPlaying !== null ? 'not-allowed' : 'pointer',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: '4px',
												transition: 'all 0.15s',
											},
										},
											R.createElement('span', {style: {fontSize: '28px'}}, sound.emoji),
											R.createElement('span', {style: {fontSize: '12px', color: 'var(--text-muted)'}}, sound.name)
										)
									)
								)
							)
						);
					};
				};


				// Avatar Decorations Component
				const AvatarDecorationsComponent = (React: unknown) => {
					const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
					
					return function AvatarDecorationsButton(_props: Record<string, unknown>) {
						const [isOpen, setIsOpen] = R.useState(false);
						const [selectedDecoration, setSelectedDecoration] = R.useState<string | null>(null);
						const [decorations] = R.useState<Array<{id: string; name: string; emoji: string; price: number; description: string}>>([
							{id: 'a1', name: 'Halo', emoji: '😇', price: 500, description: 'A glowing halo'},
							{id: 'a2', name: 'Crown', emoji: '👑', price: 1000, description: 'Royal crown'},
							{id: 'a3', name: 'Sparkles', emoji: '✨', price: 250, description: 'Sparkling effect'},
							{id: 'a4', name: 'Fire', emoji: '🔥', price: 750, description: 'Burning aura'},
							{id: 'a5', name: 'Ice', emoji: '❄️', price: 750, description: 'Frozen aura'},
							{id: 'a6', name: 'Star', emoji: '⭐', price: 400, description: 'Shining star'},
							{id: 'a7', name: 'Rainbow', emoji: '🌈', price: 600, description: 'Rainbow ring'},
							{id: 'a8', name: 'Diamond', emoji: '💎', price: 2000, description: 'Diamond shine'},
						]);

						const selectDecoration = (decoration: {id: string; name: string; emoji: string; price: number; description: string}) => {
							setSelectedDecoration(decoration.id);
							const event = new CustomEvent('plugin-avatar-decoration-selected', {detail: {decorationId: decoration.id, name: decoration.name}});
							window.dispatchEvent(event);
							console.log('Selected decoration:', decoration.name, '(', decoration.id, ')');
							setIsOpen(false);
						};

						return R.createElement('div', {style: {position: 'relative', display: 'inline-block'}},
							R.createElement('button', {
								onClick: () => setIsOpen(!isOpen),
								style: {
									padding: '10px 14px',
									borderRadius: '8px',
									border: '1px solid transparent',
									background: isOpen ? 'var(--background-modifier-selected)' : 'transparent',
									cursor: 'pointer',
									fontSize: '22px',
									color: 'var(--text-normal)',
									transition: 'all 0.15s ease',
								},
								title: 'Avatar Decorations Shop',
							}, selectedDecoration ? '🎨' : '🏪'),
							isOpen && R.createElement('div', {
								style: {
									position: 'absolute',
									top: '100%',
									right: '0',
									marginTop: '8px',
									padding: '16px',
									background: 'var(--background-primary)',
									border: '1px solid var(--background-modifier-accent)',
									borderRadius: '12px',
									boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
									zIndex: 1000,
									minWidth: '340px',
									maxHeight: '500px',
									overflowY: 'auto',
								},
							},
								R.createElement('div', {style: {fontSize: '16px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}},
									'Avatar Decorations Shop',
									R.createElement('span', {style: {fontSize: '12px', color: 'var(--text-muted)'}}, 'Quick Launch')
								),
								R.createElement('div', {style: {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}},
									...decorations.map(decoration =>
										R.createElement('button', {
											key: decoration.id,
											onClick: () => selectDecoration(decoration),
											style: {
												padding: '12px',
												background: selectedDecoration === decoration.id ? 'var(--background-modifier-selected)' : 'var(--background-secondary)',
												border: selectedDecoration === decoration.id ? '2px solid var(--brand-experiment)' : '1px solid var(--background-modifier-accent)',
												borderRadius: '8px',
												cursor: 'pointer',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												gap: '6px',
												transition: 'all 0.15s',
											},
											onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
												e.target.style.background = 'var(--background-modifier-hover)';
											},
											onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
												e.target.style.background = selectedDecoration === decoration.id ? 'var(--background-modifier-selected)' : 'var(--background-secondary)';
											},
										},
											R.createElement('span', {style: {fontSize: '32px'}}, decoration.emoji),
											R.createElement('span', {style: {fontSize: '13px', fontWeight: 500, color: 'var(--text-normal)'}}, decoration.name),
											R.createElement('span', {style: {fontSize: '11px', color: 'var(--text-muted)'}}, decoration.price + ' coins'),
											R.createElement('span', {style: {fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center'}}, decoration.description)
										)
									)
								)
							)
						);
					};
				};

				// Bluesky Full Page Component (Fluxer PDS Integration)
				const BlueskyTimelineComponent = (React: unknown) => {
					const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; useEffect: (effect: () => void, deps?: Array<unknown>) => void; createElement: (...args: Array<unknown>) => unknown};
					
					return function BlueskyFullPage(_props: Record<string, unknown>) {
						const [isOpen, setIsOpen] = R.useState(false);
						const [isAuthenticating, setIsAuthenticating] = R.useState(false);
						const [authError, setAuthError] = R.useState('');
						const [handle, setHandle] = R.useState('');
						const [password, setPassword] = R.useState('');
						const [isLoginMode, setIsLoginMode] = R.useState(true);
						const [isLoggedIn, setIsLoggedIn] = R.useState(false);
						const [currentDid, setCurrentDid] = R.useState('');
						const [profile, setProfile] = R.useState<Record<string, unknown> | null>(null);
						const [newPost, setNewPost] = R.useState('');
						const [timeline, setTimeline] = R.useState<Array<Record<string, unknown>>>([]);
						const [followInput, setFollowInput] = R.useState('');
						const [follows, setFollows] = R.useState<Array<Record<string, unknown>>>([]);
						const [externalPDS, setExternalPDS] = R.useState('https://bsky.social');
						const [externalHandle, setExternalHandle] = R.useState('');
						const [externalPassword, setExternalPassword] = R.useState('');
						const [useExternalPDS, setUseExternalPDS] = R.useState(false);

						// Check if already logged in on mount
						R.useEffect(() => {
							const did = localStorage.getItem('atproto_did');
							const jwt = localStorage.getItem('atproto_access_jwt');
							if (did && jwt) {
								setIsLoggedIn(true);
								setCurrentDid(did);
								// Fetch profile
								fetchProfile(did, jwt);
								// Fetch timeline
								fetchTimeline(jwt);
								// Fetch follows
								fetchFollows(did, jwt);
							}
						}, []);

						const fetchProfile = async (did: string, jwt: string) => {
							try {
								const apiEndpoint = RuntimeConfigStore.apiEndpoint;
								const response = await fetch(`${apiEndpoint}/xrpc/com.atproto.repo.getRecord?repo=${did}&collection=app.bsky.actor.profile&rkey=self`, {
									headers: {'Authorization': `Bearer ${jwt}`},
								});
								const data = await response.json();
								if (response.ok && data.value) {
									setProfile(data.value);
								}
							} catch {
								// Profile fetch failed, continue anyway
							}
						};

						const fetchTimeline = async (jwt: string) => {
							try {
								let apiEndpoint;
								
								if (useExternalPDS && externalHandle && externalPassword) {
									// Use external PDS (like Bluesky)
									apiEndpoint = externalPDS;
									
									// First, authenticate with external PDS
									const loginResponse = await fetch(`${apiEndpoint}/xrpc/com.atproto.server.createSession`, {
										method: 'POST',
										headers: {'Content-Type': 'application/json'},
										body: JSON.stringify({
											identifier: externalHandle,
											password: externalPassword,
										}),
									});
									
									if (loginResponse.ok) {
										const loginData = await loginResponse.json();
										jwt = loginData.accessJwt;
									}
								} else {
									// Use local Fluxer PDS
									apiEndpoint = RuntimeConfigStore.apiEndpoint;
								}
								
								const response = await fetch(`${apiEndpoint}/xrpc/app.bsky.feed.getTimeline?limit=50`, {
									headers: {'Authorization': `Bearer ${jwt}`},
								});
								const data = await response.json();
								if (response.ok && data.feed) {
									setTimeline(data.feed);
								}
							} catch {
								// Timeline fetch failed, continue anyway
							}
						};

						const fetchFollows = async (did: string, jwt: string) => {
							try {
								const apiEndpoint = RuntimeConfigStore.apiEndpoint;
								const response = await fetch(`${apiEndpoint}/xrpc/app.bsky.graph.getFollows?actor=${did}`, {
									headers: {'Authorization': `Bearer ${jwt}`},
								});
								const data = await response.json();
								if (response.ok && data.follows) {
									setFollows(data.follows);
								}
							} catch {
								// Follows fetch failed, continue anyway
							}
						};

						const handleCreatePost = async () => {
							if (!newPost.trim()) return;
							
							const jwt = localStorage.getItem('atproto_access_jwt');
							if (!jwt) return;
							
							try {
								const apiEndpoint = RuntimeConfigStore.apiEndpoint;
								const response = await fetch(`${apiEndpoint}/xrpc/com.atproto.repo.createRecord`, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${jwt}`,
									},
									body: JSON.stringify({
										repo: currentDid,
										collection: 'app.bsky.feed.post',
										record: {
											'$type': 'app.bsky.feed.post',
											text: newPost,
											createdAt: new Date().toISOString(),
										},
									}),
								});
								
								if (response.ok) {
									setNewPost('');
									// Refresh timeline
									fetchTimeline(jwt);
								}
							} catch {
								// Post creation failed
							}
						};

						const handleFollow = async () => {
							if (!followInput.trim()) return;
							
							const jwt = localStorage.getItem('atproto_access_jwt');
							if (!jwt) return;
							
							try {
								const apiEndpoint = RuntimeConfigStore.apiEndpoint;
								// Resolve handle to DID
								const resolveResponse = await fetch(`${apiEndpoint}/xrpc/com.atproto.identity.resolveHandle?handle=${followInput}`);
								const resolveData = await resolveResponse.json();
								
								if (!resolveResponse.ok || !resolveData.did) {
									return;
								}
								
								const targetDid = resolveData.did;
								
								// Create follow record
								const response = await fetch(`${apiEndpoint}/xrpc/com.atproto.repo.createRecord`, {
									method: 'POST',
									headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${jwt}`,
									},
									body: JSON.stringify({
										repo: currentDid,
										collection: 'app.bsky.graph.follow',
										record: {
											'$type': 'app.bsky.graph.follow',
											subject: targetDid,
											createdAt: new Date().toISOString(),
										},
									}),
								});
								
								if (response.ok) {
									setFollowInput('');
									// Refresh follows
									fetchFollows(currentDid, jwt);
								}
							} catch {
								// Follow failed
							}
						};

						const handleSignUp = async () => {
							if (!handle || !password) {
								setAuthError('Handle and password are required');
								return;
							}
							
							setIsAuthenticating(true);
							setAuthError('');
							
							try {
								// Use the API endpoint from runtime config
								const apiEndpoint = RuntimeConfigStore.apiEndpoint;
								
								// Get email from Fluxer user if available, otherwise use handle@fluxer.local
								let email = `${handle}@fluxer.local`;
								const fluxerUser = UserStore.getCurrentUser();
								if (fluxerUser?.email) {
									email = fluxerUser.email;
								}
								
								const response = await fetch(`${apiEndpoint}/xrpc/com.atproto.server.createAccount`, {
									method: 'POST',
									headers: {'Content-Type': 'application/json'},
									body: JSON.stringify({email, password, handle}),
								});
								
								const data = await response.json();
								
								if (!response.ok) {
									throw new Error(data.error || data.message || 'Sign up failed');
								}
								
								// Store the DID
								localStorage.setItem('atproto_did', data.did);
								
								setIsLoggedIn(true);
								setCurrentDid(data.did);
								setIsOpen(false);
								console.log('Signed up via Fluxer PDS:', {did: data.did, handle: data.handle});
							} catch (error) {
								setAuthError(error instanceof Error ? error.message : 'Failed to sign up');
							} finally {
								setIsAuthenticating(false);
							}
						};

						const handleLogin = async () => {
							if (!handle || !password) {
								setAuthError('Handle and password are required');
								return;
							}
							
							setIsAuthenticating(true);
							setAuthError('');
							
							try {
								// Use the API endpoint from runtime config
								const apiEndpoint = RuntimeConfigStore.apiEndpoint;
								
								// Use the handle as identifier (can be email or username)
								const identifier = handle;
								
								const response = await fetch(`${apiEndpoint}/xrpc/com.atproto.server.createSession`, {
									method: 'POST',
									headers: {'Content-Type': 'application/json'},
									body: JSON.stringify({identifier, password}),
								});
								
								const data = await response.json();
								
								if (!response.ok) {
									throw new Error(data.error || data.message || 'Login failed');
								}
								
								// Store the JWT token for subsequent requests
								localStorage.setItem('atproto_access_jwt', data.accessJwt);
								localStorage.setItem('atproto_did', data.did);
								
								setIsLoggedIn(true);
								setCurrentDid(data.did);
								setIsOpen(false);
								console.log('Logged in via Fluxer PDS:', {did: data.did, handle: data.handle});
							} catch (error) {
								setAuthError(error instanceof Error ? error.message : 'Failed to login');
							} finally {
								setIsAuthenticating(false);
							}
						};

						const handleLogout = () => {
							localStorage.removeItem('atproto_access_jwt');
							localStorage.removeItem('atproto_did');
							setIsLoggedIn(false);
							setCurrentDid('');
						};

						if (isOpen) {
							return R.createElement('div', {
								style: {
									position: 'fixed',
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									background: 'rgba(0, 0, 0, 0.5)',
									zIndex: 10000,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								},
								onClick: () => setIsOpen(false)
							},
								R.createElement('div', {
									style: {
										width: '90%',
										maxWidth: '500px',
										background: 'var(--background-primary)',
										borderRadius: '12px',
										boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)',
										display: 'flex',
										flexDirection: 'column',
										overflow: 'hidden',
									},
									onClick: (e: {stopPropagation: () => void}) => e.stopPropagation()
								},
									R.createElement('div', {
										style: {
											padding: '16px 20px',
											borderBottom: '1px solid var(--background-modifier-accent)',
											display: 'flex',
											justifyContent: 'space-between',
											alignItems: 'center',
											background: 'var(--background-tertiary)',
										}
									},
										R.createElement('div', {style: {display: 'flex', alignItems: 'center', gap: '12px'}},
											R.createElement('span', {style: {fontSize: '24px'}}, '🦋'),
											R.createElement('span', {style: {fontSize: '18px', fontWeight: 600, color: 'var(--text-normal)'}}, 'Fluxer PDS')
										),
										R.createElement('button', {
											onClick: () => setIsOpen(false),
											style: {
												background: 'transparent',
												border: 'none',
												fontSize: '24px',
												cursor: 'pointer',
												color: 'var(--text-muted)',
												padding: '4px',
											}
										}, '✕')
									),
									R.createElement('div', {style: {padding: '40px', textAlign: 'center'}},
										isLoggedIn ? (
											R.createElement('div', {style: {maxWidth: '600px', margin: '0 auto', textAlign: 'left'}},
												R.createElement('h2', {style: {fontSize: '20px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '8px', textAlign: 'center'}}, 'Fluxer PDS'),
												profile && R.createElement('div', {style: {marginBottom: '20px', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px', border: '1px solid var(--background-modifier-accent)'}},
													R.createElement('div', {style: {fontSize: '18px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '4px'}}, profile.displayName || profile.handle || 'User'),
													profile.description && R.createElement('div', {style: {fontSize: '14px', color: 'var(--text-muted)'}}, profile.description)
												),
												// Create post section
												R.createElement('div', {style: {marginBottom: '20px'}},
													R.createElement('textarea', {
														placeholder: 'What\'s on your mind?',
														value: newPost,
														onChange: (e: {target: {value: string}}) => setNewPost(e.target.value),
														style: {
															width: '100%',
															padding: '12px',
															background: 'var(--background-secondary)',
															border: '1px solid var(--background-modifier-accent)',
															borderRadius: '8px',
															color: 'var(--text-normal)',
															fontSize: '14px',
															minHeight: '80px',
															resize: 'vertical',
															marginBottom: '8px',
														}
													}),
													R.createElement('button', {
														onClick: handleCreatePost,
														disabled: !newPost.trim(),
														style: {
															padding: '8px 16px',
															background: !newPost.trim() ? 'var(--background-modifier-accent)' : 'var(--brand-experiment)',
															color: !newPost.trim() ? 'var(--text-muted)' : 'white',
															border: 'none',
															borderRadius: '8px',
															fontSize: '14px',
															fontWeight: 600,
															cursor: !newPost.trim() ? 'not-allowed' : 'pointer',
														}
													}, 'Post')
												),
												// Timeline section
												R.createElement('div', null,
													R.createElement('h3', {style: {fontSize: '20px', fontWeight: 700, color: 'var(--text-normal)', marginBottom: '16px'}}, 'Home'),
													timeline.length === 0 ? (
														R.createElement('div', {style: {padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px'}}, 
															R.createElement('div', null,
																R.createElement('div', {style: {fontSize: '24px', marginBottom: '12px'}}, '👋'),
																R.createElement('div', {style: {fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}, 'Welcome to your timeline'),
																R.createElement('div', null, 'No posts yet. Create your first post above!')
															)
														)
													) : (
														timeline.map((feedItem: Record<string, unknown>, index: number) => {
															const post = feedItem.post as Record<string, unknown>;
															const author = post.author as Record<string, unknown>;
															const record = post.record as Record<string, unknown>;
															return R.createElement('div', {
																key: index,
																style: {
																	padding: '16px',
																	borderBottom: '1px solid var(--background-modifier-accent)',
																	background: 'transparent',
																}
															},
																R.createElement('div', {style: {display: 'flex', gap: '12px', marginBottom: '12px'}},
																	R.createElement('div', {
																		style: {
																			width: '52px',
																			height: '52px',
																			borderRadius: '50%',
																			background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
																			display: 'flex',
																			alignItems: 'center',
																			justifyContent: 'center',
																			color: 'white',
																			fontSize: '20px',
																			fontWeight: 700,
																			flexShrink: 0,
																		}
																	}, String((author.handle as string)?.charAt(0) || 'U').toUpperCase()),
																	R.createElement('div', {style: {flex: 1, minWidth: 0}},
																		R.createElement('div', {style: {display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap'}},
																			R.createElement('span', {style: {fontSize: '15px', fontWeight: 700, color: 'var(--text-normal)'}}, String(author.displayName || author.handle || 'User')),
																			R.createElement('span', {style: {fontSize: '15px', color: 'var(--text-muted)'}}, '@' + String(author.handle || 'unknown')),
																			R.createElement('span', {style: {fontSize: '14px', color: 'var(--text-muted)'}}, '·'),
																			R.createElement('span', {style: {fontSize: '14px', color: 'var(--text-muted)'}}, new Date(String(post.indexedAt || Date.now())).toLocaleString())
																		),
																		R.createElement('div', {style: {fontSize: '15px', color: 'var(--text-normal)', lineHeight: '1.5', marginTop: '4px', wordBreak: 'break-word'}}, String(record.text || 'Post'))
																	)
																),
																R.createElement('div', {style: {display: 'flex', gap: '16px', marginLeft: '64px'}},
																	R.createElement('button', {
																		style: {
																			background: 'transparent',
																			border: 'none',
																			color: 'var(--text-muted)',
																			cursor: 'pointer',
																			fontSize: '14px',
																			padding: '4px 8px',
																			borderRadius: '4px',
																			fontWeight: 500,
																		}
																	}, 'Reply'),
																	R.createElement('button', {
																		style: {
																			background: 'transparent',
																			border: 'none',
																			color: 'var(--text-muted)',
																			cursor: 'pointer',
																			fontSize: '14px',
																			padding: '4px 8px',
																			borderRadius: '4px',
																			fontWeight: 500,
																		}
																	}, 'Repost'),
																	R.createElement('button', {
																		style: {
																			background: 'transparent',
																			border: 'none',
																			color: 'var(--text-muted)',
																			cursor: 'pointer',
																			fontSize: '14px',
																			padding: '4px 8px',
																			borderRadius: '4px',
																			fontWeight: 500,
																		}
																	}, 'Like')
																)
															);
														})
													)
												),
												// Follow section
												R.createElement('div', {style: {marginTop: '20px'}},
													R.createElement('h3', {style: {fontSize: '16px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '12px'}}, 'Follow Users'),
													R.createElement('div', {style: {display: 'flex', gap: '8px', marginBottom: '12px'}},
														R.createElement('input', {
															type: 'text',
															placeholder: 'Enter handle to follow...',
															value: followInput,
															onChange: (e: {target: {value: string}}) => setFollowInput(e.target.value),
															style: {
																flex: 1,
																padding: '8px 12px',
																background: 'var(--background-secondary)',
																border: '1px solid var(--background-modifier-accent)',
																borderRadius: '6px',
																color: 'var(--text-normal)',
																fontSize: '14px',
															}
														}),
														R.createElement('button', {
															onClick: handleFollow,
															disabled: !followInput.trim(),
															style: {
																padding: '8px 16px',
																background: !followInput.trim() ? 'var(--background-modifier-accent)' : 'var(--brand-experiment)',
																color: !followInput.trim() ? 'var(--text-muted)' : 'white',
																border: 'none',
																borderRadius: '6px',
																fontSize: '14px',
																fontWeight: 600,
																cursor: !followInput.trim() ? 'not-allowed' : 'pointer',
															}
														}, 'Follow')
													),
													follows.length > 0 && R.createElement('div', null,
														R.createElement('div', {style: {fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}, `Following ${follows.length} user${follows.length === 1 ? '' : 's'}`),
														follows.map((follow: Record<string, unknown>, index: number) =>
															R.createElement('div', {key: index, style: {padding: '8px', background: 'var(--background-secondary)', borderRadius: '6px', marginBottom: '4px', fontSize: '13px', color: 'var(--text-normal)'}},
																(follow as Record<string, unknown>)?.handle || (follow as Record<string, unknown>)?.did || 'Unknown'
															)
														)
													)
												),
												// PDS Settings section
												R.createElement('div', {style: {marginTop: '20px', padding: '16px', background: 'var(--background-secondary)', borderRadius: '8px'}},
													R.createElement('h3', {style: {fontSize: '16px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '12px'}}, 'PDS Settings'),
													R.createElement('div', {style: {display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}},
														R.createElement('input', {
															type: 'checkbox',
															checked: useExternalPDS,
															onChange: (e: {target: {checked: boolean}}) => {
																setUseExternalPDS(e.target.checked);
																// Refresh timeline when switching PDS
																const jwt = localStorage.getItem('atproto_access_jwt');
																if (jwt) fetchTimeline(jwt);
															},
															style: {cursor: 'pointer'},
														}),
														R.createElement('span', {style: {fontSize: '14px', color: 'var(--text-normal)'}}, 'Use external PDS (e.g., Bluesky)')
													),
													useExternalPDS && R.createElement('div', {style: {display: 'flex', flexDirection: 'column', gap: '8px'}},
														R.createElement('input', {
															type: 'text',
															placeholder: 'PDS URL (e.g., https://bsky.social)',
															value: externalPDS,
															onChange: (e: {target: {value: string}}) => setExternalPDS(e.target.value),
															style: {
																padding: '8px 12px',
																background: 'var(--background-tertiary)',
																border: '1px solid var(--background-modifier-accent)',
																borderRadius: '6px',
																color: 'var(--text-normal)',
																fontSize: '14px',
															}
														}),
														R.createElement('input', {
															type: 'text',
															placeholder: 'Handle (e.g., user.bsky.social)',
															value: externalHandle,
															onChange: (e: {target: {value: string}}) => setExternalHandle(e.target.value),
															style: {
																padding: '8px 12px',
																background: 'var(--background-tertiary)',
																border: '1px solid var(--background-modifier-accent)',
																borderRadius: '6px',
																color: 'var(--text-normal)',
																fontSize: '14px',
															}
														}),
														R.createElement('input', {
															type: 'password',
															placeholder: 'App Password',
															value: externalPassword,
															onChange: (e: {target: {value: string}}) => setExternalPassword(e.target.value),
															style: {
																padding: '8px 12px',
																background: 'var(--background-tertiary)',
																border: '1px solid var(--background-modifier-accent)',
																borderRadius: '6px',
																color: 'var(--text-normal)',
																fontSize: '14px',
															}
														}),
														R.createElement('button', {
															onClick: () => {
																const jwt = localStorage.getItem('atproto_access_jwt');
																if (jwt) fetchTimeline(jwt);
															},
															style: {
																padding: '8px 16px',
																background: 'var(--brand-experiment)',
																color: 'white',
																border: 'none',
																borderRadius: '6px',
																fontSize: '14px',
																fontWeight: 600,
																cursor: 'pointer',
																alignSelf: 'flex-start',
															}
														}, 'Refresh Timeline')
													)
												),
												// Account info section
												R.createElement('div', {style: {marginTop: '20px', padding: '16px', background: 'var(--background-tertiary)', borderRadius: '8px'}},
													R.createElement('p', {style: {fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px'}}, 'Your Decentralized Identifier (DID):'),
													R.createElement('div', {style: {wordBreak: 'break-all', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace'}}, currentDid),
													R.createElement('button', {
														onClick: handleLogout,
														style: {
															marginTop: '12px',
															padding: '8px 16px',
															background: 'var(--background-modifier-accent)',
															color: 'var(--text-normal)',
															border: '1px solid var(--background-modifier-accent)',
															borderRadius: '6px',
															fontSize: '12px',
															fontWeight: 600,
															cursor: 'pointer',
														}
													}, 'Logout')
												)
											)
										) : (
											R.createElement('div', null,
												R.createElement('h2', {style: {fontSize: '20px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '8px'}}, isLoginMode ? 'Login to Fluxer PDS' : 'Sign Up for Fluxer PDS'),
												R.createElement('p', {style: {fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px'}}, 'Fluxer server acts as your Personal Data Server (PDS)'),
												R.createElement('button', {
													onClick: () => setIsLoginMode(!isLoginMode),
													style: {
														background: 'transparent',
														border: 'none',
														color: 'var(--brand-experiment)',
														fontSize: '13px',
														cursor: 'pointer',
														marginBottom: '20px',
														textDecoration: 'underline',
													}
												}, isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Login"),
												R.createElement('div', {style: {display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto'}},
													R.createElement('input', {
														type: 'text',
														placeholder: 'Handle',
														value: handle,
														onChange: (e: {target: {value: string}}) => setHandle(e.target.value),
														style: {
															padding: '12px',
															background: 'var(--background-secondary)',
															border: '1px solid var(--background-modifier-accent)',
															borderRadius: '8px',
															color: 'var(--text-normal)',
															fontSize: '14px',
														}
													}),
													R.createElement('input', {
														type: 'password',
														placeholder: 'Password',
														value: password,
														onChange: (e: {target: {value: string}}) => setPassword(e.target.value),
														style: {
															padding: '12px',
															background: 'var(--background-secondary)',
															border: '1px solid var(--background-modifier-accent)',
															borderRadius: '8px',
															color: 'var(--text-normal)',
															fontSize: '14px',
														}
													}),
													authError && R.createElement('div', {style: {color: '#ff6b6b', fontSize: '13px'}}, authError),
													R.createElement('button', {
														onClick: isLoginMode ? handleLogin : handleSignUp,
														disabled: isAuthenticating || !handle || !password,
														style: {
															padding: '12px 24px',
															background: isAuthenticating || !handle || !password ? 'var(--background-modifier-accent)' : 'var(--brand-experiment)',
															color: isAuthenticating || !handle || !password ? 'var(--text-muted)' : 'white',
															border: 'none',
															borderRadius: '8px',
															fontSize: '14px',
															fontWeight: 600,
															cursor: isAuthenticating || !handle || !password ? 'not-allowed' : 'pointer',
														}
													}, isAuthenticating ? (isLoginMode ? 'Logging in...' : 'Signing up...') : (isLoginMode ? 'Login' : 'Sign Up'))
												)
											)
										)
									)
								)
							);
						}

						return R.createElement('button', {
							onClick: () => setIsOpen(true),
							style: {
								padding: '10px 14px',
								borderRadius: '8px',
								border: isLoggedIn ? '1px solid var(--brand-experiment)' : '1px solid transparent',
								background: isLoggedIn ? 'rgba(88, 101, 242, 0.1)' : 'transparent',
								cursor: 'pointer',
								fontSize: '22px',
								color: 'var(--text-normal)',
								transition: 'all 0.15s ease',
								position: 'relative',
							},
							title: isLoggedIn ? `Logged in to Fluxer PDS (${currentDid.slice(0, 8)}...)` : 'Fluxer PDS',
						}, isLoggedIn ? '🦋✓' : '🦋');
					};
				};

				// Register all components
				PluginComponentRegistry.registerComponent('discord-emojis', {
					id: 'discord-emojis-picker',
					name: 'Emoji Picker',
					pluginId: 'discord-emojis',
					component: EmojiPickerComponent,
					location: 'channel_header',
					priority: 100,
				});

				PluginComponentRegistry.registerComponent('discord-soundboard', {
					id: 'discord-soundboard-button',
					name: 'Soundboard',
					pluginId: 'discord-soundboard',
					component: SoundboardComponent,
					location: 'channel_header',
					priority: 90,
				});

				PluginComponentRegistry.registerComponent('avatar-decorations', {
					id: 'avatar-decorations-shop',
					name: 'Avatar Decorations',
					pluginId: 'avatar-decorations',
					component: AvatarDecorationsComponent,
					location: 'settings',
					priority: 95,
				});

				PluginComponentRegistry.registerComponent('bluesky', {
					id: 'bluesky-timeline',
					name: 'Bluesky Timeline',
					pluginId: 'bluesky',
					component: BlueskyTimelineComponent,
					location: 'channel_header',
					priority: 70,
				});

				logger.info('Plugin components registered successfully');
			} catch (error) {
				logger.warn('Failed to manually register plugin components:', error);
			}
		};

		registerPluginComponents();
	}, []);

	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		const postBadgeUpdate = (count: number) => {
			const controller = navigator.serviceWorker.controller;
			if (!controller) {
				return;
			}
			try {
				controller.postMessage({type: 'APP_UPDATE_BADGE', count});
			} catch (error) {
				logger.warn('Failed to post badge update to service worker', error);
			}
		};

		const updateBadgeFromReadState = () => {
			const channelIds = ReadStateStore.getChannelIds();
			const totalMentions = channelIds.reduce((sum, channelId) => sum + ReadStateStore.getMentionCount(channelId), 0);
			postBadgeUpdate(totalMentions);
		};

		const unsubscribe = ReadStateStore.subscribe(() => {
			updateBadgeFromReadState();
		});

		return () => {
			unsubscribe();
		};
	}, []);

	useEffect(() => {
		void KeybindManager.init(i18n);
		void CaptchaInterceptorStore;
		return () => {
			KeybindManager.destroy();
		};
	}, []);

	useEffect(() => {
		void AccessibilityStore.applyStoredZoom();

		const electronApi = getElectronAPI();
		if (!electronApi) return;

		const unsubZoomIn = electronApi.onZoomIn?.(() => void AccessibilityStore.adjustZoom(0.1));
		const unsubZoomOut = electronApi.onZoomOut?.(() => void AccessibilityStore.adjustZoom(-0.1));
		const unsubZoomReset = electronApi.onZoomReset?.(() => AccessibilityStore.updateSettings({zoomLevel: 1.0}));
		const unsubOpenSettings = electronApi.onOpenSettings?.(() => {
			ModalActionCreators.push(ModalActionCreators.modal(() => <UserSettingsModal />));
		});

		return () => {
			unsubZoomIn?.();
			unsubZoomOut?.();
			unsubZoomReset?.();
			unsubOpenSettings?.();
		};
	}, []);

	useEffect(() => {
		const root = document.documentElement;
		root.classList.toggle('reduced-motion', reducedMotion);
		return () => {
			root.classList.remove('reduced-motion');
		};
	}, [reducedMotion]);

	useEffect(() => {
		if (Config.PUBLIC_BUILD_SHA && Config.PUBLIC_BUILD_TIMESTAMP) {
			const buildInfo = Config.PUBLIC_BUILD_NUMBER
				? `build ${Config.PUBLIC_BUILD_NUMBER} (${Config.PUBLIC_BUILD_SHA})`
				: Config.PUBLIC_BUILD_SHA;
			logger.info(`[BUILD INFO] ${Config.PUBLIC_RELEASE_CHANNEL} - ${buildInfo} - ${Config.PUBLIC_BUILD_TIMESTAMP}`);
		}

		FocusManager.init();

		const shouldRegisterWindowListeners = !isNative;
		if (shouldRegisterWindowListeners && document.hasFocus()) {
			document.documentElement.classList.add('window-focused');
		}

		const preventScroll = (event: Event) => event.preventDefault();
		const handleBlur = () => {
			WindowActionCreators.focused(false);
			if (shouldRegisterWindowListeners) {
				document.documentElement.classList.remove('window-focused');
			}
		};
		const handleFocus = () => {
			WindowActionCreators.focused(true);
			if (shouldRegisterWindowListeners) {
				document.documentElement.classList.add('window-focused');
			}
			handleImmediateActivity();
		};
		const handleVisibilityChange = () => {
			WindowActionCreators.visibilityChanged(!document.hidden);
		};

		const preventPinchZoom = (event: TouchEvent) => {
			if (event.touches.length > 1) {
				event.preventDefault();
			}
		};

		if (shouldRegisterWindowListeners) {
			document.addEventListener('scroll', preventScroll);
			window.addEventListener('blur', handleBlur);
			window.addEventListener('focus', handleFocus);
			document.addEventListener('visibilitychange', handleVisibilityChange);
			window.addEventListener('mousedown', handleImmediateActivity);
			window.addEventListener('keydown', handleUserActivity);
			window.addEventListener('resize', handleResize);
			window.addEventListener('touchstart', handleImmediateActivity);
			document.addEventListener('touchstart', preventPinchZoom, {passive: false});
			document.addEventListener('touchmove', preventPinchZoom, {passive: false});
		}

		return () => {
			FocusManager.destroy();
			if (shouldRegisterWindowListeners) {
				document.removeEventListener('scroll', preventScroll);
				window.removeEventListener('blur', handleBlur);
				window.removeEventListener('focus', handleFocus);
				document.removeEventListener('visibilitychange', handleVisibilityChange);
				window.removeEventListener('mousedown', handleImmediateActivity);
				window.removeEventListener('keydown', handleUserActivity);
				window.removeEventListener('resize', handleResize);
				window.removeEventListener('touchstart', handleImmediateActivity);
				document.removeEventListener('touchstart', preventPinchZoom);
				document.removeEventListener('touchmove', preventPinchZoom);
			}
		};
	}, [handleImmediateActivity, handleResize, isNative]);

	useEffect(() => {
		if (!isNative) {
			return;
		}
		const htmlNode = document.documentElement;
		const updateClass = (focused: boolean) => {
			htmlNode.classList.toggle('window-focused', focused);
		};
		const handleFocus = () => {
			updateClass(true);
			WindowActionCreators.focused(true);
			handleImmediateActivity();
		};
		const handleBlur = () => {
			updateClass(false);
			WindowActionCreators.focused(false);
		};
		const handleVisibilityChange = () => {
			WindowActionCreators.visibilityChanged(!document.hidden);
		};
		const preventPinchZoom = (event: TouchEvent) => {
			if (event.touches.length > 1) {
				event.preventDefault();
			}
		};
		updateClass(document.hasFocus());
		window.addEventListener('focus', handleFocus);
		window.addEventListener('blur', handleBlur);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('mousedown', handleImmediateActivity);
		window.addEventListener('keydown', handleUserActivity);
		window.addEventListener('resize', handleResize);
		window.addEventListener('touchstart', handleImmediateActivity);
		document.addEventListener('touchstart', preventPinchZoom, {passive: false});
		document.addEventListener('touchmove', preventPinchZoom, {passive: false});
		return () => {
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('blur', handleBlur);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('mousedown', handleImmediateActivity);
			window.removeEventListener('keydown', handleUserActivity);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('touchstart', handleImmediateActivity);
			document.removeEventListener('touchstart', preventPinchZoom);
			document.removeEventListener('touchmove', preventPinchZoom);
		};
	}, [handleImmediateActivity, handleResize, isNative]);

	useEffect(() => {
		const htmlNode = document.documentElement;
		const platformClasses = [isNative ? 'platform-native' : 'platform-web', `platform-${platform}`];

		htmlNode.classList.add(...platformClasses);

		return () => {
			htmlNode.classList.remove(...platformClasses);
		};
	}, [isNative, platform]);

	useEffect(() => {
		const htmlNode = document.documentElement;
		htmlNode.classList.add(`theme-${effectiveTheme}`);
		htmlNode.style.setProperty('--saturation-factor', saturationFactor.toString());
		htmlNode.style.setProperty('--user-select', enableTextSelection ? 'auto' : 'none');
		htmlNode.style.setProperty('--font-size', `${fontSize}px`);
		htmlNode.style.setProperty('--chat-horizontal-padding', `${messageGutter}px`);
		htmlNode.style.setProperty('--message-group-spacing', `${messageGroupSpacing}px`);
		htmlNode.style.setProperty('dynamic-range-limit', hdrDisplayMode === HdrDisplayMode.FULL ? 'high' : 'standard');

		if (alwaysUnderlineLinks) {
			htmlNode.style.setProperty('--link-decoration', 'underline');
		} else {
			htmlNode.style.removeProperty('--link-decoration');
		}

		return () => {
			htmlNode.classList.remove(`theme-${effectiveTheme}`);
			htmlNode.style.removeProperty('--saturation-factor');
			htmlNode.style.removeProperty('--link-decoration');
			htmlNode.style.removeProperty('--user-select');
			htmlNode.style.removeProperty('--font-size');
			htmlNode.style.removeProperty('--chat-horizontal-padding');
			htmlNode.style.removeProperty('--message-group-spacing');
			htmlNode.style.removeProperty('dynamic-range-limit');
		};
	}, [
		effectiveTheme,
		saturationFactor,
		alwaysUnderlineLinks,
		enableTextSelection,
		fontSize,
		messageGutter,
		messageGroupSpacing,
		hdrDisplayMode,
	]);

	useEffect(() => {
		const styleElementId = 'fluxer-custom-theme-style';
		const existing = document.getElementById(styleElementId) as HTMLStyleElement | null;

		const css = customThemeCss?.trim() ?? '';

		if (!css) {
			if (existing?.parentNode) {
				existing.parentNode.removeChild(existing);
			}
			return;
		}

		const styleElement = existing ?? document.createElement('style');
		styleElement.id = styleElementId;
		styleElement.textContent = css;

		if (!existing) {
			document.head.appendChild(styleElement);
		}
	}, [customThemeCss]);

	return (
		<LayoutVariantProvider value={layoutVariantContextValue}>
			<SVGMasks />
			<RoomContext.Provider value={room ?? undefined}>
				{room && <RoomAudioRenderer />}
				<div ref={ringsContainerRef} className={styles.appContainer}>
					<FocusRingScope containerRef={ringsContainerRef}>
						<NativeTrafficLightsBackdrop variant={layoutVariant} />
						{isNative && !isMacOS && <NativeTitlebar platform={platform} />}
						{children}
					</FocusRingScope>
				</div>
				<div ref={overlayScopeRef} className={styles.overlayScope}>
					<div
						id={QUICK_SWITCHER_PORTAL_ID}
						className={styles.quickSwitcherPortal}
						data-overlay-pass-through="true"
						aria-hidden="true"
					/>
					<GlobalOverlays />
					<IncomingCallManager />
				</div>
			</RoomContext.Provider>
		</LayoutVariantProvider>
	);
});

export const App = observer((): React.ReactElement => {
	const currentUser = UserStore.currentUser;
	const fatalError = RuntimeCrashStore.fatalError;

	if (fatalError) {
		throw fatalError;
	}

	useEffect(() => {
		const initAutostart = async () => {
			const platform = await getNativePlatform();
			if (platform === 'macos') {
				void ensureAutostartDefaultEnabled();
			}
		};

		void initAutostart();
	}, []);

	useEffect(() => {
		void startDeepLinkHandling();
	}, []);

	useEffect(() => {
		const detach = attachExternalLinkInterceptor();
		return () => detach?.();
	}, []);

	useEffect(() => {
		if (currentUser) {
			Sentry.setUser({
				id: currentUser.id,
				username: currentUser.username,
				email: currentUser.email ?? undefined,
			});
		} else {
			Sentry.setUser(null);
		}
	}, [currentUser]);

	return (
		<I18nProvider i18n={i18n}>
			<IconContext.Provider value={{color: 'currentColor', weight: 'fill'}}>
				<DndContext>
					<RouterProvider router={router}>
						<AppWrapper>
							<Outlet />
						</AppWrapper>
					</RouterProvider>
				</DndContext>
			</IconContext.Provider>
		</I18nProvider>
	);
});
