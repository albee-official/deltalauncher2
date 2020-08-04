const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const { log } = require('electron-log');

// Links to download modpacks. Not very safe, tho it works!
const modlinks = {
    libraries: 'https://github.com/Avandelta/Libraries/archive/master.zip',

    magicae: "https://github.com/Avandelta/Magicae/archive/master.zip",
    fabrica: "https://github.com/Avandelta/Fabrica/archive/master.zip",
    statera: "https://github.com/Avandelta/Statera/archive/master.zip",
    insula: "https://github.com/Avandelta/Insula/archive/master.zip",
    testsborka: "https://github.com/SuperMegaKeks/testsborka/archive/master.zip",
};

const modpack_sizes = {
    libraries: 220000000,

    magicae: 265290751,
    fabrica: 193104345,
    statera: 245793651,
    insula: 392821086,
    testsborka: 200000000,
}

function get_latest_release(item_name)
{
    return new Promise((resolve, reject) => {
        ajax({
            url: `https://api.github.com/repos/Avandelta/${Capitalize_First_Letter(item_name)}/tags`,
            method: 'GET',
            dataType: 'json'
        }).done(res => {
            resolve(res[0]);
        });
    })
}

function Capitalize_First_Letter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function download_from_github_illegally(folder, item_name, onProgress) {
    // Returns promise cuz you know.. download isn't instant.
    return new Promise(async (resolve, reject) => {

        console.log(item_name);
        let latest_release;
        latest_release = await get_latest_release(Capitalize_First_Letter(item_name));
        console.log(`Downloading release: ${latest_release['name']}`);

        let modpack_p = document.querySelector('#modpack-paragraph');
        let role_p = document.querySelector('#role-par');
        
        modpack_p.innerHTML = `Начинаем загрузку: ${item_name}`;
        role_p.innerHTML = 'Ожидание ответа сервера';

        await set_modpack_version_to_info(item_name, latest_release['name']);

        let zip_path = folder + '\\modpack.zip';

        // If zip exists, we don't need to redownload it :D
        if ((await fs.pathExists(zip_path))) {
            if (item_name == 'libraries')
            {
                // FINISH IT! (puts mods where they should be and deletes extras)
                modpack_p.innerHTML = 'Завершение: Перенос файлов...';
                await process_libs(folder);
                modpack_p.innerHTML = 'Завершение: Удаление архива загрузки...';
                await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);
                console.log(item_name);
                resolve(folder);
            }
            else
            {
                // FINISH IT! (puts mods where they should be and deletes extras)
                modpack_p.innerHTML = 'Завершение: Перенос файлов...';
                await process_modpack(folder, item_name);
                modpack_p.innerHTML = 'Завершение: Удаление архива загрузки...';
                await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);
                console.log(item_name);
                resolve(folder);
            }
        }
        else
        {
            let download_url = modlinks[item_name];

            let threads = 8;
            if (document.querySelector('#play-button-assist-cb').checked)
            {
                threads = 16;
            }

            // Sends message to MAIN to download modpack from url
            ipcRenderer.send('download-from-link', {
                threads: threads,
                path: folder,
                url: download_url,
                filename: 'modpack.zip'
            });

            let progress = {totalBytes: 0, percent: 0, speed: 0};
            let speed_update;

            ipcRenderer.on('got-download-size', (event) => {
                speed_update = setInterval(() => {
                    progress.speed = (progress.speed / 1024 / 1024 * 8 * 10).toPrecision(2);
                    onProgress(progress);
                    progress = {totalBytes: 0, percent: 0, speed: 0};
                }, 100);
            }); 

            ipcRenderer.on('download-cancelled', (event) => {
                clearInterval(speed_update);
            }); 

            // Redirects reply on progress to caller of the function
            ipcRenderer.on('download-progress', (event, _progress) => {
                progress['totalBytes'] += _progress['totalBytes'];
                if (_progress['percent'] > progress['percent'])
                {
                    progress['percent'] = _progress['percent'];
                }
                progress['speed'] += _progress['speed'];
            });

            // Unzipps after download is completed
            ipcRenderer.on('download-completed', async (event, url) => {
                
                console.log(`download completed: ${url}`);
                console.log('Unzipping...');

                clearTimeout(speed_update);

                // Unzip downloaded file
                modpack_p.innerHTML = 'Завершение: Распаковка файлов...';
                role_p.innerHTML = 'Не выключайте лаунчер!';
                await extract_zip(zip_path, folder);

                if (item_name == 'libraries')
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    modpack_p.innerHTML = 'Завершение: Перенос файлов...';
                    let folders = fs.readdirSync(folder);
                    let found_folder;
                    for (let el of folders)
                    {
                        if (el.startsWith(Capitalize_First_Letter(item_name)))
                        {
                            found_folder = el;
                        }
                    }
                    await process_libs(folder, found_folder);
                    modpack_p.innerHTML = 'Завершение: Удаление архива загрузки...';
                    await clean_up(folder + `\\` + found_folder, zip_path);
                    console.log(item_name);
                    resolve(folder);
                }
                else
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    modpack_p.innerHTML = 'Завершение: Перенос файлов...';
                    let folders = fs.readdirSync(folder);
                    let found_folder;
                    for (let el of folders)
                    {
                        if (el.startsWith(Capitalize_First_Letter(item_name)))
                        {
                            found_folder = el;
                        }
                    }
                    await process_modpack(folder, found_folder);
                    modpack_p.innerHTML = 'Завершение: Удаление архива загрузки...';
                    await clean_up(folder + `\\` + found_folder, zip_path);
                    console.log(item_name);
                    resolve(folder);
                }
            });
        }
    });
}

async function extract_zip(zip_path, to) {
    return new Promise((resolve, reject) => {
        var zip = new AdmZip(zip_path);
        zip.extractAllToAsync(to, true, err => {
            if (err) {
                // Some Error during unzipping progress
                console.warn(err);
                reject(err);
            }

            console.log('Unzipping done!');
            resolve(to);
        });
    });
}

function process_modpack(modpack_folder, found_folder) {
    return new Promise(async (resolve, reject) => {
        console.log('Finishing...');

        let sub_folder = modpack_folder + '\\' + found_folder;
        console.log(`Moving: ${sub_folder} to ${modpack_folder}`);

        // Copy files from downloaded folder to new one
        console.log('Moving: asm...');
        await fs.move(sub_folder + `\\asm`, modpack_folder + `\\asm`);
        
        console.log('Moving: mods...');
        await fs.move(sub_folder + `\\mods`, modpack_folder + `\\mods`);

        console.log('Moving: resourcepacks...');
        await fs.move(sub_folder + `\\resourcepacks`, modpack_folder + `\\resourcepacks`);

        console.log('Moving: settings...');
        await fs.move(sub_folder + `\\settings`, modpack_folder + `\\settings`);

        console.log('Moving: config...');
        await fs.move(sub_folder + `\\config`, modpack_folder + `\\config`);

        console.log('Moving: knownkeys.txt...');
        await fs.copy(sub_folder + `\\knownkeys.txt`, modpack_folder + `\\knownkeys.txt`);

        console.log('Modes processing done!');
        resolve(modpack_folder);
    });
}

function process_libs(libs_folder, found_folder) {
    return new Promise(async (resolve, reject) => {
        console.log('Finishing...');

        let sub_folder = libs_folder + '\\' + found_folder;
        console.log(`Moving: ${sub_folder} to ${libs_folder}`);

        // Copy files from downloaded folder to new one
        console.log('Moving: assets...');
        fs.moveSync(sub_folder + `\\assets`, libs_folder + `\\assets`);

        console.log(fs.readdirSync(libs_folder));

        console.log('Moving: libraries...');
        fs.moveSync(sub_folder + `\\libraries`, libs_folder + `\\libraries`);

        console.log(fs.readdirSync(libs_folder));

        console.log('Moving: versions...');
        fs.moveSync(sub_folder + `\\versions`, libs_folder + `\\versions`);

        console.log(fs.readdirSync(libs_folder));
        
        console.log('Libs processing done!');
        resolve(sub_folder);
    });
}

async function clean_up(downloaded_folder, zip_path)
{
    console.log('Cleaning up...');
    // Deletes leftovers
    fs.unlink(zip_path, err => {
        if (err) {
            console.warn(err);
            reject(err);
        }
    });

    console.log(`Removing ${downloaded_folder}`);
    // removes downloaded folder (folder from zip)
    rimraf.sync(downloaded_folder);

    console.log('All Clear! Ready to launch. Resolving...');
}

function init_ipc() {

}