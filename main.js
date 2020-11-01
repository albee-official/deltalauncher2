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

let userInfo = {};
electronDl();

//#region //. App Launch and Exit ------------------------------------------

let win;
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
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

app.on('before-quit', async () => {
  await cancel_current_download();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//#endregion

//#region //. IPC -----------------------------------------

//#region //. Download 
let downloading_item = false;
let download_canceled = false;
let total_download_size = 0;
let current_num_of_threads = 0;
let current_download_path = '';
let requests = [];

function cancel_current_download()
{
  return new Promise((resolve, reject) => {
    download_canceled = true;
    downloading_item = false;
    for (let req of requests)
    {
      req.abort();
    }
    if (requests.length > 1) 
    {
      clear_thread_files(current_download_path, current_num_of_threads);
    }
    if (fs.pathExistsSync(`${current_download_path}\\modpack.zip`)) fs.unlinkSync(`${current_download_path}\\modpack.zip`);
    
    resolve();
  });
}

function threadless_download(event, url, path, filename)
{ 
  return new Promise((resolve, reject) => {
    console.log(`Downloading from: ${url}`);
    let received_bytes = 0;
    let total_bytes = 0;

    let req = request({
        method: 'GET',
        uri: url
    });

    requests.push(req);

    let out = fs.createWriteStream(path + '\\' + filename);
    req.pipe(out);

    req.on('response', function ( data ) {
        // Change the total bytes value to get progress later.
        total_bytes = parseInt(data.headers['content-length']);
    });

    req.on('data', function(chunk) {
        // Update the received bytes
        received_bytes += chunk.length;

        let progress = {speed: 0, percentage: 0};

        progress.speed = chunk.length;

        progress.totalBytes = total_bytes;
        progress.transferredBytes = received_bytes;

        let percent = (received_bytes) / total_bytes;
        progress.percent = percent;

        console.log(progress.percent);
        console.log((progress.speed / 1024 / 1024).toPrecision(2));
        event.reply('download-progress', progress);
    });

    req.on('end', function() {
      console.log(`Finished Download from: ${url}`);
      resolve();
    });
  });
}

function create_download_thread(start_bytes, finish_bytes, url, path, thread_num, onProgress)
{ 
  return new Promise(async (resolve, reject) => {
    let thread_created_successfully = false;
    let thread_attempts = 0;
    while (!thread_created_successfully)
    {
      thread_attempts++;
      console.log(`[DWNTHRD ${thread_num}] - Attempting to create thread from: ${start_bytes} to: ${finish_bytes}. [${thread_attempts}]`);

      let received_bytes = 0;
      let total_bytes = 0;

      let downloaded_size = await new Promise((resolve, reject) => {
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
            console.log(`[DWNTHRD ${thread_num}] - Got response. Size: ${data.headers['content-length']}`);
            if (total_bytes != undefined && total_bytes > (finish_bytes - start_bytes) / 2)
            {
              requests.push(req);
              thread_created_successfully = true;
            }
            else
            {
              reject('broken thread');
              req.abort();
              out.end();
            }

            console.log(`[DWNTHRD ${thread_num}] - Total data in thread: ${data.headers['content-length']}`);
        });

        req.on('data', function(chunk) {
            // Update the received bytes
            received_bytes += chunk.length;

            let progress = {speed: 0, percentage: 0};

            progress.speed = chunk.length;

            progress.totalBytes = total_bytes;
            progress.transferredBytes = received_bytes;

            let percent = (received_bytes) / total_bytes;
            progress.percent = percent;

            onProgress(progress);
        });

        req.on('end', function() {
          resolve();
        });
      }).then(res => {
        resolve();
      }).catch(err => {
        console.log(`[DWNTHRD ${thread_num}] = Broken thread`);
      });
    }
  });
}

function threaded_download(event, url, path, filename, threads, total_bytes) {

  return new Promise((resolve, reject) => {
    if (threads == undefined || threads == null || threads == 0) threads = 1;

    let finished = 0;
    let biggest_percent = 0;

    //. Split By Chunks of Data
    for (let i = 0; i < threads; i++) {

      let chunk_start = Math.floor((total_bytes / threads) * i);
      if (i > 0) chunk_start++;
      let chunk_finish = Math.floor((total_bytes / threads) * (i + 1));

      //. Create download thread
      create_download_thread(
        chunk_start, 
        chunk_finish, 
        url, 
        path, 
        i, 
        function (progress) {
          if (biggest_percent.toPrecision(1) < progress.percent.toPrecision(1)) {
            event.reply("download-progress", progress);
        }
      })
        //. Then Download Thread finsihed
        .then(async (res) => {
          console.log(`[DWNTHRD ${i}] - Finished`);
          finished++;
          //. Num of finished threads is equal to num of started threads
          if (finished == threads && !download_canceled) {
            const outputPath = path + `\\${filename}`;

            let inputPathList = [];
            //. Add Thread to Threads list
            for (let i = 0; i < threads; i++) {
              inputPathList.push(path + `\\downloadingthread${i}.thread`);
            }

            //. Merge files into one
            const status = await merge_files(inputPathList, outputPath);
            console.log(status);

            clear_thread_files(path, threads);
            console.log("[THREADED_DWNLD] - Finished");
            //. 1 - success
            resolve(path);
          }
        })
        .catch((err) => console.log(err));
    }
  })
}

function fool_github_into_thinking_i_am_a_good_person(url)
{
  return new Promise((resolve, reject) => {
    console.log(`Faking download from: ${url}`);

    let req = request({
        method: 'GET',
        uri: url
    });

    let fooling = setTimeout(() => {
      req.abort();
      resolve();
    }, 3000)
  });
}

function clear_thread_files(path, threads)
{
  for (let i = 0; i < threads; i++)
  {
    if (fs.pathExistsSync(path + `\\downloadingthread${i}.thread`)) fs.unlinkSync(path + `\\downloadingthread${i}.thread`);
  }
}

function get_total_download_size(url)
{
  return new Promise(async (resolve, reject) => {
    let finally_got_that_size_from_github = false;
    let requests = 0;
    while(!finally_got_that_size_from_github && downloading_item)
    {
      requests++;
      if (requests > 20)
      {
        console.log('Github is being stubborn, lets try fooling it...');
        finally_got_that_size_from_github = true;
        resolve(-1);
        break;
      }
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
            if (data.headers['content-length'] != undefined && data.headers['content-length'] > 16)
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

function check_link(username, type)
{
  return new Promise((resolve, reject) => {
    console.log(`[GETLNK] Getting link for ${username}`);
    let req = request({
      method: 'POST',
      data: {
        type: type
      },
      uri: url
    });

    req.on('response', data => {
      console.log(`[GETLNK] ${JSON.stringify()}`);
      if (!data.headers || data.headers[0] == 'HTTP/1.1 404 Not Found' || data.headers['x-content-type-options'] == undefined) {
        resolve(false);
      } else {
        resolve(true);
      }
      req.abort();
    });
  });
}

ipcMain.on('get-link', async (event, {username, type}) => {
  let res = await check_link(username, type);
  console.log(`[GETLNK] Got link for: ${username}`);
  event.reply('got-link', res);
});

ipcMain.on('download-from-link', async (event, {threads, path, url, filename}) => {
  if (downloading_item)
  {
    console.log('another download is in progress...');
    event.reply('download-failed', 'download in progress'); 
  }
  //. Save variable to know progress
  console.log(`Downloading from: ${url}`);
  current_num_of_threads = threads;
  current_download_path = path;
  downloading_item = true;
  
  let total_bytes = await get_total_download_size(url);

  //. Github has sent size properly.
  if (total_bytes > 16)
  {
    event.reply('got-download-size');

    threaded_download(event, url, path, filename, threads, total_bytes)
    //. Download is finished
    .then(async res => {
      console.log(`threaded download is finished. res: ${res}`);
      event.reply('download-completed');
    }).catch(err => console.log(err))
  }
  //. Github hasn't sent size properly. wait and retry...
  else
  {
    await fool_github_into_thinking_i_am_a_good_person(url);

    //. In theory, it should give me size now

    let total_bytes = await get_total_download_size(url);
    event.reply('got-download-size');

    threaded_download(event, url, path, filename, threads, total_bytes)
    //. Download is finished
    .then(async res => {
      console.log(`threaded download is finished. res: ${res}`);
      event.reply('download-completed');
    }).catch(err => console.log(err))
  }
});

ipcMain.on('cancel-current-download', async (event, reason) => {

  // We can't cancel if we don't download anything D:
  console.log(`Download is cancelled. Reason: ${reason}`);
  await cancel_current_download();
  download_canceled = false;
  event.reply('download-cancelled', 'success'); 
});
//#endregion

//#region //. User info
ipcMain.on('update-user-info', (event, { info, password }) => {

    // overwrites userInfo variable to info
    userInfo = info;
    keytar.setPassword('Delta', info['username'], password);
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
let client = require('discord-rich-presence')('732236615153483877');
let presence = {
  state: 'Разработка',
  details: 'Запуск',
  startTimestamp: Date.now(),
  largeImageKey: 'rp_start_2',
  instance: false,
  joinSecret: 'starting_app',
  partyId: "delta",
  partySize: 1,
  partyMax: 2,
};

client.on('join', message => {
  console.log(message);
  win.webContents.send('message', `RPC join: ${message}`);
  win.webContents.send('rpc-join', {server: message});
});

client.on('connected', message => {
  console.log('RPC connected');
  win.webContents.send('message', 'RPC connected');
});

client.on('error', err => {
  console.log(`RPC Error: ${err}`);
  win.webContents.send('message', `RPC Error: ${err}`);
});

client.on('joinRequest', message => {
  console.log(message);
  win.webContents.send('message', { 'RPC join request': message });
});

client.on('spectate', message => {
  console.log(message);
  win.webContents.send('message', `RPC spectate: ${message}`);
});

ipcMain.on('ping', (event, pong) => {
  win.webContents.send('message', pong);
});

client.updatePresence(presence);

ipcMain.on('rich-presence-to', (event, key) => {
  client.updatePresence(Object.assign(presence, key));
  event.returnValue = 0;
});

ipcMain.on('rich-presence-disconnect', (event, reason) => {
  console.log(reason);
  client.disconnect();
  event.returnValue = 0;
});

ipcMain.on('rich-presence-revive', (event, reason) => {
  console.log(reason);
  client = require('discord-rich-presence')('732236615153483877');
  event.returnValue = 0;
});

ipcMain.on('get-rpc', (event, reason) => {
  event.returnValue = presence;
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
