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

export const PLUGIN_ID = 'stage-channel';
export const PLUGIN_NAME = 'Stage Channel';
export const PLUGIN_VERSION = '1.0.0';

export interface StagePluginConfig {
	enableChat: boolean;
	maxSpeakers: number;
	allowAudienceChat: boolean;
	autoRecord: boolean;
}

export const defaultConfig: StagePluginConfig = {
	enableChat: true,
	maxSpeakers: 10,
	allowAudienceChat: true,
	autoRecord: false,
};

export const manifest = {
	id: PLUGIN_ID,
	name: PLUGIN_NAME,
	version: PLUGIN_VERSION,
	description: 'Stage channel for voice events with chat support',
	author: 'Fluxer Team',
	permissions: ['SEND_MESSAGES', 'CONNECT', 'SPEAK', 'USE_VOICE_ACTIVITY'],
	config: defaultConfig,
};

export const stageChannelType: ChannelTypeDescriptor = {
	id: String(ChannelTypes.GUILD_STAGE),
	name: 'Stage',
	description: 'Stage channel for voice events',
	icon: 'microphone',
	component: null,
};

export const loadStageComponent = () =>
	import('@app/components/channel/channel_view/StageChannelView').then((m) => ({
		default: m.StageChannelView,
	}));
