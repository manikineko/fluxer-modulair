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

import {getBadges, type Badge} from '@fluxer/admin/src/api/Badges';
import {ErrorAlert} from '@fluxer/admin/src/components/ErrorDisplay';
import {Layout} from '@fluxer/admin/src/components/Layout';
import {PageHeader} from '@fluxer/admin/src/components/ui/Layout/PageHeader';
import {Stack} from '@fluxer/admin/src/components/ui/Stack';
import {Text} from '@fluxer/admin/src/components/ui/Typography';
import type {Session} from '@fluxer/admin/src/types/App';
import type {AdminConfig as Config} from '@fluxer/admin/src/types/Config';
import type {Flash} from '@fluxer/hono/src/Flash';
import type {UserAdminResponse} from '@fluxer/schema/src/domains/admin/AdminUserSchemas';
import {Badge as BadgeComponent} from '@fluxer/ui/src/components/Badge';
import {Button} from '@fluxer/ui/src/components/Button';
import {Card} from '@fluxer/ui/src/components/Card';
import {CsrfInput} from '@fluxer/ui/src/components/CsrfInput';
import {EmptyState} from '@fluxer/ui/src/components/EmptyState';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
	TableRow,
} from '@fluxer/ui/src/components/Table';
import type {FC} from 'hono/jsx';
import {AdminACLs} from '@fluxer/constants/src/AdminACLs';

interface BadgesPageProps {
	config: Config;
	session: Session;
	flash: Flash | undefined;
	assetVersion: string;
	csrfToken: string;
	adminAcls: Array<string>;
	currentAdmin: UserAdminResponse | undefined;
}

const BadgesTable: FC<{badges: Array<Badge>; config: Config; csrfToken: string; canDeleteBadge: boolean; canGrantBadge: boolean; canRevokeBadge: boolean}> = ({badges, config, csrfToken, canDeleteBadge, canGrantBadge, canRevokeBadge}) => {
	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableHeaderCell label="Name" />
						<TableHeaderCell label="Type" />
						<TableHeaderCell label="Status" />
						<TableHeaderCell label="Visible" />
						<TableHeaderCell label="Granted Count" />
						<TableHeaderCell label="Priority" />
						<TableHeaderCell label="Created" />
						{(canDeleteBadge || canGrantBadge || canRevokeBadge) && <TableHeaderCell label="Actions" />}
					</TableRow>
				</TableHead>
				<TableBody>
					{badges.map((badge) => (
						<TableRow key={badge.badge_id}>
							<TableCell>
								<Stack gap="sm">
									<strong>{badge.name}</strong>
									<Text size="sm">{badge.description}</Text>
								</Stack>
							</TableCell>
							<TableCell>
								<BadgeComponent text={badge.badge_type} variant="info" />
							</TableCell>
							<TableCell>
								{badge.is_active ? (
									<BadgeComponent text="Active" variant="success" />
								) : (
									<BadgeComponent text="Inactive" variant="warning" />
								)}
							</TableCell>
							<TableCell>
								{badge.is_visible ? (
									<BadgeComponent text="Yes" variant="success" />
								) : (
									<BadgeComponent text="No" variant="warning" />
								)}
							</TableCell>
							<TableCell>{badge.granted_count}</TableCell>
							<TableCell>{badge.priority}</TableCell>
							<TableCell>{new Date(badge.created_at).toLocaleDateString()}</TableCell>
							{(canDeleteBadge || canGrantBadge || canRevokeBadge) && (
								<TableCell>
									<Stack gap="sm">
										{canDeleteBadge && (
											<form method="post" action={`${config.basePath}/badges?action=delete`}>
												<CsrfInput token={csrfToken} />
												<input type="hidden" name="badge_id" value={badge.badge_id} />
												<Button type="submit" variant="danger">
													Delete
												</Button>
											</form>
										)}
										{canGrantBadge && (
											<form method="post" action={`${config.basePath}/badges?action=grant`}>
												<CsrfInput token={csrfToken} />
												<input type="hidden" name="badge_id" value={badge.badge_id} />
												<input type="text" name="user_id" placeholder="User ID" required style={{width: '120px', padding: '4px'}} />
												<Button type="submit" variant="primary">
													Grant
												</Button>
											</form>
										)}
									</Stack>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export const BadgesPage: FC<BadgesPageProps> = ({
	config,
	session,
	flash,
	assetVersion,
	csrfToken,
	adminAcls,
	currentAdmin,
}) => {
	const canCreateBadge = adminAcls.includes(AdminACLs.BADGE_CREATE);
	const canDeleteBadge = adminAcls.includes(AdminACLs.BADGE_DELETE);
	const canGrantBadge = adminAcls.includes(AdminACLs.BADGE_GRANT);
	const canRevokeBadge = adminAcls.includes(AdminACLs.BADGE_REVOKE);

	const canManage = canCreateBadge || canDeleteBadge || canGrantBadge || canRevokeBadge;

	return (
		<Layout
			config={config}
			session={session}
			flash={flash}
			csrfToken={csrfToken}
			title="Badges"
			activePage="badges"
			currentAdmin={currentAdmin}
			assetVersion={assetVersion}
		>
			<Stack gap="lg">
				<PageHeader title="Badge Management" />
				
				{!canManage ? (
					<EmptyState title="You don't have permission to manage badges" />
				) : (
					<BadgesContent config={config} session={session} csrfToken={csrfToken} canCreateBadge={canCreateBadge} canDeleteBadge={canDeleteBadge} canGrantBadge={canGrantBadge} canRevokeBadge={canRevokeBadge} />
				)}
			</Stack>
		</Layout>
	);
};

const BadgesContent: FC<{config: Config; session: Session; csrfToken: string; canCreateBadge: boolean; canDeleteBadge: boolean; canGrantBadge: boolean; canRevokeBadge: boolean}> = async ({config, session, csrfToken, canCreateBadge, canDeleteBadge, canGrantBadge, canRevokeBadge}) => {
	const result = await getBadges(config, session);
	
	if (!result.ok) {
		return <ErrorAlert error={result.error.type} />;
	}
	
	const badges = result.data.badges;
	
	return (
		<Stack gap="md">
			{canCreateBadge && (
				<Card padding="md">
					<Stack gap="md">
						<Text weight="semibold">Create New Badge</Text>
						<form method="post" action={`${config.basePath}/badges?action=create`}>
							<CsrfInput token={csrfToken} />
							<Stack gap="sm">
								<div>
									<label>
										<Text size="sm">Name *</Text>
									</label>
									<input type="text" name="name" required style={{width: '100%', padding: '8px'}} />
								</div>
								<div>
									<label>
										<Text size="sm">Description *</Text>
									</label>
									<input type="text" name="description" required style={{width: '100%', padding: '8px'}} />
								</div>
								<div>
									<label>
										<Text size="sm">Icon Hash *</Text>
									</label>
									<input type="text" name="icon_hash" required style={{width: '100%', padding: '8px'}} />
								</div>
								<div>
									<label>
										<Text size="sm">Badge Type *</Text>
									</label>
									<select name="badge_type" required style={{width: '100%', padding: '8px'}}>
										<option value="">Select Type</option>
										<option value="system">System</option>
										<option value="partner">Partner</option>
										<option value="achievement">Achievement</option>
										<option value="event">Event</option>
										<option value="custom">Custom</option>
									</select>
								</div>
								<div>
									<label>
										<Text size="sm">Priority</Text>
									</label>
									<input type="number" name="priority" defaultValue="100" style={{width: '100%', padding: '8px'}} />
								</div>
								<Button type="submit" variant="primary">
									Create Badge
								</Button>
							</Stack>
						</form>
					</Stack>
				</Card>
			)}
			
			{badges.length === 0 ? (
				<EmptyState title="No badges found" />
			) : (
				<BadgesTable badges={badges} config={config} csrfToken={csrfToken} canDeleteBadge={canDeleteBadge} canGrantBadge={canGrantBadge} canRevokeBadge={canRevokeBadge} />
			)}
		</Stack>
	);
};
