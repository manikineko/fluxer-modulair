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

import type {XRPCRequest, XRPCResponse} from './types';

export class XRPCClient {
	private baseUrl: string;
	private headers: Record<string, string>;

	constructor(baseUrl: string, headers: Record<string, string> = {}) {
		this.baseUrl = baseUrl;
		this.headers = headers;
	}

	async call(nsid: string, request: XRPCRequest): Promise<XRPCResponse> {
		const url = `${this.baseUrl}/xrpc/${nsid}`;
		
		const options: RequestInit = {
			method: request.method,
			headers: {
				'Content-Type': request.encoding || 'application/json',
				...this.headers,
			},
		};

		if (request.method !== 'GET' && request.params) {
			options.body = JSON.stringify(request.params);
		} else if (request.method === 'GET' && request.params) {
			const params = new URLSearchParams(request.params as Record<string, string>);
			url + `?${params.toString()}`;
		}

		try {
			const response = await fetch(url, options);
			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data as {error: string; message?: string},
				};
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			return {
				success: false,
				error: {
					error: 'NetworkError',
					message: error instanceof Error ? error.message : 'Unknown error',
				},
			};
		}
	}

	setHeader(key: string, value: string): void {
		this.headers[key] = value;
	}

	setHeaders(headers: Record<string, string>): void {
		this.headers = {...this.headers, ...headers};
	}
}

export class XRPCServer {
	private handlers: Map<string, (request: XRPCRequest) => Promise<XRPCResponse>> = new Map();

	registerMethod(nsid: string, handler: (request: XRPCRequest) => Promise<XRPCResponse>): void {
		this.handlers.set(nsid, handler);
	}

	unregisterMethod(nsid: string): void {
		this.handlers.delete(nsid);
	}

	async handle(nsid: string, request: XRPCRequest): Promise<XRPCResponse> {
		const handler = this.handlers.get(nsid);
		if (!handler) {
			return {
				success: false,
				error: {
					error: 'MethodNotFound',
					message: `XRPC method not found: ${nsid}`,
				},
			};
		}

		try {
			return await handler(request);
		} catch (error) {
			return {
				success: false,
				error: {
					error: 'HandlerError',
					message: error instanceof Error ? error.message : 'Unknown error',
				},
			};
		}
	}

	getRegisteredMethods(): string[] {
		return Array.from(this.handlers.keys());
	}
}
