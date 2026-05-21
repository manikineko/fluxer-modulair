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

// React UI component for Emoji Picker
// This function receives React as a parameter and returns a React component
const EmojiPickerComponent = (React: unknown) => {
	const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
	
	return function EmojiPickerButton(props: Record<string, unknown>) {
		const [isOpen, setIsOpen] = R.useState(false);
		const [emojiList, setEmojiList] = R.useState<Array<{id: string; name: string; char: string}>>([]);

		// Load emojis when component mounts
		R.useEffect(() => {
			// Use actual emoji data from plugin
			const commonEmojis = [
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
			];
			setEmojiList(commonEmojis);
		}, []);

		const handleClick = () => {
			setIsOpen(!isOpen);
		};

		const selectEmoji = (emoji: {id: string; name: string; char: string}) => {
			// Emit event for app to handle emoji insertion
			const event = new CustomEvent('plugin-emoji-selected', {detail: {emoji: emoji.char, id: emoji.id}});
			window.dispatchEvent(event);
			console.log('Selected emoji:', emoji.char, '(', emoji.id, ')');
			setIsOpen(false);
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
			position: 'relative' as const,
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

const emojis: Map<string, {id: string; name: string; animated: boolean; available: boolean; requireColons: boolean}> = new Map();
const stickers: Map<string, {id: string; name: string; description?: string; tags?: string[]; type: 'standard' | 'guild'; format: 'png' | 'apng' | 'lottie'}> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Emojis plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
	await loadDefaultEmojis();
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Emojis plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Emojis plugin disabled! ID: ${ctx.pluginId}`);
}


async function loadDefaultEmojis(): Promise<void> {
	const defaultEmojis = [
		{id: 'emoji_1', name: 'smile', animated: false, available: true, requireColons: true},
		{id: 'emoji_2', name: 'thumbs_up', animated: false, available: true, requireColons: true},
		{id: 'emoji_3', name: 'party', animated: true, available: true, requireColons: true},
	];

	for (const emoji of defaultEmojis) {
		emojis.set(emoji.id, emoji);
	}

	console.log(`Loaded ${emojis.size} default emojis`);
}

export async function addEmoji(emoji: {id: string; name: string; animated: boolean; available: boolean; requireColons: boolean}): Promise<void> {
	emojis.set(emoji.id, emoji);
}

export async function getEmoji(id: string): Promise<unknown | null> {
	return emojis.get(id) || null;
}

export async function listEmojis(): Promise<Map<string, unknown>> {
	return emojis as unknown as Map<string, unknown>;
}

export async function addSticker(sticker: {id: string; name: string; description?: string; tags?: string[]; type: 'standard' | 'guild'; format: 'png' | 'apng' | 'lottie'}): Promise<void> {
	stickers.set(sticker.id, sticker);
}

export async function getSticker(id: string): Promise<unknown | null> {
	return stickers.get(id) || null;
}

export async function listStickers(): Promise<Map<string, unknown>> {
	return stickers as unknown as Map<string, unknown>;
}

export async function searchEmojis(query: string): Promise<unknown[]> {
	const results: unknown[] = [];
	for (const emoji of emojis.values()) {
		if (emoji.name.toLowerCase().includes(query.toLowerCase())) {
			results.push(emoji);
		}
	}
	return results;
}

export async function searchStickers(query: string): Promise<unknown[]> {
	const results: unknown[] = [];
	for (const sticker of stickers.values()) {
		if (sticker.name.toLowerCase().includes(query.toLowerCase()) || sticker.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))) {
			results.push(sticker);
		}
	}
	return results;
}
