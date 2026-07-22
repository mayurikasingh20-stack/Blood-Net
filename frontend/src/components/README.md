# Blood Net reusable component guide

## Design system

- **Colors:** cream (`#FBF6F1`) is the page background, white is used for cards, red (`#B81F3A`) is the main action color, deep red is its hover color, green means success, amber means warning, and charcoal is text.
- **Typography:** Inter is the normal UI font. Fraunces is used for headings and brand text.
- **Spacing:** use Tailwind's 4px scale (`p-4`, `gap-4`, `mt-6`) to keep screens consistent.
- **Radius and shadows:** fields use `rounded-lg`; cards use `rounded-xl` and a small shadow. Do not add strong shadows to every element.
- **Motion:** use the existing short `transition` classes for hover, focus, and menu states.
- **Responsive breakpoints:** mobile is the default. `md` (768px) is used for wider public navigation and `lg` (1024px) for the dashboard sidebar.

## Navigation

| Component | Purpose and main props | Later use and good practice |
| --- | --- | --- |
| `navigation/Navbar` | Top navigation. Props: `brand`, `brandTo`, `links`, `rightContent`. | Public and dashboard headers. Keep link data in the layout/page, not inside this component. |
| `navigation/Sidebar` | Dashboard menu. Props: `items`, `open`, `onClose`, `title`. | Admin, donor, patient, and blood bank areas. Give every item `label`, `to`, and optional Lucide `icon`. |
| `navigation/Footer` | Reusable footer. Props: `brand`, `links`. | Public and dashboard layouts. Pass real links from the relevant layout. |
| `navigation/Breadcrumb` | Shows the current location. Prop: `items`. | Detail, profile, request, and settings pages. Last item should be the current page. |

## UI and forms

| Component | Purpose and main props | Later use and good practice |
| --- | --- | --- |
| `ui/Button` | Main action button. Props: `variant`, `size`, `loading`, `disabled`. | Forms, tables, modals, and CTAs. Use `type="submit"` inside a form. |
| `ui/Card` | White bordered content surface. Props: `padding`, `as`, `className`. | Forms, profile sections, and dashboard widgets. Avoid nesting many cards. |
| `ui/Badge` | Small colored label. Props: `tone`, `children`. | Blood groups, categories, and simple statuses. |
| `ui/Avatar` | User photo or initials fallback. Props: `src`, `name`, `size`. | User menus and profile screens. Always provide `name`. |
| `ui/Divider` | Horizontal or vertical line. Prop: `orientation`. | Separating related content. Use only when spacing alone is not clear. |
| `forms/Input` | Text, email, number, date, and other single-line fields. Props: `label`, `error`, `hint`, `required`. | Login and future data-entry forms. Use a unique `name` or `id`. |
| `forms/TextArea` | Multi-line field. Props match `Input`, plus `rows`. | Messages, notes, and request descriptions. |
| `forms/Select` | Select from `{ value, label }` options. Props: `options`, `placeholder`, `error`. | Blood type, city, and status filters. Parent owns selected value. |
| `forms/Checkbox` | Checkbox with label. Props: `label`, plus normal input props. | Terms, consent, and multi-select filters. |
| `forms/RadioButton` | One option in a radio group. Props: `label`, `name`, `value`. | Role and request-type choice. All options share the same `name`. |
| `forms/PasswordInput` | Password field with Show/Hide button. Uses Input props. | Authentication and password-change pages in later work. |
| `forms/FileUpload` | Accessible file picker. Props: `label`, `accept`, `multiple`, `onChange`. | Documents and profile photo forms. The parent handles validation and upload. |

## Feedback and data

| Component | Purpose and main props | Later use and good practice |
| --- | --- | --- |
| `feedback/LoadingSpinner` | Small loading indicator. Props: `size`, `label`. | Button areas and content panels. Keep loading near the affected content. |
| `feedback/SkeletonLoader` | Content placeholder. Props: `lines`. | Tables and cards while future API data loads. |
| `feedback/EmptyState` | No-data message. Props: `title`, `description`, `actionLabel`, `onAction`. | Empty donation, request, and camp lists. Explain what the user can do next. |
| `feedback/Alert` | Generic static message. Props: `tone`, `title`, `children`. | Informational, warning, and page messages. |
| `feedback/ErrorMessage` / `SuccessMessage` | Ready-to-use error/success alerts. Props pass to Alert. | Form submit results. Keep messages clear and short. |
| `feedback/Toast` | Temporary controlled notification. Props: `message`, `tone`, `onDismiss`, `duration`. | Successful actions in later phases. Render it once near the application root. |
| `feedback/ConfirmationModal` | Controlled confirm dialog. Props: `open`, `onConfirm`, `onCancel`, `danger`. | Cancelling a request or deleting an item. Use only for important actions. |
| `data/Table` | Displays rows from `columns` and `rows`. | Donation history, requests, and inventory. Pass `render` in a column for custom cells. |
| `data/Pagination` | Controlled previous/next paging. Props: `page`, `totalPages`, `onPageChange`. | API list pages. Parent owns fetching and page state. |
| `data/SearchBox` | Controlled search input. Props: `value`, `onChange`, `placeholder`. | All searchable lists. Debounce in the parent when API search is added. |
| `data/FilterPanel` | Wrapper around caller-supplied filters. Props: `children`, `onApply`, `onReset`. | Blood inventory and request listing filters. Keep filter state in the page. |

## Dashboard and layouts

| Component | Purpose and main props | Later use and good practice |
| --- | --- | --- |
| `dashboard/DashboardCard` | Dashboard section with title/action. Props: `title`, `action`, `children`. | Recent activity and quick-action areas. |
| `dashboard/StatisticsCard` | Highlights one number. Props: `label`, `value`, `icon`, `change`. | Dashboard totals such as donors or units. Keep calculations outside this component. |
| `dashboard/StatusBadge` | Common status color mapping. Prop: `status`. | Request, donation, and approval status columns. |
| `layouts/PublicLayout` | Navbar, content space, and footer. Props: `children`, `navLinks`, `footerLinks`. | Landing, About, Contact, Login, and Register routes later. |
| `layouts/DashboardLayout` | Navbar, responsive Sidebar, main content, Footer. Props: `children`, `sidebarItems`, `navLinks`, `title`. | Admin, donor, patient, and blood bank route groups later. |

All components use props, semantic HTML, keyboard-focus styles, and mobile-first Tailwind classes. They do not import services, call APIs, manage application data, or contain Blood Net-specific business rules.
