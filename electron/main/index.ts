import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  nativeImage,
  screen,
} from "electron";
import fs from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { v4 as uuidv4 } from "uuid";
import { Presentation, EvSermon, EvOther, EvCustom } from "@/types";

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

  return mainWin;
}

// DISABLED: Static HTML projection window function
/*
async function createProjectionWindow() {
  const displays = screen.getAllDisplays();
  let projectionDisplay = null;
  let useMainDisplay = false;

  // Find external display (projector)
  // if (displays.length > 1) {
  //   projectionDisplay = displays.find(display =>
  //     display.bounds.x !== 0 || display.bounds.y !== 0
  //   );
  // } else {
  //   // Fallback to main display if no external display is found
  //   useMainDisplay = true;
  //   projectionDisplay = displays[0];
  // }

  // Create a new projection window
  projectionWin = new BrowserWindow({
    title: "Projection",
    // x: useMainDisplay ? undefined : projectionDisplay?.bounds.x,
    // y: useMainDisplay ? undefined : projectionDisplay?.bounds.y,
    // width: projectionDisplay?.bounds.width || 800,
    // height: projectionDisplay?.bounds.height || 600,
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

  // Send display info to renderer
  // projectionWin.webContents.on('did-finish-load', () => {
  //   projectionWin?.webContents.send('display-info', {
  //     isExternalDisplay: !useMainDisplay,
  //     displayBounds: projectionDisplay?.bounds
  //   });
  // });

  if (VITE_DEV_SERVER_URL) {
    projectionWin.loadURL(`${VITE_DEV_SERVER_URL}/projection.html`);
  } else {
    projectionWin.loadFile(projectionHtml);
  }

  // Show window once loaded
  // projectionWin.once('ready-to-show', () => {
  //   projectionWin?.show();
  //   // If using main display, position it nicely
  //   if (useMainDisplay) {
  //     projectionWin?.setSize(800, 600);
  //     projectionWin?.center();
  //   }
  // });

  // Track window state changes
  projectionWin.on("minimize", () => {
    isProjectionMinimized = true;
  });

  projectionWin.on("restore", () => {
    isProjectionMinimized = false;
  });

  projectionWin.on("closed", () => {
    projectionWin = null;
    isProjectionMinimized = false;
  });

  return projectionWin;
}
*/

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

  // DISABLED: Static HTML projection minimize
  /*
  if (projectionWin && !projectionWin.isDestroyed()) {
    projectionWin.minimize();
    isProjectionMinimized = true;

    // Focus the main window after minimizing the projection window
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.focus();
    }
  }
  */
});

async function createBiblePresentationWindow() {
  const displays = screen.getAllDisplays();
  let presentationDisplay = displays[0]; // Default to primary display

  // Find external display (projector) if available
  if (displays.length > 1) {
    const externalDisplay = displays.find(
      (display) => display.bounds.x !== 0 || display.bounds.y !== 0
    );
    if (externalDisplay) {
      presentationDisplay = externalDisplay;
    }
  }

  // Create Bible presentation window
  biblePresentationWin = new BrowserWindow({
    title: "Bible Presentation",
    x: presentationDisplay.bounds.x,
    y: presentationDisplay.bounds.y,
    width: presentationDisplay.bounds.width,
    height: presentationDisplay.bounds.height,
    frame: false,
    show: true,
    fullscreen: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the presentation display page
  if (VITE_DEV_SERVER_URL) {
    biblePresentationWin.loadURL(
      `${VITE_DEV_SERVER_URL}/#/bible-presentation-display`
    );
    biblePresentationWin.webContents.openDevTools(); // Open dev tools for debugging
  } else {
    biblePresentationWin.loadFile(indexHtml, {
      hash: "bible-presentation-display",
    });
  }

  biblePresentationWin.on("closed", () => {
    biblePresentationWin = null;
  });

  return biblePresentationWin;
}

async function createSongPresentationWindow() {
  const displays = screen.getAllDisplays();
  let presentationDisplay = displays[0]; // Default to primary display

  // Find external display (projector) if available
  if (displays.length > 1) {
    const externalDisplay = displays.find(
      (display) => display.bounds.x !== 0 || display.bounds.y !== 0
    );
    if (externalDisplay) {
      presentationDisplay = externalDisplay;
    }
  }

  // Create Song presentation window
  songPresentationWin = new BrowserWindow({
    title: "Song Presentation",
    x: presentationDisplay.bounds.x,
    y: presentationDisplay.bounds.y,
    width: presentationDisplay.bounds.width,
    height: presentationDisplay.bounds.height,
    frame: false,
    show: true,
    fullscreen: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    icon: path.join(process.env.VITE_PUBLIC || "", "evv.png"),
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

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
  });

  // Track minimization state
  songPresentationWin.on("minimize", () => {
    isSongPresentationMinimized = true;
  });

  songPresentationWin.on("restore", () => {
    isSongPresentationMinimized = false;
  });

  return songPresentationWin;
}

app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

// Ensure app quits when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("project-song", async (event, songData) => {
  console.log("Using React-based song projection:", songData);

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
    });
  } else {
    // Window exists and is not minimized, just send the data and ensure it's visible
    songPresentationWin.webContents.send("display-song", songData);
    songPresentationWin.show();
    songPresentationWin.focus();
    songPresentationWin.moveTop();
  }
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
      throw new Error(
        "Missing required fields: directory, title, and content are required."
      );
    }

    // Validate title format
    if (title.trim().length === 0) {
      throw new Error("Song title cannot be empty.");
    }

    // Check if directory exists
    if (!fs.existsSync(directory)) {
      throw new Error(
        "The specified directory does not exist. Please select a valid folder."
      );
    }

    // Check directory permissions
    try {
      fs.accessSync(directory, fs.constants.W_OK);
    } catch (permissionError) {
      throw new Error(
        "Permission denied. You don't have write access to the selected directory."
      );
    }

    const filePath = path.join(directory, `${title.trim()}.txt`);
    const fileExists = fs.existsSync(filePath);

    // Write the file (create new or overwrite existing)
    fs.writeFileSync(filePath, content, "utf8");

    return {
      success: true,
      filePath,
      isNewFile: !fileExists,
      message: fileExists
        ? `Song "${title}" has been successfully updated.`
        : `Song "${title}" has been successfully created.`,
    };
  } catch (error) {
    console.error("Error saving song:", error);

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
    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
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
      fs.unlinkSync(filePath);
      return true;
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    console.error("Error deleting song:", error);
    throw error;
  }
});

async function loadImagesFromDirectory(dirPath: string) {
  const allowedExtensions = [".png", ".jpg", ".jpeg"];

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
      .slice(0, 5); // Limit to the first 4 images
    // Load images in parallel using Promise.all
    const images = await Promise.all(
      imageFiles.map(async (file) => {
        const imagePath = path.join(dirPath, file);
        const imageBuffer = await fs.promises.readFile(imagePath); // Read file as buffer
        const image = nativeImage.createFromBuffer(imageBuffer); // Create nativeImage from buffer
        return image.toDataURL(); // Convert to base64 DataURL
      })
    );

    return images;
  } catch (error) {
    console.error("Error loading images:", error);
    return [];
  }
}

ipcMain.handle("get-images", async (event, dirPath) => {
  return loadImagesFromDirectory(dirPath); // Return the list of base64-encoded images
});

// Bible Presentation Window handlers
ipcMain.handle("create-bible-presentation-window", async (event, data) => {
  try {
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
        biblePresentationWin?.focus();
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
        if (content.includes("#TYPE: sermon")) {
          presentations.push(parseSermonFile(content, id));
        } else if (content.includes("#TYPE: other")) {
          presentations.push(parseOtherFile(content, id));
        } else if (content.includes("TYPE: sermon")) {
          // Legacy format
          presentations.push(parseSermonFile(content, id));
        } else if (content.includes("TYPE: other")) {
          // Legacy format
          presentations.push(parseOtherFile(content, id));
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
      } else if (newPresentation.type === "custom") {
        content = formatCustomToText(newPresentation as EvCustom);
      } else {
        content = formatOtherToText(newPresentation as EvOther);
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
      } else if (
        content.includes("#TYPE: custom") ||
        content.includes("TYPE: custom")
      ) {
        existingPresentation = parseCustomFile(content, id);
      } else {
        existingPresentation = parseOtherFile(content, id);
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
      } else if (updatedPresentation.type === "custom") {
        newContent = formatCustomToText(updatedPresentation as EvCustom);
      } else if (updatedPresentation.type === "other") {
        newContent = formatOtherToText(updatedPresentation as EvOther);
      } else {
        throw new Error("Invalid presentation type");
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

#IMAGE_DATA
${EvSermon.backgroundImage || ""}`;
}

function formatOtherToText(other: Presentation): string {
  if (other.type !== "other") throw new Error("Not an other presentation");

  const EvOther = other as EvOther;

  return `#TYPE: other
#METADATA
ID: ${other.id}
TITLE: ${other.title}
CREATED_AT: ${other.createdAt}
UPDATED_AT: ${other.updatedAt}

#CONTENT
MESSAGE: ${EvOther.message || ""}

#IMAGE_DATA
${EvOther.backgroundImage || ""}`;
}

function formatCustomToText(custom: Presentation): string {
  if (custom.type !== "custom") throw new Error("Not a custom presentation");

  const EvCustom = custom as EvCustom;

  return `#TYPE: custom
#METADATA
ID: ${custom.id}
TITLE: ${custom.title}
DESCRIPTION: ${EvCustom.description || ""}
CREATED_AT: ${custom.createdAt}
UPDATED_AT: ${custom.updatedAt}

#SLIDES
${
  EvCustom.slides
    ? EvCustom.slides
        .map((slide, index) => `SLIDE_${index + 1}: ${JSON.stringify(slide)}`)
        .join("\n")
    : ""
}

#IMAGE_DATA
${EvCustom.backgroundImage || ""}`;
}

function parseSermonFile(content: string, id: string): EvSermon {
  const lines = content.split("\n");
  const sermon: Partial<EvSermon> = {
    id,
    type: "sermon",
    scriptures: [],
    mainMessagePoints: [], // Initialize message points array
  };

  let section = "";
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
    }
  }

  return sermon as EvSermon;
}

function parseOtherFile(content: string, id: string): EvOther {
  const lines = content.split("\n");
  const other: Partial<EvOther> = {
    id,
    type: "other",
  };

  let section = "";
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
            other.title = value;
            break;
          case "CREATED_AT":
            other.createdAt = value;
            break;
          case "UPDATED_AT":
            other.updatedAt = value;
            break;
        }
        break;
      case "CONTENT":
        if (key.trim() === "MESSAGE") {
          other.message = value;
        }
        break;
      case "IMAGE_DATA":
        // Handle background image from the IMAGE_DATA section
        if (value.trim()) {
          other.backgroundImage = value;
        }
        break;
    }
  }

  return other as EvOther;
}

function parseCustomFile(content: string, id: string): EvCustom {
  const lines = content.split("\n");
  const custom: Partial<EvCustom> = {
    id,
    type: "custom",
    slides: [],
  };

  let section = "";
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
            custom.title = value;
            break;
          case "DESCRIPTION":
            custom.description = value;
            break;
          case "CREATED_AT":
            custom.createdAt = value;
            break;
          case "UPDATED_AT":
            custom.updatedAt = value;
            break;
        }
        break;
      case "SLIDES":
        if (key.trim().startsWith("SLIDE_")) {
          try {
            const slide = JSON.parse(value);
            custom.slides?.push(slide);
          } catch (error) {
            console.error("Failed to parse slide:", error);
          }
        }
        break;
      case "IMAGE_DATA":
        // Handle background image from the IMAGE_DATA section
        if (value.trim()) {
          custom.backgroundImage = value;
        }
        break;
    }
  }

  return custom as EvCustom;
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
    songPresentationWin.loadURL(`${VITE_DEV_SERVER_URL}/song-projection`);
  } else {
    songPresentationWin.loadFile(indexHtml, {
      hash: "song-projection",
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
