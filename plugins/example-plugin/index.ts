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
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string; api: {registerUIComponent: (component: unknown) => void}};
	console.log(`Example plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);

	// Register a UI component (button) in the admin sidebar
	ctx.api.registerUIComponent({
		id: 'example-button',
		name: 'Example Button',
		component: 'Button',
		location: 'sidebar',
		priority: 100,
		props: {
			label: 'Click Me',
			onClick: () => {
				console.log('Example button clicked!');
				alert('Example button clicked!');
			},
		},
	});
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerUIComponent: (component: unknown) => void}};
	console.log(`Example plugin enabled! ID: ${ctx.pluginId}`);

	// Re-register UI components when plugin is enabled
	ctx.api.registerUIComponent({
		id: 'example-button',
		name: 'Example Button',
		component: 'Button',
		location: 'sidebar',
		priority: 100,
		props: {
			label: 'Click Me',
			onClick: () => {
				console.log('Example button clicked!');
				alert('Example button clicked!');
			},
		},
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {unregisterUIComponent: (componentId: string) => void}};
	console.log(`Example plugin disabled! ID: ${ctx.pluginId}`);

	// Unregister UI components when plugin is disabled
	ctx.api.unregisterUIComponent('example-button');
}
