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

// React UI component for Soundboard
const SoundboardComponent = (React: unknown) => {
	const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
	
	return function SoundboardButton(props: Record<string, unknown>) {
		const [isOpen, setIsOpen] = R.useState(false);
		const [isPlaying, setIsPlaying] = R.useState<string | null>(null);
		const [soundList, setSoundList] = R.useState<Array<{id: string; name: string; emoji: string; volume: number}>>([]);

		// Load sounds when component mounts
		R.useEffect(() => {
			const defaultSounds = [
				{id: 'clap', name: 'Clap', emoji: '👏', volume: 100},
				{id: 'celebration', name: 'Celebration', emoji: '🎉', volume: 100},
				{id: 'laugh', name: 'Laugh', emoji: '😂', volume: 100},
				{id: 'scream', name: 'Scream', emoji: '😱', volume: 100},
				{id: 'ding', name: 'Ding', emoji: '🔔', volume: 100},
				{id: 'announce', name: 'Announce', emoji: '📢', volume: 100},
				{id: 'music', name: 'Music', emoji: '🎵', volume: 100},
				{id: 'airhorn', name: 'Airhorn', emoji: '📯', volume: 100},
			];
			setSoundList(defaultSounds);
		}, []);

		const handleClick = () => {
			setIsOpen(!isOpen);
		};

		const playSound = (sound: {id: string; name: string; emoji: string; volume: number}) => {
			setIsPlaying(sound.id);
			// Emit event for app to handle sound playback
			const event = new CustomEvent('plugin-sound-play', {detail: {soundId: sound.id, name: sound.name, volume: sound.volume}});
			window.dispatchEvent(event);
			console.log('Playing sound:', sound.name, '(', sound.id, ')');
			// Simulate sound duration
			setTimeout(() => setIsPlaying(null), 1000);
		};

		const buttonStyle = {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '10px 14px',
			borderRadius: '8px',
			border: '1px solid transparent',
			background: isOpen ? 'var(--background-modifier-selected)' : 'transparent',
			cursor: 'pointer',
			fontSize: '22px',
			color: 'var(--text-normal)',
			transition: 'all 0.15s ease',
		};

		const hoverStyle = {
			background: 'var(--background-secondary)',
		};

		return R.createElement('div', {style: {position: 'relative', display: 'inline-block'}},
			R.createElement('button', {
				onClick: handleClick,
				style: buttonStyle,
				onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
					if (!isOpen) {
						Object.assign(e.target.style, hoverStyle);
					}
				},
				onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
					if (!isOpen) {
						Object.assign(e.target.style, {background: 'transparent'});
					}
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
							onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
								if (isPlaying === null) {
									e.target.style.background = 'var(--background-modifier-hover)';
								}
							},
							onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
								e.target.style.background = isPlaying === sound.id ? 'var(--background-modifier-selected)' : 'transparent';
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

const soundboardSounds: Map<string, {id: string; name: string; guildId: string; soundId: string; volume: number; emojiId?: string}> = new Map();
const guildSoundboards: Map<string, Set<string>> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Soundboard plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
	await loadDefaultSounds();
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Soundboard plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Soundboard plugin disabled! ID: ${ctx.pluginId}`);
}

async function loadDefaultSounds(): Promise<void> {
	const defaultSounds = [
		{id: 'sound_1', name: 'Applause', guildId: 'default', soundId: 'applause.mp3', volume: 1.0},
		{id: 'sound_2', name: 'Laugh Track', guildId: 'default', soundId: 'laugh.mp3', volume: 0.8},
		{id: 'sound_3', name: 'Dramatic Sound', guildId: 'default', soundId: 'dramatic.mp3', volume: 0.9},
	];

	for (const sound of defaultSounds) {
		soundboardSounds.set(sound.id, sound);
		const guildSounds = guildSoundboards.get(sound.guildId) || new Set();
		guildSounds.add(sound.id);
		guildSoundboards.set(sound.guildId, guildSounds);
	}

	console.log(`Loaded ${soundboardSounds.size} default sounds`);
}

export async function addSound(sound: {id: string; name: string; guildId: string; soundId: string; volume: number; emojiId?: string}): Promise<void> {
	soundboardSounds.set(sound.id, sound);
	const guildSounds = guildSoundboards.get(sound.guildId) || new Set();
	guildSounds.add(sound.id);
	guildSoundboards.set(sound.guildId, guildSounds);
}

export async function getSound(id: string): Promise<unknown | null> {
	return soundboardSounds.get(id) || null;
}

export async function listGuildSounds(guildId: string): Promise<unknown[]> {
	const guildSoundIds = guildSoundboards.get(guildId) || new Set();
	const sounds: unknown[] = [];
	for (const soundId of guildSoundIds) {
		const sound = soundboardSounds.get(soundId);
		if (sound) {
			sounds.push(sound);
		}
	}
	return sounds;
}

export async function playSound(soundId: string, userId: string): Promise<void> {
	const sound = soundboardSounds.get(soundId);
	if (sound) {
		console.log(`Playing sound ${sound.name} (${sound.soundId}) for user ${userId} at volume ${sound.volume}`);
		
		// Simulate audio playback
		// In production, this would:
		// 1. Load the audio file from the sound URL
		// 2. Create an AudioContext or use Web Audio API
		// 3. Apply volume and effects
		// 4. Play the sound to the appropriate channel
		// 5. Handle playback events (start, end, error)
		
		// For now, simulate playback
		try {
			// Simulate audio loading and playback
			await new Promise(resolve => setTimeout(resolve, 100));
			console.log(`[Soundboard] Started playing: ${sound.name}`);
			
			// In a real implementation, you would use:
			// const audio = new Audio(sound.url);
			// audio.volume = sound.volume;
			// audio.play();
		} catch (error) {
			console.error(`Error playing sound ${soundId}:`, error);
		}
	}
}

export async function removeSound(soundId: string): Promise<void> {
	const sound = soundboardSounds.get(soundId);
	if (sound) {
		soundboardSounds.delete(soundId);
		const guildSounds = guildSoundboards.get(sound.guildId);
		if (guildSounds) {
			guildSounds.delete(soundId);
		}
	}
}

export async function setVolume(soundId: string, volume: number): Promise<void> {
	const sound = soundboardSounds.get(soundId);
	if (sound) {
		sound.volume = Math.max(0, Math.min(1, volume));
	}
}

export async function searchSounds(query: string): Promise<unknown[]> {
	const results: unknown[] = [];
	for (const sound of soundboardSounds.values()) {
		if (sound.name.toLowerCase().includes(query.toLowerCase())) {
			results.push(sound);
		}
	}
	return results;
}
