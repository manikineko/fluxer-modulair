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

// Guilded Channel Types Plugin
// Ports Guilded's channel types to Fluxer's plugin system
// Note: Guilded has shut down, but these channel types are preserved for compatibility

// Guilded channel type definitions
const GuildedTextChannel = {
	id: 'guilded-text',
	name: 'Text Channel',
	icon: '#',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
};

const GuildedVoiceChannel = {
	id: 'guilded-voice',
	name: 'Voice Channel',
	icon: '🔊',
	category: 'voice' as const,
	supportsMessages: false,
	supportsVoice: true,
	botAccessible: true,
	userAccessible: true,
};

const GuildedAnnouncementChannel = {
	id: 'guilded-announcement',
	name: 'Announcement',
	icon: '📢',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
};

const GuildedForumChannel = {
	id: 'guilded-forum',
	name: 'Forum',
	icon: '📋',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
};

const GuildedDocsChannel = {
	id: 'guilded-docs',
	name: 'Docs',
	icon: '📄',
	category: 'text' as const,
	supportsMessages: false,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	// Docs channels support rich text documents
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render document editor/viewer
		return null;
	},
};

const GuildedListChannel = {
	id: 'guilded-list',
	name: 'List',
	icon: '📝',
	category: 'text' as const,
	supportsMessages: false,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	// List channels support task lists
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render task list UI
		return null;
	},
};

const GuildedCalendarChannel = {
	id: 'guilded-calendar',
	name: 'Calendar',
	icon: '📅',
	category: 'text' as const,
	supportsMessages: false,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	// Calendar channels support event scheduling
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render calendar UI
		return null;
	},
};

const GuildedMediaChannel = {
	id: 'guilded-media',
	name: 'Media',
	icon: '🖼️',
	category: 'text' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	// Media channels focus on image/video sharing
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render media gallery
		return null;
	},
};

const GuildedStreamingChannel = {
	id: 'guilded-streaming',
	name: 'Streaming',
	icon: '📺',
	category: 'voice' as const,
	supportsMessages: false,
	supportsVoice: true,
	botAccessible: true,
	userAccessible: true,
	
	// Streaming channels support live streaming
	renderChannelView: (props: Record<string, unknown>) => {
		// Would render streaming UI
		return null;
	},
};

// Guilded custom message types
const GuildedDocMessageType = {
	id: 'guilded-doc',
	name: 'Document',
	icon: '📄',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.guilded.doc',
		name: 'Document',
		schema: {
			type: 'object',
			properties: {
				title: {type: 'string'},
				content: {type: 'string'},
				format: {type: 'string'}, // markdown, html, etc.
				parentId: {type: 'string'},
			},
			required: ['title', 'content'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.title && content.content);
	},
};

const GuildedListItemMessageType = {
	id: 'guilded-list-item',
	name: 'List Item',
	icon: '✅',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.guilded.list',
		name: 'ListItem',
		schema: {
			type: 'object',
			properties: {
				message: {type: 'string'},
				completed: {type: 'boolean'},
				assignedTo: {type: 'string'},
				dueDate: {type: 'string'},
			},
			required: ['message'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.message);
	},
};

const GuildedEventMessageType = {
	id: 'guilded-event',
	name: 'Event',
	icon: '📅',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.guilded.event',
		name: 'Event',
		schema: {
			type: 'object',
			properties: {
				title: {type: 'string'},
				description: {type: 'string'},
				startsAt: {type: 'string'},
				endsAt: {type: 'string'},
				location: {type: 'string'},
				reminder: {type: 'string'},
			},
			required: ['title', 'startsAt'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.title && content.startsAt);
	},
};

// UI Component for Guilded channel type selector
const GuildedChannelTypeSelector = (React: unknown) => {
	const R = React as {createElement: (...args: Array<unknown>) => unknown};
	
	return function ChannelTypeSelector(props: Record<string, unknown>) {
		const channelTypes = [
			{id: 'text', name: 'Text Channel', icon: '#', description: 'Send text messages and files'},
			{id: 'voice', name: 'Voice Channel', icon: '🔊', description: 'Voice chat with screen share'},
			{id: 'announcement', name: 'Announcement', icon: '📢', description: 'Send announcements to members'},
			{id: 'forum', name: 'Forum', icon: '📋', description: 'Organized discussion with posts'},
			{id: 'docs', name: 'Docs', icon: '📄', description: 'Create and edit documents'},
			{id: 'list', name: 'List', icon: '📝', description: 'Task lists and todo items'},
			{id: 'calendar', name: 'Calendar', icon: '📅', description: 'Schedule events and reminders'},
			{id: 'media', name: 'Media', icon: '🖼️', description: 'Share images and videos'},
			{id: 'streaming', name: 'Streaming', icon: '📺', description: 'Live streaming channels'},
		];
		
		return R.createElement('div', {style: {padding: '16px'}},
			R.createElement('h3', {style: {fontSize: '16px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '12px'}}, 'Guilded Channel Types'),
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
								background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
	console.log(`Guilded Types plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerUIComponent: (component: {id: string; name: string; component: unknown; location: string; priority: number; props?: Record<string, unknown>}) => void}};
	console.log(`Guilded Types plugin enabled! ID: ${ctx.pluginId}`);
	
	// Register channel type selector
	ctx.api.registerUIComponent({
		id: 'guilded-channel-selector',
		name: 'Guilded Channel Types',
		component: GuildedChannelTypeSelector,
		location: 'channel_create',
		priority: 45,
		props: {},
	});
	
	// Register Guilded channel types
	console.log('Registered Guilded channel types:', {
		text: GuildedTextChannel,
		voice: GuildedVoiceChannel,
		announcement: GuildedAnnouncementChannel,
		forum: GuildedForumChannel,
		docs: GuildedDocsChannel,
		list: GuildedListChannel,
		calendar: GuildedCalendarChannel,
		media: GuildedMediaChannel,
		streaming: GuildedStreamingChannel,
	});
	
	// Register Guilded message types
	console.log('Registered Guilded message types:', {
		doc: GuildedDocMessageType,
		listItem: GuildedListItemMessageType,
		event: GuildedEventMessageType,
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Guilded Types plugin disabled! ID: ${ctx.pluginId}`);
}

// Export for use by channel type system
export {
	GuildedTextChannel,
	GuildedVoiceChannel,
	GuildedAnnouncementChannel,
	GuildedForumChannel,
	GuildedDocsChannel,
	GuildedListChannel,
	GuildedCalendarChannel,
	GuildedMediaChannel,
	GuildedStreamingChannel,
	GuildedDocMessageType,
	GuildedListItemMessageType,
	GuildedEventMessageType,
};
