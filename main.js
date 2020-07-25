const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const electronDl = require('electron-dl');
const { download } = require("electron-dl");
if(require('electron-squirrel-startup')) return;
const keytar = require('keytar');

const log = require('electron-log');
const { autoUpdater } = require("electron-updater")

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const client = require('discord-rich-presence')('732236615153483877');
let presence = {
  state: 'Разработка',
  details: 'Запуск',
  startTimestamp: Date.now(),
  endTimestamp: Date.now() + 1,
  largeImageKey: 'rp_start_2',
  instance: false,
  spectateSecret: 'MTIzNDV8MTIzNDV8MTMyNDU0'
};

client.updatePresence(presence);
let userInfo = {};
electronDl();

//#region //. App Launch and Exit ------------------------------------------

let win;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: 'src/res/app_icon.ico',
    frame: false,
    transparent: true,
    center: true
  });

  // and load the index.html of the app.
  win.loadFile('src/pages/start/index.html');

  // Open the DevTools.
  //*   win.webContents.openDevTools()

  win.on('minimized', (event, args) => {
    if (!show_minimized_in_taskbar)
    {
      event.preventDefault();
    }
  });
}

let show_minimized_in_taskbar = true;

ipcMain.on('minimize-to-tray', (event, args) => {
  win.setSkipTaskbar(true);
  show_minimized_in_taskbar = false;
  win.minimize();
  tray = createTray();
});

function createTray() {
  let appIcon = new Tray('src/res/app_icon.ico');
  const contextMenu = Menu.buildFromTemplate([
      {
          label: 'Открыть', click: () => { win.show(); },
      },
      {
          label: 'Перезагрузить', click: () => { win.reload(); },
      },
      {
          label: 'Выйти', click: () => {
              app.isQuiting = true;
              app.quit();
          }
      }
    ]);

  appIcon.on('double-click', () => {
    win.show();
    win.setSkipTaskbar(false);
    tray.destroy();
    show_minimized_in_taskbar = true;
  });
  appIcon.setToolTip('Delta');
  appIcon.setTitle('Delta');
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}

app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//#endregion

//#region //. IPC -----------------------------------------

//#region //. Download 
let downloading_item = null;

ipcMain.on('download-from-link', async (event, {path, url}) => {
    console.log(`downloading: ${url}`);
    const win = BrowserWindow.getFocusedWindow();
    let prev_transferredBytes = 0;

    // Start download using eletron-dl
    download(win, url, {
      directory: path,
      filename: 'modpack.zip',

      // send 'download-progress' event back to the evoker.
      // conatins progress info
      onProgress: progress => {
        console.log('download progress: ' + progress.transferredBytes);
        
        // Calculate speed and add it to progress var. Why not?
        let speed = progress.transferredBytes - prev_transferredBytes;
        prev_transferredBytes = progress.transferredBytes;
        progress.speed = speed / 2;
        
        event.reply('download-progress', progress);
      },

      // puts DownloadItem object in variable so i can pause / cancel it
      onStarted: (item) => {
        downloading_item = item;
      }
    }).then(res => {

      // We don't need DownloadItem cuz it already downloaded.
      // Then it send reply to the evoker containing results
      downloading_item = null;
      event.reply('download-completed', res);

    });
});

ipcMain.on('cancel-current-download', async (event, reason) => {

  // We can't cancel if we don't download anything D:
  if (downloading_item == null)
  {
    event.reply('download-cancelled', 'no download in progress'); 
  }
  else
  {
    console.log(`Download is cancelled. Reason: ${reason}`);
    downloading_item.cancel();
    event.reply('download-cancelled', 'success'); 
  }
});
//#endregion

//#region //. User info
ipcMain.on('update-user-info', (event, { info, password }) => {

    // overwrites userInfo variable to info
    userInfo = info;
    keytar.setPassword('Delta', info['uid'], password);
    event.returnValue = 0;
});

ipcMain.on('update-user-server-info', (event, info) => {
  userInfo['servers_info'] = info;
  event.reply('updated');
});

ipcMain.on('get-user-info', (event) => {
    // returns userInfo
    event.returnValue = userInfo;
});

ipcMain.on('get-user-credentials', async (event) => {
  event.returnValue = await keytar.findCredentials('Delta');
});
//#endregion

//#region //. Discord Rich Presence
ipcMain.on('rich-presence-to', (event, key) => {
  client.updatePresence(Object.assign(presence, key));
  event.returnValue = 0;
});

ipcMain.on('rich-presence-disconnect', (event, reason) => {
  console.log(reason);
  client.disconnect();
  event.returnValue = 0;
});
//#endregion

//#region //. Auto Updater
function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('update-message', text);
}

ipcMain.on('check-for-updates', (event, src) => {
  autoUpdater.checkForUpdates();
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});
//#endregion

//#region //. Log out
ipcMain.on('logout', (event, args) => {
  win.loadFile('src/pages/start/index.html');
  keytar.deletePassword('Delta', userInfo['uid']);
  console.log(userInfo['uid']);
  userInfo = {};
  event.reply('succesfull logout')
});
//#endregion

//#endregion
