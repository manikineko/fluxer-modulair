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

export const PLUGIN_ID = 'ssr-render';
export const PLUGIN_NAME = 'SSR Render Channel';
export const PLUGIN_VERSION = '1.0.0';

export interface SSRRenderPluginConfig {
	customHTML: string;
	customCSS: string;
	customJS: string;
	allowUserScripts: boolean;
	sanitizeHTML: boolean;
	adminOnlyEdit: boolean;
}

export const defaultConfig: SSRRenderPluginConfig = {
	customHTML: '<div class="custom-content">\n  <h1>Welcome to Custom Content</h1>\n  <p>Edit this HTML in admin settings.</p>\n</div>',
	customCSS: '.custom-content {\n  padding: 20px;\n  text-align: center;\n}',
	customJS: '',
	allowUserScripts: false,
	sanitizeHTML: true,
	adminOnlyEdit: true,
};

export const manifest = {
	id: PLUGIN_ID,
	name: PLUGIN_NAME,
	version: PLUGIN_VERSION,
	description: 'Server-side rendered content channel with admin HTML editor',
	author: 'Fluxer Team',
	permissions: ['VIEW_CHANNEL', 'MANAGE_GUILD'],
	requiresBackend: true,
	config: defaultConfig,
};

export const ssrRenderChannelType: ChannelTypeDescriptor = {
	id: String(ChannelTypes.SSR_RENDER),
	name: 'SSR Render',
	description: 'Server-side rendered content channel',
	icon: 'code',
	component: null,
};

export const loadSSRRenderComponent = () =>
	import('@app/components/channel/channel_view/SSRRenderChannelView').then((m) => ({
		default: m.SSRRenderChannelView,
	}));
