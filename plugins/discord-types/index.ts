/*
 * Copyright (C) 2026 Fluxer Contributors
 *
 * This file is part of Fluxer.
 *
 * Fluxer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Fluxer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Fluxer. If not, see <https://www.gnu.org/licenses/>.
 */

// Discord Channel Types Plugin
// Ports Discord's channel types to Fluxer's plugin system

// Discord channel type definitions
const DiscordTextChannel = {
	id: 'discord-text',
	name: 'Text Channel',
	icon: '#',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
};

const DiscordVoiceChannel = {
	id: 'discord-voice',
	name: 'Voice Channel',
	icon: '🔊',
	category: 'voice' as const,
	supportsMessages: false,
	supportsVoice: true,
	botAccessible: true,
	userAccessible: true,
};

const DiscordAnnouncementChannel = {
	id: 'discord-announcement',
	name: 'Announcement Channel',
	icon: '📢',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	// Announcement channels have special permissions
	requiredPermissions: ['SEND_MESSAGES', 'MENTION_EVERYONE'],
	
	// Announcement channels support following
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render announcement-specific UI
		return null;
	},
};

const DiscordForumChannel = {
	id: 'discord-forum',
	name: 'Forum Channel',
	icon: '📋',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	// Forum channels support posts as threads
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render forum-specific UI with post creation
		return null;
	},
};

const DiscordStageChannel = {
	id: 'discord-stage',
	name: 'Stage Channel',
	icon: '🎤',
	category: 'voice' as const,
	supportsMessages: false,
	supportsVoice: true,
	botAccessible: true,
	userAccessible: true,
	
	// Stage channels support speakers and audience
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render stage-specific UI
		return null;
	},
};

// Discord custom message types
const DiscordEmbedMessageType = {
	id: 'discord-embed',
	name: 'Discord Embed',
	icon: '🔗',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.discord.embed',
		name: 'Embed',
		schema: {
			type: 'object',
			properties: {
				title: {type: 'string'},
				description: {type: 'string'},
				url: {type: 'string'},
				color: {type: 'number'},
				fields: {type: 'array', items: {type: 'object'}},
				thumbnail: {type: 'object'},
				image: {type: 'object'},
				footer: {type: 'object'},
				timestamp: {type: 'string'},
			},
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.title || content.description);
	},
};

const DiscordSlashCommandMessageType = {
	id: 'discord-slash-command',
	name: 'Slash Command',
	icon: '⚡',
	userAccessible: false, // Bots only
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.discord.slash',
		name: 'SlashCommand',
		schema: {
			type: 'object',
			properties: {
				name: {type: 'string'},
				options: {type: 'array', items: {type: 'object'}},
				guildId: {type: 'string'},
			},
			required: ['name'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.name);
	},
};

const DiscordReactionMessageType = {
	id: 'discord-reaction',
	name: 'Reaction',
	icon: '😀',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.discord.reaction',
		name: 'Reaction',
		schema: {
			type: 'object',
			properties: {
				emoji: {type: 'string'},
				animated: {type: 'boolean'},
				messageId: {type: 'string'},
			},
			required: ['emoji', 'messageId'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.emoji && content.messageId);
	},
};

// UI Component for Discord channel type selector
const DiscordChannelTypeSelector = (React: unknown) => {
	const R = React as {createElement: (...args: Array<unknown>) => unknown};
	
	return function ChannelTypeSelector(props: Record<string, unknown>) {
		const channelTypes = [
			{id: 'text', name: 'Text Channel', icon: '#', description: 'Send text messages and files'},
			{id: 'voice', name: 'Voice Channel', icon: '🔊', description: 'Voice chat with screen share'},
			{id: 'announcement', name: 'Announcement', icon: '📢', description: 'Send announcements to followers'},
			{id: 'forum', name: 'Forum', icon: '📋', description: 'Organized discussion with posts'},
			{id: 'stage', name: 'Stage Channel', icon: '🎤', description: 'Voice channels for events'},
		];
		
		return R.createElement('div', {style: {padding: '16px'}},
			R.createElement('h3', {style: {fontSize: '16px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '12px'}}, 'Select Channel Type'),
			...channelTypes.map((type) =>
				R.createElement('div', {
					key: type.id,
					style: {
						padding: '12px',
						background: 'var(--background-secondary)',
						border: '1px solid var(--background-modifier-accent)',
						borderRadius: '8px',
						marginBottom: '8px',
						cursor: 'pointer',
						transition: 'all 0.15s ease',
					}
				},
					R.createElement('div', {style: {display: 'flex', alignItems: 'center', gap: '12px'}},
						R.createElement('div', {
							style: {
								width: '40px',
								height: '40px',
								borderRadius: '8px',
								background: 'var(--brand-experiment)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: 'white',
								fontSize: '20px',
								fontWeight: 700,
							}
						}, type.icon),
						R.createElement('div', {style: {flex: 1}},
							R.createElement('div', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)'}}, type.name),
							R.createElement('div', {style: {fontSize: '12px', color: 'var(--text-muted)'}}, type.description)
						)
					)
				)
			)
		);
	};
};

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Discord Types plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerUIComponent: (component: {id: string; name: string; component: unknown; location: string; priority: number; props?: Record<string, unknown>}) => void}};
	console.log(`Discord Types plugin enabled! ID: ${ctx.pluginId}`);
	
	// Register channel type selector
	ctx.api.registerUIComponent({
		id: 'discord-channel-selector',
		name: 'Discord Channel Types',
		component: DiscordChannelTypeSelector,
		location: 'channel_create',
		priority: 50,
		props: {},
	});
	
	// Register Discord channel types
	console.log('Registered Discord channel types:', {
		text: DiscordTextChannel,
		voice: DiscordVoiceChannel,
		announcement: DiscordAnnouncementChannel,
		forum: DiscordForumChannel,
		stage: DiscordStageChannel,
	});
	
	// Register Discord message types
	console.log('Registered Discord message types:', {
		embed: DiscordEmbedMessageType,
		slashCommand: DiscordSlashCommandMessageType,
		reaction: DiscordReactionMessageType,
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Discord Types plugin disabled! ID: ${ctx.pluginId}`);
}

// Export for use by channel type system
export {
	DiscordTextChannel,
	DiscordVoiceChannel,
	DiscordAnnouncementChannel,
	DiscordForumChannel,
	DiscordStageChannel,
	DiscordEmbedMessageType,
	DiscordSlashCommandMessageType,
	DiscordReactionMessageType,
};
