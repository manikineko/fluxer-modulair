// biome-ignore lint: plugins are portable and may not have access to Node.js types at compile time
// biome-ignore lint: using any for plugin API compatibility
// biome-ignore lint: Buffer and process are Node.js globals, available in Node runtime

interface IPFSConfig {
	gateway: string;
	apiEndpoint: string;
	useCustomGateway: boolean;
}

interface AddResult {
	cid: string;
	size: number;
	name?: string;
}

interface PinResult {
	cid: string;
	pinned: boolean;
}

let config: IPFSConfig = {
	gateway: 'https://ipfs.io',
	apiEndpoint: 'http://localhost:5001',
	useCustomGateway: false
};

// Simple IPFS client implementation (without external dependencies for portability)
class IPFSClient {
	private config: IPFSConfig;

	constructor(config: IPFSConfig) {
		this.config = config;
	}

	async add(data: Buffer | string, filename?: string): Promise<AddResult> {
		console.log(`[IPFS] Adding data to IPFS`);
		console.log(`[IPFS] API Endpoint: ${this.config.apiEndpoint}`);
		console.log(`[IPFS] Filename: ${filename || 'unnamed'}`);
		
		// In a real implementation, this would use ipfs-http-client or similar
		// For portability, we'll implement a stub that logs the operation
		const mockCid = 'Qm' + Math.random().toString(16).substr(2, 44);
		
		return {
			cid: mockCid,
			size: data.length,
			name: filename
		};
	}

	async get(cid: string): Promise<Buffer> {
		console.log(`[IPFS] Getting CID ${cid} from gateway: ${this.config.gateway}`);
		// In a real implementation, this would fetch from IPFS gateway
		return Buffer.from('mock data');
	}

	async cat(cid: string): Promise<Buffer> {
		console.log(`[IPFS] Cat CID ${cid} from API: ${this.config.apiEndpoint}`);
		// In a real implementation, this would stream from IPFS API
		return Buffer.from('mock data');
	}

	async pin(cid: string): Promise<PinResult> {
		console.log(`[IPFS] Pinning CID ${cid}`);
		// In a real implementation, this would pin the content
		return {
			cid,
			pinned: true
		};
	}

	async unpin(cid: string): Promise<void> {
		console.log(`[IPFS] Unpinning CID ${cid}`);
		// In a real implementation, this would unpin the content
	}

	async ls(cid: string): Promise<unknown[]> {
		console.log(`[IPFS] Listing CID ${cid}`);
		// In a real implementation, this would list directory contents
		return [];
	}

	async resolve(name: string): Promise<string> {
		console.log(`[IPFS] Resolving IPNS name: ${name}`);
		// In a real implementation, this would resolve IPNS to CID
		return 'Qm' + Math.random().toString(16).substr(2, 44);
	}

	async publish(cid: string): Promise<string> {
		console.log(`[IPFS] Publishing CID ${cid} to IPNS`);
		// In a real implementation, this would publish to IPNS
		return 'k51q...' + Math.random().toString(16).substr(2, 40);
	}
}

let ipfsClient: IPFSClient | null = null;

export async function onLoad(context: unknown): Promise<void> {
	console.log('[IPFS Plugin] Loading...');
	
	// Load config from environment or plugin config
	const envConfig = {
		gateway: (typeof process !== 'undefined' ? process.env.IPFS_GATEWAY : undefined) || 'https://ipfs.io',
		apiEndpoint: (typeof process !== 'undefined' ? process.env.IPFS_API_ENDPOINT : undefined) || 'http://localhost:5001',
		useCustomGateway: (typeof process !== 'undefined' ? process.env.IPFS_USE_CUSTOM_GATEWAY : undefined) === 'true'
	};

	config = { ...config, ...envConfig };

	// Initialize IPFS client
	ipfsClient = new IPFSClient(config);

	console.log(`[IPFS Plugin] Loaded successfully`);
	console.log(`[IPFS Plugin] Gateway: ${config.gateway}`);
	console.log(`[IPFS Plugin] API Endpoint: ${config.apiEndpoint}`);
}

export async function onUnload(context: unknown): Promise<void> {
	console.log('[IPFS Plugin] Unloading...');
	ipfsClient = null;
}

// API handlers
export async function healthCheck(context: unknown, request: unknown): Promise<Response> {
	return new Response(JSON.stringify({
		status: 'ok',
		gateway: config.gateway,
		apiEndpoint: config.apiEndpoint,
		useCustomGateway: config.useCustomGateway
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function add(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const formData = await (request as Request).formData();
		const file = formData.get('file') as File;
		const filename = formData.get('filename') as string || file.name;

		if (!file) {
			return new Response(JSON.stringify({ error: 'No file provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const result = await ipfsClient.add(buffer, filename);

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function get(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const cid = url.pathname.split('/').pop();

		if (!cid) {
			return new Response(JSON.stringify({ error: 'No CID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const data = await ipfsClient.get(cid);

		return new Response(data, {
			headers: { 'Content-Type': 'application/octet-stream' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function cat(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const cid = url.pathname.split('/').pop();

		if (!cid) {
			return new Response(JSON.stringify({ error: 'No CID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const data = await ipfsClient.cat(cid);

		return new Response(data, {
			headers: { 'Content-Type': 'application/octet-stream' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function pin(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const body = await (request as Request).json();
		const cid = body.cid;

		if (!cid) {
			return new Response(JSON.stringify({ error: 'No CID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const result = await ipfsClient.pin(cid);

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function unpin(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const cid = url.pathname.split('/').pop();

		if (!cid) {
			return new Response(JSON.stringify({ error: 'No CID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await ipfsClient.unpin(cid);

		return new Response(JSON.stringify({ success: true }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function ls(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const cid = url.pathname.split('/').pop();

		if (!cid) {
			return new Response(JSON.stringify({ error: 'No CID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const result = await ipfsClient.ls(cid);

		return new Response(JSON.stringify({ links: result }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function resolve(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const name = url.pathname.split('/').pop();

		if (!name) {
			return new Response(JSON.stringify({ error: 'No name provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const cid = await ipfsClient.resolve(name);

		return new Response(JSON.stringify({ name, cid }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function publish(context: unknown, request: unknown): Promise<Response> {
	if (!ipfsClient) {
		return new Response(JSON.stringify({ error: 'IPFS client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const body = await (request as Request).json();
		const cid = body.cid;

		if (!cid) {
			return new Response(JSON.stringify({ error: 'No CID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const name = await ipfsClient.publish(cid);

		return new Response(JSON.stringify({ name }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function configure(context: unknown, request: unknown): Promise<Response> {
	try {
		const body = await (request as Request).json();
		
		config = { ...config, ...body };
		
		// Reinitialize client with new config
		ipfsClient = new IPFSClient(config);

		return new Response(JSON.stringify({ success: true, config }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
