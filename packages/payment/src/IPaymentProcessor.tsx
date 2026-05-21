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

export type UserID = string;

export interface CreatePaymentParams {
	amount: number;
	currency: string;
	description: string;
	userId: UserID;
	metadata?: Record<string, unknown>;
}

export interface PaymentResult {
	success: boolean;
	paymentId: string;
	error?: string;
}

export interface SubscriptionParams {
	planId: string;
	userId: UserID;
	trialPeriodDays?: number;
	metadata?: Record<string, unknown>;
}

export interface SubscriptionResult {
	success: boolean;
	subscriptionId: string;
	error?: string;
}

export interface IPaymentProcessor {
	readonly name: string;
	readonly enabled: boolean;

	createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
	capturePayment(paymentId: string): Promise<PaymentResult>;
	cancelPayment(paymentId: string): Promise<PaymentResult>;

	createSubscription(params: SubscriptionParams): Promise<SubscriptionResult>;
	cancelSubscription(subscriptionId: string): Promise<void>;
	updateSubscription(subscriptionId: string, params: Record<string, unknown>): Promise<SubscriptionResult>;

	handleWebhook(event: unknown): Promise<void>;
}
