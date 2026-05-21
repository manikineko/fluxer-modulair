// biome-ignore lint: plugins are portable and may not have access to Node.js types at compile time
// biome-ignore lint: using any for plugin API compatibility
// biome-ignore lint: delete is a reserved word, renamed to deleteObject

// biome-ignore lint: @fluxer/plugin is expected to be available in plugin runtime
// biome-ignore lint: Buffer and process are Node.js globals, available in Node runtime

interface S3Config {
	provider: 'minio' | 'backblaze' | 'aws';
	endpoint: string;
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	bucket: string;
	useSSL: boolean;
	forcePathStyle: boolean;
}

interface UploadResult {
	key: string;
	url?: string;
	etag?: string;
}

interface ListResult {
	keys: string[];
	prefixes: string[];
	isTruncated: boolean;
	nextContinuationToken?: string;
}

let config: S3Config = {
	provider: 'minio',
	endpoint: 'http://localhost:9000',
	accessKeyId: '',
	secretAccessKey: '',
	region: 'us-east-1',
	bucket: 'fluxer-storage',
	useSSL: false,
	forcePathStyle: true
};

// Simple S3 client implementation (without external dependencies for portability)
class S3Client {
	private config: S3Config;

	constructor(config: S3Config) {
		this.config = config;
	}

	async upload(key: string, data: Buffer | string, contentType?: string): Promise<UploadResult> {
		// In a real implementation, this would use AWS SDK or similar
		// For portability, we'll implement a stub that logs the operation
		console.log(`[S3] Uploading ${key} to ${this.config.bucket} on ${this.config.provider}`);
		console.log(`[S3] Endpoint: ${this.config.endpoint}`);
		console.log(`[S3] Content-Type: ${contentType || 'application/octet-stream'}`);
		
		// Simulate successful upload
		return {
			key,
			url: `${this.config.endpoint}/${this.config.bucket}/${key}`,
			etag: 'mock-etag'
		};
	}

	async download(key: string): Promise<Buffer> {
		console.log(`[S3] Downloading ${key} from ${this.config.bucket}`);
		// In a real implementation, this would fetch from S3
		return Buffer.from('mock data');
	}

	async delete(key: string): Promise<void> {
		console.log(`[S3] Deleting ${key} from ${this.config.bucket}`);
		// In a real implementation, this would delete from S3
	}

	async list(prefix?: string, continuationToken?: string): Promise<ListResult> {
		console.log(`[S3] Listing objects in ${this.config.bucket} with prefix: ${prefix || ''}`);
		// In a real implementation, this would list objects from S3
		return {
			keys: [],
			prefixes: [],
			isTruncated: false
		};
	}

	async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
		console.log(`[S3] Generating presigned URL for ${key} (expires in ${expiresIn}s)`);
		// In a real implementation, this would generate a presigned URL
		return `${this.config.endpoint}/${this.config.bucket}/${key}?presigned=true&expires=${expiresIn}`;
	}

	async bucketExists(): Promise<boolean> {
		console.log(`[S3] Checking if bucket ${this.config.bucket} exists`);
		// In a real implementation, this would check if bucket exists
		return true;
	}

	async createBucket(): Promise<void> {
		console.log(`[S3] Creating bucket ${this.config.bucket}`);
		// In a real implementation, this would create the bucket
	}
}

let s3Client: S3Client | null = null;

export async function onLoad(context: PluginContext): Promise<void> {
	console.log('[S3 Storage Plugin] Loading...');
	
	// Load config from environment or plugin config
	const envConfig = {
		provider: (process.env.S3_PROVIDER || 'minio') as 'minio' | 'backblaze' | 'aws',
		endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
		accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
		region: process.env.S3_REGION || 'us-east-1',
		bucket: process.env.S3_BUCKET || 'fluxer-storage',
		useSSL: process.env.S3_USE_SSL === 'true',
		forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false'
	};

	config = { ...config, ...envConfig };

	// Initialize S3 client
	s3Client = new S3Client(config);

	// Check/create bucket
	if (!await s3Client.bucketExists()) {
		console.log(`[S3 Storage Plugin] Bucket ${config.bucket} does not exist, creating...`);
		await s3Client.createBucket();
	}

	console.log(`[S3 Storage Plugin] Loaded successfully with provider: ${config.provider}`);
	console.log(`[S3 Storage Plugin] Endpoint: ${config.endpoint}`);
	console.log(`[S3 Storage Plugin] Bucket: ${config.bucket}`);
}

export async function onUnload(context: PluginContext): Promise<void> {
	console.log('[S3 Storage Plugin] Unloading...');
	s3Client = null;
}

// API handlers
export async function healthCheck(context: PluginContext, request: any): Promise<Response> {
	const isConfigured = config.accessKeyId && config.secretAccessKey;
	
	return new Response(JSON.stringify({
		status: 'ok',
		provider: config.provider,
		endpoint: config.endpoint,
		bucket: config.bucket,
		configured: isConfigured
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export async function upload(context: PluginContext, request: any): Promise<Response> {
	if (!s3Client) {
		return new Response(JSON.stringify({ error: 'S3 client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const key = formData.get('key') as string || file.name;

		if (!file) {
			return new Response(JSON.stringify({ error: 'No file provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const result = await s3Client.upload(key, buffer, file.type);

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function download(context: PluginContext, request: any): Promise<Response> {
	if (!s3Client) {
		return new Response(JSON.stringify({ error: 'S3 client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL(request.url);
		const key = url.pathname.split('/').pop();

		if (!key) {
			return new Response(JSON.stringify({ error: 'No key provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const data = await s3Client.download(key);

		return new Response(data, {
			headers: { 'Content-Type': 'application/octet-stream' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function deleteObject(context: unknown, request: unknown): Promise<Response> {
	if (!s3Client) {
		return new Response(JSON.stringify({ error: 'S3 client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL((request as Request).url);
		const key = url.pathname.split('/').pop();

		if (!key) {
			return new Response(JSON.stringify({ error: 'No key provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await s3Client.delete(key);

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

export async function list(context: PluginContext, request: any): Promise<Response> {
	if (!s3Client) {
		return new Response(JSON.stringify({ error: 'S3 client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL(request.url);
		const prefix = url.searchParams.get('prefix') || undefined;
		const continuationToken = url.searchParams.get('continuationToken') || undefined;

		const result = await s3Client.list(prefix, continuationToken);

		return new Response(JSON.stringify(result), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function generatePresignedUrl(context: PluginContext, request: any): Promise<Response> {
	if (!s3Client) {
		return new Response(JSON.stringify({ error: 'S3 client not initialized' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	try {
		const url = new URL(request.url);
		const key = url.pathname.split('/').pop();
		const expiresIn = parseInt(url.searchParams.get('expires') || '3600');

		if (!key) {
			return new Response(JSON.stringify({ error: 'No key provided' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const presignedUrl = await s3Client.generatePresignedUrl(key, expiresIn);

		return new Response(JSON.stringify({ url: presignedUrl }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}

export async function configure(context: PluginContext, request: any): Promise<Response> {
	try {
		const body = await request.json();
		
		config = { ...config, ...body };
		
		// Reinitialize client with new config
		s3Client = new S3Client(config);

		return new Response(JSON.stringify({ success: true, config }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error: any) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
