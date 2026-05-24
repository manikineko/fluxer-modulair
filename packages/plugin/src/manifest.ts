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

import {object, string, optional, array, record, union, parse, boolean, unknown} from 'valibot';
import type {PluginManifest} from './types';

export const PluginManifestSchema = object({
	id: string(),
	name: string(),
	version: string(),
	description: string(),
	author: optional(string()),
	license: optional(string()),
	main: string(),
	target: union([string('client'), string('server'), string('both')]),
	hooks: optional(record(string(), string())),
	permissions: optional(record(string(), union([string(), boolean(), unknown()]))),
	assets: optional(object({
		icons: optional(array(string())),
		stylesheets: optional(array(string())),
		scripts: optional(array(string())),
	})),
	dependencies: optional(record(string(), string())),
	peerDependencies: optional(record(string(), string())),
	config: optional(record(string(), string())),
	uiComponents: optional(array(unknown())),
	messageTypes: optional(array(object({
		id: string(),
		name: string(),
		icon: string(),
		userAccessible: boolean(),
		botAccessible: boolean(),
		recordSchema: optional(object({
			namespace: string(),
			name: string(),
			schema: unknown(),
		})),
	}))),
	serverTypes: optional(array(object({
		id: string(),
		name: string(),
		description: string(),
		icon: string(),
		iconType: union([string('emoji'), string('lucide'), string('custom-svg'), string('image-url')]),
		category: union([string('fluxer'), string('discord'), string('matrix'), string('xmpp'), string('bluesky'), string('mastodon'), string('custom')]),
		supportsFederation: boolean(),
		supportsRealtime: boolean(),
		supportsHistory: boolean(),
		supportsVoice: boolean(),
		supportsFiles: boolean(),
	}))),
	channelTypes: optional(array(object({
		id: string(),
		name: string(),
		icon: string(),
		category: union([string('text'), string('voice'), string('feed'), string('ssr'), string('custom')]),
		supportsMessages: boolean(),
		supportsVoice: boolean(),
		botAccessible: boolean(),
		userAccessible: boolean(),
	}))),
});

export function validateManifest(manifest: unknown): PluginManifest {
	return parse(PluginManifestSchema, manifest) as PluginManifest;
}

export async function loadManifest(manifestPath: string): Promise<PluginManifest> {
	const {readFile} = await import('fs/promises');
	const content = await readFile(manifestPath, 'utf-8');
	const manifest = JSON.parse(content);
	return validateManifest(manifest);
}
