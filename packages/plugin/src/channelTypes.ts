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

// Plugin-based Channel Type System
// Allows plugins to register custom channel types with custom behavior

export interface ChannelTypePlugin {
	// Unique identifier for this channel type
	id: string;
	
	// Display name
	name: string;
	
	// Icon for the channel type (emoji or icon name)
	icon: string;
	
	// Category of channel type (text, voice, etc.)
	category: 'text' | 'voice' | 'feed' | 'ssr' | 'custom';
	
	// Whether this channel type supports messages
	supportsMessages: boolean;
	
	// Whether this channel type supports voice
	supportsVoice: boolean;
	
	// Whether bots can use this channel type
	botAccessible: boolean;
	
	// Whether users can use this channel type
	userAccessible: boolean;
	
	// Render function for the channel view
	renderChannelView?: (props: ChannelViewProps) => React.ReactNode;
	
	// Render function for custom message types
	renderMessage?: (props: MessageRenderProps) => React.ReactNode;
	
	// Handler for sending messages
	handleSendMessage?: (content: string, metadata?: Record<string, unknown>) => Promise<void>;
	
	// Handler for receiving messages
	handleReceiveMessage?: (message: Record<string, unknown>) => void;
	
	// Custom settings panel for this channel type
	renderSettings?: (props: ChannelSettingsProps) => React.ReactNode;
	
	// Validation for channel creation
	validateChannel?: (data: Record<string, unknown>) => boolean;
	
	// Permissions required for this channel type
	requiredPermissions?: Array<string>;
	
	// Bot-specific permissions
	botPermissions?: Array<string>;
	
	// SSR configuration (if this is an SSR channel)
	ssrConfig?: SSRConfig;
	
	// Lexicon support (if this channel supports AT Protocol lexicons)
	lexiconSupport?: LexiconSupport;
}

export interface ChannelViewProps {
	channelId: string;
	channelData: Record<string, unknown>;
	messages: Array<Record<string, unknown>>;
	onSendMessage: (content: string, metadata?: Record<string, unknown>) => Promise<void>;
	onMessageUpdate: (messageId: string, updates: Record<string, unknown>) => void;
}

export interface MessageRenderProps {
	message: Record<string, unknown>;
	channelId: string;
	onReply: () => void;
	onReact: (emoji: string) => void;
	onQuote: () => void;
}

export interface ChannelSettingsProps {
	channelId: string;
	channelData: Record<string, unknown>;
	onUpdate: (data: Record<string, unknown>) => void;
}

export interface SSRConfig {
	// Whether this channel uses SSR rendering
	enabled: boolean;
	
	// Sandbox configuration
	sandbox: {
		// Allowed origins for iframes
		allowedOrigins: Array<string>;
		
		// Whether to allow localStorage access
		allowLocalStorage: boolean;
		
		// Whether to allow cookie access
		allowCookies: boolean;
		
		// Whether to allow user media access
		allowUserMedia: boolean;
		
		// CSP policy for the sandbox
		contentSecurityPolicy?: string;
	};
	
	// Custom record type for SSR rendering
	customRecordType?: {
		// Record namespace (e.g., app.bsky.feed.post)
		namespace: string;
		// Record name
		name: string;
		// Schema for the record
		schema: Record<string, unknown>;
		// Render function for the record
		render: (record: Record<string, unknown>) => React.ReactNode;
	};
}

export interface LexiconSupport {
	// Whether this channel supports AT Protocol lexicons
	enabled: boolean;
	
	// Supported lexicon namespaces
	supportedLexicons: Array<string>;
	
	// Handler for lexicon records
	handleLexiconRecord?: (lexicon: string, record: Record<string, unknown>) => void;
	
	// Render function for lexicon records
	renderLexiconRecord?: (lexicon: string, record: Record<string, unknown>) => React.ReactNode;
}

// Custom message type support
export interface CustomMessageType {
	// Unique identifier for this message type
	id: string;
	
	// Display name
	name: string;
	
	// Icon for the message type
	icon: string;
	
	// Whether this message type can be used by users
	userAccessible: boolean;
	
	// Whether this message type can be used by bots
	botAccessible: boolean;
	
	// Custom record schema (if this message type uses AT Protocol records)
	recordSchema?: {
		namespace: string;
		name: string;
		schema: Record<string, unknown>;
	};
	
	// Render function for this message type
	renderMessage?: (props: MessageRenderProps) => React.ReactNode;
	
	// Validation function for message content
	validateContent?: (content: Record<string, unknown>) => boolean;
	
	// Handler for sending this message type
	handleSend?: (content: Record<string, unknown>) => Promise<void>;
}

// Registry for custom message types
class CustomMessageTypeRegistry {
	private types = new Map<string, CustomMessageType>();
	
	register(type: CustomMessageType): void {
		this.types.set(type.id, type);
	}
	
	unregister(id: string): void {
		this.types.delete(id);
	}
	
	get(id: string): CustomMessageType | undefined {
		return this.types.get(id);
	}
	
	getAll(): Array<CustomMessageType> {
		return Array.from(this.types.values());
	}
	
	getUserAccessible(): Array<CustomMessageType> {
		return Array.from(this.types.values()).filter(t => t.userAccessible);
	}
	
	getBotAccessible(): Array<CustomMessageType> {
		return Array.from(this.types.values()).filter(t => t.botAccessible);
	}
}

export const customMessageTypeRegistry = new CustomMessageTypeRegistry();

// Registry for channel type plugins
class ChannelTypeRegistry {
	private plugins = new Map<string, ChannelTypePlugin>();
	
	register(plugin: ChannelTypePlugin): void {
		this.plugins.set(plugin.id, plugin);
	}
	
	unregister(id: string): void {
		this.plugins.delete(id);
	}
	
	get(id: string): ChannelTypePlugin | undefined {
		return this.plugins.get(id);
	}
	
	getAll(): Array<ChannelTypePlugin> {
		return Array.from(this.plugins.values());
	}
	
	getByCategory(category: ChannelTypePlugin['category']): Array<ChannelTypePlugin> {
		return Array.from(this.plugins.values()).filter(p => p.category === category);
	}
}

export const channelTypeRegistry = new ChannelTypeRegistry();

// Server Type Plugin System
// Allows plugins to register custom server types for cross-instance and platform integration

export interface ServerTypePlugin {
	// Unique identifier for this server type
	id: string;
	
	// Display name
	name: string;
	
	// Description of this server type
	description: string;
	
	// Icon for the server type (emoji, icon name, or SVG path)
	icon: string;
	
	// Icon type: 'emoji', 'lucide', 'custom-svg', 'image-url'
	iconType: 'emoji' | 'lucide' | 'custom-svg' | 'image-url';
	
	// Category of server type
	category: 'fluxer' | 'discord' | 'matrix' | 'xmpp' | 'bluesky' | 'mastodon' | 'custom';
	
	// Whether this server type supports federation
	supportsFederation: boolean;
	
	// Whether this server type supports real-time communication
	supportsRealtime: boolean;
	
	// Whether this server type supports message history
	supportsHistory: boolean;
	
	// Whether this server type supports voice/video
	supportsVoice: boolean;
	
	// Whether this server type supports file sharing
	supportsFiles: boolean;
	
	// Configuration schema for this server type
	configSchema?: Record<string, unknown>;
	
	// Validation function for server configuration
	validateConfig?: (config: Record<string, unknown>) => boolean;
	
	// Handler for connecting to this server type
	handleConnect?: (config: Record<string, unknown>) => Promise<void>;
	
	// Handler for disconnecting from this server type
	handleDisconnect?: () => Promise<void>;
	
	// Handler for syncing data from this server type
	handleSync?: () => Promise<void>;
	
	// Custom settings panel for this server type
	renderSettings?: (props: ServerSettingsProps) => React.ReactNode;
	
	// Permissions required for this server type
	requiredPermissions?: Array<string>;
	
	// API endpoints provided by this server type
	apiEndpoints?: Array<{
		method: 'GET' | 'POST' | 'PUT' | 'DELETE';
		path: string;
		handler: string;
	}>;
}

export interface ServerSettingsProps {
	serverId: string;
	serverData: Record<string, unknown>;
	onUpdate: (data: Record<string, unknown>) => void;
	onConnect: () => Promise<void>;
	onDisconnect: () => Promise<void>;
	onSync: () => Promise<void>;
}

// Registry for server type plugins
class ServerTypeRegistry {
	private plugins = new Map<string, ServerTypePlugin>();
	
	register(plugin: ServerTypePlugin): void {
		this.plugins.set(plugin.id, plugin);
	}
	
	unregister(id: string): void {
		this.plugins.delete(id);
	}
	
	get(id: string): ServerTypePlugin | undefined {
		return this.plugins.get(id);
	}
	
	getAll(): Array<ServerTypePlugin> {
		return Array.from(this.plugins.values());
	}
	
	getByCategory(category: ServerTypePlugin['category']): Array<ServerTypePlugin> {
		return Array.from(this.plugins.values()).filter(p => p.category === category);
	}
	
	getFederated(): Array<ServerTypePlugin> {
		return Array.from(this.plugins.values()).filter(p => p.supportsFederation);
	}
	
	getRealtime(): Array<ServerTypePlugin> {
		return Array.from(this.plugins.values()).filter(p => p.supportsRealtime);
	}
}

export const serverTypeRegistry = new ServerTypeRegistry();
