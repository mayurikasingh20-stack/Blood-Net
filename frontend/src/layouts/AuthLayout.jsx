export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );
}
