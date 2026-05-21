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

import type {Decoration} from './types';

export class DecorationManager {
	private decorations: Map<string, Decoration> = new Map();
	private userDecorations: Map<string, string[]> = new Map();

	async addDecoration(decoration: Decoration): Promise<void> {
		this.decorations.set(decoration.id, decoration);
	}

	async getDecoration(id: string): Promise<Decoration | null> {
		return this.decorations.get(id) || null;
	}

	async listDecorations(type?: 'avatar' | 'banner' | 'profile_effect'): Promise<Decoration[]> {
		const all = Array.from(this.decorations.values());
		if (type) {
			return all.filter(d => d.assetType === type);
		}
		return all;
	}

	async assignDecoration(userId: string, decorationId: string): Promise<void> {
		const userDecos = this.userDecorations.get(userId) || [];
		userDecos.push(decorationId);
		this.userDecorations.set(userId, userDecos);
	}

	async getUserDecorations(userId: string): Promise<Decoration[]> {
		const userDecoIds = this.userDecorations.get(userId) || [];
		return userDecoIds
			.map(id => this.decorations.get(id))
			.filter((d): d is Decoration => d !== null);
	}

	async removeDecoration(userId: string, decorationId: string): Promise<void> {
		const userDecos = this.userDecorations.get(userId) || [];
		const index = userDecos.indexOf(decorationId);
		if (index > -1) {
			userDecos.splice(index, 1);
			this.userDecorations.set(userId, userDecos);
		}
	}
}

export const decorationManager = new DecorationManager();
