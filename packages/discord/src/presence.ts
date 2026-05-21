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

import type {RichPresence} from './types';

export class PresenceManager {
	private presences: Map<string, RichPresence> = new Map();
	private statuses: Map<string, 'online' | 'idle' | 'dnd' | 'offline'> = new Map();

	async setPresence(userId: string, presence: RichPresence): Promise<void> {
		this.presences.set(userId, presence);
	}

	async getPresence(userId: string): Promise<RichPresence | null> {
		return this.presences.get(userId) || null;
	}

	async setStatus(userId: string, status: 'online' | 'idle' | 'dnd' | 'offline'): Promise<void> {
		this.statuses.set(userId, status);
	}

	async getStatus(userId: string): Promise<'online' | 'idle' | 'dnd' | 'offline'> {
		return this.statuses.get(userId) || 'offline';
	}

	async clearPresence(userId: string): Promise<void> {
		this.presences.delete(userId);
		this.statuses.set(userId, 'offline');
	}
}

export const presenceManager = new PresenceManager();
