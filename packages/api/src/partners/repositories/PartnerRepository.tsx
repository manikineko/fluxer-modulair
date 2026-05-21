/*
 * Copyright (C) 2026 Fluxer Contributors
 *
 * This file is part of Fluxer.
 *
 * Fluxer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import {fetchMany, fetchOne, upsertOne, deleteOneOrMany} from '@fluxer/api/src/database/Cassandra';
import type {PartnerRow, PartnerBadgeRow} from '@fluxer/api/src/database/types/PartnerBadgeTypes';
import type {UserID} from '@fluxer/api/src/BrandedTypes';
import {Partners, PartnersByOwner, PartnerBadges} from '@fluxer/api/src/Tables';

const FETCH_PARTNER_BY_ID_CQL = Partners.selectCql({
	where: Partners.where.eq('partner_id'),
	limit: 1,
});

const FETCH_ALL_PARTNERS_CQL = Partners.selectCql({});

const FETCH_PARTNERS_BY_OWNER_CQL = PartnersByOwner.selectCql({
	where: PartnersByOwner.where.eq('owner_user_id'),
});

const FETCH_ACTIVE_PARTNERS_CQL = `SELECT * FROM partners WHERE is_active = true ALLOW FILTERING`;

const FETCH_PARTNER_BADGES_CQL = PartnerBadges.selectCql({
	where: PartnerBadges.where.eq('partner_id'),
});

export class PartnerRepository {
	async findById(partnerId: string): Promise<PartnerRow | null> {
		return fetchOne<PartnerRow>(FETCH_PARTNER_BY_ID_CQL, {partner_id: partnerId});
	}

	async findAll(): Promise<Array<PartnerRow>> {
		return fetchMany<PartnerRow>(FETCH_ALL_PARTNERS_CQL, {});
	}

	async findActive(): Promise<Array<PartnerRow>> {
		return fetchMany<PartnerRow>(FETCH_ACTIVE_PARTNERS_CQL, {});
	}

	async findByOwner(ownerUserId: UserID): Promise<Array<PartnerRow>> {
		return fetchMany<PartnerRow>(FETCH_PARTNERS_BY_OWNER_CQL, {owner_user_id: ownerUserId});
	}

	async create(partner: PartnerRow): Promise<PartnerRow> {
		const insert = Partners.insert(partner);
		await upsertOne(insert.cql, insert.params);
		
		// Also insert to owner index
		const insertOwner = PartnersByOwner.insert(partner);
		await upsertOne(insertOwner.cql, insertOwner.params);
		
		return partner;
	}

	async update(partner: PartnerRow): Promise<PartnerRow> {
		const updatedPartner = {...partner, updated_at: new Date()};
		const insert = Partners.insert(updatedPartner);
		await upsertOne(insert.cql, insert.params);
		
		const insertOwner = PartnersByOwner.insert(updatedPartner);
		await upsertOne(insertOwner.cql, insertOwner.params);
		
		return updatedPartner;
	}

	async delete(partnerId: string): Promise<void> {
		const partner = await this.findById(partnerId);
		if (!partner) return;

		const deletePartner = Partners.delete({
			where: Partners.where.eq('partner_id'),
		});
		await deleteOneOrMany(deletePartner.cql, {partner_id: partnerId});

		const deleteOwner = PartnersByOwner.delete({
			where: [
				PartnersByOwner.where.eq('owner_user_id'),
				PartnersByOwner.where.eq('partner_id'),
			],
		});
		await deleteOneOrMany(deleteOwner.cql, {
			owner_user_id: partner.owner_user_id,
			partner_id: partnerId,
		});
	}

	async findPartnerBadges(partnerId: string): Promise<Array<PartnerBadgeRow>> {
		return fetchMany<PartnerBadgeRow>(FETCH_PARTNER_BADGES_CQL, {partner_id: partnerId});
	}

	async addBadgeToPartner(partnerId: string, badgeId: string): Promise<void> {
		const row: PartnerBadgeRow = {
			partner_id: partnerId,
			badge_id: badgeId,
			created_at: new Date(),
		};
		const insert = PartnerBadges.insert(row);
		await upsertOne(insert.cql, insert.params);
	}

	async removeBadgeFromPartner(partnerId: string, badgeId: string): Promise<void> {
		const deleteBadge = PartnerBadges.delete({
			where: [
				PartnerBadges.where.eq('partner_id'),
				PartnerBadges.where.eq('badge_id'),
			],
		});
		await deleteOneOrMany(deleteBadge.cql, {
			partner_id: partnerId,
			badge_id: badgeId,
		});
	}
}
