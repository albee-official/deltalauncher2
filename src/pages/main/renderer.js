const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

init_ipc();

//#region  //. User Data -------------------------------------------------
//? LOGOUT

document.querySelector('#profile-sub').addEventListener('click', async e => {
    if (minecraft != undefined && minecraft != null)
    {
        minecraft.kill();
    }
    ipcRenderer.send('logout', {}).then( res => {
        console.log(res);
    });
});

//? GET

let userData = ipcRenderer.sendSync(('get-user-info'), '');

ipcRenderer.sendSync('rich-presence-to', {
    details: 'В меню',
    state: userData['uid'],
    largeImageKey: 'rich_presence_light',
});

//? APPLY

document.getElementById('profile-name').innerHTML = userData['uid'];
//#endregion

let hide_settings_button = document.querySelector('#hide-settings-btn');
hide_settings_button.addEventListener('click', () => {
    settings['opened_settings'] = !settings['opened_settings'];
    updateSettings();
    updateSettings(settings['opened_settings']);
});

function updateSettings(open)
{
    if (open)
    {
        document.querySelector('#play-section').classList.add('closed-settings');
        document.querySelector('#hide-settings-btn').classList.add('rotated');
    }
    else
    {
        document.querySelector('#play-section').classList.remove('closed-settings');
        document.querySelector('#hide-settings-btn').classList.remove('rotated');
    }
}

//#region  //. Panel buttons -----------------------------------------------

document.getElementById('close-btn').addEventListener('mouseover', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgb(var(--mid))';
    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--white))';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--white))';
});

document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(var(--mid), 0)';
    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--darkest))';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--darkest))';
});

document.getElementById('minimize-btn').addEventListener('mouseover', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgb(var(--mid))';
    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--white))';
});

document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(var(--mid), 0)';
    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--darkest))';
});

document.getElementById('reload-btn').addEventListener('mouseover', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgb(var(--mid))';
    document.getElementById('reload-icon').style.fill = 'rgb(var(--white))';
});

document.getElementById('reload-btn').addEventListener('mouseleave', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(var(--mid), 0)';
    document.getElementById('reload-icon').style.fill = 'rgb(var(--darkest))';
});

document.getElementById('close-btn').addEventListener('click', () => {
    update_settings();
    win.close();
});

document.getElementById('minimize-btn').addEventListener('click', () => {
    win.minimize();
});

document.getElementById('reload-btn').addEventListener('click', () => {
    update_settings();
    win.reload();
});
//#endregion

//#region  //. Switchin between sections -----------------------------------

let selected_section = settings['on_page'];

document.getElementById('play-nav').addEventListener('click', () => {
    console.log('showing [play]');
    selected_section = 'play';
    update_selected_section();

    settings['on_page'] = 'play';
    update_settings();
});

document.getElementById('news-nav').addEventListener('click', () => {
    console.log('showing [news]');
    selected_section = 'news';
    update_selected_section();

    settings['on_page'] = 'news';
    update_settings();
});

document.getElementById('settings-nav').addEventListener('click', () => {
    console.log('showing [settings]');
    selected_section = 'settings';
    update_selected_section();

    settings['on_page'] = 'settings';
    update_settings();
});

document.getElementById('shop-nav').addEventListener('click', () => {
    console.log('showing [shop]');
    selected_section = 'shop';
    update_selected_section();

    settings['on_page'] = 'shop';
    update_settings();
});

function update_selected_section()
{
    switch(selected_section)
    {
        case 'play':
            document.getElementById('play-nav').classList = 'nav-element active';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.remove('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-right';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-right';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            break;

        case 'news':
            document.getElementById('news-nav').classList = 'nav-element active';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-right';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            break;

        case 'settings':
            document.getElementById('settings-nav').classList = 'nav-element active';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-left';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            break;

        case 'shop':
            document.getElementById('shop-nav').classList = 'nav-element active';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-left';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-left';
            document.getElementById('shop-section').classList = 'shop-section';
            break;

        default:
            document.getElementById('play-nav').classList = 'nav-element active';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-right';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-right';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            console.log('no section selected. settings to play');
            selected_section = 'play';
            break;
    }
}

update_selected_section();
//#endregion

updateSettings(settings['opened_settings']);