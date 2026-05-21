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

export type EventHandler = (...args: Array<unknown>) => unknown;

export interface UIComponentDescriptor {
	id: string;
	name: string;
	component: unknown; // React component or similar
	location: 'settings' | 'channel_header' | 'message' | 'user_popout' | 'guild_menu' | 'sidebar';
	priority?: number;
	props?: Record<string, unknown>;
}

export interface PluginUIContext {
	pluginId: string;
	component: UIComponentDescriptor;
	registerComponent(): void;
	unregisterComponent(): void;
}

export interface UIRenderContext {
	location: string;
	props: Record<string, unknown>;
	components: Array<UIComponentDescriptor>;
}

export interface PluginPermissions {
	// Network permissions
	network?: {
		request?: boolean;
		requestDomains?: string[];
	};
	
	// File system permissions
	fileSystem?: {
		read?: boolean;
		write?: boolean;
		paths?: string[];
	};
	
	// Database permissions
	database?: {
		read?: boolean;
		write?: boolean;
		tables?: string[];
	};
	
	// API permissions
	api?: {
		internal?: boolean;
		external?: boolean;
		endpoints?: string[];
	};
	
	// User data permissions
	userData?: {
		read?: boolean;
		write?: boolean;
		fields?: string[];
	};
	
	// Admin permissions
	admin?: {
		managePlugins?: boolean;
		modifyConfig?: boolean;
	};
}

export interface PluginAssets {
	icons?: string[];
	stylesheets?: string[];
	scripts?: string[];
}

export interface PluginContext {
	readonly pluginId: string;
	readonly version: string;
	readonly environment: 'development' | 'production' | 'test';
	readonly config: Record<string, unknown>;
	readonly permissions: PluginPermissions;
	
	// Plugin API for interacting with the host system
	api: PluginAPI;

	// React for creating UI components
	React: unknown; // React namespace (will be injected by host)
}

export interface PluginAPI {
	// Configuration
	getConfig(key: string): unknown;
	setConfig(key: string, value: unknown): void;

	// Logging
	log(message: string): void;
	error(message: string): void;
	warn(message: string): void;

	// Events
	emit(event: string, data: unknown): void;
	on(event: string, handler: EventHandler): void;
	off(event: string, handler: EventHandler): void;

	// Storage
	getStorage(key: string): unknown;
	setStorage(key: string, value: unknown): void;
	removeStorage(key: string): void;

	// Permission checking
	hasPermission(permission: string): boolean;

	// UI Components
	registerUIComponent(component: UIComponentDescriptor): void;
	unregisterUIComponent(componentId: string): void;
}

export interface PluginHooks {
	// Lifecycle hooks
	onLoad?: (context: PluginContext) => unknown | Promise<unknown>;
	onUnload?: (context: PluginContext) => unknown | Promise<unknown>;
	onEnable?: (context: PluginContext) => unknown | Promise<unknown>;
	onDisable?: (context: PluginContext) => unknown | Promise<unknown>;
	
	// Request/response hooks
	onRequest?: (context: unknown) => unknown | Promise<unknown>;
	onResponse?: (context: unknown) => unknown | Promise<unknown>;
	onError?: (error: unknown) => unknown | Promise<unknown>;
	
	// Message hooks
	onMessageCreate?: (data: unknown) => unknown | Promise<unknown>;
	onMessageUpdate?: (data: unknown) => unknown | Promise<unknown>;
	onMessageDelete?: (data: unknown) => unknown | Promise<unknown>;
	
	// Channel hooks
	onChannelCreate?: (data: unknown) => unknown | Promise<unknown>;
	onChannelUpdate?: (data: unknown) => unknown | Promise<unknown>;
	onChannelDelete?: (data: unknown) => unknown | Promise<unknown>;
	
	// Authentication hooks
	onLoginAttempt?: (data: {email: string; request: unknown}) => unknown | Promise<unknown>;
	onLoginSuccess?: (data: {userId: unknown; email: string; request: unknown}) => unknown | Promise<unknown>;
	onLoginFailure?: (data: {email: string; reason: string; userId?: unknown}) => unknown | Promise<unknown>;
	onRegisterAttempt?: (data: {email: string; username: string; request: unknown}) => unknown | Promise<unknown>;
	onRegisterSuccess?: (data: {userId: unknown; email: string; username: string; request: unknown}) => unknown | Promise<unknown>;
	onRegisterFailure?: (data: {email: string; reason: string}) => unknown | Promise<unknown>;
	
	// UI hooks
	onUIComponentRegister?: (context: PluginUIContext) => unknown | Promise<unknown>;
	onUIComponentUnregister?: (componentId: string) => unknown | Promise<unknown>;
	onUIRender?: (context: UIRenderContext) => unknown | Promise<unknown>;
}

export interface PluginManifest {
	id: string;
	name: string;
	version: string;
	description: string;
	author?: string;
	license?: string;
	main: string;
	
	target: 'client' | 'server' | 'both';
	
	hooks?: PluginHooks;
	permissions?: PluginPermissions;
	assets?: PluginAssets;
	
	// Optional dependencies
	dependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
	
	// Optional configuration schema
	config?: Record<string, unknown>;
	
	// Declarative UI components
	uiComponents?: Array<UIComponentDescriptor>;
}

export interface PluginState {
	manifest: PluginManifest;
	loaded: boolean;
	enabled: boolean;
	context?: PluginContext;
}
