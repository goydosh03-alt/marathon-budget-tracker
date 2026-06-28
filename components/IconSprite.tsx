export function Icon({ id }: { id: string }) {
  return (
    <svg aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="i-bell" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.2a5.8 5.8 0 00-5.8 5.8c0 3.4-1 5-1.7 5.9-.5.7 0 1.6.8 1.6h13.4c.8 0 1.3-.9.8-1.6-.7-.9-1.7-2.5-1.7-5.9A5.8 5.8 0 0012 2.2z" /><path fill="currentColor" d="M9.6 18.6a2.4 2.4 0 004.8 0z" /></symbol>
      <symbol id="i-globe" viewBox="0 0 24 24"><circle className="ic" cx="12" cy="12" r="9" /><path className="ic" d="M3 12h18" /><path className="ic" d="M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" /></symbol>
      <symbol id="i-copy" viewBox="0 0 24 24"><rect className="ic" x="9" y="9" width="11" height="11" rx="2.5" /><path className="ic" d="M5 15V5a2 2 0 012-2h8" /></symbol>
      <symbol id="i-eye" viewBox="0 0 24 24"><path className="ic" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle className="ic" cx="12" cy="12" r="3" /></symbol>
      <symbol id="i-eye-off" viewBox="0 0 24 24"><path className="ic" d="M2 12s4-7 10-7c2.1 0 3.9.8 5.3 1.8M22 12s-4 7-10 7c-2.1 0-3.9-.8-5.3-1.8" /><path className="ic" d="M9.9 9.9a3 3 0 004.2 4.2" /><path className="ic" d="M4 4l16 16" /></symbol>
      <symbol id="i-wallet" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M4 5h11a2 2 0 012 2v1h2.2A1.8 1.8 0 0121 9.8V18a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm14.6 8.1a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" /></symbol>
      <symbol id="i-card" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4h14a2 2 0 012 2v1H3V6a2 2 0 012-2z" /><path fill="currentColor" fillRule="evenodd" d="M3 9h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2zm3 6.2h6v1.8H6z" /></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 4a1.5 1.5 0 013 0v6.5H20a1.5 1.5 0 010 3h-6.5V20a1.5 1.5 0 01-3 0v-6.5H4a1.5 1.5 0 010-3h6.5z" /></symbol>
      <symbol id="i-income" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.4l7.6 7.6a1.4 1.4 0 01-1 2.4h-3V19a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 018.6 19v-5.6h-3a1.4 1.4 0 01-1-2.4z" /></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path fill="currentColor" d="M3.5 17.1V20a.9.9 0 00.9.9h2.9a.6.6 0 00.43-.18L17.85 10.55l-4.4-4.4L3.68 16.67a.6.6 0 00-.18.43z" /><path fill="currentColor" d="M20.7 6.35l-2.05-2.05a1.4 1.4 0 00-2 0L14.9 5.05l4.4 4.4 1.4-1.4a1.4 1.4 0 000-1.7z" /></symbol>
      <symbol id="i-scan" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M9 4l-1.3 1.8H4.5A2.5 2.5 0 002 8.3v9.2A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5V8.3a2.5 2.5 0 00-2.5-2.5h-3.2L15 4zm3 4.6A4.2 4.2 0 1012 17a4.2 4.2 0 000-8.4z" /><circle cx="12" cy="12.8" r="2.3" fill="currentColor" /></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><path fill="currentColor" d="M8 2v2H6a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-2V2h-2v2H10V2zm12 8H4v9a2 2 0 002 2h12a2 2 0 002-2z" /></symbol>
      <symbol id="i-home" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M11.3 3.3a1 1 0 011.4 0l8.4 7.6a1 1 0 01-.67 1.74H19.5V20a1 1 0 01-1 1h-3.5v-5a3 3 0 00-6 0v5H5.5a1 1 0 01-1-1v-7.36H3.57a1 1 0 01-.67-1.74z" /></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><circle cx="4.7" cy="6.5" r="1.6" fill="currentColor" /><rect x="8.6" y="5.3" width="11.4" height="2.4" rx="1.2" fill="currentColor" /><circle cx="4.7" cy="12" r="1.6" fill="currentColor" /><rect x="8.6" y="10.8" width="11.4" height="2.4" rx="1.2" fill="currentColor" /><circle cx="4.7" cy="17.5" r="1.6" fill="currentColor" /><rect x="8.6" y="16.3" width="11.4" height="2.4" rx="1.2" fill="currentColor" /></symbol>
      <symbol id="i-bars" viewBox="0 0 24 24"><rect x="4" y="11" width="3.6" height="8.5" rx="1.2" fill="currentColor" /><rect x="10.2" y="5.5" width="3.6" height="14" rx="1.2" fill="currentColor" /><rect x="16.4" y="13.5" width="3.6" height="6" rx="1.2" fill="currentColor" /></symbol>
      <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.2" fill="currentColor" /><path fill="currentColor" d="M3.8 20.2c0-3.7 3.7-6 8.2-6s8.2 2.3 8.2 6v.6a.6.6 0 01-.6.6H4.4a.6.6 0 01-.6-.6z" /></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 9.5h11L12 15z" /></symbol>
      <symbol id="i-trash" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4zm-2 6h10l-.8 11.1A2 2 0 0114.2 22H9.8a2 2 0 01-2-1.9z" /></symbol>
      <symbol id="i-back" viewBox="0 0 24 24"><path fill="currentColor" d="M14.5 5.5v13L8 12z" /></symbol>
      <symbol id="i-fwd" viewBox="0 0 24 24"><path fill="currentColor" d="M9.5 5.5v13L16 12z" /></symbol>
      <symbol id="i-download" viewBox="0 0 24 24"><path fill="currentColor" d="M11 3h2v8.2h3.2L12 16.5 7.8 11.2H11z" /><path fill="currentColor" d="M5 18.5h14V20.5H5z" /></symbol>
      <symbol id="i-arrow-left" viewBox="0 0 24 24"><path className="ic" d="M15 5l-7 7 7 7" /></symbol>
      <symbol id="i-arrow-right" viewBox="0 0 24 24"><path className="ic" d="M9 5l7 7-7 7" /></symbol>
      <symbol id="i-x" viewBox="0 0 24 24"><path className="ic" d="M6 6l12 12M18 6L6 18" /></symbol>
      <symbol id="i-scan" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M9 4l-1.3 1.8H4.5A2.5 2.5 0 002 8.3v9.2A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5V8.3a2.5 2.5 0 00-2.5-2.5h-3.2L15 4zm3 4.6A4.2 4.2 0 1012 17a4.2 4.2 0 000-8.4z" /><circle cx="12" cy="12.8" r="2.3" fill="currentColor" /></symbol>
      <symbol id="i-cog" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M9.7 2.5a.8.8 0 00-.78.62l-.4 1.78a7.5 7.5 0 00-1.5.87L5.3 5.9a.8.8 0 00-.97.35l-1.3 2.25a.8.8 0 00.18 1.02l1.4 1.15a7.6 7.6 0 000 1.74l-1.4 1.15a.8.8 0 00-.18 1.02l1.3 2.25a.8.8 0 00.97.35l1.72-.66c.46.35.96.64 1.5.87l.4 1.78a.8.8 0 00.78.62h4.6a.8.8 0 00.78-.62l.4-1.78c.54-.23 1.04-.52 1.5-.87l1.72.66a.8.8 0 00.97-.35l1.3-2.25a.8.8 0 00-.18-1.02l-1.4-1.15a7.6 7.6 0 000-1.74l1.4-1.15a.8.8 0 00.18-1.02l-1.3-2.25a.8.8 0 00-.97-.35l-1.72.66a7.5 7.5 0 00-1.5-.87l-.4-1.78a.8.8 0 00-.78-.62zM12 8.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" /></symbol>
      <symbol id="i-star" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.1 6.47L12 17.43 6.1 20.5l1.1-6.47-4.7-4.58 6.5-.95z" /></symbol>
      <symbol id="i-menu" viewBox="0 0 24 24"><rect x="3.5" y="5.4" width="17" height="2.2" rx="1.1" fill="currentColor" /><rect x="3.5" y="10.9" width="17" height="2.2" rx="1.1" fill="currentColor" /><rect x="3.5" y="16.4" width="17" height="2.2" rx="1.1" fill="currentColor" /></symbol>
      <symbol id="i-pie" viewBox="0 0 24 24"><path fill="currentColor" d="M11 2.05A10 10 0 1021.95 13H11z" /><path fill="currentColor" opacity="0.5" d="M13 2.05V11h8.95A10 10 0 0013 2.05z" /></symbol>
      <symbol id="i-search" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M10.5 3a7.5 7.5 0 105.92 12.08l4.25 4.25 1.4-1.4-4.25-4.25A7.5 7.5 0 0010.5 3zm0 2a5.5 5.5 0 110 11 5.5 5.5 0 010-11z" /></symbol>
      <symbol id="i-refresh" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4V1L8 5l4 4V6a6 6 0 015.2 9l1.5 1.3A8 8 0 0012 4z" /><path fill="currentColor" d="M12 18a6 6 0 01-5.2-9L5.3 7.7A8 8 0 0012 20v3l4-4-4-4z" /></symbol>
      <symbol id="i-repeat" viewBox="0 0 24 24"><path fill="currentColor" d="M7 7h9V4.5L20.5 8 16 11.5V9H8v3.5L5 12V9a2 2 0 012-2z" /><path fill="currentColor" d="M17 17H8v2.5L3.5 16 8 12.5V15h8v-3.5l3 2.5v3a2 2 0 01-2 2z" /></symbol>
    </svg>
  );
}
