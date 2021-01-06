const AdmZip = require('adm-zip');
const rimraf = require('rimraf');
const { log } = require('electron-log');
const { DownloadItem } = require('electron');

// Links to download modpacks. Not very safe, tho it works!

let forge_1_12_2 = 'null-1.12.2';
let forge_1_16_1 = 'null-1.16.1';

function update_libs_links() {

    // Update links to newest versions
    require('jquery').ajax({
        url: `https://api.github.com/repos/Avandelta/Context/tags`,
        method: 'GET',
        dataType: 'json'
    }).done(res => {
        for (let version of res) {
            if (version.name.split('-')[1] == '1.12.2') {
                forge_1_12_2 = `https://github.com/Avandelta/Context/releases/download/${version.name}/Forge-1.12.2.zip`;
                break;
            }
        }

        for (let version of res) {
            if (version.name.split('-')[1] == '1.16.1') {
                forge_1_16_1 = `https://github.com/Avandelta/Context/releases/download/${version.name}/Forge-1.16.1.zip`;;
                break;
            }
        }
    });
}

update_libs_links();

const modlinks = {
    libraries: forge_1_12_2,

    magicae: "https://github.com/Avandelta/Magicae/archive/main.zip",
    fabrica: "https://github.com/Avandelta/Fabrica/archive/main.zip",
    statera: "https://github.com/Avandelta/Statera/archive/main.zip",
    insula: "https://github.com/Avandelta/Insula/archive/main.zip",
    odyssea: "https://github.com/Avandelta/Odyssea/archive/main.zip",
    testsborka: "https://github.com/SuperMegaKeks/testsborka/archive/main.zip",
};

const modpack_sizes = {
    libraries: 220000000,

    magicae: 265290751,
    fabrica: 193104345,
    statera: 245793651,
    insula: 392821086,
    odyssea: 3776000000,
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

function get_latest_libs_version(libs_version)
{
    return new Promise((resolve, reject) => {
        console.log(libs_version);
        ajax({
            url: `https://api.github.com/repos/Avandelta/Context/tags`,
            method: 'GET',
            dataType: 'json'
        }).done(res => {
            if (libs_version == '1.12.2') {
                for (let release of res) {
                    if (release.name.split('-')[1] == '1.12.2') {
                        resolve(release.name.split('-')[0]);
                    }
                }
            }

            if (libs_version == '1.16.1') {
                for (let release of res) {
                    if (release.name.split('-')[1] == '1.16.1') {
                        resolve(release.name.split('-')[0]);
                    }
                }
            }
        });
    })
}

function Capitalize_First_Letter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function download_from_github_illegally(folder, item_name, onProgress, version = '') {
    // Returns promise cuz you know.. download isn't instant.
    return new Promise(async (resolve, reject) => {

        let modpack_p = document.querySelector('#modpack-paragraph');
        let role_p = document.querySelector('#role-par');

        console.log(item_name);
        if (item_name == 'libraries')
        {
            let latest_release;
            latest_release = await get_latest_libs_version(version);
            console.log(`Downloading release: ${latest_release}`);
            
            modpack_p.innerHTML = `Начинаем загрузку: ${Capitalize_First_Letter(item_name)}`;
            role_p.innerHTML = 'Ожидание ответа сервера<span class="loading"></span>';
            update_loadings();

            await set_libs_version_to_info(item_name, latest_release, version);
        } 
        else
        {
            let latest_release;
            latest_release = await get_latest_release(Capitalize_First_Letter(item_name));
            console.log(`Downloading release: ${latest_release['name']}`);
            
            modpack_p.innerHTML = `Начинаем загрузку: ${Capitalize_First_Letter(item_name)}`;
            role_p.innerHTML = 'Ожидание ответа сервера<span class="loading"></span>';
            update_loadings();

            await set_modpack_version_to_info(item_name, latest_release['name']);
        }
        
        let zip_path = folder + '\\modpack.zip';

        // If zip exists, we don't need to redownload it :D
        if ((await fs.pathExists(zip_path))) {
            if (item_name == 'libraries')
            {
                // FINISH IT! (puts mods where they should be and deletes extras)
                modpack_p.innerHTML = 'Завершение: Перенос файлов<span class="loading"></span>';
                await process_libs(folder);
                modpack_p.innerHTML = 'Завершение: Удаление архива загрузки<span class="loading"></span>';c
                update_loadings();
                await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);
                console.log(item_name);
                resolve(folder);
            }
            else
            {
                // FINISH IT! (puts mods where they should be and deletes extras)
                modpack_p.innerHTML = 'Завершение: Перенос файлов<span class="loading"></span>';
                await process_modpack(folder, item_name);
                modpack_p.innerHTML = 'Завершение: Удаление архива загрузки<span class="loading"></span>';
                update_loadings();
                await clean_up(folder + `\\` + fs.readdirSync(folder)[0], zip_path);
                console.log(item_name);
                resolve(folder);
            }
        }
        else
        {
            let download_url = modlinks[item_name];
            if (item_name == 'libraries') {
                switch (version) {
                    case '1.12.2':
                        download_url = forge_1_12_2;
                        break;
                    
                    case '1.16.1':
                        download_url = forge_1_16_1;
                        break;
                
                    default:
                        download_url = forge_1_12_2;
                        break;
                }
            }

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
                modpack_p.innerHTML = 'Завершение: Распаковка файлов<span class="loading"></span>';
                update_loadings();
                role_p.innerHTML = 'Не выключайте лаунчер!';
                await extract_zip(zip_path, folder);

                if (item_name == 'libraries')
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    modpack_p.innerHTML = 'Завершение: Удаление архива загрузки<span class="loading"></span>';
                    update_loadings();
                    console.log(item_name);
                    resolve(folder);
                }
                else
                {
                    // FINISH IT! (puts mods where they should be and deletes extras)
                    modpack_p.innerHTML = 'Завершение: Перенос файлов<span class="loading"></span>';
                    update_loadings();
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
                    modpack_p.innerHTML = 'Завершение: Удаление архива загрузки<span class="loading"></span>';
                    update_loadings();
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
        console.log('Moving: CustomSkinLoader...');
        await fs.move(sub_folder + `\\CustomSkinLoader`, modpack_folder + `\\CustomSkinLoader`);

        console.log('Moving: Graphics...');
        await fs.move(sub_folder + `\\Graphics`, modpack_folder + `\\Graphics`);

        console.log('Moving: asm...');
        await fs.move(sub_folder + `\\asm`, modpack_folder + `\\asm`);

        console.log('Moving: config...');
        await fs.move(sub_folder + `\\config`, modpack_folder + `\\config`);

        console.log('Moving: mods...');
        await fs.move(sub_folder + `\\mods`, modpack_folder + `\\mods`);

        console.log('Moving: resourcepacks...');
        await fs.move(sub_folder + `\\resourcepacks`, modpack_folder + `\\resourcepacks`);

        console.log('Moving: scripts...');
        await fs.move(sub_folder + `\\scripts`, modpack_folder + `\\scripts`);

        console.log('Moving: knownkeys.txt...');
        await fs.copy(sub_folder + `\\knownkeys.txt`, modpack_folder + `\\knownkeys.txt`);

        console.log('Moving: .ReAuth.cfg...');
        await fs.copy(sub_folder + `\\.ReAuth.cfg`, modpack_folder + `\\.ReAuth.cfg`);

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

        console.log(fs.readdirSync(libs_folder));

        console.log('Moving: libraries...');
        await fs.move(sub_folder + `\\libraries`, libs_folder + `\\libraries`);

        console.log(fs.readdirSync(libs_folder));

        console.log('Moving: versions...');
        await fs.move(sub_folder + `\\versions`, libs_folder + `\\versions`);

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
    await rimraf(downloaded_folder, err => {
        if (err) {
            console.warn(err);
            reject(err);
        }
    });

    console.log('All Clear! Ready to launch. Resolving...');
}

function init_ipc() {

}