const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 360,
    minHeight: 640,
    show: false,
    backgroundColor: "#070809",
    title: "KDU Ball - 2026",
    icon: path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: !app.isPackaged,
    },
  });

  window.removeMenu();
  window.once("ready-to-show", () => window.show());
  window.loadFile(path.join(__dirname, "../dist/index.html"));

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });

  window.webContents.on("will-navigate", (event, url) => {
    if (url !== window.webContents.getURL()) event.preventDefault();
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
