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

// React UI component for Bluesky Timeline
const BlueskyTimelineComponent = (React: unknown) => {
	const R = React as {useState: <T>(initial: T) => [T, (val: T) => void]; createElement: (...args: Array<unknown>) => unknown; useEffect: (effect: () => void, deps?: unknown[]) => void};
	
	return function BlueskyTimelineButton(props: Record<string, unknown>) {
		const [isOpen, setIsOpen] = R.useState(false);
		const [isLoading, setIsLoading] = R.useState(false);
		const [posts, setPosts] = R.useState<Array<{id: string; handle: string; text: string; likes: number; time: string; liked: boolean}>>([]);

		// Load timeline data when component opens
		R.useEffect(() => {
			if (isOpen) {
				setIsLoading(true);
				// Simulate fetching timeline data
				setTimeout(() => {
					const mockPosts = [
						{id: '1', handle: '@alice.bsky.social', text: 'Just had the best coffee! ☕', likes: 24, time: '2m', liked: false},
						{id: '2', handle: '@bob.bsky.social', text: 'Working on a new project 🚀', likes: 42, time: '5m', liked: false},
						{id: '3', handle: '@carol.bsky.social', text: 'Beautiful sunset today 🌅', likes: 89, time: '15m', liked: false},
						{id: '4', handle: '@dave.bsky.social', text: 'Anyone up for a game?', likes: 12, time: '30m', liked: false},
					];
					setPosts(mockPosts);
					setIsLoading(false);
				}, 300);
			}
		}, [isOpen]);

		const handleClick = () => {
			setIsOpen(!isOpen);
			console.log('Bluesky timeline toggled:', !isOpen);
		};

		const handleLike = (postId: string) => {
			setPosts(posts.map(post => 
				post.id === postId 
					? {...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked}
					: post
			));
			const post = posts.find(p => p.id === postId);
			if (post) {
				const event = new CustomEvent('plugin-bluesky-like', {detail: {postId, handle: post.handle, liked: !post.liked}});
				window.dispatchEvent(event);
			}
		};

		const handleReply = (postId: string, handle: string) => {
			const event = new CustomEvent('plugin-bluesky-reply', {detail: {postId, handle}});
			window.dispatchEvent(event);
			console.log('Reply to:', handle);
		};

		const handleRepost = (postId: string, handle: string) => {
			const event = new CustomEvent('plugin-bluesky-repost', {detail: {postId, handle}});
			window.dispatchEvent(event);
			console.log('Repost:', handle);
		};

		const buttonStyle = {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			padding: '10px 14px',
			borderRadius: '8px',
			border: '1px solid transparent',
			background: isOpen ? 'var(--background-modifier-selected)' : 'transparent',
			cursor: 'pointer',
			fontSize: '22px',
			color: 'var(--text-normal)',
			transition: 'all 0.15s ease',
		};

		const hoverStyle = {
			background: 'var(--background-secondary)',
		};

		return R.createElement('div', {style: {position: 'relative', display: 'inline-block'}},
			R.createElement('button', {
				onClick: handleClick,
				style: buttonStyle,
				onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
					if (!isOpen) {
						Object.assign(e.target.style, hoverStyle);
					}
				},
				onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
					if (!isOpen) {
						Object.assign(e.target.style, {background: 'transparent'});
					}
				},
				title: 'Open Bluesky Timeline',
			}, '🦋'),
			isOpen && R.createElement('div', {
				style: {
					position: 'absolute',
					top: '100%',
					right: '0',
					marginTop: '8px',
					padding: '12px',
					background: 'var(--background-primary)',
					border: '1px solid var(--background-modifier-accent)',
					borderRadius: '8px',
					boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
					zIndex: 1000,
					minWidth: '320px',
					maxHeight: '500px',
					overflowY: 'auto',
				},
			},
				R.createElement('div', {style: {fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}},
					'Bluesky Timeline',
					isLoading && R.createElement('span', {style: {fontSize: '12px'}}, 'Loading...')
				),
				!isLoading && R.createElement('div', {style: {display: 'flex', flexDirection: 'column', gap: '12px'}},
					...posts.map(post =>
						R.createElement('div', {
							key: post.id,
							style: {
								padding: '12px',
								background: 'var(--background-secondary)',
								borderRadius: '6px',
								border: '1px solid var(--background-modifier-accent)',
							},
						},
							R.createElement('div', {style: {display: 'flex', justifyContent: 'space-between', marginBottom: '4px'}},
								R.createElement('span', {style: {fontSize: '13px', fontWeight: 'bold', color: 'var(--text-normal)'}}, post.handle),
								R.createElement('span', {style: {fontSize: '11px', color: 'var(--text-muted)'}}, post.time)
							),
							R.createElement('div', {style: {fontSize: '14px', color: 'var(--text-normal)', marginBottom: '8px'}}, post.text),
							R.createElement('div', {style: {display: 'flex', gap: '16px', alignItems: 'center'}},
								R.createElement('button', {
									onClick: () => handleLike(post.id),
									style: {
										background: 'transparent',
										border: 'none',
										cursor: 'pointer',
										fontSize: '14px',
										color: post.liked ? '#ff6b6b' : 'var(--text-muted)',
										display: 'flex',
										alignItems: 'center',
										gap: '4px',
										transition: 'color 0.15s',
									},
								}, '❤️', post.likes),
								R.createElement('button', {
									onClick: () => handleReply(post.id, post.handle),
									style: {
										background: 'transparent',
										border: 'none',
										cursor: 'pointer',
										fontSize: '14px',
										color: 'var(--text-muted)',
										transition: 'color 0.15s',
									},
									onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
										e.target.style.color = 'var(--text-normal)';
									},
									onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
										e.target.style.color = 'var(--text-muted)';
									},
								}, '💬'),
								R.createElement('button', {
									onClick: () => handleRepost(post.id, post.handle),
									style: {
										background: 'transparent',
										border: 'none',
										cursor: 'pointer',
										fontSize: '14px',
										color: 'var(--text-muted)',
										transition: 'color 0.15s',
									},
									onMouseEnter: (e: {target: {style: Record<string, string>}}) => {
										e.target.style.color = 'var(--text-normal)';
									},
									onMouseLeave: (e: {target: {style: Record<string, string>}}) => {
										e.target.style.color = 'var(--text-muted)';
									},
								}, '🔄')
							)
						)
					)
				)
			)
		);
	};
};

// In-memory implementations of ATProto features for the Bluesky plugin
// These mirror the @fluxer/atproto library but are self-contained

interface Blob {
	ref: {ref: {$link: string}};
	mimeType: string;
	size: number;
}

interface Lecture {
	id: string;
	title: string;
	description: string;
	author: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	tags: Array<string>;
	attachments: Array<string>;
}

interface LectureComment {
	id: string;
	lectureId: string;
	author: string;
	content: string;
	createdAt: string;
}

const blobs: Map<string, Blob> = new Map();
const blobData: Map<string, Uint8Array> = new Map();
const lectures: Map<string, Lecture> = new Map();
const lectureComments: Map<string, Array<LectureComment>> = new Map();
const xrpcHandlers: Map<string, (request: {params: unknown}) => Promise<{success: boolean; data?: unknown; error?: {error: string; message?: string}}>> = new Map();

export async function onLoad(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; version: string};
	console.log(`Bluesky plugin loaded! ID: ${ctx.pluginId}, Version: ${ctx.version}`);
}

export async function onEnable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string; api: {registerUIComponent: (component: {id: string; name: string; component: unknown; location: string; priority: number; props?: Record<string, unknown>}) => void}};
	console.log(`Bluesky plugin enabled! ID: ${ctx.pluginId}`);
	await initializeBluesky();

	// Register UI components with component factory function
	ctx.api.registerUIComponent({
		id: 'bluesky-timeline',
		name: 'Bluesky Timeline',
		component: BlueskyTimelineComponent,
		location: 'channel_header',
		priority: 70,
		props: {},
	});
}

export async function onDisable(context: unknown): Promise<void> {
	const ctx = context as {pluginId: string};
	console.log(`Bluesky plugin disabled! ID: ${ctx.pluginId}`);
	await shutdownBluesky();
}

export async function onRequest(context: unknown): Promise<void> {
	const ctx = context as {request: {url: string; method: string}};
	if (ctx.request.url?.startsWith('/xrpc/') || ctx.request.url?.startsWith('/api/bluesky/')) {
		await handleBlueskyRequest(ctx.request);
	}
}

async function initializeBluesky(): Promise<void> {
	console.log('Initializing Bluesky...');
	
	// Register XRPC handlers
	await registerXRPCHandlers();
	
	// Load sample data
	await loadSampleData();
	
	console.log('Bluesky initialized successfully');
}

async function shutdownBluesky(): Promise<void> {
	console.log('Shutting down Bluesky...');
	
	xrpcHandlers.clear();
	
	console.log('Bluesky shut down');
}

async function registerXRPCHandlers(): Promise<void> {
	// Bluesky feed XRPC methods
	xrpcHandlers.set('com.atproto.sync.getBlob', async (request: {params: unknown}) => {
		const params = request.params as {cid: string};
		const blob = blobs.get(params.cid);
		if (blob) {
			return {
				success: true,
				data: blob,
			};
		}
		return {
			success: false,
			error: {
				error: 'BlobNotFound',
				message: 'Blob not found',
			},
		};
	});

	xrpcHandlers.set('com.atproto.repo.uploadBlob', async (request: {params: unknown}) => {
		// Mock blob upload
		const blob: Blob = {
			ref: {ref: {$link: `blob_${Date.now()}`}},
			mimeType: 'application/octet-stream',
			size: 1024,
		};
		blobs.set(blob.ref.ref.$link, blob);
		return {
			success: true,
			data: blob,
		};
	});

	// Lecture XRPC methods
	xrpcHandlers.set('app.bsky.feed.getPost', async (request: {params: unknown}) => {
		const params = request.params as {uri: string};
		// Mock post retrieval
		return {
			success: true,
			data: {
				uri: params.uri,
				cid: 'mock_cid',
				author: {
					did: 'did:example:bluesky',
					handle: 'bluesky',
				},
				record: {
					text: 'Sample post from Bluesky',
					createdAt: new Date().toISOString(),
				},
			},
		};
	});

	xrpcHandlers.set('app.bsky.feed.getTimeline', async () => {
		// Mock timeline
		return {
			success: true,
			data: {
				cursor: 'mock_cursor',
				feed: [
					{
						post: {
							uri: 'at://did:example:bluesky/app.bsky.feed.post/1',
							cid: 'mock_cid_1',
							author: {
								did: 'did:example:user1',
								handle: 'user1',
							},
							record: {
								text: 'Hello from Bluesky!',
								createdAt: new Date().toISOString(),
							},
						},
					},
				],
			},
		};
	});

	console.log(`Registered ${xrpcHandlers.size} XRPC handlers`);
}

async function loadSampleData(): Promise<void> {
	// Load sample lecture
	const sampleLecture: Lecture = {
		id: 'lecture_1',
		title: 'Introduction to ATProto',
		description: 'Learn about the AT Protocol',
		author: 'did:example:bluesky',
		content: 'ATProto is a decentralized social networking protocol...',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		tags: ['atproto', 'tutorial'],
		attachments: [],
	};
	
	lectures.set(sampleLecture.id, sampleLecture);
	lectureComments.set(sampleLecture.id, []);
	
	console.log('Loaded sample data');
}

async function handleBlueskyRequest(request: {url: string; method: string}): Promise<void> {
	console.log(`Handling Bluesky request: ${request.method} ${request.url}`);
	
	// Extract NSID from URL
	let nsid = '';
	if (request.url.startsWith('/xrpc/')) {
		nsid = request.url.replace('/xrpc/', '');
	} else if (request.url.startsWith('/api/bluesky/')) {
		nsid = request.url.replace('/api/bluesky/', '');
	}
	
	const handler = xrpcHandlers.get(nsid);
	if (!handler) {
		console.error(`Bluesky handler not found: ${nsid}`);
		return;
	}
	
	const response = await handler({params: {}});
	
	if (response.success) {
		console.log(`Bluesky request successful: ${nsid}`);
	} else {
		console.error(`Bluesky request failed: ${nsid}`, response.error);
	}
}

// Lecture management functions
export async function createLecture(lecture: Omit<Lecture, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lecture> {
	const id = `lecture_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	const now = new Date().toISOString();
	
	const newLecture: Lecture = {
		...lecture,
		id,
		createdAt: now,
		updatedAt: now,
	};
	
	lectures.set(id, newLecture);
	lectureComments.set(id, []);
	
	return newLecture;
}

export async function getLecture(id: string): Promise<Lecture | null> {
	return lectures.get(id) || null;
}

export async function listLectures(author?: string, tags?: Array<string>): Promise<Array<Lecture>> {
	let lectureList = Array.from(lectures.values());
	
	if (author) {
		lectureList = lectureList.filter(l => l.author === author);
	}
	
	if (tags && tags.length > 0) {
		lectureList = lectureList.filter(l => 
			tags.some(tag => l.tags.includes(tag))
		);
	}
	
	return lectureList.sort((a, b) => 
		new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
	);
}

export async function addComment(lectureId: string, comment: Omit<LectureComment, 'id' | 'createdAt'>): Promise<LectureComment> {
	const id = `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	const newComment: LectureComment = {
		...comment,
		id,
		createdAt: new Date().toISOString(),
	};
	
	const comments = lectureComments.get(lectureId) || [];
	comments.push(newComment);
	lectureComments.set(lectureId, comments);
	
	return newComment;
}

export async function getComments(lectureId: string): Promise<Array<LectureComment>> {
	return lectureComments.get(lectureId) || [];
}

// Blob management functions
export async function uploadBlob(data: Uint8Array, mimeType: string): Promise<Blob> {
	const hash = `blob_${Date.now()}_${Math.random().toString(36).substring(7)}`;
	
	const blob: Blob = {
		ref: {ref: {$link: hash}},
		mimeType,
		size: data.length,
	};
	
	blobs.set(hash, blob);
	blobData.set(hash, data);
	
	return blob;
}

export async function getBlob(hash: string): Promise<Blob | null> {
	return blobs.get(hash) || null;
}

export async function getBlobData(hash: string): Promise<Uint8Array | null> {
	return blobData.get(hash) || null;
}
