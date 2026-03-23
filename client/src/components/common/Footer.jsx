const footerColumns = [
  {
    title: 'About',
    links: ['Our Story', 'How It Works', 'Careers', 'Press']
  },
  {
    title: 'For Employers',
    links: ['Post Jobs', 'Review Applicants', 'Hiring Tips', 'Plans']
  },
  {
    title: 'For Candidates',
    links: ['Browse Jobs', 'Build Profile', 'Application Tips', 'Career Help']
  },
  {
    title: 'Contact',
    links: ['support@hirebridge.com', '+91 98765 43210', 'Bengaluru', 'Help Center']
  }
];

const Footer = () => {
  return (
    <footer style={{ background: '#1E1B4B' }} className="text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-lg">{column.title}</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {column.links.map((link) => (
                  <a key={link} href="#" className="block hover:text-white">
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-indigo-900 pt-6 text-sm text-slate-300">
          © 2025 HireBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
