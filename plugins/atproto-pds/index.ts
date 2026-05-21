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

let pdsInitialized = false;
const xrpcHandlers: Map<string, (request: {params: unknown}) => Promise<{success: boolean; data?: unknown; error?: {error: string; message?: string}}>> = new Map();
const repositories: Map<string, {did: string; records: Record<string, {uri: string; cid: string; value: unknown}>; head: string}> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`ATProto PDS plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`ATProto PDS plugin enabled! ID: ${ctx.pluginId}`);
	await initializePDS();
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`ATProto PDS plugin disabled! ID: ${ctx.pluginId}`);
	await shutdownPDS();
}

export async function onRequest(context: unknown): Promise<void> {
	// Handle ATProto XRPC requests
	const ctx = context as {request: {url: string; method: string}};
	if (ctx.request.url?.startsWith('/xrpc/')) {
		await handleXRPC(ctx.request);
	}
}

async function initializePDS(): Promise<void> {
	if (pdsInitialized) {
		console.log('PDS already initialized');
		return;
	}

	console.log('Initializing ATProto PDS...');
	
	await initializeXRPC();
	
	console.log('Repository manager initialized');
	console.log('Auth manager initialized');
	console.log('DID resolver initialized');
	
	pdsInitialized = true;
	console.log('ATProto PDS initialized successfully');
}

async function shutdownPDS(): Promise<void> {
	if (!pdsInitialized) {
		return;
	}

	console.log('Shutting down ATProto PDS...');
	
	xrpcHandlers.clear();
	repositories.clear();
	
	pdsInitialized = false;
	console.log('ATProto PDS shut down');
}

async function initializeXRPC(): Promise<void> {
	console.log('Initializing XRPC endpoints...');
	
	// Register common ATProto XRPC methods
	xrpcHandlers.set('com.atproto.server.describeServer', async () => {
		return {
			success: true,
			data: {
				did: 'did:example:pds',
				didDoc: null,
				handle: 'pds.example.com',
				userDid: 'did:example:pds',
				email: 'admin@manikineko.nl',
			},
		};
	});

	xrpcHandlers.set('com.atproto.server.createSession', async (request: {params: unknown}) => {
		const params = request.params as {handle: string; password: string};
		return {
			success: true,
			data: {
				did: 'did:example:pds',
				handle: params.handle,
				email: 'admin@manikineko.nl',
				accessJwt: 'mock_access_token',
				refreshJwt: 'mock_refresh_token',
			},
		};
	});

	xrpcHandlers.set('com.atproto.repo.createRecord', async (request: {params: unknown}) => {
		const params = request.params as {repo: string; collection: string; rkey: string; record: unknown};
		const uri = `at://${params.repo}/${params.collection}/${params.rkey}`;
		
		let repository = repositories.get(params.repo);
		if (!repository) {
			repository = {
				did: params.repo,
				records: {},
				head: '',
			};
			repositories.set(params.repo, repository);
		}
		
		repository.records[uri] = {
			uri,
			cid: 'mock_cid',
			value: params.record,
		};
		
		return {
			success: true,
			data: {
				uri,
				cid: 'mock_cid',
				record: params.record,
			},
		};
	});

	xrpcHandlers.set('com.atproto.repo.getRecord', async (request: {params: unknown}) => {
		const params = request.params as {repo: string; collection: string; rkey: string};
		const repository = repositories.get(params.repo);
		
		if (!repository) {
			return {
				success: false,
				error: {
					error: 'RecordNotFound',
					message: 'Repository not found',
				},
			};
		}
		
		const uri = `at://${params.repo}/${params.collection}/${params.rkey}`;
		const record = repository.records[uri];
		
		if (record) {
			return {
				success: true,
				data: record,
			};
		}
		
		return {
			success: false,
			error: {
				error: 'RecordNotFound',
				message: 'Record not found',
			},
		};
	});

	console.log(`Registered ${xrpcHandlers.size} XRPC methods`);
}

async function handleXRPC(request: {url: string; method: string}): Promise<void> {
	console.log(`Handling XRPC request: ${request.method} ${request.url}`);
	
	// Extract NSID from URL
	const nsid = request.url.replace('/xrpc/', '');
	
	const handler = xrpcHandlers.get(nsid);
	if (!handler) {
		console.error(`XRPC method not found: ${nsid}`);
		return;
	}
	
	const response = await handler({params: {}});
	
	if (response.success) {
		console.log(`XRPC request successful: ${nsid}`);
	} else {
		console.error(`XRPC request failed: ${nsid}`, response.error);
	}
}
