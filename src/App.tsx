import React, { useState, useEffect } from "react";
import { ArrowLeftCircle } from "lucide-react";
import BlessedMusic from "./vmusic/BlessedMusic";
import EditSong from "./vmusic/EditForm";
import WorkspaceSelector from "./vmusic/Welcome";
import CreateSong from "./vmusic/Form";
import SongPresentation from "./vmusic/PresentationMode";
import InstrumentShowroom from "./vmusic/InstrumentShowRoom";
import SongCollectionManager from "./vmusic/Categorize";
import UserGuidePage from "./vmusic/Userguide";
import PresentationBackgroundSelector from "./vmusic/BackgroundChoose";
import Biblelayout from "./Bible/Bible";
import BiblePresentationDisplay from "./Bible/components/BiblePresentationDisplay";
import SongPresentationDisplay from "./vmusic/components/SongPresentationDisplay";
import PresentationMasterPage from "./EvPresenter/MasterPresentApp";
import Recents from "./vmusic/Recents";
import { useAppSelector, useAppDispatch } from "./store";
import { setCurrentScreen } from "./store/slices/appSlice";
import { SecretLogsManager } from "./components/SecretLogsManager";

const App = () => {
  const currentScreen = useAppSelector((state) => state.app.currentScreen);
  const dispatch = useAppDispatch();
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);

  // Handle hash-based routing for special pages like Bible presentation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    // Set initial route on mount (important for production)
    setCurrentRoute(window.location.hash);

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Handle special routes - support both hash formats
  if (
    currentRoute === "#/bible-presentation-display" ||
    currentRoute === "#bible-presentation-display"
  ) {
    return <BiblePresentationDisplay />;
  }

  if (
    currentRoute === "#/song-presentation-display" ||
    currentRoute === "#song-presentation-display"
  ) {
    return <SongPresentationDisplay />;
  }

  // set up key combinations to navigate between screens
  // ctrl + H ---- Home
  // ctrl + B ---- Bible
  // ctrl + P ---- Presenter
  // ctrl + S ---- Songs

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case "h":
            dispatch(setCurrentScreen("Home"));
            break;
          case "b":
            dispatch(setCurrentScreen("bible"));
            break;
          case "p":
            dispatch(setCurrentScreen("mpresenter"));
            break;
          case "s":
            dispatch(setCurrentScreen("Songs"));
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

  // Additional safety check - parse URL parameters if hash routing fails
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const routeParam = urlParams.get("route");

    if (routeParam === "bible-presentation") {
      console.log("Detected route via URL parameter: bible-presentation");
      setCurrentRoute("#bible-presentation-display");
    } else if (routeParam === "song-presentation") {
      console.log("Detected route via URL parameter: song-presentation");
      setCurrentRoute("#song-presentation-display");
    }
  }, []);

  return (
    <SecretLogsManager>
      <div
        className={`flex flex-col h-screen w-screen thin-scrollbar no-scrollbar bg-white dark:bg-ltgray `}
        style={{ fontFamily: "Palatino" }}
      >
        {/* <BlessedMusic /> */}
        {currentScreen === "Home" ? (
          <WorkspaceSelector />
        ) : currentScreen === "create" ? (
          <CreateSong />
        ) : currentScreen === "Songs" ? (
          <BlessedMusic />
        ) : currentScreen === "edit" ? (
          <EditSong />
        ) : currentScreen === "Presentation" ? (
          <SongPresentation />
        ) : currentScreen === "instRoom" ? (
          <InstrumentShowroom />
        ) : currentScreen === "categorize" ? (
          <SongCollectionManager />
        ) : currentScreen === "userguide" ? (
          <UserGuidePage />
        ) : currentScreen === "backgrounds" ? (
          <PresentationBackgroundSelector />
        ) : currentScreen === "bible" ? (
          <Biblelayout />
        ) : currentScreen === "mpresenter" ? (
          <PresentationMasterPage />
        ) : currentScreen === "recents" ? (
          <Recents />
        ) : (
          <ArrowLeftCircle
            className="size-6 text-white"
            onClick={() => dispatch(setCurrentScreen("Home"))}
          />
        )}
        {/* <SongPresentation/> */}
      </div>
    </SecretLogsManager>
  );
};

export default App;
