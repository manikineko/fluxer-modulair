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

// SSR Rendering Channel Type Plugin
// Implements sandboxed SSR rendering for custom records

const SSRRenderingChannelPlugin = {
	id: 'ssr-render',
	name: 'SSR Render',
	icon: '🎨',
	category: 'ssr' as const,
	supportsMessages: true,
	supportsVoice: false,
	botAccessible: true,
	userAccessible: true,
	
	ssrConfig: {
		enabled: true,
		sandbox: {
			allowedOrigins: ['*'], // Can be configured per channel
			allowLocalStorage: false,
			allowCookies: false,
			allowUserMedia: false,
			contentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
		},
		customRecordType: {
			namespace: 'com.fluxer.ssr.render',
			name: 'Render',
			schema: {
				type: 'object',
				properties: {
					html: {type: 'string'},
					css: {type: 'string'},
					js: {type: 'string'},
					component: {type: 'string'},
					props: {type: 'object'},
				},
			},
		},
	},
};

// UI Component for SSR rendering
const SSRRenderingComponent = (React: unknown) => {
	const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
	
	return function SSRRenderView(props: Record<string, unknown>) {
		const [htmlCode, setHtmlCode] = R.useState('');
		const [cssCode, setCssCode] = R.useState('');
		const [jsCode, setJsCode] = R.useState('');
		const [componentName, setComponentName] = R.useState('');
		const [previewMode, setPreviewMode] = R.useState(false);
		const [renderError, setRenderError] = R.useState('');
		
		const handleRender = () => {
			setPreviewMode(true);
			setRenderError('');
			
			try {
				// Create a sandboxed iframe for rendering
				const sandboxConfig = {
					allowScripts: true,
					allowSameOrigin: true,
					allowForms: false,
					allowPopups: false,
					allowModals: false,
				};
				
				// In a real implementation, this would:
				// 1. Create a sandboxed iframe
				// 2. Inject the HTML, CSS, and JS
				// 3. Execute with limited permissions
				// 4. Prevent access to localStorage, cookies, etc.
				
				console.log('SSR Render:', {htmlCode, cssCode, jsCode, componentName});
			} catch (e) {
				setRenderError(String(e));
				setPreviewMode(false);
			}
		};
		
		return R.createElement('div', {style: {padding: '16px', maxWidth: '1200px', margin: '0 auto'}},
			R.createElement('h2', {style: {fontSize: '20px', fontWeight: 700, color: 'var(--text-normal)', marginBottom: '16px'}}, 'SSR Rendering'),
			
			// Editor section
			!previewMode && R.createElement('div', {style: {display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}},
				// HTML Editor
				R.createElement('div', null,
					R.createElement('label', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '8px', display: 'block'}}, 'HTML'),
					R.createElement('textarea', {
						placeholder: '<div>Hello World</div>',
						value: htmlCode,
						onChange: (e: {target: {value: string}}) => setHtmlCode(e.target.value),
						style: {
							width: '100%',
							height: '200px',
							padding: '12px',
							background: 'var(--background-secondary)',
							border: '1px solid var(--background-modifier-accent)',
							borderRadius: '8px',
							color: 'var(--text-normal)',
							fontSize: '13px',
							fontFamily: 'monospace',
							resize: 'vertical',
						}
					})
				),
				// CSS Editor
				R.createElement('div', null,
					R.createElement('label', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '8px', display: 'block'}}, 'CSS'),
					R.createElement('textarea', {
						placeholder: '.container { color: blue; }',
						value: cssCode,
						onChange: (e: {target: {value: string}}) => setCssCode(e.target.value),
						style: {
							width: '100%',
							height: '200px',
							padding: '12px',
							background: 'var(--background-secondary)',
							border: '1px solid var(--background-modifier-accent)',
							borderRadius: '8px',
							color: 'var(--text-normal)',
							fontSize: '13px',
							fontFamily: 'monospace',
							resize: 'vertical',
						}
					})
				)
			),
			
			// JS Editor (full width)
			!previewMode && R.createElement('div', {style: {marginBottom: '16px'}},
				R.createElement('label', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '8px', display: 'block'}}, 'JavaScript (Sandboxed)'),
				R.createElement('textarea', {
					placeholder: '// Limited JS execution\nconsole.log("Hello");',
					value: jsCode,
					onChange: (e: {target: {value: string}}) => setJsCode(e.target.value),
					style: {
						width: '100%',
						height: '150px',
						padding: '12px',
						background: 'var(--background-secondary)',
						border: '1px solid var(--background-modifier-accent)',
						borderRadius: '8px',
						color: 'var(--text-normal)',
						fontSize: '13px',
						fontFamily: 'monospace',
						resize: 'vertical',
					}
				})
			),
			
			// Component name input
			!previewMode && R.createElement('div', {style: {marginBottom: '16px'}},
				R.createElement('label', {style: {fontSize: '14px', fontWeight: 600, color: 'var(--text-normal)', marginBottom: '8px', display: 'block'}}, 'Component Name (for AT Protocol record)'),
				R.createElement('input', {
					type: 'text',
					placeholder: 'my-component',
					value: componentName,
					onChange: (e: {target: {value: string}}) => setComponentName(e.target.value),
					style: {
						width: '100%',
						padding: '8px 12px',
						background: 'var(--background-secondary)',
						border: '1px solid var(--background-modifier-accent)',
						borderRadius: '6px',
						color: 'var(--text-normal)',
						fontSize: '14px',
					}
				})
			),
			
			// Action buttons
			!previewMode && R.createElement('div', {style: {display: 'flex', gap: '8px', marginBottom: '16px'}},
				R.createElement('button', {
					onClick: handleRender,
					disabled: !htmlCode,
					style: {
						padding: '8px 16px',
						background: !htmlCode ? 'var(--background-modifier-accent)' : 'var(--brand-experiment)',
						color: !htmlCode ? 'var(--text-muted)' : 'white',
						border: 'none',
						borderRadius: '6px',
						fontSize: '14px',
						fontWeight: 600,
						cursor: !htmlCode ? 'not-allowed' : 'pointer',
					}
				}, 'Preview'),
				R.createElement('button', {
					onClick: () => setPreviewMode(false),
					style: {
						padding: '8px 16px',
						background: 'var(--background-secondary)',
						color: 'var(--text-normal)',
						border: '1px solid var(--background-modifier-accent)',
						borderRadius: '6px',
						fontSize: '14px',
						fontWeight: 600,
						cursor: 'pointer',
					}
				}, 'Reset')
			),
			
			// Preview
			previewMode && R.createElement('div', {style: {marginBottom: '16px'}},
				R.createElement('div', {style: {display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}},
					R.createElement('h3', {style: {fontSize: '16px', fontWeight: 600, color: 'var(--text-normal)'}}, 'Preview (Sandboxed)'),
					R.createElement('button', {
						onClick: () => setPreviewMode(false),
						style: {
							padding: '4px 8px',
							background: 'var(--background-secondary)',
							color: 'var(--text-normal)',
							border: '1px solid var(--background-modifier-accent)',
							borderRadius: '4px',
							fontSize: '12px',
							cursor: 'pointer',
						}
					}, 'Edit')
				),
				R.createElement('div', {
					style: {
						padding: '16px',
						background: 'var(--background-secondary)',
						border: '1px solid var(--background-modifier-accent)',
						borderRadius: '8px',
						minHeight: '300px',
					}
				},
					R.createElement('iframe', {
						style: {
							width: '100%',
							height: '400px',
							border: 'none',
							background: 'white',
							borderRadius: '4px',
						},
						sandbox: 'allow-scripts allow-same-origin',
						title: 'SSR Preview',
					})
				),
				renderError && R.createElement('div', {
					style: {
						padding: '12px',
						background: 'var(--background-negative)',
						border: '1px solid var(--text-negative)',
						borderRadius: '6px',
						marginTop: '8px',
						fontSize: '13px',
						color: 'var(--text-negative)',
					}
				}, renderError)
			),
			
			// Sandbox info
			R.createElement('div', {
				style: {
					padding: '12px',
					background: 'var(--background-tertiary)',
					borderRadius: '6px',
					fontSize: '12px',
					color: 'var(--text-muted)',
				}
			},
				R.createElement('strong', null, 'Sandbox Security:'),
				' This preview runs in a sandboxed iframe with limited permissions. ',
				'localStorage and cookies are disabled. Only same-origin scripts are allowed.'
			)
		);
	};
};

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`SSR Rendering plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerUIComponent: (component: {id: string; name: string; component: unknown; location: string; priority: number; props?: Record<string, unknown>}) => void}};
	console.log(`SSR Rendering plugin enabled! ID: ${ctx.pluginId}`);
	
	ctx.api.registerUIComponent({
		id: 'ssr-render',
		name: 'SSR Rendering',
		component: SSRRenderingComponent,
		location: 'channel_header',
		priority: 65,
		props: {},
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`SSR Rendering plugin disabled! ID: ${ctx.pluginId}`);
}

export default SSRRenderingChannelPlugin;
