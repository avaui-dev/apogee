# Changelog

All notable changes to Apogee are documented here.
Format: [Keep a Changelog](https://keepachangelog.com); versioning: [SemVer](https://semver.org).

## [Unreleased]

### Added

- **About pages, Blog post pages and Blog pages:** 10 whole pages each, stacked from blocks in the order of a real marketing site: a header navigation, the page header or article, then sections that alternate between the page colour, a grey band, the brand colour and a dark band, and a footer. `apogee add about/about-page-01` copies the page and the blocks it uses.
- **Pages built from blocks:** the registry records each block a page imports, so `apogee add` pulls those blocks in with the page.
- **Navbar** `background`: `page` (default, 85% with blur), `neutral-faded` or `primary` (both solid, so content scrolling under the sticky bar never shows through). On `primary` the links, menu button and action buttons take the on-brand colours by themselves; dropdown panels keep the page colours.
- **Brand surface:** `data-surface="primary"` on any element turns its subtree into a brand-colour band. Neutral text and lines take the on-primary ink and primary buttons invert, so components inside need no colour props.
- **`--navbar-height`:** a sticky Navbar outside `<main>` publishes its height (a CSS default per style without JS, measured with it). Sticky sidebars in the blog and article blocks and **ContentWrapper** `sticky` use `top-[calc(var(--navbar-height)+2rem)]`, so they stop below the bar instead of under it.
- **Header navigation blocks** take `background` and `theme="dark"`, passed to their Navbar.
- **Blog blocks** `simple-left-aligned-01` (a heading with a View all posts button beside it, over three posts) and `simple-left-aligned-02` (four posts in two columns).
- **Contact blocks** `map-01`, `map-02` and `centered-map` take `headingLevel={1}` to open a page; their item headings move down with it.

### Changed

- **Button** `outline` sits on a solid page fill, so it stays readable on a grey band, a blurred bar or a photo. Its hover tint lays over that fill instead of replacing it. On a brand surface the fill is the brand colour.
- **Section spacing:** `py-section-lg` (the `large` spacing every block uses) is 64px on phones and 96px on wide screens, down from up to 144px. Stacked sections sit closer, and the first section under the header no longer floats far below it.

### Fixed

- **Careers** `card-01` and **Content** `simple` blocks: the centred tab row no longer runs past the screen on phones; it scrolls inside its column.
- **Testimonials** `social-cards-03` (and brand): cards on the outer edges keep their outline and shadow; the fading column box clipped them.
- **Skeleton** and **LoaderText** mix their greys in OKLab. Mixing in OKLCH with a hue-0 white could tint them pink.
- **Contact** `map-01`: the eyebrow no longer repeats the heading.
- **PostCard** horizontal: the image covers its frame when the text is taller than the image, instead of leaving a gap under it with square bottom corners.
- **PostCard** no longer sets its own full height. A featured post above a grid of posts (as in the blog sidebar layouts) stretched to its column's height and pushed the grid out over the next section. In a grid cell, pass `class="h-full"` to match the tallest card, as the blocks do.

## [0.5.0] — 2026-10-16

### Changed

- **DeviceFrame** is redrawn: every part is sized in container units of the frame's width, so a frame keeps its proportions at any size and shrinks as a whole. The phone has a status bar (time, camera cut-out, status icons) so content starts below the corners; the browser is a quieter window with a small address pill and the page rounded and inset; no drop shadows. Width classes now apply (the built-in width used to override them). Content areas have fixed shapes (phone 393:798, tablet 1180:796, browser 16:10), and the playground screenshots are captured to match.
- **Dialog** side panels are at most 80vw wide, leaving room to tap outside; the centred dialog keeps 1rem off the screen edges.
- **SegmentedControl** matches Button and Input height at every size (it was taller); adds `xlarge`.
- **Inputs, selects and other outline fields** carry the outline button's subtle shadow.
- **Tooltip** opens after 120ms instead of 500ms.
- **Skeleton** fades from a clearly visible grey.
- **VideoPlayer** loses its drop shadow and gains a subtle border.
- **Card** media sits 4px inside the card's edge with matching corners, instead of touching it.
- **PostCard** fills its grid cell, so cards in a row match the tallest and the author, tags or link sit at the bottom; on hover the image zooms further and slower, the title underlines and the arrow nudges.
- **PostHeader** puts the date and reading time on their own line under the author, joined by a bullet; centred, the avatar sits above the name.
- **Text wrapping**: paragraphs use `text-wrap: pretty` (no lone last word) and headings `balance`.
- **Disabled controls** take no pointer anywhere: no hover, no press, no click.
- **Code** copy button sits flush in the corner, the same size and look as the docs' code blocks.
- **Carousel** arrows scroll to an exact slide position, so a slide is never left cut in half (WebKit didn't re-snap after the old fixed-distance scroll).
- **Neutral grey** is `mist` (a cool blue-green grey) instead of `slate`; every grey and neutral fill takes its tint.
- **Dark mode shadows** are black drop shadows, deeper than in light mode, instead of a faint white glow above each surface. Raised cards and menus now read as lifted on a dark page.
- **Disabled controls** read the disabled tokens (fill, border, text) instead of fading to half opacity: Checkbox, Radio (labels too), Actionable, Tabs, Pagination, TreeView, ToggleButton, Slider, NumberInput, Breadcrumbs, Tag, ChoiceCard and FileUpload.
- **Divider** lines use the border tokens, like every other rule.
- **Steps** shows the check on a finished step with `marker="icon"` too, as the docs say.
- **CommandPalette** demo shortcuts moved off combinations browsers keep for themselves.

### Fixed

- **Accordion** and **Collapsible** animate open and closed in Safari and on iPhones (the height animation needed `interpolate-size`, which WebKit lacks; they now animate a grid row).
- **Pressed feedback** shows on iPhones across the docs and examples (iOS fires `:active` only when the page has a touch listener).
- **Tooltip** `arrow` shows (the popover clipped it).
- **Table** and **DataGrid** sortable headers follow `headerStyle="caps"` (the sort button reset the case).
- **Avatar** keeps its shape in a flex row; it no longer narrows in a table on phones.
- **Sidebar** `slim` rail: links inside a flyout keep their labels (the flyout used to open empty).
- **Navbar** `floating`: the open phone menu continues the card instead of hanging below it.
- **Blocks**: inputs beside large buttons are large too (hero signups); card mockups 05 and 06 are centred, with larger cards in 06; content articles under a PostHeader lose the double gap after the header image; blog sidebars stick on desktop; newsletter screen mockup 04 no longer clips its heading on phones.
- **DeviceFrame** phone camera scales with the phone, so a small phone keeps its screen.
- Demo data and docs use invented company names instead of borrowed ones.
- **Types:** sections and pages are now type-checked (they were outside the check). Section, SectionHeader, Avatar, EmptyState, Footer, Select, Textarea, Input and Stat accept `undefined` for optional props, so the sections compile under `exactOptionalPropertyTypes`.
- **Steps** puts `aria-current="step"` on the current step's list item instead of its marker, which had no text with `marker="icon"` or `"dot"`.
- **ProgressIndicator** remaining dots and segments use the solid neutral fill; the faded one nearly vanished in dark mode.
- **Carousel** current dot takes the on-primary colour on a `bg-primary` fill, where the primary dot was invisible.
- **Shortcuts** with `alt` work on macOS, where Option turns the key into a symbol.
- **Actionable** `as="div"` fires on Space key release, like a native button.
- **Tabs** with `activation="manual"`: Tab-ing back into the list lands on the selected tab.
- **ScrollArea** is in the Tab order only while its content overflows.
- **Divider** with a label is named by that label; a separator hides its contents from screen readers.
- **FileUpload** is named by its prompt alone (the file name and hint describe it), and refuses several files dropped on a single-file input.
- **Pagination** keeps the Previous / Next label in its disabled state (no layout jump) and hides that cell from assistive tech.
- **Toast** `update()` can add a title to a toast created without one, a non-numeric progress reads 0%, and new text restarts the timer.
- **CommandPalette** announces each command's shortcut (`aria-keyshortcuts`), keeps the "·" separator out of names, and refuses a command shortcut equal to its own opening one.
- **ColorPicker** fires one `change`, on the named hex field, per committed pick.
- **Table** `sortable` leaves headers that hold a control alone.
- **Timeline** renders free-text times without `datetime` as text, not an invalid `<time>`.
- **Card** `as="button"` holds only inline elements, as a button must.
- **Steps** horizontal items lose the vertical gap below them.
- **Code** line numbers stay put while wide lines scroll; the copy button follows the inner-radius rule.
- **Sidebar** listens for the breakpoint once per page instead of once per setup.
- **FAQ** questions take the section's heading level when there is no section heading, like Features.
- **Testimonials** quote marks follow the page language (`<q>`).
- **CLI** `apogee list` no longer shows the internal `_shared` entry.
- **Package** ships no test files.

### Added

- **DeviceFrame** `device="tablet"`: an iPad-like landscape frame.
- **Docs**: the sidebar has a search box, keeps only the current group open and scrolls it into view; on phones a sticky docs menu bar opens it, the bars hide while you scroll down, and a floating previous / next pill follows you down the page.
- **WorldMap** `region`: one continent (North America, South America, Europe, Africa, Asia, Oceania) from the same dots, in that region's shape.
- **VideoPlayer** `radius`: `none`, `small`, `medium`, `large` (default) or `full`.
- **Navbar** `tools` slot: icon buttons that stay in the bar at every width, before the phone menu toggle.
- **Testimonials sections:** 26 blocks of customer quotes: single statements, rotating carousels, card grids, glass portraits, case-study panels and photo splits, on the page or the brand colour.
- **Team sections:** 14 blocks of people with round or square photos, bios and links, in grids, cards, a mosaic, glass panels or a scrolling row.
- **Social proof sections:** 12 blocks of customer logos (a row, two rows, a scrolling strip, a card, tiles) and press mentions, on the page or the brand colour.
- **Pricing sections:** 22 blocks: plan cards in nine styles, billing switches that work without JS, and two comparison tables with grouped features and tooltips.
- **Newsletter sections:** 16 email signups, centred, beside the heading, in a card, or next to a phone or screen mockup.
- **Metrics sections:** 16 blocks of headline figures in a row, a card, on a photo or beside an image, with dividers, accent lines, icons or links.
- **Header sections:** 30 inner-page headers, centred, left-aligned or split, on the page or the brand colour, with buttons, an email signup, a search field or a billing switch.
- **Hero sections:** 44 hero blocks: split image, sign-up form, angled and geometric patterns, screen and phone mockups, colour cards, card mockups and plain text, each with the page's `h1`.

- **Header navigation sections**: 20 headers whose menus open lists, columns, feature cards, blog posts or video tutorials, under the button or across the page, in a plain or floating bar.
- **NavDropdown**: a Navbar item that opens a panel of links; a native popover under the button or across the header (`fullWidth`, `floating`), a `<details>` row in the phone menu. Zero JS.
- **Navbar** `floating`: the bar on a rounded, raised pill. The header is the anchor for full-width dropdown panels, and the phone menu scrolls when it is taller than the screen.
- **Footer sections**: 40 footers; link columns or a row of links with a newsletter or launch signup, a call to action, app buttons, a rating or social links over a copyright line, large and small, and brand-colour versions.
- **Features sections**: 46 feature blocks; alternating rows, icon grids, icons beside a photo, phone or screenshot, icon cards, large screenshots, payment card stacks, feature tabs that switch screenshots, integration icons, and brand-colour versions.
- **VideoPlayer**: a native video behind a poster and one large play button; the browser's own controls take over once it plays. Captions track, no download until play.
- **PaymentCard**: a payment card drawn in CSS, solid or frosted glass, read as one image named by its last four digits.
- **Tabs** `variant="feature"`: each tab is a title and a `description` over a thick bar (on the start edge when vertical), named by the title and described by the line.
- **Docs**: customers and settings screenshots of the showcase dashboard in `/mockups/`, and a short dashboard tour video in `/media/`.

- **FAQ sections**: 16 FAQ blocks; questions in a grid (with or without icons, beside a photo) or in an accordion (plain or cards, beside the heading), each with a brand-colour version.
- **Accordion** `variant="plain"` (dividers, no outer border). **AccordionItem** `icon="plus"` (a circled plus that turns to a minus), `variant="card"` (a rounded card, tinted while open) and `size="large"`; the text and icon take the on-colour on a solid fill.
- **CTA sections**: 30 calls to action; simple, with customer logos, photos, sliding testimonials, phone and browser mockups, image collages and cards, and brand-colour versions.
- **DeviceFrame**: a screenshot in a phone or a browser window, drawn in CSS with the theme's colours; a dark screenshot swaps in with the theme. The docs ship light and dark screenshots of the showcase dashboard in `/mockups/`.
- **Content sections**: 22 content blocks; 12 article pages (centred, split, brand and photo headers, contents and contributors sidebars, newsletter cards, a photo carousel, a policy page with legal and plain tabs) and 10 content sections (text columns, text beside images, a case study, a quote, policy text).
- **ShareLinks**: Copy link (announced), the device's share sheet where there is one, and email; the email link works without JS.
- **TableOfContents**: a page's sections as in-page links in a named nav, one level of nesting, the current one marked.
- **Prose** leaves blocks inside `.not-prose` alone, for callouts and cards in an article.
- **Contact sections**: 35 contact blocks; forms beside a map or a photo, ways to reach you as items or cards, store lists, store tabs with maps, a world map of offices, sidebars with links, and brand-colour versions.
- **ContactForm**: names, email, a phone with a country code, the message, an optional services checklist and a privacy checkbox; posts without JS.
- **ContactMethod**: one way to reach you (icon, title, line and link), plain or on a card, start or centred.
- **MapEmbed**: an OpenStreetMap street map centred on a place, lazy, named, with a link to the full map; no key.
- **WorldMap**: a dotted world map (Natural Earth, public domain, ~18 KB) with office pins that link to the place and show its address on hover or focus.
- **Careers sections**: 12 careers blocks; open positions as rows or cards, in one or two columns, beside a heading or a photo, with department tabs that filter, a location menu, department groups, and brand-colour versions.
- **JobCard**: one open position, as a list row under a rule (reads on the brand colour too) or a bordered card with the department; location, type and salary as a labelled description list.
- **Blog sections**: 21 blog blocks; 16 blog index headers (featured post, centred or brand headers with an email sign-up, category links, search, sidebars, pagination or Load more) and 5 latest-posts sections (carousel, split, centred grid).
- **PostCard**: one article in a blog list, vertical or horizontal (by its own width), plain, a bordered card or with a frosted overlay, with a category, badge or byline line and an author, tags or Read post footer. BlogList now renders its posts with it.
- **Tooltip** `description` accepts `undefined` (strict types).
- **Tabs** renders a `<nav>` of links (named by `label`, the current one marked `aria-current="page"`) when every tab is a link, so link rows are navigation, not tabs. A `selected` variant styles the selected tab and the current link alike.
- **Blocks**: parts of a page in the registry, keyed `<category>/<name>` like pages (digits split off: `featured-post-01`). `apogee add banner/slim` copies one into `<dir>/blocks/banner/` with what it uses; `apogee list` shows them. The first set is 20 banner blocks (Banner sections in the docs).
- **Banner** section: a one-line announcement as a floating card (optionally `fixed` to the bottom of the viewport) or a full-width bar, on any section background, with `icon`, description and `actions` slots and a close button.
- **Countdown**: the time left until a date, ticking every second, with the end date as text for screen readers and without JS; fires `apogee:countdown-end`.
- **Dismissible** documents closing from your own `data-dismiss` button.
- **Docs**: heading anchors and their positioning stay out of component previews. The Apogee logo in the navbar; a favicon that follows light and dark mode, with `.ico`, Apple touch and manifest icons. Block previews fit their frame to the block.
- **Pages**: whole pages in the registry, keyed `<category>/<name>`. `apogee add log-in/split-quote` copies the page to `<dir>/pages/log-in/` with every section and component it uses; `apogee list` shows each page with its description. The first sets are 14 log in pages, 20 sign up pages, 3 verification pages, 5 forgot password pages and 14 404 pages.
- **AuthShell** section: the frame of a log in, sign up or recovery page, `centered`, `card`, `split` (a panel on either side) or `sidebar` (a narrow step column), with an optional pattern behind the brand mark and a `below` slot for a step list.
- **NotFound** takes `layout="start"` and `"split"` (with a `media` slot), `codeStyle="badge"`, a `back` button, `watermark`, `fullHeight`, and `icon`, default and `below` slots for search forms, help links and cards.
- **PasswordChecklist**: the rules a new password must meet, ticked off as the user types; keeps the field invalid until they hold, and a `match` rule checks a confirm field.
- **Carousel** `controlsPosition="below"`: arrows in a row under the track, with the dots between them, for slides the side arrows would cover.
- **Docs**: a Log in pages group; each page shows the example in a desktop or mobile frame with a Copy code button.
- **Docs sidebar**: each group collapses (all start open), shows its page count and remembers its state; the sidebar keeps its scroll position between pages instead of centring the current link. "Sections" is now "Basic sections".
- **Label props** for the English defaults: Navbar `menuLabel` and `secondaryLabel`, Sidebar `toggleLabel` and `overlayLabel`, NavLink `externalLabel`, FileUpload `messages`.
- **Pricing** items take an `annualPeriod`, shown in place of `period` while Annual is picked.
- **PageHeader** shows the `actions` slot in every layout.
- **LogoCloud** items take a `width` to reserve the logo's space.
- **Box** `bleed` has every padding step; **Heading** `maxLines` goes to 6 like Text.
- **Contrast gate** also checks secondary text on each tinted fill, and blends see-through text colours before measuring.
- **Codemod 0.3** lists old names it could not rewrite.

## [0.4.0] — 2026-10-15

### Changed

- **Input** end-slot buttons sit 4px from the edge (text suffixes keep their inset); the password reveal is a ghost icon Button sized to the field. **TagInput** remove buttons are CloseButtons; the docs' clear example uses one too.
- **Tokens** set `color-scheme` per theme, so native pickers, scrollbars and autofill follow dark mode.
- **Text fields** reach 16px on touch screens and narrow viewports (no iOS zoom); large sizes no longer shrink on phones.
- **Rating** fills stars with the vivid fill tokens instead of the darker text ones.
- **Skeleton** fades between its shade and a much lighter one.
- **LoaderText** shimmer has a dimmer base and a brighter band.
- **CommandPalette** groups have a rule and more space between them, and bolder headings.
- **FeaturedIcon** `outline` sits on a raised surface instead of no fill.
- **CircularProgress** text fits inside the ring (sized to the ring, wraps); size classes inside are overridden, `<small>` is the secondary part.
- **Carousel** disabled arrows keep their surface (the icon fades); overlay dots are darker when inactive.
- **Code** highlighted blocks drop the highlighter's own frame; the docs site no longer adds a second copy button to them.
- **Card** header and footer keep padding when the body has `padding="none"`.
- **Steps, Timeline** centre the first text line on the marker.
- **Sidebar** slim rail centres square items and slims the footer too.
- **Select** multiple marks are the Checkbox component.
- **TreeView** checkboxes are the Checkbox component; a nested branch's chevron turns only when that branch opens.
- **Carousel** arrows at an edge are disabled instead of hidden, so the layout does not shift.
- **Code** with `lang` keeps line breaks: highlighted code renders in its own block inside the panel (it used the inline mode, which joined lines).
- **CommandPalette** "No results." now actually shows when nothing matches (it was stuck hidden).
- **Table** header row has a faded fill by default, matching DataGrid (`headerFill={false}` restores the old look). DataGrid checkboxes use `data-row` / `data-all` instead of `data-datagrid-row` / `data-datagrid-all`.
- **NavLink** wraps its label in a span that truncates with an ellipsis instead of wrapping to a second line. Put icons in the `start` slot: an icon left in the default slot now sits inside the label and drops onto its own line.
- **SectionHeader** moves `max-w-prose` from the root to the text block, so the root spans its container (actions can sit beside the text).
- **FileUpload** no longer accepts a dropped file that fails `accept`; before, native `accept` only filtered the picker dialog.
- **Progress** root is now a wrapper around the `role="progressbar"` track (so value labels can sit beside or above it); `aria-labelledby` / `aria-describedby` still reach the track. **TagInput**, **PinInput** and **RichTextEditor** are now wrapped in Field, so `class` lands on the Field root and the control carries a generated `id`.

### Added
- **Docs** — `npm run check:docs` gate, keyboard tables, full token reference, Dark mode and Migrating to 0.4 pages, related links on every component page.

- **Pressed state** — a `press` utility (tokens file) lays an ink layer over any fill while it is pressed, stronger than hover; buttons, links, nav links, tabs, menu items, pagination, breadcrumbs, close buttons, interactive cards, tree rows, segmented options and toggles use it. Add `document.addEventListener('touchstart', () => {}, { passive: true })` to the head script so iOS shows it (Progressive enhancement page). Tap highlight is off.
- **Sliding selection** — Tabs and SegmentedControl move one indicator between items with CSS anchor positioning (`data-apogee-slide` + `.apogee-slide` in the tokens file); browsers without it keep the per-item fill.
- **Skin** — skeuomorphic now also bevels checked checkboxes, radios and switches, adds a sheen to solid buttons, and lifts surfaces (cards, choice cards, panels, dialogs, toasts, outline featured icons) through two new hooks, `--gradient-control` and `--shadow-surface`.
- **InputGroupAddon** is a `<label>` pointed at the field: a click focuses the input.
- **Input** — `type` takes `time`, `datetime-local`, `month`, `week`; date and time fields style their segments and picker button.
- **Tooltip** — a tap shows it on touch screens; a tap elsewhere hides it.
- **Tag** — a selectable tag shows a plus until it is picked.
- **NavLink** — the current page's start icon is filled with a tint.
- **utils/clipboard.ts** (`copyText`) — copies on plain-HTTP pages too; Code uses it.
- **Docs** — a Patterns page (recipe index, filter bar as a GET form, inline calls to action); recipes for date inputs, a notification count, an upload list and an account switcher; Tokens tables now name `--outline-color-focus` for focus rings and the `-highlighted` hover fills the components use.
- **Message** (new) — a chat message: sender in `<cite>`, `<time datetime>`, own messages (`me`) at the end, `status` sent | read | failed, `typing` dots, slots for avatar, reply quote, link preview, attachment and reactions. Zero JS.
- **Carousel** — `controlsVariant="overlay"` (translucent borderless arrows), `dotsPosition="overlay"`.
- **Breadcrumbs** — `variant` text | button | line; items take `icon` and `ariaLabel` (icon-only crumbs).
- **ColorPicker** — `swatches` (preset colours as native radios), `presets` (`<datalist>` suggestions), `eyedropper` (screen sampler where supported); `required` now reaches the hex field that submits.
- **Code** — `lineNumbers` (CSS counters, skipped when copying), `maxHeight` collapses a long block behind a "Show more" toggle (scrolls without JS); the "Copied" label respects reduced motion.
- **Stat** — `changeStyle` simple | trend | modern, `comparison`, `start` slot, `size`; `trend` defaults to `up`; the change announces "Up" or "Down".
- **CommandPalette** — commands take `icon`, `avatar`, `description` (`stacked` puts it on its own line) and `shortcut` (key caps that also run the command from anywhere); `empty` and `footer` slots; search ignores accents.
- **Toast** — `featured` icon tile, `avatar` + `time` for message toasts, `progress` with `apogeeToast.update(id, { progress, message, title })`; a progress toast stays until 100.
- **Alert** — `variant="banner"` (full-width strip, content in a centred column, actions at the end from `md`), `featured` (icon in a FeaturedIcon tile).
- **TreeView** (new) with **TreeItem** — branches on native `<details>`, leaves as rows or links; the island adds `role="tree"`, one tab stop, arrow keys, Home / End, typeahead and cascading checkboxes (`apogee:tree-select`). Without JS it stays a nested list.
- **Timeline** — items take `avatar` (as the marker), `datetime`, `href`; `line` solid | dotted | none; `size`; an `item-<index>` slot per item for rich bodies (activity feeds).
- **Pagination** — below `md` the numbers give way to a "Page x of y" summary (zero JS); `labels` shows Previous / Next text; `rounded` cells.
- **Steps** — responsive `orientation` (vertical | horizontal per breakpoint), `marker` number | dot | icon, `size`, per-item `status` and `icon`; the connector after a done step turns primary; done steps announce "(done)".
- **Tabs** — items take `icon` and `badge`; `orientation="vertical"`, `fullWidth`, `variant="primary"`, `activation="manual"`. `stepIndex` (utils/roving) takes an orientation.
- **Table** — `sortable` (header cells become sort buttons; `data-value` is the key for rich cells), `selectable` (wires `data-row` / `data-all` checkboxes), `size`, `striped`, `headerFill`. Sort and select live in the new `utils/table-enhance.ts`, shared with **DataGrid**, which gains `size` and `striped`.
- **Dialog** — the body scrolls under a pinned header and footer (drawers keep their buttons on screen); `media` slot (cover image, dark close button over it), `icon` slot with `iconPosition`, `header` slot for custom header markup, `footerLayout="fill"`; drawers keep a 1.5rem backdrop strip on narrow screens.
- **NavLink** — `match="prefix"` (a section link stays active on its child pages), `external` auto-detected from `http` hrefs (new tab, trailing icon). **NavGroup** (new, same folder) — a collapsible group of links on native `<details>` that opens when it contains the current page.
- **FileUpload** — dropped and picked files are checked against `accept` and the new `maxSize`; a refused file never reaches the input and the new `hint` says why (`aria-live`). `preview` shows a picked image; a disabled input dims the zone. `utils/files.ts` (`acceptsFile`, `readableSize`) is new.
- **Sidebar** — `variant="slim"` icon rail (labels screen-reader only from `md`), `overlay` mobile drawer on a native `<dialog>` (the nav is moved in and back, never duplicated).
- **Navbar** — `secondary` slot for a second row (tabs or pills), `centered` layout.
- **Divider** — `variant` line | dual | fill for labelled content; `interactive` for a button in the slot (no separator role, own colour).
- **EmptyState** — `variant="plain"` (no dashed box), three sizes, `pattern` rings | grid behind the icon (CSS only), `as` for a heading title; a FeaturedIcon in the slot keeps its own size.
- **SectionHeader** — `size="small"` for app pages and card tops, `actions` slot (beside the text from `md`, under it on phones), `divider`.
- **Card** — `header` and `footer` slots (bordered regions above and below the body, padded by `padding`), `mediaPosition="start"` for a media column beside the body.
- **Select, Combobox** — options take `icon` (a Lucide component) or `avatar` + `avatarName`; the Select trigger repeats the chosen option's media; listbox height follows `size`. **Select** `multiple`: checkbox marks, `search`, `selectAll` footer, `countLabel` ("2 selected"), `emptyText`. **Combobox** `multiple`: picks become chips in the field (`name`, `value`, `maxItems`, `apogee:combobox-change`).
- **InputGroup** (new) with **InputGroupAddon** — welds static text, a Button or a native select to an Input (1px seam, square inner corners, the group owns label / hint / error). Input `grouped`; Field `bare`.
- **Input** — `revealable` on a password field: an eye button shows or hides the value (small island).
- **FeaturedIcon** (new) — an icon in a tinted tile: `theme` light | solid | outline, every hue, four sizes, `rounded`, optional `label`.
- **CircularProgress** (new) — a determinate ring or half ring drawn as an SVG stroke (`pathLength="100"`): `value` / `min` / `max`, four sizes, three thicknesses, every hue, `shape="half"`, value text in the slot.
- **ChoiceCard** (new) — a card that is a native radio or checkbox: `type`, `name` / `value`, `title` / `description`, `indicator` radio | check | none, `indicatorPosition`, two sizes, slots for an icon, a price or a badge. Zero JS; arrows and Space work natively.
- **Avatar** — `xsmall` (24px) and `xlarge` (64px), `status` online | offline dot, `border` ring; images get a hairline contrast rim. AvatarGroup takes the new sizes.
- **Tag** — `count` pill; `selectable` (a native checkbox inside the chip, `name` / `value` / `checked`, zero JS).
- **Progress** — `min`, `labelPosition` end | bottom | floating with a `format` template; the fill moves with a transform instead of `width`. The root is now a wrapper around the `role="progressbar"` track.
- **Rating** — readonly fractional values (3.5 fills half a star, mirrored in RTL), `size`.
- **Switch** — `variant="slim"` (thin faded track, bordered overhanging knob).
- **NumberInput** — `orientation="vertical"` (stacked chevrons at the end).
- **TagInput** — wired to Field (`label`, `hint`, `error`, `required`), `size`, `maxTags`, `allowDuplicates`.
- **PinInput** — wired to Field (`label`, `hint`, `error`), `groups` with a separator, filled-box state, `xlarge`, per-box names say "N of M".
- **RichTextEditor** — wired to Field (`label`, `hint`, `error`, `required`), `disabled`, `hasError`, `limit` with a live count, alignment buttons, a tooltip with the shortcut on every toolbar button.
- **DropdownItem** — `indicator` check | checkbox | radio with a reserved column; checkbox and radio items get `menuitemcheckbox` / `menuitemradio` roles and `aria-checked`.
- **Button** — `variant="link"`, `showTextWhileLoading`; loading keeps the width (content hidden, spinner centred); `data-icon-only` / `data-loading` on the root replace the class rewrite; critical buttons focus in the critical colour. Focus ring token `--outline-color-focus` (`outline-focus`) replaces every hard-coded primary outline. Icons in buttons are sized as direct children, so a nested Spinner or avatar keeps its own size.
- **ButtonGroup, ToggleButtonGroup** — `disabled` (the root is now a `<fieldset role="group">`, so it is native); a focused item lifts above its neighbours so the outline is never clipped.
- **CloseButton** (new) — one ✕ for Dialog, Dismissible, Toast and Tag; `size` (xsmall–large), `theme="dark"` over media, `label`.
- **Field** — `tooltip` help icon (reachable when the control is disabled), `hideRequiredIndicator`, hint and error render together (`aria-describedby` lists both), hint text scales with `size`, `data-size` on the root. Text fields keep the caret clear of the padding when scrolling and keep their corners under autofill.
- **Checkbox, Radio, Switch** — `hint` under the label (`aria-describedby`); the checkbox tick and dash are a mask filled with `--on-primary` instead of a literal white; checkbox radius scales with size.
- **Badge, Tag** — tighter padding on the side that holds an icon or the remove button (`data-slot` wrappers).
- **Floating panels** slide in from their anchor side and scale from that edge (`data-placement` on every panel; `.apogee-panel` in the tokens file, re-run `init`). **Tooltip** — `description`, `arrow`, `delay` / `closeDelay`, a `shortcut` slot for a Kbd.
- **Skins** — opt-in `skin-skeuomorphic.css` (bevelled solid and outline buttons, segmented and toggle chips, outlined fields) enabled with `data-skin="skeuomorphic"` on `<html>` or any subtree; `init --skin skeuomorphic` copies it; `getSkin` / `setSkin` in `utils/theme.ts`. The base theme gains three inert variables the components read.

### Changed

- **Dropdown `align` → `placement`** (`'start'` → `'bottom-start'`, `'end'` → `'bottom-end'`). Tooltip, Dropdown, ContextMenu, Menubar and Combobox panels render in the top layer (no more clipping by `overflow: hidden`); Dropdown and Menubar no longer use `<details>`. **Migration:** the panels need the `.apogee-panel` rules at the end of `registry/tokens/theme.css`; re-run `init` (or copy that block) when you update any of these components, or closed-popover styling and anchoring break.
- **Hue inputs by name.** `scripts/hues.mjs` takes Tailwind colour names (`'blue-700'`, `'red-600'`, `'amber-400'`, `'green-700'`) or OKLCH objects; presets live in `scripts/palettes.mjs`. The neutral name picks the grey family (slate by default; gray, zinc, neutral, stone, mauve, olive, mist, taupe) and tints every grey: page, borders, text and fills. Hover and selected fills are a tinted mid-grey wash (light 7% and 13%, dark 10% and 16%) instead of black or white, so the family shows through.

### Added

- **Anchored-panel base** — every floating panel is a native popover anchored with CSS anchor positioning (`utils/panel.ts`, `.apogee-panel` in the tokens file): twelve `placement`s, `width="trigger"`, `gap`, `maxHeight`, flip when out of room, top layer so no ancestor clips it. Popover `anchor` slot, `id`, `padding`, `elevation`, `panelClass`. Tooltip `placement` with hover intent (500 ms, instant for neighbours), focus, Escape, touch ignored. Dropdown `DropdownSection`, `DropdownSub` (hover / ArrowRight), `width`, `maxHeight`, `anchor` slot; `DropdownItem` `color`, `size`, `selected`, `disabled`, `start` / `end` slots; activation closes the chain. ContextMenu and Menubar on the same base (`utils/menu.ts` keyboard helper). Select custom listbox via `options` (descriptions, disabled, `multiple`, type-ahead) over the native `<select>` as the form control, `placeholder`, `value`, `start` / `end` slots. Combobox rich options (`value`, `label`, `description`, `disabled`), wrap-around arrows, `apogee:combobox-select` carries `{ value, label }`.
- **Sections** — 21 page-level compositions under `registry/sections`, built from the components: marketing (Hero, LogoCloud, Features, Stats, Testimonials, CTA, FAQ, Content, Team, Pricing, BlogList, PostHeader, Contact, NotFound, FooterSection) and application (PageHeader, StatsCards, SettingsForm, TableShell, EmptyStateSection). Each takes `background`, `spacing`, `headingLevel` and a `layout`; `apogee add <section>` copies one in with its components. `SectionHeader` component, `Section` `background`. Showcase pages at `/showcase/*`.
- **Textarea** — `value` renders as content.
- **Responsive props** — `direction`, `gap`, `align`, `justify`, `wrap` on Box and Stack, `cols` and `gap` on Grid, `colSpan` / `rowSpan` on GridItem, `size` on Text accept `{ base, sm, md, lg, xl }` objects. Classes come from a generated table (`npm run build:responsive`).
- **Box** — `divided`, `paddingInline` / `paddingBlock`, `bleed`, every hue on `background` and `border`, `grow` / `shrink`.
- **GridItem** — spans and start lines; **Grid** — `colGap` / `rowGap`, `align` / `justify`, `as`.
- **Divider** — label slot with `contentPosition`, `color`, `inset`.
- **Image** — remote `src`, `fit`, `radius`, `outline`, a `fallback` slot for broken images.
- **Card** — `as` (article, section, li, button).
- **Text** — `weight`, `maxLines`, `numeric`, `align`, more tags; **Heading** — `weight`, `color`, `maxLines`, `align`.
- **Badge** — `highlighted`, `truncate`, a dot mode when empty, and `BadgeContainer` to anchor a badge on an avatar or icon.
- **Eyebrow** — `size`, `weight`, `uppercase`.
- **Link** — `start` / `end` icon slots, `critical` / `positive` / `warning` colours, `disabled`.
- **Code** — `lang` + `code` for build-time syntax highlighting in both themes.
- **Table, DataGrid** — `headerStyle: normal | caps` (default `normal`).
- **Dialog** — `dismissOnBackdrop`, responsive `position` (`{ base: 'bottom', md: 'center' }`), `size`, `padding`, `overlay` (dim, blurred, transparent), `subtitle` wired as the description, page scroll lock while open.
- **PinInput** — `hasError`, `disabled`, `value`; native attributes pass through.
- **Toast** — `position` per call, `apogeeToast()` returns an id, `apogeeToast.dismiss(id)`; the timer pauses while hovered or focused; `actions` (small ghost buttons that run `onClick` then dismiss), `width` (short, long or a length).
- **Carousel** — `label`; arrows hide at the edges; `apogee:carousel-change`.
- **Events** — `apogee:tag-input-change`, `apogee:combobox-select` (plus native `input` / `change` on commit), FileUpload drop fires `change`.
- **Tokens** — `--font-serif` (Blockquote and prose quotes use it).
- **Prose** — styles every page element: all headings, lead and small text, figures, video, iframes, tables, kbd, mark, abbr, definition lists, details.
- **Tabs** — item objects (`value`, `href`, `disabled`), `value` for the first tab, `variant` (bordered, borderless, pills, pills-raised), `size`, overflow scrolling with edge fades; panels are `panel-<value>` slots; `apogee:tabs-change` carries `value`.
- **Slider** — `range` (two thumbs, `minValue` / `maxValue`, submits `<name>-min` / `<name>-max` or `minName` / `maxName`), the badge shows the value with `format` (`'{value}%'`, `false` hides it), `orientation="vertical"`; the initial value snaps to `step`.
- **ToggleButton** — on the Button tables: `color`, `variant`, four `size`s, `rounded`, `iconOnly`; pressed look from `selectedColor` × `selectedVariant` (solid, faded); `value` + `name` submit through a hidden input while pressed.
- **ToggleButtonGroup** — roving tabindex with arrow / Home / End keys; keeps each button's hidden input in sync in `single` mode.
- **Checkbox** `indeterminate` + slot label; **Radio** slot label; **Switch** `reversed`, slot label; **CheckboxGroup / RadioGroup** tint their controls on `error`; **Textarea** `resize` (none, vertical, auto); **Input** `prefix` / `suffix`; **NumberInput** hold-to-repeat, clamp on commit, `prefix` / `suffix`, `increaseLabel` / `decreaseLabel`; **PinInput** `pattern` (numeric, alphabetic, alphanumeric); **Field** `disabled`, `size`.
- **Avatar** `color`, `variant`, `squared`; **Alert** `icon` slot, `role="alert"` for critical and warning; **Icon** token `color`, `autoWidth`; **Spinner** `color`; **Progress** `size`; **ProgressIndicator** `variant="dots"`; **Container** `padding`; **Dismissible** `align`, `variant="media"`, `hideClose`; **Table** `border`, `columnBorder`, edge fade; **ScrollArea** `fade`, `scrollbar`, `maxHeight`.
- **AccordionItem** `trigger` slot, `iconPosition`; **Actionable** `type`, `insetFocus`; **Breadcrumbs** `maxVisible`, `separator` slot, disabled items; **Button** `highlighted`, icon size per `size`; **Carousel** responsive `visibleItems`, `gap`, `bleed`; **Pagination** a constant seven cells, `previousLabel` / `nextLabel`; **FileUpload** default slot, `variant="headless"`, `inline`.
- **LoaderText**, **IconToggle**, **ContentToggle** — new components (shimmer text with a done crossfade; two-icon swap that ToggleButton drives; keyed content pager with directional slide).
- **Theme** — `mode="light | dark | inverted"` wrapper; `utils/theme` (`getTheme`, `setTheme`, `toggleTheme`, `apogee:theme-change`), transitions suppressed for two frames on switch.
- **Helpers** — `utils/hotkey` (`hotkey('mod+k', fn)`, used by CommandPalette), `utils/roving` `stepIndex` and `rovingTabindex` (Tabs, ToggleButtonGroup), `utils/fade` `edgeFade` (Tabs, Table, ScrollArea), `utils/scroll` `lockScroll` / `unlockScroll`.
- **utils/radius** — `innerRadius` table for concentric corners inside rounded trays.
- **Gates** — `npm run check:strict` (consumer-grade strictest typecheck) and `npm run test:behaviour` (browser suite).

### Changed

- **Stack** — `direction="col"` is now `direction="column"` (plus `row-reverse` / `column-reverse`).
- **Prose** — headings use the fluid type tokens, lists show markers, quotes and code match the Blockquote and Code components, roomier rhythm.
- Form controls are at least 16px text below the `md` breakpoint, so phones never zoom on focus.
- Avatar fallbacks and the AvatarGroup overflow chip use opaque fills.
- Avatar fallback fills (`variant="faded"`, the default) sit on an opaque page-coloured base, so overlapping avatars never show through each other.
- ToggleButton icons follow the Button size scale (14px at `small`, 20px at `xlarge`).
- Dialog drawers, sheets and full-screen have no border; only the centred modal keeps one.
- Slider: neutral track, higher-contrast thumb, logical fill direction.
- Slider badge shows the value, not a percentage.
- ToggleButton icon-only buttons need `iconOnly` for a square; the resting text colour is the hue's text, not the faded one.
- `apogee:toggle-group-change` detail is `{ value: string[] }` (was `pressed`).
- Page scroll lock moved to the tokens file: every modal dialog locks the page (`body:has(dialog:modal)`). **Migration:** re-run `init` (or copy the block) when you update Dialog or CommandPalette.
- ToggleButtonGroup, SegmentedControl and Menubar chips use concentric inner radii.
- Tooltip wraps long text (max 20rem) and renders nothing when `text` is empty.

### Fixed
- Image: `fit` now works when you size the box with a class; the image no longer forces `h-auto` while `fit` is set.
- Rating: stars run 1 → 5 in the DOM, so the arrow keys move the way the stars look (`→` raises); the fill uses `:has()`.
- Dropdown and Menubar: `←` and `→` swap under `dir="rtl"` (submenus open with `←`, the next menu is to the left).
- RichTextEditor: ⌘K / Ctrl+K opens the link prompt, as the Link button's hint said.
- CommandPalette: the input sets `aria-activedescendant`, so screen readers announce the highlighted result.
- Combobox: `↓` after closing a list with no matches reopens it with the first option highlighted.
- TagInput: removing a tag with its button moves focus to the next tag's button, or the text field, instead of the page.
- Tooltip: `select` and `textarea` triggers get `aria-describedby`; an `<a>` without `href` is no longer picked as the trigger.
- ContentToggle: the active child no longer plays its slide-in on page load.

- Carousel slides never received their snap and width styles (scoped CSS could not reach slotted children); arrows lost their fill on hover.
- SegmentedControl styled every option after the checked one as selected.
- TagInput could not add or remove tags (its template sat outside the root).
- Rating: 44px touch targets, hover preview only on devices that hover, no focus-ring leak.
- Tag: an icon in the default slot stacked above the label.
- Combobox committed a selection without any event.
- Input: a button in the `end` slot could not be clicked.
- Dropdown stayed open after a button item was activated.
- Radio and Checkbox: clicking between control and text now toggles (the wrapper is the label).
- Actionable `as="div"`: `role="button"` and Enter / Space activation.
- Skeleton renders a text-line height by default.
- Docs: the theme toggle bound only the hidden mobile copy of the button; typography, prose, table and other block examples render as rows; stale `muted`, `size="lg"`, `size="icon"` and `align="right"` references.
- Types: Button and Actionable declare `command` / `commandfor`; the registry typechecks under `astro/tsconfigs/strictest`.

## [0.3.0] — 2026-10-13

The 0.3 token model and prop vocabulary. See [Migrating to 0.3](https://apogee.avaui.dev/docs/migrating-to-0-3).

### Added

- **Token generator** — `scripts/hues.mjs` holds one OKLCH colour per hue; `npm run build:tokens` derives both themes, faded tints, hover steps, foregrounds and on-colours into `theme.css`. The contrast gate measures every generated pair in both themes, with alpha composited over the page.
- **Components** — Actionable, Box, CheckboxGroup, RadioGroup, Hidden, Expandable, Dismissible, ProgressIndicator, ScrollArea.
- **Fields** — shared size and variant tables (`outline | faded | ghost | headless`), `hasError`, `start` / `end` icon slots on Input; `size` and `hasError` on Checkbox, Radio, Switch; `size` and `variant` on PinInput and TagInput.
- **Button** — `color` × `variant` × `size` tables, `rounded`, `raised`, `fullWidth`, `iconOnly`, `loading` with a Spinner, `start` / `end` slots.
- **Badge, Tag, Alert, Toaster** — `color` and `variant` on every hue.
- **Card** — `raised`, `selected`, `padding`. **Link** — `color`. **Progress, Slider, Rating** — `color`. **Section** — `containerWidth`.
- **utils** — `uid()` deterministic ids per request, `island()` boot helper, shared field tables. Copied in automatically as a dependency.
- **Typing** — every `Props` extends `HTMLAttributes` for its root element; `astro check` runs on the registry (`npm run check`).
- **Codemod** — `scripts/codemod-0.3.mjs` rewrites 0.2 utilities and `var(--…)` names in a consumer's `src`.

### Changed

- **Tokens** — hues × roles replace the 0.2 semantic names: `--background-{hue}`, `-faded`, `-highlighted`, `-faded-highlighted`, `--border-{hue}`, `--foreground-{hue}`, `--on-{hue}`, plus page, elevation, disabled and inverted surfaces. Tailwind utilities are namespaced: `bg-primary` is the fill, `text-primary` readable text, `text-on-primary` text on the fill.
- **Motion** — `--duration-rapid | fast | medium | slow` (100 / 150 / 250 / 400ms) and `--ease-standard | accelerate | decelerate` replace `--duration-base`, `ease-smooth`, `ease-emphasized`.
- **Radius** — 4 / 6 / 10 / 14px under the same `rounded-sm | md | lg | xl` names.
- **Props** — `color: primary | neutral | critical | positive | warning`, `variant` is fill style only, `size: small | medium | large | xlarge`; `Text` and `Eyebrow` `muted` → `color="neutral-faded"`; `Container` `size` → `width`; `Section` `space` → `spacing`; `Dialog` single `position`; `DataGrid` `align: start | end`; `Input` `variant="floating"` → `labelPosition`.
- **NavLink** — slots `leading` / `trailing` are now `start` / `end`.
- **Ids** — components generate deterministic ids per request instead of random ones, so builds are reproducible.

### Removed

- The 0.2 tokens (`--accent`, `--muted`, `--surface`, `--border`, `--ring`, `--danger`, `--success` …).
- Button `variant="link"` (use `Link`) and `size="icon"` (use `iconOnly`).
- The `[key: string]: any` escape hatch in `Props`.

### Changed (earlier in this cycle)

- **Dialog** — `position` is now logical: `start` / `end` replace `left` /
  `right` (`end` is the right edge in LTR, the left in RTL). Default `end`.
- **Toaster** — `position` values are logical: `top-start`, `top-end`,
  `bottom-start`, `bottom-end` replace the `-left` / `-right` forms. Default
  `bottom-end`. New `id` prop (default `apogee-toaster`).
- **Navbar** — the `actions` slot now also renders inside the mobile panel, so
  actions stay reachable on small screens. The breakpoint is Tailwind's `md`
  utility instead of a hard-coded media query.
- **Registry** — every component declares `@composable` in the JSDoc block
  directly above `interface Props`, where AVA's descriptor reads it.
- **Tokens** — new `--overlay` (scrim behind Dialog and CommandPalette).
- **CLI** — `prepublishOnly` runs the new CLI tests; the contrast gate resolves
  Tailwind from the package's own devDependency.

### Fixed

- **RTL:** Dialog side panels, Carousel next/previous, and Toaster corners now
  mirror under `dir="rtl"`; all three joined the `/rtl` page.
- **DataGrid** — sort buttons and select-all are hidden without JS (plain labels
  show instead); `"12abc"` sorts as text, not as 12.
- **RichTextEditor** — only `http(s)` and `mailto` links are inserted.
- **Dropdown** — `aria-haspopup="menu"` and `aria-expanded` on the trigger;
  `ArrowDown` on the closed trigger opens it.
- **Tabs** — arrow keys follow the mirrored order in RTL; panels are focusable.
- **Carousel** — dots are a `group`, not a misused `tablist`.
- **Input, Switch** — transitions respect `prefers-reduced-motion`.
- **ContextMenu, Menubar** — document listeners bound once per page.
- **Radio, CommandPalette, Dialog** — no hard-coded white/black fills.
- **Toaster** — close icon is Lucide's `X`.
- **CLI** — refuses to write outside the components directory; a malformed
  `apogee.json` fails with a message instead of a stack trace.
- **Docs** — Tooltip page added.

## [0.2.0] — 2026-09-24

### Added

- **Font tokens** — `--font-sans` / `--font-mono` in `@theme` (system stacks by
  default, no visual change), plus `--spacing-section-xl`.
- **Dropdown, ContextMenu** — arrow-key / Home / End menu navigation.
- **NavLink** — optional leading/trailing slots for icons and badges.
- **Registry** — `usesJs` flag per component (detected from `<script>`).

### Changed

- **Section** — `space` now uses the fluid `py-section*` tokens instead of fixed
  breakpoint steps. Vertical padding will look slightly different.
- **Table** — headers are start-aligned, semibold, and use the foreground colour.
- **NavLink** — subtle hover fill, stronger active fill.

### Fixed

- **Works without JS:** Navbar and Sidebar keep their nav reachable; PinInput,
  TagInput and RichTextEditor still submit their values.
- **Dialog** — `aria-labelledby` points at the title.
- **Popover, Skeleton, Spinner** — respect `prefers-reduced-motion`.
- **NumberInput** — `disabled` also disables the steppers.
- **Avatar** — a broken `src` falls back to initials; no `src` and no name shows
  a user icon.
- **FileUpload** — a consumer-passed `id` no longer breaks the label link.

## [0.1.0] — 2026-09-16

First public release. Early — the API may still change before 1.0.

### Added

- **~75 copy-in Astro components** across atoms, forms, layout, interactive,
  navigation, data, and extras. Every component is accessible (keyboard, ARIA,
  visible focus, `prefers-reduced-motion`), responsive, and ships **zero external
  JavaScript** — interactivity is native-first, with progressive-enhancement
  islands gated by `no-js:`.
- **Design tokens** (Tailwind v4 `@theme`): semantic colours with light/dark
  override, fluid type scale, fluid layout spacing (`px-gutter`, `py-section*`),
  motion tokens (`--duration-*`, `ease-smooth`/`emphasized`), radius.
- **CLI** — `apogee init` / `add` / `list`, with transitive dependency
  resolution and a generated registry index. Dependency-free.
- **AA contrast gate** — `npm run check:contrast` computes WCAG ratios from the
  real tokens and fails on any miss (runs on `prepublishOnly`).
- **RTL support** — logical properties throughout; directional icons flip.

[0.5.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.5.0
[0.4.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.4.0
[0.3.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.3.0
[0.2.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.2.0
[0.1.0]: https://github.com/avaui-dev/apogee/releases/tag/v0.1.0
