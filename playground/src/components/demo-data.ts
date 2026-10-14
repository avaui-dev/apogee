// Demo content for section docs and showcase pages. Wordmarks are inline SVGs.
const wordmark = (text: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="0 0 120 32"><text x="0" y="23" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#1d1f22">${text}</text></svg>`)}`
export const logos = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli'].map((name) => ({ src: wordmark(name), alt: name }))
export const picture = (seed: string, w = 1200, h = 800) => ({ src: `https://picsum.photos/seed/${seed}/${w}/${h}`, alt: 'Placeholder photograph', width: w, height: h })
export const features = [
  { icon: 'zap' as const, title: 'Fast by default', description: 'Static HTML, no runtime, islands only where a browser needs one.' },
  { icon: 'shield' as const, title: 'Accessible', description: 'Every control keyboard-operable, every pair of colours checked for contrast.' },
  { icon: 'layers' as const, title: 'Composable', description: 'Sections are built from the same primitives you use in your own pages.' },
  { icon: 'globe' as const, title: 'Right to left', description: 'Logical properties throughout; flip the document and every section mirrors.' },
  { icon: 'sparkles' as const, title: 'Themed by tokens', description: 'Five hues and seven roles; change the brand in one file.' },
  { icon: 'lock' as const, title: 'Yours to edit', description: 'Copied into your repo, not installed from a package.' },
]
export const stats = [
  { value: '85', label: 'Components', description: 'Copy-in, typed, documented' },
  { value: '20', label: 'Sections', description: 'Marketing and application' },
  { value: '0 kB', label: 'Runtime', description: 'Until an island is needed' },
  { value: 'AA', label: 'Contrast', description: 'Every pair, both themes' },
]
export const quotes = [
  { quote: 'We shipped the marketing site in a week and the design never drifted from the product.', name: 'Ada Lovelace', role: 'Head of Design, Northwind', avatar: 'https://i.pravatar.cc/96?img=5' },
  { quote: 'The sections are honest HTML. Our editors fill them in and nothing breaks.', name: 'Alan Turing', role: 'Engineering lead, Globex', avatar: 'https://i.pravatar.cc/96?img=12' },
  { quote: 'Dark mode, right to left, contrast: all handled before we asked.', name: 'Grace Hopper', role: 'Founder, Initech' },
]
export const faqs = [
  { question: 'Do I need to install a package at runtime?', answer: 'No. Components and sections are copied into your repository and build to plain HTML.' },
  { question: 'Can I change the brand colour?', answer: 'Yes. Edit one file of hue inputs and rebuild the tokens; the contrast gate checks every pair.' },
  { question: 'Does it work without JavaScript?', answer: 'Every section renders and works without JS; a few controls add small islands for convenience.' },
  { question: 'Is it accessible?', answer: 'Every page in the docs passes an automated accessibility check in both themes, and the components follow the ARIA patterns.' },
]
export const team = [
  { name: 'Ada Lovelace', role: 'Design', avatar: 'https://i.pravatar.cc/160?img=5', bio: 'Draws the system and keeps it honest.', links: [{ label: 'Website', href: '#' }] },
  { name: 'Alan Turing', role: 'Engineering', avatar: 'https://i.pravatar.cc/160?img=12', bio: 'Owns the build and the gates.', links: [{ label: 'Code', href: '#' }] },
  { name: 'Grace Hopper', role: 'Docs', bio: 'Writes the pages you are reading.' },
  { name: 'Katherine Johnson', role: 'Research', avatar: 'https://i.pravatar.cc/160?img=47', bio: 'Measures everything twice.' },
]
export const plans = [
  { name: 'Starter', price: '$0', period: 'month', description: 'For side projects.', features: ['All components', 'Community support', 'MIT licence'], action: { label: 'Start free', href: '#' } },
  { name: 'Pro', price: '$12', annualPrice: '$10', period: 'month', description: 'For teams shipping sites.', features: ['Everything in Starter', 'Sections and blocks', 'Priority support', 'Private registry'], action: { label: 'Start trial', href: '#' }, featured: true },
  { name: 'Agency', price: '$49', annualPrice: '$39', period: 'month', description: 'For many clients.', features: ['Everything in Pro', 'Unlimited brands', 'Onboarding call', 'Invoicing'], action: { label: 'Talk to sales', href: '#' } },
]
export const posts = [
  { title: 'Designing sections that editors can fill', excerpt: 'Props for the common case, slots for the rest. How we drew the line.', href: '#', image: picture('post-1', 1200, 675), date: '2026-10-02', author: { name: 'Ada Lovelace', avatar: 'https://i.pravatar.cc/64?img=5' } },
  { title: 'Zero JavaScript until it earns its place', excerpt: 'Why every section renders without a runtime, and what the islands are for.', href: '#', image: picture('post-2', 800, 450), date: '2026-09-18', author: { name: 'Alan Turing', avatar: 'https://i.pravatar.cc/64?img=12' } },
  { title: 'Contrast as a build gate', excerpt: 'The script that fails the build when a colour pair drops under AA.', href: '#', image: picture('post-3', 800, 450), date: '2026-09-04', author: { name: 'Grace Hopper' } },
  { title: 'Right to left, by default', excerpt: 'Logical properties everywhere, and the one page that proves it.', href: '#', image: picture('post-4', 800, 450), date: '2026-08-21' },
]
export const contactDetails = [
  { icon: 'mail' as const, label: 'Email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
  { icon: 'phone' as const, label: 'Phone', value: '+1 (555) 010-0100', href: 'tel:+15550100100' },
  { icon: 'map-pin' as const, label: 'Office', value: '12 Harbour Street, Lisbon' },
]
export const footerColumns = [
  { heading: 'Product', links: [{ label: 'Components', href: '#' }, { label: 'Sections', href: '#' }, { label: 'Pricing', href: '#' }] },
  { heading: 'Company', links: [{ label: 'About', href: '#' }, { label: 'Blog', href: '#' }, { label: 'Contact', href: '#' }] },
  { heading: 'Legal', links: [{ label: 'Privacy', href: '#' }, { label: 'Terms', href: '#' }] },
]
export const social = [
  { label: 'Email', href: '#', icon: 'mail' as const },
  { label: 'Community chat', href: '#', icon: 'message' as const },
  { label: 'RSS feed', href: '#', icon: 'rss' as const },
]
export const metrics = [
  { label: 'Revenue', value: '$48,200', change: '+12%', trend: 'up' as const },
  { label: 'Active users', value: '3,912', change: '+4%', trend: 'up' as const },
  { label: 'Churn', value: '1.8%', change: '-0.3%', trend: 'down' as const },
  { label: 'Open tickets', value: '27' },
]
export const settingsGroups = [
  { heading: 'Profile', description: 'How you appear to your team.', fields: [
    { kind: 'input' as const, name: 'name', label: 'Full name', value: 'Ada Lovelace', required: true },
    { kind: 'input' as const, name: 'email', label: 'Email', type: 'email' as const, value: 'ada@example.com', required: true },
    { kind: 'textarea' as const, name: 'bio', label: 'Bio', hint: 'A sentence or two.', value: 'Draws the system and keeps it honest.' },
  ] },
  { heading: 'Preferences', description: 'Language and notifications.', fields: [
    { kind: 'select' as const, name: 'language', label: 'Language', options: [{ label: 'English', value: 'en' }, { label: 'Português', value: 'pt' }, { label: 'العربية', value: 'ar' }], value: 'en' },
    { kind: 'switch' as const, name: 'digest', label: 'Weekly digest email', value: 'on' },
    { kind: 'switch' as const, name: 'mentions', label: 'Notify me on mentions' },
  ] },
]
export const tableColumns = [
  { key: 'name', label: 'Customer', sortable: true },
  { key: 'plan', label: 'Plan' },
  { key: 'seats', label: 'Seats', sortable: true, align: 'end' as const },
  { key: 'status', label: 'Status' },
]
export const tableRows = [
  { name: 'Northwind', plan: 'Pro', seats: 24, status: 'Active' },
  { name: 'Acme', plan: 'Agency', seats: 120, status: 'Active' },
  { name: 'Globex', plan: 'Starter', seats: 3, status: 'Trial' },
  { name: 'Initech', plan: 'Pro', seats: 18, status: 'Past due' },
  { name: 'Umbrella', plan: 'Agency', seats: 64, status: 'Active' },
]
