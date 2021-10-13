const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");

let mainWindow;

const port = process.env.PORT ? (process.env.PORT - 1) : 3000;

function createWindow() {
  mainWindow = new BrowserWindow({ 
    width: 900, 
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      devTools: true,
    },
  });
  
  mainWindow.loadURL(
    isDev
      ? `http://localhost:${port}`
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  mainWindow.removeMenu();
  mainWindow.setResizable(false);
  mainWindow.on('closed', () => (mainWindow = null));
  mainWindow.focus();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  //if (process.platform !== "darwin") {
    app.quit();
  //}
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});