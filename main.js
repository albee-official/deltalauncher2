const { app, BrowserWindow, ipcMain, Tray, Menu } = require("electron");
const { spawn } = require('child_process');
const { autoUpdater } = require("electron-updater");
const { data } = require("jquery");
const path = require("path");
const os = require('os');
const fs = require('fs-extra');
const keytar = require('keytar');
const request = require('request');
const merge_files = require('merge-files');
const log = require('electron-log').create('main');

//. Globals
global.launchedModpacks = {
  magicae: {
    process: undefined,
    pid: -1,
    launched: false,
    visible: false,
  },
  fabrica: {
    process: undefined,
    pid: -1,
    launched: false,
    visible: false,
  },
  insula: {
    process: undefined,
    pid: -1,
    launched: false,
    visible: false,
  },
  statera: {
    process: undefined,
    pid: -1,
    launched: false,
    visible: false,
  },
  odyssea: {
    process: undefined,
    pid: -1,
    launched: false,
    visible: false,
  },
};
global.userInfo = {};
global.rpc = {
  state: 'Разработка',
  details: 'Запуск',
  startTimestamp: Date.now(),
  largeImageKey: 'rp_start_2',
  instance: false,
  joinSecret: 'starting_app',
  partyId: "delta",
  partySize: 1,
  partyMax: 64,
};

global.sharedObject = {
  launchedModpacks: {...launchedModpacks},
  userInfo: {...userInfo},
  rpc: {...rpc},
}

//. Pre Init Logic
let os_version = os.release().split('.')[0];
log.info(`[MAIN] Running OS: ${os}`);
autoUpdater.autoDownload = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
keytar.findCredentials('Delta').then(res => {
  userInfo = res;
});

log.info('App starting...');



//#region //. App Launch and Exit -------------------------

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
    center: true,
    show: false
  });

  // and load the index.html of the app.
  win.loadFile('src/pages/start/index.html');

  win.webContents.on('win-reload', () => {
    win.hide();
  });

  win.webContents.on('did-finish-load', function() {
    win.show();
  });


  // Open the DevTools.
  //*   win.webContents.openDevTools()

  win.webContents.on('devtools-opened', err => {
    BrowserWindow.getAllWindows()[0].send('devtools-opened');
    log.info('[MAIN] console opened');
    // win.webContents.closeDevTools();
  });
}

function createTray() {
  let appIcon = new Tray(path.join(__dirname, 'icon.ico'));
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
  });

  appIcon.on('click', e => {
    e.preventDefault();
  });
  
  appIcon.on('right-click', e => {
    e.preventDefault();
  });
  
  appIcon.setToolTip('Delta');
  appIcon.setTitle('Delta');
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}

let tray = undefined;
app.whenReady().then(() => {
  createWindow(); 
  tray = createTray();
});

app.commandLine.appendSwitch('js-flags', '--expose_gc --max-old-space-size=128')

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
    tray.destroy();
    tray = createTray();
  }
});
//#endregion

//#region //. IPC -----------------------------------------

//#region //. Download 
let progressUpdateInterval = undefined;;
let downloading_item = false;
let download_canceled = false;
let total_download_size = 0;
let current_num_of_threads = 0;
let current_download_path = '';
let requests = [];

function cancel_current_download()
{
  return new Promise((resolve, reject) => {
    if (progressUpdateInterval != undefined) 
    {
      clearInterval(progressUpdateInterval);
      progressUpdateInterval = undefined;
    }

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
    log.info(`[THREADLESS_DWNLD] Downloading from: ${url}`);
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

        log.info(`[THREADLESS_DWNLD] Percent: ${progress.percent}. Speed: ${(progress.speed / 1024 / 1024).toPrecision(2)}`);
        event.reply('download-progress', progress);
    });

    req.on('end', function() {
      log.info(`[THREADLESS_DWNLD] Finished Download from: ${url}`);
      resolve();
    });
  });
}

function create_download_thread({start_bytes, finish_bytes, url, path, thread_num, onData})
{ 
  return new Promise(async (resolve, reject) => {
    let thread_created_successfully = false;
    let thread_attempts = 0;
    while (!thread_created_successfully)
    {
      thread_attempts++;
      log.info(`[DWNTHRD ${thread_num}] - Attempting to create thread from: ${start_bytes} to: ${finish_bytes}. [${thread_attempts}]`);

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
            log.info(`[DWNTHRD ${thread_num}] - Got response. Size: ${data.headers['content-length']}`);
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

            log.info(`[DWNTHRD ${thread_num}] - Total data in thread: ${data.headers['content-length']}`);
        });

        req.on('data', function(chunk) {
            // Update the received bytes
            onData(chunk.length);
        });

        req.on('end', function() {
          resolve();
        });
      }).then(res => {
        resolve();
      }).catch(err => {
        log.info(`[DWNTHRD ${thread_num}] = Broken thread`);
      });
    }
  });
}

function threaded_download(event, url, path, filename, threads, total_bytes) {

  return new Promise((resolve, reject) => {
    if (threads == undefined || threads == null || threads == 0) threads = 1;

    let finished = 0;
    let biggest_percent = 0;
    let bytes_received_total = 0;
    let bytes_recieved_in_second = 0;

    progressUpdateInterval = setInterval(() => {
      let progress = {'totalBytes': 0, 'percent': 0, 'speed': 0}
      progress['totalBytes'] = total_bytes;
      progress['totalBytesReceived'] = bytes_received_total;
      progress['percent'] = (bytes_received_total / total_bytes) * 100;
      progress['speed'] = bytes_recieved_in_second * 2;

      event.reply('download-progress', progress)
      bytes_recieved_in_second = 0;
    }, 500);

    //. Split By Chunks of Data
    for (let i = 0; i < threads; i++) {

      let chunk_start = Math.floor((total_bytes / threads) * i);
      if (i > 0) chunk_start++;
      let chunk_finish = Math.floor((total_bytes / threads) * (i + 1));

      //. Create download thread
      create_download_thread({
        start_bytes: chunk_start,
        finish_bytes: chunk_finish,
        url: url,
        path: path,
        thread_num: i,
        onData: function (received) {
          bytes_recieved_in_second += received;
          bytes_received_total += received;
        }
      }).then(async (res) => { //. When Download Thread finsihed
        log.info(`[DWNTHRD ${i}] - Finished`);
        finished++;

        //. Num of finished threads is equal to num of started threads => All threads are finished
        if (finished == threads && !download_canceled) {
          // Stop sending progress messages
          if (progressUpdateInterval != undefined) 
          {
            clearInterval(progressUpdateInterval);
            progressUpdateInterval = undefined;
          }

          const outputPath = path + `\\${filename}`;

          let inputPathList = [];

          //. Add Thread to Threads list
          for (let i = 0; i < threads; i++) {
            inputPathList.push(path + `\\downloadingthread${i}.thread`);
          }

          //. Merge files into one
          const status = await merge_files(inputPathList, outputPath);
          log.info(`[THREADED_DWNLD] Files merged: ${status}`);

          clear_thread_files(path, threads);
          log.info("[THREADED_DWNLD] - Finished");
          //. 1 - success
          resolve(path);
        }
      })
        .catch((err) => log.info(err));
    }
  })
}

function fool_github_into_thinking_i_am_a_good_person(url)
{
  return new Promise((resolve, reject) => {
    log.info(`Faking download from: ${url}`);

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
        log.info('[DNWLD] Github is being stubborn, lets try fooling it...');
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

      log.info(`[DNWLD] ${content_length}`);
      if (content_length != undefined)
      {
        finally_got_that_size_from_github = true;
        resolve(content_length);
      } 
    }
  });
}

function check_link(username, type)
{
  return new Promise((resolve, reject) => {
    log.info(`[GETLNK] Getting link for ${username}`);
    let req = request({
      method: 'POST',
      data: {
        type: type
      },
      uri: url
    });

    req.on('response', data => {
      log.info(`[GETLNK] ${JSON.stringify()}`);
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
  log.info(`[GETLNK] Got link for: ${username}`);
  event.reply('got-link', res);
});

ipcMain.on('download-from-link', async (event, {threads, path, url, filename}) => {
  if (downloading_item)
  {
    log.info('[DNWLD] another download is in progress...');
    event.reply('download-failed', 'download in progress'); 
  }
  //. Save variable to know progress
  log.info(`[DNWLD] Downloading from: ${url}`);
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
      log.info(`[THREADED_DWNLD] Threaded download is finished. res: ${res}`);
      event.reply('download-completed');
    }).catch(err => log.info(err))
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
      log.info(`[THREADED_DWNLD] Threaded download is finished. res: ${res}`);
      event.reply('download-completed');
    }).catch(err => log.info(err))
  }
});

ipcMain.on('cancel-current-download', async (event, reason) => {

  // We can't cancel if we don't download anything D:
  log.info(`[DNWLD] Download is cancelled. Reason: ${reason}`);
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

client.on('join', message => {
  log.info(`[RPC] Join message recieved: ${message}`);
  win.webContents.send('message', `RPC join: ${message}`);
  win.webContents.send('rpc-join', {server: message});
});

client.on('connected', message => {
  log.info('[RPC] RPC connected');
  win.webContents.send('message', 'RPC connected');
});

client.on('error', err => {
  log.info(`[RPC] RPC Error: ${err}`);
  win.webContents.send('message', `RPC Error: ${err}`);
});

client.on('joinRequest', message => {
  log.info(`[RPC] Join request recieved: ${message}`);
  win.webContents.send('message', { 'RPC join request': message });
});

client.on('spectate', message => {
  log.info(`[RPC] Spectate message recieved: ${message}`);
  win.webContents.send('message', `RPC spectate: ${message}`);
});

ipcMain.on('ping', (event, pong) => {
  win.webContents.send('message', pong);
});

client.updatePresence(rpc);

ipcMain.on('rpc-update', (event, args) => {
  log.info(`[RPC] Updating rpc`);
  client.updatePresence(rpc);
});

ipcMain.on('rpc-disconnect', (event, reason) => {
  log.info(`[RPC] RPC disconnected: ${reason}`);
  client.disconnect();
});

ipcMain.on('rpc-revive', (event, reason) => {
  log.info(`[RPC] RPC revived: ${reason}`);
  client = require('discord-rich-presence')('732236615153483877');
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
  } else
  {
    event.reply('already-checking-for-update');
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
  already_checking = false;
  win.webContents.send('update-not-available');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
  already_checking = false;
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
  keytar.deletePassword('Delta', userInfo['username']);
  userInfo = {};
  event.reply('succesfull logout')
});
//#endregion

//#region //. Window managment
ipcMain.on('load-main-win', (event, args) => {
  log.info('[MAIN] Opening main window');
  win_pos = win.getPosition()

  win = new BrowserWindow({
    width: 1400,
    height: 800,
    x: win_pos[0],
    y: win_pos[1],
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: 'src/res/app_icon.ico',
    frame: false,
    transparent: true,
    show: false
  });

  win.loadFile('src/pages/main/index.html');

  app.commandLine.appendSwitch('js-flags', '--expose_gc --max-old-space-size=128')

  win.webContents.on('devtools-opened', err => {
    BrowserWindow.getAllWindows()[0].send('devtools-opened');
    log.info('[MAIN] console opened');
    // win.webContents.closeDevTools();
  });

  win.webContents.on('win-reload', () => {
    win.hide();
  });

  win.webContents.on('did-finish-load', function() {
    win.show();
    
  });

  win.webContents.once('did-finish-load', function() {
    BrowserWindow.getAllWindows()[1].destroy();
    
    event.reply('main-win-opened');
    return;
  });
});
//#endregion

//#region //. Minecraft launching
ipcMain.on('modpack-launch', async (event, {settings, _modpack_name, min_mem, max_mem, game_dir, username, uuid}) => {
  let modpack_name = _modpack_name;

  if (launchedModpacks[modpack_name]['launched']) {
    event.reply('modpack-already-launched', modpack_name);
    return;
  }

  //. Vars
  let args = `-Dfml.ignoreInvalidMinecraftCertificates=true -Dfml.ignorePatchDiscrepancies=true -Djava.net.preferIPv4Stack=true -Dos.name="Windows ${os_version}" -Dos.version=${os.release().split('.')[0] + '.' + os.release().split('.')[1]} -Xmn${min_mem}M -Xmx${max_mem}M -Djava.library.path=${game_dir}\\versions\\Forge-1.12.2\\natives -cp ${game_dir}\\libraries\\net\\minecraftforge\\forge\\1.12.2-14.23.5.2854\\forge-1.12.2-14.23.5.2854.jar;${game_dir}\\libraries\\org\\ow2\\asm\\asm-debug-all\\5.2\\asm-debug-all-5.2.jar;${game_dir}\\libraries\\net\\minecraft\\launchwrapper\\1.12\\launchwrapper-1.12.jar;${game_dir}\\libraries\\org\\jline\\jline\\3.5.1\\jline-3.5.1.jar;${game_dir}\\libraries\\com\\typesafe\\akka\\akka-actor_2.11\\2.3.3\\akka-actor_2.11-2.3.3.jar;${game_dir}\\libraries\\com\\typesafe\\config\\1.2.1\\config-1.2.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-actors-migration_2.11\\1.1.0\\scala-actors-migration_2.11-1.1.0.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-compiler\\2.11.1\\scala-compiler-2.11.1.jar;${game_dir}\\libraries\\org\\scala-lang\\plugins\\scala-continuations-library_2.11\\1.0.2_mc\\scala-continuations-library_2.11-1.0.2_mc.jar;${game_dir}\\libraries\\org\\scala-lang\\plugins\\scala-continuations-plugin_2.11.1\\1.0.2_mc\\scala-continuations-plugin_2.11.1-1.0.2_mc.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-library\\2.11.1\\scala-library-2.11.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-parser-combinators_2.11\\1.0.1\\scala-parser-combinators_2.11-1.0.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-reflect\\2.11.1\\scala-reflect-2.11.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-swing_2.11\\1.0.1\\scala-swing_2.11-1.0.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-xml_2.11\\1.0.2\\scala-xml_2.11-1.0.2.jar;${game_dir}\\libraries\\lzma\\lzma\\0.0.1\\lzma-0.0.1.jar;${game_dir}\\libraries\\java3d\\vecmath\\1.5.2\\vecmath-1.5.2.jar;${game_dir}\\libraries\\net\\sf\\trove4j\\trove4j\\3.0.3\\trove4j-3.0.3.jar;${game_dir}\\libraries\\org\\apache\\maven\\maven-artifact\\3.5.3\\maven-artifact-3.5.3.jar;${game_dir}\\libraries\\net\\sf\\jopt-simple\\jopt-simple\\5.0.3\\jopt-simple-5.0.3.jar;${game_dir}\\libraries\\org\\patcher\\patchy\\1.1\\patchy-1.1.jar;${game_dir}\\libraries\\oshi-project\\oshi-core\\1.1\\oshi-core-1.1.jar;${game_dir}\\libraries\\net\\java\\dev\\jna\\jna\\4.4.0\\jna-4.4.0.jar;${game_dir}\\libraries\\net\\java\\dev\\jna\\platform\\3.4.0\\platform-3.4.0.jar;${game_dir}\\libraries\\com\\ibm\\icu\\icu4j-core-mojang\\51.2\\icu4j-core-mojang-51.2.jar;${game_dir}\\libraries\\net\\sf\\jopt-simple\\jopt-simple\\5.0.3\\jopt-simple-5.0.3.jar;${game_dir}\\libraries\\com\\paulscode\\codecjorbis\\20101023\\codecjorbis-20101023.jar;${game_dir}\\libraries\\com\\paulscode\\codecwav\\20101023\\codecwav-20101023.jar;${game_dir}\\libraries\\com\\paulscode\\libraryjavasound\\20101123\\libraryjavasound-20101123.jar;${game_dir}\\libraries\\com\\paulscode\\librarylwjglopenal\\20100824\\librarylwjglopenal-20100824.jar;${game_dir}\\libraries\\com\\paulscode\\soundsystem\\20120107\\soundsystem-20120107.jar;${game_dir}\\libraries\\io\\netty\\netty-all\\4.1.9.Final\\netty-all-4.1.9.Final.jar;${game_dir}\\libraries\\com\\google\\guava\\guava\\21.0\\guava-21.0.jar;${game_dir}\\libraries\\org\\apache\\commons\\commons-lang3\\3.5\\commons-lang3-3.5.jar;${game_dir}\\libraries\\commons-io\\commons-io\\2.5\\commons-io-2.5.jar;${game_dir}\\libraries\\commons-codec\\commons-codec\\1.10\\commons-codec-1.10.jar;${game_dir}\\libraries\\net\\java\\jinput\\jinput\\2.0.5\\jinput-2.0.5.jar;${game_dir}\\libraries\\net\\java\\jutils\\jutils\\1.0.0\\jutils-1.0.0.jar;${game_dir}\\libraries\\com\\google\\code\\gson\\gson\\2.8.0\\gson-2.8.0.jar;${game_dir}\\libraries\\org\\patcher\\authlib\\1.6.25\\authlib-1.6.25.jar;${game_dir}\\libraries\\com\\mojang\\realms\\1.10.22\\realms-1.10.22.jar;${game_dir}\\libraries\\org\\apache\\commons\\commons-compress\\1.8.1\\commons-compress-1.8.1.jar;${game_dir}\\libraries\\org\\apache\\httpcomponents\\httpclient\\4.3.3\\httpclient-4.3.3.jar;${game_dir}\\libraries\\commons-logging\\commons-logging\\1.1.3\\commons-logging-1.1.3.jar;${game_dir}\\libraries\\org\\apache\\httpcomponents\\httpcore\\4.3.2\\httpcore-4.3.2.jar;${game_dir}\\libraries\\it\\unimi\\dsi\\fastutil\\7.1.0\\fastutil-7.1.0.jar;${game_dir}\\libraries\\org\\apache\\logging\\log4j\\log4j-api\\2.8.1\\log4j-api-2.8.1.jar;${game_dir}\\libraries\\org\\apache\\logging\\log4j\\log4j-core\\2.8.1\\log4j-core-2.8.1.jar;${game_dir}\\libraries\\org\\lwjgl\\lwjgl\\lwjgl\\2.9.4-nightly-20150209\\lwjgl-2.9.4-nightly-20150209.jar;${game_dir}\\libraries\\org\\lwjgl\\lwjgl\\lwjgl_util\\2.9.4-nightly-20150209\\lwjgl_util-2.9.4-nightly-20150209.jar;${game_dir}\\libraries\\com\\mojang\\text2speech\\1.10.3\\text2speech-1.10.3.jar;${game_dir}\\versions\\Forge-1.12.2\\Forge-1.12.2.jar -Dminecraft.applet.TargetDirectory=${game_dir} -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M -Dfml.ignoreInvalidMinecraftCertificates=true -Dfml.ignorePatchDiscrepancies=true net.minecraft.launchwrapper.Launch --username ${username} --version Forge-1.12.2 --gameDir ${game_dir} --assetsDir ${game_dir}\\assets --assetIndex 1.12 --uuid ${uuid} --accessToken null --tweakClass net.minecraftforge.fml.common.launcher.FMLTweaker --versionType Forge --width 925 --height 530`;

  args = integrate_java_parameters(settings, args);
  let cd_path = game_dir;
  let java_path = await get_latest_java_version_path(settings);
  let final_command = `${game_dir[0]}:&&cd "${cd_path}"&&"${java_path}" ${args}`;
  
  //. Spawn and run console line that starts minecraft
  win.webContents.send('modpack-log', `[LAUNCH] [${modpack_name.toUpperCase()}] ${final_command}`);

  launchedModpacks[modpack_name]['process'] = spawn(final_command, [], { 
      windowsHide: true,
      maxBuffer: 1024 * 1024 * 1024,
      shell: true
  }, err => {
      if (!err) return; //# if return if launch encountered some error

      win.webContents.send('modpack-update');
  });

  launchedModpacks[modpack_name]['pid'] = launchedModpacks[modpack_name]['process'].pid;
  launchedModpacks[modpack_name]['launched'] = true;

  launchedModpacks[modpack_name]['process'].stdout.on('data', data => {

      if (settings['link_consoles']) {
        win.webContents.send('modpack-log', `[LAUNCH] <${modpack_name.toUpperCase()}> ${data.toString()}`);
      }

      if (data.toString().split('Starts to replace vanilla recipe ingredients with ore ingredients.').length > 1)
      {
          launchedModpacks[modpack_name]['visible'] = true;

          if (BrowserWindow.getFocusedWindow() != undefined && BrowserWindow.getFocusedWindow() != null && settings['hide_upon_launch'])
          {
            BrowserWindow.getFocusedWindow().minimize();
          }

          win.webContents.send('modpack-update');
      }

      if (data.toString().split('The game loaded in approximately').length > 1)
      {
        win.webContents.send('modpack-log', '[LAUNCH] Game window opened');

          rpc = {
              ...rpc,
              details: `Запускает: ${Capitalize_First_Letter(modpack_name)}`,
          };

          win.webContents.send('modpack-update');
      }
  });
  
  launchedModpacks[modpack_name]['process'].stderr.setEncoding('utf8');
  launchedModpacks[modpack_name]['process'].stderr.on('data', data => {
    win.webContents.send('modpack-log', data.toString());
  });
  
  launchedModpacks[modpack_name]['process'].on('exit', error => {
      if (error) win.webContents.send('modpack-log', `[LAUNCH] ${error}`);

      if (error) {
          win.webContents.send('modpack-exit', {modpack_name: modpack_name, code: error, error: true});
      }

      win.webContents.send('modpack-exit', {modpack_name: modpack_name, code: 'minecraft exit', error: false});

      launchedModpacks[modpack_name]['process'] = undefined;
      launchedModpacks[modpack_name]['pid'] = -1;
      launchedModpacks[modpack_name]['launched'] = false;
      launchedModpacks[modpack_name]['visible'] = false;
  });
});

function integrate_java_parameters(settings, command)
{
    let pars = settings['java_parameters'];
    let pars_arr = pars.split(' ');

    for (let parameter of pars_arr)
    {
        if (parameter.charAt(0) != '-') continue;

        if (parameter.includes('-Xmx'))
        {
            let par_prototype = `-Xmx${settings['allocated_memory'] * 1024}M`;
            log.info(`[LAUNCH] ${par_prototype}`);
            log.info(`[LAUNCH] ${parameter}`);
            command = command.replace(par_prototype, parameter);
            continue;
        }
        else if (parameter.includes('-Xms'))
        {
            let par_prototype = `-Xms1000M`;
            log.info(`[LAUNCH] ${par_prototype}`);
            log.info(`[LAUNCH] ${parameter}`);
            command = command.replace(par_prototype, parameter);
            continue;
        }
        else if (parameter.includes('-username')) { continue; }
        else if (parameter.includes('-uuid')) { continue; }
        else
        {
            command += ' ' + parameter;
        }
    }
    
    return command;
}

function get_latest_java_version_path(settings)
{
    return new Promise(async (resolve, reject) => {
        let installed_java = await get_installed_java_path();
        if (installed_java == 'No java found')
        {
            if (os.arch() == 'x64')
            {
                log.info(`[LAUNCH] Latest java: ${path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime-windows-x64\\bin\\javaw.exe')}`);
                resolve(path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime-windows-x64\\bin\\javaw.exe'));
            }
            else
            {
                log.info(`[LAUNCH] Latest java: ${path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime\\bin\\javaw.exe')}`);
                resolve(path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime\\bin\\javaw.exe'));
            }
        }
        else
        {
            resolve(installed_java);
        }
    });
}

function get_installed_java_path(settings)
{
    return new Promise(async (resolve, reject) => {
        if ((await fs.readdir('C:\\Program Files')).includes('Java') )
        {
            resolve(`C:\\Program Files\\Java\\${(await fs.readdir('C:\\Program Files\\Java'))[0]}\\bin\\javaw.exe`);
        }
        else if ((await fs.readdir('C:\\Program Files (x86)')).includes('Java'))
        {
            resolve(`C:\\Program Files (x86)\\Java\\${(await fs.readdir('C:\\Program Files (x86)\\Java'))[0]}\\bin\\javaw.exe`);
        }
        else
        {
            resolve('No java found');
        }
    });
}

//#endregion

function Capitalize_First_Letter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
