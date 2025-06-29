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
  import { Presentation, EvSermon, EvOther } from "@/types";
  
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
  let isProjectionMinimized = false;
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
        zoomFactor: 1.0
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
  
  async function createProjectionWindow() {
    const displays = screen.getAllDisplays();
    let projectionDisplay = null;
  
      // Find external display (projector)
      if (displays.length > 1) {
        projectionDisplay = displays.find(display => 
          display.bounds.x !== 0 || display.bounds.y !== 0
        );
      }
    // Create a new projection window
    projectionWin = new BrowserWindow({
      title: "Projection",
      x: projectionDisplay?.bounds.x,
      y: projectionDisplay?.bounds.y,
      width: projectionDisplay?.bounds.width,
      height: projectionDisplay?.bounds.height,
      frame: false,
      show: false,
      minimizable: false,
      fullscreen: true,
      alwaysOnTop: false,
      skipTaskbar: true,
      icon: path.join("./dist/", "music2.png"),
      webPreferences: {
        preload,
        devTools: false,
        nodeIntegration: true,
        contextIsolation: true,
        zoomFactor: 1.0
      },
    });
  
    if (VITE_DEV_SERVER_URL) {
      projectionWin.loadURL(`${VITE_DEV_SERVER_URL}/projection.html`);
      projectionWin.setSkipTaskbar(true);
      // projectionWin.webContents.openDevTools();
    } else {
      projectionWin.loadFile(projectionHtml);
    }
  
    // Track window state changes
    projectionWin.on("minimize", () => {
      isProjectionMinimized = true;
    });
  
    projectionWin.on("restore", () => {
      isProjectionMinimized = false;
    });
  
    // Critical: Reset reference when window is closed
    projectionWin.on("closed", () => {
      projectionWin = null;
      isProjectionMinimized = false;
    });
  
    projectionWin.webContents.on("before-input-event", (event, input) => {
      if (
        input.key === "F12" || // Disable F12 for dev tools
        (input.key === "I" && input.control && input.shift) || // Disable Ctrl+Shift+I or Cmd+Opt+I
        (input.key === "R" && input.control) || // Disable Ctrl+R for reload
        (input.key === "R" && input.meta) // Disable Cmd+R for reload on macOS
      ) {
        event.preventDefault();
      }
    });
  
    return projectionWin;
  }
  
  // Handle the escape key minimize functionality from the renderer
  ipcMain.on("minimizeProjection", () => {
    if (projectionWin && !projectionWin.isDestroyed()) {
      projectionWin.minimize();
      isProjectionMinimized = true;
  
      // Focus the main window after minimizing the projection window
      if (mainWin && !mainWin.isDestroyed()) {
        mainWin.focus();
      }
    }
  });
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
    console.log(songData);
  
    // First check if window exists but is minimized
    if (projectionWin && !projectionWin.isDestroyed() && isProjectionMinimized) {
      projectionWin.restore();
      isProjectionMinimized = false;
      setTimeout(() => {
        projectionWin?.webContents.send("display-song", songData);
        projectionWin?.focus();
      }, 300); // Short delay to ensure window is restored before sending data
      return;
    }
  
    // If window doesn't exist or was destroyed, create a new one
    if (!projectionWin || projectionWin.isDestroyed()) {
      await createProjectionWindow();
      // Wait for window to be ready before sending data
      projectionWin?.once("ready-to-show", () => {
        projectionWin?.webContents.send("display-song", songData);
        projectionWin?.focus();
      });
    } else {
      // Window exists and is not minimized, just send the data
      projectionWin.webContents.send("display-song", songData);
      projectionWin.focus();
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
        throw new Error("Missing required fields: directory, title, and content are required.");
      }
  
      // Validate title format
      if (title.trim().length === 0) {
        throw new Error("Song title cannot be empty.");
      }
  
  
      // Check if directory exists
      if (!fs.existsSync(directory)) {
        throw new Error("The specified directory does not exist. Please select a valid folder.");
      }
  
      // Check directory permissions
      try {
        fs.accessSync(directory, fs.constants.W_OK);
      } catch (permissionError) {
        throw new Error("Permission denied. You don't have write access to the selected directory.");
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
          : `Song "${title}" has been successfully created.`
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
        if (code === 'ENOENT') {
          throw new Error("The file path is invalid or the directory no longer exists.");
        } else if (code === 'EACCES' || code === 'EPERM') {
          throw new Error("Permission denied. Cannot write to the selected location.");
        } else if (code === 'ENOSPC') {
          throw new Error("Not enough disk space to save the file.");
        } else if (code === 'EMFILE' || code === 'ENFILE') {
          throw new Error("Too many files are open. Please close some applications and try again.");
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
          content = formatSermonToText(newPresentation);
        } else {
          content = formatOtherToText(newPresentation);
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
        console.log("path for update",directoryPath)
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
          if (updatedPresentation.type === "sermon") {
            newContent = formatSermonToText(updatedPresentation as EvSermon);
          } else {
            throw new Error("Invalid type for formatSermonToText");
          }
        } else {
          if (updatedPresentation.type === "other") {
            newContent = formatOtherToText(updatedPresentation as EvOther);
          } else {
            throw new Error("Invalid type for formatOtherToText");
          }
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
  ${EvSermon.quote ? `QUOTE: ${EvSermon.quote}` : ""}
  
  #END`;
  }
  
  function formatOtherToText(other: Presentation): string {
    if (other.type !== "other") throw new Error("Not an other presentation");
  
    const EvOther = other as EvOther;
  
    // Format structured data with clear section separators for easy parsing
    return `#TYPE: other
  #METADATA
  ID: ${other.id}
  TITLE: ${other.title}
  CREATED_AT: ${other.createdAt}
  UPDATED_AT: ${other.updatedAt}
  
  #CONTENT
  MESSAGE: ${EvOther.message || ""}
  
  #END`;
  }
  
  function parseSermonFile(content: string, id: string): EvSermon {
    // Initialize with defaults
    const sermon: Partial<EvSermon> = {
      id,
      type: "sermon",
      title: "",
      preacher: "",
      date: "",
      scriptures: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  
    // Handle both old and new format
    if (content.includes("#METADATA")) {
      // New structured format
      const sections = content.split(/\n#[A-Z]+\n/);
  
      // Parse metadata section
      if (sections.length > 1) {
        const metadataLines = sections[1].trim().split("\n");
        metadataLines.forEach((line) => {
          if (line.startsWith("TITLE: ")) sermon.title = line.substring(7);
          else if (line.startsWith("PREACHER: "))
            sermon.preacher = line.substring(10);
          else if (line.startsWith("DATE: ")) sermon.date = line.substring(6);
          else if (line.startsWith("CREATED_AT: "))
            sermon.createdAt = line.substring(12);
          else if (line.startsWith("UPDATED_AT: "))
            sermon.updatedAt = line.substring(12);
        });
      }
  
      // Parse scriptures section
      if (sections.length > 2) {
        const scriptureLines = sections[2].trim().split("\n");
        sermon.scriptures = scriptureLines
          .filter((line) => line.startsWith("SCRIPTURE_"))
          .map((line) => {
            const text = line.substring(line.indexOf(":") + 2);
            return { text };
          });
      }
  
      // Parse content section
      if (sections.length > 3) {
        const contentLines = sections[3].trim().split("\n");
        contentLines.forEach((line) => {
          if (line.startsWith("MAIN_MESSAGE: "))
            sermon.mainMessage = line.substring(14);
          else if (line.startsWith("QUOTE: ")) sermon.quote = line.substring(7);
        });
      }
    } else {
      // Legacy format
      const lines = content.split("\n");
  
      lines.forEach((line) => {
        if (line.startsWith("TITLE: ")) sermon.title = line.substring(7);
        else if (line.startsWith("PREACHER: "))
          sermon.preacher = line.substring(10);
        else if (line.startsWith("DATE: ")) sermon.date = line.substring(6);
        else if (line.startsWith("SCRIPTURES: ")) {
          const scriptures = line.substring(12).split("|");
          sermon.scriptures = scriptures.map((text) => ({ text }));
        } else if (line.startsWith("MAIN_MESSAGE: "))
          sermon.mainMessage = line.substring(14);
        else if (line.startsWith("QUOTE: ")) sermon.quote = line.substring(7);
        else if (line.startsWith("CREATED_AT: "))
          sermon.createdAt = line.substring(12);
        else if (line.startsWith("UPDATED_AT: "))
          sermon.updatedAt = line.substring(12);
      });
    }
  
    return sermon as EvSermon;
  }
  
  function parseOtherFile(content: string, id: string): EvOther {
    // Initialize with defaults
    const other: Partial<EvOther> = {
      id,
      type: "other",
      title: "",
      message: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  
    // Handle both old and new format
    if (content.includes("#METADATA")) {
      // New structured format
      const sections = content.split(/\n#[A-Z]+\n/);
  
      // Parse metadata section
      if (sections.length > 1) {
        const metadataLines = sections[1].trim().split("\n");
        metadataLines.forEach((line) => {
          if (line.startsWith("TITLE: ")) other.title = line.substring(7);
          else if (line.startsWith("CREATED_AT: "))
            other.createdAt = line.substring(12);
          else if (line.startsWith("UPDATED_AT: "))
            other.updatedAt = line.substring(12);
        });
      }
  
      // Parse content section
      if (sections.length > 2) {
        const contentLines = sections[2].trim().split("\n");
        contentLines.forEach((line) => {
          if (line.startsWith("MESSAGE: ")) other.message = line.substring(9);
        });
      }
    } else {
      // Legacy format
      const lines = content.split("\n");
  
      lines.forEach((line) => {
        if (line.startsWith("TITLE: ")) other.title = line.substring(7);
        else if (line.startsWith("MESSAGE: ")) other.message = line.substring(9);
        else if (line.startsWith("CREATED_AT: "))
          other.createdAt = line.substring(12);
        else if (line.startsWith("UPDATED_AT: "))
          other.updatedAt = line.substring(12);
      });
    }
  
    return other as EvOther;
  }