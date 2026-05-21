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

export const PLUGIN_ID = 'announcement-channel';
export const PLUGIN_NAME = 'Announcement Channel';
export const PLUGIN_VERSION = '1.0.0';

export interface AnnouncementPluginConfig {
	bannerTitle: string;
	bannerDescription: string;
	bannerGradient: string;
	showBadge: boolean;
	badgeText: string;
	allowReactions: boolean;
	allowComments: boolean;
}

export const defaultConfig: AnnouncementPluginConfig = {
	bannerTitle: '',
	bannerDescription: 'Official announcements from this server will appear here.',
	bannerGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	showBadge: true,
	badgeText: 'Official Channel',
	allowReactions: true,
	allowComments: true,
};

export const manifest = {
	id: PLUGIN_ID,
	name: PLUGIN_NAME,
	version: PLUGIN_VERSION,
	description: 'Official announcement channel with prominent banner and admin configuration',
	author: 'Fluxer Team',
	permissions: ['SEND_MESSAGES', 'MANAGE_MESSAGES'],
	config: defaultConfig,
};

export const announcementChannelType: ChannelTypeDescriptor = {
	id: String(ChannelTypes.GUILD_ANNOUNCEMENT),
	name: 'Announcement',
	description: 'Official announcement channel with prominent banner',
	icon: 'megaphone',
	component: null,
};

export const loadAnnouncementComponent = () =>
	import('@app/components/channel/channel_view/AnnouncementChannelView').then((m) => ({
		default: m.AnnouncementChannelView,
	}));
