

//#region //. Theme update -----------
function set_theme_colours(theme)
{
    switch (theme) 
    {
        case 'night sky':
            document.body.style.setProperty('--darkest', '14, 19, 39');
            document.body.style.setProperty('--dark', '23, 29, 55');
            document.body.style.setProperty('--mid', '49, 50, 81');
            document.body.style.setProperty('--light', '68, 64, 99');
            document.body.style.setProperty('--lightest', '107, 87, 120');
            document.body.style.setProperty('--header-bg', '255, 255, 255');
            document.body.style.setProperty('--header-contrast', '201, 201, 201');
            document.body.style.setProperty('--header-contrast-ultra', '14, 19, 39');
            document.body.style.setProperty('--white', '255, 255, 255');
            document.body.style.setProperty('--white-contrast', '201, 201, 201');
            break;
        case 'green hills':
            document.body.style.setProperty('--darkest', '8, 38, 38');
            document.body.style.setProperty('--dark', '21, 89, 77');
            document.body.style.setProperty('--mid', '28, 140, 88');
            document.body.style.setProperty('--light', '44, 191, 123');
            document.body.style.setProperty('--lightest', '54, 217, 141');
            document.body.style.setProperty('--header-bg', '255, 255, 255');
            document.body.style.setProperty('--header-contrast', '201, 201, 201');
            document.body.style.setProperty('--header-contrast-ultra', '8, 38, 38');
            document.body.style.setProperty('--white', '255, 255, 255');
            document.body.style.setProperty('--white-contrast', '201, 201, 201');
            break;
        case 'red sunset':
            document.body.style.setProperty('--darkest', '45, 19, 44');
            document.body.style.setProperty('--dark', '128, 19, 54');
            document.body.style.setProperty('--mid', '199, 44, 65');
            document.body.style.setProperty('--light', '238, 69, 64');
            document.body.style.setProperty('--lightest', '255, 97, 38');
            document.body.style.setProperty('--header-bg', '255, 255, 255');
            document.body.style.setProperty('--header-contrast', '201, 201, 201');
            document.body.style.setProperty('--header-contrast-ultra', '45, 19, 44');
            document.body.style.setProperty('--white', '255, 255, 255');
            document.body.style.setProperty('--white-contrast', '201, 201, 201');
            break;
        case 'eternal void':
            document.body.style.setProperty('--darkest', '0, 0, 0');
            document.body.style.setProperty('--dark', '38, 38, 38');
            document.body.style.setProperty('--mid', '97, 97, 97');
            document.body.style.setProperty('--light', '164, 164, 164');
            document.body.style.setProperty('--lightest', ' 193, 193, 193');
            document.body.style.setProperty('--header-bg', '16, 16, 16');
            document.body.style.setProperty('--header-contrast', '72, 72, 72');
            document.body.style.setProperty('--header-contrast-ultra', '255, 255, 255');
            document.body.style.setProperty('--white', '255, 255, 255');
            document.body.style.setProperty('--white-contrast', '201, 201, 201');
            break;
        case 'default':
            document.body.style.setProperty('--darkest', '45, 19, 44');
            document.body.style.setProperty('--dark', '128, 19, 54');
            document.body.style.setProperty('--mid', '199, 44, 65');
            document.body.style.setProperty('--light', '238, 69, 64');
            document.body.style.setProperty('--lightest', '255, 97, 38');
            document.body.style.setProperty('--header-bg', '255, 255, 255');
            document.body.style.setProperty('--header-contrast', '201, 201, 201');
            document.body.style.setProperty('--header-contrast-ultra', '45, 19, 44');
            
            document.body.style.setProperty('--white', '255, 255, 255');
            document.body.style.setProperty('--white-contrast', '201, 201, 201');
            break;
    
        default:
            document.body.style.setProperty('--darkest', '45, 19, 44');
            document.body.style.setProperty('--dark', '128, 19, 54');
            document.body.style.setProperty('--mid', '199, 44, 65');
            document.body.style.setProperty('--light', '238, 69, 64');
            document.body.style.setProperty('--lightest', '255, 97, 38');
            document.body.style.setProperty('--header-bg', '255, 255, 255');
            document.body.style.setProperty('--header-contrast', '201, 201, 201');
            document.body.style.setProperty('--header-contrast-ultra', '45, 19, 44');
            document.body.style.setProperty('--white', '255, 255, 255');
            document.body.style.setProperty('--white-contrast', '201, 201, 201');
            break;
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
            case 'red sunset':
                bg_path = '../../res/bg_redsunset.jpg';
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
    body.style.backgroundImage = `url("${bg_path}?${new Date()}")`;
}

update_theme();
//#endregion