const IconDownload = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.06c.53-1 1.82-2.05 3.74-2.05 4 0 4.74 2.64 4.74 6.07V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.86V21H9V9Z" />
  </svg>
);

const IconGithub = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.49.11-3.1 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.61.23 2.8.11 3.1.75.81 1.2 1.84 1.2 3.1 0 4.42-2.7 5.39-5.26 5.68.41.35.78 1.05.78 2.11v3.13c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const IconX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2H21l-6.52 7.45L22 22h-6.86l-4.7-6.18L4.9 22H2.14l6.98-7.98L2 2h6.96l4.25 5.7L18.244 2Zm-2.4 18h1.82L7.27 4H5.36l10.484 16Z" />
  </svg>
);

type ContactLinkSpec = {
  key: string;
  label: string;
  href: string;
  Icon: () => React.ReactElement;
};

function buildContactLinks(): ContactLinkSpec[] {
  const links: ContactLinkSpec[] = [];
  const email = import.meta.env.VITE_EMAIL as string | undefined;
  const linkedin = import.meta.env.VITE_LINKEDIN_URL as string | undefined;
  const github = import.meta.env.VITE_GITHUB_URL as string | undefined;
  const x = import.meta.env.VITE_X_URL as string | undefined;

  if (email) links.push({ key: 'email', label: 'Email', href: `mailto:${email}`, Icon: IconMail });
  if (linkedin) links.push({ key: 'linkedin', label: 'LinkedIn', href: linkedin, Icon: IconLinkedIn });
  if (github) links.push({ key: 'github', label: 'GitHub', href: github, Icon: IconGithub });
  if (x) links.push({ key: 'x', label: 'X', href: x, Icon: IconX });

  return links;
}

function ResumeCard() {
  const pdfUrl = import.meta.env.VITE_PDF_URL as string | undefined;

  return (
    <article className="cta-card">
      <div className="glow" aria-hidden="true" />
      <h2>Resume / CV</h2>
      <p>
        A concise snapshot of how I work, where I&rsquo;ve shipped, and the kind of teams I do my best
        work with. Grab the PDF or read it in your browser.
      </p>
      <div className="actions">
        {pdfUrl && (
          <a className="btn btn-primary" href={pdfUrl} download>
            <IconDownload />
            Download CV (PDF)
          </a>
        )}
        {pdfUrl && (
          <a className="btn btn-ghost" href={pdfUrl} target="_blank" rel="noreferrer">
            View online
            <IconArrow />
          </a>
        )}
      </div>
    </article>
  );
}

function ContactCard() {
  const links = buildContactLinks();
  if (links.length === 0) return null;

  return (
    <aside className="contact-card">
      <div className="label">Elsewhere</div>
      {links.map(({ key, label, href, Icon }) => {
        const isExternal = !href.startsWith('mailto:');
        return (
          <a
            key={key}
            className="contact-link"
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
          >
            <span className="left">
              <Icon />
              {label}
            </span>
            <span className="arrow">
              <IconArrow />
            </span>
          </a>
        );
      })}
    </aside>
  );
}

function Contact() {
  return (
    <section className="cta-row">
      <ResumeCard />
      <ContactCard />
    </section>
  );
}

export default Contact;
