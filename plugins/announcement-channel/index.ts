/*
 * MIT License
 *
 * Copyright (c) 2026 Fluxer Contributors
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

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Announcement Channel plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerChannelType: (channelType: {id: string; name: string; description: string; icon: string; component: any}) => void}};
	console.log(`Announcement Channel plugin enabled! ID: ${ctx.pluginId}`);

	// Register the announcement channel type
	// The component will be provided by the main app's ChannelTypeInitializer
	ctx.api.registerChannelType({
		id: 'GUILD_ANNOUNCEMENT',
		name: 'Announcement',
		description: 'Official announcement channel with prominent banner',
		icon: 'megaphone',
		component: null, // Component provided by main app
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {unregisterChannelType: (channelTypeId: string) => void}};
	console.log(`Announcement Channel plugin disabled! ID: ${ctx.pluginId}`);

	// Unregister the announcement channel type
	ctx.api.unregisterChannelType('GUILD_ANNOUNCEMENT');
}
