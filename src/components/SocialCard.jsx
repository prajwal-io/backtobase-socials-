export default function SocialCard({ title, description, url }) {
  const mark = title === 'LinkedIn'
    ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.2 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.6h.1A4.2 4.2 0 0 1 16.8 8.7c4 0 4.8 2.6 4.8 6V21h-3.8v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21H9.4V9Z"/></svg>
    : title === 'Instagram'
      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.8" r=".8" fill="currentColor" stroke="none"/></svg>
      : title === 'WhatsApp'
        ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.6c-.1-.2 0-.4.1-.5l.4-.5.3-.4c.1-.2 0-.3 0-.5l-.7-1.6c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3s-.9.9-.9 2.1 1 2.4 1.1 2.6a9.8 9.8 0 0 0 3.8 3.4c.5.2.9.4 1.2.5.5.2 1 .2 1.4.1.4-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
        : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>;
  return (
    <a className={`social-card social-card--${title.toLowerCase()}`} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${title}: ${description} Opens in a new tab`}>
      <span className={`platform-mark platform-${title.toLowerCase()}`} aria-hidden="true">{mark}</span>
      <span className="card-copy">
        <span className="card-title">{title}</span>
        <span className="card-description">{description}</span>
      </span>
      <span className="card-arrow" aria-hidden="true">↗</span>
    </a>
  );
}
