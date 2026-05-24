// @generated - DO NOT EDIT MANUALLY
// Run: pnpm generate:masks

type AvatarSize = 16 | 20 | 24 | 32 | 36 | 40 | 44 | 48 | 56 | 80 | 120;

interface MaskDefinition {
	viewBox: string;
	content: React.ReactElement;
}

interface MaskSet {
	avatarDefault: MaskDefinition;
	avatarStatusRound: MaskDefinition;
	avatarStatusTyping: MaskDefinition;
	statusOnline: MaskDefinition;
	statusOnlineMobile: MaskDefinition;
	statusIdle: MaskDefinition;
	statusIdleMobile: MaskDefinition;
	statusDnd: MaskDefinition;
	statusDndMobile: MaskDefinition;
	statusOffline: MaskDefinition;
	statusTyping: MaskDefinition;
}

export const AVATAR_MASKS: Record<AvatarSize, MaskSet> = {
	16: {
		avatarDefault: {
			viewBox: '0 0 16 16',
			content: <circle fill="white" cx="8" cy="8" r="8" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<circle fill="white" cx="8" cy="8" r="8" />
					<circle fill="black" cx="13" cy="13" r="5" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<circle fill="white" cx="8" cy="8" r="8" />
					<rect fill="black" x="6.8" y="8" width="18" height="10" rx="5" ry="5" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 16 16',
			content: <circle fill="white" cx="13" cy="13" r="5" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<rect fill="white" x="8" y="5.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="9.4" y="8.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="13" cy="17.95" r="1.3" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<circle fill="white" cx="13" cy="13" r="5" />
					<circle fill="black" cx="11" cy="11" r="4" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<rect fill="white" x="8" y="5.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="9.4" y="8.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="13" cy="17.95" r="1.3" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<circle fill="white" cx="13" cy="13" r="5" />
					<rect fill="black" x="9.5" y="12" width="7" height="2" rx="1" ry="1" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<rect fill="white" x="8" y="5.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="9.4" y="8.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="13" cy="17.95" r="1.3" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 16 16',
			content: (
				<>
					<circle fill="white" cx="13" cy="13" r="5" />
					<circle fill="black" cx="13" cy="13" r="3" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 16 16',
			content: <rect fill="white" x="6.8" y="8" width="18" height="10" rx="5" ry="5" />,
		},
	},
	20: {
		avatarDefault: {
			viewBox: '0 0 20 20',
			content: <circle fill="white" cx="10" cy="10" r="10" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<circle fill="white" cx="10" cy="10" r="10" />
					<circle fill="black" cx="17" cy="17" r="5" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<circle fill="white" cx="10" cy="10" r="10" />
					<rect fill="black" x="10.8" y="12" width="18" height="10" rx="5" ry="5" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 20 20',
			content: <circle fill="white" cx="17" cy="17" r="5" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<rect fill="white" x="12" y="9.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="13.4" y="12.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="17" cy="21.95" r="1.3" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<circle fill="white" cx="17" cy="17" r="5" />
					<circle fill="black" cx="15" cy="15" r="4" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<rect fill="white" x="12" y="9.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="13.4" y="12.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="17" cy="21.95" r="1.3" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<circle fill="white" cx="17" cy="17" r="5" />
					<rect fill="black" x="13.5" y="16" width="7" height="2" rx="1" ry="1" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<rect fill="white" x="12" y="9.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="13.4" y="12.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="17" cy="21.95" r="1.3" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 20 20',
			content: (
				<>
					<circle fill="white" cx="17" cy="17" r="5" />
					<circle fill="black" cx="17" cy="17" r="3" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 20 20',
			content: <rect fill="white" x="10.8" y="12" width="18" height="10" rx="5" ry="5" />,
		},
	},
	24: {
		avatarDefault: {
			viewBox: '0 0 24 24',
			content: <circle fill="white" cx="12" cy="12" r="12" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<circle fill="white" cx="12" cy="12" r="12" />
					<circle fill="black" cx="20" cy="20" r="7" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<circle fill="white" cx="12" cy="12" r="12" />
					<rect fill="black" x="13.8" y="15" width="18" height="10" rx="7" ry="7" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 24 24',
			content: <circle fill="white" cx="20" cy="20" r="7" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<rect fill="white" x="15" y="12.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="16.4" y="15.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="20" cy="24.95" r="1.3" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<circle fill="white" cx="20" cy="20" r="7" />
					<circle fill="black" cx="18" cy="18" r="5" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<rect fill="white" x="15" y="12.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="16.4" y="15.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="20" cy="24.95" r="1.3" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<circle fill="white" cx="20" cy="20" r="7" />
					<rect fill="black" x="15.5" y="18.5" width="9" height="3" rx="1.5" ry="1.5" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<rect fill="white" x="15" y="12.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="16.4" y="15.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="20" cy="24.95" r="1.3" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 24 24',
			content: (
				<>
					<circle fill="white" cx="20" cy="20" r="7" />
					<circle fill="black" cx="20" cy="20" r="3" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 24 24',
			content: <rect fill="white" x="13.8" y="15" width="18" height="10" rx="7" ry="7" />,
		},
	},
	32: {
		avatarDefault: {
			viewBox: '0 0 32 32',
			content: <circle fill="white" cx="16" cy="16" r="16" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<circle fill="white" cx="16" cy="16" r="16" />
					<circle fill="black" cx="27" cy="27" r="8" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<circle fill="white" cx="16" cy="16" r="16" />
					<rect fill="black" x="20.8" y="22" width="18" height="10" rx="8" ry="8" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 32 32',
			content: <circle fill="white" cx="27" cy="27" r="8" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<rect fill="white" x="22" y="19.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="23.4" y="22.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="27" cy="31.95" r="1.3" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<circle fill="white" cx="27" cy="27" r="8" />
					<circle fill="black" cx="24" cy="24" r="6" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<rect fill="white" x="22" y="19.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="23.4" y="22.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="27" cy="31.95" r="1.3" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<circle fill="white" cx="27" cy="27" r="8" />
					<rect fill="black" x="22" y="25.5" width="10" height="3" rx="1.5" ry="1.5" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<rect fill="white" x="22" y="19.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="23.4" y="22.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="27" cy="31.95" r="1.3" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 32 32',
			content: (
				<>
					<circle fill="white" cx="27" cy="27" r="8" />
					<circle fill="black" cx="27" cy="27" r="3" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 32 32',
			content: <rect fill="white" x="20.8" y="22" width="18" height="10" rx="8" ry="8" />,
		},
	},
	36: {
		avatarDefault: {
			viewBox: '0 0 36 36',
			content: <circle fill="white" cx="18" cy="18" r="18" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<circle fill="white" cx="18" cy="18" r="18" />
					<circle fill="black" cx="30" cy="30" r="8" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<circle fill="white" cx="18" cy="18" r="18" />
					<rect fill="black" x="23.8" y="25" width="18" height="10" rx="8" ry="8" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 36 36',
			content: <circle fill="white" cx="30" cy="30" r="8" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<rect fill="white" x="25" y="22.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="26.4" y="25.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="30" cy="34.95" r="1.3" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<circle fill="white" cx="30" cy="30" r="8" />
					<circle fill="black" cx="27" cy="27" r="6" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<rect fill="white" x="25" y="22.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="26.4" y="25.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="30" cy="34.95" r="1.3" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<circle fill="white" cx="30" cy="30" r="8" />
					<rect fill="black" x="25" y="28.5" width="10" height="3" rx="1.5" ry="1.5" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<rect fill="white" x="25" y="22.5" width="10" height="15" rx="1" ry="1" />
					<rect fill="black" x="26.4" y="25.4" width="7.199999999999999" height="10.5" rx="0.72" ry="0.72" />
					<circle fill="black" cx="30" cy="34.95" r="1.3" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 36 36',
			content: (
				<>
					<circle fill="white" cx="30" cy="30" r="8" />
					<circle fill="black" cx="30" cy="30" r="3" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 36 36',
			content: <rect fill="white" x="23.8" y="25" width="18" height="10" rx="8" ry="8" />,
		},
	},
	40: {
		avatarDefault: {
			viewBox: '0 0 40 40',
			content: <circle fill="white" cx="20" cy="20" r="20" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<circle fill="white" cx="20" cy="20" r="20" />
					<circle fill="black" cx="34" cy="34" r="9" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<circle fill="white" cx="20" cy="20" r="20" />
					<rect fill="black" x="26.5" y="28" width="22" height="12" rx="9" ry="9" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 40 40',
			content: <circle fill="white" cx="34" cy="34" r="9" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<rect fill="white" x="28" y="25" width="12" height="18" rx="1" ry="1" />
					<rect fill="black" x="29.68" y="28.08" width="8.64" height="12.6" rx="0.8640000000000001" ry="0.8640000000000001" />
					<circle fill="black" cx="34" cy="39.94" r="1.56" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<circle fill="white" cx="34" cy="34" r="9" />
					<circle fill="black" cx="31" cy="31" r="6" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<rect fill="white" x="28" y="25" width="12" height="18" rx="1" ry="1" />
					<rect fill="black" x="29.68" y="28.08" width="8.64" height="12.6" rx="0.8640000000000001" ry="0.8640000000000001" />
					<circle fill="black" cx="34" cy="39.94" r="1.56" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<circle fill="white" cx="34" cy="34" r="9" />
					<rect fill="black" x="28" y="32" width="12" height="4" rx="2" ry="2" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<rect fill="white" x="28" y="25" width="12" height="18" rx="1" ry="1" />
					<rect fill="black" x="29.68" y="28.08" width="8.64" height="12.6" rx="0.8640000000000001" ry="0.8640000000000001" />
					<circle fill="black" cx="34" cy="39.94" r="1.56" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 40 40',
			content: (
				<>
					<circle fill="white" cx="34" cy="34" r="9" />
					<circle fill="black" cx="34" cy="34" r="4" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 40 40',
			content: <rect fill="white" x="26.5" y="28" width="22" height="12" rx="9" ry="9" />,
		},
	},
	44: {
		avatarDefault: {
			viewBox: '0 0 44 44',
			content: <circle fill="white" cx="22" cy="22" r="22" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<circle fill="white" cx="22" cy="22" r="22" />
					<circle fill="black" cx="38" cy="38" r="10" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<circle fill="white" cx="22" cy="22" r="22" />
					<rect fill="black" x="29.35" y="31" width="25" height="14" rx="10" ry="10" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 44 44',
			content: <circle fill="white" cx="38" cy="38" r="10" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<rect fill="white" x="31" y="27.5" width="14" height="21" rx="2" ry="2" />
					<rect fill="black" x="32.96" y="30.76" width="10.08" height="14.7" rx="1.008" ry="1.008" />
					<circle fill="black" cx="38" cy="44.93" r="1.82" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<circle fill="white" cx="38" cy="38" r="10" />
					<circle fill="black" cx="34" cy="34" r="7" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<rect fill="white" x="31" y="27.5" width="14" height="21" rx="2" ry="2" />
					<rect fill="black" x="32.96" y="30.76" width="10.08" height="14.7" rx="1.008" ry="1.008" />
					<circle fill="black" cx="38" cy="44.93" r="1.82" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<circle fill="white" cx="38" cy="38" r="10" />
					<rect fill="black" x="31.5" y="36" width="13" height="4" rx="2" ry="2" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<rect fill="white" x="31" y="27.5" width="14" height="21" rx="2" ry="2" />
					<rect fill="black" x="32.96" y="30.76" width="10.08" height="14.7" rx="1.008" ry="1.008" />
					<circle fill="black" cx="38" cy="44.93" r="1.82" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 44 44',
			content: (
				<>
					<circle fill="white" cx="38" cy="38" r="10" />
					<circle fill="black" cx="38" cy="38" r="4" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 44 44',
			content: <rect fill="white" x="29.35" y="31" width="25" height="14" rx="10" ry="10" />,
		},
	},
	48: {
		avatarDefault: {
			viewBox: '0 0 48 48',
			content: <circle fill="white" cx="24" cy="24" r="24" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<circle fill="white" cx="24" cy="24" r="24" />
					<circle fill="black" cx="42" cy="42" r="10" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<circle fill="white" cx="24" cy="24" r="24" />
					<rect fill="black" x="33.35" y="35" width="25" height="14" rx="10" ry="10" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 48 48',
			content: <circle fill="white" cx="42" cy="42" r="10" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<rect fill="white" x="35" y="31.5" width="14" height="21" rx="2" ry="2" />
					<rect fill="black" x="36.96" y="34.76" width="10.08" height="14.7" rx="1.008" ry="1.008" />
					<circle fill="black" cx="42" cy="48.93" r="1.82" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<circle fill="white" cx="42" cy="42" r="10" />
					<circle fill="black" cx="38" cy="38" r="7" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<rect fill="white" x="35" y="31.5" width="14" height="21" rx="2" ry="2" />
					<rect fill="black" x="36.96" y="34.76" width="10.08" height="14.7" rx="1.008" ry="1.008" />
					<circle fill="black" cx="42" cy="48.93" r="1.82" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<circle fill="white" cx="42" cy="42" r="10" />
					<rect fill="black" x="35.5" y="40" width="13" height="4" rx="2" ry="2" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<rect fill="white" x="35" y="31.5" width="14" height="21" rx="2" ry="2" />
					<rect fill="black" x="36.96" y="34.76" width="10.08" height="14.7" rx="1.008" ry="1.008" />
					<circle fill="black" cx="42" cy="48.93" r="1.82" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 48 48',
			content: (
				<>
					<circle fill="white" cx="42" cy="42" r="10" />
					<circle fill="black" cx="42" cy="42" r="4" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 48 48',
			content: <rect fill="white" x="33.35" y="35" width="25" height="14" rx="10" ry="10" />,
		},
	},
	56: {
		avatarDefault: {
			viewBox: '0 0 56 56',
			content: <circle fill="white" cx="28" cy="28" r="28" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<circle fill="white" cx="28" cy="28" r="28" />
					<circle fill="black" cx="49" cy="49" r="11" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<circle fill="white" cx="28" cy="28" r="28" />
					<rect fill="black" x="39.05" y="41" width="29" height="16" rx="11" ry="11" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 56 56',
			content: <circle fill="white" cx="49" cy="49" r="11" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<rect fill="white" x="41" y="37.5" width="16" height="23" rx="2" ry="2" />
					<rect fill="black" x="43.24" y="40.88" width="11.52" height="16.099999999999998" rx="1.152" ry="1.152" />
					<circle fill="black" cx="49" cy="56.59" r="2.08" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<circle fill="white" cx="49" cy="49" r="11" />
					<circle fill="black" cx="45" cy="45" r="8" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<rect fill="white" x="41" y="37.5" width="16" height="23" rx="2" ry="2" />
					<rect fill="black" x="43.24" y="40.88" width="11.52" height="16.099999999999998" rx="1.152" ry="1.152" />
					<circle fill="black" cx="49" cy="56.59" r="2.08" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<circle fill="white" cx="49" cy="49" r="11" />
					<rect fill="black" x="42" y="47" width="14" height="4" rx="2" ry="2" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<rect fill="white" x="41" y="37.5" width="16" height="23" rx="2" ry="2" />
					<rect fill="black" x="43.24" y="40.88" width="11.52" height="16.099999999999998" rx="1.152" ry="1.152" />
					<circle fill="black" cx="49" cy="56.59" r="2.08" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 56 56',
			content: (
				<>
					<circle fill="white" cx="49" cy="49" r="11" />
					<circle fill="black" cx="49" cy="49" r="5" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 56 56',
			content: <rect fill="white" x="39.05" y="41" width="29" height="16" rx="11" ry="11" />,
		},
	},
	80: {
		avatarDefault: {
			viewBox: '0 0 80 80',
			content: <circle fill="white" cx="40" cy="40" r="40" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<circle fill="white" cx="40" cy="40" r="40" />
					<circle fill="black" cx="68" cy="68" r="14" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<circle fill="white" cx="40" cy="40" r="40" />
					<rect fill="black" x="58.05" y="60" width="29" height="16" rx="14" ry="14" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 80 80',
			content: <circle fill="white" cx="68" cy="68" r="14" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<rect fill="white" x="60" y="56.5" width="16" height="23" rx="2" ry="2" />
					<rect fill="black" x="62.24" y="59.88" width="11.52" height="16.099999999999998" rx="1.152" ry="1.152" />
					<circle fill="black" cx="68" cy="75.59" r="2.08" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<circle fill="white" cx="68" cy="68" r="14" />
					<circle fill="black" cx="63" cy="63" r="10" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<rect fill="white" x="60" y="56.5" width="16" height="23" rx="2" ry="2" />
					<rect fill="black" x="62.24" y="59.88" width="11.52" height="16.099999999999998" rx="1.152" ry="1.152" />
					<circle fill="black" cx="68" cy="75.59" r="2.08" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<circle fill="white" cx="68" cy="68" r="14" />
					<rect fill="black" x="59" y="65" width="18" height="6" rx="3" ry="3" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<rect fill="white" x="60" y="56.5" width="16" height="23" rx="2" ry="2" />
					<rect fill="black" x="62.24" y="59.88" width="11.52" height="16.099999999999998" rx="1.152" ry="1.152" />
					<circle fill="black" cx="68" cy="75.59" r="2.08" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 80 80',
			content: (
				<>
					<circle fill="white" cx="68" cy="68" r="14" />
					<circle fill="black" cx="68" cy="68" r="5" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 80 80',
			content: <rect fill="white" x="58.05" y="60" width="29" height="16" rx="14" ry="14" />,
		},
	},
	120: {
		avatarDefault: {
			viewBox: '0 0 120 120',
			content: <circle fill="white" cx="60" cy="60" r="60" />,
		},
		avatarStatusRound: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<circle fill="white" cx="60" cy="60" r="60" />
					<circle fill="black" cx="100" cy="100" r="20" />
				</>
			),
		},
		avatarStatusTyping: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<circle fill="white" cx="60" cy="60" r="60" />
					<rect fill="black" x="85.15" y="88" width="43" height="24" rx="20" ry="20" />
				</>
			),
		},
		statusOnline: {
			viewBox: '0 0 120 120',
			content: <circle fill="white" cx="100" cy="100" r="20" />,
		},
		statusOnlineMobile: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<rect fill="white" x="88" y="83" width="24" height="34" rx="3" ry="3" />
					<rect fill="black" x="91.36" y="87.04" width="17.28" height="23.799999999999997" rx="1.7280000000000002" ry="1.7280000000000002" />
					<circle fill="black" cx="100" cy="111.22" r="3.12" />
				</>
			),
		},
		statusIdle: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<circle fill="white" cx="100" cy="100" r="20" />
					<circle fill="black" cx="93" cy="93" r="14" />
				</>
			),
		},
		statusIdleMobile: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<rect fill="white" x="88" y="83" width="24" height="34" rx="3" ry="3" />
					<rect fill="black" x="91.36" y="87.04" width="17.28" height="23.799999999999997" rx="1.7280000000000002" ry="1.7280000000000002" />
					<circle fill="black" cx="100" cy="111.22" r="3.12" />
				</>
			),
		},
		statusDnd: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<circle fill="white" cx="100" cy="100" r="20" />
					<rect fill="black" x="87" y="96" width="26" height="8" rx="4" ry="4" />
				</>
			),
		},
		statusDndMobile: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<rect fill="white" x="88" y="83" width="24" height="34" rx="3" ry="3" />
					<rect fill="black" x="91.36" y="87.04" width="17.28" height="23.799999999999997" rx="1.7280000000000002" ry="1.7280000000000002" />
					<circle fill="black" cx="100" cy="111.22" r="3.12" />
				</>
			),
		},
		statusOffline: {
			viewBox: '0 0 120 120',
			content: (
				<>
					<circle fill="white" cx="100" cy="100" r="20" />
					<circle fill="black" cx="100" cy="100" r="7" />
				</>
			),
		},
		statusTyping: {
			viewBox: '0 0 120 120',
			content: <rect fill="white" x="85.15" y="88" width="43" height="24" rx="20" ry="20" />,
		},
	},
} as const;

export const SVGMasks = () => (
	<svg
		viewBox="0 0 1 1"
		aria-hidden={true}
		style={{
			position: 'absolute',
			pointerEvents: 'none',
			top: '-1px',
			left: '-1px',
			width: 1,
			height: 1,
		}}
	>
		<defs>
			<mask id="svg-mask-avatar-default-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.8125" cy="0.8125" r="0.3125" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.5" y="0.34375" width="0.625" height="0.9375" rx="0.0625" ry="0.0625" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.425" y="0.5" width="1.125" height="0.625" rx="0.3125" ry="0.3125" />
			</mask>
			<mask id="svg-mask-status-online-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8125" cy="0.8125" r="0.3125" />
			</mask>
			<mask id="svg-mask-status-online-mobile-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1933" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8125" cy="0.8125" r="0.3125" />
				<circle fill="black" cx="0.6875" cy="0.6875" r="0.25" />
			</mask>
			<mask id="svg-mask-status-dnd-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8125" cy="0.8125" r="0.3125" />
				<rect fill="black" x="0.59375" y="0.75" width="0.4375" height="0.125" rx="0.0625" ry="0.0625" />
			</mask>
			<mask id="svg-mask-status-offline-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8125" cy="0.8125" r="0.3125" />
				<circle fill="black" cx="0.8125" cy="0.8125" r="0.1875" />
			</mask>
			<mask id="svg-mask-status-typing-16" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.425" y="0.5" width="1.125" height="0.625" rx="0.3125" ry="0.3125" />
			</mask>

			<mask id="svg-mask-avatar-default-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.85" cy="0.85" r="0.25" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6" y="0.475" width="0.5" height="0.75" rx="0.05" ry="0.05" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.5399999999999999" y="0.6" width="0.9" height="0.5" rx="0.25" ry="0.25" />
			</mask>
			<mask id="svg-mask-status-online-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.25" />
			</mask>
			<mask id="svg-mask-status-online-mobile-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1933" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.25" />
				<circle fill="black" cx="0.75" cy="0.75" r="0.2" />
			</mask>
			<mask id="svg-mask-status-dnd-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.25" />
				<rect fill="black" x="0.675" y="0.7999999999999999" width="0.35" height="0.1" rx="0.05" ry="0.05" />
			</mask>
			<mask id="svg-mask-status-offline-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.25" />
				<circle fill="black" cx="0.85" cy="0.85" r="0.15" />
			</mask>
			<mask id="svg-mask-status-typing-20" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.5399999999999999" y="0.6" width="0.9" height="0.5" rx="0.25" ry="0.25" />
			</mask>

			<mask id="svg-mask-avatar-default-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2916666666666667" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.5416666666666666" y="0.4375" width="0.5833333333333334" height="0.7916666666666666" rx="0.125" ry="0.125" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.5750000000000001" y="0.625" width="0.75" height="0.4166666666666667" rx="0.2916666666666667" ry="0.2916666666666667" />
			</mask>
			<mask id="svg-mask-status-online-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2916666666666667" />
			</mask>
			<mask id="svg-mask-status-online-mobile-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1933" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2916666666666667" />
				<circle fill="black" cx="0.75" cy="0.75" r="0.20833333333333334" />
			</mask>
			<mask id="svg-mask-status-dnd-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2916666666666667" />
				<rect fill="black" x="0.6458333333333334" y="0.7708333333333334" width="0.375" height="0.125" rx="0.0625" ry="0.0625" />
			</mask>
			<mask id="svg-mask-status-offline-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2916666666666667" />
				<circle fill="black" cx="0.8333333333333334" cy="0.8333333333333334" r="0.125" />
			</mask>
			<mask id="svg-mask-status-typing-24" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.5750000000000001" y="0.625" width="0.75" height="0.4166666666666667" rx="0.2916666666666667" ry="0.2916666666666667" />
			</mask>

			<mask id="svg-mask-avatar-default-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.84375" cy="0.84375" r="0.25" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.59375" y="0.515625" width="0.5" height="0.65625" rx="0.125" ry="0.125" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.65" y="0.6875" width="0.5625" height="0.3125" rx="0.25" ry="0.25" />
			</mask>
			<mask id="svg-mask-status-online-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.84375" cy="0.84375" r="0.25" />
			</mask>
			<mask id="svg-mask-status-online-mobile-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1933" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.84375" cy="0.84375" r="0.25" />
				<circle fill="black" cx="0.75" cy="0.75" r="0.1875" />
			</mask>
			<mask id="svg-mask-status-dnd-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.84375" cy="0.84375" r="0.25" />
				<rect fill="black" x="0.6875" y="0.796875" width="0.3125" height="0.09375" rx="0.046875" ry="0.046875" />
			</mask>
			<mask id="svg-mask-status-offline-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.84375" cy="0.84375" r="0.25" />
				<circle fill="black" cx="0.84375" cy="0.84375" r="0.09375" />
			</mask>
			<mask id="svg-mask-status-typing-32" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.65" y="0.6875" width="0.5625" height="0.3125" rx="0.25" ry="0.25" />
			</mask>

			<mask id="svg-mask-avatar-default-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2222222222222222" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6111111111111112" y="0.5416666666666666" width="0.4444444444444444" height="0.5833333333333334" rx="0.1111111111111111" ry="0.1111111111111111" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6611111111111112" y="0.6944444444444444" width="0.5" height="0.2777777777777778" rx="0.2222222222222222" ry="0.2222222222222222" />
			</mask>
			<mask id="svg-mask-status-online-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2222222222222222" />
			</mask>
			<mask id="svg-mask-status-online-mobile-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1933" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2222222222222222" />
				<circle fill="black" cx="0.75" cy="0.75" r="0.16666666666666666" />
			</mask>
			<mask id="svg-mask-status-dnd-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2222222222222222" />
				<rect fill="black" x="0.6944444444444444" y="0.7916666666666667" width="0.2777777777777778" height="0.08333333333333333" rx="0.041666666666666664" ry="0.041666666666666664" />
			</mask>
			<mask id="svg-mask-status-offline-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.2222222222222222" />
				<circle fill="black" cx="0.8333333333333334" cy="0.8333333333333334" r="0.08333333333333333" />
			</mask>
			<mask id="svg-mask-status-typing-36" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.6611111111111112" y="0.6944444444444444" width="0.5" height="0.2777777777777778" rx="0.2222222222222222" ry="0.2222222222222222" />
			</mask>

			<mask id="svg-mask-avatar-default-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.85" cy="0.85" r="0.225" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.625" y="0.55" width="0.45" height="0.6" rx="0.1" ry="0.1" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6625" y="0.7" width="0.55" height="0.3" rx="0.225" ry="0.225" />
			</mask>
			<mask id="svg-mask-status-online-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.225" />
			</mask>
			<mask id="svg-mask-status-online-mobile-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1711" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.225" />
				<circle fill="black" cx="0.775" cy="0.775" r="0.15" />
			</mask>
			<mask id="svg-mask-status-dnd-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.225" />
				<rect fill="black" x="0.7" y="0.7999999999999999" width="0.3" height="0.1" rx="0.05" ry="0.05" />
			</mask>
			<mask id="svg-mask-status-offline-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.225" />
				<circle fill="black" cx="0.85" cy="0.85" r="0.1" />
			</mask>
			<mask id="svg-mask-status-typing-40" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.6625" y="0.7" width="0.55" height="0.3" rx="0.225" ry="0.225" />
			</mask>

			<mask id="svg-mask-avatar-default-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.8636363636363636" cy="0.8636363636363636" r="0.22727272727272727" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6363636363636364" y="0.5568181818181818" width="0.45454545454545453" height="0.6136363636363636" rx="0.11363636363636363" ry="0.11363636363636363" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6670454545454546" y="0.7045454545454546" width="0.5681818181818182" height="0.3181818181818182" rx="0.22727272727272727" ry="0.22727272727272727" />
			</mask>
			<mask id="svg-mask-status-online-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8636363636363636" cy="0.8636363636363636" r="0.22727272727272727" />
			</mask>
			<mask id="svg-mask-status-online-mobile-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1552" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8636363636363636" cy="0.8636363636363636" r="0.22727272727272727" />
				<circle fill="black" cx="0.7727272727272727" cy="0.7727272727272727" r="0.1590909090909091" />
			</mask>
			<mask id="svg-mask-status-dnd-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8636363636363636" cy="0.8636363636363636" r="0.22727272727272727" />
				<rect fill="black" x="0.7159090909090909" y="0.8181818181818182" width="0.29545454545454547" height="0.09090909090909091" rx="0.045454545454545456" ry="0.045454545454545456" />
			</mask>
			<mask id="svg-mask-status-offline-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8636363636363636" cy="0.8636363636363636" r="0.22727272727272727" />
				<circle fill="black" cx="0.8636363636363636" cy="0.8636363636363636" r="0.09090909090909091" />
			</mask>
			<mask id="svg-mask-status-typing-44" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.6670454545454546" y="0.7045454545454546" width="0.5681818181818182" height="0.3181818181818182" rx="0.22727272727272727" ry="0.22727272727272727" />
			</mask>

			<mask id="svg-mask-avatar-default-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.875" cy="0.875" r="0.20833333333333334" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6666666666666666" y="0.59375" width="0.4166666666666667" height="0.5625" rx="0.10416666666666667" ry="0.10416666666666667" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6947916666666666" y="0.7291666666666666" width="0.5208333333333334" height="0.2916666666666667" rx="0.20833333333333334" ry="0.20833333333333334" />
			</mask>
			<mask id="svg-mask-status-online-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.20833333333333334" />
			</mask>
			<mask id="svg-mask-status-online-mobile-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1552" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.20833333333333334" />
				<circle fill="black" cx="0.7916666666666666" cy="0.7916666666666666" r="0.14583333333333334" />
			</mask>
			<mask id="svg-mask-status-dnd-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.20833333333333334" />
				<rect fill="black" x="0.7395833333333334" y="0.8333333333333334" width="0.2708333333333333" height="0.08333333333333333" rx="0.041666666666666664" ry="0.041666666666666664" />
			</mask>
			<mask id="svg-mask-status-offline-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.20833333333333334" />
				<circle fill="black" cx="0.875" cy="0.875" r="0.08333333333333333" />
			</mask>
			<mask id="svg-mask-status-typing-48" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.6947916666666666" y="0.7291666666666666" width="0.5208333333333334" height="0.2916666666666667" rx="0.20833333333333334" ry="0.20833333333333334" />
			</mask>

			<mask id="svg-mask-avatar-default-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.875" cy="0.875" r="0.19642857142857142" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6785714285714286" y="0.6160714285714286" width="0.39285714285714285" height="0.5178571428571429" rx="0.08928571428571429" ry="0.08928571428571429" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6973214285714286" y="0.7321428571428572" width="0.5178571428571429" height="0.2857142857142857" rx="0.19642857142857142" ry="0.19642857142857142" />
			</mask>
			<mask id="svg-mask-status-online-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.19642857142857142" />
			</mask>
			<mask id="svg-mask-status-online-mobile-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1470" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.19642857142857142" />
				<circle fill="black" cx="0.8035714285714286" cy="0.8035714285714286" r="0.14285714285714285" />
			</mask>
			<mask id="svg-mask-status-dnd-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.19642857142857142" />
				<rect fill="black" x="0.75" y="0.8392857142857143" width="0.25" height="0.07142857142857142" rx="0.03571428571428571" ry="0.03571428571428571" />
			</mask>
			<mask id="svg-mask-status-offline-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.875" cy="0.875" r="0.19642857142857142" />
				<circle fill="black" cx="0.875" cy="0.875" r="0.08928571428571429" />
			</mask>
			<mask id="svg-mask-status-typing-56" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.6973214285714286" y="0.7321428571428572" width="0.5178571428571429" height="0.2857142857142857" rx="0.19642857142857142" ry="0.19642857142857142" />
			</mask>

			<mask id="svg-mask-avatar-default-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.85" cy="0.85" r="0.175" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.675" y="0.63125" width="0.35" height="0.4375" rx="0.1" ry="0.1" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.725625" y="0.75" width="0.3625" height="0.2" rx="0.175" ry="0.175" />
			</mask>
			<mask id="svg-mask-status-online-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.175" />
			</mask>
			<mask id="svg-mask-status-online-mobile-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1470" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.175" />
				<circle fill="black" cx="0.7875" cy="0.7875" r="0.125" />
			</mask>
			<mask id="svg-mask-status-dnd-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.175" />
				<rect fill="black" x="0.7374999999999999" y="0.8125" width="0.225" height="0.075" rx="0.0375" ry="0.0375" />
			</mask>
			<mask id="svg-mask-status-offline-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.85" cy="0.85" r="0.175" />
				<circle fill="black" cx="0.85" cy="0.85" r="0.0625" />
			</mask>
			<mask id="svg-mask-status-typing-80" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.725625" y="0.75" width="0.3625" height="0.2" rx="0.175" ry="0.175" />
			</mask>

			<mask id="svg-mask-avatar-default-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-avatar-status-round-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.8333333333333334" cy="0.8333333333333334" r="0.16666666666666666" />
			</mask>
			<mask id="svg-mask-avatar-status-mobile-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.6666666666666666" y="0.625" width="0.3333333333333333" height="0.4166666666666667" rx="0.09166666666666666" ry="0.09166666666666666" />
			</mask>
			<mask id="svg-mask-avatar-status-typing-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.7095833333333333" y="0.7333333333333334" width="0.35833333333333334" height="0.2" rx="0.16666666666666666" ry="0.16666666666666666" />
			</mask>
			<mask id="svg-mask-status-online-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.16666666666666666" />
			</mask>
			<mask id="svg-mask-status-online-mobile-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.0900" />
				<rect fill="black" x="0.1400" y="0.1188" width="0.7200" height="0.5250" rx="0.0720" ry="0.0540" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.0975" />
			</mask>
			<mask id="svg-mask-status-idle-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.16666666666666666" />
				<circle fill="black" cx="0.775" cy="0.775" r="0.11666666666666667" />
			</mask>
			<mask id="svg-mask-status-dnd-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.16666666666666666" />
				<rect fill="black" x="0.7250000000000001" y="0.8" width="0.21666666666666667" height="0.06666666666666667" rx="0.03333333333333333" ry="0.03333333333333333" />
			</mask>
			<mask id="svg-mask-status-offline-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.8333333333333334" cy="0.8333333333333334" r="0.16666666666666666" />
				<circle fill="black" cx="0.8333333333333334" cy="0.8333333333333334" r="0.058333333333333334" />
			</mask>
			<mask id="svg-mask-status-typing-120" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0.7095833333333333" y="0.7333333333333334" width="0.35833333333333334" height="0.2" rx="0.16666666666666666" ry="0.16666666666666666" />
			</mask>

			<mask id="svg-mask-status-online" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
			<mask id="svg-mask-status-idle" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.25" cy="0.25" r="0.375" />
			</mask>
			<mask id="svg-mask-status-dnd" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<rect fill="black" x="0.125" y="0.375" width="0.75" height="0.25" rx="0.125" ry="0.125" />
			</mask>
			<mask id="svg-mask-status-offline" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
				<circle fill="black" cx="0.5" cy="0.5" r="0.25" />
			</mask>
			<mask id="svg-mask-status-typing" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.5" ry="0.5" />
			</mask>
			<mask id="svg-mask-status-online-mobile" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<rect fill="white" x="0" y="0" width="1" height="1" rx="0.12" ry="0.09" />
				<rect fill="black" x="0.1400" y="0.06" width="0.72" height="0.5250" rx="0.04" ry="0.03" />
				<ellipse fill="black" cx="0.5" cy="0.83" rx="0.13" ry="0.098" />
			</mask>
			<mask id="svg-mask-avatar-default" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
				<circle fill="white" cx="0.5" cy="0.5" r="0.5" />
			</mask>
		</defs>
	</svg>
);
