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

interface SlashCommandOption {
	name: string;
	description: string;
	type: 'string' | 'number' | 'boolean' | 'user' | 'channel' | 'role' | 'attachment' | 'mentionable' | 'message_type' | 'channel_type';
	required: boolean;
	choices?: Array<{name: string; value: string}>;
	channelTypes?: string[]; // Restrict to specific channel types
}

interface SlashCommandContext {
	userId: string;
	channelId: string;
	channelType: string;
	isBot: boolean;
	guildId?: string;
	messageId?: string;
}

interface SlashCommand {
	name: string;
	description: string;
	category?: string; // For organizing commands
	options?: SlashCommandOption[];
	handler: (params: Record<string, unknown>, context: SlashCommandContext) => Promise<{success: boolean; data?: unknown; error?: string}>;
	botOnly?: boolean; // If true, only bots can use this command
	userOnly?: boolean; // If true, only users can use this command
	allowedChannelTypes?: string[]; // Restrict to specific channel types
	allowedMessageTypes?: string[]; // Can be used with specific message types
}

const commands: Map<string, SlashCommand> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Slash Commands plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
	await registerDefaultCommands();
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Slash Commands plugin enabled! ID: ${ctx.pluginId}`);
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Slash Commands plugin disabled! ID: ${ctx.pluginId}`);
}

export async function onRequest(context: unknown): Promise<void> {
	const ctx = context as {request: {url: string; method: string; body?: unknown}};
	if (ctx.request.url?.startsWith('/api/slash/')) {
		await handleSlashCommand(ctx.request);
	}
}

async function registerDefaultCommands(): Promise<void> {
	// Register default slash commands
	await registerCommand({
		name: 'help',
		description: 'Show available commands',
		category: 'general',
		handler: async (_params, context) => {
			const commandList = Array.from(commands.values()).map(cmd => ({
				name: cmd.name,
				description: cmd.description,
				category: cmd.category,
			}));
			return {
				success: true,
				data: {
					commands: commandList,
					message: `Available commands: ${commandList.map(c => c.name).join(', ')}`,
				},
			};
		},
	});

	await registerCommand({
		name: 'ping',
		description: 'Check if the bot is responding',
		category: 'general',
		handler: async () => {
			return {
				success: true,
				data: {message: 'Pong!'},
			};
		},
	});

	await registerCommand({
		name: 'echo',
		description: 'Echo back a message',
		category: 'general',
		options: [
			{
				name: 'message',
				description: 'The message to echo',
				type: 'string',
				required: true,
			},
		],
		handler: async (params) => {
			return {
				success: true,
				data: {message: params.message},
			};
		},
	});

	await registerCommand({
		name: 'status',
		description: 'Show system status',
		category: 'general',
		handler: async () => {
			return {
				success: true,
				data: {
					status: 'online',
					uptime: Date.now(),
					timestamp: new Date().toISOString(),
				},
			};
		},
	});

	// Channel type specific commands
	await registerCommand({
		name: 'create-channel',
		description: 'Create a new channel',
		category: 'channels',
		options: [
			{
				name: 'name',
				description: 'Channel name',
				type: 'string',
				required: true,
			},
			{
				name: 'type',
				description: 'Channel type',
				type: 'channel_type',
				required: false,
				choices: [
					{name: 'Text', value: 'text'},
					{name: 'Voice', value: 'voice'},
					{name: 'Announcement', value: 'announcement'},
					{name: 'Forum', value: 'forum'},
					{name: 'Stage', value: 'stage'},
					{name: 'Bluesky Feed', value: 'bluesky-feed'},
					{name: 'SSR Render', value: 'ssr-render'},
				],
			},
		],
		handler: async (params, context) => {
			return {
				success: true,
				data: {
					channelName: params.name,
					channelType: params.type || 'text',
					createdBy: context.userId,
				},
			};
		},
	});

	// Message type specific commands
	await registerCommand({
		name: 'send-custom',
		description: 'Send a custom message type',
		category: 'messages',
		options: [
			{
				name: 'type',
				description: 'Message type',
				type: 'message_type',
				required: true,
				choices: [
					{name: 'Poll', value: 'poll'},
					{name: 'Embed', value: 'embed'},
					{name: 'Code', value: 'code'},
					{name: 'Lexicon', value: 'lexicon'},
				],
			},
			{
				name: 'content',
				description: 'Message content',
				type: 'string',
				required: true,
			},
		],
		handler: async (params, context) => {
			return {
				success: true,
				data: {
					messageType: params.type,
					content: params.content,
					sentBy: context.userId,
					channelId: context.channelId,
				},
			};
		},
	});

	// Bot-specific commands
	await registerCommand({
		name: 'bot-status',
		description: 'Set bot status (bot only)',
		category: 'bot',
		botOnly: true,
		options: [
			{
				name: 'status',
				description: 'Bot status',
				type: 'string',
				required: false,
				choices: [
					{name: 'Online', value: 'online'},
					{name: 'Idle', value: 'idle'},
					{name: 'Do Not Disturb', value: 'dnd'},
					{name: 'Invisible', value: 'invisible'},
				],
			},
		],
		handler: async (params, context) => {
			return {
				success: true,
				data: {
					status: params.status || 'online',
					botId: context.userId,
				},
			};
		},
	});

	console.log(`Registered ${commands.size} slash commands`);
}

async function handleSlashCommand(request: {url: string; method: string; body?: unknown}): Promise<void> {
	const commandName = request.url.replace('/api/slash/', '');
	const command = commands.get(commandName);
	
	if (!command) {
		console.error(`Slash command not found: ${commandName}`);
		return;
	}

	const body = request.body as Record<string, unknown> | undefined;
	const params = body?.params as Record<string, unknown> || {};
	const context = body?.context as SlashCommandContext || {
		userId: 'unknown',
		channelId: 'unknown',
		channelType: 'text',
		isBot: false,
	};
	
	// Check if command is restricted to bots or users
	if (command.botOnly && !context.isBot) {
		console.error(`Command ${commandName} is bot-only`);
		return;
	}
	
	if (command.userOnly && context.isBot) {
		console.error(`Command ${commandName} is user-only`);
		return;
	}
	
	// Check if command is restricted to specific channel types
	if (command.allowedChannelTypes && !command.allowedChannelTypes.includes(context.channelType)) {
		console.error(`Command ${commandName} is not allowed in channel type ${context.channelType}`);
		return;
	}
	
	try {
		const result = await command.handler(params, context);
		if (result.success) {
			console.log(`Slash command executed: ${commandName}`);
		} else {
			console.error(`Slash command failed: ${commandName}`, result.error);
		}
	} catch (error) {
		console.error(`Slash command error: ${commandName}`, error);
	}
}

export async function registerCommand(command: SlashCommand): Promise<void> {
	commands.set(command.name, command);
	console.log(`Registered slash command: ${command.name}`);
}

export async function unregisterCommand(name: string): Promise<void> {
	commands.delete(name);
	console.log(`Unregistered slash command: ${name}`);
}

export async function getCommand(name: string): Promise<SlashCommand | null> {
	return commands.get(name) || null;
}

export async function listCommands(): Promise<SlashCommand[]> {
	return Array.from(commands.values());
}

export async function listCommandsByCategory(category: string): Promise<SlashCommand[]> {
	return Array.from(commands.values()).filter(cmd => cmd.category === category);
}

export async function listCommandsForChannelType(channelType: string): Promise<SlashCommand[]> {
	return Array.from(commands.values()).filter(cmd => 
		!cmd.allowedChannelTypes || cmd.allowedChannelTypes.includes(channelType)
	);
}

export async function listCommandsForUser(isBot: boolean): Promise<SlashCommand[]> {
	return Array.from(commands.values()).filter(cmd => 
		!(cmd.botOnly && !isBot) && !(cmd.userOnly && isBot)
	);
}
