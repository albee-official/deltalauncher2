String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

//#region //. Theme update -----------
function set_theme_colours(theme)
{
    switch (theme) 
    {
        case 'night sky':
            document.body.style.setProperty('--darkest', '12, 29, 49');
            document.body.style.setProperty('--dark', '54, 90, 132');
            document.body.style.setProperty('--mid', '154, 179, 245');
            document.body.style.setProperty('--light', '163, 185, 244');
            document.body.style.setProperty('--lightest', '185, 236, 255');

            document.body.style.setProperty('--bg', 'linear-gradient(to right bottom, #0F3057, #173150)');

            document.body.style.setProperty('--start-bg', 'var(--darkest)');
            document.body.style.setProperty('--start-bg-decoration', '23, 49, 80');
            document.body.style.setProperty('--start-header', 'var(--main-text)');
            document.body.style.setProperty('--start-text', 'var(--mid)');
            document.body.style.setProperty('--start-text-active', 'var(--main-text)');
            document.body.style.setProperty('--start-icon', 'var(--start-text)');
            document.body.style.setProperty('--start-login-button-bg', 'linear-gradient(to left bottom, rgb(var(--mid)), rgb(var(--mid)))');
            document.body.style.setProperty('--start-login-button-text', 'var(--darkest)');
            document.body.style.setProperty('--start-download-bar', 'rgb(var(--start-text))');
            document.body.style.setProperty('--start-download-filler', 'linear-gradient(to right, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--header-bg', 'var(--darkest)');
            document.body.style.setProperty('--header-text', 'var(--dark)');
            document.body.style.setProperty('--header-text-active', 'var(--mid)');
            document.body.style.setProperty('--header-underline-active', 'rgb(var(--mid))');
            document.body.style.setProperty('--header-profile-border', 'var(--header-text)');
            document.body.style.setProperty('--header-icon', 'var(--dark)');

            document.body.style.setProperty('--main-text', '255, 255, 255');

            document.body.style.setProperty('--footer-bg', 'var(--darkest)');
            document.body.style.setProperty('--footer-text', 'var(--main-text)');
            document.body.style.setProperty('--footer-download-bar', 'linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--button-bg', 'linear-gradient(to left bottom, rgb(var(--light)), rgb(var(--lightest)))');
            document.body.style.setProperty('--button-text', 'var(--darkest)');
            break;
        case 'green hills':
            document.body.style.setProperty('--darkest', '9, 50, 46');
            document.body.style.setProperty('--dark', '47, 95, 88');
            document.body.style.setProperty('--mid', '225, 255, 194');
            document.body.style.setProperty('--light', '225, 255, 194'); 
            document.body.style.setProperty('--lightest', '225, 255, 194');

            document.body.style.setProperty('--bg', 'linear-gradient(to right bottom, #2E4A31, #122116)');

            document.body.style.setProperty('--start-bg', '3, 20, 19');
            document.body.style.setProperty('--start-bg-decoration', '9, 50, 46');
            document.body.style.setProperty('--start-header', 'var(--main-text)');
            document.body.style.setProperty('--start-text', '91, 155, 146');
            document.body.style.setProperty('--start-text-active', 'var(--main-text)');
            document.body.style.setProperty('--start-icon', 'var(--main-text)');
            document.body.style.setProperty('--start-login-button-bg', 'rgb(var(--light))');
            document.body.style.setProperty('--start-login-button-text', 'var(--darkest)');
            document.body.style.setProperty('--start-download-bar', 'rgb(var(--start-text))');
            document.body.style.setProperty('--start-download-filler', 'rgb(var(--light))');

            document.body.style.setProperty('--header-bg', 'var(--darkest)');
            document.body.style.setProperty('--header-text', 'var(--dark)');
            document.body.style.setProperty('--header-text-active', 'var(--light)');
            document.body.style.setProperty('--header-underline-active', 'rgb(var(--light))');
            document.body.style.setProperty('--header-profile-border', 'var(--light)');
            document.body.style.setProperty('--header-icon', 'var(--main-text)');

            document.body.style.setProperty('--main-text', '255, 255, 255');
            document.body.style.setProperty('--main-text-accent', '200, 200, 200');

            document.body.style.setProperty('--footer-bg', '3, 20, 19');
            document.body.style.setProperty('--footer-text', 'var(--main-text)');
            document.body.style.setProperty('--footer-download-bar', 'linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--button-bg', 'linear-gradient(to left bottom, rgb(var(--light)), rgb(var(--lightest)))');
            document.body.style.setProperty('--button-text', 'var(--darkest)');
            break;
        case 'dark sun':
            document.body.style.setProperty('--darkest', '15, 12, 17');
            document.body.style.setProperty('--dark', '128, 19, 54');
            document.body.style.setProperty('--mid', '224, 88, 99');
            document.body.style.setProperty('--light', '224, 88, 99'); 
            document.body.style.setProperty('--lightest', '233, 97, 99');

            document.body.style.setProperty('--bg', 'linear-gradient(to right bottom, #4A2E37, #211712)');

            document.body.style.setProperty('--start-bg', 'var(--darkest)');
            document.body.style.setProperty('--start-bg-decoration', '36, 30, 40');
            document.body.style.setProperty('--start-header', 'var(--main-text)');
            document.body.style.setProperty('--start-text', '84, 74, 90');
            document.body.style.setProperty('--start-text-active', 'var(--main-text)');
            document.body.style.setProperty('--start-icon', 'var(--main-text)');
            document.body.style.setProperty('--start-login-button-bg', 'rgb(var(--light))');
            document.body.style.setProperty('--start-login-button-text', 'var(--main-text)');
            document.body.style.setProperty('--start-download-bar', 'rgb(36, 30, 40)');
            document.body.style.setProperty('--start-download-filler', 'rgb(var(--light))');

            document.body.style.setProperty('--header-bg', 'var(--darkest)');
            document.body.style.setProperty('--header-text', '78, 67, 85');
            document.body.style.setProperty('--header-text-active', 'var(--light)');
            document.body.style.setProperty('--header-underline-active', 'rgb(var(--light))');
            document.body.style.setProperty('--header-profile-border', 'var(--light)');
            document.body.style.setProperty('--header-icon', 'var(--main-text)');

            document.body.style.setProperty('--main-text', '255, 255, 255');
            document.body.style.setProperty('--main-text-accent', '200, 200, 200');

            document.body.style.setProperty('--footer-bg', 'var(--darkest)');
            document.body.style.setProperty('--footer-text', 'var(--main-text)');
            document.body.style.setProperty('--footer-download-bar', 'linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--button-bg', 'linear-gradient(to left bottom, rgb(var(--light)), rgb(var(--lightest)))');
            document.body.style.setProperty('--button-text', 'var(--darkest)');
            break;
        case 'eternal void':
            document.body.style.setProperty('--darkest', '0, 0, 0');
            document.body.style.setProperty('--dark', '38, 38, 38');
            document.body.style.setProperty('--mid', '97, 97, 97');
            document.body.style.setProperty('--light', '164, 164, 164');
            document.body.style.setProperty('--lightest', ' 193, 193, 193');

            document.body.style.setProperty('--bg', 'linear-gradient(to right bottom, #000000, #262626)');
            
            document.body.style.setProperty('--start-bg', 'var(--darkest)');
            document.body.style.setProperty('--start-bg-decoration', 'var(--dark)');
            document.body.style.setProperty('--start-header', 'var(--main-text)');
            document.body.style.setProperty('--start-text', 'var(--mid)');
            document.body.style.setProperty('--start-text-active', 'var(--main-text)');
            document.body.style.setProperty('--start-icon', 'var(--start-text)');
            document.body.style.setProperty('--start-login-button-bg', 'linear-gradient(to left bottom, rgb(var(--mid)), rgb(var(--mid)))');
            document.body.style.setProperty('--start-login-button-text', 'var(--darkest)');
            document.body.style.setProperty('--start-download-bar', 'rgb(var(--start-text))');
            document.body.style.setProperty('--start-download-filler', 'linear-gradient(to right, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--header-bg', 'var(--darkest)');
            document.body.style.setProperty('--header-text', 'var(--mid)');
            document.body.style.setProperty('--header-text-active', 'var(--light)');
            document.body.style.setProperty('--header-underline-active', 'rgb(var(--light))');
            document.body.style.setProperty('--header-profile-border', 'var(--lightest)');
            document.body.style.setProperty('--header-icon', 'var(--mid)');

            document.body.style.setProperty('--main-text', '255, 255, 255');

            document.body.style.setProperty('--footer-bg', 'var(--darkest)');
            document.body.style.setProperty('--footer-text', 'var(--main-text)');
            document.body.style.setProperty('--footer-download-bar', 'linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--button-bg', 'linear-gradient(to left bottom, rgb(var(--light)), rgb(var(--lightest)))');
            document.body.style.setProperty('--button-text', 'var(--darkest)');
            break;
        case 'default':
            document.body.style.setProperty('--darkest', '45, 19, 44');
            document.body.style.setProperty('--dark', '128, 19, 54');
            document.body.style.setProperty('--mid', '199, 44, 65');
            document.body.style.setProperty('--light', '238, 69, 64');
            document.body.style.setProperty('--lightest', '255, 97, 38');

            document.body.style.setProperty('--bg', 'linear-gradient(to right bottom, #801336, #2D132C)');

            document.body.style.setProperty('--start-bg', 'var(--main-text)');
            document.body.style.setProperty('--start-bg-decoration', '200, 200, 200');
            document.body.style.setProperty('--start-header', 'var(--darkest)');
            document.body.style.setProperty('--start-text', '200, 200, 200');
            document.body.style.setProperty('--start-text-active', 'var(--darkest)');
            document.body.style.setProperty('--start-icon', 'var(--start-text)');
            document.body.style.setProperty('--start-login-button-bg', 'rgb(var(--light))');
            document.body.style.setProperty('--start-login-button-text', 'var(--main-text)');
            document.body.style.setProperty('--start-download-bar', 'rgb(var(--start-text))');
            document.body.style.setProperty('--start-download-filler', 'rgb(var(--light))');

            document.body.style.setProperty('--header-bg', 'var(--main-text)');
            document.body.style.setProperty('--header-text', 'var(--main-text-accent)');
            document.body.style.setProperty('--header-text-active', 'var(--light)');
            document.body.style.setProperty('--header-underline-active', 'rgb(var(--light))');
            document.body.style.setProperty('--header-profile-border', 'var(--light)');
            document.body.style.setProperty('--header-icon', 'var(--darkest)');

            document.body.style.setProperty('--main-text', '255, 255, 255');
            document.body.style.setProperty('--main-text-accent', '200, 200, 200');

            document.body.style.setProperty('--footer-bg', 'var(--darkest)');
            document.body.style.setProperty('--footer-text', 'var(--main-text)');
            document.body.style.setProperty('--footer-download-bar', 'linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--button-bg', 'linear-gradient(to left bottom, rgb(var(--mid)), rgb(var(--light)))');
            document.body.style.setProperty('--button-text', 'var(--darkest)');
            break;
    
        default:
            document.body.style.setProperty('--darkest', '45, 19, 44');
            document.body.style.setProperty('--dark', '128, 19, 54');
            document.body.style.setProperty('--mid', '199, 44, 65');
            document.body.style.setProperty('--light', '238, 69, 64');
            document.body.style.setProperty('--lightest', '255, 97, 38');

            document.body.style.setProperty('--bg', 'linear-gradient(to right bottom, #801336, #2D132C)');

            document.body.style.setProperty('--start-bg', 'var(--main-text)');
            document.body.style.setProperty('--start-bg-decoration', '200, 200, 200');
            document.body.style.setProperty('--start-header', 'var(--darkest)');
            document.body.style.setProperty('--start-text', '200, 200, 200');
            document.body.style.setProperty('--start-text-active', 'var(--darkest)');
            document.body.style.setProperty('--start-icon', 'var(--start-text)');
            document.body.style.setProperty('--start-login-button-bg', 'rgb(var(--light))');
            document.body.style.setProperty('--start-login-button-text', 'var(--main-text)');
            document.body.style.setProperty('--start-download-bar', 'rgb(var(--start-text))');
            document.body.style.setProperty('--start-download-filler', 'rgb(var(--light))');

            document.body.style.setProperty('--header-bg', 'var(--main-text)');
            document.body.style.setProperty('--header-text', 'var(--main-text-accent)');
            document.body.style.setProperty('--header-text-active', 'var(--light)');
            document.body.style.setProperty('--header-underline-active', 'rgb(var(--light))');
            document.body.style.setProperty('--header-profile-border', 'var(--light)');
            document.body.style.setProperty('--header-icon', 'var(--darkest)');

            document.body.style.setProperty('--main-text', '255, 255, 255');
            document.body.style.setProperty('--main-text-accent', '200, 200, 200');

            document.body.style.setProperty('--footer-bg', 'var(--darkest)');
            document.body.style.setProperty('--footer-text', 'var(--main-text)');
            document.body.style.setProperty('--footer-download-bar', 'linear-gradient(to left, rgb(var(--light)), rgb(var(--mid)))');

            document.body.style.setProperty('--button-bg', 'linear-gradient(to left bottom, rgb(var(--mid)), rgb(var(--light)))');
            document.body.style.setProperty('--button-text', 'var(--darkest)');
            break;
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

function update_theme()
{
    const body = document.body;
    let bg_path = (verify_and_get_resources_folder() + '\\custom_bg.' + settings['bg_extension']).replace(/\\/g, '/');
    if (settings['bg_extension'] == '') 
    {
        switch (settings['theme']) 
        {
            case 'night sky':
                bg_path = '../../res/bg_nightsky.jpg';
                break;
            case 'green hills':
                bg_path = '../../res/bg_greenhills.jpg';
                break;
            case 'dark sun':
                bg_path = '../../res/bg_darksun.jpg';
                break;
            case 'eternal void':
                bg_path = '../../res/bg_eternalvoid.png';
                break;
            case 'default':
                bg_path = '../../res/bg.jpg';
                break;
        
            default:
                bg_path = '../../res/bg.jpg';
                break;
        }
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