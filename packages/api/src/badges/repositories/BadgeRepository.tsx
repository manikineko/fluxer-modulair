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
import type {BadgeRow, UserBadgeRow} from '@fluxer/api/src/database/types/PartnerBadgeTypes';
import type {UserID} from '@fluxer/api/src/BrandedTypes';
import {Badges, UserBadges, BadgesByUser} from '@fluxer/api/src/Tables';

const FETCH_BADGE_BY_ID_CQL = Badges.selectCql({
	where: Badges.where.eq('badge_id'),
	limit: 1,
});

const FETCH_ALL_BADGES_CQL = Badges.selectCql({});

const FETCH_ACTIVE_BADGES_CQL = `SELECT * FROM badges WHERE is_active = true ALLOW FILTERING`;

const FETCH_USER_BADGES_CQL = UserBadges.selectCql({
	where: UserBadges.where.eq('user_id'),
});

const FETCH_BADGE_USERS_CQL = BadgesByUser.selectCql({
	where: BadgesByUser.where.eq('badge_id'),
});

export class BadgeRepository {
	async findById(badgeId: string): Promise<BadgeRow | null> {
		return fetchOne<BadgeRow>(FETCH_BADGE_BY_ID_CQL, {badge_id: badgeId});
	}

	async findAll(): Promise<Array<BadgeRow>> {
		return fetchMany<BadgeRow>(FETCH_ALL_BADGES_CQL, {});
	}

	async findActive(): Promise<Array<BadgeRow>> {
		return fetchMany<BadgeRow>(FETCH_ACTIVE_BADGES_CQL, {});
	}

	async create(badge: BadgeRow): Promise<BadgeRow> {
		const insert = Badges.insert(badge);
		await upsertOne(insert.cql, insert.params);
		return badge;
	}

	async update(badge: BadgeRow): Promise<BadgeRow> {
		const updatedBadge = {...badge, updated_at: new Date()};
		const insert = Badges.insert(updatedBadge);
		await upsertOne(insert.cql, insert.params);
		return updatedBadge;
	}

	async delete(badgeId: string): Promise<void> {
		const deleteBadge = Badges.delete({
			where: Badges.where.eq('badge_id'),
		});
		await deleteOneOrMany(deleteBadge.cql, {badge_id: badgeId});
	}

	async findUserBadges(userId: UserID): Promise<Array<UserBadgeRow>> {
		return fetchMany<UserBadgeRow>(FETCH_USER_BADGES_CQL, {user_id: userId});
	}

	async findBadgeUsers(badgeId: string): Promise<Array<UserBadgeRow>> {
		return fetchMany<UserBadgeRow>(FETCH_BADGE_USERS_CQL, {badge_id: badgeId});
	}

	async grantBadgeToUser(userBadge: UserBadgeRow): Promise<UserBadgeRow> {
		const insert = UserBadges.insert(userBadge);
		await upsertOne(insert.cql, insert.params);
		
		const insertByUser = BadgesByUser.insert(userBadge);
		await upsertOne(insertByUser.cql, insertByUser.params);
		
		// Update badge granted count
		const badge = await this.findById(userBadge.badge_id);
		if (badge) {
			await this.update({
				...badge,
				granted_count: badge.granted_count + 1,
			});
		}
		
		return userBadge;
	}

	async revokeBadgeFromUser(userId: UserID, badgeId: string): Promise<void> {
		const deleteUserBadge = UserBadges.delete({
			where: [
				UserBadges.where.eq('user_id'),
				UserBadges.where.eq('badge_id'),
			],
		});
		await deleteOneOrMany(deleteUserBadge.cql, {
			user_id: userId,
			badge_id: badgeId,
		});

		const deleteByUser = BadgesByUser.delete({
			where: [
				BadgesByUser.where.eq('badge_id'),
				BadgesByUser.where.eq('user_id'),
			],
		});
		await deleteOneOrMany(deleteByUser.cql, {
			badge_id: badgeId,
			user_id: userId,
		});
		
		// Update badge granted count
		const badge = await this.findById(badgeId);
		if (badge && badge.granted_count > 0) {
			await this.update({
				...badge,
				granted_count: badge.granted_count - 1,
			});
		}
	}

	async hasBadge(userId: UserID, badgeId: string): Promise<boolean> {
		const userBadges = await this.findUserBadges(userId);
		return userBadges.some(ub => ub.badge_id === badgeId && ub.is_active);
	}
}
