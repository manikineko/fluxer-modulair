/*
 * Example UI Plugin for Fluxer
 * Demonstrates how plugins can hook into the UI and inject components
 */

import type {PluginUIContext, UIComponentDescriptor} from '@fluxer/plugin';

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`[Example UI Plugin] Loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`[Example UI Plugin] Enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`[Example UI Plugin] Disabled! ID: ${ctx.pluginId}`);
}

// In a real implementation, plugins would provide React components
// For this example, we'll just demonstrate the hook registration
export async function onUIComponentRegister(context: PluginUIContext): Promise<void> {
	console.log(`[Example UI Plugin] Registering UI component for ${context.pluginId}`);

	// In a real implementation, the plugin would:
	// 1. Create a React component
	// 2. Register it with the UI component registry
	// 3. Provide it to the context

	// Example of what the component descriptor would look like:
	const component: UIComponentDescriptor = {
		id: `${context.pluginId}-example-component`,
		name: 'Example Component',
		component: null, // Would be the actual React component
		location: 'settings',
		priority: 100,
		props: {},
	};

	// Call the register function provided by the context
	context.registerComponent();

	console.log('[Example UI Plugin] Component registered successfully');
}

export async function onUIComponentUnregister(componentId: string): Promise<void> {
	console.log(`[Example UI Plugin] Unregistering UI component: ${componentId}`);
	// Clean up the component
}

