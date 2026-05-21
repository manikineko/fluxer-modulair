/*
 * MIT License
 *
 * Copyright (c) 2026 manikineko.nl
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export type {
	DID,
	DIDDocument,
	VerificationMethod,
	Service,
	XRPCRequest,
	XRPCResponse,
	XRPCError,
	ATRecord,
	Commit,
	Repository,
	Session,
} from './types';

export {DIDResolver, didResolver} from './did';
export {XRPCClient, XRPCServer} from './xrpc';
export {RepositoryManager, repositoryManager} from './repository';
export {AuthManager, authManager} from './auth';
export {BlobManager, blobManager} from './blob';
export type {Blob, BlobRef} from './blob';
export {LectureManager, lectureManager} from './lecture';
export type {Lecture, LectureComment} from './lecture';
export {LexiconManager, lexiconManager} from './lexicon';
export type {LexiconDef, LexiconRecord} from './lexicon';
export {BlueskyClient} from './bluesky';
export type {BlueskyPost, BlueskyNotification, BlueskyProfile} from './bluesky';
