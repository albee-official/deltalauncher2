//#region  //.Server selection ------------------------------------------

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

    cb.checked = !modpack_installed_bool;

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

let play_button = document.querySelector('#play-button');
let download_in_progress = false;

play_button.addEventListener('click', async () => {

    // Verifyies if folder exists. creates if not. 
    // modpack_folder - folder in which modpack is located
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);

    if (!download_in_progress) {
        if (document.querySelector('#redownload-client-cb').checked) {

            // Show progress bar in footer
            document.querySelector('footer').className = 'noselect downloading';
            play_button.innerHTML = 'Отмена';
            download_in_progress = true;

            console.log(`${modpack_name} is uninstalled. Downloading`);

            document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.add('updating');

            clear_modpack_folder(modpack_name);

            let core_path = verify_and_get_libs_folder();
            if (libs_folder_empty()) {
                console.log(`No libraries found on this computer. Downloading...`);
                let libs_path = await download_from_github_illegally(
                    core_path,
                    'libs',
                    (progress) => {
                        let speed_in_mbps = (progress.speed / 1024 / 1024).toPrecision(2);

                        console.log(`Download speed: ${speed_in_mbps} Mb / s`);

                        document.querySelector('#modpack-paragraph').innerHTML = `Загрузка библиотек: ${(progress.percent * 100).toFixed()}%`
                        document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps * 8} Мб в секунду`;
                        document.querySelector('.download-filler').style.width = `${progress.percent * 100}%`;
                    }
                );

                console.log(`Libraries installed: ${libs_path}`);
            }

            // Downloads modpack if core is installed
            // Input function runs every progress update (batch of bytes resieved)
            let mods_path = await download_from_github_illegally(
                modpack_folder,
                modpack_name,
                (progress) => {
                    let speed_in_mbps = (progress.speed / 1024 / 1024).toPrecision(2);

                    console.log(`Download speed: ${speed_in_mbps} Mb / s`);

                    document.querySelector('#modpack-paragraph').innerHTML = `Загрузка сборки ${modpack_name}: ${(progress.percent * 100).toFixed()}%`
                    document.querySelector('#role-par').innerHTML = `Скорость: ${speed_in_mbps * 8} Мб в секунду`;
                    document.querySelector('.download-filler').style.width = `${progress.percent * 100}%`;
                }
            );
            console.log(`Modpack installed: ${mods_path}`);

            console.log('Checking libs...');

            if (!check_libs_in_mod(modpack_name)) {
                copy_libs_to_modpack(modpack_name);
            }

            // Show normal footer again
            download_in_progress = false;
            play_button.innerHTML = 'Играть';
            UpdateServer();
            UpdateRole();
            document.querySelector('.download-filler').style.width = `100%`;
            document.querySelector('footer').className = 'noselect';

            // Update Settings preset after download
            change_settings_preset(modpack_name, document.querySelector('#optimization-range').children[0].children[1].children[0].value);

            document.querySelector(`#modpack-dir[data-name=${modpack_name}]`).classList.remove('updating');
            document.querySelector('#redownload-client-cb').checked = false;
            play_button.click();
        } else {
            // Launch minecraft if it is installed
            if (!check_libs_in_mod(modpack_name)) {
                copy_libs_to_modpack(modpack_name);
            }

            //! Not checking for updates yet.
            console.log(`${modpack_name} is installed. Launching`);
            play_button.innerHTML = 'Запуск...';
            document.querySelector('#launch-menu').classList.add('open');
            document.querySelector('#launch-h').innerHTML = `Запуск: ${Capitalize_First_Letter(modpack_name)}...`;

            let mem_input = document.querySelector('#memory-input');

            ipcRenderer.send('rich-presence-disconnect', 'launching minecraft');

            // Update Settings preset before launch
            change_settings_preset(modpack_name, document.querySelector('#optimization-range').children[0].children[1].children[0].value);
            launch_minecraft(1000, mem_input.value * 1024, modpack_folder, userData['uid'], userData['uuid']).then(res => {
                console.log(`Minecraft exited with code: ${res}`);
                UpdateRedownloadCheckBox();
            }).catch(err => {
                console.log(`Launch encountered some errors: ${err}`);
                UpdateRedownloadCheckBox();
            });
        }
    } else {
        // Send message to main process to stop download 
        ipcRenderer.send('cancel-current-download', 'user cancelled');

        // React to reply from main
        ipcRenderer.on('download-cancelled', (event, status) => {

            //  Statuses:
            //  success - download cancelled succesfully
            //  no download in progress - no download in progress
            console.log(status);
            if (status == 'success') {
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
});

//#endregion