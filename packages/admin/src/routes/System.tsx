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

/** @jsxRuntime automatic */
/** @jsxImportSource hono/jsx */

import {purgeAssets} from '@fluxer/admin/src/api/Assets';
import {
	addSnowflakeReservation,
	deleteSnowflakeReservation,
	updateInstanceConfig,
} from '@fluxer/admin/src/api/InstanceConfig';
import {getLimitConfig, updateLimitConfig} from '@fluxer/admin/src/api/LimitConfig';
import {disablePlugin, enablePlugin, reloadPlugin, getUIComponents} from '@fluxer/admin/src/api/Plugins';
import {refreshSearchIndex, refreshSearchIndexWithGuild} from '@fluxer/admin/src/api/Search';
import {reloadAllGuilds} from '@fluxer/admin/src/api/System';
import {createPartner, deletePartner, updatePartner} from '@fluxer/admin/src/api/Partners';
import {createBadge, deleteBadge, updateBadge, grantBadge, revokeBadge} from '@fluxer/admin/src/api/Badges';
import {redirectWithFlash} from '@fluxer/admin/src/middleware/Auth';
import {getFirstAccessiblePath} from '@fluxer/admin/src/Navigation';
import {AssetPurgePage} from '@fluxer/admin/src/pages/AssetPurgePage';
import {AuditLogsPage} from '@fluxer/admin/src/pages/AuditLogsPage';
import {BadgesPage} from '@fluxer/admin/src/pages/BadgesPage';
import {GatewayPage} from '@fluxer/admin/src/pages/GatewayPage';
import {InstanceConfigPage} from '@fluxer/admin/src/pages/InstanceConfigPage';
import {LimitConfigPage} from '@fluxer/admin/src/pages/LimitConfigPage';
import {PartnersPage} from '@fluxer/admin/src/pages/PartnersPage';
import {PluginsPage} from '@fluxer/admin/src/pages/PluginsPage';
import {SearchIndexPage} from '@fluxer/admin/src/pages/SearchIndexPage';
import {StrangePlacePage} from '@fluxer/admin/src/pages/StrangePlacePage';
import {getRouteContext} from '@fluxer/admin/src/routes/RouteContext';
import type {RouteFactoryDeps} from '@fluxer/admin/src/routes/RouteTypes';
import {getPageConfig, isSelfHostedOverride} from '@fluxer/admin/src/SelfHostedOverride';
import type {AppContext, AppVariables} from '@fluxer/admin/src/types/App';
import {getOptionalString, type ParsedBody, parseDelimitedStringList} from '@fluxer/admin/src/utils/Forms';
import {
	AddSnowflakeReservationRequest,
	DeleteSnowflakeReservationRequest,
	InstanceConfigUpdateRequest,
	PurgeGuildAssetsRequest,
	RefreshSearchIndexRequest,
	ReloadGuildsRequest,
} from '@fluxer/schema/src/domains/admin/AdminSchemas';
import {Hono} from 'hono';

function trimToUndefined(value: string | undefined): string | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	return trimmed === '' ? undefined : trimmed;
}

function trimToNull(value: string | undefined): string | null {
	return trimToUndefined(value) ?? null;
}

function parseBooleanFlag(value: string | undefined): boolean {
	return value === 'true';
}

function parseHourValue(value: string | undefined): number | null {
	if (!value) return 0;
	const parsed = Number.parseInt(value, 10);
	return Number.isNaN(parsed) ? null : parsed;
}

function buildLimitFilters(formData: ParsedBody): {filters?: {traits?: Array<string>; guildFeatures?: Array<string>}} {
	const traits = parseDelimitedStringList(getOptionalString(formData, 'traits'));
	const guildFeatures = parseDelimitedStringList(getOptionalString(formData, 'guild_features'));
	const filters =
		traits.length > 0 || guildFeatures.length > 0
			? {
					...(traits.length > 0 ? {traits} : {}),
					...(guildFeatures.length > 0 ? {guildFeatures} : {}),
				}
			: undefined;
	return {filters};
}

function redirectInvalidForm(c: AppContext, redirectUrl: string): Response {
	return redirectWithFlash(c, redirectUrl, {message: 'Invalid form data', type: 'error'});
}

export function createSystemRoutes({config, assetVersion, requireAuth}: RouteFactoryDeps) {
	const router = new Hono<{Variables: AppVariables}>();

	function getLandingPath(c: AppContext): string {
		const {adminAcls} = getRouteContext(c);
		const selfHosted = isSelfHostedOverride(c, config);
		const firstPath = getFirstAccessiblePath(adminAcls, {selfHosted});
		return `${config.basePath}${firstPath ?? '/strange-place'}`;
	}

	router.get('/dashboard', requireAuth, async (c) => {
		return c.redirect(getLandingPath(c));
	});

	router.get('/', requireAuth, async (c) => {
		return c.redirect(getLandingPath(c));
	});

	router.get('/strange-place', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		return c.html(
			<StrangePlacePage
				config={pageConfig}
				session={session}
				currentAdmin={currentAdmin}
				flash={flash}
				assetVersion={assetVersion}
				csrfToken={csrfToken}
			/>,
		);
	});

	router.get('/gateway', requireAuth, async (c) => {
		const {session, currentAdmin, flash, adminAcls, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		const page = await GatewayPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			adminAcls,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.post('/gateway', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/gateway`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const action = c.req.query('action');

			if (action === 'reload_all') {
				const guildIds = parseDelimitedStringList(getOptionalString(formData, 'guild_ids'));
				const validation = ReloadGuildsRequest.safeParse({guild_ids: guildIds});
				if (!validation.success) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await reloadAllGuilds(config, session, guildIds);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? `Reload triggered for ${result.data.count} guild(s)` : 'Failed to reload gateways',
					type: result.ok ? 'success' : 'error',
				});
			}

			return redirectWithFlash(c, redirectUrl, {message: 'Unknown action', type: 'error'});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	router.get('/audit-logs', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);
		const query = c.req.query('q');
		const adminUserIdFilter = c.req.query('admin_user_id');
		const targetId = c.req.query('target_id');
		const currentPage = Math.max(0, parseInt(c.req.query('page') ?? '0', 10));

		const page = await AuditLogsPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			query,
			adminUserIdFilter,
			targetId,
			currentPage,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.get('/search-index', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);
		const jobId = c.req.query('job_id');

		const page = await SearchIndexPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			csrfToken,
			jobId,
		});
		return c.html(page ?? '');
	});

	router.post('/search-index', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/search-index`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const indexType = trimToUndefined(getOptionalString(formData, 'index_type'));
			const guildId = trimToUndefined(getOptionalString(formData, 'guild_id'));
			const reason = trimToUndefined(getOptionalString(formData, 'reason'));

			if (!indexType) {
				return redirectInvalidForm(c, redirectUrl);
			}

			const validation = RefreshSearchIndexRequest.safeParse({
				index_type: indexType,
				...(guildId ? {guild_id: guildId} : {}),
			});
			if (!validation.success) {
				return redirectInvalidForm(c, redirectUrl);
			}

			const result = guildId
				? await refreshSearchIndexWithGuild(config, session, indexType, guildId, reason)
				: await refreshSearchIndex(config, session, indexType, reason);

			if (result.ok) {
				return redirectWithFlash(c, `${redirectUrl}?job_id=${result.data.job_id}`, {
					message: `Search index refresh started (Job ID: ${result.data.job_id})`,
					type: 'success',
				});
			}
			return redirectWithFlash(c, redirectUrl, {
				message: 'Failed to start search index refresh',
				type: 'error',
			});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	router.get('/instance-config', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		const page = await InstanceConfigPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.post('/instance-config', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/instance-config`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const action = c.req.query('action');

			if (action === 'update') {
				const startHour = parseHourValue(getOptionalString(formData, 'manual_review_schedule_start_hour_utc'));
				const endHour = parseHourValue(getOptionalString(formData, 'manual_review_schedule_end_hour_utc'));

				if (startHour === null || endHour === null) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const update = {
					manual_review_enabled: parseBooleanFlag(getOptionalString(formData, 'manual_review_enabled')),
					manual_review_schedule_enabled: parseBooleanFlag(
						getOptionalString(formData, 'manual_review_schedule_enabled'),
					),
					manual_review_schedule_start_hour_utc: startHour,
					manual_review_schedule_end_hour_utc: endHour,
					registration_alerts_webhook_url: trimToNull(getOptionalString(formData, 'registration_alerts_webhook_url')),
					system_alerts_webhook_url: trimToNull(getOptionalString(formData, 'system_alerts_webhook_url')),
				};

				const validation = InstanceConfigUpdateRequest.safeParse(update);
				if (!validation.success) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await updateInstanceConfig(config, session, validation.data);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Instance configuration updated' : 'Failed to update instance configuration',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'update_sso') {
				const clearSecret = parseBooleanFlag(getOptionalString(formData, 'sso_clear_client_secret'));
				const newSecret = trimToUndefined(getOptionalString(formData, 'sso_client_secret'));
				const allowedDomains = parseDelimitedStringList(getOptionalString(formData, 'sso_allowed_domains'));

				const sso = {
					enabled: parseBooleanFlag(getOptionalString(formData, 'sso_enabled')),
					auto_provision: parseBooleanFlag(getOptionalString(formData, 'sso_auto_provision')),
					display_name: trimToNull(getOptionalString(formData, 'sso_display_name')),
					issuer: trimToNull(getOptionalString(formData, 'sso_issuer')),
					authorization_url: trimToNull(getOptionalString(formData, 'sso_authorization_url')),
					token_url: trimToNull(getOptionalString(formData, 'sso_token_url')),
					userinfo_url: trimToNull(getOptionalString(formData, 'sso_userinfo_url')),
					jwks_url: trimToNull(getOptionalString(formData, 'sso_jwks_url')),
					client_id: trimToNull(getOptionalString(formData, 'sso_client_id')),
					scope: trimToNull(getOptionalString(formData, 'sso_scope')),
					allowed_domains: allowedDomains,
					client_secret: newSecret ?? (clearSecret ? null : undefined),
				};

				const validation = InstanceConfigUpdateRequest.safeParse({sso});
				if (!validation.success) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await updateInstanceConfig(config, session, validation.data);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'SSO configuration updated' : 'Failed to update SSO configuration',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'add_reservation') {
				if (isSelfHostedOverride(c, config)) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Snowflake reservations are not available on self-hosted instances',
						type: 'error',
					});
				}

				const email = trimToUndefined(getOptionalString(formData, 'reservation_email'));
				const snowflake = trimToUndefined(getOptionalString(formData, 'reservation_snowflake'));
				const validation = AddSnowflakeReservationRequest.safeParse({email, snowflake});

				if (!validation.success) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Email and snowflake ID are required',
						type: 'error',
					});
				}

				const result = await addSnowflakeReservation(config, session, validation.data.email, validation.data.snowflake);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Snowflake reservation added' : 'Failed to add snowflake reservation',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'delete_reservation') {
				if (isSelfHostedOverride(c, config)) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Snowflake reservations are not available on self-hosted instances',
						type: 'error',
					});
				}

				const email = trimToUndefined(getOptionalString(formData, 'reservation_email'));
				const validation = DeleteSnowflakeReservationRequest.safeParse({email});

				if (!validation.success) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Email is required',
						type: 'error',
					});
				}

				const result = await deleteSnowflakeReservation(config, session, validation.data.email);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Snowflake reservation removed' : 'Failed to remove snowflake reservation',
					type: result.ok ? 'success' : 'error',
				});
			}

			return redirectWithFlash(c, redirectUrl, {message: 'Unknown action', type: 'error'});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	router.get('/limit-config', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);
		const selectedRule = c.req.query('rule')?.trim() || undefined;

		const page = await LimitConfigPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			selectedRule,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.post('/limit-config', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/limit-config`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const action = c.req.query('action');
			const ruleId = c.req.query('rule');

			if (action === 'update' && ruleId) {
				const currentConfigResult = await getLimitConfig(config, session);

				if (!currentConfigResult.ok) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Failed to fetch current limit configuration',
						type: 'error',
					});
				}

				const currentConfig = currentConfigResult.data.limit_config;
				const defaultLimits = currentConfigResult.data.defaults;
				const ruleIndex = currentConfig.rules.findIndex((r) => r.id === ruleId);

				if (ruleIndex === -1) {
					return redirectWithFlash(c, redirectUrl, {message: 'Rule not found', type: 'error'});
				}

				const rule = currentConfig.rules[ruleIndex];
				const limits: Record<string, number> = {};

				for (const key in formData) {
					if (key === 'csrf_token' || key === 'rule_id' || key === 'traits' || key === 'guild_features') {
						continue;
					}

					const value = formData[key];
					if (typeof value === 'string' && value.trim() !== '') {
						const numericValue = parseInt(value, 10);
						if (!Number.isNaN(numericValue)) {
							limits[key] = numericValue;
						}
					}
				}

				const {filters} = buildLimitFilters(formData);

				if (Object.keys(limits).length === 0) {
					const fallbackDefaults = defaultLimits[ruleId] ?? defaultLimits.default;
					if (fallbackDefaults) {
						Object.assign(limits, fallbackDefaults);
					}
				}

				currentConfig.rules[ruleIndex] = {
					...rule,
					limits,
					filters,
				};

				const updatedConfigJson = JSON.stringify(currentConfig);
				const result = await updateLimitConfig(config, session, updatedConfigJson);

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Limit configuration updated' : 'Failed to update limit configuration',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'delete' && ruleId) {
				const currentConfigResult = await getLimitConfig(config, session);

				if (!currentConfigResult.ok) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Failed to fetch current limit configuration',
						type: 'error',
					});
				}

				if (ruleId === 'default') {
					return redirectWithFlash(c, redirectUrl, {message: 'The default rule cannot be deleted', type: 'error'});
				}

				const currentConfig = currentConfigResult.data.limit_config;
				const ruleIndex = currentConfig.rules.findIndex((r) => r.id === ruleId);

				if (ruleIndex === -1) {
					return redirectWithFlash(c, redirectUrl, {message: 'Rule not found', type: 'error'});
				}

				currentConfig.rules.splice(ruleIndex, 1);
				const updatedConfigJson = JSON.stringify(currentConfig);
				const result = await updateLimitConfig(config, session, updatedConfigJson);

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Limit rule deleted' : 'Failed to delete limit rule',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'create') {
				const ruleIdInput = getOptionalString(formData, 'rule_id') ?? '';
				const ruleIdTrimmed = ruleIdInput.trim();

				if (ruleIdTrimmed === '') {
					return redirectWithFlash(c, redirectUrl, {message: 'Rule ID is required', type: 'error'});
				}

				if (ruleIdTrimmed === 'default') {
					return redirectWithFlash(c, redirectUrl, {
						message: 'The default rule ID is reserved',
						type: 'error',
					});
				}

				const currentConfigResult = await getLimitConfig(config, session);

				if (!currentConfigResult.ok) {
					return redirectWithFlash(c, redirectUrl, {
						message: 'Failed to fetch current limit configuration',
						type: 'error',
					});
				}

				const currentConfig = currentConfigResult.data.limit_config;
				const existingRule = currentConfig.rules.find((r) => r.id === ruleIdTrimmed);

				if (existingRule) {
					return redirectWithFlash(c, redirectUrl, {message: 'Rule ID already exists', type: 'error'});
				}

				const {filters} = buildLimitFilters(formData);

				const defaultLimits = currentConfigResult.data.defaults.default ?? {};
				const newRule = {
					id: ruleIdTrimmed,
					limits: {...defaultLimits},
					...(filters ? {filters} : {}),
				};

				currentConfig.rules.push(newRule);
				const updatedConfigJson = JSON.stringify(currentConfig);
				const result = await updateLimitConfig(config, session, updatedConfigJson);

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Limit rule created' : 'Failed to create limit rule',
					type: result.ok ? 'success' : 'error',
				});
			}

			return redirectWithFlash(c, redirectUrl, {message: 'Unknown action', type: 'error'});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	router.get('/asset-purge', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		const page = await AssetPurgePage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.post('/asset-purge', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/asset-purge`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const assetIds = parseDelimitedStringList(getOptionalString(formData, 'asset_ids'));

			if (assetIds.length === 0) {
				return redirectWithFlash(c, redirectUrl, {message: 'No asset IDs provided', type: 'error'});
			}

			const validation = PurgeGuildAssetsRequest.safeParse({ids: assetIds});
			if (!validation.success) {
				return redirectInvalidForm(c, redirectUrl);
			}

			const auditLogReason = trimToUndefined(getOptionalString(formData, 'audit_log_reason'));
			const result = await purgeAssets(config, session, assetIds, auditLogReason);
			return redirectWithFlash(c, redirectUrl, {
				message: result.ok ? `Purged ${assetIds.length} asset(s)` : 'Failed to purge assets',
				type: result.ok ? 'success' : 'error',
			});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	router.get('/plugins', requireAuth, async (c) => {
		const {session, currentAdmin, flash, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		const uiComponentsResult = await getUIComponents(pageConfig, session, 'sidebar');
		const uiComponents = uiComponentsResult.ok ? uiComponentsResult.data.components : [];

		const page = await PluginsPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			csrfToken,
			pluginComponents: uiComponents,
		});
		return c.html(page ?? '');
	});

	router.post('/plugins', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/plugins`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const action = getOptionalString(formData, 'action');
			const pluginId = getOptionalString(formData, 'plugin_id');

			if (!pluginId) {
				return redirectWithFlash(c, redirectUrl, {message: 'Plugin ID is required', type: 'error'});
			}

			if (action === 'enable') {
				const result = await enablePlugin(config, session, pluginId);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Plugin enabled' : 'Failed to enable plugin',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'disable') {
				const result = await disablePlugin(config, session, pluginId);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Plugin disabled' : 'Failed to disable plugin',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'reload') {
				const result = await reloadPlugin(config, session, pluginId);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Plugin reloaded' : 'Failed to reload plugin',
					type: result.ok ? 'success' : 'error',
				});
			}

			return redirectWithFlash(c, redirectUrl, {message: 'Unknown action', type: 'error'});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	router.post('/plugins/upload', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/plugins`;

		try {
			const formData = await c.req.formData();
			const file = formData.get('file') as File;

			if (!file) {
				return redirectWithFlash(c, redirectUrl, {message: 'No file provided', type: 'error'});
			}

			if (!file.name.endsWith('.zip')) {
				return redirectWithFlash(c, redirectUrl, {message: 'File must be a .zip file', type: 'error'});
			}

			// Directly proxy the request to the server
			const apiUrl = new URL('/api/plugins/upload', config.apiEndpoint);
			const proxyFormData = new FormData();
			proxyFormData.append('file', file);

			const response = await fetch(apiUrl.toString(), {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.accessToken}`,
				},
				body: proxyFormData,
			});

			const result = (await response.json()) as {success: boolean; pluginId?: string; error?: string};

			if (response.ok) {
				return redirectWithFlash(c, redirectUrl, {
					message: `Plugin uploaded successfully: ${result.pluginId}`,
					type: 'success',
				});
			}

			return redirectWithFlash(c, redirectUrl, {
				message: result.error || 'Failed to upload plugin',
				type: 'error',
			});
		} catch (error) {
			console.error('Upload error:', error);
			return redirectWithFlash(c, redirectUrl, {message: 'Failed to upload plugin', type: 'error'});
		}
	});

	// Partners page
	router.get('/partners', requireAuth, async (c) => {
		const {session, currentAdmin, flash, adminAcls, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		const page = await PartnersPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			adminAcls,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.post('/partners', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/partners`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const action = c.req.query('action');

			if (action === 'create') {
				const name = trimToUndefined(getOptionalString(formData, 'name'));
				const description = trimToUndefined(getOptionalString(formData, 'description'));
				const iconHash = trimToUndefined(getOptionalString(formData, 'icon_hash'));
				const bannerHash = trimToUndefined(getOptionalString(formData, 'banner_hash'));
				const websiteUrl = trimToUndefined(getOptionalString(formData, 'website_url'));
				const supportUrl = trimToUndefined(getOptionalString(formData, 'support_url'));
				const privacyPolicyUrl = trimToUndefined(getOptionalString(formData, 'privacy_policy_url'));
				const termsOfServiceUrl = trimToUndefined(getOptionalString(formData, 'terms_of_service_url'));
				const ownerUserId = trimToUndefined(getOptionalString(formData, 'owner_user_id'));
				const partnerType = trimToUndefined(getOptionalString(formData, 'partner_type'));
				const metadata = trimToUndefined(getOptionalString(formData, 'metadata'));

				if (!name || !ownerUserId || !partnerType) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await createPartner(config, session, {
					name,
					description,
					icon_hash: iconHash,
					banner_hash: bannerHash,
					website_url: websiteUrl,
					support_url: supportUrl,
					privacy_policy_url: privacyPolicyUrl,
					terms_of_service_url: termsOfServiceUrl,
					owner_user_id: ownerUserId,
					partner_type: partnerType as any,
					metadata,
				});

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Partner created successfully' : 'Failed to create partner',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'update') {
				const partnerId = trimToUndefined(getOptionalString(formData, 'partner_id'));
				if (!partnerId) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await updatePartner(config, session, partnerId, {
					name: trimToUndefined(getOptionalString(formData, 'name')),
					description: trimToUndefined(getOptionalString(formData, 'description')),
					icon_hash: trimToUndefined(getOptionalString(formData, 'icon_hash')),
					banner_hash: trimToUndefined(getOptionalString(formData, 'banner_hash')),
					website_url: trimToUndefined(getOptionalString(formData, 'website_url')),
					support_url: trimToUndefined(getOptionalString(formData, 'support_url')),
					privacy_policy_url: trimToUndefined(getOptionalString(formData, 'privacy_policy_url')),
					terms_of_service_url: trimToUndefined(getOptionalString(formData, 'terms_of_service_url')),
					is_active: parseBooleanFlag(getOptionalString(formData, 'is_active')),
					partner_type: trimToUndefined(getOptionalString(formData, 'partner_type')) as any,
					metadata: trimToUndefined(getOptionalString(formData, 'metadata')),
					expires_at: trimToUndefined(getOptionalString(formData, 'expires_at')),
				});

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Partner updated successfully' : 'Failed to update partner',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'delete') {
				const partnerId = trimToUndefined(getOptionalString(formData, 'partner_id'));
				if (!partnerId) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await deletePartner(config, session, partnerId);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Partner deleted successfully' : 'Failed to delete partner',
					type: result.ok ? 'success' : 'error',
				});
			}

			return redirectWithFlash(c, redirectUrl, {message: 'Unknown action', type: 'error'});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	// Badges page
	router.get('/badges', requireAuth, async (c) => {
		const {session, currentAdmin, flash, adminAcls, csrfToken} = getRouteContext(c);
		const pageConfig = getPageConfig(c, config);

		const page = await BadgesPage({
			config: pageConfig,
			session,
			currentAdmin,
			flash,
			assetVersion,
			adminAcls,
			csrfToken,
		});
		return c.html(page ?? '');
	});

	router.post('/badges', requireAuth, async (c) => {
		const session = c.get('session')!;
		const redirectUrl = `${config.basePath}/badges`;

		try {
			const formData = (await c.req.parseBody()) as ParsedBody;
			const action = c.req.query('action');

			if (action === 'create') {
				const name = trimToUndefined(getOptionalString(formData, 'name'));
				const description = trimToUndefined(getOptionalString(formData, 'description'));
				const iconHash = trimToUndefined(getOptionalString(formData, 'icon_hash'));
				const iconColor = trimToUndefined(getOptionalString(formData, 'icon_color'));
				const badgeType = trimToUndefined(getOptionalString(formData, 'badge_type'));
				const isVisible = parseBooleanFlag(getOptionalString(formData, 'is_visible'));
				const priority = trimToUndefined(getOptionalString(formData, 'priority'));

				if (!name || !description || !iconHash || !badgeType) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await createBadge(config, session, {
					name,
					description,
					icon_hash: iconHash,
					icon_color: iconColor ? Number.parseInt(iconColor, 10) : undefined,
					badge_type: badgeType as any,
					is_visible: isVisible,
					priority: priority ? Number.parseInt(priority, 10) : undefined,
				});

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Badge created successfully' : 'Failed to create badge',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'update') {
				const badgeId = trimToUndefined(getOptionalString(formData, 'badge_id'));
				if (!badgeId) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await updateBadge(config, session, badgeId, {
					name: trimToUndefined(getOptionalString(formData, 'name')),
					description: trimToUndefined(getOptionalString(formData, 'description')),
					icon_hash: trimToUndefined(getOptionalString(formData, 'icon_hash')),
					icon_color: trimToUndefined(getOptionalString(formData, 'icon_color')) ? Number.parseInt(trimToUndefined(getOptionalString(formData, 'icon_color'))!, 10) : undefined,
					badge_type: trimToUndefined(getOptionalString(formData, 'badge_type')) as any,
					is_active: parseBooleanFlag(getOptionalString(formData, 'is_active')),
					is_visible: parseBooleanFlag(getOptionalString(formData, 'is_visible')),
					priority: trimToUndefined(getOptionalString(formData, 'priority')) ? Number.parseInt(trimToUndefined(getOptionalString(formData, 'priority'))!, 10) : undefined,
				});

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Badge updated successfully' : 'Failed to update badge',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'delete') {
				const badgeId = trimToUndefined(getOptionalString(formData, 'badge_id'));
				if (!badgeId) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await deleteBadge(config, session, badgeId);
				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Badge deleted successfully' : 'Failed to delete badge',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'grant') {
				const userId = trimToUndefined(getOptionalString(formData, 'user_id'));
				const badgeId = trimToUndefined(getOptionalString(formData, 'badge_id'));
				const reason = trimToUndefined(getOptionalString(formData, 'reason'));
				const expiresAt = trimToUndefined(getOptionalString(formData, 'expires_at'));

				if (!userId || !badgeId) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await grantBadge(config, session, {
					user_id: userId,
					badge_id: badgeId,
					reason,
					expires_at: expiresAt,
				});

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Badge granted successfully' : 'Failed to grant badge',
					type: result.ok ? 'success' : 'error',
				});
			}

			if (action === 'revoke') {
				const userId = trimToUndefined(getOptionalString(formData, 'user_id'));
				const badgeId = trimToUndefined(getOptionalString(formData, 'badge_id'));

				if (!userId || !badgeId) {
					return redirectInvalidForm(c, redirectUrl);
				}

				const result = await revokeBadge(config, session, {
					user_id: userId,
					badge_id: badgeId,
				});

				return redirectWithFlash(c, redirectUrl, {
					message: result.ok ? 'Badge revoked successfully' : 'Failed to revoke badge',
					type: result.ok ? 'success' : 'error',
				});
			}

			return redirectWithFlash(c, redirectUrl, {message: 'Unknown action', type: 'error'});
		} catch {
			return redirectInvalidForm(c, redirectUrl);
		}
	});

	return router;
}
