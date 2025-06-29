import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appSlice, { AppState } from './slices/appSlice';
import presenterSlice from './slices/presenterSlice';
import bibleSlice, { loadBibleState } from './slices/bibleSlice';
import songSlice from './slices/songSlice';

/**
 * Redux store configuration optimized for large song collections.
 * Serialization checks are configured to ignore song-related actions and state paths
 * to prevent performance warnings in development mode.
 */

export const store = configureStore({
  reducer: {
    songs: songSlice,
    bible: bibleSlice,
    presenter: presenterSlice,
    app: appSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types to speed up dev performance
        ignoredActions: [
          'persist/PERSIST',
          'songs/setSongs',
          'songs/setSelectedSong',
          'songs/toggleFavorite',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.songs', 'payload.content'],
        // Ignore these paths in the state
        ignoredPaths: ['songs.songs', 'songs.filteredSongs', 'songs.favorites'],
        // Reduce warning threshold to catch only very slow operations
        warnAfter: 128,
      },
    }),
});

// Load persisted state
store.dispatch(loadBibleState());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 