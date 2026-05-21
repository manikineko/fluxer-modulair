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

const presences: Map<string, {applicationId: string; name: string; details?: string; state?: string; largeImageKey?: string; largeImageText?: string; smallImageKey?: string; smallImageText?: string; buttons?: Array<{label: string; url: string}>}> = new Map();
const statuses: Map<string, 'online' | 'idle' | 'dnd' | 'offline'> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Presence plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Presence plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Presence plugin disabled! ID: ${ctx.pluginId}`);
}

export async function setPresence(userId: string, presence: {applicationId: string; name: string; details?: string; state?: string; largeImageKey?: string; largeImageText?: string; smallImageKey?: string; smallImageText?: string; buttons?: Array<{label: string; url: string}>}): Promise<void> {
	presences.set(userId, presence);
	console.log(`Set presence for ${userId}: ${presence.name}`);
}

export async function getPresence(userId: string): Promise<unknown | null> {
	return presences.get(userId) || null;
}

export async function setStatus(userId: string, status: 'online' | 'idle' | 'dnd' | 'offline'): Promise<void> {
	statuses.set(userId, status);
	console.log(`Set status for ${userId}: ${status}`);
}

export async function getStatus(userId: string): Promise<'online' | 'idle' | 'dnd' | 'offline'> {
	return statuses.get(userId) || 'offline';
}

export async function clearPresence(userId: string): Promise<void> {
	presences.delete(userId);
	statuses.set(userId, 'offline');
	console.log(`Cleared presence for ${userId}`);
}

export async function getAllPresences(): Promise<Map<string, unknown>> {
	return presences as unknown as Map<string, unknown>;
}

export async function getAllStatuses(): Promise<Map<string, 'online' | 'idle' | 'dnd' | 'offline'>> {
	return statuses;
}
