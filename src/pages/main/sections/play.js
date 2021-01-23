const { ajax } = require("jquery");

let magicae_select_button = document.querySelector('#magicae-select');
let fabrica_select_button = document.querySelector('#fabrica-select');
let statera_select_button = document.querySelector('#statera-select');
let insula_select_button = document.querySelector('#insula-select');
let odyssea_select_button = document.querySelector('#odyssea-select');

let play_button = document.querySelector('#play-button');

// So that we dont check EVERY time we press the button
let update_check_timeout = 30; // Seconds
let checked_update = {
    magicae: false,
    fabrica: false,
    statera: false,
    insula: false,
    odyssea: false,
};

// Modpacks that have updates available (man, dont try to run old versions, they wont be able to join servers anyway :) )
let needs_an_update = {
    magicae: false,
    fabrica: false,
    statera: false,
    insula: false,
    odyssea: false,
};

let select_locked = false;
let modpack_installed = false;
let download_in_progress = false;
let show_progress_footer = false;
let modpack_name = settings['selected_modpack'];
setModpack(modpack_name);

magicae_select_button.addEventListener('click', () => { if (select_locked) return; setModpack('magicae') });
fabrica_select_button.addEventListener('click', () => { if (select_locked) return; setModpack('fabrica') });
statera_select_button.addEventListener('click', () => { if (select_locked) return; setModpack('statera') });
insula_select_button.addEventListener('click', () => { if (select_locked) return; setModpack('insula') });
odyssea_select_button.addEventListener('click', () => { if (select_locked) return; setModpack('odyssea') });


async function setModpack(modpack) {
    modpack_name = modpack;
    settings['selected_modpack'] = modpack;
    update_settings();
    updateRedownloadCheckBox();
    // updateSideModpackDir(modpack);
    updateButtons();
    updateServer();

    play_button.innerHTML = LOADING_SPAN;
    if (!checked_update[modpack] && modpack_installed && needs_an_update[modpack_name] == false) {
        console.log(`[PLAY] Checking for updates for ${modpack}`);
        needs_an_update[modpack] = await checkForUpdates(modpack);
        checked_update[modpack] = true;
        setTimeout(() => {
            checked_update[modpack] = false;
        }, 1000 * update_check_timeout);
    }
    updateFooter();
}

function updateButtons() {
    let buttons = document.querySelectorAll('.select-button')
    let active_button = document.querySelector(`#${modpack_name}-select`)
    for (const button of buttons) {
        button.classList = 'select-button';

        if (launchedModpacks[button.getAttribute('data-name')]['launched']) {
            button.innerHTML = 'Запущена';
        } else if (modpack_not_installed(button.getAttribute('data-name'))) {
            button.innerHTML = 'Скачать';
        } else {
            button.innerHTML = 'Выбрать';
        }
    }

    active_button.classList = 'select-button select-button-active';
    active_button.innerHTML = 'Выбрано';

    if (!settings['developer_mode']) {
        for (const server_container of document.querySelectorAll('.server-unavailable')) {
            server_container.querySelector('.select-button').innerHTML = 'Недоступно';
        }
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateServer() {
    document.querySelector('#modpack-paragraph').innerHTML = `Сервер: ${capitalizeFirstLetter(modpack_name)}`;
    let admin_role = userInfo['servers_info'][modpack_name]['adminrole'];
    let privilege = userInfo['servers_info'][modpack_name]['privilege'];
    if (privilege == 'Player') privilege = 'Игрок';

    switch (admin_role) {
        case 'Delta': privilege = 'Разработчик'; break;
        case 'Psi': privilege = 'Проверяющий'; break;
        case 'Omikron': privilege = 'Управляющий'; break;
        case 'Epsilon': privilege = 'Менеджер'; break;
        case 'Kappa': privilege = 'Администратор'; break;
        case 'Lambda': privilege = 'Модератор'; break;
        case 'Iota': privilege = 'Помощник'; break;
        case 'Rho': privilege = 'Стажер'; break;
    }

    if (admin_role == 'Player') {
        document.getElementById('role-par').innerHTML = `${privilege}`;
    } else {
        document.getElementById('role-par').innerHTML = `${privilege} [${admin_role}]`;
    }
}

let redownload_memory = false;
function updateRedownloadCheckBox() {
    // cb stands for checkbox
    let cb = document.querySelector('#redownload-client-cb');
    let label = document.querySelector('#redownload-client-label');
    modpack_installed = !modpack_not_installed(modpack_name);

    let secondary_text = document.querySelector('#play-button-assist-label span');

    if (!modpack_installed)
    {
        secondary_text.innerHTML = 'Запустить по завершении';
    }
    else
    {
        secondary_text.innerHTML = 'Автозаход на сервер';
    }

    if (launchedModpacks[modpack_name]['launched'])
    {
        deactivatePlayButton();
    }
    else
    {
        activatePlayButton();
    }

    if (!modpack_installed) {
        label.className = 'checkbox unactive';
        cb.checked = true;
    } else {
        label.className = 'checkbox';
        cb.checked = false;
    }
}

ipcRenderer.on('rpc-join', (event, info) => {
    setModpack(info.server);
    settings['selected_modpack'] = modpack_name;
    update_settings();
    updateServer();
    updateRedownloadCheckBox();
    console.log(modpack_name);
    play_button.click();
});

// Prevent from cicking the button, until it finished it's job 
let button_pressed_thing = false;
play_button.addEventListener('click', play_buttonClick);
async function play_buttonClick(e) {
    if (!download_in_progress && button_pressed_thing) return;
    button_pressed_thing = true;

    //# Check if modpack is already launched
    if (launchedModpacks[modpack_name]['launched']) {
        console.log(`[LAUNCH] ${capitalizeFirstLetter(modpack_name)} is already launched`);
        deactivatePlayButton();
        return;

    } else {
        activatePlayButton();

    }

    // Cancel current download if it is happening rn
    if (download_in_progress) {
        console.log(`[LAUNCH] Download in progress, canceling it`);
        cancelCurrentDownload();
        return;
    }

    // Clear modpack folder if reinstall checkbox is checked
    if (document.getElementById('redownload-client-cb').checked) {
        console.log(`[LAUNCH] Redownloading ${modpack_name}...`);
        document.getElementById('redownload-client-cb').checked = false;
        deactivatePlayButton();
        show_progress_footer = true;
        updateFooter();
        await clear_modpack_folder(modpack_name);
    }

    // Ensure that latest version of libs exist
    await ensureLibs(modpack_name);

    // Ensure that latest version of modpack is installed
    let downloaded_smth = await ensureModpack(modpack_name);

    // Ensure that everything is ready for launch
    await preLaunchConfig(modpack_name, e.ctrlKey);

    if (document.querySelector('#play-button-assist-cb').checked || !downloaded_smth) {
        // Launch minecraft!
        let mem_input = document.querySelector('#memory-input');
        let modpack_folder = verify_and_get_modpack_folder(modpack_name);
        launch_minecraft(1000, mem_input.value * 1024, modpack_folder, userInfo['username'], userInfo['uuid'], modpack_name);
    }

    // Show normal footer again
    show_progress_footer = false;
    download_in_progress = false;
    setModpack(modpack_name);
    activatePlayButton();

    // Allow for button to bre pressed again
    button_pressed_thing = false;
}

ipcRenderer.on('modpack-exit', (event, {modpack_name, code, error}) => {
    if (error) {
        // Что то пошло не так при запуске.
        console.log(`[LAUNCH] <${modpack_name}> Launch encountered some errors: ${code}`);
        updateRedownloadCheckBox();
    } else {
        // Манйкрафт завершился. Если 0, то все заебумба
        console.log(`[LAUNCH] <${modpack_name}> Minecraft exited with code: ${code}`);
        updateRedownloadCheckBox();
    }
    updateFooter();
});

ipcRenderer.on('modpack-log', (event, { modpack_name, message }) => {
    console.log(message);
});

ipcRenderer.on('modpack-update', (event, { modpack_name }) => {
    updateFooter();
});

async function ensureLibs(modpack) {
    if (await libs_folder_empty(modpack)) {
        console.log(`[LAUNCH] No libraries found on this computer. Downloading...`);
        activatePlayButton();
        show_progress_footer = true;
        download_in_progres = true;
        updateFooter();

        await downloadLibs(modpack);
        deactivatePlayButton();
    }

    if (await checkForUpdates('libraries')) {
        console.log(`[LAUNCH] New version of libraries detected. Downloading...`);
        activatePlayButton();
        show_progress_footer = true;
        download_in_progres = true;
        updateFooter();

        await downloadLibs(modpack, true);
        deactivatePlayButton();
    }

    console.log('[LAUNCH] Latest libraries are installed');
    download_in_progress = false;
    updateFooter();
}

async function ensureModpack(modpack) {
    let downloaded_smth = false;
    if (await modpack_not_installed(modpack)) {
        console.log(`[LAUNCH] ${capitalizeFirstLetter(modpack)} is not installed. Downloading...`);
        downloaded_smth = true;
        activatePlayButton();
        download_in_progress = true;
        updateFooter();

        await downloadModpack(modpack);
        deactivatePlayButton();
    }

    if (await checkForUpdates(modpack)) {
        console.log(`[LAUNCH] New version of ${modpack} detected. Downloading...`);
        downloaded_smth = true;
        activatePlayButton();
        await clear_modpack_folder(modpack);
        download_in_progress = true;
        updateFooter();

        await downloadModpack(modpack, true);
        deactivatePlayButton();
    }

    if (!(await check_libs_in_modpack(modpack))) {
        console.log(`[LAUNCH] No libraries found in ${modpack}. Moving...`);
        show_progress_footer = true;
        updateFooter();
        document.getElementById('modpack-paragraph').innerHTML = `Завершение: Перенос библиотек ${LOADING_SPAN}`
        document.getElementById('role-par').innerHTML = `Не закрывайте лаунчер!`
        await copy_libs_to_modpack(modpack);
    }
    
    console.log(`[LAUNCH] Latest version of ${modpack} is installed and ready for launch`);
    needs_an_update[modpack] = false;
    download_in_progress = false;
    updateFooter();
    return downloaded_smth;
}

async function preLaunchConfig(modpack, force_reconfig) {
    show_progress_footer = true;
    updateFooter();
    document.getElementById('modpack-paragraph').innerHTML = `Завершение: Подготовка к запуску ${LOADING_SPAN}`
    document.getElementById('role-par').innerHTML = `Не закрывайте лаунчер!`

    //# Verify skin
    await verify_user_skin(modpack);

    //# Verify settings
    if (!is_first_launch(modpack) || force_reconfig) {
        console.log(`[LAUNCH] This is the first launch, setting everything up`);

        change_settings_preset(modpack_name, document.querySelector('#optimization-input').value);
        await apply_control_settings();

        //# Verify settings
        await update_shader(modpack_name, settings['default_shader']);
    }
}

function updateFooter() {
    if (download_in_progress || show_progress_footer) {
        showProgressFooter();
        
    } else {
        showNormalFooter();

        if (!launchedModpacks[modpack_name]['visible'] && launchedModpacks[modpack_name]['launched']) {
            showLaunchMenu();
        } else {
            document.querySelector('#launch-menu').classList.remove('open');
        }
    
        if (launchedModpacks[modpack_name]['launched']) {
            play_button.innerHTML = 'Запущена';
    
            deactivatePlayButton();
        } else {
            play_button.innerHTML = 'Играть';
    
            activatePlayButton();
        }

        if (!modpack_installed) {
            play_button.innerHTML = 'Скачать';
    
        } else if (needs_an_update[modpack_name]) {
            play_button.innerHTML = 'Обновить';
        }
    }
}

function activatePlayButton()
{
    play_button.classList = 'play-button';
}

function deactivatePlayButton()
{
    play_button.classList = 'play-button play-button-unactive';
}

function showLaunchMenu()
{
    play_button.innerHTML = `Запуск ${LOADING_SPAN}`;
    document.querySelector('#launch-menu').classList.add('open');
    document.querySelector('#launch-h').innerHTML = `Запуск: ${capitalizeFirstLetter(modpack_name)} ${LOADING_SPAN}`;
}

function showProgressFooter()
{
    lockSelectButtons()
    // Show progress bar in footer
    document.querySelector('footer').className = 'noselect downloading';
    play_button.innerHTML = 'Отменить';
    download_in_progress = true;
    document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.add('updating');
}

function showNormalFooter()
{
    unlockSelectButtons();
    // Show normal footer again
    play_button.innerHTML = 'Играть';
    updateServer();
    document.querySelector('.download-filler').style.width = `100%`;
    document.querySelector('footer').className = 'noselect';
    document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.remove('updating');
}

function lockSelectButtons() {
    select_locked = true;
    for (const button of document.querySelectorAll('.select-button')) {
        button.classList.add('select-locked');
    }
}

function unlockSelectButtons() {
    select_locked = false;
    for (const button of document.querySelectorAll('.select-button')) {
        button.classList.remove('select-locked');
    }
}

async function checkForUpdates(item_name)
{
    let latest_version = (await get_latest_release(item_name))['name'].toString().split('v')[1].split('.');
    let installed_version = get_item_version_from_info(item_name).toString().split('v')[1];

    if (!installed_version) {
        return true;
    }

    installed_version = installed_version.split('.');

    console.log(`[${item_name.toUpperCase()}] Installed: ${installed_version.join('.')} Latest: ${latest_version.join('.')}`);

    for (let i = 0; i < 4; i++) {
        if (latest_version[i] > installed_version[i]) {
            return true;
        }
    }

    return false;
}

async function downloadModpack(modpack, updating = false) {

    let modpack_folder = verify_and_get_modpack_folder(modpack);

    // Downloads modpack if core is installed
    // Input function runs every progress update (batch of bytes recieved)
    let mods_path = await download_from_github_illegally(
        modpack_folder,
        modpack_name,
        (progress) => {
            let speed_in_mbps = (progress.speed / 1024 / 1024).toPrecision(2);

            console.log(`Download speed: ${speed_in_mbps} Mb / s`);
            console.log(progress);

            document.querySelector('#modpack-paragraph').innerHTML = `Загрузка сборки ${capitalizeFirstLetter(modpack_name)}: ${(progress.percent).toFixed()}%`
            document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps} Мб в секунду`;
            document.querySelector('.download-filler').style.width = `${progress.percent}%`;
        },
        updating
    );
    
    // Осведомить о том что все скачалось
    console.log(`Modpack installed: ${mods_path}`);
    return;
}

async function downloadLibs(modpack, updating = false)
{
    let core_path = verify_and_get_libs_folder() + '\\' + modpack_versions[modpack];
    let libs_path = await download_from_github_illegally(
        core_path,
        'libraries',
        (progress) => {
            let speed_in_mbps = (progress.speed / 1024 / 1024).toPrecision(2);

            console.log(`Download speed: ${speed_in_mbps} Mb / s`);
            console.log(progress);

            document.querySelector('#modpack-paragraph').innerHTML = `Скачивание Библиотек: ${(progress.percent).toFixed()}%`
            document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps * 8} Мб в секунду`;
            document.querySelector('.download-filler').style.width = `${progress.percent}%`;
        },
        modpack_versions[modpack],
        updating
    );

    console.log(`Libraries installed: ${libs_path}`);
    return true;
}

function cancelCurrentDownload()
{
    // Send message to main process to stop download 
    ipcRenderer.send('cancel-current-download', 'user cancelled');

    // React to reply from main
    ipcRenderer.on('download-cancelled', (event, status) => {

        //  Statuses:
        //  success - download cancelled succesfully
        //  no download in progress - no download in progress
        console.log(status);
        if (status == 'success') {
            document.querySelector('#play-button-assist-label').classList.remove('unactive');
            document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.remove('updating');
            download_in_progress = false;
            play_button.innerHTML = 'Играть';
            updateServer();
            document.querySelector('footer').className = 'noselect';
            updateRedownloadCheckBox();
        }
    });
}

//#region //. ---------------- Play Memory range ------------------------
let play_memory_range = document.querySelector('#play-memory-range');

let max_setable_ram = Math.min(Math.ceil(os.freemem() / 1024 / 1024 / 1024) + 1, Math.ceil(os.totalmem() / 1024 / 1024 / 1024));
console.log(`[SETTINGS] Ram available to allocate: ${max_setable_ram}`);
let min_setable_ram = 4;

// runs when user moves the slider
play_memory_range.addEventListener('input', e => {
    // get <input> tag
    let input_range = e.currentTarget.children[0].children[1].children[0];

    // get div containing stops (markers)
    let input_stops = e.currentTarget.children[0].children[0].children;

    input_range.value = Math.max(Math.min(input_range.value, max_setable_ram), min_setable_ram);
    document.querySelector('#settings-memory-header').innerHTML = `Выделение памяти: ${input_range.value}Gb`;
    document.querySelector('#play-memory-header').innerHTML = `Выделение памяти: ${input_range.value}Gb`;

    // loop through all stops
    for (let i = 0; i < input_stops.length; i++) {

        // if stop index is the same as input value, then it is active
        // otherwise it is not
        // we devide value by 2 because 'step' between stops is 2
        if (i == (input_range.value - 4) / 2) {
            input_stops[i].classList.add('active-stop');
        } else {
            input_stops[i].classList.remove('active-stop');
        }

        if (input_range.value < 6) {
            document.querySelector('#memory-tip').classList.remove('tip-hidden');
        } else {
            document.querySelector('#memory-tip').classList.add('tip-hidden');
        }
    }
});

// Change from settings or update settings
settings['allocated_memory'] = Math.max(Math.min(settings['allocated_memory'], max_setable_ram), min_setable_ram);
update_settings();
play_memory_range.children[0].children[1].children[0].value = settings['allocated_memory'];
play_memory_range.addEventListener('change', () => {
    settings['allocated_memory'] = play_memory_range.children[0].children[1].children[0].value;
    document.querySelector('#memory-range').children[0].children[1].children[0].value = play_memory_range.children[0].children[1].children[0].value; // Sync 2 memory ranges
    update_settings();
})

//#endregion

