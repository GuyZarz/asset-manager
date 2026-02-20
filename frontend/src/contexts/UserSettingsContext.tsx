import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getUserSettings, updateUserSettings } from "@/api/users";

interface UserSettingsContextValue {
  preferredCurrency: string;
  loading: boolean;
  updateCurrency: (currency: string) => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextValue | null>(
  null
);

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [preferredCurrency, setPreferredCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserSettings()
      .then((res) => {
        if (res.success && res.data) {
          setPreferredCurrency(res.data.preferredCurrency);
        }
      })
      .catch((err) => {
        console.error("Failed to load user settings:", err);
        // Default to USD on error
        setPreferredCurrency("USD");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateCurrency = async (currency: string) => {
    try {
      await updateUserSettings({ preferredCurrency: currency });
      setPreferredCurrency(currency);
    } catch (err) {
      console.error("Failed to update preferred currency:", err);
      throw err;
    }
  };

  return (
    <UserSettingsContext.Provider
      value={{ preferredCurrency, loading, updateCurrency }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error(
      "useUserSettings must be used within a UserSettingsProvider"
    );
  }
  return context;
}
