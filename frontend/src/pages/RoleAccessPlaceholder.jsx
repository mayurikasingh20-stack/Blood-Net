// Temporary protected destination for the admin route until its dashboard phase starts.
export default function RoleAccessPlaceholder({ role }) {
  return <main className="flex min-h-[50vh] items-center justify-center px-4"><section className="max-w-md rounded-xl border border-ink/10 bg-paper p-6 text-center shadow-sm"><h1 className="font-serif text-2xl font-bold">{role} access confirmed</h1><p className="mt-3 text-sm text-ink-soft">This dashboard will be added in a later phase.</p></section></main>;
}
