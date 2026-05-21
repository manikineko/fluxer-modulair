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

import type {PluginUIContext, UIComponentDescriptor} from '@fluxer/plugin';

const decorations: Map<string, {id: string; name: string; description: string; asset: string; assetType: 'avatar' | 'banner' | 'profile_effect'; animated: boolean; rarity: 'common' | 'uncommon' | 'rare' | 'legendary'}> = new Map();
const userDecorations: Map<string, Array<string>> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Decorations plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
	await loadDefaultDecorations();
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Decorations plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Decorations plugin disabled! ID: ${ctx.pluginId}`);
}

export async function onUIComponentRegister(context: PluginUIContext): Promise<void> {
	console.log(`[Discord Decorations] Registering UI component for ${context.pluginId}`);

	// Register a settings panel component for managing decorations
	const component: UIComponentDescriptor = {
		id: `${context.pluginId}-settings-panel`,
		name: 'Decorations Settings',
		component: null, // Would be the actual React component
		location: 'settings',
		priority: 50,
		props: {},
	};

	context.registerComponent();
	console.log('[Discord Decorations] Component registered successfully');
}

export async function onUIComponentUnregister(componentId: string): Promise<void> {
	console.log(`[Discord Decorations] Unregistering UI component: ${componentId}`);
}

async function loadDefaultDecorations(): Promise<void> {
	// Load default decorations
	const defaultDecorations = [
		{
			id: 'deco_1',
			name: 'Golden Avatar Border',
			description: 'A golden border around your avatar',
			asset: '/assets/decorations/gold-border.png',
			assetType: 'avatar' as const,
			animated: false,
			rarity: 'rare' as const,
		},
		{
			id: 'deco_2',
			name: 'Animated Banner',
			description: 'An animated banner effect',
			asset: '/assets/decorations/animated-banner.gif',
			assetType: 'banner' as const,
			animated: true,
			rarity: 'legendary' as const,
		},
		{
			id: 'deco_3',
			name: 'Profile Sparkle',
			description: 'Sparkles around your profile',
			asset: '/assets/decorations/sparkle.png',
			assetType: 'profile_effect' as const,
			animated: true,
			rarity: 'uncommon' as const,
		},
	];

	for (const deco of defaultDecorations) {
		decorations.set(deco.id, deco);
	}

	console.log(`Loaded ${decorations.size} default decorations`);
}

export async function getDecorations(): Promise<Map<string, unknown>> {
	return decorations as unknown as Map<string, unknown>;
}

export async function getUserDecorations(userId: string): Promise<Array<string>> {
	return userDecorations.get(userId) || [];
}

export async function assignDecoration(userId: string, decorationId: string): Promise<void> {
	const userDecos = userDecorations.get(userId) || [];
	userDecos.push(decorationId);
	userDecorations.set(userId, userDecos);
}

export async function removeDecoration(userId: string, decorationId: string): Promise<void> {
	const userDecos = userDecorations.get(userId) || [];
	const index = userDecos.indexOf(decorationId);
	if (index > -1) {
		userDecos.splice(index, 1);
		userDecorations.set(userId, userDecos);
	}
}
