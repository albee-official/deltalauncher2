const { dialog } = require('electron').remote;
const { electron } = require('process');
const { param } = require('jquery');

document.querySelector('#version-span').innerHTML = app.getVersion();

let memory_range = document.querySelector('#memory-range');
let optimization_range = document.querySelector('#optimization-range');
let controll_inputs = document.querySelectorAll('.controll-setting-input');

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
let theme_select_options = document.querySelectorAll('#theme-select-option');

for (let item of theme_select_options)
{
    console.log(theme_select_options);
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

        document.querySelector('#bg-video').src = '';
        console.log(selected_file);
        console.log(extension);

        let resources_path = verify_and_get_resources_folder();
        let bg_path = resources_path + '\\custom_bg.' + extension;
        await fs.copy(selected_file, bg_path);
        bg_path = bg_path.replace(/\\/g, '/')
        console.log(bg_path);
        if (extension == 'mov' || extension == 'webm' || extension == 'mp4' || extension == 'ogg')
        {
            document.querySelector('#bg-video').src = `${bg_path}?${new Date()}`;
            check_muted_video();
        }
        else if (extension == 'png' || extension == 'jpeg' || extension == 'jpg' || extension == 'gif' || extension == 'bmp')
        {
            document.body.style.backgroundImage = `url("${bg_path}?${new Date()}")`;
        }

        settings['bg_extension'] = extension;
        update_settings();
    });
});

let muted_cb = document.querySelector('#muted-bg-cb');
muted_cb.addEventListener('click', () => {
    settings['bg_muted'] = muted_cb.checked;
    update_settings();
    check_muted_video();
});
//#endregion

//#region //. Remove custom BG
document.querySelector('#bg-reset-input').addEventListener('click', e => {
    settings['bg_extension'] = '';
    update_settings();

    BrowserWindow.getFocusedWindow().reload();
});
//#endregion
//#endregion

//#region //. ---------------- Handy Features ----------------------
document.querySelector('#open-root-folder').addEventListener('click', e => {
    shell.openItem(dir_root);
});

document.querySelector('#open-modpack-folder').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu();
    console.log(selected_modpack);

    let path = verify_and_get_modpack_folder(selected_modpack);
    shell.openItem(path);
});

document.querySelector('#delete-settings').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu();
    console.log(selected_modpack);

    let path = verify_and_get_modpack_folder(selected_modpack);

    if (fs.pathExistsSync(path + '\\options.txt'))
        fs.unlinkSync(path + '\\options.txt');

    if (fs.pathExistsSync(path + '\\optionsof.txt'))
        fs.unlinkSync(path + '\\optionsof.txt');

    if (fs.pathExistsSync(path + '\\optionsshaders.txt'))
        fs.unlinkSync(path + '\\optionsshaders.txt');

    if (fs.pathExistsSync(path + '\\knownkeys.txt'))
        fs.unlinkSync(path + '\\knownkeys.txt');
});

document.querySelector('#delete-configs').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu();
    console.log(selected_modpack);

    let path = verify_and_get_modpack_folder(selected_modpack);

    if (fs.pathExistsSync(path + '\\config'))
        rimraf.sync(path + '\\config');
});

document.querySelector('#reset-folder').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu();
    console.log(selected_modpack);

    let path = verify_and_get_modpack_folder(selected_modpack);

    fs.readdir(path, (err, files) => {
        files.forEach(file => {
            if (file != 'mods' && file != 'libraries' && file != 'versions' && file != 'assets' && file != 'settings' && file != 'info.json')
            {
                if (file.toString().split('.').length > 1)
                {
                    fs.unlinkSync(path + '\\' + file);
                }
                else
                {
                    rimraf.sync(path + '\\' + file);
                }
            }
        });
    });
});

document.querySelector('#delete-additional-files').addEventListener('click', async e => {
    let selected_modpack = await show_modpack_selection_menu();
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
    let selected_modpack = await show_modpack_selection_menu();
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

//#endregion

//#region //. ---------------- Memory range ------------------------

let max_setable_ram = Math.floor(os.freemem() / 1024 / 1024 / 1024);
console.log(max_setable_ram);
let min_setable_ram = 4; 

// runs when user moves the slider
memory_range.addEventListener('input', e => {
    // get <input> tag
    let input_range = e.currentTarget.children[0].children[1].children[0];

    // get div containing stops (markers)
    let input_stops = e.currentTarget.children[0].children[0].children;

    input_range.value = Math.max(Math.min(input_range.value, max_setable_ram), min_setable_ram);

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
memory_range.children[0].children[1].children[0].value = Math.max(Math.min(settings['allocated_memory'], max_setable_ram), min_setable_ram);
memory_range.addEventListener('change', () => {
    settings['allocated_memory'] = memory_range.children[0].children[1].children[0].value;
    update_settings();
})

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
});

// Change from settings or update settings
optimization_range.children[0].children[1].children[0].value = settings['optimization_level'];
optimization_range.addEventListener('change', e => {
    let input_range = e.currentTarget.children[0].children[1].children[0];
    settings['optimization_level'] = input_range.value;
    change_settings_preset(modpack_name, input_range.value);
    update_settings();
});

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

                // if we pressed ecape, we want to exit and not asign it.
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
        case 69: return 18; // e
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

//#region //. Modpack select ---------
async function show_modpack_selection_menu()
{
    return new Promise((resolve, reject) => {
        // get vars
        let menu = document.querySelector('#modpack-select-menu');
        let modpack_parapraph = document.querySelector('#modpack-select-p');
        let modpack_header = document.querySelector('#modpack-select-h');
        let modpack_input = document.querySelector('#modpack-select-input');

        let modpack_items = document.querySelectorAll('#modpack-select-p');
        let modpack_options = ['', '', '', ''];
        for (let i = 0; i < modpack_items.length; i++)
        {
            modpack_options[i] = modpack_items[i].getAttribute('data-name');
        }

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
