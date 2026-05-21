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

import type {IPaymentProcessor} from '../IPaymentProcessor';
import type {CreatePaymentParams, PaymentResult, SubscriptionParams, SubscriptionResult} from '../IPaymentProcessor';

export class StripeAdapter implements IPaymentProcessor {
	readonly name = 'stripe';
	readonly enabled: boolean;

	constructor(private stripeService: unknown) {
		this.enabled = !!stripeService;
	}

	async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
		try {
			// TODO: Integrate with actual StripeService
			console.log('StripeAdapter: createPayment', params);
			return {success: true, paymentId: 'stripe_payment_id'};
		} catch (error) {
			return {success: false, paymentId: '', error: error instanceof Error ? error.message : 'Unknown error'};
		}
	}

	async capturePayment(_paymentId: string): Promise<PaymentResult> {
		console.log('StripeAdapter: capturePayment', _paymentId);
		return {success: true, paymentId: _paymentId};
	}

	async cancelPayment(_paymentId: string): Promise<PaymentResult> {
		console.log('StripeAdapter: cancelPayment', _paymentId);
		return {success: true, paymentId: _paymentId};
	}

	async createSubscription(params: SubscriptionParams): Promise<SubscriptionResult> {
		try {
			console.log('StripeAdapter: createSubscription', params);
			return {success: true, subscriptionId: 'stripe_subscription_id'};
		} catch (error) {
			return {success: false, subscriptionId: '', error: error instanceof Error ? error.message : 'Unknown error'};
		}
	}

	async cancelSubscription(subscriptionId: string): Promise<void> {
		console.log('StripeAdapter: cancelSubscription', subscriptionId);
	}

	async updateSubscription(_subscriptionId: string, _params: Record<string, unknown>): Promise<SubscriptionResult> {
		console.log('StripeAdapter: updateSubscription', _subscriptionId, _params);
		return {success: false, subscriptionId: _subscriptionId, error: 'Not implemented'};
	}

	async handleWebhook(event: unknown): Promise<void> {
		console.log('StripeAdapter: handleWebhook', event);
	}
}
