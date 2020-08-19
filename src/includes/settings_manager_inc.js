let settings_file_path = verify_and_get_settings_file();

const pattern = {
    "selected_modpack": "magicae",
    "opened_settings": true,
    "on_page": "play",
    "allocated_memory": 3,
    "optimization_level": 2,
    "controls": {
        "crouch": { "minecraft_key": "key_key.sneak", "minecraft_code": 42, "key_code": 12, "key_name": "SHIFT" },
        "run": { "minecraft_key": "key_key.sprint", "minecraft_code": 29, "key_code": 12, "key_name": "CONTROL" },
        "forward": { "minecraft_key": "key_key.forward", "minecraft_code": 17, "key_code": 87, "key_name": "W" },
        "back": { "minecraft_key": "key_key.back", "minecraft_code": 31, "key_code": 83, "key_name": "S" },
        "left": { "minecraft_key": "key_key.left", "minecraft_code": 30, "key_code": 12, "key_name": "A" },
        "right": { "minecraft_key": "key_key.right", "minecraft_code": 32, "key_code": 12, "key_name": "D" },
        "zoom": { "minecraft_key": "key_of.key.zoom", "minecraft_code": -1, "key_code": -1, "key_name": "NONE" },
        "quests": { "minecraft_key": "key_key.ftbquests.quests", "minecraft_code": 20, "key_code": 12, "key_name": "T" },
        "excavate": { "minecraft_key": "key_oreexcavation.key.excavate", "minecraft_code": 34, "key_code": 12, "key_name": "G" },
        "shop": { "minecraft_key": "key_key.ftbmoney.shop", "minecraft_code": 35, "key_code": 12, "key_name": "H" }
    },
    "java_parameters": "",
    "bg_extension": "",
    "theme": "default",
    "addon_mods": [ "recorder", "dynamic souroundings" ],
    "modpack_dirs": {
        "magicae": "|ROOT|\\modpacks",
        "fabrica": "|ROOT|\\modpacks",
        "statera": "|ROOT|\\modpacks",
        "insula": "|ROOT|\\modpacks"
    }
};

let settings = read_settings();
check_settings();

modpack_folders = settings['modpack_dirs'];

function read_settings()
{
    let settings_raw = fs.readFileSync(settings_file_path);
    if (settings_raw == '') return '{ }';
    let settings_json = JSON.parse(settings_raw);
    return settings_json;
}

function check_settings()
{
    settings = Object.assign(pattern, settings);
    update_settings();
}

function update_settings()
{
    let settings_string = JSON.stringify(settings, null, '\t');
    fs.writeFileSync(settings_file_path, settings_string);
    console.log(settings);
}

function get_settings()
{
    return settings;
}