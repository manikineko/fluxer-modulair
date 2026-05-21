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

import type {VoiceState} from './types';

export class VoiceManager {
	private voiceStates: Map<string, VoiceState> = new Map();
	private voiceChannels: Map<string, Set<string>> = new Map();

	async joinVoiceChannel(userId: string, guildId: string, channelId: string): Promise<void> {
		const voiceState: VoiceState = {
			userId,
			guildId,
			channelId,
			muted: false,
			deafened: false,
			selfMuted: false,
			selfDeafened: false,
		};
		
		this.voiceStates.set(userId, voiceState);
		
		const channelUsers = this.voiceChannels.get(channelId) || new Set();
		channelUsers.add(userId);
		this.voiceChannels.set(channelId, channelUsers);
	}

	async leaveVoiceChannel(userId: string): Promise<void> {
		const voiceState = this.voiceStates.get(userId);
		if (voiceState) {
			const channelUsers = this.voiceChannels.get(voiceState.channelId);
			if (channelUsers) {
				channelUsers.delete(userId);
				if (channelUsers.size === 0) {
					this.voiceChannels.delete(voiceState.channelId);
				}
			}
			this.voiceStates.delete(userId);
		}
	}

	async getVoiceState(userId: string): Promise<VoiceState | null> {
		return this.voiceStates.get(userId) || null;
	}

	async getChannelUsers(channelId: string): Promise<VoiceState[]> {
		const channelUsers = this.voiceChannels.get(channelId);
		if (!channelUsers) return [];
		
		return Array.from(channelUsers)
			.map(userId => this.voiceStates.get(userId))
			.filter((state): state is VoiceState => state !== null);
	}

	async muteUser(userId: string, serverMute: boolean): Promise<void> {
		const voiceState = this.voiceStates.get(userId);
		if (voiceState) {
			voiceState.muted = serverMute;
		}
	}

	async selfMuteUser(userId: string, selfMute: boolean): Promise<void> {
		const voiceState = this.voiceStates.get(userId);
		if (voiceState) {
			voiceState.selfMuted = selfMute;
		}
	}
}

export const voiceManager = new VoiceManager();
