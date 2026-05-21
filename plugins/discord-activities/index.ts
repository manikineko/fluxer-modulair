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

interface DiscordActivity {
	type: 'playing' | 'streaming' | 'listening' | 'watching' | 'custom';
	name: string;
	url?: string;
	details?: string;
	state?: string;
	emoji?: {name: string; id: string; animated: boolean};
	timestamp?: number;
	userId: string;
}

interface ActivitiesSettings {
	enableActivities: boolean;
	showTimestamps: boolean;
	autoClearAfter: number; // minutes, 0 = never
	allowedTypes: Array<string>;
}

const activities: Map<string, DiscordActivity> = new Map();
const settings: ActivitiesSettings = {
	enableActivities: true,
	showTimestamps: true,
	autoClearAfter: 60,
	allowedTypes: ['playing', 'streaming', 'listening', 'watching', 'custom'],
};

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Activities plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Activities plugin enabled! ID: ${ctx.pluginId}`);

	// Start cleanup interval if auto-clear is enabled
	if (settings.autoClearAfter > 0) {
		cleanupInterval = setInterval(() => {
			cleanupExpiredActivities();
		}, settings.autoClearAfter * 60 * 1000);
	}
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Activities plugin disabled! ID: ${ctx.pluginId}`);

	// Clear cleanup interval
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
	}

	// Clear all activities
	activities.clear();
}

function cleanupExpiredActivities(): void {
	if (settings.autoClearAfter <= 0) return;
	
	const now = Date.now();
	const expireTime = settings.autoClearAfter * 60 * 1000;
	
	for (const [userId, activity] of activities.entries()) {
		if (activity.timestamp && (now - activity.timestamp) > expireTime) {
			activities.delete(userId);
			console.log(`Auto-cleared expired activity for ${userId}`);
		}
	}
}

function validateActivity(activity: Partial<DiscordActivity>): string | null {
	if (!activity.name || activity.name.trim().length === 0) {
		return 'Activity name is required';
	}
	
	if (!activity.type || !settings.allowedTypes.includes(activity.type)) {
		return `Invalid activity type. Allowed types: ${settings.allowedTypes.join(', ')}`;
	}
	
	if (activity.type === 'streaming' && !activity.url) {
		return 'Streaming activities require a URL';
	}
	
	if (activity.url && !isValidUrl(activity.url)) {
		return 'Invalid URL format';
	}
	
	return null;
}

function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export async function startActivity(userId: string, activity: Partial<DiscordActivity>): Promise<{success: boolean; error?: string}> {
	if (!settings.enableActivities) {
		return {success: false, error: 'Activities are disabled'};
	}
	
	const validationError = validateActivity(activity);
	if (validationError) {
		return {success: false, error: validationError};
	}
	
	const fullActivity: DiscordActivity = {
		type: activity.type!,
		name: activity.name!,
		url: activity.url,
		details: activity.details,
		state: activity.state,
		emoji: activity.emoji,
		timestamp: Date.now(),
		userId,
	};
	
	activities.set(userId, fullActivity);
	console.log(`Started activity for ${userId}: ${fullActivity.type} ${fullActivity.name}`);
	
	// Emit activity change event
	if (typeof window !== 'undefined' && window.dispatchEvent) {
		window.dispatchEvent(new CustomEvent('discord-activity-changed', {
			detail: { userId, activity: fullActivity }
		}));
	}
	
	return {success: true};
}

export async function getActivity(userId: string): Promise<DiscordActivity | null> {
	const activity = activities.get(userId);
	if (!activity) return null;
	
	// Check if activity has expired
	if (settings.autoClearAfter > 0 && activity.timestamp) {
		const now = Date.now();
		const expireTime = settings.autoClearAfter * 60 * 1000;
		if ((now - activity.timestamp) > expireTime) {
			activities.delete(userId);
			return null;
		}
	}
	
	return activity;
}

export async function clearActivity(userId: string): Promise<{success: boolean}> {
	activities.delete(userId);
	console.log(`Cleared activity for ${userId}`);
	
	// Emit activity cleared event
	if (typeof window !== 'undefined' && window.dispatchEvent) {
		window.dispatchEvent(new CustomEvent('discord-activity-cleared', {
			detail: { userId }
		}));
	}
	
	return {success: true};
}

export async function getAllActivities(): Promise<Map<string, DiscordActivity>> {
	// Filter out expired activities
	if (settings.autoClearAfter > 0) {
		cleanupExpiredActivities();
	}
	return new Map(activities);
}

export async function updateSettings(newSettings: Partial<ActivitiesSettings>): Promise<{success: boolean; error?: string}> {
	try {
		Object.assign(settings, newSettings);
		
		// Restart cleanup interval if needed
		if (cleanupInterval) {
			clearInterval(cleanupInterval);
			cleanupInterval = null;
		}
		
		if (settings.autoClearAfter > 0) {
			cleanupInterval = setInterval(() => {
				cleanupExpiredActivities();
			}, settings.autoClearAfter * 60 * 1000);
		}
		
		console.log('Discord Activities settings updated:', settings);
		
		// Emit settings changed event
		if (typeof window !== 'undefined' && window.dispatchEvent) {
			window.dispatchEvent(new CustomEvent('discord-activities-settings-changed', {
				detail: { settings }
			}));
		}
		
		return {success: true};
	} catch (error) {
		return {success: false, error: error instanceof Error ? error.message : 'Unknown error'};
	}
}

export async function getSettings(): Promise<ActivitiesSettings> {
	return {...settings};
}

// Convenience functions for specific activity types
export async function setPlaying(userId: string, name: string, details?: string, state?: string): Promise<{success: boolean; error?: string}> {
	return startActivity(userId, {type: 'playing', name, details, state});
}

export async function setStreaming(userId: string, name: string, url: string, details?: string): Promise<{success: boolean; error?: string}> {
	return startActivity(userId, {type: 'streaming', name, url, details});
}

export async function setListening(userId: string, name: string, details?: string): Promise<{success: boolean; error?: string}> {
	return startActivity(userId, {type: 'listening', name, details});
}

export async function setWatching(userId: string, name: string, details?: string): Promise<{success: boolean; error?: string}> {
	return startActivity(userId, {type: 'watching', name, details});
}

export async function setCustom(userId: string, name: string, emoji?: {name: string; id: string; animated: boolean}): Promise<{success: boolean; error?: string}> {
	return startActivity(userId, {type: 'custom', name, emoji});
}
