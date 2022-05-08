const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const DiscordRPC = require("discord-rpc");

const remoteMain = require("@electron/remote/main");
remoteMain.initialize();

// Set this to your Client ID.
const clientId = "907439545203720242";

// Only needed if you want to use spectate, join, or ask to join
DiscordRPC.register(clientId);

const rpc = new DiscordRPC.Client({ transport: "ipc" });

function setActivity(activity) {
  if (!rpc) {
    return;
  }

  rpc.setActivity(activity);
}

const isSquirrelStartup = require("electron-squirrel-startup");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (isSquirrelStartup) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  if (isSquirrelStartup) return;

  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().size;

  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, "../assets/icons/png/64x64.png"),
    frame: false,
    width: Math.round(screenWidth * 0.9),
    height: Math.round(screenHeight * 0.9),
    backgroundColor: "#0d0d0d",
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true,
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: true,
    },
  });

  const splashWindow = new BrowserWindow({
    width: 224,
    height: 400,
    frame: false,
    backgroundColor: "1a1a1a",
    webPreferences: {
      titleBarStyle: "hidden",
      nativeWindowOpen: true,
    },
    alwaysOnTop: true,
    movable: true,
  });

  remoteMain.enable(mainWindow.webContents);

  const load = () => {
    mainWindow.loadFile(path.join(__dirname, "index.html"));
    splashWindow.loadFile(path.join(__dirname, "splash.html"));
  };

  ipcMain.on("hide-splash", () => {
    splashWindow.hide();
    mainWindow.maximize();
    mainWindow.show();
  });

  load();
};

rpc.on("ready", () => {
  console.log("rpc ready");

  ipcMain.on("set-activity", (_, activity) => {
    setActivity(activity);
  });
});

rpc.login({ clientId }).catch(console.error);

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
