/*
 * Copyright (C) 2026 Fluxer Contributors
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from ConfigSchema.json by schema/bundle.ts
 */

import {z} from 'zod';

export const PasskeysSchema = z.object({
	rp_name: z.string().describe("Relying Party name displayed to users.").default("Fluxer"),
	rp_id: z.string().describe("Relying Party ID (domain) for WebAuthn credentials.").default("fluxer.app"),
	additional_allowed_origins: z.array(z.string()).describe("List of allowed origins for WebAuthn registration/authentication.").default(["https://web.fluxer.app","https://web.canary.fluxer.app"]),
});

export const BlueskyKeySchema = z.object({
	kid: z.string().describe("JSON Web Key ID used when signing private key JWTs."),
	private_key: z.string().describe("PEM-encoded private key used to authenticate to the Bluesky token endpoint.").optional(),
	private_key_path: z.string().describe("Absolute filesystem path to a PEM private key file. Must be an absolute path because services may run from different working directories. Use this instead of private_key to avoid embedding the key in the config.").optional(),
});

export const BlueskySchema = z.object({
	enabled: z.boolean().describe("Whether Bluesky OAuth connections are enabled.").default(true),
	client_name: z.string().describe("Human-readable client name exposed to Bluesky.").default("Fluxer"),
	client_uri: z.string().describe("URI describing the client application.").default(""),
	logo_uri: z.string().describe("Optional logo presented during authorization.").default("https://fluxerstatic.com/web/apple-touch-icon.png"),
	tos_uri: z.string().describe("Terms of service URI exposed to Bluesky.").default("https://fluxer.app/terms"),
	policy_uri: z.string().describe("Privacy policy URI exposed to Bluesky.").default("https://fluxer.app/privacy"),
	keys: z.array(BlueskyKeySchema).describe("Key definitions used to sign private key JWT assertions.").default([]),
});

export const VapidSchema = z.object({
	public_key: z.string().describe("VAPID Public Key."),
	private_key: z.string().describe("VAPID Private Key."),
	email: z.string().describe("Contact email included in push service requests.").default(""),
});

export const AuthSchema = z.object({
	sudo_mode_secret: z.string().describe("Secret key for verifying sudo mode tokens."),
	connection_initiation_secret: z.string().describe("Secret key for signing connection initiation tokens."),
	passkeys: PasskeysSchema.describe("Passkey configuration.").default(() => PasskeysSchema.parse({})),
	vapid: VapidSchema.describe("Web Push VAPID configuration."),
	bluesky: BlueskySchema.describe("Bluesky OAuth client configuration.").default({"enabled":true,"client_name":"Fluxer","client_uri":"","logo_uri":"https://fluxerstatic.com/web/apple-touch-icon.png","tos_uri":"https://fluxer.app/terms","policy_uri":"https://fluxer.app/privacy","keys":[]}),
});

export const CookieSchema = z.object({
	domain: z.string().describe("Domain attribute for cookies. Leave empty for host-only.").default(""),
	secure: z.boolean().describe("If true, sets the Secure flag on cookies.").default(false),
});

export const RateLimitSchema = z.object({
	limit: z.number().min(1).describe("Maximum number of requests allowed within the window.").optional(),
	window_ms: z.number().min(1).describe("Time window in milliseconds.").optional(),
});

export const CassandraSchema = z.object({
	hosts: z.array(z.string()).describe("Array of Cassandra contact points (hostnames or IPs)."),
	keyspace: z.string().describe("Cassandra keyspace name."),
	local_dc: z.string().describe("Local Data Center name for topology awareness."),
	username: z.string().describe("Cassandra authentication username."),
	password: z.string().describe("Cassandra authentication password."),
});

export const DatabaseSchema = z.object({
	backend: z.enum(["cassandra", "sqlite"]).describe("Selected database backend. 'sqlite' is for dev/single-node, 'cassandra' for production."),
	cassandra: CassandraSchema.describe("Configuration settings for Cassandra backend.").optional(),
	sqlite_path: z.string().describe("Filesystem path to the SQLite database file.").default("./data/fluxer.db"),
});

export const S3BucketsSchema = z.object({
	cdn: z.string().describe("Bucket for CDN assets.").default("fluxer"),
	uploads: z.string().describe("Bucket for user uploads.").default("fluxer-uploads"),
	downloads: z.string().describe("Bucket for downloads.").default("fluxer-downloads"),
	reports: z.string().describe("Bucket for report data.").default("fluxer-reports"),
	harvests: z.string().describe("Bucket for data harvests.").default("fluxer-harvests"),
	static: z.string().describe("Bucket for static site assets.").default("fluxer-static"),
});

export const S3Schema = z.object({
	endpoint: z.string().describe("S3 service endpoint URL.").default("http://localhost:3900"),
	presigned_url_base: z.string().describe("Base URL for presigned download URLs. If not set, defaults to the endpoint value. Set this to a public URL when the endpoint is internal.").optional(),
	region: z.string().describe("S3 region.").default("local"),
	access_key_id: z.string().describe("S3 Access Key ID."),
	secret_access_key: z.string().describe("S3 Secret Access Key."),
	buckets: S3BucketsSchema.describe("Mapping of logical buckets to actual S3 bucket names.").default(() => S3BucketsSchema.parse({})),
});

export const DiscoverySchema = z.object({
	enabled: z.boolean().describe("Whether guild discovery is enabled on this instance.").default(true),
	min_member_count: z.number().describe("Minimum number of members a guild needs before it can apply for discovery listing.").default(1),
});

export const DomainSchema = z.object({
	base_domain: z.string().describe("The primary domain name (e.g., example.com, localhost)."),
	public_scheme: z.enum(["http", "https"]).describe("The URL scheme for public endpoints.").default("http"),
	internal_scheme: z.enum(["http", "https"]).describe("The URL scheme for internal endpoints.").default("http"),
	public_port: z.number().describe("The public-facing port number.").default(8088),
	internal_port: z.number().describe("The internal port number.").default(8088),
	static_cdn_domain: z.string().describe("Separate domain for static CDN assets (optional).").default("fluxerstatic.com"),
	invite_domain: z.string().describe("Domain for short invite links (optional).").default(""),
	gift_domain: z.string().describe("Domain for gift links (optional).").default(""),
});

export const EndpointOverridesSchema = z.object({
	api: z.string().describe("Full URL override for the API endpoint.").optional(),
	api_client: z.string().describe("Full URL override for the client-facing API endpoint.").optional(),
	app: z.string().describe("Full URL override for the Web App endpoint.").optional(),
	gateway: z.string().describe("Full URL override for the Gateway (WebSocket) endpoint.").optional(),
	media: z.string().describe("Full URL override for the Media endpoint.").optional(),
	static_cdn: z.string().describe("Full URL override for the Static CDN endpoint.").optional(),
	admin: z.string().describe("Full URL override for the Admin Panel endpoint.").optional(),
	marketing: z.string().describe("Full URL override for the Marketing Site endpoint.").optional(),
	invite: z.string().describe("Full URL override for Invite links.").optional(),
	gift: z.string().describe("Full URL override for Gift links.").optional(),
});

export const InternalSchema = z.object({
	kv: z.string().describe("Internal Valkey/Redis URL for key-value operations.").default("redis://localhost:6379/0"),
	kv_mode: z.enum(["standalone", "cluster"]).describe("Valkey/Redis connection mode. Use 'standalone' for a single node or 'cluster' for a Valkey/Redis cluster.").default("standalone"),
	kv_cluster_nodes: z.array(z.object({
		host: z.string(),
		port: z.number(),
	})).describe("List of cluster node URLs when kv_mode is 'cluster'. Each entry should be a host:port string.").default([]),
	kv_cluster_nat_map: z.object({}).describe("NAT mapping for Valkey/Redis cluster nodes. Maps internal addresses to external addresses for NAT traversal.").default(() => ({})),
	queue: z.string().describe("Internal URL for the Queue service.").default("http://localhost:8088/queue"),
	media_proxy: z.string().describe("Internal URL for the Media Proxy service.").default("http://localhost:8088/media"),
});

export const InstanceSchema = z.object({
	deployment_mode: z.enum(["monolith", "microservices"]).describe("Deployment mode. 'monolith' runs all services in one process (fluxer_server). 'microservices' requires separate processes/ports.").default("monolith"),
	self_hosted: z.boolean().describe("Indicates if this is a self-hosted instance.").default(true),
	auto_join_invite_code: z.string().describe("Invite code to auto-join users to a guild upon registration.").default(""),
	visionaries_guild_id: z.string().describe("Guild ID for Visionary members.").default(""),
	operators_guild_id: z.string().describe("Guild ID for Operators.").default(""),
	private_key_path: z.string().describe("Path to the x25519 private key for E2E encryption (generated on first startup if missing).").default(""),
});

export const FederationSchema = z.object({
	enabled: z.boolean().describe("Enable federation with other Fluxer instances.").default(false),
});

export const CsamSchema = z.object({
	evidence_retention_days: z.number().describe("Days to retain evidence.").default(730),
	job_retention_days: z.number().describe("Days to retain reporting jobs.").default(365),
	cleanup_batch_size: z.number().describe("Batch size for cleanup operations.").default(100),
	queue: z.object({
		timeout_ms: z.number().describe("Maximum time to wait for a scan result (ms).").default(30000),
		max_entries_per_batch: z.number().describe("Maximum queue entries to process per consumer run.").default(5),
		consumer_lock_ttl_seconds: z.number().describe("TTL for consumer lock (seconds).").default(5),
	}).describe("CSAM scan queue configuration.").optional(),
});

export const DevSchema = z.object({
	relax_registration_rate_limits: z.boolean().describe("Relax rate limits for registration.").default(false),
	disable_rate_limits: z.boolean().describe("Disable all rate limits.").default(false),
	test_mode_enabled: z.boolean().describe("Enable test mode behaviors.").default(false),
	test_harness_token: z.string().describe("Token for the test harness.").default(""),
});

export const GeoipSchema = z.object({
	maxmind_db_path: z.string().describe("Path to MaxMind GeoIP database.").default(""),
});

export const ProxySchema = z.object({
	trust_cf_connecting_ip: z.boolean().describe("Trust Cloudflare's CF-Connecting-IP header.").default(false),
});

export const CaptchaProviderSchema = z.object({
	site_key: z.string().describe("Public site key.").default(""),
	secret_key: z.string().describe("Secret key for server-side verification.").default(""),
});

export const CaptchaIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable CAPTCHA verification.").default(false),
	provider: z.enum(["hcaptcha", "turnstile", "none"]).describe("Selected CAPTCHA provider.").default("none"),
	hcaptcha: CaptchaProviderSchema.describe("hCaptcha settings.").default(() => CaptchaProviderSchema.parse({})),
	turnstile: CaptchaProviderSchema.describe("Cloudflare Turnstile settings.").default(() => CaptchaProviderSchema.parse({})),
});

export const ClamavIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable ClamAV scanning.").default(false),
	host: z.string().describe("ClamAV host.").default("clamav"),
	port: z.number().describe("ClamAV port.").default(3310),
	fail_open: z.boolean().describe("If true, allow files if scanning fails.").default(true),
});

export const CloudflareSchema = z.object({
	purge_enabled: z.boolean().describe("Enable automatic cache purging.").default(false),
	zone_id: z.string().describe("Cloudflare Zone ID.").default(""),
	api_token: z.string().describe("Cloudflare API token for cache purge.").default(""),
});

export const CsamIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable CSAM scanning.").default(false),
	provider: z.enum(["photo_dna", "arachnid_shield"]).describe("The CSAM scanning provider to use.").default("photo_dna"),
	photo_dna: z.object({
		hash_service_url: z.string().describe("URL for the hash generation service.").default(""),
		hash_service_timeout_ms: z.number().describe("Timeout for hash generation in milliseconds.").default(15000),
		match_endpoint: z.string().describe("URL for the PhotoDNA match service.").default(""),
		subscription_key: z.string().describe("Subscription key for the match service.").default(""),
		match_enhance: z.boolean().describe("Enable enhanced matching.").default(false),
		rate_limit_rps: z.number().describe("Rate limit requests per second.").default(5),
	}).describe("PhotoDNA provider configuration.").optional(),
	arachnid_shield: z.object({
		endpoint: z.string().describe("Arachnid Shield API endpoint.").default("https://shield.projectarachnid.com/v1/media"),
		username: z.string().describe("Basic auth username.").default(""),
		password: z.string().describe("Basic auth password.").default(""),
		timeout_ms: z.number().describe("Request timeout in milliseconds.").default(30000),
		max_retries: z.number().describe("Maximum number of retry attempts.").default(3),
		retry_backoff_ms: z.number().describe("Base backoff time for retries in milliseconds.").default(1000),
	}).describe("Arachnid Shield provider configuration.").optional(),
});

export const SmtpEmailSchema = z.object({
	host: z.string().describe("SMTP server hostname."),
	port: z.number().describe("SMTP port number.").default(587),
	username: z.string().describe("SMTP authentication username."),
	password: z.string().describe("SMTP authentication password."),
	secure: z.boolean().describe("Use TLS when connecting to the SMTP server.").default(true),
});

export const EmailIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable email sending.").default(false),
	provider: z.enum(["smtp", "none"]).describe("Email provider selection.").default("none"),
	webhook_secret: z.string().describe("Sweego webhook signing secret (base64-encoded).").optional(),
	from_email: z.string().describe("Default sender email address.").default(""),
	from_name: z.string().describe("Default sender name.").default("Fluxer"),
	smtp: SmtpEmailSchema.optional(),
});

export const GifSchema = z.object({
	provider: z.enum(["klipy", "tenor"]).describe("GIF provider to use for GIF search and sharing.").default("klipy"),
});

export const SmsIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable SMS sending.").default(false),
	account_sid: z.string().describe("Twilio account SID.").optional(),
	auth_token: z.string().describe("Twilio auth token.").optional(),
	verify_service_sid: z.string().describe("Twilio Verify service SID.").optional(),
});

export const VoiceIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable voice/video features.").default(false),
	api_key: z.string().describe("LiveKit API Key used for config-driven default_region bootstrap. Optional when voice topology is managed in the admin panel.").optional(),
	api_secret: z.string().describe("LiveKit API Secret used for config-driven default_region bootstrap. Optional when voice topology is managed in the admin panel.").optional(),
	webhook_url: z.string().describe("URL for LiveKit webhooks.").default(""),
	url: z.string().describe("LiveKit Server URL (client signal endpoint for WebSocket connections).").default(""),
	default_region: z.object({
		id: z.string().describe("Unique identifier for the region (e.g. 'default', 'eu-west')."),
		name: z.string().describe("Display name for the region."),
		emoji: z.string().describe("Emoji icon for the region (e.g. '🌐', '🇪🇺')."),
		latitude: z.number().describe("Latitude coordinate for the region."),
		longitude: z.number().describe("Longitude coordinate for the region."),
	}).describe("Default voice region to create on startup if none exist. When provided, automatically creates this region and a server pointing to the configured LiveKit URL.").optional(),
});

export const SearchIntegrationSchema = z.object({
	engine: z.enum(["meilisearch", "elasticsearch"]).describe("Search engine backend to use.").default("meilisearch"),
	url: z.string().describe("Search engine HTTP API URL. Used by both Meilisearch and Elasticsearch.").default("http://127.0.0.1:7700"),
	api_key: z.string().describe("API key for authenticating with the search engine. For Meilisearch, this is the master or admin key. For Elasticsearch, this is an API key.").default(""),
	username: z.string().describe("Username for Elasticsearch basic authentication. Only used when engine is elasticsearch and api_key is not set.").default(""),
	password: z.string().describe("Password for Elasticsearch basic authentication. Only used when engine is elasticsearch and api_key is not set.").default(""),
});

export const StripePricesSchema = z.object({
	monthly_usd: z.string().describe("Monthly subscription USD price ID.").default(""),
	monthly_eur: z.string().describe("Monthly subscription EUR price ID.").default(""),
	yearly_usd: z.string().describe("Yearly subscription USD price ID.").default(""),
	yearly_eur: z.string().describe("Yearly subscription EUR price ID.").default(""),
	visionary_usd: z.string().describe("Visionary tier USD price ID.").default(""),
	visionary_eur: z.string().describe("Visionary tier EUR price ID.").default(""),
	gift_visionary_usd: z.string().describe("Gift Visionary USD price ID.").default(""),
	gift_visionary_eur: z.string().describe("Gift Visionary EUR price ID.").default(""),
	gift_1_month_usd: z.string().describe("Gift 1 Month USD price ID.").default(""),
	gift_1_month_eur: z.string().describe("Gift 1 Month EUR price ID.").default(""),
	gift_1_year_usd: z.string().describe("Gift 1 Year USD price ID.").default(""),
	gift_1_year_eur: z.string().describe("Gift 1 Year EUR price ID.").default(""),
});

export const StripeIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable Stripe payments.").default(false),
	secret_key: z.string().describe("Stripe Secret Key.").optional(),
	webhook_secret: z.string().describe("Stripe Webhook Signing Secret.").optional(),
	prices: StripePricesSchema.describe("Stripe Price ID configuration.").optional(),
});

export const PhotoDnaIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable PhotoDNA.").default(false),
	hash_service_url: z.string().describe("URL for the hash generation service.").default(""),
	hash_service_timeout_ms: z.number().describe("Timeout for hash generation.").default(15000),
	match_endpoint: z.string().describe("URL for the match service.").default(""),
	subscription_key: z.string().describe("Subscription key for the match service.").default(""),
	match_enhance: z.boolean().describe("Enable enhanced matching.").default(false),
	rate_limit_rps: z.number().describe("Rate limit requests per second.").default(5),
});

export const NcmecIntegrationSchema = z.object({
	enabled: z.boolean().describe("Enable NCMEC reporting.").default(false),
	base_url: z.string().describe("Base URL for the CyberTipline Reporting API (e.g., https://report.cybertip.org/ispws).").default(""),
	username: z.string().describe("Username for CyberTipline basic authentication.").default(""),
	password: z.string().describe("Password for CyberTipline basic authentication.").default(""),
});

export const KlipySchema = z.object({
	api_key: z.string().describe("KLIPY API Key.").default(""),
});

export const TenorSchema = z.object({
	api_key: z.string().describe("Tenor API key.").default(""),
});

export const YoutubeSchema = z.object({
	api_key: z.string().describe("YouTube API Key.").default(""),
});

export const IntegrationsSchema = z.object({
	email: EmailIntegrationSchema.default(() => EmailIntegrationSchema.parse({})),
	sms: SmsIntegrationSchema.default(() => SmsIntegrationSchema.parse({})),
	captcha: CaptchaIntegrationSchema.default(() => CaptchaIntegrationSchema.parse({})),
	voice: VoiceIntegrationSchema.default(() => VoiceIntegrationSchema.parse({})),
	search: SearchIntegrationSchema.default(() => SearchIntegrationSchema.parse({})),
	stripe: StripeIntegrationSchema.default(() => StripeIntegrationSchema.parse({})),
	photo_dna: PhotoDnaIntegrationSchema.default(() => PhotoDnaIntegrationSchema.parse({})),
	ncmec: NcmecIntegrationSchema.default(() => NcmecIntegrationSchema.parse({})),
	clamav: ClamavIntegrationSchema.default(() => ClamavIntegrationSchema.parse({})),
	gif: GifSchema.default(() => GifSchema.parse({})),
	klipy: KlipySchema.default(() => KlipySchema.parse({})),
	tenor: TenorSchema.default(() => TenorSchema.parse({})),
	youtube: YoutubeSchema.default(() => YoutubeSchema.parse({})),
	cloudflare: CloudflareSchema.default(() => CloudflareSchema.parse({})),
});

export const AdminServiceSchema = z.object({
	port: z.number().describe("Port to listen on.").default(3001),
	secret_key_base: z.string().describe("Base secret key for signing admin session tokens."),
	base_path: z.string().describe("URL base path for the admin interface.").default("/admin"),
	oauth_client_secret: z.string().describe("OAuth Client Secret for admin authentication."),
	rate_limit: RateLimitSchema.describe("Rate limiting configuration for the Admin service.").optional(),
});

export const ApiServiceSchema = z.object({
	port: z.number().describe("Port to listen on.").default(8080),
	host: z.string().describe("Network interface to bind to.").default("0.0.0.0"),
	unfurl_ignored_hosts: z.array(z.string()).describe("List of hostnames or IPs to ignore when unfurling URLs.").default(["localhost","127.0.0.1"]),
});

export const AppProxyServiceSchema = z.object({
	port: z.number().describe("Port to listen on.").default(8773),
	static_cdn_endpoint: z.string().describe("URL endpoint for serving static assets via CDN.").default(""),
	assets_dir: z.string().describe("Filesystem directory containing static assets.").default("./assets"),
});

export const GatewayServiceSchema = z.object({
	port: z.number().describe("Port to listen on.").default(8771),
	admin_reload_secret: z.string().describe("Secret used to trigger code hot-swapping/reloads."),
	identify_rate_limit_enabled: z.boolean().describe("Enable rate limiting for Gateway IDENTIFY opcodes.").default(false),
	push_enabled: z.boolean().describe("Enable push notification delivery.").default(true),
	push_user_guild_settings_cache_mb: z.number().describe("Memory cache size (MB) for user guild settings.").default(1024),
	push_subscriptions_cache_mb: z.number().describe("Memory cache size (MB) for push subscriptions.").default(1024),
	push_blocked_ids_cache_mb: z.number().describe("Memory cache size (MB) for blocked user IDs.").default(1024),
	push_badge_counts_cache_mb: z.number().describe("Memory cache size (MB) for badge counts.").default(256),
	push_badge_counts_cache_ttl_seconds: z.number().describe("TTL in seconds for badge counts cache.").default(60),
	media_proxy_endpoint: z.string().describe("Endpoint URL of the Media Proxy service."),
	logger_level: z.string().describe("Logging level (e.g., debug, info, warn, error).").default("info"),
	release_node: z.string().describe("Erlang node name for the release.").default("fluxer_gateway@gateway"),
	gateway_metrics_enabled: z.boolean().describe("Enable collection of gateway metrics.").default(false),
	gateway_metrics_report_interval_ms: z.number().describe("Interval in milliseconds to report gateway metrics.").default(30000),
	presence_cache_shards: z.number().describe("Number of shards for presence cache.").default(1),
	presence_bus_shards: z.number().describe("Number of shards for presence message bus.").default(1),
	presence_shards: z.number().describe("Number of shards for presence handling.").default(1),
	guild_shards: z.number().describe("Number of shards for guild handling.").default(1),
});

export const MarketingServiceSchema = z.object({
	enabled: z.boolean().describe("Whether to enable the Marketing service within fluxer_server.").default(false),
	port: z.number().describe("Port to listen on.").default(8774),
	host: z.string().describe("Network interface to bind to.").default("0.0.0.0"),
	secret_key_base: z.string().describe("Base secret key for marketing site sessions/tokens."),
	base_path: z.string().describe("URL base path for the marketing site.").default("/marketing"),
});

export const MediaProxyServiceSchema = z.object({
	host: z.string().describe("Network interface to bind to.").default("0.0.0.0"),
	port: z.number().describe("Port to listen on.").default(8080),
	secret_key: z.string().describe("Secret key used to sign and verify media URLs."),
	require_cloudflare_edge: z.boolean().describe("If true, strictly requires requests to originate from Cloudflare edge IPs.").default(false),
	static_mode: z.boolean().describe("If true, enables serving static files directly.").default(false),
	rate_limit: RateLimitSchema.describe("Rate limiting configuration for the Media Proxy.").optional(),
});

export const NatsServicesSchema = z.object({
	core_url: z.string().describe("NATS Core server URL for RPC.").default("nats://127.0.0.1:4222"),
	jetstream_url: z.string().describe("NATS JetStream server URL for job queues.").default("nats://127.0.0.1:4223"),
	auth_token: z.string().describe("Authentication token for NATS connections.").default(""),
});

export const QueueServiceSchema = z.object({
	port: z.number().describe("Port to listen on.").default(8088),
	concurrency: z.number().describe("Number of concurrent worker threads.").default(1),
	data_dir: z.string().describe("Filesystem path to store queue data.").default("./data/queue"),
	default_visibility_timeout_ms: z.number().describe("Default time in milliseconds a message remains invisible after being received.").default(30000),
	snapshot_every_ms: z.number().describe("Interval in milliseconds to take queue snapshots.").default(60000),
	snapshot_after_ops: z.number().describe("Number of operations after which to take a queue snapshot.").default(10000),
	snapshot_zstd_level: z.number().describe("Zstd compression level for snapshots (1-22).").default(3),
	secret: z.string().describe("Secret for queue API authentication.").default(""),
});

export const S3ServiceSchema = z.object({
	port: z.number().describe("Port to listen on.").default(3900),
	host: z.string().describe("Network interface to bind to.").default("0.0.0.0"),
	data_dir: z.string().describe("Filesystem path to store S3 data objects.").default("./data/s3"),
	export_timeout: z.number().describe("Timeout in milliseconds for data export operations.").default(30000),
	rate_limit: RateLimitSchema.describe("Rate limiting configuration for the S3 service.").optional(),
});

export const ServerServiceSchema = z.object({
	host: z.string().describe("Network interface to bind to.").default("0.0.0.0"),
	port: z.number().describe("Port to listen on.").default(8772),
	static_dir: z.string().describe("Path to static assets directory for the web app. Required in production.").optional(),
});

export const ServicesSchema = z.object({
	s3: S3ServiceSchema.default(() => S3ServiceSchema.parse({})),
	nats: NatsServicesSchema.default(() => NatsServicesSchema.parse({})),
	queue: QueueServiceSchema.default(() => QueueServiceSchema.parse({})),
	media_proxy: MediaProxyServiceSchema,
	admin: AdminServiceSchema,
	marketing: MarketingServiceSchema.optional(),
	api: ApiServiceSchema.default(() => ApiServiceSchema.parse({})),
	app_proxy: AppProxyServiceSchema.optional(),
	gateway: GatewayServiceSchema,
	server: ServerServiceSchema.default(() => ServerServiceSchema.parse({})),
});

export const AlertsSchema = z.object({
	webhook_url: z.string().describe("Webhook URL for system alerts.").default(""),
});

export const TelemetrySchema = z.object({
	enabled: z.boolean().describe("Enable OpenTelemetry.").default(false),
	otlp_endpoint: z.string().describe("OTLP collector endpoint.").default(""),
	api_key: z.string().describe("API Key for telemetry service.").default(""),
	service_name: z.string().describe("Service name reported to telemetry.").default("fluxer"),
	environment: z.string().describe("Environment name (dev, prod, etc).").default("development"),
	trace_sampling_ratio: z.number().min(0).max(1).describe("Sampling ratio for traces (0.0 to 1.0).").default(1),
	export_timeout: z.number().min(1).describe("Timeout in milliseconds for exporting telemetry data.").default(30000),
	metric_export_interval_ms: z.number().min(1).describe("Interval in milliseconds between metric exports.").default(60000),
	ignore_incoming_paths: z.array(z.string()).describe("HTTP paths to exclude from tracing.").default(["/_health"]),
});

export const SentrySchema = z.object({
	enabled: z.boolean().describe("Enable Sentry reporting.").default(false),
	dsn: z.string().describe("Sentry DSN.").default(""),
});

export const AppPublicSchema = z.object({
	api_version: z.number().describe("API Version.").default(1),
	bootstrap_api_endpoint: z.string().describe("Bootstrap API endpoint.").default(""),
	bootstrap_api_public_endpoint: z.string().describe("Public Bootstrap API endpoint.").default(""),
	sentry_dsn: z.string().describe("Frontend Sentry DSN.").default(""),
});

export const MasterConfigSchema = z.object({
	$schema: z.string().describe("Optional reference to this JSON Schema for tooling support.").optional(),
	env: z.enum(["development", "production", "test"]).describe("Runtime environment for the application. Controls behavior such as logging verbosity, error details, and optimization levels."),
	domain: DomainSchema.describe("Global domain and port configuration used to derive public endpoints for all services."),
	endpoint_overrides: EndpointOverridesSchema.describe("Manual overrides for specific public endpoints. If set, these take precedence over automatically derived URLs.").optional(),
	internal: InternalSchema.describe("Internal network endpoints for service-to-service communication. Only required for microservices mode.").default(() => InternalSchema.parse({})),
	database: DatabaseSchema.describe("Primary database configuration. Selects the backend (Cassandra vs SQLite) and provides connection details."),
	s3: S3Schema.describe("S3-compatible object storage configuration.").optional(),
	services: ServicesSchema.describe("Configuration for individual Fluxer services."),
	auth: AuthSchema.describe("Authentication and security settings."),
	cookie: CookieSchema.describe("HTTP cookie settings.").default(() => CookieSchema.parse({})),
	integrations: IntegrationsSchema.describe("Third-party service integrations.").default(() => IntegrationsSchema.parse({})),
	instance: InstanceSchema.describe("Instance-specific settings and policies.").default(() => InstanceSchema.parse({})),
	csam: CsamSchema.describe("CSAM (Child Sexual Abuse Material) detection and reporting policies.").default(() => CsamSchema.parse({})),
	dev: DevSchema.describe("Development-only overrides and flags. These should generally be disabled in production.").default(() => DevSchema.parse({})),
	geoip: GeoipSchema.describe("GeoIP database configuration.").default(() => GeoipSchema.parse({})),
	proxy: ProxySchema.describe("Reverse proxy and IP resolution settings.").default(() => ProxySchema.parse({})),
	discovery: DiscoverySchema.describe("Guild discovery listing configuration.").default(() => DiscoverySchema.parse({})),
	attachment_decay_enabled: z.boolean().describe("Whether to automatically delete old attachments.").default(true),
	deletion_grace_period_hours: z.number().describe("Grace period in hours before soft-deleted items are permanently removed.").default(72),
	inactivity_deletion_threshold_days: z.number().describe("Days of inactivity after which data may be subject to deletion.").default(365),
	alerts: AlertsSchema.describe("System alerting configuration.").optional(),
	telemetry: TelemetrySchema.describe("OpenTelemetry configuration.").default(() => TelemetrySchema.parse({})),
	sentry: SentrySchema.describe("Sentry error reporting configuration.").default(() => SentrySchema.parse({})),
	app_public: AppPublicSchema.describe("Public client-side configuration exposed to the frontend.").default(() => AppPublicSchema.parse({})),
	federation: FederationSchema.describe("Federation configuration for connecting with other Fluxer instances.").default(() => FederationSchema.parse({})),
});
export type MasterConfigSchema = z.infer<typeof MasterConfigSchema>;

import type {DerivedEndpoints} from './EndpointDerivation';

export type MasterConfig = MasterConfigSchema & {
	endpoints: DerivedEndpoints;
};
