String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

let loading_interval_updater = undefined;
function update_loadings()
{
    if (loading_interval_updater != undefined)
        clearInterval(loading_interval_updater)
    let loadings = document.querySelectorAll('span[class="loading"]');
    loading_interval_updater = setInterval(() => {
        for (let loading_thing of loadings) {
            if (loading_thing.innerHTML.length > 2) {
                loading_thing.innerHTML = '';
            }

            loading_thing.innerHTML += '.'
        }
    }, 1000);
}
update_loadings();

//#region //. Theme parsing
let themes_template = {
    "default": {
        "name": "default",
        "bg_path": "../../res/bg.jpg",
        "theme_select_options": "background: linear-gradient(to right bottom, #801336, #801336);",
        "css": [
            "--darkest: 45, 19, 44",
            "--dark: 128, 19, 54",
            "--mid: 199, 44, 65",
            "--light: 238, 69, 64",
            "--lightest: 255, 97, 38",
            "--bg: linear-gradient(to right bottom, #801336, #2D132C)",
            "--start-bg: var(--main-text)",
            "--start-bg-decoration: 200, 200, 200",
            "--start-header: var(--darkest)",
            "--start-text: 200, 200, 200",
            "--start-text-active: var(--darkest)",
            "--start-icon: var(--start-text)",
            "--start-login-button-bg: rgb(var(--light))",
            "--start-login-button-text: var(--main-text)",
            "--start-download-bar: rgb(var(--start-text))",
            "--start-download-filler: rgb(var(--light))",
            "--header-bg: var(--main-text)",
            "--header-text: var(--main-text-accent)",
            "--header-text-active: var(--light)",
            "--header-underline-active: rgb(var(--light))",
            "--header-profile-border: var(--light)",
            "--header-icon: var(--darkest)",
            "--main-text: 255, 255, 255",
            "--main-text-accent: 200, 200, 200",
            "--main-side-panel-bg: var(--darkest)",
            "--footer-bg: var(--darkest)",
            "--footer-text: var(--main-text)",
            "--footer-download-bar: linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))",
            "--button-bg: rgb(var(--mid))",
            "--button-bg-hover: rgb(var(--light))",
            "--button-text: var(--main-text)",
            "--button-text-hover: var(--main-text)"
        ]
    },
    "green hills": {
        "name": "green hills",
        "bg_path": "../../res/bg_greenhills.jpg",
        "theme_select_options": "background: linear-gradient(to right bottom, #15594D, #082626);",
        "css": [
            "--darkest: 9, 50, 46",
            "--dark: 47, 95, 88",
            "--mid: 225, 255, 194",
            "--light: 225, 255, 194",
            "--lightest: 241, 255, 226",

            "--bg: linear-gradient(to right bottom, #2E4A31, #122116)",

            "--start-bg: 3, 20, 19",
            "--start-bg-decoration: 9, 50, 46",
            "--start-header: var(--main-text)",
            "--start-text: 91, 155, 146",
            "--start-text-active: var(--main-text)",
            "--start-icon: var(--main-text)",
            "--start-login-button-bg: rgb(var(--light))",
            "--start-login-button-text: var(--darkest)",
            "--start-download-bar: rgb(var(--start-text))",
            "--start-download-filler: rgb(var(--light))",

            "--header-bg: var(--darkest)",
            "--header-text: var(--dark)",
            "--header-text-active: var(--light)",
            "--header-underline-active: rgb(var(--light))",
            "--header-profile-border: var(--light)",
            "--header-icon: var(--main-text)",

            "--main-text: 255, 255, 255",
            "--main-text-accent: 200, 200, 200",
            "--main-side-panel-bg: var(--darkest)",

            "--footer-bg: 3, 20, 19",
            "--footer-text: var(--main-text)",
            "--footer-download-bar: linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))",

            "--button-bg: rgb(var(--light))",
            "--button-bg-hover: rgb(var(--lightest))",
            "--button-text: var(--darkest)",
            "--button-text-hover: var(--darkest)"
        ]
    },
    "night sky": {
        "name": "night sky",
        "bg_path": "../../res/bg_nightsky.jpg",
        "theme_select_options": "background: linear-gradient(to right bottom, #171D37, #0E1327);",
        "css": [
            "--darkest: 12, 29, 49",
            "--dark: 54, 90, 132",
            "--mid: 154, 179, 245",
            "--light: 163, 185, 244",
            "--lightest: 185, 236, 255",

            "--bg: linear-gradient(to right bottom, #0F3057, #173150)",

            "--start-bg: var(--darkest)",
            "--start-bg-decoration: 23, 49, 80",
            "--start-header: var(--main-text)",
            "--start-text: var(--mid)",
            "--start-text-active: var(--main-text)",
            "--start-icon: var(--start-text)",
            "--start-login-button-bg: linear-gradient(to left bottom, rgb(var(--mid)), rgb(var(--mid)))",
            "--start-login-button-text: var(--darkest)",
            "--start-download-bar: rgb(var(--start-text))",
            "--start-download-filler: linear-gradient(to right, rgb(var(--light)), rgb(var(--mid)))",

            "--header-bg: var(--darkest)",
            "--header-text: var(--dark)",
            "--header-text-active: var(--mid)",
            "--header-underline-active: rgb(var(--mid))",
            "--header-profile-border: var(--header-text)",
            "--header-icon: var(--dark)",

            "--main-text: 255, 255, 255",
            "--main-text-accent: 200, 200, 200",
            "--main-side-panel-bg: var(--darkest)",

            "--footer-bg: var(--darkest)",
            "--footer-text: var(--main-text)",
            "--footer-download-bar: linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))",

            "--button-bg: rgb(var(--light))",
            "--button-bg-hover: rgb(var(--lightest))",
            "--button-text: var(--darkest)",
            "--button-text-hover: var(--darkest)"
        ]
    },
    "dark sun": {
        "name": "dark sun",
        "bg_path": "../../res/bg_darksun.jpg",
        "theme_select_options": "background: linear-gradient(to right bottom, #4A2E37, #211712);",
        "css": [
            "--darkest: 15, 12, 17",
            "--dark: 128, 19, 54",
            "--mid: 224, 88, 99",
            "--light: 224, 88, 99",
            "--lightest: 252, 102, 114",

            "--bg: linear-gradient(to right bottom, #4A2E37, #211712)",

            "--start-bg: var(--darkest)",
            "--start-bg-decoration: 36, 30, 40",
            "--start-header: var(--main-text)",
            "--start-text: 84, 74, 90",
            "--start-text-active: var(--main-text)",
            "--start-icon: var(--main-text)",
            "--start-login-button-bg: rgb(var(--light))",
            "--start-login-button-text: var(--main-text)",
            "--start-download-bar: rgb(36, 30, 40)",
            "--start-download-filler: rgb(var(--light))",

            "--header-bg: var(--darkest)",
            "--header-text: 78, 67, 85",
            "--header-text-active: var(--light)",
            "--header-underline-active: rgb(var(--light))",
            "--header-profile-border: var(--light)",
            "--header-icon: var(--main-text)",
            
            "--main-text: 255, 255, 255",
            "--main-text-accent: 200, 200, 200",
            "--main-side-panel-bg: var(--darkest)",

            "--footer-bg: var(--darkest)",
            "--footer-text: var(--main-text)",
            "--footer-download-bar: linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))",

            "--button-bg: rgb(var(--light))",
            "--button-bg-hover: rgb(var(--lightest))",
            "--button-text: var(--darkest)",
            "--button-text-hover: var(--darkest)"
        ]
    },
    "eternal void": {
        "name": "eternal void",
        "bg_path": "../../res/bg_eternalvoid.png",
        "theme_select_options": "background: linear-gradient(to right bottom, #262626, #000000);",
        "css": [
            "--darkest: 0, 0, 0",
            "--dark: 38, 38, 38",
            "--mid: 97, 97, 97",
            "--light: 164, 164, 164",
            "--lightest: 193, 193, 193",

            "--bg: linear-gradient(to right bottom, #000000, #262626)",

            "--start-bg: var(--darkest)",
            "--start-bg-decoration: var(--dark)",
            "--start-header: var(--main-text)",
            "--start-text: var(--mid)",
            "--start-text-active: var(--main-text)",
            "--start-icon: var(--start-text)",
            "--start-login-button-bg: linear-gradient(to left bottom, rgb(var(--mid)), rgb(var(--mid)))",
            "--start-login-button-text: var(--darkest)",
            "--start-download-bar: rgb(var(--start-text))",
            "--start-download-filler: linear-gradient(to right, rgb(var(--light)), rgb(var(--mid)))",

            "--header-bg: var(--darkest)",
            "--header-text: var(--mid)",
            "--header-text-active: var(--light)",
            "--header-underline-active: rgb(var(--light))",
            "--header-profile-border: var(--lightest)",
            "--header-icon: var(--mid)",

            "--main-text: 255, 255, 255",
            "--main-text-accent: 200, 200, 200",
            "--main-side-panel-bg: var(--darkest)",

            "--footer-bg: var(--darkest)",
            "--footer-text: var(--main-text)",
            "--footer-download-bar: linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))",

            "--button-bg: rgb(var(--lightest))",
            "--button-bg-hover: rgb(var(--lightest))",
            "--button-text: var(--darkest)",
            "--button-text-hover: var(--darkest)"
        ]
    }
};

let themes_json = read_themes();
check_themes();

function read_themes() {
    let themes_raw = fs.readFileSync(verify_and_get_themes_file());
    if (themes_raw == '') return themes_template;
    console.log(themes_raw.toString());
    let themes_json = JSON.parse(themes_raw);

    if (themes_json[settings['theme']] == undefined)
    {
        settings['theme'] = 'default';
        update_settings();
    }

    return themes_json;
}

function update_themes()
{
    let themes_string = JSON.stringify(themes_json, null, '\t');
    fs.writeFileSync(verify_and_get_themes_file(), themes_string);
    console.log(themes_json);
}

function check_themes()
{
    themes_json = Object.assign(themes_template, themes_json);
    update_themes();
}

function get_themes() {
    return themes_json;
}
//#endregion 

//#region //. Theme update -----------
function set_theme_colours(theme)
{
    console.log(document.body.style);

    let str = themes_json[theme]['css'].join(';');
    console.log(str);

    document.body.style = str;
}

function check_muted_video() {
    if (settings['bg_muted'])
    {
        document.querySelector('#bg-video').muted = true;
    }
    else
    {
        document.querySelector('#bg-video').muted = false;
    }
}

function update_theme()
{
    const body = document.body;
    let bg_path = (verify_and_get_resources_folder() + '\\custom_bg.' + settings['bg_extension']).replace(/\\/g, '/');
    if (settings['bg_extension'] == '') 
    {
        bg_path = themes_json[settings['theme']]['bg_path'];
    }
    set_theme_colours(settings['theme']);
    if (settings['bg_extension'] == 'avi' || settings['bg_extension'] == 'webm' || settings['bg_extension'] == 'mp4' || settings['bg_extension'] == 'ogg')
    {
        document.querySelector('#bg-video').src = `${bg_path}?${new Date()}`;
        check_muted_video();
    }
    else
    {
        body.style.backgroundImage = `url("${bg_path}?${new Date()}")`;
    }
}

update_theme();
//#endregion