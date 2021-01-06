//#region  //. Server selection ------------------------------------------

const { ajax } = require("jquery");

let magicae_select_button = document.querySelector('#magicae-select');
let fabrica_select_button = document.querySelector('#fabrica-select');
let statera_select_button = document.querySelector('#statera-select');
let insula_select_button = document.querySelector('#insula-select');
let odyssea_select_button = document.querySelector('#odyssea-select');

let play_button = document.querySelector('#play-button');

let launched_modpacks = {
    'magicae': false,
    'fabrica': false,
    'statera': false,
    'insula': false,
    'odyssea': false
};

let modpack_name = settings['selected_modpack'];

magicae_select_button.addEventListener('click', () => {
    modpack_name = 'magicae';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateRedownloadCheckBox();
    UpdateSideModpackDir(modpack_name);
    UpdateButtons();
    UpdateServer();
});

fabrica_select_button.addEventListener('click', () => {
    modpack_name = 'fabrica';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateRedownloadCheckBox();
    UpdateSideModpackDir(modpack_name);
    UpdateButtons();
    UpdateServer();
});

statera_select_button.addEventListener('click', () => {
    modpack_name = 'statera';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateRedownloadCheckBox();
    UpdateSideModpackDir(modpack_name);
    UpdateButtons();
    UpdateServer();
});

insula_select_button.addEventListener('click', () => {
    modpack_name = 'insula';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateRedownloadCheckBox();
    UpdateSideModpackDir(modpack_name);
    UpdateButtons();
    UpdateServer();
});

odyssea_select_button.addEventListener('click', () => {
    modpack_name = 'odyssea';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateRedownloadCheckBox();
    UpdateSideModpackDir(modpack_name);
    UpdateButtons();
    UpdateServer();
});

function UpdateButtons() {
    let buttons = document.querySelectorAll('.select-button')
    let active_button = document.querySelector(`#${modpack_name}-select`)
    for (const button of buttons) {
        button.classList = 'select-button';

        if (modpack_not_installed(button.getAttribute('data-name')))
        {
            button.innerHTML = 'Скачать';
        }
        else
        {
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
UpdateButtons();

function UpdateOneButton(server, button_el = document.querySelector(`#${server}-select`))
{
    if (modpack_not_installed(server))
    {
        button_el.innerHTML = 'Скачать';
    }
    else
    {
        button_el.innerHTML = 'Выбрать';
    }

    for (const server_container of document.querySelectorAll('.server-unavailable')) {
        server_container.querySelector('.select-button').innerHTML = 'Недоступно';
    }
}

UpdateButtons();

function Capitalize_First_Letter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function UpdateServer() {
    document.querySelector('#modpack-paragraph').innerHTML = `Сервер: ${Capitalize_First_Letter(modpack_name)}`;
    let admin_role = userData['servers_info'][modpack_name]['adminrole'];
    let privilege = userData['servers_info'][modpack_name]['privilege'];
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

    ipcRenderer.sendSync('rich-presence-to', {
        joinSecret: modpack_name,
    });
}

UpdateServer();

function UpdateRole() {
    let admin_role = userData['servers_info'][modpack_name]['adminrole'];
    let privilege = userData['servers_info'][modpack_name]['privilege'];
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

function UpdateRedownloadCheckBox() {
    // cb stands for checkbox
    let cb = document.querySelector('#redownload-client-cb');
    let label = document.querySelector('#redownload-client-label');
    let modpack_installed_bool = !modpack_not_installed(modpack_name);

    let secondary_text = document.querySelector('#play-button-assist-label span');

    cb.checked = !modpack_installed_bool;

    if (!modpack_installed_bool)
    {
        secondary_text.innerHTML = 'Быстрое скачивание';
        document.querySelector('#play-button').innerHTML = 'Скачать';
    }
    else
    {
        secondary_text.innerHTML = 'Автозаход на сервер';
        document.querySelector('#play-button').innerHTML = 'Играть';
    }

    if (launched_modpacks[modpack_name])
    {
        deactivate_play_button();
    }
    else
    {
        activate_play_button();
    }

    if (!modpack_installed_bool) {
        label.className = 'checkbox unactive';
    } else {
        label.className = 'checkbox';
    }
}

UpdateRedownloadCheckBox();
//#endregion

//#region //. Server Play Button ------------------------------------------

ipcRenderer.on('rpc-join', (event, info) => {
    modpack_name = info.server;
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateServer();
    UpdateRedownloadCheckBox();
    console.log(modpack_name);
    play_button.click();
});

let download_in_progress = false;

play_button.addEventListener('click', async () => {
    if (launched_modpacks[modpack_name])
    {
        console.log(`${modpack_name} is already launched`);
        deactivate_play_button();
        return;
    }
    else
    {
        activate_play_button();
    }

    // Verifyies if folder exists. creates if not. 
    // modpack_folder - folder in which modpack is located
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);

    if (!download_in_progress) {
        if (document.querySelector('#redownload-client-cb').checked) { 
            //. ЕСЛИ НЕ УСТАНОВЛЕННА

            show_progress_footer();

            console.log(`${modpack_name} is uninstalled. Downloading`);
            
            document.querySelector('#play-button-assist-label').classList.add('unactive');

            // Если мы уж перекачиваем то уж лучше подчистить все, а то не дай бох чо произойдет
            await clear_modpack_folder(modpack_name);

            // Скачать либы если их нету
            let libs_installed = await download_libs(modpack_name);
            if (libs_installed)
            {
                console.log('installed libs');
            }
            else
            {
                console.log('libs are already installed');
            }

            // Скачать сборку
            await download_mods_and_stuff(modpack_folder);

            // Если либов нету то вставить их
            console.log('Checking libs...');
            if (!check_libs_in_mod(modpack_name)) {
                copy_libs_to_modpack(modpack_name);
            }

            // Вернуть все на своим места а то чо там кнопка не играть а например загрузка, а?
            show_normal_footer();

            // Обновить натсройки
            if (!settings_exist())
                change_settings_preset(modpack_name, document.querySelector('#optimization-input').value);

            // Запуск
            document.querySelector('#play-button-assist-label').classList.remove('unactive');
            console.log(`Последняя версия ${Capitalize_First_Letter(modpack_name)} установлена. Запускаем...`);

            // Запустить штуку которая блокирует пользователю возможность запустить сборку еще раз
            show_launch_menu();

            // Отключить Rich Presence потому что у майна свой
            ipcRenderer.send('rich-presence-to', {
                details: `Запускает ${Capitalize_First_Letter(modpack_name)}...`,
                largeImageKey: `rpc_${modpack_name}`,
                smallImageKey: 'rich_presence_light',
            });

            await verify_user_skin(modpack_name);

            // Запустить майнкрафт. Эта фнукция (Promise) заканчивается когда выключается майнкрафт.
            let mem_input = document.querySelector('#memory-input');
            launch_minecraft(1000, mem_input.value * 1024, modpack_folder, userData['username'], userData['uuid'], modpack_name).then(res => {

                // Манйкрафт завершился. Если 0, то все заебумба
                console.log(`Minecraft exited with code: ${res}`);
                UpdateRedownloadCheckBox();
            }).catch(err => {

                // Что то пошло не так при запуске.
                console.log(`Launch encountered some errors: ${err}`);
                UpdateRedownloadCheckBox();
            });

        } else { //. ЕСЛИ УСТАНОВЛЕННА
            console.log(`Найденна ${Capitalize_First_Letter(modpack_name)}. Проверка обновлений...`);
            if (libs_folder_empty(modpack_name))
            {
                show_progress_footer();
            }

            // Скачать либы если их нету
            let libs_installed = await download_libs(modpack_name);
            if (libs_installed)
            {
                console.log('installed libs');
                play_button.click();
                return;
            }
            else
            {
                console.log('libs are already installed');
            }

            // Скопировать либы если их нету
            if (!check_libs_in_mod(modpack_name)) {
                copy_libs_to_modpack(modpack_name);
            }

            // Проверка обновления, если есть, то перезапускаем функцию с перекачиванием
            if ( !(await check_for_updates(modpack_name).catch(err => {console.log(err); return;})))
            {
                console.log(`Последняя версия ${Capitalize_First_Letter(modpack_name)} установлена. Запускаем...`);

                // Запустить штуку которая блокирует пользователю возможность запустить сборку еще раз
                show_launch_menu();

                launched_modpacks[modpack_name] = true;
                deactivate_play_button();

                // Отключить Rich Presence потому что у майна свой
                ipcRenderer.send('rich-presence-to', {
                    details: `Запускает ${Capitalize_First_Letter(modpack_name)}...`,
                    largeImageKey: `rpc_${modpack_name}`,
                    smallImageKey: 'rich_presence_light',
                });

                await verify_user_skin(modpack_name);

                // Обновить натсройки
                if (!settings_exist())
                    change_settings_preset(modpack_name, document.querySelector('#optimization-input').value);
                await update_shader(modpack_name, settings['default_shader']);

                // Запустить майнкрафт. Эта фнукция (Promise) заканчивается когда выключается майнкрафт.
                let mem_input = document.querySelector('#memory-input');
                launch_minecraft(1000, mem_input.value * 1024, modpack_folder, userData['username'], userData['uuid'], modpack_name).then((_modpack_name, res) => {

                    launched_modpacks[_modpack_name] = false;
                    activate_play_button();
                    // Манйкрафт завершился. Если 0, то все заебумба
                    console.log(`Minecraft exited with code: ${res}`);
                    UpdateRedownloadCheckBox();
                }).catch((_modpack_name, err) => {

                    // Что то пошло не так при запуске.
                    launched_modpacks[_modpack_name] = false;
                    activate_play_button();
                    console.log(`Launch encountered some errors: ${err}`);
                    UpdateRedownloadCheckBox();
                });
            }
            else
            {
                console.log('Найдена новая версия, скачавание...');
                document.querySelector('#redownload-client-cb').checked = true;
                play_button.click();
            }
        }
    } else {
        cancel_current_download();
    }
});

// True - нада обновлять, False - ненадо
function check_for_updates(_modpack_name)
{
    return new Promise(async (resolve, reject) => {
        let latest_version = (await get_latest_release(_modpack_name))['name'].toString().split('v')[1].split('.');
        console.log(_modpack_name);
        let installed_version = get_modpack_version_from_info(_modpack_name).toString().split('v')[1];

        if (installed_version == '' || installed_version == undefined || installed_version == null)
        {
            resolve(true);
        }

        installed_version = installed_version.split('.');

        console.log(latest_version);
        console.log(installed_version);

        for (let i = 0; i < 4; i++)
        {
            if (latest_version[i] > installed_version[i])
            {
                resolve(true);
            }
        }

        resolve(false);
    });
}

function activate_play_button()
{
    play_button.classList = 'play-button';
}

function deactivate_play_button()
{
    play_button.classList = 'play-button play-button-unactive';
}

function show_progress_footer()
{
    // Show progress bar in footer
    document.querySelector('footer').className = 'noselect downloading';
    play_button.innerHTML = 'Отмена';
    download_in_progress = true;
    document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.add('updating');
}

function show_launch_menu()
{
    play_button.innerHTML = 'Запуск<span class="loading"></span>';
    document.querySelector('#launch-menu').classList.add('open');
    document.querySelector('#launch-h').innerHTML = `Запуск: ${Capitalize_First_Letter(modpack_name)}<span class="loading"></span>`;
}

//. Ну чтобы там все выглядело как до скачивания
function show_normal_footer()
{
    // Show normal footer again
    download_in_progress = false;
    play_button.innerHTML = 'Играть';
    UpdateServer();
    UpdateRole();
    document.querySelector('.download-filler').style.width = `100%`;
    document.querySelector('footer').className = 'noselect';
    document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.remove('updating');
    document.querySelector('#redownload-client-cb').checked = false;
}

function download_mods_and_stuff(modpack_folder)
{
    return new Promise(async (resolve, reject) => {

        // Downloads modpack if core is installed
        // Input function runs every progress update (batch of bytes resieved)
        let mods_path = await download_from_github_illegally(
            modpack_folder,
            modpack_name,
            (progress) => {
                let speed_in_mbps = (progress.speed / 1024 / 1024).toPrecision(2);

                console.log(`Download speed: ${speed_in_mbps} Mb / s`);
                console.log(progress);

                document.querySelector('#modpack-paragraph').innerHTML = `Загрузка сборки ${Capitalize_First_Letter(modpack_name)}: ${(progress.percent).toFixed()}%`
                document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps} Мб в секунду`;
                document.querySelector('.download-filler').style.width = `${progress.percent}%`;
            }
        );
        
        // Осведомить о том что все скачалось
        console.log(`Modpack installed: ${mods_path}`);
        resolve();
    });
}

function download_libs(item_name)
{
    return new Promise(async (resolve, reject) => {
        let core_path = verify_and_get_libs_folder() + '\\' + modpack_versions[item_name];
        if (libs_folder_empty(modpack_name)) {
            console.log(`No libraries found on this computer. Downloading...`);
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
                modpack_versions[item_name]
            );

            console.log(`Libraries installed: ${libs_path}`);
            resolve(true);
        }
        else
        {
            resolve(false);
        }
    });
}

function cancel_current_download()
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
            UpdateServer();
            UpdateRole();
            document.querySelector('footer').className = 'noselect';
            UpdateRedownloadCheckBox();
        }
    });
}

//#endregion

//#region //. ---------------- Play Memory range ------------------------
let play_memory_range = document.querySelector('#play-memory-range');

let max_setable_ram = Math.floor(os.freemem() / 1024 / 1024 / 1024);
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
        if (i == input_range.value / 2) {
            input_stops[i].classList.add('active-stop');
        } else {
            input_stops[i].classList.remove('active-stop');
        }
    }
});

// Change from settings or update settings
play_memory_range.children[0].children[1].children[0].value = Math.max(Math.min(settings['allocated_memory'], max_setable_ram), min_setable_ram);
play_memory_range.addEventListener('change', () => {
    settings['allocated_memory'] = play_memory_range.children[0].children[1].children[0].value;
    document.querySelector('#memory-range').children[0].children[1].children[0].value = play_memory_range.children[0].children[1].children[0].value; // Sync 2 memory ranges
    update_settings();
})

//#endregion

