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

        let latest_release = await get_latest_release(item_name);
        console.log(`Downloading release: ${latest_release['name']}`);

        set_modpack_version_to_info(item_name, latest_release['name']);

        let zip_path = folder + '\\modpack.zip';

        // If zip exists, we don't need to redownload it :D
        if (fs.pathExistsSync(zip_path)) {
            // FINISH IT! (puts mods where they should be and deletes extras)
            await process_modpack(folder, item_name);
            await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);
            resolve(folder);
        }
        else
        {
            let download_url = 'https://github.com/Avandelta/Libraries/archive/master.zip';
            if (item_name != 'libs')
            {
                download_url = latest_release['zipball_url'];
            }
            // Sends message to MAIN to download modpack from url
            ipcRenderer.send('download-from-link', {
                path: folder,
                url: download_url,
                filename: 'modpack.zip'
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

        let sub_folder = modpack_folder + `\\` + fs.readdirSync(modpack_folder)[0];
        console.log(`Moving: ${sub_folder} to ${modpack_folder}`);

        // Copy files from downloaded folder to new one
        fs.moveSync(sub_folder + `\\asm`, modpack_folder + `\\asm`);
        fs.moveSync(sub_folder + `\\mods`, modpack_folder + `\\mods`);
        fs.moveSync(sub_folder + `\\resourcepacks`, modpack_folder + `\\resourcepacks`);
        fs.moveSync(sub_folder + `\\settings`, modpack_folder + `\\settings`);
        fs.moveSync(sub_folder + `\\config`, modpack_folder + `\\config`);

        fs.copySync(sub_folder + `\\knownkeys.txt`, modpack_folder + `\\knownkeys.txt`);

        resolve(modpack_folder);

        console.log('Modes moved');
    });
}

async function process_libs(libs_folder) {
    return new Promise((resolve, reject) => {
        console.log('Finishing...');

        let sub_folder = libs_folder + `\\` + fs.readdirSync(libs_folder)[0];
        console.log(`Moving: ${sub_folder} to ${libs_folder}`);

        // Copy files from downloaded folder to new one
        fs.moveSync(sub_folder + `\\assets`, libs_folder + `\\assets`);
        fs.moveSync(sub_folder + `\\libraries`, libs_folder + `\\libraries`);
        fs.moveSync(sub_folder + `\\versions`, libs_folder + `\\versions`);
        console.log('All libs moved!');

        resolve(sub_folder);

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