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

interface DynamicPlugin {
	id: string;
	source: string;
	version: string;
	loaded: boolean;
	enabled: boolean;
	manifest: unknown;
}

const dynamicPlugins: Map<string, DynamicPlugin> = new Map();
const pluginDirectory = './plugins';

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Dynamic Plugin Loader loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Dynamic Plugin Loader enabled! ID: ${ctx.pluginId}`);
	await scanPlugins();
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Dynamic Plugin Loader disabled! ID: ${ctx.pluginId}`);
}

async function scanPlugins(): Promise<void> {
	console.log('Scanning plugins directory...');
	
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const fs = await import('fs');
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const path = await import('path');
		
		const {readdirSync, existsSync} = fs;
		const {join} = path;
		
		if (!existsSync(pluginDirectory)) {
			console.log(`Plugin directory does not exist: ${pluginDirectory}`);
			return;
		}

		const entries = readdirSync(pluginDirectory, {withFileTypes: true});
		
		for (const entry of entries) {
			if (entry.isDirectory()) {
				const pluginPath = join(pluginDirectory, entry.name);
				const manifestPath = join(pluginPath, 'manifest.json');
				
				if (existsSync(manifestPath)) {
					await registerPlugin(entry.name, pluginPath, manifestPath);
				}
			}
		}
		
		console.log(`Scanned ${dynamicPlugins.size} plugins`);
	} catch (error) {
		console.error('Error scanning plugins (file system not available in this environment):', error);
		// In non-Node.js environments, skip filesystem scanning
	}
}

async function registerPlugin(pluginId: string, pluginPath: string, manifestPath: string): Promise<void> {
	try {
		const {readFile} = await import('fs/promises');
		const manifestContent = await readFile(manifestPath, 'utf-8');
		const manifest = JSON.parse(manifestContent);
		
		const plugin: DynamicPlugin = {
			id: pluginId,
			source: pluginPath,
			version: manifest.version || '1.0.0',
			loaded: false,
			enabled: false,
			manifest,
		};
		
		dynamicPlugins.set(pluginId, plugin);
		console.log(`Registered plugin: ${pluginId} v${plugin.version}`);
	} catch (error) {
		console.error(`Error registering plugin ${pluginId}:`, error);
	}
}

export async function loadPlugin(pluginId: string): Promise<boolean> {
	const plugin = dynamicPlugins.get(pluginId);
	if (!plugin) {
		console.error(`Plugin not found: ${pluginId}`);
		return false;
	}

	try {
		const pluginPath = `${plugin.source}/index.ts`;
		
		console.log(`Loading plugin: ${pluginId}`);
		
		// Implement actual dynamic import
		// In production, this would:
		// 1. Use dynamic import() to load the plugin module
		// 2. Execute the plugin's onLoad hook
		// 3. Store the loaded module for later use
		// 4. Handle import errors and validation
		
		// For now, simulate dynamic import
		await new Promise(resolve => setTimeout(resolve, 200));
		
		// Simulate calling onLoad hook
		if (plugin.hooks?.onLoad) {
			const context = {pluginId, version: plugin.version, environment: 'development' as const};
			await plugin.hooks.onLoad(context);
		}
		
		plugin.loaded = true;
		
		console.log(`Plugin loaded: ${pluginId}`);
		return true;
	} catch (error) {
		console.error(`Error loading plugin ${pluginId}:`, error);
		return false;
	}
}

export async function unloadPlugin(pluginId: string): Promise<boolean> {
	const plugin = dynamicPlugins.get(pluginId);
	if (!plugin) {
		console.error(`Plugin not found: ${pluginId}`);
		return false;
	}

	try {
		console.log(`Unloading plugin: ${pluginId}`);
		
		// Implement actual unload logic
		// In production, this would:
		// 1. Call the plugin's onUnload hook
		// 2. Clear references to the loaded module
		// 3. Clean up any event listeners or resources
		// 4. Remove from module cache if needed
		
		// For now, simulate unload
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Simulate calling onUnload hook
		if (plugin.hooks?.onUnload) {
			const context = {pluginId, version: plugin.version, environment: 'development' as const};
			await plugin.hooks.onUnload(context);
		}
		
		plugin.loaded = false;
		plugin.enabled = false;
		
		console.log(`Plugin unloaded: ${pluginId}`);
		return true;
	} catch (error) {
		console.error(`Error unloading plugin ${pluginId}:`, error);
		return false;
	}
}

export async function enablePlugin(pluginId: string): Promise<boolean> {
	const plugin = dynamicPlugins.get(pluginId);
	if (!plugin) {
		console.error(`Plugin not found: ${pluginId}`);
		return false;
	}

	if (!plugin.loaded) {
		const loaded = await loadPlugin(pluginId);
		if (!loaded) return false;
	}

	try {
		console.log(`Enabling plugin: ${pluginId}`);
		
		// Call plugin's onEnable hook
		if (plugin.hooks?.onEnable) {
			const context = {pluginId, version: plugin.version, environment: 'development' as const};
			await plugin.hooks.onEnable(context);
		}
		
		plugin.enabled = true;
		
		console.log(`Plugin enabled: ${pluginId}`);
		return true;
	} catch (error) {
		console.error(`Error enabling plugin ${pluginId}:`, error);
		return false;
	}
}

export async function disablePlugin(pluginId: string): Promise<boolean> {
	const plugin = dynamicPlugins.get(pluginId);
	if (!plugin) {
		console.error(`Plugin not found: ${pluginId}`);
		return false;
	}

	try {
		console.log(`Disabling plugin: ${pluginId}`);
		
		// Call plugin's onDisable hook
		if (plugin.hooks?.onDisable) {
			const context = {pluginId, version: plugin.version, environment: 'development' as const};
			await plugin.hooks.onDisable(context);
		}
		
		plugin.enabled = false;
		
		console.log(`Plugin disabled: ${pluginId}`);
		return true;
	} catch (error) {
		console.error(`Error disabling plugin ${pluginId}:`, error);
		return false;
	}
}

export async function reloadPlugin(pluginId: string): Promise<boolean> {
	const plugin = dynamicPlugins.get(pluginId);
	if (!plugin) {
		console.error(`Plugin not found: ${pluginId}`);
		return false;
	}

	console.log(`Reloading plugin: ${pluginId}`);
	
	await disablePlugin(pluginId);
	await unloadPlugin(pluginId);
	
	// Re-register plugin
	await registerPlugin(plugin.id, plugin.source, `${plugin.source}/manifest.json`);
	
	await loadPlugin(pluginId);
	await enablePlugin(pluginId);
	
	console.log(`Plugin reloaded: ${pluginId}`);
	return true;
}

export async function listPlugins(): Promise<DynamicPlugin[]> {
	return Array.from(dynamicPlugins.values());
}

export async function getPlugin(pluginId: string): Promise<DynamicPlugin | null> {
	return dynamicPlugins.get(pluginId) || null;
}

export async function installPlugin(source: string): Promise<boolean> {
	console.log(`Installing plugin from: ${source}`);
	
	// Implement plugin download and installation
	// In production, this would:
	// 1. Download plugin from source (URL or local path)
	// 2. Extract plugin files to plugins directory
	// 3. Load and parse manifest.json
	// 4. Register the plugin in the dynamic loader
	// 5. Validate plugin structure and dependencies
	
	// For now, simulate installation
	try {
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log(`[DynamicLoader] Plugin installed from: ${source}`);
		return true;
	} catch (error) {
		console.error(`Error installing plugin from ${source}:`, error);
		return false;
	}
}

export async function removePlugin(pluginId: string): Promise<boolean> {
	const plugin = dynamicPlugins.get(pluginId);
	if (!plugin) {
		console.error(`Plugin not found: ${pluginId}`);
		return false;
	}

	await disablePlugin(pluginId);
	await unloadPlugin(pluginId);
	
	dynamicPlugins.delete(pluginId);
	
	console.log(`Plugin removed: ${pluginId}`);
	return true;
}
