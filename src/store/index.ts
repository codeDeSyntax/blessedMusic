import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import appSlice, { AppState } from "./slices/appSlice";
import presenterSlice from "./slices/presenterSlice";
import bibleSlice from "./slices/bibleSlice";

/**
 * Redux store configuration for EvPresenter app.
 */

export const store = configureStore({
  reducer: {
    presenter: presenterSlice,
    app: appSlice,
    bible: bibleSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types to speed up dev performance
        ignoredActions: [
          "persist/PERSIST",
          "presenter/setCurrentPresentation",
          "presenter/updatePresentation",
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ["payload.presentations", "payload.content"],
        // Ignore these paths in the state
        ignoredPaths: [
          "presenter.presentations",
          "presenter.currentPresentation",
        ],
        // Reduce warning threshold to catch only very slow operations
        warnAfter: 128,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
