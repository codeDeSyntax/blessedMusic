import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  nativeImage,
  screen,
  protocol,
} from "electron";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";
import { Presentation, EvSermon } from "@/types";

// Import secret logger
import {
  secretLogger,
  logSystemInfo,
  logSystemError,
  logSongAction,
  logSongProjection,
  logSongFileOp,
  logSongError,
} from "../../src/utils/SecretLogger";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWin: BrowserWindow | null = null;
let projectionWin: BrowserWindow | null = null;
let biblePresentationWin: BrowserWindow | null = null;
let songPresentationWin: BrowserWindow | null = null;
let isProjectionMinimized = false;
let isSongPresentationMinimized = false;
let isBiblePresentationMinimized = false;
let isProjectionActive = false; // Track projection state separately
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const projectionHtml = path.join(RENDERER_DIST, "projection.html");

async function createMainWindow() {
  mainWin = new BrowserWindow({
    title: "Main window",
    frame: false,
    minWidth: 1000,
    minHeight: 800,
    icon: path.join(process.env.VITE_PUBLIC, "evv.png"),
    webPreferences: {
      preload,
      // devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 1.0,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWin.loadURL(VITE_DEV_SERVER_URL);
    mainWin.maximize();
    mainWin.setMenuBarVisibility(false);
    mainWin.webContents.openDevTools();
    mainWin.webContents.setZoomFactor(1.0);
  } else {
    mainWin.maximize();
    mainWin.setMenuBarVisibility(false);
    // mainWin.webContents.openDevTools();
    mainWin.loadFile(indexHtml);
  }

  mainWin.webContents.on("before-input-event", (event, input) => {
    if (
      input.key === "F12" || // Disable F12 for dev tools
      (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
      (input.key === "R" && input.control) || // Disable Ctrl+R for reload
      (input.key === "R" && input.meta) // Disable Cmd+R for reload on macOS
    ) {
      event.preventDefault();
    }
  });

  ipcMain.on("minimizeApp", () => {
    mainWin?.minimize();
  });
  ipcMain.on("maximizeApp", () => {
    if (mainWin?.isMaximized()) {
      mainWin?.unmaximize();
    } else {
      mainWin?.maximize();
    }
  });
  ipcMain.on("closeApp", () => {
    mainWin?.close();
  });

  // Handle main window close event to cleanup all child windows
  mainWin.on("closed", () => {
    logSystemInfo("Main application window closed", {
      songPresentationActive: !!(
        songPresentationWin && !songPresentationWin.isDestroyed()
      ),
      biblePresentationActive: !!(
        biblePresentationWin && !biblePresentationWin.isDestroyed()
      ),
      projectionWinActive: !!(projectionWin && !projectionWin.isDestroyed()),
    });

    // Close all projection windows when main window closes
    if (songPresentationWin && !songPresentationWin.isDestroyed()) {
      songPresentationWin.close();
      songPresentationWin = null;
    }
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      biblePresentationWin.close();
      biblePresentationWin = null;
    }
    if (projectionWin && !projectionWin.isDestroyed()) {
      projectionWin.close();
      projectionWin = null;
    }

    // Reset projection states
    isProjectionActive = false;
    isSongPresentationMinimized = false;
    isBiblePresentationMinimized = false;
    isProjectionMinimized = false;

    // Clear main window reference
    mainWin = null;
  });

  return mainWin;
}

// Handle the escape key minimize functionality from the renderer
ipcMain.on("minimizeProjection", () => {
  // UPDATED: Now handles both static projection (disabled) and React-based song presentation
  if (songPresentationWin && !songPresentationWin.isDestroyed()) {
    songPresentationWin.minimize();

    // Focus the main window after minimizing the projection window
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.focus();
    }
  }
});

// Handle Bible presentation updates from control room
ipcMain.on("bible-presentation-update", (event, data) => {
  console.log("Main process: Received bible-presentation-update", data);
  try {
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      console.log("Main process: Forwarding to presentation window", data);
      biblePresentationWin.webContents.send("bible-presentation-update", data);
    } else {
      console.log("Main process: Bible presentation window not available");
    }
  } catch (error) {
    console.error("Error forwarding Bible presentation update:", error);
  }
});

async function createBiblePresentationWindow() {
  const displays = screen.getAllDisplays();
  console.log(
    "🖥️ Bible Presentation - All displays detected:",
    displays.length
  );
  displays.forEach((display, index) => {
    console.log(`🖥️ Display ${index}:`, {
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      rotation: display.rotation,
      internal: display.internal,
    });
  });

  let presentationDisplay = displays[0]; // Default to primary display
  let isExternalDisplay = false;

  // Find external display (projector) if available
  if (displays.length > 1) {
    // Improved external display detection
    const externalDisplay = displays.find(
      (display) =>
        !display.internal || display.bounds.x !== 0 || display.bounds.y !== 0
    );
    if (externalDisplay) {
      presentationDisplay = externalDisplay;
      isExternalDisplay = true;
      console.log("🎯 Bible Presentation - Using external display:", {
        id: externalDisplay.id,
        bounds: externalDisplay.bounds,
        internal: externalDisplay.internal,
      });
    } else {
      console.log(
        "⚠️ Bible Presentation - No external display found, using primary"
      );
    }
  } else {
    console.log(
      "⚠️ Bible Presentation - Only one display detected, using primary"
    );
  }

  // Create Bible presentation window
  biblePresentationWin = new BrowserWindow({
    title: "Bible Presentation",
    x: isExternalDisplay ? presentationDisplay.bounds.x : undefined,
    y: isExternalDisplay ? presentationDisplay.bounds.y : undefined,
    width: isExternalDisplay ? presentationDisplay.bounds.width : 1024,
    height: isExternalDisplay ? presentationDisplay.bounds.height : 768,
    frame: false,
    show: true,
    fullscreen: !isExternalDisplay, // Use fullscreen for primary display
    alwaysOnTop: false,
    skipTaskbar: true,
    icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("🪟 Bible Presentation Window created with:", {
    x: biblePresentationWin.getBounds().x,
    y: biblePresentationWin.getBounds().y,
    width: biblePresentationWin.getBounds().width,
    height: biblePresentationWin.getBounds().height,
    isExternalDisplay,
    targetDisplay: presentationDisplay.bounds,
  });

  // For external displays, manually set bounds after creation to ensure proper coverage
  if (isExternalDisplay) {
    console.log("🔧 Setting manual bounds for external display...");
    biblePresentationWin.setBounds({
      x: presentationDisplay.bounds.x,
      y: presentationDisplay.bounds.y,
      width: presentationDisplay.bounds.width,
      height: presentationDisplay.bounds.height,
    });
    console.log("✅ Manual bounds set:", biblePresentationWin.getBounds());
  } else {
    console.log("📱 Using primary display - no manual bounds needed");
  }

  // Load the presentation display page
  if (VITE_DEV_SERVER_URL) {
    biblePresentationWin.loadURL(
      `${VITE_DEV_SERVER_URL}/#/bible-presentation-display`
    );
    // biblePresentationWin.webContents.openDevTools(); // Open dev tools for debugging
  } else {
    biblePresentationWin.loadFile(indexHtml, {
      hash: "bible-presentation-display",
    });
  }

  biblePresentationWin.on("closed", () => {
    biblePresentationWin = null;
    isBiblePresentationMinimized = false;
    isProjectionActive = false; // Set projection as inactive when window is closed
    // Notify main window that projection is no longer active
    console.log("Sending Bible projection state change: false (closed)");
    mainWin?.webContents.send("projection-state-changed", false);
  });

  // Track minimization state - but don't affect projection active state for external displays
  biblePresentationWin.on("minimize", () => {
    isBiblePresentationMinimized = true;
    // Only consider projection inactive if user explicitly minimized (not auto-minimize to external display)
    // We'll keep projection active even when minimized to external display
    console.log(
      "Bible window minimized - keeping projection active for external display"
    );
  });

  biblePresentationWin.on("restore", () => {
    isBiblePresentationMinimized = false;
    // Ensure projection is marked as active when restored
    if (isProjectionActive) {
      console.log("Sending Bible projection state change: true (restored)");
      mainWin?.webContents.send("projection-state-changed", true);
    }
  });

  return biblePresentationWin;
}

async function createSongPresentationWindow() {
  const displays = screen.getAllDisplays();
  console.log("🖥️ Song Presentation - All displays detected:", displays.length);

  // Log detailed display information
  logSystemInfo("Display detection completed", {
    displayCount: displays.length,
    displays: displays.map((display, index) => ({
      index,
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      rotation: display.rotation,
      internal: display.internal,
    })),
  });

  displays.forEach((display, index) => {
    console.log(`🖥️ Display ${index}:`, {
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
      rotation: display.rotation,
      internal: display.internal,
    });
  });

  let presentationDisplay = displays[0]; // Default to primary display
  let isExternalDisplay = false;

  // Find external display (projector) if available
  if (displays.length > 1) {
    // Improved external display detection
    const externalDisplay = displays.find(
      (display) =>
        !display.internal || display.bounds.x !== 0 || display.bounds.y !== 0
    );
    if (externalDisplay) {
      presentationDisplay = externalDisplay;
      isExternalDisplay = true;
      console.log("🎯 Song Presentation - Using external display:", {
        id: externalDisplay.id,
        bounds: externalDisplay.bounds,
        internal: externalDisplay.internal,
      });
    } else {
      console.log(
        "⚠️ Song Presentation - No external display found, using primary"
      );
    }
  } else {
    console.log(
      "⚠️ Song Presentation - Only one display detected, using primary"
    );
  }

  // Create Song presentation window
  songPresentationWin = new BrowserWindow({
    title: "Song Presentation",
    x: isExternalDisplay ? presentationDisplay.bounds.x : undefined,
    y: isExternalDisplay ? presentationDisplay.bounds.y : undefined,
    width: isExternalDisplay ? presentationDisplay.bounds.width : 1024,
    height: isExternalDisplay ? presentationDisplay.bounds.height : 768,
    frame: false,
    show: true,
    fullscreen: !isExternalDisplay, // Use fullscreen for primary display
    alwaysOnTop: false,
    skipTaskbar: true,
    icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("🪟 Song Presentation Window created with:", {
    x: songPresentationWin.getBounds().x,
    y: songPresentationWin.getBounds().y,
    width: songPresentationWin.getBounds().width,
    height: songPresentationWin.getBounds().height,
    isExternalDisplay,
    targetDisplay: presentationDisplay.bounds,
  });

  // Log detailed window creation info
  logSongProjection("Projection window created", {
    windowBounds: songPresentationWin.getBounds(),
    isExternalDisplay,
    targetDisplay: {
      id: presentationDisplay.id,
      bounds: presentationDisplay.bounds,
      internal: presentationDisplay.internal,
    },
    displayCount: screen.getAllDisplays().length,
  });

  // For external displays, manually set bounds after creation to ensure proper coverage
  if (isExternalDisplay) {
    console.log("🔧 Setting manual bounds for external display...");
    songPresentationWin.setBounds({
      x: presentationDisplay.bounds.x,
      y: presentationDisplay.bounds.y,
      width: presentationDisplay.bounds.width,
      height: presentationDisplay.bounds.height,
    });
    const finalBounds = songPresentationWin.getBounds();
    console.log("✅ Manual bounds set:", finalBounds);

    logSongProjection("External display bounds configured", {
      originalBounds: presentationDisplay.bounds,
      finalBounds,
      displayId: presentationDisplay.id,
    });
  } else {
    console.log("📱 Using primary display - no manual bounds needed");
    logSongProjection("Using primary display for projection", {
      bounds: songPresentationWin.getBounds(),
    });
  }

  // Load the React-based song presentation display page
  if (VITE_DEV_SERVER_URL) {
    songPresentationWin.loadURL(
      `${VITE_DEV_SERVER_URL}/#/song-presentation-display`
    );
  } else {
    songPresentationWin.loadFile(indexHtml, {
      hash: "song-presentation-display",
    });
  }

  songPresentationWin.on("closed", () => {
    songPresentationWin = null;
    isSongPresentationMinimized = false;
    isProjectionActive = false; // Set projection as inactive when window is closed
    // Notify main window that projection is no longer active
    console.log("Sending projection state change: false (closed)");
    mainWin?.webContents.send("projection-state-changed", false);
  });

  // Track minimization state - but don't affect projection active state for external displays
  songPresentationWin.on("minimize", () => {
    isSongPresentationMinimized = true;
    // Only consider projection inactive if user explicitly minimized (not auto-minimize to external display)
    // We'll keep projection active even when minimized to external display
    console.log(
      "Window minimized - keeping projection active for external display"
    );
  });

  songPresentationWin.on("restore", () => {
    isSongPresentationMinimized = false;
    // Ensure projection is marked as active when restored
    if (isProjectionActive) {
      console.log("Sending projection state change: true (restored)");
      mainWin?.webContents.send("projection-state-changed", true);
    }
  });

  return songPresentationWin;
}

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  // Log system startup
  logSystemInfo("Application started successfully", {
    version: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    node: process.version,
  });
});

// Handle app quit - ensure all child windows are closed before quitting
app.on("before-quit", (event) => {
  console.log("App is quitting - cleaning up all windows...");

  // Close all projection windows
  if (songPresentationWin && !songPresentationWin.isDestroyed()) {
    songPresentationWin.close();
    songPresentationWin = null;
  }
  if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
    biblePresentationWin.close();
    biblePresentationWin = null;
  }
  if (projectionWin && !projectionWin.isDestroyed()) {
    projectionWin.close();
    projectionWin = null;
  }

  // Reset all projection states
  isProjectionActive = false;
  isSongPresentationMinimized = false;
  isBiblePresentationMinimized = false;
  isProjectionMinimized = false;
});

// Ensure app quits when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Final cleanup before app terminates
app.on("will-quit", () => {
  console.log("App will quit - final cleanup...");

  // Force close any remaining windows
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.destroy();
    }
  });

  // Reset all variables
  mainWin = null;
  songPresentationWin = null;
  biblePresentationWin = null;
  projectionWin = null;
});

ipcMain.handle("project-song", async (event, songData) => {
  console.log("Using React-based song projection:", songData);

  // Log projection attempt
  logSongProjection("Song projection initiated", {
    title: songData.title || "Unknown",
    hasBackground: !!songData.backgroundImage,
    fontSize: songData.fontSize,
    contentLength: songData.content ? songData.content.length : 0,
  });

  // Set projection as active
  isProjectionActive = true;

  // Check if window exists but is minimized
  if (
    songPresentationWin &&
    !songPresentationWin.isDestroyed() &&
    isSongPresentationMinimized
  ) {
    songPresentationWin.restore();
    isSongPresentationMinimized = false;
    setTimeout(() => {
      songPresentationWin?.webContents.send("display-song", songData);
      songPresentationWin?.focus();
      songPresentationWin?.moveTop();
    }, 300); // Short delay to ensure window is restored before sending data
    // Notify main window about projection state change
    console.log("Sending projection state change: true (restored)");
    mainWin?.webContents.send("projection-state-changed", true);
    return;
  }

  // If window doesn't exist or was destroyed, create a new one
  if (!songPresentationWin || songPresentationWin.isDestroyed()) {
    await createSongPresentationWindow();
    // Wait for window to be ready before sending data
    songPresentationWin?.once("ready-to-show", () => {
      songPresentationWin?.webContents.send("display-song", songData);
      // Ensure window is properly focused and visible
      songPresentationWin?.show();
      songPresentationWin?.focus();
      songPresentationWin?.moveTop();
      // Notify main window about projection state change
      console.log("Sending projection state change: true (new window)");
      mainWin?.webContents.send("projection-state-changed", true);
    });
  } else {
    // Window exists and is not minimized, just send the data and ensure it's visible
    songPresentationWin.webContents.send("display-song", songData);
    songPresentationWin.show();
    songPresentationWin.focus();
    songPresentationWin.moveTop();
    // Notify main window about projection state change
    console.log("Sending projection state change: true (existing window)");
    mainWin?.webContents.send("projection-state-changed", true);
  }
});

// Add handler to check if projection window is open
ipcMain.handle("is-projection-active", async () => {
  const isSongActive =
    isProjectionActive &&
    songPresentationWin &&
    !songPresentationWin.isDestroyed();

  const isBibleActive =
    isProjectionActive &&
    biblePresentationWin &&
    !biblePresentationWin.isDestroyed();

  const isActive = isSongActive || isBibleActive;
  console.log("Checking projection state:", {
    isActive,
    isSongActive,
    isBibleActive,
  });

  // Log projection state check
  logSystemInfo("Projection state checked", {
    isActive,
    isSongActive,
    isBibleActive,
    songWindowExists: !!(
      songPresentationWin && !songPresentationWin.isDestroyed()
    ),
    bibleWindowExists: !!(
      biblePresentationWin && !biblePresentationWin.isDestroyed()
    ),
  });

  return isActive;
});

// Add handler to close projection window
ipcMain.handle("close-projection-window", async () => {
  let closed = false;

  // Close song presentation window if it exists
  if (songPresentationWin && !songPresentationWin.isDestroyed()) {
    isProjectionActive = false; // Set projection as inactive before closing
    songPresentationWin.close();
    closed = true;
  }

  // Close Bible presentation window if it exists
  if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
    isProjectionActive = false; // Set projection as inactive before closing
    biblePresentationWin.close();
    closed = true;
  }

  return closed;
});

// Handle selecting a directory via the file dialog
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

// Handle saving a song as a text file
ipcMain.handle("save-song", async (event, { directory, title, content }) => {
  try {
    // Validate inputs
    if (!directory || !title || content === undefined) {
      const errorMsg =
        "Missing required fields: directory, title, and content are required.";
      logSongError("Song save validation failed", {
        directory,
        title,
        hasContent: content !== undefined,
      });
      throw new Error(errorMsg);
    }

    // Validate title format
    if (title.trim().length === 0) {
      const errorMsg = "Song title cannot be empty.";
      logSongError("Empty song title provided", { title });
      throw new Error(errorMsg);
    }

    // Check if directory exists
    if (!fs.existsSync(directory)) {
      const errorMsg =
        "The specified directory does not exist. Please select a valid folder.";
      logSongError("Invalid directory path", { directory });
      throw new Error(errorMsg);
    }

    // Check directory permissions
    try {
      fs.accessSync(directory, fs.constants.W_OK);
    } catch (permissionError) {
      const errorMsg =
        "Permission denied. You don't have write access to the selected directory.";
      logSongError("Directory permission denied", {
        directory,
        error: permissionError,
      });
      throw new Error(errorMsg);
    }

    const filePath = path.join(directory, `${title.trim()}.txt`);
    const fileExists = fs.existsSync(filePath);

    // Write the file (create new or overwrite existing)
    fs.writeFileSync(filePath, content, "utf8");

    const result = {
      success: true,
      filePath,
      isNewFile: !fileExists,
      message: fileExists
        ? `Song "${title}" has been successfully updated.`
        : `Song "${title}" has been successfully created.`,
    };

    // Log successful operation
    logSongFileOp(
      fileExists
        ? "Song updated successfully"
        : "New song created successfully",
      {
        title,
        filePath,
        contentLength: content.length,
        directory,
      }
    );

    return result;
  } catch (error) {
    console.error("Error saving song:", error);
    logSongError("Failed to save song", {
      error: error instanceof Error ? error.message : String(error),
      title: title || "unknown",
      directory: directory || "unknown",
    });

    // Handle specific error types
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as any).code === "string"
    ) {
      const code = (error as any).code;
      if (code === "ENOENT") {
        throw new Error(
          "The file path is invalid or the directory no longer exists."
        );
      } else if (code === "EACCES" || code === "EPERM") {
        throw new Error(
          "Permission denied. Cannot write to the selected location."
        );
      } else if (code === "ENOSPC") {
        throw new Error("Not enough disk space to save the file.");
      } else if (code === "EMFILE" || code === "ENFILE") {
        throw new Error(
          "Too many files are open. Please close some applications and try again."
        );
      }
    }
    // Re-throw custom validation errors or unknown errors
    throw error;
  }
});

// Handle fetching songs from a directory
ipcMain.handle("fetch-songs", async (event, directory) => {
  try {
    const files = fs.readdirSync(directory);
    const songs = await Promise.all(
      files
        .filter((file) => file.endsWith(".txt"))
        .map(async (file, index) => {
          const filePath = path.join(directory, file);
          const fileStats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, "utf8");

          return {
            id: `bmusic${index + 1}`,
            title: path.basename(file, ".txt"),
            path: filePath,
            content,
            dateModified: fileStats.mtime.toISOString(),
          };
        })
    );

    // Log successful fetch
    logSongAction("Songs loaded from directory", {
      directory,
      songCount: songs.length,
      fileCount: files.length,
    });

    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
    logSongError("Failed to fetch songs from directory", {
      directory,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("Failed to fetch songs.");
  }
});

// Handle editing an existing song or renaming it
ipcMain.handle(
  "edit-song",
  async (event, { directory, newTitle, content, originalPath }) => {
    try {
      const fileExists = fs.existsSync(originalPath);

      if (fileExists) {
        fs.writeFileSync(originalPath, content, "utf8");
      } else {
        fs.writeFileSync(originalPath, content, "utf8");
      }

      const newFilePath = path.join(directory, `${newTitle}.txt`);
      if (newTitle && newFilePath !== originalPath) {
        if (fileExists && fs.existsSync(originalPath)) {
          fs.renameSync(originalPath, newFilePath);
        }
      }

      return newFilePath;
    } catch (error) {
      console.error("Error editing song:", error);
      throw error;
    }
  }
);

// Handle deleting a song
ipcMain.handle("delete-song", async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      fs.unlinkSync(filePath);

      logSongFileOp("Song deleted successfully", {
        fileName,
        filePath,
      });

      return true;
    } else {
      logSongError("Attempted to delete non-existent song", { filePath });
      throw new Error("File not found");
    }
  } catch (error) {
    console.error("Error deleting song:", error);
    logSongError("Failed to delete song", {
      filePath,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
});

async function loadImagesFromDirectory(dirPath: string) {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

  try {
    const files = await new Promise<string[]>((resolve, reject) => {
      fs.readdir(dirPath, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });

    const imageFiles = files
      .filter((file) =>
        allowedExtensions.includes(path.extname(file).toLowerCase())
      )
      .slice(0, 10); // Increase limit to 7 images for better selection

    // Return custom protocol URLs instead of file:// URLs for security
    const imagePaths = imageFiles.map((file) => {
      const fullPath = path.join(dirPath, file);
      // Use our custom protocol to serve local images
      const customUrl = `local-image://${encodeURIComponent(fullPath)}`;
      return customUrl;
    });

    console.log(
      "📁 loadImagesFromDirectory: Returning custom protocol URLs:",
      imagePaths.slice(0, 3),
      "..."
    );

    // Log detailed image loading info
    logSystemInfo("Background images loaded from directory", {
      directory: dirPath,
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      allowedExtensions,
      sampleImages: imagePaths
        .slice(0, 3)
        .map((url) => decodeURIComponent(url.replace("local-image://", ""))),
    });

    return imagePaths;
  } catch (error) {
    console.error("Error loading images:", error);
    logSystemError("Failed to load background images", {
      directory: dirPath,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

ipcMain.handle("get-images", async (event, dirPath) => {
  return loadImagesFromDirectory(dirPath); // Return the list of file:// URLs
});

// Bible Presentation Window handlers
ipcMain.handle("create-bible-presentation-window", async (event, data) => {
  try {
    console.log("Creating Bible presentation window:", data);

    // Set projection as active
    isProjectionActive = true;

    // Check if window exists but is minimized
    if (
      biblePresentationWin &&
      !biblePresentationWin.isDestroyed() &&
      isBiblePresentationMinimized
    ) {
      biblePresentationWin.restore();
      isBiblePresentationMinimized = false;
      setTimeout(() => {
        if (data.presentationData) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-data",
            data: data.presentationData,
          });
        }
        if (data.settings) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-settings",
            data: data.settings,
          });
        }
        biblePresentationWin?.focus();
        biblePresentationWin?.moveTop();
      }, 300); // Short delay to ensure window is restored before sending data
      // Notify main window about projection state change
      console.log("Sending Bible projection state change: true (restored)");
      mainWin?.webContents.send("projection-state-changed", true);
      return;
    }

    // If window doesn't exist or was destroyed, create a new one
    if (!biblePresentationWin || biblePresentationWin.isDestroyed()) {
      await createBiblePresentationWindow();

      // Wait for window to be ready before sending initial data
      biblePresentationWin?.once("ready-to-show", () => {
        if (data.presentationData) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-data",
            data: data.presentationData,
          });
        }
        if (data.settings) {
          biblePresentationWin?.webContents.send("bible-presentation-update", {
            type: "update-settings",
            data: data.settings,
          });
        }
        // Ensure window is properly focused and visible
        biblePresentationWin?.show();
        biblePresentationWin?.focus();
        biblePresentationWin?.moveTop();
        // Notify main window about projection state change
        console.log("Sending Bible projection state change: true (new window)");
        mainWin?.webContents.send("projection-state-changed", true);
      });
    } else {
      // Window exists, just focus it and update data
      if (data.presentationData) {
        biblePresentationWin.webContents.send("bible-presentation-update", {
          type: "update-data",
          data: data.presentationData,
        });
      }
      if (data.settings) {
        biblePresentationWin.webContents.send("bible-presentation-update", {
          type: "update-settings",
          data: data.settings,
        });
      }
      biblePresentationWin.focus();
      // Notify main window about projection state change
      console.log(
        "Sending Bible projection state change: true (existing window)"
      );
      mainWin?.webContents.send("projection-state-changed", true);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating Bible presentation window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

ipcMain.handle("send-to-bible-presentation", async (event, { type, data }) => {
  try {
    if (biblePresentationWin && !biblePresentationWin.isDestroyed()) {
      biblePresentationWin.webContents.send("bible-presentation-update", {
        type,
        data,
      });
      return { success: true };
    }
    return { success: false, error: "Presentation window not found" };
  } catch (error) {
    console.error("Error sending to Bible presentation window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Handler to focus the main window from presentation
ipcMain.handle("focus-main-window", async () => {
  try {
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.focus();
      mainWin.show();
      return { success: true };
    }
    return { success: false, error: "Main window not found" };
  } catch (error) {
    console.error("Error focusing main window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Handler to get display information for debugging
ipcMain.handle("get-display-info", async () => {
  try {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    const displayInfo = {
      totalDisplays: displays.length,
      primaryDisplay: {
        id: primaryDisplay.id,
        bounds: primaryDisplay.bounds,
        workArea: primaryDisplay.workArea,
        scaleFactor: primaryDisplay.scaleFactor,
        internal: primaryDisplay.internal,
      },
      allDisplays: displays.map((display) => ({
        id: display.id,
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor,
        rotation: display.rotation,
        internal: display.internal,
        isPrimary: display.id === primaryDisplay.id,
      })),
    };

    console.log("📊 Display Info Request:", displayInfo);
    logSystemInfo("Display information requested", displayInfo);
    return { success: true, data: displayInfo };
  } catch (error) {
    console.error("Error getting display info:", error);
    logSystemError("Failed to get display information", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Secret Logging System Handlers
ipcMain.handle(
  "log-to-secret-logger",
  async (_, { application, category, message, details }) => {
    try {
      secretLogger.log(application, category, message, details);
      return { success: true };
    } catch (error) {
      console.error("Error logging to secret logger:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
);

ipcMain.handle("get-secret-logs", async () => {
  try {
    const logs = secretLogger.getLogs();
    logSystemInfo("Secret logs accessed by admin", { logCount: logs.length });
    return { success: true, logs };
  } catch (error) {
    console.error("Error getting secret logs:", error);
    logSystemError("Failed to retrieve secret logs", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

ipcMain.handle("clear-secret-logs", async () => {
  try {
    secretLogger.clearAllLogs();
    logSystemInfo("All secret logs cleared by admin");
    return { success: true };
  } catch (error) {
    console.error("Error clearing secret logs:", error);
    logSystemError("Failed to clear secret logs", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

ipcMain.handle("export-secret-logs", async () => {
  try {
    const logs = secretLogger.getLogs();
    const result = await dialog.showSaveDialog({
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "Text Files", extensions: ["txt"] },
      ],
      defaultPath: `blessed-music-logs-${
        new Date().toISOString().split("T")[0]
      }.json`,
    });

    if (!result.canceled && result.filePath) {
      const exportData = {
        exportDate: new Date().toISOString(),
        totalLogs: logs.length,
        logs: logs,
      };

      fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
      logSystemInfo("Secret logs exported by admin", {
        filePath: result.filePath,
        logCount: logs.length,
      });
      return { success: true, filePath: result.filePath };
    }

    return { success: false, error: "Export cancelled" };
  } catch (error) {
    console.error("Error exporting secret logs:", error);
    logSystemError("Failed to export secret logs", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Handler to construct file path properly
ipcMain.handle(
  "construct-file-path",
  async (_, basePath: string, fileName: string) => {
    try {
      const fullPath = path.join(basePath, fileName);
      return { success: true, path: fullPath };
    } catch (error) {
      console.error("Error constructing file path:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to construct path",
      };
    }
  }
);

// Handler to open file in default app (e.g., notepad for .txt files)
ipcMain.handle("open-file-in-default-app", async (_, filePath: string) => {
  try {
    // Normalize the path to handle different path separators
    const normalizedPath = path.normalize(filePath);
    console.log("Opening file:", normalizedPath);

    // Check if file exists before trying to open
    if (!fs.existsSync(normalizedPath)) {
      return {
        success: false,
        error: `File not found: ${normalizedPath}`,
      };
    }

    await shell.openPath(normalizedPath);
    return { success: true };
  } catch (error) {
    console.error("Error opening file:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to open file",
    };
  }
});

// Presentation master handlers
function sanitizeFilename(title: string): string {
  // Remove invalid filename characters and replace spaces with underscores
  return title
    .replace(/[/\\?%*:|"<>]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

// Helper function to create a unique filename based on title
function createUniqueFilename(title: string, id: string): string {
  const sanitized = sanitizeFilename(title);
  // Limit filename length and append ID to ensure uniqueness
  const truncated = sanitized.substring(0, 50);
  return `${truncated}_${id}.txt`;
}

ipcMain.handle("load-presentations", async (_, directoryPath: string) => {
  console.log(directoryPath);
  try {
    const presentations: Presentation[] = [];

    const files = fs.readdirSync(directoryPath);
    for (const file of files) {
      if (file.endsWith(".txt")) {
        const filePath = path.join(directoryPath, file);
        const content = fs.readFileSync(filePath, "utf8");

        // Extract ID from filename (last part after underscore and before .txt)
        const idMatch = file.match(/_([^_]+)\.txt$/);
        const id = idMatch ? idMatch[1] : file.replace(".txt", "");

        // Parse based on content type
        if (
          content.includes("#TYPE: sermon") ||
          content.includes("TYPE: sermon")
        ) {
          presentations.push(parseSermonFile(content, id));
        } else {
          console.warn(
            `Skipping unsupported presentation type in file: ${file}`
          );
        }
      }
    }

    return presentations;
  } catch (error) {
    console.error("Error loading presentations:", error);
    return [];
  }
});

ipcMain.handle(
  "create-presentation",
  async (
    _,
    directoryPath: string,
    presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const newPresentation = {
        ...presentation,
        id,
        createdAt: now,
        updatedAt: now,
      } as Presentation;

      let content: string;

      if (newPresentation.type === "sermon") {
        content = formatSermonToText(newPresentation as EvSermon);
      } else {
        throw new Error(
          `Unsupported presentation type: ${newPresentation.type}`
        );
      }

      // Create filename based on title and ID
      const filename = createUniqueFilename(newPresentation.title, id);
      fs.writeFileSync(path.join(directoryPath, filename), content);

      return newPresentation;
    } catch (error) {
      console.error("Error creating presentation:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "update-presentation",
  async (
    _,
    id: string,
    directoryPath: string,
    updates: Partial<Presentation>
  ) => {
    try {
      // Find the existing file by ID
      console.log("path for update", directoryPath);
      const files = fs.readdirSync(directoryPath);
      let existingFile = "";

      for (const file of files) {
        if (file.includes(id) && file.endsWith(".txt")) {
          existingFile = file;
          break;
        }
      }

      if (!existingFile) {
        // throw new Error(`Presentation with id ${id} not found`);
        console.log("Presentation with id ${id} not found");
        return null;
      }

      // Read the existing presentation
      const filePath = path.join(directoryPath, existingFile);
      console.log("filepath", filePath);
      const content = fs.readFileSync(filePath, "utf8");

      let existingPresentation: Presentation;

      if (
        content.includes("#TYPE: sermon") ||
        content.includes("TYPE: sermon")
      ) {
        existingPresentation = parseSermonFile(content, id);
      } else {
        throw new Error(
          `Unsupported presentation type in file: ${existingFile}`
        );
      }

      // Merge updates with existing presentation
      const updatedPresentation = {
        ...existingPresentation,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Create new content based on updated type
      let newContent: string;
      if (updatedPresentation.type === "sermon") {
        newContent = formatSermonToText(updatedPresentation as EvSermon);
      } else {
        throw new Error(
          `Unsupported presentation type: ${updatedPresentation.type}`
        );
      }

      // If title changed, create new filename
      if (updates.title && existingPresentation.title !== updates.title) {
        // Delete old file
        fs.unlinkSync(filePath);

        // Create new file with updated title-based filename
        const newFilename = createUniqueFilename(updatedPresentation.title, id);
        fs.writeFileSync(path.join(directoryPath, newFilename), newContent);
      } else {
        // Just update existing file
        fs.writeFileSync(filePath, newContent);
      }

      return updatedPresentation;
    } catch (error) {
      console.error("Error updating presentation:", error);
      throw error;
    }
  }
);

ipcMain.handle(
  "delete-presentation",
  async (_, id: string, directoryPath: string) => {
    try {
      // Find the file by ID
      const files = fs.readdirSync(directoryPath);
      let fileToDelete = "";

      for (const file of files) {
        if (file.includes(id) && file.endsWith(".txt")) {
          fileToDelete = file;
          break;
        }
      }

      if (!fileToDelete) {
        throw new Error(`Presentation with id ${id} not found`);
      }

      fs.unlinkSync(path.join(directoryPath, fileToDelete));
      return { success: true };
    } catch (error) {
      console.error("Error deleting presentation:", error);
      throw error;
    }
  }
);

// Helper functions for file formatting - Enhanced for better structured data
function formatSermonToText(sermon: Presentation): string {
  if (sermon.type !== "sermon") throw new Error("Not a sermon presentation");

  const EvSermon = sermon as EvSermon;

  // Format structured data with clear section separators for easy parsing
  return `#TYPE: sermon
#METADATA
ID: ${sermon.id}
TITLE: ${sermon.title}
PREACHER: ${EvSermon.preacher || ""}
DATE: ${EvSermon.date || ""}
CREATED_AT: ${sermon.createdAt}
UPDATED_AT: ${sermon.updatedAt}
BACKGROUND_IMAGE: ${EvSermon.backgroundImage || ""}

#SCRIPTURES
${
  EvSermon.scriptures
    ? EvSermon.scriptures
        .map((s, index) => `SCRIPTURE_${index + 1}: ${s.text || ""}`)
        .join("\n")
    : ""
}

#CONTENT
${EvSermon.mainMessage ? `MAIN_MESSAGE: ${EvSermon.mainMessage}` : ""}
${
  EvSermon.mainMessagePoints && EvSermon.mainMessagePoints.length > 0
    ? EvSermon.mainMessagePoints
        .map((point, index) => `MESSAGE_POINT_${index + 1}: ${point.text}`)
        .join("\n")
    : ""
}
${EvSermon.quote ? `QUOTE: ${EvSermon.quote}` : ""}

#QUOTES
${
  EvSermon.quotes && EvSermon.quotes.length > 0
    ? EvSermon.quotes
        .map(
          (quote, index) =>
            `QUOTE_${index + 1}_REFERENCE: ${quote.reference || ""}\n` +
            `QUOTE_${index + 1}_TEXT: ${quote.text}\n` +
            `QUOTE_${index + 1}_INITIALS: ${quote.prophetInitials || ""}`
        )
        .join("\n")
    : ""
}

#IMAGE_DATA
${EvSermon.backgroundImage || ""}`;
}

function parseSermonFile(content: string, id: string): EvSermon {
  const lines = content.split("\n");
  const sermon: Partial<EvSermon> = {
    id,
    type: "sermon",
    scriptures: [],
    mainMessagePoints: [], // Initialize message points array
    quotes: [], // Initialize quotes array
  };

  let section = "";
  const quotesData: { [key: string]: any } = {};

  for (const line of lines) {
    if (line.startsWith("#")) {
      section = line.slice(1).trim(); // Add trim() here to remove whitespace
      continue;
    }

    if (!line.includes(":")) continue;

    const [key, ...valueParts] = line.split(":");
    const value = valueParts.join(":").trim(); // Rejoin with : to preserve any : in the value

    switch (section) {
      case "METADATA":
        switch (key.trim()) {
          case "TITLE":
            sermon.title = value;
            break;
          case "PREACHER":
            sermon.preacher = value;
            break;
          case "DATE":
            sermon.date = value;
            break;
          case "CREATED_AT":
            sermon.createdAt = value;
            break;
          case "UPDATED_AT":
            sermon.updatedAt = value;
            break;
          case "BACKGROUND_IMAGE":
            sermon.backgroundImage = value || undefined;
            break;
        }
        break;
      case "SCRIPTURES":
        if (key.trim().startsWith("SCRIPTURE_")) {
          sermon.scriptures?.push({ text: value });
        }
        break;
      case "CONTENT":
        switch (key.trim()) {
          case "MAIN_MESSAGE":
            sermon.mainMessage = value;
            break;
          case "QUOTE":
            sermon.quote = value;
            break;
        }
        // Handle message points
        if (key.trim().startsWith("MESSAGE_POINT_")) {
          sermon.mainMessagePoints?.push({ text: value });
        }
        break;
      case "QUOTES":
        // Handle new structured quotes
        if (key.trim().startsWith("QUOTE_")) {
          const quoteMatch = key
            .trim()
            .match(/^QUOTE_(\d+)_(REFERENCE|TEXT|INITIALS)$/);
          if (quoteMatch) {
            const quoteIndex = parseInt(quoteMatch[1]) - 1;
            const field = quoteMatch[2];

            if (!quotesData[quoteIndex]) {
              quotesData[quoteIndex] = {};
            }

            if (field === "REFERENCE") {
              quotesData[quoteIndex].reference = value || undefined;
            } else if (field === "TEXT") {
              quotesData[quoteIndex].text = value;
            } else if (field === "INITIALS") {
              quotesData[quoteIndex].prophetInitials = value || undefined;
            }
          }
        }
        break;
    }
  }

  // Convert quotesData object to array
  const quotesArray = Object.keys(quotesData)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map((key) => quotesData[key])
    .filter((quote) => quote.text); // Only include quotes with text

  if (quotesArray.length > 0) {
    sermon.quotes = quotesArray;
  }

  return sermon as EvSermon;
}

// New function to create React-based song projection window
async function createSongProjectionWindow() {
  const displays = screen.getAllDisplays();
  let songProjectionDisplay = null;
  let useMainDisplay = false;

  // Find external display (projector)
  // if (displays.length > 1) {
  //   songProjectionDisplay = displays.find(display =>
  //     display.bounds.x !== 0 || display.bounds.y !== 0
  //   );
  // } else {
  //   // Fallback to main display if no external display is found
  //   useMainDisplay = true;
  //   songProjectionDisplay = displays[0];
  // }

  // Create a new song projection window
  songPresentationWin = new BrowserWindow({
    title: "Song Projection",
    // x: useMainDisplay ? undefined : songProjectionDisplay?.bounds.x,
    // y: useMainDisplay ? undefined : songProjectionDisplay?.bounds.y,
    // width: songProjectionDisplay?.bounds.width || 800,
    // height: songProjectionDisplay?.bounds.height || 600,
    frame: false,
    show: true,
    minimizable: true,
    fullscreen: true, // Only go fullscreen on external display
    alwaysOnTop: false,
    skipTaskbar: false, // Show in taskbar for easier access
    icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      zoomFactor: 1.0,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    songPresentationWin.loadURL(
      `${VITE_DEV_SERVER_URL}/#/song-presentation-display`
    );
  } else {
    songPresentationWin.loadFile(indexHtml, {
      hash: "song-presentation-display",
    });
  }

  // Track window state changes
  songPresentationWin.on("minimize", () => {
    isProjectionMinimized = true;
  });

  songPresentationWin.on("restore", () => {
    isProjectionMinimized = false;
  });

  songPresentationWin.on("closed", () => {
    songPresentationWin = null;
    isProjectionMinimized = false;
  });

  return songPresentationWin;
}

// ipcMain handler for creating song projection window
ipcMain.handle("create-song-projection-window", async (event, data) => {
  try {
    if (!songPresentationWin || songPresentationWin.isDestroyed()) {
      await createSongProjectionWindow();

      // Wait for window to be ready before sending initial data
      songPresentationWin?.once("ready-to-show", () => {
        if (data.songData) {
          songPresentationWin?.webContents.send("display-song", data.songData);
        }
        songPresentationWin?.focus();
      });
    } else {
      // Window exists, just focus it and update data
      if (data.songData) {
        songPresentationWin.webContents.send("display-song", data.songData);
      }
      songPresentationWin.focus();
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating song projection window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Song projection navigation and font size IPC handlers
ipcMain.handle(
  "send-to-song-projection",
  async (event, { command, data, fontSize }) => {
    try {
      console.log("🎵 Main process received song projection command:", {
        command,
        data,
        fontSize,
      });

      if (!songPresentationWin || songPresentationWin.isDestroyed()) {
        console.log("❌ Song projection window not available");
        return { success: false, error: "No projection window available" };
      }

      // Send command to the song presentation window
      if (command) {
        console.log("📤 Sending command to projection window:", {
          command,
          data,
        });
        songPresentationWin.webContents.send("song-projection-command", {
          command,
          data,
        });
      }

      // Send font size update if provided
      if (fontSize !== undefined) {
        console.log(
          "📤 Sending font size update to projection window:",
          fontSize
        );
        songPresentationWin.webContents.send("font-size-update", fontSize);
      }

      return { success: true };
    } catch (error) {
      console.error("❌ Error sending to song projection:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
);

ipcMain.handle("send-to-main-window", async (event, { type, data }) => {
  try {
    if (!mainWin || mainWin.isDestroyed()) {
      console.log("Main window not available");
      return { success: false, error: "No main window available" };
    }

    // Send message to the main window
    mainWin.webContents.send("main-window-message", { type, data });

    return { success: true };
  } catch (error) {
    console.error("Error sending to main window:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
});

// Register custom protocol for local images
app.whenReady().then(() => {
  // Register custom protocol to serve local images
  protocol.registerFileProtocol("local-image", (request, callback) => {
    try {
      // Extract the file path from the URL
      const url = request.url.substring("local-image://".length);
      const filePath = decodeURIComponent(url);

      console.log("🖼️ Custom protocol serving image:", filePath);

      // Security check - ensure the file exists and is an image
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const allowedExtensions = [
          ".png",
          ".jpg",
          ".jpeg",
          ".gif",
          ".bmp",
          ".webp",
        ];

        if (allowedExtensions.includes(ext)) {
          // Log successful image serving
          logSystemInfo("Background image served via custom protocol", {
            filePath,
            extension: ext,
            fileSize: fs.statSync(filePath).size,
          });
          callback({ path: filePath });
        } else {
          console.error("❌ File is not an allowed image type:", ext);
          logSystemError("Invalid image type requested", {
            filePath,
            extension: ext,
            allowedExtensions,
          });
          callback({ error: -6 }); // INVALID_URL
        }
      } else {
        console.error("❌ Image file not found:", filePath);
        callback({ error: -6 }); // INVALID_URL
      }
    } catch (error) {
      console.error("❌ Error in custom protocol handler:", error);
      callback({ error: -6 }); // INVALID_URL
    }
  });
});
