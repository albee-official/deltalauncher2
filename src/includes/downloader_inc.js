const AdmZip = require('adm-zip');
const rimraf = require('rimraf');

// Links to download modpacks. Not very safe, tho it works!
const modlinks = {
    libs: 'https://github.com/Avandelta/Libraries/archive/master.zip',

    magicae: "https://github.com/Avandelta/Magicae/archive/master.zip",
    fabrica: "https://github.com/Avandelta/Fabrica/archive/master.zip",
    statera: "https://github.com/Avandelta/Statera/archive/master.zip",
    insula: "https://github.com/Avandelta/Insula/archive/master.zip",
    testsborka: "https://github.com/SuperMegaKeks/testsborka/archive/master.zip",
};

const modpack_sizes = {
    libs: 220000000,

    magicae: 265290751,
    fabrica: 193104345,
    statera: 245793651,
    insula: 392821086,
    testsborka: 200000000,
}

function Capitalize_First_Letter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function download_from_github_illegally(folder, item_name, onProgress) {
    // Returns promise cuz you know.. download isn't instant.
    return new Promise(async (resolve, reject) => {
        let zip_path = folder + '\\modpack.zip';

        // If zip exists, we don't need to redownload it :D
        if (fs.pathExistsSync(zip_path)) {
            // FINISH IT! (puts mods where they should be and deletes extras)
            await process_modpack(folder, item_name);
            await clean_up(folder + `\\${item_name}-master`, zip_path);
            resolve(folder);
        }
        else
        {
            // Sends message to MAIN to download modpack from url
            ipcRenderer.send('download-from-link', {
                path: folder,
                url: modlinks[item_name]
            });

            // Redirects reply on progress to caller of the function
            ipcRenderer.on('download-progress', (event, progress) => {
                if (progress.totalBytes == 0 || progress.totalBytes == undefined || progress.totalBytes == null)
                {
                    progress.totalBytes = modpack_sizes[item_name];
                    progress.percent = progress.transferredBytes / modpack_sizes[item_name];
                }
                onProgress(progress);
            });

            // Unzipps after download is completed
            ipcRenderer.on('download-completed', async (event, url) => {
                let modpack_p = document.querySelector('#modpack-paragraph');
                let role_p = document.querySelector('#role-par');
                
                console.log(`download completed: ${url}`);
                console.log('Unzipping...');

                // Unzip downloaded file
                modpack_p.innerHTML = 'Завершение: Распаковка файлов...';
                role_p.innerHTML = 'Не выключайте лаунчер!';
                await extract_zip(zip_path, folder);

                if (item_name == 'libs')
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    modpack_p.innerHTML = 'Завершение: Перенос файлов...';
                    await process_libs(folder);
                    modpack_p.innerHTML = 'Завершение: Удаление архива загрузки...';
                    await clean_up(folder + `\\Libraries-master`, zip_path);
                    resolve(folder);
                }
                else
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    modpack_p.innerHTML = 'Завершение: Перенос файлов...';
                    await process_modpack(folder, item_name);
                    modpack_p.innerHTML = 'Завершение: Удаление архива загрузки...';
                    await clean_up(folder + `\\${item_name}-master`, zip_path);
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

async function process_modpack(modpack_folder, modpack_name) {
    return new Promise((resolve, reject) => {
        console.log('Finishing...');

        console.log(`Moving: ${modpack_folder + `\\${modpack_name}-master`} to ${modpack_folder}`);

        // Copy files from downloaded -master folder to new one
        fs.moveSync(modpack_folder + `\\${modpack_name}-master\\asm`, modpack_folder + `\\asm`);
        fs.moveSync(modpack_folder + `\\${modpack_name}-master\\mods`, modpack_folder + `\\mods`);
        fs.moveSync(modpack_folder + `\\${modpack_name}-master\\resourcepacks`, modpack_folder + `\\resourcepacks`);
        fs.moveSync(modpack_folder + `\\${modpack_name}-master\\settings`, modpack_folder + `\\settings`);
        fs.moveSync(modpack_folder + `\\${modpack_name}-master\\config`, modpack_folder + `\\config`);

        fs.copySync(modpack_folder + `\\${modpack_name}-master\\knownkeys.txt`, modpack_folder + `\\knownkeys.txt`);

        resolve(modpack_folder);

        console.log('Modes moved');
    });
}

async function process_libs(libs_folder) {
    return new Promise((resolve, reject) => {
        console.log('Finishing...');

        console.log(`Moving libs...`);
        fs.moveSync(libs_folder + `\\Libraries-master\\assets`, libs_folder + `\\assets`);
        fs.moveSync(libs_folder + `\\Libraries-master\\libraries`, libs_folder + `\\libraries`);
        fs.moveSync(libs_folder + `\\Libraries-master\\versions`, libs_folder + `\\versions`);
        console.log('All libs moved!');

        resolve(libs_folder);

        console.log('Libs processing done!');
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

        // removes downloaded folder (folder from zip)
        rimraf.sync(downloaded_folder);

        console.log('All Clear! Ready to launch. Resolving...');
    });

    console.log('All Clear!');
}

function init_ipc() {

}