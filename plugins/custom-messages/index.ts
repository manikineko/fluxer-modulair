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

// Custom Message Types Plugin
// Demonstrates custom message types with AT Protocol record support

// Example: Poll message type
const PollMessageType = {
	id: 'poll',
	name: 'Poll',
	icon: '📊',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.fluxer.poll',
		name: 'Poll',
		schema: {
			type: 'object',
			properties: {
				question: {type: 'string'},
				options: {type: 'array', items: {type: 'string'}},
				multipleChoice: {type: 'boolean'},
				expiresAt: {type: 'string'},
			},
			required: ['question', 'options'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.question && Array.isArray(content.options) && content.options.length >= 2);
	},
};

// Example: Embed message type (for rich content)
const EmbedMessageType = {
	id: 'embed',
	name: 'Embed',
	icon: '🔗',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.fluxer.embed',
		name: 'Embed',
		schema: {
			type: 'object',
			properties: {
				title: {type: 'string'},
				description: {type: 'string'},
				url: {type: 'string'},
				image: {type: 'string'},
				color: {type: 'string'},
				fields: {type: 'array', items: {type: 'object'}},
			},
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.title || content.url);
	},
};

// Example: Interactive component message type
const ComponentMessageType = {
	id: 'component',
	name: 'Interactive Component',
	icon: '🧩',
	userAccessible: false, // Bots only for now
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.fluxer.component',
		name: 'Component',
		schema: {
			type: 'object',
			properties: {
				componentType: {type: 'string'},
				props: {type: 'object'},
				state: {type: 'object'},
				actions: {type: 'array', items: {type: 'object'}},
			},
			required: ['componentType'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.componentType);
	},
};

// Example: Lexicon record message type (for AT Protocol records)
const LexiconMessageType = {
	id: 'lexicon',
	name: 'Lexicon Record',
	icon: '📝',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.fluxer.lexicon',
		name: 'LexiconRecord',
		schema: {
			type: 'object',
			properties: {
				lexicon: {type: 'string'},
				record: {type: 'object'},
				collection: {type: 'string'},
				rkey: {type: 'string'},
			},
			required: ['lexicon', 'record'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.lexicon && content.record);
	},
};

// Example: Code block message type
const CodeMessageType = {
	id: 'code',
	name: 'Code Block',
	icon: '💻',
	userAccessible: true,
	botAccessible: true,
	
	recordSchema: {
		namespace: 'com.fluxer.code',
		name: 'Code',
		schema: {
			type: 'object',
			properties: {
				code: {type: 'string'},
				language: {type: 'string'},
				filename: {type: 'string'},
				theme: {type: 'string'},
			},
			required: ['code'],
		},
	},
	
	validateContent: (content: Record<string, unknown>) => {
		return !!(content.code);
	},
};

// UI Component for custom message type selector
const CustomMessageSelectorComponent = (React: unknown) => {
	const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown};
	
	return function MessageSelector(props: Record<string, unknown>) {
		const [selectedType, setSelectedType] = R.useState('text');
		const [messageContent, setMessageContent] = R.useState('');
		
		const messageTypes = [
			{id: 'text', name: 'Text', icon: '💬'},
			{id: 'poll', name: 'Poll', icon: '📊'},
			{id: 'embed', name: 'Embed', icon: '🔗'},
			{id: 'code', name: 'Code', icon: '💻'},
			{id: 'lexicon', name: 'Lexicon', icon: '📝'},
		];
		
		const handleSend = () => {
			if (!messageContent.trim()) return;
			// Send message with selected type
			console.log('Sending message:', {type: selectedType, content: messageContent});
		};
		
		return R.createElement('div', {style: {padding: '12px', background: 'var(--background-secondary)', borderRadius: '8px'}},
			R.createElement('div', {style: {display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'}},
				...messageTypes.map((type) =>
					R.createElement('button', {
						key: type.id,
						onClick: () => setSelectedType(type.id),
						style: {
							padding: '6px 12px',
							background: selectedType === type.id ? 'var(--brand-experiment)' : 'var(--background-tertiary)',
							color: selectedType === type.id ? 'white' : 'var(--text-normal)',
							border: 'none',
							borderRadius: '4px',
							fontSize: '13px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: '4px',
						}
					}, type.icon, type.name)
				)
			),
			R.createElement('textarea', {
				placeholder: selectedType === 'code' ? '// Enter code here...' : 'Type your message...',
				value: messageContent,
				onChange: (e: {target: {value: string}}) => setMessageContent(e.target.value),
				style: {
					width: '100%',
					minHeight: '80px',
					padding: '12px',
					background: 'var(--background-tertiary)',
					border: '1px solid var(--background-modifier-accent)',
					borderRadius: '6px',
					color: 'var(--text-normal)',
					fontSize: '14px',
					fontFamily: selectedType === 'code' ? 'monospace' : 'inherit',
					resize: 'vertical',
					marginBottom: '8px',
				}
			}),
			R.createElement('button', {
				onClick: handleSend,
				disabled: !messageContent.trim(),
				style: {
					padding: '8px 16px',
					background: !messageContent.trim() ? 'var(--background-modifier-accent)' : 'var(--brand-experiment)',
					color: !messageContent.trim() ? 'var(--text-muted)' : 'white',
					border: 'none',
					borderRadius: '6px',
					fontSize: '14px',
					fontWeight: 600,
					cursor: !messageContent.trim() ? 'not-allowed' : 'pointer',
				}
			}, 'Send')
		);
	};
};

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Custom Messages plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerUIComponent: (component: {id: string; name: string; component: unknown; location: string; priority: number; props?: Record<string, unknown>}) => void}};
	console.log(`Custom Messages plugin enabled! ID: ${ctx.pluginId}`);
	
	// Register message type selector in chat input area
	ctx.api.registerUIComponent({
		id: 'custom-message-selector',
		name: 'Custom Message Selector',
		component: CustomMessageSelectorComponent,
		location: 'chat_input',
		priority: 60,
		props: {},
	});
	
	// Register custom message types (this would be done through the plugin API in a real implementation)
	console.log('Registered custom message types:', {
		poll: PollMessageType,
		embed: EmbedMessageType,
		component: ComponentMessageType,
		lexicon: LexiconMessageType,
		code: CodeMessageType,
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Custom Messages plugin disabled! ID: ${ctx.pluginId}`);
}

// Export message type definitions for use by the channel type system
export {PollMessageType, EmbedMessageType, ComponentMessageType, LexiconMessageType, CodeMessageType};
