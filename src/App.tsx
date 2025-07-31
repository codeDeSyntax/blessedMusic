import React, { useState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react";
import WorkspaceSelector from "./EvPresenter/Welcome";
import PresentationMasterPage from "./EvPresenter/MasterPresentApp";
import { useAppSelector, useAppDispatch } from "./store";
import { setCurrentScreen } from "./store/slices/appSlice";
import { SecretLogsManager } from "./components/SecretLogsManager";
import TitleBar from "./shared/TitleBar";

const App = () => {
  const currentScreen = useAppSelector((state) => state.app.currentScreen);
  const dispatch = useAppDispatch();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  // Handle hash-based routing for special pages like EvPresenter presentation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    // Set initial route on mount (important for production)
    setCurrentRoute(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // No special routes needed for EvPresenter - it's a single-page app

  // set up key combinations to navigate between screens
  // ctrl + H ---- Home
  // ctrl + P ---- Presenter

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case "h":
            dispatch(setCurrentScreen("Home"));
            break;
          case "p":
            dispatch(setCurrentScreen("mpresenter"));
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  // No additional routing needed for EvPresenter

  return (
    <SecretLogsManager>
      <div
        className={`h-screen w-screen bg-[#0f0f0f] overflow-hidden`}
        style={{ fontFamily: "Palatino" }}
      >
        {/* Fixed Title Bar for main screens (Home and mpresenter) */}
        {(currentScreen === "Home" || currentScreen === "mpresenter") && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center ">
            <TitleBar />
          </div>
        )}

        {/* Main content area with proper padding for fixed title bar */}
        <div
          className={`h-full ${
            currentScreen === "Home" || currentScreen === "mpresenter"
              ? "pt-6"
              : ""
          }`}
        >
          {currentScreen === "Home" ? (
            <WorkspaceSelector />
          ) : currentScreen === "mpresenter" ? (
            <PresentationMasterPage />
          ) : (
            <ArrowLeftCircle
              className="size-6 text-white"
              onClick={() => dispatch(setCurrentScreen("Home"))}
            />
          )}
        </div>
      </div>
    </SecretLogsManager>
  );
};

export default App;
