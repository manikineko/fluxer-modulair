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

import React, {Component, type ReactNode} from 'react';

interface Props {
	children: ReactNode;
	pluginName: string;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class PluginErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {hasError: false};
	}

	static getDerivedStateFromError(error: Error): State {
		return {hasError: true, error};
	}

	override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error(`[PluginErrorBoundary] ${this.props.pluginName} crashed:`, error, errorInfo);
		this.props.onError?.(error, errorInfo);
	}

	override render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div
					style={{
						padding: '20px',
						margin: '16px',
						background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
						borderRadius: '12px',
						color: '#fff',
						textAlign: 'center',
					}}
				>
					<h3 style={{margin: '0 0 8px 0', fontSize: '18px'}}>⚠️ {this.props.pluginName} Error</h3>
					<p style={{margin: '0', fontSize: '14px', opacity: 0.9}}>
						This plugin encountered an error and has been disabled.
					</p>
					<button
						onClick={() => this.setState({hasError: false, error: undefined})}
						style={{
							marginTop: '12px',
							padding: '8px 16px',
							background: 'rgba(255, 255, 255, 0.2)',
							border: 'none',
							borderRadius: '6px',
							color: '#fff',
							cursor: 'pointer',
							fontSize: '13px',
						}}
					>
						Retry
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
