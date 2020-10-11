//#region  //.Server selection ------------------------------------------

const { ajax } = require("jquery");

let magicae_select_button = document.querySelector('#magicae-select');
let fabrica_select_button = document.querySelector('#fabrica-select');
let statera_select_button = document.querySelector('#statera-select');
let insula_select_button = document.querySelector('#insula-select');

let modpack_name = settings['selected_modpack'];

magicae_select_button.addEventListener('click', () => {
    modpack_name = 'magicae';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateServer();
    UpdateRedownloadCheckBox();
});

fabrica_select_button.addEventListener('click', () => {
    modpack_name = 'fabrica';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateServer();
    UpdateRedownloadCheckBox();
});

statera_select_button.addEventListener('click', () => {
    modpack_name = 'statera';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateServer();
    UpdateRedownloadCheckBox();
});

insula_select_button.addEventListener('click', () => {
    modpack_name = 'insula';
    settings['selected_modpack'] = modpack_name;
    update_settings();
    UpdateServer();
    UpdateRedownloadCheckBox();
});

function Capitalize_First_Letter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function UpdateServer() {
    document.querySelector('#modpack-paragraph').innerHTML = `Сервер: ${Capitalize_First_Letter(modpack_name)}`;
    let admin_role = userData['servers_info'][modpack_name]['adminrole'];
    let privilege = userData['servers_info'][modpack_name]['privilege'];
    if (privilege == 'Player') privilege = 'Игрок';
    if (admin_role == 'Delta') privilege = 'Разработчик';
    if (admin_role == 'Rho') privilege = 'Разработчик';
    if (admin_role == 'Iota') privilege = 'Разработчик';
    if (admin_role == 'Lambda') privilege = 'Разработчик';
    if (admin_role == 'Kappa') privilege = 'Разработчик';
    if (admin_role == 'Epsilon') privilege = 'Разработчик';
    if (admin_role == 'Omikron') privilege = 'Разработчик';
    if (admin_role == 'Psi') privilege = 'Разработчик';

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
    if (admin_role == 'Delta') privilege = 'Разработчик';
    if (admin_role == 'Rho') privilege = 'Разработчик';
    if (admin_role == 'Iota') privilege = 'Разработчик';
    if (admin_role == 'Lambda') privilege = 'Разработчик';
    if (admin_role == 'Kappa') privilege = 'Разработчик';
    if (admin_role == 'Epsilon') privilege = 'Разработчик';
    if (admin_role == 'Omikron') privilege = 'Разработчик';
    if (admin_role == 'Psi') privilege = 'Разработчик';

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
    }
    else
    {
        secondary_text.innerHTML = 'Автозаход на сервер';
    }

    console.log(cb);
    console.log(label);
    console.log(modpack_installed_bool);

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

let play_button = document.querySelector('#play-button');
let download_in_progress = false;

play_button.addEventListener('click', async () => {

    // Verifyies if folder exists. creates if not. 
    // modpack_folder - folder in which modpack is located
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);

    if (!download_in_progress) {
        if (document.querySelector('#redownload-client-cb').checked) { 
            //. ЕСЛИ НЕ УСТАНОВЛЕННА

            show_progress_footer();
            rimraf.sync(modpack_folder);

            console.log(`${modpack_name} is uninstalled. Downloading`);
            
            document.querySelector('#play-button-assist-label').classList.add('unactive');

            // Если мы уж перекачиваем то уж лучше подчистить все, а то не дай бох чо произойдет
            await clear_modpack_folder(modpack_name);

            // Скачать либы если их нету
            let libs_installed = await download_libs();
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
            change_settings_preset(modpack_name, document.querySelector('#optimization-input').value);
            document.querySelector('#play-button-assist-label').classList.remove('unactive');
            play_button.click();

        } else { //. ЕСЛИ УСТАНОВЛЕННА
            console.log(`Найденна ${Capitalize_First_Letter(modpack_name)}. Проверка обновлений...`);
            if (libs_folder_empty())
            {
                show_progress_footer();
            }

            // Скачать либы если их нету
            let libs_installed = await download_libs();
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
    play_button.innerHTML = 'Запуск...';
    document.querySelector('#launch-menu').classList.add('open');
    document.querySelector('#launch-h').innerHTML = `Запуск: ${Capitalize_First_Letter(modpack_name)}...`;
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
                let speed_in_mbps = progress.speed;

                console.log(`Download speed: ${speed_in_mbps} Mb / s`);
                console.log(progress);

                document.querySelector('#modpack-paragraph').innerHTML = `Загрузка сборки ${Capitalize_First_Letter(modpack_name)}: ${(progress.percent * 100).toFixed()}%`
                document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps} Мб в секунду`;
                document.querySelector('.download-filler').style.width = `${progress.percent * 100}%`;
            }
        );
        
        // Осведомить о том что все скачалось
        console.log(`Modpack installed: ${mods_path}`);
        resolve();
    });
}

function download_libs()
{
    return new Promise(async (resolve, reject) => {
        let core_path = verify_and_get_libs_folder();
        if (libs_folder_empty()) {
            console.log(`No libraries found on this computer. Downloading...`);
            let libs_path = await download_from_github_illegally(
                core_path,
                'libraries',
                (progress) => {
                    let speed_in_mbps = progress.speed;

                    console.log(`Download speed: ${speed_in_mbps} Mb / s`);

                    document.querySelector('#modpack-paragraph').innerHTML = `Скачивание Библиотек: ${(progress.percent * 100).toFixed()}%`
                    document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps * 8} Мб в секунду`;
                    document.querySelector('.download-filler').style.width = `${progress.percent * 100}%`;
                }
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