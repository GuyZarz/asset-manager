import { useAuth } from "@/contexts/AuthContext";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useTheme } from "@/hooks/useTheme";
import { usePageTransition } from "@/hooks/usePageTransition";

export function ProfilePage() {
  const containerRef = usePageTransition();
  const { user, logout } = useAuth();
  const { preferredCurrency, setPreferredCurrency } = useUserSettings();
  const { theme, setTheme } = useTheme();

  if (!user) return null;

  return (
    <div ref={containerRef} className="page-transition space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Profile</h1>

      {/* User Info Card */}
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <div className="flex items-center gap-4">
          {user.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
              {user.name[0]}
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-text-primary">{user.name}</h2>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Settings Card */}
      <div className="card-shadow rounded-xl border border-border bg-surface-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Settings</h3>

        <div className="space-y-4">
          {/* Currency Setting */}
          <div>
            <label htmlFor="currency" className="mb-2 block text-sm font-medium text-text-secondary">
              Preferred Currency
            </label>
            <select
              id="currency"
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value as "USD" | "EUR" | "GBP")}
              className="w-full rounded-lg border border-border bg-surface-primary px-4 py-2 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          {/* Theme Setting */}
          <div>
            <label htmlFor="theme" className="mb-2 block text-sm font-medium text-text-secondary">
              Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              className="w-full rounded-lg border border-border bg-surface-primary px-4 py-2 text-text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="card-shadow w-full rounded-lg border border-border bg-surface-card px-4 py-3 text-center font-medium text-loss transition hover:bg-surface-hover"
      >
        Logout
      </button>
    </div>
  );
}
