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

import {getErrorMessage} from '@fluxer/admin/src/api/Errors';
import {getPlugins, type UIComponentDescriptor} from '@fluxer/admin/src/api/Plugins';
import {ErrorAlert} from '@fluxer/admin/src/components/ErrorDisplay';
import {Layout} from '@fluxer/admin/src/components/Layout';
import {Stack} from '@fluxer/admin/src/components/ui/Stack';
import {Caption, Heading, Text} from '@fluxer/admin/src/components/ui/Typography';
import type {Session} from '@fluxer/admin/src/types/App';
import type {AdminConfig as Config} from '@fluxer/admin/src/types/Config';
import type {UserAdminResponse} from '@fluxer/schema/src/domains/admin/AdminUserSchemas';
import {Button} from '@fluxer/ui/src/components/Button';
import {Card} from '@fluxer/ui/src/components/Card';
import {CsrfInput} from '@fluxer/ui/src/components/CsrfInput';
import {FlexRowBetween} from '@fluxer/ui/src/components/Layout';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@fluxer/ui/src/components/Table';
import type {Flash} from '@fluxer/hono/src/Flash';

export interface PluginsPageProps {
	config: Config;
	session: Session;
	currentAdmin: UserAdminResponse | undefined;
	flash: Flash | undefined;
	assetVersion: string;
	csrfToken: string;
	pluginComponents?: Array<UIComponentDescriptor>;
}

export async function PluginsPage({
	config,
	session,
	currentAdmin,
	flash,
	assetVersion,
	csrfToken,
	pluginComponents,
}: PluginsPageProps) {
	const pluginsResult = await getPlugins(config, session);

	if (!pluginsResult.ok) {
		return (
			<Layout
				csrfToken={csrfToken}
				title="Plugins"
				activePage="plugins"
				config={config}
				session={session}
				currentAdmin={currentAdmin}
				flash={flash}
				assetVersion={assetVersion}
				pluginComponents={pluginComponents}
			>
				<ErrorAlert error={getErrorMessage(pluginsResult.error)} />
			</Layout>
		);
	}

	const plugins = pluginsResult.data.plugins;

	return (
		<Layout
			csrfToken={csrfToken}
			title="Plugins"
			activePage="plugins"
			config={config}
			session={session}
			currentAdmin={currentAdmin}
			flash={flash}
			assetVersion={assetVersion}
			pluginComponents={pluginComponents}
		>
			<Stack gap={6}>
				<div>
					<Heading level={1}>Plugins</Heading>
					<Text>Manage instance-wide plugins that apply to all users.</Text>
				</div>

				<Card>
					<Stack gap={4}>
						<Heading level={2}>Upload Plugin</Heading>
						<Text>Upload a zip file containing a plugin to install it.</Text>
						<form method="post" action={`${config.basePath}/plugins/upload`} enctype="multipart/form-data">
							<CsrfInput token={csrfToken} />
							<Stack gap={3}>
								<div>
									<label htmlFor="plugin-file">
										<Caption>Plugin ZIP file</Caption>
									</label>
									<input
										type="file"
										id="plugin-file"
										name="file"
										accept=".zip"
										required
									/>
								</div>
								<Button type="submit" variant="primary">
									Upload Plugin
								</Button>
							</Stack>
						</form>
					</Stack>
				</Card>

				{flash && <Text>{flash.message}</Text>}

				{plugins.length === 0 ? (
					<Card>
						<Text>No plugins installed</Text>
					</Card>
				) : (
					<Card>
						<TableContainer>
							<Table>
								<TableHead>
									<TableRow>
										<TableHeaderCell label="Name" />
										<TableHeaderCell label="Version" />
										<TableHeaderCell label="Description" />
										<TableHeaderCell label="Target" />
										<TableHeaderCell label="Status" />
										<TableHeaderCell label="Actions" />
									</TableRow>
								</TableHead>
								<TableBody>
									{plugins.map((plugin) => (
										<TableRow key={plugin.manifest.id}>
											<TableCell>
												<Stack gap={0}>
													<Text weight="semibold">{plugin.manifest.name}</Text>
													{plugin.manifest.author && <Caption>by {plugin.manifest.author}</Caption>}
												</Stack>
											</TableCell>
											<TableCell>
												<Caption>v{plugin.manifest.version}</Caption>
											</TableCell>
											<TableCell>
												<Text>{plugin.manifest.description}</Text>
											</TableCell>
											<TableCell>
												<Caption>{plugin.manifest.target}</Caption>
											</TableCell>
											<TableCell>
												<Stack gap={2}>
													<Text weight={plugin.enabled ? 'medium' : 'normal'}>
														{plugin.enabled ? 'Enabled' : 'Disabled'}
													</Text>
													<Caption>{plugin.loaded ? 'Loaded' : 'Not Loaded'}</Caption>
												</Stack>
											</TableCell>
											<TableCell>
												<form method="post" action={`${config.basePath}/plugins`}>
													<CsrfInput token={csrfToken} />
													<input type="hidden" name="plugin_id" value={plugin.manifest.id} />
													<FlexRowBetween>
														{plugin.enabled ? (
															<Button type="submit" name="action" value="disable" variant="secondary">
																Disable
															</Button>
														) : (
															<Button type="submit" name="action" value="enable" variant="primary">
																Enable
															</Button>
														)}
														<Button type="submit" name="action" value="reload" variant="secondary">
															Reload
														</Button>
													</FlexRowBetween>
												</form>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>
				)}
			</Stack>
		</Layout>
	);
}
