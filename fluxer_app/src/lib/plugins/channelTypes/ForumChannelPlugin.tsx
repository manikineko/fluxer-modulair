/*
 * Copyright (C) 2026 Fluxer Contributors
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

import type {ChannelTypeDescriptor} from '../ChannelTypeRegistry';
import {ChannelTypes} from '@fluxer/constants/src/ChannelConstants';

export const PLUGIN_ID = 'forum-channel';
export const PLUGIN_NAME = 'Forum Channel';
export const PLUGIN_VERSION = '1.0.0';

// Plugin configuration interface
export interface ForumPluginConfig {
	enableThreads: boolean;
	maxThreadsPerChannel: number;
	allowAnonymousPosts: boolean;
	requireModeration: boolean;
}

// Default configuration
export const defaultConfig: ForumPluginConfig = {
	enableThreads: true,
	maxThreadsPerChannel: 100,
	allowAnonymousPosts: false,
	requireModeration: false,
};

// Plugin manifest
export const manifest = {
	id: PLUGIN_ID,
	name: PLUGIN_NAME,
	version: PLUGIN_VERSION,
	description: 'Forum channel with thread support for organized discussions',
	author: 'Fluxer Team',
	permissions: ['SEND_MESSAGES', 'CREATE_THREADS', 'MANAGE_THREADS'],
	config: defaultConfig,
};

// Channel type registration
export const forumChannelType: ChannelTypeDescriptor = {
	id: String(ChannelTypes.GUILD_FORUM),
	name: 'Forum',
	description: 'Forum channel for organized discussions',
	icon: 'users',
	// Component will be loaded dynamically
	component: null,
};

// Lazy loader for the component
export const loadForumComponent = () =>
	import('@app/components/channel/channel_view/ForumChannelView').then((m) => ({
		default: m.ForumChannelView,
	}));
