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

// React UI component for Voice Controls
const VoiceControlsComponent = (React: unknown) => {
	const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
	
	return function VoiceControlsButton(props: Record<string, unknown>) {
		const [isMuted, setIsMuted] = R.useState(false);
		const [isDeafened, setIsDeafened] = R.useState(false);
		const [inputVolume, setInputVolume] = R.useState(100);
		const [outputVolume, setOutputVolume] = R.useState(100);

		const handleToggleMute = () => {
			const newState = !isMuted;
			setIsMuted(newState);
			// Emit event for app to handle mute state
			const event = new CustomEvent('plugin-voice-mute', {detail: {muted: newState}});
			window.dispatchEvent(event);
			console.log('Mute toggled:', newState);
		};

		const handleToggleDeafen = () => {
			const newState = !isDeafened;
			setIsDeafened(newState);
			// Emit event for app to handle deafen state
			const event = new CustomEvent('plugin-voice-deafen', {detail: {deafened: newState}});
			window.dispatchEvent(event);
			console.log('Deafen toggled:', newState);
		};

		const handleVolumeChange = (type: 'input' | 'output', value: number) => {
			if (type === 'input') {
				setInputVolume(value);
				const event = new CustomEvent('plugin-voice-input-volume', {detail: {volume: value}});
				window.dispatchEvent(event);
			} else {
				setOutputVolume(value);
				const event = new CustomEvent('plugin-voice-output-volume', {detail: {volume: value}});
				window.dispatchEvent(event);
			}
		};

		const buttonStyle = (active: boolean) => ({
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '10px 14px',
			borderRadius: '8px',
			border: '1px solid transparent',
			background: active ? 'var(--background-modifier-selected)' : 'transparent',
			cursor: 'pointer',
			fontSize: '22px',
			color: active ? 'var(--status-danger)' : 'var(--text-normal)',
			transition: 'all 0.15s ease',
		});

		const hoverStyle = {
			background: 'var(--background-secondary)',
		};

		return R.createElement('div', {style: {display: 'flex', gap: '4px', alignItems: 'center'}},
			R.createElement('button', {
				onClick: handleToggleMute,
				style: buttonStyle(isMuted),
				onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
					if (!isMuted) {
						Object.assign(e.target.style, hoverStyle);
					}
				},
				onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
					if (!isMuted) {
						Object.assign(e.target.style, {background: 'transparent'});
					}
				},
				title: isMuted ? 'Unmute' : 'Mute',
			}, isMuted ? '🔇' : '🎤'),
			R.createElement('button', {
				onClick: handleToggleDeafen,
				style: buttonStyle(isDeafened),
				onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
					if (!isDeafened) {
						Object.assign(e.target.style, hoverStyle);
					}
				},
				onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
					if (!isDeafened) {
						Object.assign(e.target.style, {background: 'transparent'});
					}
				},
				title: isDeafened ? 'Undeafen' : 'Deafen',
			}, isDeafened ? '🔕' : '🔔'),
			R.createElement('div', {
				style: {
					position: 'relative',
					display: 'inline-block',
				},
			},
				R.createElement('button', {
					onClick: () => {
						// Toggle settings panel visibility - for now, just show it inline
						const settingsPanel = document.getElementById('voice-settings-panel');
						if (settingsPanel) {
							settingsPanel.remove();
						} else {
							const panel = document.createElement('div');
							panel.id = 'voice-settings-panel';
							panel.style.cssText = `
								position: absolute;
								top: 100%;
								right: 0;
								margin-top: 8px;
								margin-right: 8px;
								padding: 12px;
								background: var(--background-primary);
								border: 1px solid var(--background-modifier-accent);
								border-radius: 8px;
								box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
								z-index: 1000;
								min-width: 200px;
							`;
							panel.innerHTML = `
								<div style="font-size: 14px; color: var(--text-muted); margin-bottom: 8px;">Voice Settings</div>
								<div style="display: flex; flex-direction: column; gap: 12px;">
									<div style="display: flex; flex-direction: column; gap: 4px;">
										<label style="font-size: 12px; color: var(--text-muted);">Input Volume: ${inputVolume}%</label>
										<input type="range" min="0" max="100" value="${inputVolume}" style="width: 100%;">
									</div>
									<div style="display: flex; flex-direction: column; gap: 4px;">
										<label style="font-size: 12px; color: var(--text-muted);">Output Volume: ${outputVolume}%</label>
										<input type="range" min="0" max="100" value="${outputVolume}" style="width: 100%;">
									</div>
								</div>
							`;
							const inputSlider = panel.querySelector('input[type="range"]:first-of-type') as HTMLInputElement;
							const outputSlider = panel.querySelector('input[type="range"]:last-of-type') as HTMLInputElement;
							inputSlider.oninput = (e) => handleVolumeChange('input', parseInt((e.target as HTMLInputElement).value));
							outputSlider.oninput = (e) => handleVolumeChange('output', parseInt((e.target as HTMLInputElement).value));
							document.body.appendChild(panel);
						}
					},
					style: buttonStyle(false),
					onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
						Object.assign(e.target.style, hoverStyle);
					},
					onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
						Object.assign(e.target.style, {background: 'transparent'});
					},
					title: 'Voice Settings',
				}, '⚙️')
			)
		);
	};
};

const voiceStates: Map<string, {userId: string; guildId: string; channelId: string; muted: boolean; deafened: boolean; selfMuted: boolean; selfDeafened: boolean}> = new Map();
const voiceChannels: Map<string, Set<string>> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Voice plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Voice plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Voice plugin disabled! ID: ${ctx.pluginId}`);
}

export async function joinVoiceChannel(userId: string, guildId: string, channelId: string): Promise<void> {
	const voiceState = {
		userId,
		guildId,
		channelId,
		muted: false,
		deafened: false,
		selfMuted: false,
		selfDeafened: false,
	};
	
	voiceStates.set(userId, voiceState);
	
	const channelUsers = voiceChannels.get(channelId) || new Set();
	channelUsers.add(userId);
	voiceChannels.set(channelId, channelUsers);
	
	console.log(`User ${userId} joined voice channel ${channelId}`);
}

export async function leaveVoiceChannel(userId: string): Promise<void> {
	const voiceState = voiceStates.get(userId);
	if (voiceState) {
		const channelUsers = voiceChannels.get(voiceState.channelId);
		if (channelUsers) {
			channelUsers.delete(userId);
			if (channelUsers.size === 0) {
				voiceChannels.delete(voiceState.channelId);
			}
		}
		voiceStates.delete(userId);
		console.log(`User ${userId} left voice channel ${voiceState.channelId}`);
	}
}

export async function getVoiceState(userId: string): Promise<unknown | null> {
	return voiceStates.get(userId) || null;
}

export async function getChannelUsers(channelId: string): Promise<unknown[]> {
	const channelUsers = voiceChannels.get(channelId);
	if (!channelUsers) return [];
	
	const users: unknown[] = [];
	for (const userId of channelUsers) {
		const state = voiceStates.get(userId);
		if (state) {
			users.push(state);
		}
	}
	return users;
}

export async function muteUser(userId: string, serverMute: boolean): Promise<void> {
	const voiceState = voiceStates.get(userId);
	if (voiceState) {
		voiceState.muted = serverMute;
		console.log(`User ${userId} ${serverMute ? 'muted' : 'unmuted'} by server`);
	}
}

export async function selfMuteUser(userId: string, selfMute: boolean): Promise<void> {
	const voiceState = voiceStates.get(userId);
	if (voiceState) {
		voiceState.selfMuted = selfMute;
		console.log(`User ${userId} ${selfMute ? 'self-muted' : 'self-unmuted'}`);
	}
}
