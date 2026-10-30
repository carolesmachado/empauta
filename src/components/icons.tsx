const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconSearch = () => (<svg {...base} width={19} height={19}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconFilter = () => (<svg {...base}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>);
export const IconClose = () => (<svg {...base} strokeWidth={2.4} width={18} height={18}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconBack = () => (<svg {...base} strokeWidth={2.4}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>);
export const IconBookmark = () => (<svg {...base}><path d="M6 3h12v18l-6-4-6 4z" /></svg>);
export const IconShare = () => (<svg {...base}><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="m8.3 10.8 7.4-4.4M8.3 13.2l7.4 4.4" /></svg>);
export const IconCopy = () => (<svg {...base}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></svg>);
export const IconCheck = () => (<svg {...base} strokeWidth={2.4}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>);
export const IconHome = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3 3 10v10a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1V10z" /></svg>);
/** Cédula entrando na urna: representa o voto sem sugerir Sim ou Não. */
export const IconVote = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 13h-.68l-2 2h1.91L19 17H5l1.78-2h2.05l-2-2H6l-3 3v4c0 1.1.89 2 1.99 2H19c1.1 0 2-.89 2-2v-4l-3-3zm1 7H5v-1h14v1zm-7.66-4.98c.39.39 1.02.39 1.41 0l6.36-6.36c.39-.39.39-1.02 0-1.41L14.16 2.3c-.38-.4-1.01-.4-1.4-.01L6.39 8.66c-.39.39-.39 1.02 0 1.41l4.95 4.95zm2.12-10.61L17 6.95l-4.95 4.95-3.54-3.54 4.95-4.95z" /></svg>
);
export const IconWhats = () => (<svg {...base}><path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8z" /></svg>);
export const IconTelegram = () => (<svg {...base}><path d="M21 4 3 11l6 2 2 6 3-4 5 4z" /><path d="m9 13 12-9" /></svg>);
