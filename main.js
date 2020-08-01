const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const electronDl = require('electron-dl');
const { download } = require("electron-dl");
const fs = require('fs-extra');
const keytar = require('keytar');
const request = require('request');
const merge_files = require('merge-files');
let os = require('os').release()
console.log(os);

const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const { resolve } = require("path");

autoUpdater.autoDownload = false;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const client = require('discord-rich-presence')('732236615153483877');
let presence = {
  state: 'Разработка',
  details: 'Запуск',
  startTimestamp: Date.now(),
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
  // win.setSkipTaskbar(true);
  // show_minimized_in_taskbar = false;
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

let THREADS = 8;
let total_download_size = 0;

function create_download_thread(start_bytes, finish_bytes, url, path, thread_num, onProgress)
{ 
  return new Promise((resolve, reject) => {
    console.log(`Creating Thread from: ${start_bytes}, to: ${finish_bytes}`);
    let received_bytes = 0;
    let total_bytes = 0;

    let req = request({
        headers: {
          'Range': `bytes=${start_bytes}-${finish_bytes}`
        },
        method: 'GET',
        uri: url
    });

    let out = fs.createWriteStream(path + '\\' + `downloadingthread${thread_num}.thread`);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        let progress = {speed: 0, percentage: 0};

        let speed = received_bytes;
        progress.speed = speed / 2;

        let percentage = (received_bytes * 100) / total_bytes;
        progress.percentage = percentage;

        onProgress(progress);
    });

    req.on('end', function() {
      resolve();
    });
  });
}

function clear_thread_files(path, threads)
{
  for (let i = 0; i < threads; i++)
  {
    fs.unlinkSync(path + `\\downloadingthread${i}.thread`);
  }
}

function get_total_download_size(url)
{
  return new Promise(async (resolve, reject) => {
    let finally_got_that_size_from_github = false;
    while(!finally_got_that_size_from_github)
    {
      let content_length = await new Promise((resolve, reject) => {
        // Sending fake request to get download size
        let req = request({
          headers: {
            'Range': `bytes=0-1000000000000000000000000`
          },
          method: 'GET',
          uri: url
        });

        req.on('response', function ( data ) {
            // Change the total bytes value to get progress later.
            console.log(data.headers);
            if (data.headers['content-length'] != undefined && data.headers['content-length'] > 0)
            {
              resolve(data.headers['content-length']);
            }
            else if (data.headers['content-range'] != undefined)
            {
              resolve(data.headers['content-range'].split('/')[1]);
            }
            else
            {
              resolve(undefined);
            }
        });
      });

      console.log(content_length);
      if (content_length != undefined)
      {
        console.log(content_length);
        finally_got_that_size_from_github = true;
        resolve(content_length);
      } 
    }
  });
}

ipcMain.on('download-from-link', async (event, {threads, path, url, filename}) => {
    console.log(`downloading: ${url}`);
    // Save variable to know progress
    let total_bytes = await get_total_download_size(url);
    if (threads == undefined || threads == null || threads == 0)
      threads = 1;
    let finished = 0;
    let biggest_percent = 0;
    for (let i = 0; i < threads; i++)
    {
      let chunk_start = Math.floor((total_bytes / threads) * i);
      if (i > 0) chunk_start++;
      let chunk_finish = Math.floor((total_bytes / threads) * (i + 1));

      create_download_thread(
        chunk_start,
        chunk_finish,
        url,
        path,
        i,
        function (progress) {
          if (biggest_percent < progress.percentage)
          {
            console.log(progress.percentage);
            event.reply('download-progress', progress);
          }
        }
      )
      .then(async res => {
        console.log(`Thread ${i} finished`);
        finished++;
        if(finished == threads)
        {
          const outputPath = path + `\\${filename}`;

          let inputPathList = [];
          for (let i = 0; i < threads; i++)
          {
            inputPathList.push(path + `\\downloadingthread${i}.thread`);
          }
      
          const status = await merge_files(inputPathList, outputPath);
          console.log(status);

          clear_thread_files(path, threads);
          console.log('download is finished');
          event.reply('download-completed');
        }
      }).catch(err => console.log(err));
    }
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
    event.reply('user-info-updated');
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

let already_checking = false;
let downloading_update = false;
ipcMain.on('check-for-updates', (event, src) => {
  if (!already_checking)
  {
    autoUpdater.checkForUpdates();
    already_checking = true;
  }
});

ipcMain.on('download-update', (event, src) => {
  if (!downloading_update)
    autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', (event, src) => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
  win.webContents.send('update-available');
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
  win.webContents.send('update-not-available');

  already_checking = false;
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
  win.webContents.send('update-error');
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  win.webContents.send('download-progress', progressObj);
  downloading_update = true;
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
  win.webContents.send('update-downloaded');
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
