// contexts/EvPresenterThemeContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAppDispatch } from "@/store";
import { setActiveFeature } from "@/store/slices/bibleSlice";

type EvPresenterThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleActiveFeature: (feature: string | null) => void;
};

const EvPresenterThemeContext = createContext<EvPresenterThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  toggleActiveFeature: () => {},
});

type EvPresenterThemeProviderProps = {
  children: ReactNode;
};

export const EvPresenterThemeProvider: React.FC<
  EvPresenterThemeProviderProps
> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize theme state on component creation
    const storedPreference = localStorage.getItem("evPresenterDarkMode");
    const isDark = storedPreference ? storedPreference === "true" : true;
    console.log(
      "EvPresenterTheme: Initializing - stored:",
      storedPreference,
      "isDark:",
      isDark
    );
    return isDark; // Default to dark mode for EvPresenter
  });
  const dispatch = useAppDispatch();

  // Initialize theme from localStorage with a separate key for EvPresenter
  useEffect(() => {
    const storedPreference = localStorage.getItem("evPresenterDarkMode");
    if (storedPreference) {
      setIsDarkMode(storedPreference === "true");
    } else {
      // Default to dark mode for EvPresenter
      setIsDarkMode(true);
      localStorage.setItem("evPresenterDarkMode", "true");
    }
  }, []);

  // Ensure theme is applied on mount (for cases where component is already rendered)
  useEffect(() => {
    const evPresenterContainer = document.querySelector(
      "[data-evpresenter-theme]"
    );
    if (evPresenterContainer) {
      if (isDarkMode) {
        evPresenterContainer.classList.add("dark");
      } else {
        evPresenterContainer.classList.remove("dark");
      }
    }
  }, []); // Run only once on mount

  // Apply dark mode class to a specific container for EvPresenter instead of document
  useEffect(() => {
    const applyTheme = () => {
      const evPresenterContainer = document.querySelector(
        "[data-evpresenter-theme]"
      );
      console.log(
        "EvPresenterTheme: Applying theme - container found:",
        !!evPresenterContainer,
        "isDarkMode:",
        isDarkMode
      );
      if (evPresenterContainer) {
        if (isDarkMode) {
          evPresenterContainer.classList.add("dark");
        } else {
          evPresenterContainer.classList.remove("dark");
        }
        return true; // Successfully applied
      }
      return false; // Container not found
    };

    // Try to apply theme immediately
    if (!applyTheme()) {
      // If container doesn't exist yet, wait a bit and try again
      const retryTimer = setTimeout(() => {
        if (!applyTheme()) {
          // If still no container, set up a MutationObserver to watch for it
          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  if (
                    element.matches?.("[data-evpresenter-theme]") ||
                    element.querySelector?.("[data-evpresenter-theme]")
                  ) {
                    if (applyTheme()) {
                      observer.disconnect();
                      return;
                    }
                  }
                }
              }
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          // Clean up observer after 5 seconds
          setTimeout(() => observer.disconnect(), 5000);
        }
      }, 100);

      return () => clearTimeout(retryTimer);
    }

    // Store user preference with a separate key
    localStorage.setItem("evPresenterDarkMode", String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    localStorage.setItem("evPresenterDarkMode", (!isDarkMode).toString());
  };

  const toggleActiveFeature = (feature: string | null) => {
    dispatch(setActiveFeature(feature));
  };

  return (
    <EvPresenterThemeContext.Provider
      value={{ isDarkMode, toggleDarkMode, toggleActiveFeature }}
    >
      {children}
    </EvPresenterThemeContext.Provider>
  );
};

export const useEvPresenterTheme = () => {
  const context = useContext(EvPresenterThemeContext);
  if (context === undefined) {
    throw new Error(
      "useEvPresenterTheme must be used within a EvPresenterThemeProvider"
    );
  }
  return context;
};
