const fs = require('fs-extra');
const path = require('path');
const hidefile = require('hidefile');
const { app, BrowserWindow } = require("electron").remote;
const { shell } = require('electron');
const { exec } = require('child_process');

let os = require('os');
console.log(`[INFO] OS type: ${os.arch()}`);
let os_version = os.release().split('.')[0];

const modpacks = [
    "magicae",
    "fabrica",
    "statera",
    "insula",
    "odyssea"
];

const settings_levels = {
    0: 'low',
    1: 'minor',
    2: 'default',
    3: 'high',
    4: 'ultra'
};

let modpack_folders = {};

let dir_root = app.getPath("appData") + "\\.delta";
const modpacks_path = dir_root + "\\modpacks";
const settings_path = dir_root + "\\settings.json";
const themes_path = dir_root + "\\themes.json";
const libs_path = dir_root + "\\libs";
const res_path = dir_root + "\\resources";

function verify_root_dirs()
{
    fs.ensureDir(dir_root);
    fs.ensureDir(modpacks_path);
    fs.ensureDir(libs_path);
    fs.ensureDir(res_path);

    if (!fs.pathExistsSync(settings_path))
    {
        fs.createFileSync(settings_path);
    }

    if (!fs.pathExistsSync(themes_path))
    {
        fs.createFileSync(themes_path);
    }
    
}

function verify_and_get_settings_file()
{
    if (!fs.pathExistsSync(settings_path))
    {
        fs.createFileSync(settings_path);
    }
    return settings_path;
}

function verify_and_get_themes_file()
{
    if (!fs.pathExistsSync(themes_path))
    {
        fs.createFileSync(themes_path);
    }
    return themes_path;
}

function verify_and_get_modpack_folder(modpack_name)
{
    let active_folder = modpack_folders[modpack_name.toLowerCase()].replace('|ROOT|', dir_root);
    fs.ensureDirSync(active_folder);
    return active_folder;
}

function only_get_modpack_path(modpack_name)
{
    let active_folder = modpack_folders[modpack_name.toLowerCase()].replace('|ROOT|', dir_root);
    return active_folder;
}

function verify_and_get_libs_folder(item_name = '')
{
    fs.ensureDirSync(libs_path);
    return libs_path;
}

function verify_and_get_resources_folder()
{
    fs.ensureDirSync(res_path);
    return res_path;
}

function is_directry_empty(path) {
    return fs.readdirSync(path).length === 0;
}

function clear_modpack_folder(modpack_name)
{
    return new Promise((resolve, reject) => {
        let path = only_get_modpack_path(modpack_name);

        if (fs.existsSync(path))
        {
            fs.readdir(path, (err, files) => {
                files.forEach(file => {
                    if (file.toString().split('.').length > 1 && file.toString() != '.mixin.out')
                    {
                        if (fs.pathExistsSync(path + '\\' + file)) fs.unlinkSync(path + '\\' + file);
                    }
                    else
                    {
                        if (fs.pathExistsSync(path + '\\' + file)) rimraf.sync(path + '\\' + file);
                    }
                });
    
                resolve();
            });
        }
        else
        {
            resolve();
        }
    });
}

function modpack_folder_empty(modpack_name) {
    let active_folder = verify_and_get_modpack_folder(modpack_name);
    return is_directry_empty(active_folder);
}

function settings_exist(modpack) {
    let modpack_folder = verify_and_get_modpack_folder(modpack);
    return fs.pathExistsSync(modpack_folder + '\\options.txt') 
        && fs.pathExistsSync(modpack_folder + '\\optionsof.txt') 
        && fs.pathExistsSync(modpack_folder + '\\optionsshaders.txt');
}

function is_first_launch(modpack) {
    let modpack_folder = verify_and_get_modpack_folder(modpack);
    return fs.pathExistsSync(modpack_folder + '\\.mixin.out');
}

function change_settings_preset(modpack_name, settings_lvl) {
    if (modpack_not_installed(modpack_name))
        return;

    let preset = settings_levels[settings_lvl];
    
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);
    let settings_folder = modpack_folder + '\\options';
    let settings_preset_folder = settings_folder + '\\' + preset;

    fs.copySync(settings_preset_folder, modpack_folder);
    apply_control_settings();
}

async function apply_control_settings() {
    for (const modpack_name of modpacks) {
        let modpack_folder = verify_and_get_modpack_folder(modpack_name);

        let options_path = modpack_folder + '\\options.txt';
        let of_options_path = modpack_folder + '\\optionsof.txt';
        if (!(await fs.exists(options_path))) { 
            console.log('[SETTINGS] There is no options in ' + modpack_name);
            continue;
        }
        
        if (!(await fs.exists(of_options_path))) { 
            console.log('[SETTINGS] There is no optifine options in ' + modpack_name);
            continue;
        }

        let options_string = await fs.readFile(options_path);
        let new_options_string = options_string;

        let controls_object = { ...settings['controls'] };
        // Dismount is the same as the crouch
        controls_object['dismount'] = { ...controls_object['crouch'] };
        controls_object['dismount']['minecraft_key'] = 'key_key.dismount';
        console.log(controls_object);


        let changed_smth = false;
        for (const key of Object.keys(controls_object))
        {
            let minecraft_key = controls_object[key]['minecraft_key'];
            let minecraft_code = controls_object[key]['minecraft_code'];
            
            let new_control_line = `${minecraft_key}:${minecraft_code}`;

            let index_of_key = options_string.indexOf(minecraft_key + ':');
            let start_index_of_val = index_of_key + (minecraft_key + ':').length;
            let val = '';
            for (let i = 0; i < 4; i++)
            {
                let symbol = options_string.toString().charAt(start_index_of_val + i);
                if (symbol == '\n') { break; }
                val += symbol;
            }

            let old_control_line = `${minecraft_key}:${val}`;

            // Write to optionsof as well cuz this key is fucking special (fuck optifine)
            if (minecraft_key == 'key_of.key.zoom') {
                let of_options_string = await fs.readFile(of_options_path);
                let of_new_control_line = `key_of.key.zoom:${minecraft_code}`;

                let of_index_of_key = of_options_string.indexOf('key_of.key.zoom:');
                let of_start_index_of_val = of_index_of_key + ('key_of.key.zoom:').length;
                let of_val = '';
                for (let i = 0; i < 4; i++)
                {
                    let of_symbol = of_options_string.toString().charAt(of_start_index_of_val + i);
                    if (of_symbol == '\n') { break; }
                    of_val += of_symbol;
                }

                let of_old_control_line = `key_of.key.zoom:${of_val}`;
                of_new_options_string = new_options_string.toString().replace(of_old_control_line, of_new_control_line);

                if (old_control_line == new_control_line) {
                    console.log(`[SETTINGS] <optionsof.txt> Unchanged: ${old_control_line}`);
                } else {
                    console.log(`[SETTINGS] <optionsof.txt> From: ${of_old_control_line}`);
                    console.log(`[SETTINGS] <optionsof.txt> To: ${of_new_control_line}`);
                    await fs.writeFile(of_options_path, of_new_options_string);
                }
            }

            if (old_control_line == new_control_line) {
                console.log(`[SETTINGS] <options.txt> Unchanged: ${old_control_line}`);
                continue;
            }

            changed_smth = true;
            console.log(`[SETTINGS] <options.txt> From: ${old_control_line}`);
            console.log(`[SETTINGS] <options.txt> To: ${new_control_line}`);
            new_options_string = new_options_string.toString().replace(old_control_line, new_control_line);
        }
        
        if (changed_smth){
            console.log(`[SETTINGS] <options.txt> Updating file`);
            await fs.writeFile(options_path, new_options_string);
        } else {
            console.log(`[SETTINGS] <options.txt> No changes have been made.`);
        }
    }
}

function modpack_not_installed(modpack_name)
{
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);
    return modpack_folder_empty(modpack_name) || 
            fs.pathExistsSync(modpack_folder + '\\modpack.zip') || 
            !fs.pathExistsSync(modpack_folder + '\\mods');
}

async function libs_folder_empty(modpack_name)
{
    let _libs_path = verify_and_get_libs_folder(modpack_name) + '\\' + modpack_versions[modpack_name];
    if (!(await fs.pathExists(`${_libs_path}\\assets`)))
    {
        return true;
    }
    if (!(await fs.pathExists(`${_libs_path}\\libraries`)))
    {
        return true;
    }
    if (!(await fs.pathExists(`${_libs_path}\\versions`)))
    {
        return true;
    }
    return false;
}

async function check_libs_in_modpack(modpack_name)
{
    let _modpack_path = verify_and_get_modpack_folder(modpack_name);
    if (!(await fs.pathExists(`${_modpack_path}\\assets`)))
    {
        return false;
    }
    if (!(await fs.pathExists(`${_modpack_path}\\libraries`)))
    {
        return false;
    }
    if (!(await fs.pathExists(`${_modpack_path}\\versions`)))
    {
        return false;
    }
    return true;
}

function verify_and_get_path_to_info(item_name, version = '1.12.2')
{
    let path;
    if (item_name == 'libraries')
    {
        path = verify_and_get_libs_folder(item_name) + '\\' + version + '\\info.json';
    }
    else
    {
        path = verify_and_get_modpack_folder(item_name) + '\\info.json';
    }

    if (!fs.pathExistsSync(path))
    {
        fs.createFileSync(path);
        fs.writeFileSync(path, '{}');
    }
    return path;
}

// async function get_available_shaders(modpack_name)
// {
//     let dir = verify_and_get_modpack_folder(modpack_name) + '\\shaderpacks';
//     let shaders = {};
//     let shader_names = await fs.readdir(dir)
//     shader_names.push('Без шейдера')

//     let selected_shader = await show_select_from_list('Выберите шейдер по умолчанию', shader_names);
//     await update_shader(modpack_name, selected_shader);
// }

async function update_shader(modpack_name, shader_name)
{
    let dir = verify_and_get_modpack_folder(modpack_name);

    // Switch fast render off if needed
    let options_path = dir + '\\optionsof.txt';
    let optionsof_contents = (await fs.readFile(options_path)).toString();
    if (optionsof_contents.includes('ofFastRender:true')) {
        console.log('[SETTINGS] Turning off fast render');
        optionsof_contents.replace('ofFastRender:true', 'ofFastRender:false');
        await fs.writeFile(options_path, optionsof_contents);
    }

    // Read options of file and parse (serialize yeah im SMaRt) it
    let shaderoptions_path = dir + '\\optionsshaders.txt';
    let shaderoptions_content = (await fs.readFile(shaderoptions_path)).toString().split('\n');

    //. Check if we even need to change shader
    if (shaderoptions_content[1] == `shaderPack=${shader_name}`) {
        console.log('[SETTINGS] Needed shader is already selected');
    } else {

        // Write new shader name to optionsof file
        shaderoptions_content[1] = `shaderPack=${shader_name}`;
        shaderoptions_content = shaderoptions_content.join('\n');
        console.log('[SETTINGS] Changing shader');
        await fs.writeFile(shaderoptions_path, shaderoptions_content);
    }

    // Copy shader from resource files if it is abscent
    await fs.ensureDir(dir + '\\shaderpacks\\')
    if (await fs.pathExists(dir + '\\shaderpacks\\' + shader_name)) {
        console.log(`[SETTINGS] Needed shader is already in folder, no need to copy: ${dir + '\\shaderpacks\\' + shader_name}`);
    } else {
        console.log(`[SETTINGS] No shader found in shaderpacks, copying: ${shader_name}`);
        await fs.copyFile(verify_and_get_resources_folder() + '\\' + shader_name, dir + '\\shaderpacks\\' + shader_name);
    }
}

function get_item_version_from_info(item_name) {
    let path = verify_and_get_path_to_info(item_name);
    let json = JSON.parse(fs.readFileSync(path));
    if (!json['version'])
    {
        json['version'] = 'v0.0.0.0';
    }
    return json['version'];
}

async function set_item_version_to_info(item_name, version)
{
    let path = verify_and_get_path_to_info(item_name);
    console.log(`[SETTINGS] Writing to ${path}`);
    let json = JSON.parse(await fs.readFile(path));
    json['version'] = version;
    await fs.writeFile(path, JSON.stringify(json));
}

async function verify_user_skin(modpack) {
    await fs.ensureDir(verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader`);
    await fs.ensureDir(verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader\\Local`);
    await fs.ensureDir(verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader\\Local\\skins`);
    await fs.copyFile(verify_and_get_resources_folder() + `\\${resources.skin.full_name}`, verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader\\Local\\skins\\${userInfo['username']}.png`);

    await fs.ensureDir(verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader`);
    await fs.ensureDir(verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader\\LocalSkin`);
    await fs.ensureDir(verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader\\LocalSkin\\skins`);
    await fs.copyFile(verify_and_get_resources_folder() + `\\${resources.skin.full_name}`, verify_and_get_modpack_folder(modpack) + `\\CustomSkinLoader\\LocalSkin\\skins\\${userInfo['username']}.png`);
    
    return;
}

function launch_minecraft(min_mem, max_mem, game_dir, username, uuid, _modpack_name)
{
    ipcRenderer.send('modpack-launch', {
        settings: {...settings},
        _modpack_name: _modpack_name,
        min_mem: min_mem,
        max_mem: max_mem,
        game_dir: game_dir,
        username: username,
        uuid: uuid,
    });
}

async function absolutely_utterly_obliterate_minecraft(hardkill = false) {
    return new Promise((resolve, reject) => {
        pid = launchedModpacks[modpack_name]['pid'];
        if (pid == null) resolve();

        if (pid == -1) {
            console.log('[LAUNCH] Minecraft hasnt launched yet, wait until it is at least half loaded');
            resolve();
        }

        if (hardkill) {
            process.kill(pid, 'SIGKILL');
        } else {
            process.kill(pid);
        }

        launchedModpacks[modpack_name]['process'] = undefined;
        launchedModpacks[modpack_name]['pid'] = -1;
        launchedModpacks[modpack_name]['launched'] = false;
        launchedModpacks[modpack_name]['visible'] = false;
        launchedModpacks = launchedModpacks;

        console.log('[LAUNCH] Minecraft was successfully annihilated');
        resolve();
    });
}


//#region
if (true == false) {
    app;
    fs;
    modpack_root;
    modpacks_path;
    settings_path;
    core_path;
    verify_root_dirs();
    verify_and_get_modpack_folder();
    get_configs_path();
    modpack_folder_empty();
    verify_and_get_libs_folder();
    verify_and_get_resources_folder();
    libs_folder_empty();
    verify_libs_in_mod();
    check_libs_in_modpack();
    copy_libs_to_modpack();
    clear_modpack_folder();
    launch_minecraft();
    modpack_not_installed();
    verify_and_get_settings_file();
    change_settings_preset();
    set_item_version_to_info();
    get_modpack_version_from_info();
}
//#endregion