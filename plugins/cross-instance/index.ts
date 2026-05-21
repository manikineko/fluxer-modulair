// biome-ignore lint: plugins are portable and may not have access to Node.js types at compile time
// biome-ignore lint: using any for plugin API compatibility
// biome-ignore lint: Buffer and process are Node.js globals, available in Node runtime

interface FederationConfig {
	enabled: boolean;
	fluxerAppUrl: string;
	fluxerAppApiKey: string;
	autoSync: boolean;
	syncInterval: number;
	relayEnabled: boolean;
}

interface Instance {
	id: string;
	url: string;
	apiKey?: string;
	status: 'online' | 'offline' | 'unknown';
	lastSync?: number;
	connected: boolean;
}

interface SyncResult {
	success: boolean;
	synced: number;
	failed: number;
	timestamp: number;
}

let config: FederationConfig = {
	enabled: true,
	fluxerAppUrl: 'https://fluxer.app',
	fluxerAppApiKey: '',
	autoSync: true,
	syncInterval: 300000,
	relayEnabled: true
};

let instances: Map<string, Instance> = new Map();
let syncInterval: ReturnType<typeof setInterval> | null = null;

class FederationClient {
	private config: FederationConfig;

	constructor(config: FederationConfig) {
		this.config = config;
	}

	async getInstanceStatus(url: string): Promise<'online' | 'offline' | 'unknown'> {
		console.log(`[Federation] Checking status of instance: ${url}`);
		// In a real implementation, this would make an HTTP request to the instance
		// For portability, we'll implement a stub
		return 'online';
	}

	async syncWithInstance(instance: Instance): Promise<SyncResult> {
		console.log(`[Federation] Syncing with instance: ${instance.id} (${instance.url})`);
		// In a real implementation, this would sync data between instances
		return {
			success: true,
			synced: 0,
			failed: 0,
			timestamp: Date.now()
		};
	}

	async broadcast(message: unknown): Promise<void> {
		console.log(`[Federation] Broadcasting message to ${instances.size} instances`);
		// In a real implementation, this would send the message to all connected instances
	}

	async relayToInstance(instanceId: string, message: unknown): Promise<void> {
		const instance = instances.get(instanceId);
		if (!instance) {
			throw new Error(`Instance ${instanceId} not found`);
		}
		console.log(`[Federation] Relaying message to instance: ${instanceId}`);
		// In a real implementation, this would relay the message to the specific instance
	}

	async connectToFluxerApp(): Promise<boolean> {
		console.log(`[Federation] Connecting to fluxer.app: ${this.config.fluxerAppUrl}`);
		// In a real implementation, this would authenticate with fluxer.app
		return true;
	}

	async getFluxerAppStatus(): Promise<{ connected: boolean; lastSync?: number }> {
		console.log(`[Federation] Getting fluxer.app status`);
		// In a real implementation, this would check the connection status
		return {
			connected: true,
			lastSync: Date.now()
		};
	}
}

let federationClient: FederationClient | null = null;

export async function onLoad(context: unknown): Promise<void> {
	console.log('[Federation Plugin] Loading...');
	
	// Load config from environment or plugin config
	const envConfig = {
		enabled: (typeof process !== 'undefined' ? process.env.FEDERATION_ENABLED : undefined) !== 'false',
		fluxerAppUrl: (typeof process !== 'undefined' ? process.env.FLUXER_APP_URL : undefined) || 'https://fluxer.app',
		fluxerAppApiKey: (typeof process !== 'undefined' ? process.env.FLUXER_APP_API_KEY : undefined) || '',
		autoSync: (typeof process !== 'undefined' ? process.env.FEDERATION_AUTO_SYNC : undefined) !== 'false',
		syncInterval: parseInt((typeof process !== 'undefined' ? process.env.FEDERATION_SYNC_INTERVAL : undefined) || '300000', 10),
		relayEnabled: (typeof process !== 'undefined' ? process.env.FEDERATION_RELAY_ENABLED : undefined) !== 'false'
	};

	config = { ...config, ...envConfig };

	// Initialize federation client
	federationClient = new FederationClient(config);

	// Start auto-sync if enabled
	if (config.autoSync && config.enabled) {
		syncInterval = setInterval(() => {
			performAutoSync();
		}, config.syncInterval);
	}

	console.log(`[Federation Plugin] Loaded successfully`);
	console.log(`[Federation Plugin] Fluxer.app URL: ${config.fluxerAppUrl}`);
	console.log(`[Federation Plugin] Auto-sync: ${config.autoSync}`);
	console.log(`[Federation Plugin] Relay enabled: ${config.relayEnabled}`);
}

export async function onUnload(context: unknown): Promise<void> {
	console.log('[Federation Plugin] Unloading...');
	
	if (syncInterval) {
		clearInterval(syncInterval);
		syncInterval = null;
	}
	
	federationClient = null;
}

export async function onRequest(context: unknown, request: unknown): Promise<void> {
	// Handle incoming federation requests from other instances
	// In a real implementation, this would handle relayed requests
	console.log('[Federation Plugin] Handling incoming request');
}

async function performAutoSync(): Promise<void> {
	if (!federationClient || !config.enabled) return;

	console.log('[Federation Plugin] Performing auto-sync...');
	
	for (const [id, instance] of instances.entries()) {
		if (instance.connected) {
			try {
				await federationClient.syncWithInstance(instance);
				instance.lastSync = Date.now();
				instances.set(id, instance);
			} catch (error: unknown) {
				console.error(`[Federation Plugin] Sync failed for instance ${id}:`, error);
			}
		}
	}
}

// API handlers
export async function healthCheck(context: unknown, request: unknown): Promise<Response> {
	return new Response(JSON.stringify({
		status: 'ok',
		enabled: config.enabled,
		fluxerAppUrl: config.fluxerAppUrl,
		instancesCount: instances.size,
		relayEnabled: config.relayEnabled
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function listInstances(context: unknown, request: unknown): Promise<Response> {
	return new Response(JSON.stringify({
		instances: Array.from(instances.values())
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function addInstance(context: unknown, request: unknown): Promise<Response> {
	try {
		const body = await (request as Request).json();
		const id = body.id || `instance-${Date.now()}`;
		
		const instance: Instance = {
			id,
			url: body.url,
			apiKey: body.apiKey,
			status: 'unknown',
			connected: false
		};

		instances.set(id, instance);

		return new Response(JSON.stringify({ success: true, instance }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function removeInstance(context: unknown, request: unknown): Promise<Response> {
	try {
		const url = new URL((request as Request).url);
		const id = url.pathname.split('/').pop();

		if (!id) {
			return new Response(JSON.stringify({ error: 'No instance ID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		instances.delete(id);

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

export async function syncWithInstance(context: unknown, request: unknown): Promise<Response> {
	if (!federationClient) {
		return new Response(JSON.stringify({ error: 'Federation client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const instanceId = url.pathname.split('/').pop();

		if (!instanceId) {
			return new Response(JSON.stringify({ error: 'No instance ID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const instance = instances.get(instanceId);
		if (!instance) {
			return new Response(JSON.stringify({ error: 'Instance not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const result = await federationClient.syncWithInstance(instance);
		instance.lastSync = result.timestamp;
		instances.set(instanceId, instance);

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

export async function broadcast(context: unknown, request: unknown): Promise<Response> {
	if (!federationClient) {
		return new Response(JSON.stringify({ error: 'Federation client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const body = await (request as Request).json();
		
		await federationClient.broadcast(body.message);

		return new Response(JSON.stringify({ success: true, instances: instances.size }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function relay(context: unknown, request: unknown): Promise<Response> {
	if (!federationClient) {
		return new Response(JSON.stringify({ error: 'Federation client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const body = await (request as Request).json();
		const { instanceId, message } = body;

		if (!instanceId) {
			return new Response(JSON.stringify({ error: 'No instance ID provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await federationClient.relayToInstance(instanceId, message);

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

export async function configure(context: unknown, request: unknown): Promise<Response> {
	try {
		const body = await (request as Request).json();
		
		config = { ...config, ...body };
		
		// Reinitialize client with new config
		federationClient = new FederationClient(config);

		// Restart auto-sync if needed
		if (syncInterval) {
			clearInterval(syncInterval);
		}
		if (config.autoSync && config.enabled) {
			syncInterval = setInterval(() => {
				performAutoSync();
			}, config.syncInterval);
		}

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

export async function fluxerAppStatus(context: unknown, request: unknown): Promise<Response> {
	if (!federationClient) {
		return new Response(JSON.stringify({ error: 'Federation client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const status = await federationClient.getFluxerAppStatus();

		return new Response(JSON.stringify(status), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function connectToFluxerApp(context: unknown, request: unknown): Promise<Response> {
	if (!federationClient) {
		return new Response(JSON.stringify({ error: 'Federation client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const body = await (request as Request).json();
		
		if (body.apiKey) {
			config.fluxerAppApiKey = body.apiKey;
		}
		if (body.url) {
			config.fluxerAppUrl = body.url;
		}

		federationClient = new FederationClient(config);
		const connected = await federationClient.connectToFluxerApp();

		return new Response(JSON.stringify({ success: connected, config }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: unknown) {
		return new Response(JSON.stringify({ error: (error as Error).message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
