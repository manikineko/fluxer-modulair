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

// Discord Feature Types

export interface Decoration {
	id: string;
	name: string;
	description: string;
	asset: string;
	assetType: 'avatar' | 'banner' | 'profile_effect';
	animated: boolean;
	rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface VoiceState {
	userId: string;
	guildId: string;
	channelId: string;
	muted: boolean;
	deafened: boolean;
	selfMuted: boolean;
	selfDeafened: boolean;
}

export interface RichPresence {
	applicationId: string;
	name: string;
	details?: string;
	state?: string;
	largeImageKey?: string;
	largeImageText?: string;
	smallImageKey?: string;
	smallImageText?: string;
	buttons?: Array<{label: string; url: string}>;
}

export interface Activity {
	type: 'playing' | 'streaming' | 'listening' | 'watching' | 'custom';
	name: string;
	url?: string;
	details?: string;
	state?: string;
	emoji?: {name: string; id: string; animated: boolean};
}

export interface Emoji {
	id: string;
	name: string;
	animated: boolean;
	available: boolean;
	requireColons: boolean;
}

export interface Sticker {
	id: string;
	name: string;
	description?: string;
	tags?: string[];
	type: 'standard' | 'guild';
	format: 'png' | 'apng' | 'lottie';
}

export interface SoundboardSound {
	id: string;
	name: string;
	guildId: string;
	soundId: string;
	volume: number;
	emojiId?: string;
}
