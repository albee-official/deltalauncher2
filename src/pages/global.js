const { remote, ipcRenderer } = require('electron');
const Path = require('path');

let LOADING_SPAN = '<span class="loading"><p>.</p><p>.</p><p>.</p></span>';

//#region  //. Globals
Object.defineProperty(global, 'userInfo', {
	get: function() {
		return remote.getGlobal('sharedObject').userInfo;
	},

	set: function(val) {
		remote.getGlobal('sharedObject').userInfo = val;
	},
});

Object.defineProperty(global, 'rpc', {
	get: function() {
		return remote.getGlobal('sharedObject').rpc;
	},

	set: function(val) {
		remote.getGlobal('sharedObject').rpc = val;
		ipcRenderer.send('rpc-update');
	},
});

Object.defineProperty(global, 'launchedModpacks', {
	get: function() {
		return remote.getGlobal('sharedObject').launchedModpacks;
	},

	set: function(val) {
		console.log(`Setting launchedModpacks to: ${val}`);
		remote.getGlobal('sharedObject').launchedModpacks = val;
	},
});
//#endregion

//#region //. Handy

function deepFreeze(o) {
	Object.freeze(o);
  
	Object.getOwnPropertyNames(o).forEach(function(prop) {
	  if (o.hasOwnProperty(prop)
	  && o[prop] !== null
	  && (typeof o[prop] === "object" || typeof o[prop] === "function")
	  && !Object.isFrozen(o[prop])) {
		  deepFreeze(o[prop]);
		}
	});
  
	return o;
  }

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function remove_event_listeners(el) {
    elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);
}

//#endregion

//#region //. Theme parsing

//. Default themes so if user looses them they will be restored
let themes_json = read_themes();
check_blurred_bg();
check_muted_video();

function read_themes() {
	let json = {
		default: {
			'name': 'default',
			'description': 'default theme',
			'author': 'Albee',
			'version': '1.0.0',
			'bg': '../../res/bg.jpg',
			'bg-filter': '#5a1331',
			'clr': '#ff454b',
			'path': '../default.theme.css',
		}
	};
	let themes = fs.readdirSync(themes_path);
	for (const theme of themes) {
		if (!theme.endsWith('.theme.css')) {
			continue;
		}
		const path = themes_path + '\\' + theme;
		const contents = fs.readFileSync(path).toString();

		const name = contents.split(' * @name ')[1].split('\n')[0] || theme.split('.')[0];
		const description = contents.split(' * @description ')[1].split('\n')[0] || '';
		const author = contents.split(' * @author ')[1].split('\n')[0] || 'Автор не указан!';
		const version = contents.split(' * @version ')[1].split('\n')[0] || '1.0.0';
		const bg = contents.split(' * @bg ')[1].split('\n')[0] || '../../../res/bg.jpg';

		const clr = contents.split('--global-clr: ')[1].split(';')[0] || '#FFF';
		const bg_filter = contents.split('--global-bg: ')[1].split(';')[0] || '#FFF';

		json[theme.split('.')[0]] = {
			'name': name,
			'description': description,
			'author': author,
			'version': version,
			'bg': bg,
			'bg-filter': bg_filter,
			'clr': clr,
			'path': path,
		}
	}

	console.log(json);
	return json;
}

function update_themes()
{
    let themes_string = JSON.stringify(themes_json, null, '\t');
    fs.writeFileSync(verify_and_get_themes_file(), themes_string);
}
//#endregion 

//#region //. Theme update -----------
function set_theme(theme)
{
    let path_to_css = themes_json[theme]['path'];
	console.log(`[SETTINGS] Applied theme: ${theme}`);
	document.getElementById('theme-link').href = path_to_css;
	settings['theme'] = theme;
}

// let default_bg = '../../res/bg.jpg';
async function set_bg(path)
{
	path = path.replace(/\\/g, '/');
	if (path == '') {
		path = get_bg_path(true);
		document.querySelector('#bg-video').src = ``;
        document.body.style.backgroundImage = `url("${path}?${Date.now()}")`;
		settings['bg_path'] = '';

	}
	else if (is_video(path))
    {
		document.querySelector('#bg-video').src = `${path}?${Date.now()}`;
		document.body.style.backgroundImage = ``;
        check_muted_video();
		settings['bg_path'] = path;
    }
    else
    {
		document.querySelector('#bg-video').src = ``;
        document.body.style.backgroundImage = `url("${path}?${Date.now()}")`;
		settings['bg_path'] = path;
	}

	update_settings();
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
		document.querySelector('#bg-video').style = `filter: blur(../../res/bg.jpg${settings['bg_blur_amount']})`;
		
    }
    else
    {
        document.querySelector('body').style.backdropFilter = 'blur(0px)';
        document.querySelector('#bg-video').style = 'filter: blur(0px)';
    }
}

function get_bg_path(default_bg = false) {
    if (settings['bg_path'] == undefined || settings['bg_path'] == '' || default_bg) {
        return themes_json[settings['theme']]['bg'];
	} else {
		return settings['bg_path'].replace(/\\/g, '/');
	}
}

function is_video(path) {
	let ext = Path.extname(path);
	if (ext == '.avi' || ext == '.webm' || ext == '.mp4' || ext == '.ogg') {
		return true;
	}
	return false;
}

function apply_theme(_theme)
{
	const theme = _theme;
	
	let bg_path = get_bg_path();
	if (settings['bg_path'].length == 0) {
		bg_path = '';
	}
	
    set_theme(settings['theme']);
	set_bg(bg_path);
	
	settings['theme'] = theme;
	update_settings();
}

apply_theme(settings['theme']);
//#endregion