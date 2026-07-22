import LoadingSpinner from "../components/feedback/LoadingSpinner";

// Used while the app checks a saved JWT before showing protected content.
export default function LoadingPage({ message = "Checking your session..." }) {
  return <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4"><LoadingSpinner size="lg" label={message} /><p className="text-sm text-ink-soft">{message}</p></div>;
}
