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

import {makeAutoObservable} from 'mobx';

interface PluginState {
	id: string;
	enabled: boolean;
	loaded: boolean;
	errorCount: number;
	lastError?: string;
}

class PluginStateManagerClass {
	private plugins: Map<string, PluginState> = new Map();
	private listeners: Set<(plugins: Map<string, PluginState>) => void> = new Set();

	constructor() {
		makeAutoObservable(this);
	}

	registerPlugin(id: string, initialState: Partial<PluginState> = {}): void {
		if (!this.plugins.has(id)) {
			this.plugins.set(id, {
				id,
				enabled: true,
				loaded: false,
				errorCount: 0,
				...initialState,
			});
			this.notifyListeners();
		}
	}

	enablePlugin(id: string): void {
		const plugin = this.plugins.get(id);
		if (plugin) {
			plugin.enabled = true;
			plugin.errorCount = 0;
			plugin.lastError = undefined;
			this.notifyListeners();
		}
	}

	disablePlugin(id: string, reason?: string): void {
		const plugin = this.plugins.get(id);
		if (plugin) {
			plugin.enabled = false;
			if (reason) {
				plugin.lastError = reason;
			}
			this.notifyListeners();
		}
	}

	markPluginLoaded(id: string): void {
		const plugin = this.plugins.get(id);
		if (plugin) {
			plugin.loaded = true;
			this.notifyListeners();
		}
	}

	recordPluginError(id: string, error: string): void {
		const plugin = this.plugins.get(id);
		if (plugin) {
			plugin.errorCount++;
			plugin.lastError = error;
			// Auto-disable plugin after 3 errors
			if (plugin.errorCount >= 3) {
				plugin.enabled = false;
			}
			this.notifyListeners();
		}
	}

	isPluginEnabled(id: string): boolean {
		return this.plugins.get(id)?.enabled ?? false;
	}

	isPluginLoaded(id: string): boolean {
		return this.plugins.get(id)?.loaded ?? false;
	}

	getPluginState(id: string): PluginState | null {
		return this.plugins.get(id) ?? null;
	}

	getAllPluginStates(): Map<string, PluginState> {
		return new Map(this.plugins);
	}

	getEnabledPlugins(): string[] {
		return Array.from(this.plugins.entries())
			.filter(([, state]) => state.enabled)
			.map(([id]) => id);
	}

	subscribe(listener: (plugins: Map<string, PluginState>) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		this.listeners.forEach((listener) => listener(this.plugins));
	}
}

export const PluginStateManager = new PluginStateManagerClass();
export type {PluginState};
