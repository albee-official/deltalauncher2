const { dialog } = require('electron').remote;
const { electron } = require('process');
const { param } = require('jquery');

if (settings['developer_mode']) {
    document.querySelector('#version-span').innerHTML = `Версия лаунчера: ${app.getVersion()} [ Режим разработчика ]`;
} else {
    document.querySelector('#version-span').innerHTML = `Версия лаунчера: ${app.getVersion()}`;
}

let memory_range = document.querySelector('#memory-range');
let optimization_range = document.querySelector('#optimization-range');
let controll_inputs = document.querySelectorAll('.controll-setting-input');

//#region //. ---------------- Developer settings ------------------
let dev_activate_timeout = false;
let dev_activate_clicks = 0;
document.querySelector('#launcher-version-p').addEventListener('click', e => {
    if (!dev_activate_timeout) {
        dev_activate_timeout = true;
        setTimeout(() => {
            dev_activate_timeout = false;
            dev_activate_clicks = 0;
        }, 5000);
    } else {
        dev_activate_clicks++;
        if (dev_activate_clicks > 8) {
            dev_activate_clicks = 0;
            console.log('[SETTINGS] You are now a developer!');
            settings['developer_mode'] = !settings['developer_mode'];
            if (settings['developer_mode']) {
                document.querySelector('#version-span').innerHTML = `Версия лаунчера: ${app.getVersion()} [ Режим разработчика ]`;
            } else {
                document.querySelector('#version-span').innerHTML = `Версия лаунчера: ${app.getVersion()}`;
            }
            win.reload();
            update_settings();
        }
    }
});

if (settings['developer_mode']) {
    document.querySelector('#handy-functions').innerHTML += 
        `<div id="delete-configs" class="handy-function">
            <p>Сбросить конфиги</p>
        </div>
        <div id="delete-additional-files" class="handy-function">
            <p>Удаление второстепенных файлов</p>
        </div>
        <div id="delete-reserved-files" class="handy-function">
            <p>Удаление резервных файлов и папок</p>
        </div>
        <label class="checkbox-left checkbox">
            <span class="additional-setting-name">Связать консоли майнкрафта и лаунчера</span>
            <input type="checkbox" id="link-consoles">
            <div class="checkmark">
                <div class="checkmark-fill"></div>
            </div>
        </label>
        <label class="checkbox-left checkbox">
            <span class="additional-setting-name">Использовать встроенную Java</span>
            <input type="checkbox" id="use-builtin-java">
            <div class="checkmark">
                <div class="checkmark-fill"></div>
            </div>
        </label>`.replace(/\s+/g, ' ');

    for (const server_container of document.querySelectorAll('.server')) {
        server_container.classList = 'server';
    }
}

for (const server_container of document.querySelectorAll('.server-unavailable')) {
    server_container.querySelector('.select-button').innerHTML = 'Недоступно';
}
//#endregion 

//#region //. ---------------- Java Parameters ---------------------

let java_parameters = document.querySelector('#java-parameters');

java_parameters.value = settings['java_parameters'];
java_parameters.addEventListener('input', e => {
    settings['java_parameters'] = java_parameters.value;
});

java_parameters.addEventListener('change', e => {
    settings['java_parameters'] = java_parameters.value;
    update_settings();
});
//#endregion

//#region //. ---------------- Theme selection ---------------------

//#region //. Change Theme
theme_select_options_container = document.querySelector('#theme-select-options');
for (let theme_key of Object.keys(themes_json)) {
    let theme_thing = themes_json[theme_key];
    theme_select_options_container.innerHTML += `<div id="theme-select-option" class="theme-select-option" data-name="${theme_thing['name']}">
            <p>${Capitalize_First_Letter(theme_thing['name'])}</p>
            <img src="${theme_thing['bg_path']}" alt="">
            <div class="theme-bg-preview-filter" style="${theme_thing['theme_select_options']}"></div>
        </div>`
}

let theme_select_options = document.querySelectorAll('#theme-select-option');

for (let item of theme_select_options)
{
    item.addEventListener('mouseover', () => {
        set_theme_colours(item.getAttribute('data-name'));
    });
}

document.querySelector('#change-theme-button').addEventListener('click', async e => {
    let selected_theme = await show_theme_selection_menu();

    settings['theme'] = selected_theme;
    update_settings();
    update_theme();

    // BrowserWindow.getFocusedWindow().reload();
});
//#endregion

//#region //. Set Custom BG
document.querySelector('#bg-select-input').addEventListener('click', e => {
    const win = BrowserWindow.getFocusedWindow();
    dialog.showOpenDialog(win, {
        title: 'Выберите изображение',
        defaultPath: '',
        buttonLabel: 'Выбрать',
        properties: ['openFile']
    }).then(async res => {
        if (res.canceled) return;

        let selected_file = res.filePaths[0];
        let splitted = selected_file.split('.');
        let extension = splitted[splitted.length - 1];

        if (extension == 'mov' || extension == 'webm' || extension == 'mp4' || extension == 'ogg' || extension == 'png' || extension == 'jpeg' || extension == 'jpg' || extension == 'gif' || extension == 'bmp') {}
        else
        {
            return;
        }

        //. Stop using this video or idk
        let video_el = document.querySelector('#bg-video');
        video_el.src = '';
        video_el.pause();
        video_el.removeAttribute('src'); // empty source
        video_el.load();
        
        //. Run garbage collector to stop using the file
        window.gc();

        //. Delete previous BG
        let resources_path = verify_and_get_resources_folder();
        if (await fs.pathExists(resources_path + '\\custom_bg.' + settings['bg_extension']))
            await fs.unlink(resources_path + '\\custom_bg.' + settings['bg_extension']);

        //. Copy new BG to resources and apply
        let bg_path = resources_path + '\\custom_bg.' + extension;
        await fs.copy(selected_file, bg_path);
        bg_path = bg_path.replace(/\\/g, '/')
        console.log(bg_path);
        if (extension == 'mov' || extension == 'webm' || extension == 'mp4' || extension == 'ogg')
        {
            document.querySelector('#bg-video').src = `${bg_path}?${new Date()}`;
            check_muted_video();
        }
        else
        {
            document.body.style.backgroundImage = `url("${bg_path}?${new Date()}")`;
        }

        settings['bg_extension'] = extension;
        update_additional_settings();
        update_settings();
    });
});
//#endregion

//#region //. Remove custom BG
document.querySelector('#bg-reset-input').addEventListener('click', e => {
    settings['bg_extension'] = '';
    update_settings();

    update_theme();
});
//#endregion

//#endregion

//#region //. ---------------- Default Shader Selection ------------
let default_shader = document.getElementById('default-shader');
if (settings['default_shader'] != '' && settings['default_shader'] != undefined) {
    default_shader.innerHTML = `Шейдер по умолчанию: ${settings['default_shader']}`;
} else {
    default_shader.innerHTML = `Шейдер по умолчанию не установлен`;
}
default_shader.addEventListener('click', async e => {
    if (e.ctrlKey) {
        settings['default_shader'] = '';
        default_shader.innerHTML = `Шейдер по умолчанию не установлен`;
        update_settings();
        return;
    }

    const win = BrowserWindow.getFocusedWindow();
    dialog.showOpenDialog(win, {
        title: 'Выберите Шейдер по умолчанию',
        defaultPath: '',
        buttonLabel: 'Выбрать',
        properties: ['openFile'],
        filters: [
            { name: 'Archives', extensions: ['zip'] }
        ]
    }).then(async res => {
        if (res.canceled) return;
        // Delete previous shader
        if (await fs.pathExists(verify_and_get_resources_folder() + '\\' + settings['default_shader']) && settings['default_shader'] != '' && settings['default_shader'] != undefined)
            await fs.unlink(verify_and_get_resources_folder() + '\\' + settings['default_shader']);

        // Get info about newly selected one
        let path = res.filePaths[0];
        let jojo = path.split('\\');
        let filename = jojo[jojo.length - 1];
        console.log(`[SETTINGS] New default shader: ${filename}`);
        
        // Copy shader to out directory
        await fs.copyFile(path, verify_and_get_resources_folder() + '\\' + filename);
        default_shader.innerHTML = `Шейдер по умолчанию: ${filename}`;

        settings['default_shader'] = filename;
        update_settings();
    });
});
//#endregion

//#region //. ---------------- Modpack Folder Selectrion -----------

let modpack_dirs = document.querySelectorAll('#modpack-dir');
for (let jojo of modpack_dirs)
{
    jojo.children[1].innerHTML = verify_and_get_modpack_folder(jojo.children[0].innerHTML.toLowerCase());
    jojo.addEventListener('click', e => {
        if (e.ctrlKey) {
            shell.openItem(verify_and_get_modpack_folder(e.currentTarget.children[0].innerHTML.toLowerCase()));
            return;
        }

        let current_modpack_dir = e.currentTarget;
        let modpack_dir_p = current_modpack_dir.children[1];
        if (current_modpack_dir.classList.contains('updating')) return;
        dialog.showOpenDialog(win, {
            title: 'Выберите Папку',
            defaultPath: '',
            buttonLabel: 'Выбрать',
            properties: ['openDirectory']
        }).then(async res => {
            if (res.canceled) return;
            let path = res.filePaths[0];
            let current_modpack = current_modpack_dir.children[0].innerHTML.toLowerCase();
            modpack_dir_p.innerHTML = path;
            path = path.replace(dir_root, '|ROOT|');
            settings['modpack_dirs'][current_modpack] = path;
            needs_an_update[current_modpack] = false;
            if (current_modpack == modpack_name) // Just to update the footer if needed (thats not dumb okay)
                setModpack(modpack_name);
        });
    });
}
let modpack_update_paragraphs = document.querySelectorAll('.directory-modpack-update');
let counter = 0;
let launch_update_counter = 0;
let update_animator = setInterval(() => {
    for (let modpack_update_p of modpack_update_paragraphs) {
        if (counter % 4 == 0) {
            modpack_update_p.innerHTML = 'Обновляется';
            counter = 0;
        } else {
            modpack_update_p.innerHTML += '.';
        }
    }
    counter++;
}, 1000);
//#endregion

//#region //. ---------------- Handy Features ----------------------
document.querySelector('#open-root-folder').addEventListener('click', e => {
    shell.openItem(dir_root);
});

document.querySelector('#open-modpack-folder').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu().catch(err => { console.log(err); return; });
    if (selected_modpack == undefined) return;
    console.log(selected_modpack);

    let path = verify_and_get_modpack_folder(selected_modpack);
    shell.openItem(path);
});

document.querySelector('#delete-settings').addEventListener('click', async e => {
    fs.unlink(settings_path);
    reloadWin(true);
});

document.querySelector('#reset-folder').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu().catch(err => { console.log(err); return; });
    if (selected_modpack == undefined) return;
    console.log(selected_modpack);

    let path = verify_and_get_modpack_folder(selected_modpack);
    await rimraf(path, (err) => {
        if (err) console.log(err);
        console.log(`[SETTINGS] Successfully deleted ${selected_modpack}`);
        setModpack(modpack_name);
    });
});

if (settings['developer_mode']){
    document.querySelector('#delete-configs').addEventListener('click', async e => {
        let selected_modpack = await show_modpack_selection_menu().catch(err => { console.log(err); return; });
        if (selected_modpack == undefined) return;
        console.log(selected_modpack);
    
        let path = verify_and_get_modpack_folder(selected_modpack);
    
        if (fs.pathExistsSync(path + '\\config'))
            rimraf.sync(path + '\\config');
    });
    
    document.querySelector('#delete-additional-files').addEventListener('click', async e => {
        let selected_modpack = await show_modpack_selection_menu().catch(err => { console.log(err); return; });
        if (selected_modpack == undefined) return;
        console.log(selected_modpack);
    
        let path = verify_and_get_modpack_folder(selected_modpack);
    
        if (fs.pathExistsSync(path + '\\resources'))
            rimraf.sync(path + '\\resources');
    
        if (fs.pathExistsSync(path + '\\local'))
            rimraf.sync(path + '\\local');
    
        if (fs.pathExistsSync(path + '\\scripts'))
            rimraf.sync(path + '\\scripts');
    
        if (fs.pathExistsSync(path + '\\shaderpacks'))
            rimraf.sync(path + '\\shaderpacks');
    
        if (fs.pathExistsSync(path + '\\resourcepacks'))
            rimraf.sync(path + '\\resourcepacks');
    
        if (fs.pathExistsSync(path + '\\servers.dat'))
            fs.unlinkSync(path + '\\servers.dat');
    });
    
    document.querySelector('#delete-reserved-files').addEventListener('click', async e => {
        let selected_modpack = await show_modpack_selection_menu().catch(err => { console.log(err); return; });
        if (selected_modpack == undefined) return;
        console.log(selected_modpack);
    
        let path = verify_and_get_modpack_folder(selected_modpack);
    
        if (fs.pathExistsSync(path + '\\asm'))
            rimraf.sync(path + '\\asm');
    
        if (fs.pathExistsSync(path + '\\journeymap'))
            rimraf.sync(path + '\\journeymap');
    
        if (fs.pathExistsSync(path + '\\CustomSkinLoader'))
            rimraf.sync(path + '\\CustomSkinLoader');
    
        if (fs.pathExistsSync(path + '\\server-resource-packs'))
            rimraf.sync(path + '\\server-resource-packs');
    
        if (fs.pathExistsSync(path + '\\.mixin.out'))
            fs.unlinkSync(path + '\\.mixin.out');
    
        if (fs.pathExistsSync(path + '\\crafttweaker.log'))
            fs.unlinkSync(path + '\\crafttweaker.log');
    });
    
    document.querySelector('#link-consoles').checked = settings['link_consoles'];
    document.querySelector('#link-consoles').addEventListener('input', () => {
        settings['link_consoles'] = document.querySelector('#link-consoles').checked;
        update_settings();
    });

    document.querySelector('#use-builtin-java').checked = settings['use_builtin_java'];
    document.querySelector('#use-builtin-java').addEventListener('input', () => {
        settings['use_builtin_java'] = document.querySelector('#use-builtin-java').checked;
        update_settings();
    });
}

//#endregion

//#region //. ---------------- Memory range ------------------------

// Already declared in play.js
// let max_setable_ram = Math.floor(os.freemem() / 1024 / 1024 / 1024);
// console.log(max_setable_ram);
// let min_setable_ram = 4; 

// runs when user moves the slider
memory_range.addEventListener('input', e => {
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
memory_range.children[0].children[1].children[0].value = Math.max(Math.min(settings['allocated_memory'], max_setable_ram), min_setable_ram);
document.querySelector('#settings-memory-header').innerHTML = `Выделение памяти: ${settings['allocated_memory']}Gb`;
document.querySelector('#play-memory-header').innerHTML = `Выделение памяти: ${settings['allocated_memory']}Gb`;
memory_range.addEventListener('change', () => {
    settings['allocated_memory'] = memory_range.children[0].children[1].children[0].value;
    document.querySelector('#play-memory-range').children[0].children[1].children[0].value = memory_range.children[0].children[1].children[0].value; // Sync 2 memory ranges
    update_settings();
})

if (settings['allocated_memory'] < 6) {
    document.querySelector('#memory-tip').classList.remove('tip-hidden');
} else {
    document.querySelector('#memory-tip').classList.add('tip-hidden');
}

//#endregion

//#region //. ---------------- Optimization range ------------------

// runs when user moves the slider
optimization_range.addEventListener('input', e => {
    // get <input> tag
    let input_range = e.currentTarget.children[0].children[1].children[0];

    // get div containing stops (markers)
    let input_stops = e.currentTarget.children[0].children[0].children;

    // loop through all stops
    for (let i = 0; i < input_stops.length; i++) {

        // if stop index is the same as input value, then it is active
        // otherwise it is not
        if (i == input_range.value) {
            input_stops[i].classList.add('active-stop');
        } else {
            input_stops[i].classList.remove('active-stop');
        }
    }

    if (input_range.value == 0) {
        document.querySelector('#optimization-tip').classList.remove('tip-hidden');
    } else {
        document.querySelector('#optimization-tip').classList.add('tip-hidden');
    }
});

// Change from settings or update settings
optimization_range.children[0].children[1].children[0].value = settings['optimization_level'];
optimization_range.addEventListener('change', e => {
    let input_range = e.currentTarget.children[0].children[1].children[0];
    settings['optimization_level'] = input_range.value;
    change_settings_preset(modpack_name, input_range.value);
    update_settings();
});

if (settings['optimization_level'] == 0) {
    document.querySelector('#optimization-tip').classList.remove('tip-hidden');
} else {
    document.querySelector('#optimization-tip').classList.add('tip-hidden');
}

//#endregion

//#region //. ---------------- Control settings --------------------

// run through all controll inputs
for (let input of controll_inputs) {

    // change to values in settings
    input.innerHTML = settings['controls'][input.previousSibling.previousSibling.id]['key_name'];

    // made them buttons
    input.addEventListener('click', async e => {
        let el = e.currentTarget;
        console.log(el);
        show_key_select(el).then(res => {
            el.innerHTML = res;
            apply_control_settings();
        }).catch(err => {
            console.log(err);
        });
    });
}

let changing_some_key = false;

// This function shows and listens for key. 
// When key is pressed, resolves.
async function show_key_select(el) {
    return new Promise((resolve, reject) => {
        // get vars
        let menu = document.querySelector('#key-select-menu');
        let key_parapraph = document.querySelector('#key-select-p');
        let key_header = document.querySelector('#key-select-h');
        let key_input = document.querySelector('#key-select-input');

        // opens thing that says to press a key
        menu.classList.add('open');
        key_parapraph.innerHTML = 'Нажмите любую клавишу';

        // idk why we need to previoussibleng... makes no sense tho it works :D
        key_header.innerHTML = el.previousSibling.previousSibling.innerHTML;

        // listens if we pressed any key
        changing_some_key = true;
        $(document).keydown(e => {
            if (changing_some_key)
            {
                console.log(`${e.key} is ${ascii_to_dumbass(e.keyCode)} in minecraft`);

                // Makes keyname uppercase (CAPITAL) and handles if this key is functional
                let display_key = e.key.toUpperCase();
                if (display_key == ' ') display_key = 'SPACE';

                // notify user that everyghing worked and close menu
                key_parapraph.innerHTML = display_key;
                key_header.innerHTML = 'Готово';
                close_menu(menu);
                changing_some_key = false;

                //~ if we pressed ecape, we want to exit and not asign it.
                if (display_key == 'ESCAPE') {
                    changing_some_key = false;
                    key_parapraph.innerHTML = 'Нажмите любую клавишу';
                    key_header.innerHTML = 'Отмена';
                    display_key = 'NONE';
                    reject('user closed');
                }
                
                // Updates settings with new key
                settings['controls'][el.previousSibling.previousSibling.id]['key_name'] = display_key;
                settings['controls'][el.previousSibling.previousSibling.id]['key_code'] = e.keyCode;
                settings['controls'][el.previousSibling.previousSibling.id]['minecraft_code'] = ascii_to_dumbass(e.keyCode);
                update_settings();

                console.log(display_key);
                console.log(el.previousSibling.previousSibling.id);
                console.log(settings);

                // resolve with key
                $(document).off('keydown');
                resolve(display_key);
            }
        });

        // Closing menu selection if user clicked on the screen
        key_input.focus();
        key_input.addEventListener("blur", e => {
            console.log('focus lost');
            close_menu(menu);
            changing_some_key = false;
            $(document).off('keydown');
            reject('user cancelled');
        });
    });
}

// I manually wrote this and i regret doing it
function ascii_to_dumbass(keycode) {
    switch (keycode) {
        //#region Alphabet
        case 65: return 30; // a
        case 66: return 48; // b
        case 67: return 46; // c
        case 68: return 32; // d
        case 69: return 18; // e NICE
        case 70: return 33; // f
        case 71: return 34; // g
        case 72: return 35; // h
        case 73: return 23; // i
        case 74: return 36; // j
        case 75: return 37; // k
        case 76: return 38; // l
        case 77: return 50; // m
        case 78: return 49; // n
        case 79: return 24; // o
        case 80: return 25; // p
        case 81: return 16; // q
        case 82: return 19; // r
        case 83: return 31; // s
        case 84: return 20; // t
        case 85: return 22; // u
        case 86: return 47; // v
        case 87: return 17; // w
        case 88: return 45; // x
        case 89: return 21; // y
        case 90: return 44; // z
        //#endregion
        //#region nums
        case 48: return 11; // 0
        case 49: return 2; // 1
        case 50: return 3; // 2
        case 51: return 4; // 3
        case 52: return 5; // 4
        case 53: return 6; // 5
        case 54: return 7; // 6
        case 55: return 8; // 7
        case 56: return 9; // 8
        case 57: return 10; // 9
        //#endregion
        //#region modifiers
        case 16: return 42; // SHIFT
        case 17: return 29; // CONTOLL
        case 18: return 42; // ALT
        case 18: return 42; // CAPS LOCK ( CAPITAL :) )
        case 9: return 15; // TAB
        case 192: return 41; // GRAVE ( ` )
        case 32: return 57; // SPACE ( )
        //#endregion
        default: return 0;
    }
}

//#endregion

//#region //. ---------------- Select Functions --------------------

//#region //. List select ---------
async function show_select_from_list(header, options)
{
    return new Promise((resolve, reject) => {
        // get vars
        let menu = document.querySelector('#select-menu');
        let menu_header = document.querySelector('#select-h');
        menu_header.innerHTML = header;

        function select_option(e) {
            let el = e.currentTarget;
            for (let option_el of option_elements)
            {
                option_el.removeEventListener('click', select_option);
            }

            close_menu(menu);
            resolve(el.getAttribute('data-name'));
        };

        let option_elements = [];
        for (let i = 0; i < options.length; i++)
        {
            let option = options[i];
            let el = document.createElement('p');
            el.id = 'select-p';
            el.setAttribute('data-name', option);
            el.innerHTML = option;
            menu.children[0].appendChild(el);
            option_elements.push(el);

            el.addEventListener('click', select_option);
        }

        menu.classList.add('open');
    });
}
//#endregion

//#region //. Modpack select ---------
async function show_modpack_selection_menu()
{
    return new Promise((resolve, reject) => {
        // get vars
        let menu = document.querySelector('#modpack-select-menu');
        let modpack_parapraph = document.querySelector('#modpack-select-p');
        let modpack_header = document.querySelector('#modpack-select-h');

        let modpack_items = document.querySelectorAll('#modpack-select-p');
        let modpack_options = ['', '', '', ''];
        for (let i = 0; i < modpack_items.length; i++)
        {
            modpack_options[i] = modpack_items[i].getAttribute('data-name');
        }

        menu.addEventListener('click', () => {
            close_menu(menu);
            reject('manually closed');
        });

        function setval(e) {
            let el = e.currentTarget;
            for (let item of modpack_items)
            {
                item.removeEventListener('click', setval);
            }

            close_menu(menu);
            resolve(el.getAttribute('data-name'));
        };

        for (let item of modpack_items)
        {
            item.addEventListener('click', setval);
        }

        menu.classList.add('open');
    });
}
//#endregion

//#region //. Theme select -----------
async function show_theme_selection_menu()
{
    return new Promise((resolve, reject) => {
        // get vars
        let menu = document.querySelector('#theme-select-menu');

        let theme_items = document.querySelectorAll('#theme-select-option');

        function setval(e) {
            let el = e.currentTarget;
            for (let item of theme_items)
            {
                item.removeEventListener('click', setval);
            }

            close_menu(menu);
            resolve(el.getAttribute('data-name'));
        };

        for (let item of theme_items)
        {
            item.addEventListener('click', setval);
        }

        menu.classList.add('open');
    });
}

// i mean, it does what it says... sloses menu (removes open class)
function close_menu(menu) {
    menu.classList.remove('open');
}
//#endregion

//#endregion

//#region //. ---------------- Play settings -----------------------

// Addon mods in settings
let settings_addon_cbs = document.querySelectorAll('.settings-addon-cb');
for (let addon_cb of settings_addon_cbs) {
    let input = addon_cb.querySelector('input');
    let dataName = addon_cb.getAttribute('data-name');

    input.checked = settings['addon_mods'][dataName];
    
    input.addEventListener('change', () => {        
        document.querySelector(`.play-addon-cb[data-name="${dataName}"] input`).checked = input.checked;

        settings['addon_mods'][dataName] = input.checked;
        update_settings();
    });
}

// Addon mods in play
let play_addon_cbs = document.querySelectorAll('.play-addon-cb');
for (let addon_cb of play_addon_cbs) {
    let input = addon_cb.querySelector('input');
    let dataName = addon_cb.getAttribute('data-name');

    input.checked = settings['addon_mods'][dataName];
    
    input.addEventListener('change', () => {        
        document.querySelector(`.settings-addon-cb[data-name="${dataName}"] input`).checked = input.checked;

        settings['addon_mods'][dataName] = input.checked;
        update_settings();
    });
}

let prev_click_event = function(e) {};
// Modpack directory
async function updateSideModpackDir(modpack)
{
    let dir = settings['modpack_dirs'][modpack];
    let el = document.querySelector('#play-game-dir-input')
    el.innerHTML = dir.replace('|ROOT|', '...');

    el.removeEventListener('click', prev_click_event);

    prev_click_event = function(e) {
        let path = verify_and_get_modpack_folder(modpack);
        shell.openItem(path);
    }

    el.addEventListener('click', prev_click_event);
}
//#endregion 

//#region //. ---------------- Additional settings -----------------
update_additional_settings();
function update_additional_settings() {
    if (is_video_on_bg()) {
        document.querySelector('#muted-bg-container').classList.remove('invisible');
    } else {
        document.querySelector('#muted-bg-container').classList.add('invisible');
    }
}

let muted_cb = document.querySelector('#muted-bg-cb');
muted_cb.checked = settings['bg_muted'];
check_muted_video();
muted_cb.addEventListener('click', () => {
    settings['bg_muted'] = muted_cb.checked;
    update_settings();
    check_muted_video();
});

let blurred_cb = document.querySelector('#bg-blurred-cb');
blurred_cb.checked = settings['bg_blurred'];
check_blurred_bg();
blurred_cb.addEventListener('click', () => {
    settings['bg_blurred'] = blurred_cb.checked;
    update_settings();
    check_blurred_bg();
});

let hide_upon_launch_cb = document.querySelector('#hide-upon-launch-cb');
hide_upon_launch_cb.checked = settings['hide_upon_launch'];
hide_upon_launch_cb.addEventListener('change', () => {
    settings['hide_upon_launch'] = hide_upon_launch_cb.checked;
    update_settings();
});
//#endregion

