const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const { log } = require('electron-log');
const { DownloadItem } = require('electron');

const modlinks = {
    libraries: "https://github.com/Avandelta/Libraries/archive/main.zip",
    magicae: "https://github.com/Avandelta/Magicae/archive/main.zip",
    fabrica: "https://github.com/Avandelta/Fabrica/archive/main.zip",
    statera: "https://github.com/Avandelta/Statera/archive/main.zip",
    insula: "https://github.com/Avandelta/Insula/archive/main.zip",
    odyssea: "https://github.com/Avandelta/Odyssea/archive/main.zip",
    testsborka: "https://github.com/SuperMegaKeks/testsborka/archive/main.zip",
};

const modpack_versions = {
    magicae: '1.12.2',
    fabrica: '1.12.2',
    statera: '1.12.2',
    insula: '1.12.2',
    odyssea: '1.12.2',
    testsborka: '1.12.2',
};

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

async function download_from_github_illegally(folder, item_name, onProgress, version = '', updating = false) {
    // Returns promise cuz you know.. download isn't instant.
    return new Promise(async (resolve, reject) => {

        let modpack_p = document.querySelector('#modpack-paragraph');
        let role_p = document.querySelector('#role-par');
        let download_url = '';

        console.log(item_name);
        let latest_release;
        latest_release = await get_latest_release(Capitalize_First_Letter(item_name));
        download_url = `https://github.com/Avandelta/${Capitalize_First_Letter(item_name)}/releases/download/${latest_release['name']}/${Capitalize_First_Letter(item_name)}-${latest_release['name']}.zip`;
        console.log(`Downloading release: ${latest_release['name']}`);
        
        modpack_p.innerHTML = `Начинаем загрузку: ${Capitalize_First_Letter(item_name)}`;
        role_p.innerHTML = `Ожидание ответа сервера ${LOADING_SPAN}`;

        await set_item_version_to_info(item_name, latest_release['name']);
        
        let zip_path = folder + '\\modpack.zip';

        // If zip exists, we don't need to redownload it :D
        if ((await fs.pathExists(zip_path))) {
            if (item_name == 'libraries')
            {
                // // FINISH IT! (puts mods where they should be and deletes extras)
                // modpack_p.innerHTML = `Завершение: Перенос файлов ${LOADING_SPAN}`;
                // await process_libs(folder);

                modpack_p.innerHTML = `Завершение: Удаление архива загрузки ${LOADING_SPAN}`;c
                await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);
                console.log(item_name);
                resolve(folder);
            }
            else
            {
                // // FINISH IT! (puts mods where they should be and deletes extras)
                // modpack_p.innerHTML = `Завершение: Перенос файлов ${LOADING_SPAN}`;
                // await process_modpack(folder, item_name);

                modpack_p.innerHTML = `Завершение: Удаление архива загрузки ${LOADING_SPAN}`;
                await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);

                modpack_p.innerHTML = `Завершение: Перенос библиотек ${LOADING_SPAN}`;
                await copy_libs_to_modpack(item_name);
                console.log(item_name);
                resolve(folder);
            }
        }
        else
        {
            let threads = 8;

            // Sends message to MAIN to download modpack from url
            ipcRenderer.send('download-from-link', {
                threads: threads,
                path: folder,
                url: download_url,
                filename: 'modpack.zip'
            });


            ipcRenderer.on('got-download-size', (event) => {
                // Finally got some size
            }); 

            ipcRenderer.on('download-cancelled', (event) => {
                // Download cancelled
            }); 

            // Redirects reply on progress to caller of the function
            ipcRenderer.on('download-progress', (event, progress) => {
                onProgress(progress);
            });

            // Unzipps after download is completed
            ipcRenderer.on('download-completed', async (event, url) => {
                
                console.log(`download completed: ${url}`);
                console.log('Unzipping...');

                // Unzip downloaded file
                modpack_p.innerHTML = `Завершение: Распаковка файлов ${LOADING_SPAN}`;
                role_p.innerHTML = 'Не закрывайте лаунчер!';
                await extract_zip(zip_path, folder);

                if (item_name == 'libraries')
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    deactivatePlayButton();
                    modpack_p.innerHTML = `Завершение: Удаление архива загрузки ${LOADING_SPAN}`;
                    await clean_up(zip_path);
                    console.log(`[DOWMLOAD] Downloaded: ${item_name}`);
                    resolve(folder);
                }
                else
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    deactivatePlayButton();
                    modpack_p.innerHTML = `Завершение: Удаление архива загрузки ${LOADING_SPAN}`;
                    await clean_up(zip_path);

                    modpack_p.innerHTML = `Завершение: Перенос библиотек ${LOADING_SPAN}`;
                    await copy_libs_to_modpack(item_name);
                    console.log(`[DOWMLOAD] Downloaded: ${item_name}`);
                    resolve(folder);
                }
            });
        }
    });
}

async function extract_zip(zip_path, to) {
    return new Promise((resolve, reject) => {
        console.log(`[DOWNLOADER] Extracting: ${zip_path} to ${to}`);
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
        console.log('Moving: CustomSkinLoader...');
        await fs.move(sub_folder + `\\CustomSkinLoader`, modpack_folder + `\\CustomSkinLoader`);
        document.querySelector('.download-filler').style.width = `10%`;

        // console.log('Moving: Graphics...');
        // await fs.move(sub_folder + `\\options`, modpack_folder + `\\options`);
        console.log('Moving: options...');
        await fs.move(sub_folder + `\\options`, modpack_folder + `\\options`);
        document.querySelector('.download-filler').style.width = `20%`;

        console.log('Moving: asm...');
        await fs.move(sub_folder + `\\asm`, modpack_folder + `\\asm`);
        document.querySelector('.download-filler').style.width = `30%`;

        console.log('Moving: config...');
        await fs.move(sub_folder + `\\config`, modpack_folder + `\\config`);
        document.querySelector('.download-filler').style.width = `40%`;

        console.log('Moving: mods...');
        await fs.move(sub_folder + `\\mods`, modpack_folder + `\\mods`);
        document.querySelector('.download-filler').style.width = `50%`;

        console.log('Moving: resourcepacks...');
        await fs.move(sub_folder + `\\resourcepacks`, modpack_folder + `\\resourcepacks`);
        document.querySelector('.download-filler').style.width = `60%`;

        console.log('Moving: scripts...');
        await fs.move(sub_folder + `\\scripts`, modpack_folder + `\\scripts`);
        document.querySelector('.download-filler').style.width = `70%`;

        console.log('Moving: knownkeys.txt...');
        await fs.copy(sub_folder + `\\knownkeys.txt`, modpack_folder + `\\knownkeys.txt`);
        document.querySelector('.download-filler').style.width = `85%`;

        console.log('Moving: .ReAuth.cfg...');
        await fs.copy(sub_folder + `\\.ReAuth.cfg`, modpack_folder + `\\.ReAuth.cfg`);
        document.querySelector('.download-filler').style.width = `100%`;

        console.log('Modes processing done!');
        resolve(modpack_folder);
    });
}

async function process_libs(libs_folder, found_folder) {
    return new Promise(async (resolve, reject) => {
        console.log('Finishing...');

        let sub_folder = libs_folder + '\\' + found_folder;
        console.log(`Moving: ${sub_folder} to ${libs_folder}`);

        // Copy files from downloaded folder to new one
        console.log('Moving: assets...');
        await fs.move(sub_folder + `\\assets`, libs_folder + `\\assets`);
        document.querySelector('.download-filler').style.width = `30%`;

        console.log('Moving: libraries...');
        await fs.move(sub_folder + `\\libraries`, libs_folder + `\\libraries`);
        document.querySelector('.download-filler').style.width = `65%`;

        console.log('Moving: versions...');
        await fs.move(sub_folder + `\\versions`, libs_folder + `\\versions`);
        document.querySelector('.download-filler').style.width = `100%`;

        console.log('Libs processing done!');
        resolve(sub_folder);
    });
}

async function clean_up(zip_path)
{
    return new Promise((resolve, reject) => {
        console.log('Cleaning up...');
        // Deletes leftovers
        fs.unlink(zip_path, err => {
            if (err) {
                console.warn(err);
                reject(err);
            }
        });

        console.log('All Clear! Ready to launch. Resolving...');
        resolve();
    })
}

async function copy_libs_to_modpack(modpack_name)
{
    let _modpack_path = verify_and_get_modpack_folder(modpack_name);

    console.log('Moving: libraries...');
    if (!(await fs.pathExists(_modpack_path + '\\libraries'))) {
        await fs.ensureDir(_modpack_path + '\\libraries');
        await copyWithProgress(libs_path + '\\' + modpack_versions[modpack_name] + '\\libraries', _modpack_path + '\\libraries', {
            onProgress: (progress) => {
                document.querySelector('.download-filler').style.width = `${progress.progress * 30}%`;
            },
            interval: 250,
        });   
    }

    console.log('Moving: assets...');
    if (!(await fs.pathExists(_modpack_path + '\\assets'))) {
        await fs.ensureDir(_modpack_path + '\\assets');
        await copyWithProgress(libs_path + '\\' + modpack_versions[modpack_name] + '\\assets', _modpack_path + '\\assets', {
            onProgress: (progress) => {
                document.querySelector('.download-filler').style.width = `${30 + (progress.progress * 35)}%`;
            },
            interval: 250,
        });   
    }

    console.log('Moving: versions...');
    if (!(await fs.pathExists(_modpack_path + '\\versions'))) {
        await fs.ensureDir(_modpack_path + '\\versions');
        await copyWithProgress(libs_path + '\\' + modpack_versions[modpack_name] + '\\versions', _modpack_path + '\\versions', {
            onProgress: (progress) => {
                document.querySelector('.download-filler').style.width = `${65 + (progress.progress * 35)}%`;
            },
            interval: 250,
        });   
    }
}


function init_ipc() {

}