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

import type {PluginContext} from '@fluxer/plugin';
import {customMessageTypeRegistry} from '@fluxer/plugin';

export async function onLoad(context: PluginContext): Promise<void> {
	context.log('Poll Messages plugin loaded');
}

export async function onEnable(context: PluginContext): Promise<void> {
	context.log('Poll Messages plugin enabled');
	
	// Register the poll message type with render function
	customMessageTypeRegistry.register({
		id: 'poll',
		name: 'Poll',
		icon: '📊',
		userAccessible: true,
		botAccessible: true,
		recordSchema: {
			namespace: 'app.fluxer.poll',
			name: 'poll',
			schema: {
				type: 'object',
				properties: {
					question: {type: 'string'},
					options: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								id: {type: 'string'},
								text: {type: 'string'},
								votes: {type: 'number'},
							},
						},
					},
					allowMultiple: {type: 'boolean'},
					expiresAt: {type: 'string'},
				},
			},
		},
		renderMessage: (props) => {
			const {React} = context;
			const message = props.message as any;
			
			return React.createElement('div', {className: 'poll-message'},
				React.createElement('h4', null, message.question),
				React.createElement('div', {className: 'poll-options'},
					message.options?.map((option: any) =>
						React.createElement('div', {
							key: option.id,
							className: 'poll-option',
							onClick: () => props.onReact(`vote:${option.id}`),
						},
							React.createElement('span', {className: 'poll-option-text'}, option.text),
							React.createElement('span', {className: 'poll-option-votes'}, `${option.votes} votes`)
						)
					)
				)
			);
		},
		validateContent: (content) => {
			return !!(content.question && content.options && Array.isArray(content.options) && content.options.length >= 2);
		},
	});
}

export async function onDisable(context: PluginContext): Promise<void> {
	context.log('Poll Messages plugin disabled');
	customMessageTypeRegistry.unregister('poll');
}
