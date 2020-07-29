const fs = require('fs-extra');
const { app, BrowserWindow } = require("electron").remote;
const path = require('path');
const { exec, spawn, fork } = require('child_process');
const { shell } = require('electron');

let os = require('os');
console.log(os);
console.log(os.arch());
let os_version = os.release().split('.')[0];

const modpacks = [
    "magicae",
    "fabrica",
    "statera",
    "insula"
];

const settings_levels = {
    0: 'lowest',
    1: 'low',
    2: 'medium',
    3: 'high',
    4: 'ultra'
};

let modpack_folders = {};

let dir_root = app.getPath("appData") + "\\.delta";
const modpacks_path = dir_root + "\\modpacks";
const settings_path = dir_root + "\\settings.json";
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
    
}

function verify_and_get_settings_file()
{
    if (!fs.pathExistsSync(settings_path))
    {
        fs.createFileSync(settings_path);
    }
    return settings_path;
}

function verify_and_get_modpack_folder(modpack_name)
{
    let active_folder = modpack_folders[modpack_name.toLowerCase()].replace('|ROOT|', dir_root) + '\\' + modpack_name;
    fs.ensureDirSync(active_folder);
    return active_folder;
}

function verify_and_get_libs_folder()
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
    rimraf.sync(verify_and_get_modpack_folder(modpack_name));
}

function modpack_folder_empty(modpack_name)
{
    let active_folder = verify_and_get_modpack_folder(modpack_name);
    return is_directry_empty(active_folder);
}

function change_settings_preset(modpack_name, settings_lvl)
{
    if (modpack_not_installed(modpack_name))
        return;

    let preset = settings_levels[settings_lvl];
    
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);
    let settings_folder = modpack_folder + '\\settings';
    let settings_preset_folder = settings_folder + '\\' + preset;

    fs.copySync(settings_preset_folder, modpack_folder);
    apply_control_settings();
}

function apply_control_settings() {
    for (const modpack_name of modpacks) {
        let modpack_folder = verify_and_get_modpack_folder(modpack_name);

        let options_path = modpack_folder + '\\options.txt';
        if (!fs.existsSync(options_path)) { 
            console.log('there is no options in' + modpack_name);
            continue;
        }

        let options_string = fs.readFileSync(options_path);
        let new_options_string = options_string;

        for (const key of Object.keys(settings['controls']))
        {
            let minecraft_key = settings['controls'][key]['minecraft_key'];
            let minecraft_code = settings['controls'][key]['minecraft_code'];
            
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
            console.log(old_control_line);
            console.log(new_control_line);
            new_options_string = new_options_string.toString().replace(old_control_line, new_control_line);
        }
        
        fs.writeFileSync(options_path, new_options_string);
    }
}

function modpack_not_installed(modpack_name)
{
    let modpack_folder = verify_and_get_modpack_folder(modpack_name);
    return modpack_folder_empty(modpack_name) || 
            fs.pathExistsSync(modpack_folder + '\\modpack.zip') || 
            !fs.pathExistsSync(modpack_folder + '\\mods');
}

function libs_folder_empty()
{
    return is_directry_empty(libs_path);
}

function check_libs_in_mod(modpack_name)
{
    let _modpack_path = verify_and_get_modpack_folder(modpack_name);
    console.log(_modpack_path);
    if (!fs.pathExistsSync(`${_modpack_path}\\assets`))
    {
        return false;
    }
    if (!fs.pathExistsSync(`${_modpack_path}\\libraries`))
    {
        return false;
    }
    if (!fs.pathExistsSync(`${_modpack_path}\\versions`))
    {
        return false;
    }
    return true;
}

function copy_libs_to_modpack(modpack_name)
{
    let _modpack_path = verify_and_get_modpack_folder(modpack_name);
    console.log(_modpack_path);
    fs.copySync(libs_path, _modpack_path);
}

function get_configs_path(modpack_name)
{
    
}

let minecraft;
let minecraftLaunched = false;

function integrate_java_parameters(command)
{
    let pars = settings['java_parameters'];
    let pars_arr = pars.split(' ');

    for (let parameter of pars_arr)
    {
        if (parameter.charAt(0) != '-') continue;

        if (parameter.includes('-Xmx'))
        {
            let par_prototype = `-Xmx${settings['allocated_memory'] * 1024}M`;
            console.log(par_prototype);
            console.log(parameter);
            command = command.replace(par_prototype, parameter);
            continue;
        }
        else if (parameter.includes('-Xms'))
        {
            let par_prototype = `-Xms1000M`;
            console.log(par_prototype);
            console.log(parameter);
            command = command.replace(par_prototype, parameter);
            continue;
        }
        else if (parameter.includes('-username')) { continue; }
        else if (parameter.includes('-uuid')) { continue; }
        else
        {
            command += ' ' + parameter;
        }
    }
    
    return command;
}

function verify_and_get_path_to_modpack_info(modpack_name)
{
    let path = verify_and_get_modpack_folder(modpack_name) + '\\info.json';
    if (!fs.pathExistsSync(path))
    {
        fs.createFileSync(path);
        fs.writeFileSync(path, '{}');
    }
    return path;
}

function get_modpack_version_from_info(modpack_name)
{
    let path = verify_and_get_path_to_modpack_info(modpack_name);
    let json = JSON.parse(fs.readFileSync(path));
    return json['version'];
}

function set_modpack_version_to_info(modpack_name, version)
{
    let path = verify_and_get_path_to_modpack_info(modpack_name);
    console.log(`writing to ${path}`);
    let json = JSON.parse(fs.readFileSync(path));
    json['version'] = version;
    fs.writeFileSync(path, JSON.stringify(json));
}

function get_latest_java_version_path()
{
    if (os.arch() == 'x64')
    {
        console.log(path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime-windows-x64\\bin\\javaw.exe'));
        return path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime-windows-x64\\bin\\javaw.exe');
    }
    else
    {
        console.log(path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime\\bin\\javaw.exe'));
        return path.join(app.getAppPath().split('app.asar')[0], '\\src\\res\\java\\runtime\\bin\\javaw.exe');
    }
}

function verify_user_skin(modpack_name)
{
    return new Promise((resolve, reject) => {
        fs.copyFile(verify_and_get_resources_folder() + `\\${userData['uid']}.png`, verify_and_get_modpack_folder(modpack_name) + `\\CustomSkinLoader\\LocalSkin\\skins\\${userData['uid']}.png`).then(res => {
            resolve();
        });
    });
}

function launch_minecraft(min_mem, max_mem, game_dir, username, uuid)
{
    return new Promise((resolve, reject) =>
    {
        let args = `-Djava.net.preferIPv4Stack=true -Dos.name="Windows ${os_version}" -Dos.version=${os.release().split('.')[0] + '.' + os.release().split('.')[1]} -Xmn${min_mem}M -Xmx${max_mem}M -Djava.library.path=${game_dir}\\versions\\Forge-1.12.2\\natives -cp ${game_dir}\\libraries\\net\\minecraftforge\\forge\\1.12.2-14.23.5.2854\\forge-1.12.2-14.23.5.2854.jar;${game_dir}\\libraries\\org\\ow2\\asm\\asm-debug-all\\5.2\\asm-debug-all-5.2.jar;${game_dir}\\libraries\\net\\minecraft\\launchwrapper\\1.12\\launchwrapper-1.12.jar;${game_dir}\\libraries\\org\\jline\\jline\\3.5.1\\jline-3.5.1.jar;${game_dir}\\libraries\\com\\typesafe\\akka\\akka-actor_2.11\\2.3.3\\akka-actor_2.11-2.3.3.jar;${game_dir}\\libraries\\com\\typesafe\\config\\1.2.1\\config-1.2.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-actors-migration_2.11\\1.1.0\\scala-actors-migration_2.11-1.1.0.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-compiler\\2.11.1\\scala-compiler-2.11.1.jar;${game_dir}\\libraries\\org\\scala-lang\\plugins\\scala-continuations-library_2.11\\1.0.2_mc\\scala-continuations-library_2.11-1.0.2_mc.jar;${game_dir}\\libraries\\org\\scala-lang\\plugins\\scala-continuations-plugin_2.11.1\\1.0.2_mc\\scala-continuations-plugin_2.11.1-1.0.2_mc.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-library\\2.11.1\\scala-library-2.11.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-parser-combinators_2.11\\1.0.1\\scala-parser-combinators_2.11-1.0.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-reflect\\2.11.1\\scala-reflect-2.11.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-swing_2.11\\1.0.1\\scala-swing_2.11-1.0.1.jar;${game_dir}\\libraries\\org\\scala-lang\\scala-xml_2.11\\1.0.2\\scala-xml_2.11-1.0.2.jar;${game_dir}\\libraries\\lzma\\lzma\\0.0.1\\lzma-0.0.1.jar;${game_dir}\\libraries\\java3d\\vecmath\\1.5.2\\vecmath-1.5.2.jar;${game_dir}\\libraries\\net\\sf\\trove4j\\trove4j\\3.0.3\\trove4j-3.0.3.jar;${game_dir}\\libraries\\org\\apache\\maven\\maven-artifact\\3.5.3\\maven-artifact-3.5.3.jar;${game_dir}\\libraries\\net\\sf\\jopt-simple\\jopt-simple\\5.0.3\\jopt-simple-5.0.3.jar;${game_dir}\\libraries\\org\\patcher\\patchy\\1.1\\patchy-1.1.jar;${game_dir}\\libraries\\oshi-project\\oshi-core\\1.1\\oshi-core-1.1.jar;${game_dir}\\libraries\\net\\java\\dev\\jna\\jna\\4.4.0\\jna-4.4.0.jar;${game_dir}\\libraries\\net\\java\\dev\\jna\\platform\\3.4.0\\platform-3.4.0.jar;${game_dir}\\libraries\\com\\ibm\\icu\\icu4j-core-mojang\\51.2\\icu4j-core-mojang-51.2.jar;${game_dir}\\libraries\\net\\sf\\jopt-simple\\jopt-simple\\5.0.3\\jopt-simple-5.0.3.jar;${game_dir}\\libraries\\com\\paulscode\\codecjorbis\\20101023\\codecjorbis-20101023.jar;${game_dir}\\libraries\\com\\paulscode\\codecwav\\20101023\\codecwav-20101023.jar;${game_dir}\\libraries\\com\\paulscode\\libraryjavasound\\20101123\\libraryjavasound-20101123.jar;${game_dir}\\libraries\\com\\paulscode\\librarylwjglopenal\\20100824\\librarylwjglopenal-20100824.jar;${game_dir}\\libraries\\com\\paulscode\\soundsystem\\20120107\\soundsystem-20120107.jar;${game_dir}\\libraries\\io\\netty\\netty-all\\4.1.9.Final\\netty-all-4.1.9.Final.jar;${game_dir}\\libraries\\com\\google\\guava\\guava\\21.0\\guava-21.0.jar;${game_dir}\\libraries\\org\\apache\\commons\\commons-lang3\\3.5\\commons-lang3-3.5.jar;${game_dir}\\libraries\\commons-io\\commons-io\\2.5\\commons-io-2.5.jar;${game_dir}\\libraries\\commons-codec\\commons-codec\\1.10\\commons-codec-1.10.jar;${game_dir}\\libraries\\net\\java\\jinput\\jinput\\2.0.5\\jinput-2.0.5.jar;${game_dir}\\libraries\\net\\java\\jutils\\jutils\\1.0.0\\jutils-1.0.0.jar;${game_dir}\\libraries\\com\\google\\code\\gson\\gson\\2.8.0\\gson-2.8.0.jar;${game_dir}\\libraries\\org\\patcher\\authlib\\1.6.25\\authlib-1.6.25.jar;${game_dir}\\libraries\\com\\mojang\\realms\\1.10.22\\realms-1.10.22.jar;${game_dir}\\libraries\\org\\apache\\commons\\commons-compress\\1.8.1\\commons-compress-1.8.1.jar;${game_dir}\\libraries\\org\\apache\\httpcomponents\\httpclient\\4.3.3\\httpclient-4.3.3.jar;${game_dir}\\libraries\\commons-logging\\commons-logging\\1.1.3\\commons-logging-1.1.3.jar;${game_dir}\\libraries\\org\\apache\\httpcomponents\\httpcore\\4.3.2\\httpcore-4.3.2.jar;${game_dir}\\libraries\\it\\unimi\\dsi\\fastutil\\7.1.0\\fastutil-7.1.0.jar;${game_dir}\\libraries\\org\\apache\\logging\\log4j\\log4j-api\\2.8.1\\log4j-api-2.8.1.jar;${game_dir}\\libraries\\org\\apache\\logging\\log4j\\log4j-core\\2.8.1\\log4j-core-2.8.1.jar;${game_dir}\\libraries\\org\\lwjgl\\lwjgl\\lwjgl\\2.9.4-nightly-20150209\\lwjgl-2.9.4-nightly-20150209.jar;${game_dir}\\libraries\\org\\lwjgl\\lwjgl\\lwjgl_util\\2.9.4-nightly-20150209\\lwjgl_util-2.9.4-nightly-20150209.jar;${game_dir}\\libraries\\com\\mojang\\text2speech\\1.10.3\\text2speech-1.10.3.jar;${game_dir}\\versions\\Forge-1.12.2\\Forge-1.12.2.jar -Dminecraft.applet.TargetDirectory=${game_dir} -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M -Dfml.ignoreInvalidMinecraftCertificates=true -Dfml.ignorePatchDiscrepancies=true net.minecraft.launchwrapper.Launch --username ${username} --version Forge-1.12.2 --gameDir ${game_dir} --assetsDir ${game_dir}\\assets --assetIndex 1.12 --uuid ${uuid} --accessToken null --tweakClass net.minecraftforge.fml.common.launcher.FMLTweaker --versionType Forge --width 925 --height 530`;

        args = integrate_java_parameters(args);
        let cd_path = game_dir;
        let java_path = get_latest_java_version_path();
        let final_command = `${game_dir[0]}:&&cd "${cd_path}"&&"${java_path}" ${args}`;

        console.log(final_command);
        minecraft = exec(final_command, { 
            windowsHide: true,
            maxBuffer: 1024 * 1024 * 1024,
            shell: true
        });

        console.log(minecraft);

        minecraft.stdout.on('data', data => {
            console.log(data.toString());
            if (data.toString().split('Starts to replace vanilla recipe ingredients with ore ingredients.').length > 1)
            {
                minecraftLaunched = true;
                play_button.innerHTML = 'Запущено';
                document.querySelector('#launch-menu').classList.remove('open');
                if (BrowserWindow.getFocusedWindow() != undefined && BrowserWindow.getFocusedWindow() != null)
                {
                    BrowserWindow.getFocusedWindow().minimize();
                }
            }
        });
    
        minecraft.stderr.on('data', data => {
            console.log(data.toString());
        });
    
        minecraft.on('exit', error => {
            console.log(error);
            minecraftLaunched = false;
            play_button.innerHTML = 'Играть';
            document.querySelector('#launch-menu').classList.remove('open');
            if (error) {
                reject(error);
            }
            resolve('minecraft exit');
        });
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
    check_libs_in_mod();
    copy_libs_to_modpack();
    clear_modpack_folder();
    launch_minecraft();
    modpack_not_installed();
    verify_and_get_settings_file();
    change_settings_preset();
    set_modpack_version_to_info();
    get_modpack_version_from_info();
}
//#endregion