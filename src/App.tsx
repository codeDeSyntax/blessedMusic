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
import PresentationMasterPage from "./EvPresenter/MasterPresentApp";
import { useAppSelector, useAppDispatch } from "./store";
import { setCurrentScreen } from "./store/slices/appSlice";

const App = () => {
  const currentScreen = useAppSelector((state) => state.app.currentScreen);
  const dispatch = useAppDispatch();

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
  return (
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
      ) : (
        <ArrowLeftCircle
          className="size-6 text-white"
          onClick={() => dispatch(setCurrentScreen("Home"))}
        />
      )}
      {/* <SongPresentation/> */}
    </div>
  );
};

export default App;
