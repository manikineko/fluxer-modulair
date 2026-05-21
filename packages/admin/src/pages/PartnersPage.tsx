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

import {getPartners, type Partner} from '@fluxer/admin/src/api/Partners';
import {ErrorAlert} from '@fluxer/admin/src/components/ErrorDisplay';
import {Layout} from '@fluxer/admin/src/components/Layout';
import {PageHeader} from '@fluxer/admin/src/components/ui/Layout/PageHeader';
import {Stack} from '@fluxer/admin/src/components/ui/Stack';
import {Text} from '@fluxer/admin/src/components/ui/Typography';
import type {Session} from '@fluxer/admin/src/types/App';
import type {AdminConfig as Config} from '@fluxer/admin/src/types/Config';
import type {Flash} from '@fluxer/hono/src/Flash';
import type {UserAdminResponse} from '@fluxer/schema/src/domains/admin/AdminUserSchemas';
import {Badge} from '@fluxer/ui/src/components/Badge';
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

interface PartnersPageProps {
	config: Config;
	session: Session;
	flash: Flash | undefined;
	assetVersion: string;
	csrfToken: string;
	adminAcls: Array<string>;
	currentAdmin: UserAdminResponse | undefined;
}

const PartnersTable: FC<{partners: Array<Partner>; config: Config; csrfToken: string; canDeletePartner: boolean}> = ({partners, config, csrfToken, canDeletePartner}) => {
	return (
		<TableContainer>
			<Table>
				<TableHead>
					<TableRow>
						<TableHeaderCell label="Name" />
						<TableHeaderCell label="Type" />
						<TableHeaderCell label="Status" />
						<TableHeaderCell label="Owner ID" />
						<TableHeaderCell label="Created" />
						{canDeletePartner && <TableHeaderCell label="Actions" />}
					</TableRow>
				</TableHead>
				<TableBody>
					{partners.map((partner) => (
						<TableRow key={partner.partner_id}>
							<TableCell>
								<Stack gap="sm">
									<strong>{partner.name}</strong>
									{partner.description && <Text size="sm">{partner.description}</Text>}
								</Stack>
							</TableCell>
							<TableCell>
								<Badge text={partner.partner_type} variant="info" />
							</TableCell>
							<TableCell>
								{partner.is_active ? (
									<Badge text="Active" variant="success" />
								) : (
									<Badge text="Inactive" variant="warning" />
								)}
							</TableCell>
							<TableCell>{partner.owner_user_id.toString()}</TableCell>
							<TableCell>{new Date(partner.created_at).toLocaleDateString()}</TableCell>
							{canDeletePartner && (
								<TableCell>
									<form method="post" action={`${config.basePath}/partners?action=delete`}>
										<CsrfInput token={csrfToken} />
										<input type="hidden" name="partner_id" value={partner.partner_id} />
										<Button type="submit" variant="danger">
											Delete
										</Button>
									</form>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export const PartnersPage: FC<PartnersPageProps> = ({
	config,
	session,
	flash,
	assetVersion,
	csrfToken,
	adminAcls,
	currentAdmin,
}) => {
	const canCreatePartner = adminAcls.includes(AdminACLs.PARTNER_CREATE);
	const canDeletePartner = adminAcls.includes(AdminACLs.PARTNER_DELETE);

	const canManage = canCreatePartner || canDeletePartner;

	return (
		<Layout
			config={config}
			session={session}
			flash={flash}
			csrfToken={csrfToken}
			title="Partners"
			activePage="partners"
			currentAdmin={currentAdmin}
			assetVersion={assetVersion}
		>
			<Stack gap="lg">
				<PageHeader title="Partner Management" />
				
				{!canManage ? (
					<EmptyState title="You don't have permission to manage partners" />
				) : (
					<PartnersContent config={config} session={session} csrfToken={csrfToken} canCreatePartner={canCreatePartner} canDeletePartner={canDeletePartner} />
				)}
			</Stack>
		</Layout>
	);
};

const PartnersContent: FC<{config: Config; session: Session; csrfToken: string; canCreatePartner: boolean; canDeletePartner: boolean}> = async ({config, session, csrfToken, canCreatePartner, canDeletePartner}) => {
	const result = await getPartners(config, session);
	
	if (!result.ok) {
		return <ErrorAlert error={result.error.type} />;
	}
	
	const partners = result.data.partners;
	
	return (
		<Stack gap="md">
			{canCreatePartner && (
				<Card padding="md">
					<Stack gap="md">
						<Text weight="semibold">Create New Partner</Text>
						<form method="post" action={`${config.basePath}/partners?action=create`}>
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
										<Text size="sm">Description</Text>
									</label>
									<input type="text" name="description" style={{width: '100%', padding: '8px'}} />
								</div>
								<div>
									<label>
										<Text size="sm">Owner User ID *</Text>
									</label>
									<input type="text" name="owner_user_id" required style={{width: '100%', padding: '8px'}} />
								</div>
								<div>
									<label>
										<Text size="sm">Partner Type *</Text>
									</label>
									<select name="partner_type" required style={{width: '100%', padding: '8px'}}>
										<option value="">Select Type</option>
										<option value="community">Community</option>
										<option value="developer">Developer</option>
										<option value="content_creator">Content Creator</option>
										<option value="enterprise">Enterprise</option>
										<option value="other">Other</option>
									</select>
								</div>
								<div>
									<label>
										<Text size="sm">Website URL</Text>
									</label>
									<input type="url" name="website_url" style={{width: '100%', padding: '8px'}} />
								</div>
								<div>
									<label>
										<Text size="sm">Support URL</Text>
									</label>
									<input type="url" name="support_url" style={{width: '100%', padding: '8px'}} />
								</div>
								<Button type="submit" variant="primary">
									Create Partner
								</Button>
							</Stack>
						</form>
					</Stack>
				</Card>
			)}
			
			{partners.length === 0 ? (
				<EmptyState title="No partners found" />
			) : (
				<PartnersTable partners={partners} config={config} csrfToken={csrfToken} canDeletePartner={canDeletePartner} />
			)}
		</Stack>
	);
};
