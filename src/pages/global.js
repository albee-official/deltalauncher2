String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function remove_event_listeners(el) {
    elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
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

//. Default themes so if user looses them they will be restored
let themes_template = {
	"default": {
		"name": "default",
		"bg_path": "../../res/bg.jpg",
		"theme_select_options": "background: linear-gradient(to right bottom, #801336, #801336)",
		"css": [
			"--bg: 255, 255, 255",
			"--global-clr: #DF3B40",
			"--global-clr-rgb: 223, 59, 64",
			"--global-text: #FFF",
			"--global-text-rgb: 255, 255, 255",
			"",
			"--checkbox-text: var(--global-text)",
			"--checkbox-filler: var(--global-text)",
			"--slider-bg: rgba(255, 255, 255, .16)",
			"--slider-bg-hover: rgba(255, 255, 255, .32)",
			"",
			"--start-logo-clr: #FFF",
			"--start-bg: #FFF",
			"--start-bg-decoration: #F6F6F6",
			"--start-text: rgba(45, 19, 44, .32)",
			"--start-text-active: rgba(45, 19, 44, 1)",
			"--start-progress-bg: rgba(45, 19, 44, .16)",
			"--start-progress-filler: var(--global-clr)",
			"--start-button-bg: var(--global-clr)",
			"--start-button-text: var(--global-text)",
			"--start-button-bg-active: rgba(255, 69, 75, 1)",
			"--start-button-text-active: var(--global-text)",
			"",
			"--header-bg: #FFF",
			"--header-text: #C9C9C9",
			"--header-text-active: var(--global-clr)",
			"--header-profile-username: var(--header-text-active)",
			"--header-profile-logout: var(--header-text)",
			"--header-profile-border: var(--header-text-active) 4px solid",
			"--header-sysbuttons-bg: rgba(var(--global-clr-rgb), 0)",
			"--header-sysbuttons-bg-hover: rgba(var(--global-clr-rgb), 1)",
			"--header-sysbuttons-icon: #5a1331",
			"--header-sysbuttons-icon-hover: #FFF",
			"",
			"--main-bg: rgba(90, 19, 49, .85)",
			"--main-text: var(--global-text)",
			"--main-text-rgb: var(--global-text-rgb)",
			"--main-h1: var(--main-text)",
			"--main-text-p-opacity: .32",
			"--main-text-p-opacity-hover: .5",
			"--main-button-bg: var(--global-clr)",
			"--main-button-text: var(--global-text)",
			"--main-button-bg-active: var(--global-text)",
			"--main-button-text-active: var(--global-clr)",
			"--main-button-bg-locked: var(--global-clr)",
			"--main-button-text-locked: var(--global-text)",
			"--main-sidepanel-bg: rgba(45, 19, 44, .32)",
			"",
			"--footer-bg: rgba(45, 19, 44, .32)",
			"--footer-h1: var(--global-text)",
			"--footer-p: rgba(255, 255, 255, .32)",
			"--footer-download-bg: rgba(var(--global-text-rgb), .08)",
			"--footer-download-filler: var(--global-clr)",
			"--footer-button-bg: var(--global-clr)",
			"--footer-button-text: var(--global-text)",
			"--footer-button-bg-active: var(--global-text)",
			"--footer-button-text-active: var(--global-clr)"
		]
	},
	"velvet": {
		"name": "velvet",
		"bg_path": "../../res/bg_nightsky.jpg",
		"theme_select_options": "background: #0D0917",
		"css": [
			"--bg: 13, 9, 23",
			"--global-clr: #551BDC",
			"--global-text: #FFF",
			"--global-text-rgb: 255, 255, 255",
			"",
			"--checkbox-text: var(--global-text)",
			"--checkbox-filler: var(--global-text)",
			"--slider-bg: rgba(255, 255, 255, .16)",
			"--slider-bg-hover: rgba(255, 255, 255, .32)",
			"",
			"--start-logo-clr: #FFF",
			"--start-bg: rgba(var(--bg), 1)",
			"--start-bg-decoration: #130d21",
			"--start-text: rgba(var(--global-text-rgb), .32)",
			"--start-text-active: rgba(var(--global-text-rgb), 1)",
			"--start-progress-bg: rgba(var(--global-text-rgb), .16)",
			"--start-progress-filler: var(--global-clr)",
			"--start-button-bg: var(--global-clr)",
			"--start-button-text: var(--global-text)",
			"--start-button-bg-active: var(--global-text)",
			"--start-button-text-active: var(--global-clr)",
			"",
			"--header-bg: #FFF",
			"--header-text: #9692A2",
			"--header-text-active: var(--global-clr)",
			"--header-profile-username: var(--header-text-active)",
			"--header-profile-logout: var(--header-text)",
			"--header-profile-border: var(--header-text-active) 4px solid",
			"--header-sysbuttons-bg: rgba(85, 27, 220, 0)",
			"--header-sysbuttons-bg-hover: rgba(85, 27, 220, 1)",
			"--header-sysbuttons-icon: #0D0917",
			"--header-sysbuttons-icon-hover: #FFF",
			"",
			"--main-bg: rgba(var(--bg), .85)",
			"--main-text: var(--global-text)",
			"--main-text-rgb: var(--global-text-rgb)",
			"--main-h1: var(--main-text)",
			"--main-text-p-opacity: .32",
			"--main-text-p-opacity-hover: .5",
			"--main-button-bg: var(--global-clr)",
			"--main-button-text: var(--global-text)",
			"--main-button-bg-active: var(--global-text)",
			"--main-button-text-active: var(--global-clr)",
			"--main-button-bg-locked: var(--global-clr)",
			"--main-button-text-locked: var(--global-text)",
			"--main-sidepanel-bg: rgba(20, 15, 35, .32)",
			"",
			"--footer-bg: rgba(40, 30, 64, .32)",
			"--footer-h1: var(--global-text)",
			"--footer-p: rgba(255, 255, 255, .32)",
			"--footer-download-bg: rgba(var(--global-text-rgb), .08)",
			"--footer-download-filler: var(--global-clr)",
			"--footer-button-bg: var(--global-clr)",
			"--footer-button-text: var(--global-text)",
			"--footer-button-bg-active: var(--global-text)",
			"--footer-button-text-active: var(--global-clr)"
		]
	},
	"bamboo": {
		"name": "bamboo",
		"bg_path": "../../res/bg_greenhills.jpg",
		"theme_select_options": "background: #213724",
		"css": [
			"--bg: 33, 55, 36",
			"--global-clr: #E1FFC2",
			"--global-clr-rgb: #E1FFC2",
			"--global-text: #FFF",
			"--global-text-rgb: 255, 255, 255",
			"--global-buttons-bg: #E1FFC2",
			"--global-buttons-text: #09322E",
			"",
			"--checkbox-text: var(--global-text)",
			"--checkbox-filler: var(--global-text)",
			"--slider-bg: rgba(255, 255, 255, .16)",
			"--slider-bg-hover: rgba(255, 255, 255, .32)",
			"",
			"--start-logo-clr: #FFF",
			"--start-bg: rgba(7, 38, 35, 1)",
			"--start-bg-decoration: rgba(8, 41, 38, 1)",
			"--start-text: rgba(var(--global-text-rgb), .32)",
			"--start-text-active: rgba(var(--global-text-rgb), 1)",
			"--start-progress-bg: rgba(var(--global-text-rgb), .16)",
			"--start-progress-filler: var(--global-clr)",
			"--start-button-bg: var(--global-buttons-bg)",
			"--start-button-text: var(--global-buttons-text)",
			"--start-button-bg-active: var(--global-text)",
			"--start-button-text-active: rgba(var(--bg), 1)",
			"",
			"--header-bg: #09322E",
			"--header-text: #2F5F58",
			"--header-text-active: var(--global-clr)",
			"--header-profile-username: var(--header-text-active)",
			"--header-profile-logout: var(--header-text)",
			"--header-profile-border: var(--header-text-active) 4px solid",
			"--header-sysbuttons-bg: rgba(225, 255, 194, 0)",
			"--header-sysbuttons-bg-hover: rgba(225, 255, 194, 1)",
			"--header-sysbuttons-icon: rgba(var(--global-text-rgb), 1)",
			"--header-sysbuttons-icon-hover: rgba(var(--bg), 1)",
			"",
			"--main-bg: rgba(var(--bg), .85)",
			"--main-text: var(--global-text)",
			"--main-text-rgb: var(--global-text-rgb)",
			"--main-h1: var(--main-text)",
			"--main-text-p-opacity: .32",
			"--main-text-p-opacity-hover: .5",
			"--main-button-bg: var(--global-buttons-bg)",
			"--main-button-text: var(--global-buttons-text)",
			"--main-button-bg-active: var(--global-text)",
			"--main-button-text-active: rgba(var(--bg), 1)",
			"--main-button-bg-locked: var(--global-clr)",
			"--main-button-text-locked: var(--global-text)",
			"--main-sidepanel-bg: rgba(9, 50, 46, .32)",
			"",
			"--footer-bg: rgba(3, 20, 19, .32)",
			"--footer-h1: var(--global-text)",
			"--footer-p: rgba(255, 255, 255, .32)",
			"--footer-download-bg: rgba(var(--global-text-rgb), .08)",
			"--footer-download-filler: var(--global-clr)",
			"--footer-button-bg: var(--global-buttons-bg)",
			"--footer-button-text: var(--global-buttons-text)",
			"--footer-button-bg-active: var(--global-text)",
			"--footer-button-text-active: var(--global-clr)"
		]
	},
	"eternal void": {
		"name": "eternal void",
		"bg_path": "../../res/bg_eternalvoid.png",
		"theme_select_options": "background: #111",
		"css": [
			"--bg: 12, 12, 12",
			"--global-clr: #E6E6E6",
			"--global-clr-rgb: 230, 230, 230",
			"--global-text: #FFF",
			"--global-text-rgb: 255, 255, 255",
			"--global-buttons-bg: #E6E6E6",
			"--global-buttons-text: rgba(var(--bg), 1)",
			"",
			"--checkbox-text: var(--global-text)",
			"--checkbox-filler: var(--global-text)",
			"--slider-bg: rgba(255, 255, 255, .16)",
			"--slider-bg-hover: rgba(255, 255, 255, .32)",
			"",
			"--start-logo-clr: #FFF",
			"--start-bg: rgba(var(--bg), 1)",
			"--start-bg-decoration: rgba(16, 16, 16, 1)",
			"--start-text: rgba(var(--global-text-rgb), .32)",
			"--start-text-active: rgba(var(--global-text-rgb), 1)",
			"--start-progress-bg: rgba(var(--global-text-rgb), .16)",
			"--start-progress-filler: var(--global-clr)",
			"--start-button-bg: var(--global-buttons-bg)",
			"--start-button-text: var(--global-buttons-text)",
			"--start-button-bg-active: var(--global-text)",
			"--start-button-text-active: rgba(var(--bg), 1)",
			"",
			"--header-bg: rgba(12, 12, 12, 1)",
			"--header-text: #4E4E4E",
			"--header-text-active: var(--global-clr)",
			"--header-profile-username: var(--header-text-active)",
			"--header-profile-logout: var(--header-text)",
			"--header-profile-border: var(--header-text-active) 4px solid",
			"--header-sysbuttons-bg: rgba(var(--global-clr-rgb), 0)",
			"--header-sysbuttons-bg-hover: rgba(var(--global-clr-rgb), 1)",
			"--header-sysbuttons-icon: rgba(var(--global-text-rgb), 1)",
			"--header-sysbuttons-icon-hover: rgba(var(--bg), 1)",
			"",
			"--main-bg: rgba(var(--bg), .85)",
			"--main-text: var(--global-text)",
			"--main-text-rgb: var(--global-text-rgb)",
			"--main-h1: var(--main-text)",
			"--main-text-p-opacity: .32",
			"--main-text-p-opacity-hover: .5",
			"--main-button-bg: var(--global-buttons-bg)",
			"--main-button-text: var(--global-buttons-text)",
			"--main-button-bg-active: var(--global-text)",
			"--main-button-text-active: rgba(var(--bg), 1)",
			"--main-button-bg-locked: var(--global-clr)",
			"--main-button-text-locked: var(--global-text)",
			"--main-sidepanel-bg: rgba(var(--bg), .32)",
			"",
			"--footer-bg: rgba(16, 16, 16, .32)",
			"--footer-h1: var(--global-text)",
			"--footer-p: rgba(255, 255, 255, .32)",
			"--footer-download-bg: rgba(var(--global-text-rgb), .08)",
			"--footer-download-filler: var(--global-clr)",
			"--footer-button-bg: var(--global-buttons-bg)",
			"--footer-button-text: var(--global-buttons-text)",
			"--footer-button-bg-active: #FFF",
			"--footer-button-text-active: rgba(var(--bg), 1)"
		]
	}
}

let themes_json = read_themes();
check_themes();
check_blurred_bg();
check_muted_video();

function read_themes() {
    let themes_raw = fs.readFileSync(verify_and_get_themes_file());
    if (themes_raw == '') return themes_template;
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
    let vars_arr = themes_json[theme]['css'];
	console.log(`[SETTINGS] Applied theme: ${theme}`);
	
	for (const var_el of vars_arr) {
		if (var_el == '') continue;
		let thing = var_el.split(':');

		document.documentElement.style.setProperty(thing[0], thing[1]);
	}
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

function check_blurred_bg() {
    if (settings['bg_blurred'])
    {
		document.querySelector('body').style.backdropFilter = `blur(${settings['bg_blur_amount']})`;
		document.querySelector('#bg-video').style = `filter: blur(${settings['bg_blur_amount']})`;
		
    }
    else
    {
        document.querySelector('body').style.backdropFilter = 'blur(0px)';
        document.querySelector('#bg-video').style = 'filter: blur(0px)';
    }
}

function is_video_on_bg() {
	return settings['bg_extension'] == 'avi' || settings['bg_extension'] == 'webm' || settings['bg_extension'] == 'mp4' || settings['bg_extension'] == 'ogg';
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
    if (is_video_on_bg())
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