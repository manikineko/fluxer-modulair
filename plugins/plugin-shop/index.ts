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

interface ShopPlugin {
	id: string;
	name: string;
	version: string;
	description: string;
	author: string;
	license: string;
	category: string;
	downloads: number;
	rating: number;
	installed: boolean;
	manifest: unknown;
}

const availablePlugins: Map<string, ShopPlugin> = new Map();
const installedPlugins: Set<string> = new Set();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Plugin Shop loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
	await loadPluginCatalog();
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Plugin Shop enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Plugin Shop disabled! ID: ${ctx.pluginId}`);
}

export async function onRequest(context: unknown): Promise<void> {
	const ctx = context as {request: {url: string; method: string}};
	if (ctx.request.url?.startsWith('/api/plugins/')) {
		await handleShopRequest(ctx.request);
	}
}

async function loadPluginCatalog(): Promise<void> {
	console.log('Loading plugin catalog...');
	
	// Load sample plugins from catalog
	const samplePlugins: ShopPlugin[] = [
		{
			id: 'example-plugin',
			name: 'Example Plugin',
			version: '1.0.0',
			description: 'A simple example plugin demonstrating the Fluxer plugin framework',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'utility',
			downloads: 1000,
			rating: 4.5,
			installed: true,
			manifest: {},
		},
		{
			id: 'atproto-pds',
			name: 'ATProto PDS Server',
			version: '1.0.0',
			description: 'Transforms Fluxer into an AT Protocol Personal Data Server (PDS)',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'social',
			downloads: 500,
			rating: 5.0,
			installed: false,
			manifest: {},
		},
		{
			id: 'discord-decos',
			name: 'Discord Decorations',
			version: '1.0.0',
			description: 'Adds Discord-style profile decorations (avatar decorations, banners, profile effects)',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'social',
			downloads: 750,
			rating: 4.8,
			installed: false,
			manifest: {},
		},
		{
			id: 'bluesky',
			name: 'Bluesky',
			version: '1.0.0',
			description: 'Bluesky social network implementation using ATProto features',
			author: 'manikineko.nl',
			license: 'MIT',
			category: 'social',
			downloads: 300,
			rating: 4.7,
			installed: false,
			manifest: {},
		},
	];

	for (const plugin of samplePlugins) {
		availablePlugins.set(plugin.id, plugin);
		if (plugin.installed) {
			installedPlugins.add(plugin.id);
		}
	}

	console.log(`Loaded ${availablePlugins.size} plugins from catalog`);
}

async function handleShopRequest(request: {url: string; method: string}): Promise<{status: number; data: unknown}> {
	const path = request.url.replace('/api/plugins/', '');
	const segments = path.split('/').filter(Boolean);
	
	console.log(`Handling shop request: ${request.method} ${path}`);

	// Handle different API endpoints
	if (segments[0] === 'shop' || segments.length === 0) {
		if (request.method === 'GET') {
			// Get available plugins
			const category = segments[1];
			const plugins = await getAvailablePlugins(category);
			return {status: 200, data: {plugins}};
		}
	} else if (segments[0] === 'install' && segments[1]) {
		if (request.method === 'POST') {
			const success = await installPlugin(segments[1]);
			return {status: success ? 200 : 400, data: {success}};
		}
	} else if (segments[0] === 'uninstall' && segments[1]) {
		if (request.method === 'POST') {
			const success = await uninstallPlugin(segments[1]);
			return {status: success ? 200 : 400, data: {success}};
		}
	} else if (segments[0] === 'update' && segments[1]) {
		if (request.method === 'POST') {
			const success = await updatePlugin(segments[1]);
			return {status: success ? 200 : 400, data: {success}};
		}
	} else if (segments[0] === 'search' && segments[1]) {
		if (request.method === 'GET') {
			const query = segments[1];
			const plugins = await searchPlugins(query);
			return {status: 200, data: {plugins}};
		}
	} else if (segments[0] === 'categories') {
		if (request.method === 'GET') {
			const categories = await getCategories();
			return {status: 200, data: {categories}};
		}
	}

	return {status: 404, data: {error: 'Not found'}};
}

export async function getAvailablePlugins(category?: string): Promise<ShopPlugin[]> {
	let plugins = Array.from(availablePlugins.values());
	
	if (category) {
		plugins = plugins.filter(p => p.category === category);
	}
	
	return plugins.sort((a, b) => b.downloads - a.downloads);
}

export async function getPlugin(id: string): Promise<ShopPlugin | null> {
	return availablePlugins.get(id) || null;
}

export async function searchPlugins(query: string): Promise<ShopPlugin[]> {
	const lowerQuery = query.toLowerCase();
	return Array.from(availablePlugins.values()).filter(plugin =>
		plugin.name.toLowerCase().includes(lowerQuery) ||
		plugin.description.toLowerCase().includes(lowerQuery) ||
		plugin.category.toLowerCase().includes(lowerQuery)
	);
}

export async function getCategories(): Promise<string[]> {
	const categories = new Set(Array.from(availablePlugins.values()).map(p => p.category));
	return Array.from(categories).sort();
}

export async function installPlugin(id: string): Promise<boolean> {
	const plugin = availablePlugins.get(id);
	if (!plugin) {
		console.error(`Plugin not found in shop: ${id}`);
		return false;
	}

	try {
		console.log(`Installing plugin: ${plugin.name} (${id})`);
		
		// Simulate plugin download from CDN
		// In production, this would:
		// 1. Download plugin from CDN
		// 2. Extract to plugins directory
		// 3. Load and enable the plugin
		// 4. Update installed state
		
		// For now, simulate a successful installation
		await new Promise(resolve => setTimeout(resolve, 1000));
		
		installedPlugins.add(id);
		plugin.installed = true;
		plugin.downloads++;
		
		console.log(`Plugin installed: ${plugin.name}`);
		return true;
	} catch (error) {
		console.error(`Error installing plugin ${id}:`, error);
		return false;
	}
}

export async function uninstallPlugin(id: string): Promise<boolean> {
	const plugin = availablePlugins.get(id);
	if (!plugin) {
		console.error(`Plugin not found: ${id}`);
		return false;
	}

	try {
		console.log(`Uninstalling plugin: ${plugin.name} (${id})`);
		
		// Simulate plugin uninstallation
		// In production, this would:
		// 1. Disable and unload the plugin
		// 2. Remove plugin files from disk
		// 3. Update installed state
		
		// For now, simulate a successful uninstallation
		await new Promise(resolve => setTimeout(resolve, 500));
		
		installedPlugins.delete(id);
		plugin.installed = false;
		
		console.log(`Plugin uninstalled: ${plugin.name}`);
		return true;
	} catch (error) {
		console.error(`Error uninstalling plugin ${id}:`, error);
		return false;
	}
}

export async function updatePlugin(id: string): Promise<boolean> {
	const plugin = availablePlugins.get(id);
	if (!plugin) {
		console.error(`Plugin not found: ${id}`);
		return false;
	}

	if (!installedPlugins.has(id)) {
		console.error(`Plugin not installed: ${id}`);
		return false;
	}

	try {
		console.log(`Updating plugin: ${plugin.name} (${id})`);
		
		// Simulate plugin update
		// In production, this would:
		// 1. Download new version from CDN
		// 2. Replace existing plugin files
		// 3. Reload the plugin
		// 4. Update version
		
		// For now, simulate a successful update
		await new Promise(resolve => setTimeout(resolve, 1500));
		
		// Simulate version update
		const versionParts = plugin.version.split('.');
		const minorVersion = parseInt(versionParts[1] || '0') + 1;
		plugin.version = `${versionParts[0]}.${minorVersion}.${versionParts[2] || '0'}`;
		
		console.log(`Plugin updated: ${plugin.name} to v${plugin.version}`);
		return true;
	} catch (error) {
		console.error(`Error updating plugin ${id}:`, error);
		return false;
	}
}

export async function ratePlugin(id: string, rating: number): Promise<boolean> {
	const plugin = availablePlugins.get(id);
	if (!plugin) {
		console.error(`Plugin not found: ${id}`);
		return false;
	}

	if (rating < 1 || rating > 5) {
		console.error('Rating must be between 1 and 5');
		return false;
	}

	plugin.rating = (plugin.rating * plugin.downloads + rating) / (plugin.downloads + 1);
	
	console.log(`Rated plugin ${id}: ${rating}`);
	return true;
}

export async function getInstalledPlugins(): Promise<ShopPlugin[]> {
	return Array.from(availablePlugins.values()).filter(p => installedPlugins.has(p.id));
}

export async function getFeaturedPlugins(): Promise<ShopPlugin[]> {
	return Array.from(availablePlugins.values())
		.filter(p => p.rating >= 4.5)
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 5);
}
