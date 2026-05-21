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

import {ChannelHeader} from '@app/components/channel/ChannelHeader';
import {ChannelViewScaffold} from '@app/components/channel/channel_view/ChannelViewScaffold';
import {SparkleIcon, CodeIcon, PlayIcon, ArrowClockwiseIcon, FloppyDiskIcon} from '@phosphor-icons/react';
import ChannelStore from '@app/stores/ChannelStore';
import PermissionStore from '@app/stores/PermissionStore';
import AuthenticationStore from '@app/stores/AuthenticationStore';
import {Permissions} from '@fluxer/constants/src/ChannelConstants';
import {observer} from 'mobx-react-lite';
import {useState, useEffect} from 'react';
import styles from './ChannelTypeViews.module.css';

interface SSRRenderChannelViewProps {
	channelId: string;
}

const DEFAULT_HTML = `<div style="font-family:sans-serif;padding:1rem">
  <h2>Hello, World!</h2>
  <p>This is a sandboxed SSR render.</p>
  <button onclick="this.textContent='Clicked!'">Click me</button>
</div>`;

export const SSRRenderChannelView = observer(({channelId}: SSRRenderChannelViewProps) => {
	const channel = ChannelStore.getChannel(channelId);

	// If channel.url is set, use it as an embedded iframe src (external URL mode)
	if (channel?.url) {
		return (
			<ChannelViewScaffold
				header={<ChannelHeader channel={channel} showMembersToggle={false} showPins={false} />}
				chatArea={
					<div className={styles.ssrLayout}>
						<div className={styles.ssrPane} style={{flex: 1}}>
							<div className={styles.ssrPaneLabel}>
								<SparkleIcon size={14} />
								{channel.url}
							</div>
							<div className={styles.ssrPreview}>
								<iframe
									title="SSR Render"
									className={styles.ssrPreviewFrame}
									src={channel.url}
									sandbox="allow-scripts allow-same-origin allow-forms"
								/>
							</div>
						</div>
					</div>
				}
			/>
		);
	}

	// No URL set — sandbox HTML editor mode using channel.topic as initial content
	return <SSREditorView channel={channel} />;
});

const SSREditorView = observer(({channel}: {channel: ReturnType<typeof ChannelStore.getChannel>}) => {
	if (!channel) return null;
	const canManage = PermissionStore.can(Permissions.MANAGE_CHANNELS, channel);
	const savedHTML = channel.topic ?? DEFAULT_HTML;

	const [code, setCode] = useState(savedHTML);
	const [isRendering, setIsRendering] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [renderedHTML, setRenderedHTML] = useState(savedHTML);

	useEffect(() => {
		setRenderedHTML(savedHTML);
		setCode(savedHTML);
	}, [channel.id]);

	const handleRender = () => {
		setIsRendering(true);
		setTimeout(() => {
			setRenderedHTML(code);
			setIsRendering(false);
		}, 80);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const token = AuthenticationStore.token;
			await fetch(`/api/v1/channels/${channel.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					...(token ? {Authorization: token} : {}),
				},
				body: JSON.stringify({type: channel.type, topic: code}),
			});
			setRenderedHTML(code);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<ChannelViewScaffold
			header={<ChannelHeader channel={channel} showMembersToggle={false} showPins={false} />}
			chatArea={
				<div className={styles.ssrLayout}>
					{canManage ? (
						<div className={styles.ssrPanes}>
							<div className={styles.ssrPane}>
								<div className={styles.ssrPaneLabel}>
									<CodeIcon size={14} />
									Source HTML (admin)
								</div>
								<textarea
									className={styles.ssrTextarea}
									value={code}
									onChange={(e) => setCode(e.target.value)}
									placeholder="Enter HTML to render…"
									spellCheck={false}
								/>
							</div>
							<div className={styles.ssrPane}>
								<div className={styles.ssrPaneLabel}>
									<SparkleIcon size={14} />
									Preview
								</div>
								<div className={styles.ssrPreview}>
									{renderedHTML ? (
										<iframe
											title="SSR Preview"
											className={styles.ssrPreviewFrame}
											srcDoc={renderedHTML}
											sandbox="allow-scripts"
										/>
									) : (
										<div className={styles.ssrPreviewEmpty}>
											<SparkleIcon size={36} className={styles.ssrPreviewEmptyIcon} />
											<span className={styles.ssrPreviewEmptyText}>Click Render to preview</span>
										</div>
									)}
								</div>
							</div>
						</div>
					) : (
						<div className={styles.ssrPane} style={{flex: 1}}>
							<div className={styles.ssrPreview} style={{flex: 1}}>
								{renderedHTML ? (
									<iframe
										title="SSR Content"
										className={styles.ssrPreviewFrame}
										srcDoc={renderedHTML}
										sandbox="allow-scripts"
									/>
								) : (
									<div className={styles.ssrPreviewEmpty}>
										<SparkleIcon size={36} className={styles.ssrPreviewEmptyIcon} />
										<span className={styles.ssrPreviewEmptyText}>No content set for this channel</span>
									</div>
								)}
							</div>
						</div>
					)}
					{canManage && (
						<div className={styles.ssrActions}>
							<button type="button" className={styles.ssrBtnPrimary} onClick={handleRender} disabled={isRendering}>
								<PlayIcon size={16} />
								{isRendering ? 'Rendering…' : 'Preview'}
							</button>
							<button
								type="button"
								className={styles.ssrBtnPrimary}
								onClick={handleSave}
								disabled={isSaving || code === savedHTML}
								style={{background: 'var(--text-positive, #3ba55c)'}}
							>
								<FloppyDiskIcon size={16} />
								{isSaving ? 'Saving…' : 'Save & Publish'}
							</button>
							<button type="button" className={styles.ssrBtnSecondary} onClick={() => { setCode(savedHTML); setRenderedHTML(savedHTML); }} disabled={code === savedHTML}>
								<ArrowClockwiseIcon size={16} />
								Reset
							</button>
						</div>
					)}
				</div>
			}
		/>
	);
});
