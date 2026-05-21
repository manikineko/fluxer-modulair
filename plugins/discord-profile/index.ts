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

const profiles: Map<string, {userId: string; avatar?: string; banner?: string; bio?: string; accentColor?: string; pronouns?: string[]}> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Profile plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Profile plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Profile plugin disabled! ID: ${ctx.pluginId}`);
}

export async function setAvatar(userId: string, avatar: string): Promise<void> {
	const profile = profiles.get(userId) || {userId};
	profile.avatar = avatar;
	profiles.set(userId, profile);
	console.log(`Set avatar for user ${userId}`);
}

export async function setBanner(userId: string, banner: string): Promise<void> {
	const profile = profiles.get(userId) || {userId};
	profile.banner = banner;
	profiles.set(userId, profile);
	console.log(`Set banner for user ${userId}`);
}

export async function setBio(userId: string, bio: string): Promise<void> {
	const profile = profiles.get(userId) || {userId};
	profile.bio = bio;
	profiles.set(userId, profile);
	console.log(`Set bio for user ${userId}`);
}

export async function setAccentColor(userId: string, color: string): Promise<void> {
	const profile = profiles.get(userId) || {userId};
	profile.accentColor = color;
	profiles.set(userId, profile);
	console.log(`Set accent color for user ${userId}`);
}

export async function setPronouns(userId: string, pronouns: string[]): Promise<void> {
	const profile = profiles.get(userId) || {userId};
	profile.pronouns = pronouns;
	profiles.set(userId, profile);
	console.log(`Set pronouns for user ${userId}`);
}

export async function getProfile(userId: string): Promise<unknown | null> {
	return profiles.get(userId) || null;
}

export async function updateProfile(userId: string, updates: {avatar?: string; banner?: string; bio?: string; accentColor?: string; pronouns?: string[]}): Promise<void> {
	const profile = profiles.get(userId) || {userId};
	if (updates.avatar) profile.avatar = updates.avatar;
	if (updates.banner) profile.banner = updates.banner;
	if (updates.bio) profile.bio = updates.bio;
	if (updates.accentColor) profile.accentColor = updates.accentColor;
	if (updates.pronouns) profile.pronouns = updates.pronouns;
	profiles.set(userId, profile);
	console.log(`Updated profile for user ${userId}`);
}

export async function deleteProfile(userId: string): Promise<void> {
	profiles.delete(userId);
	console.log(`Deleted profile for user ${userId}`);
}

export async function listAllProfiles(): Promise<Map<string, unknown>> {
	return profiles as unknown as Map<string, unknown>;
}
