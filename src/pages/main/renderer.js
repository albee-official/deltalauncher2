const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

init_ipc();

ipcRenderer.on('message', (event, message) => {
    console.log(message);
});

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
    state: userData['username'],
    largeImageKey: 'rich_presence_light',
});

//? APPLY

document.getElementById('profile-name').innerHTML = userData['username'];
document.getElementById('profile-img').setAttribute('src', verify_and_get_resources_folder() + '\\user.png');

// АНДРЕЙ ПАСХАЛКА ЛОЛ
let reload_btn_div = document.getElementById('reload-btn');
if (userData['username'] == 'OneHellSing')
{
    reload_btn_div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11.683" height="13.707" viewBox="0 0 11.683 13.707">
    <path id="reload-icon" data-name="Path 233" d="M2094.6,1838.461a1.441,1.441,0,0,1-.186-.011,5.149,5.149,0,0,1-4.138-4.853,4.629,4.629,0,0,1,2.492-4.824,4.231,4.231,0,0,1-.562-3.244.8.8,0,0,1,.822-.775,1.454,1.454,0,0,1,.208.017,4.014,4.014,0,0,1,3.421,2.511,6.306,6.306,0,0,1,1.643-.935l.054-.02.137-.014a.622.622,0,0,1,.624.575.635.635,0,0,1-.489.7,2,2,0,0,0-1.56,1.329,3.793,3.793,0,0,1,1.43-.311,2.878,2.878,0,0,1,2.294,1.212,5.142,5.142,0,0,1,.75,5.284,4.534,4.534,0,0,1-3.788,3.353,1.709,1.709,0,0,1-.19.011,3.21,3.21,0,0,1-.819-.141,1.86,1.86,0,0,0-1.325,0A3.188,3.188,0,0,1,2094.6,1838.461Zm1.46-1.484a1.637,1.637,0,0,1,.5.073,2.57,2.57,0,0,0,.79.133,2.506,2.506,0,0,0,1.55-.586,4.336,4.336,0,0,0,1.691-3.518l-.013-.239c-.008-.169-.015-.334-.037-.5-.192-1.459-.983-2.3-2.168-2.3a3.286,3.286,0,0,0-1.149.229,3.164,3.164,0,0,1-1.113.207,3.665,3.665,0,0,1-1.406-.3,2.647,2.647,0,0,0-.99-.221,1.9,1.9,0,0,0-1.665,1.173,4.5,4.5,0,0,0,1.142,5.409,2.642,2.642,0,0,0,1.639.637,2.6,2.6,0,0,0,.82-.143A1.345,1.345,0,0,1,2096.057,1836.977Zm-2.568-10.8a2.265,2.265,0,0,0,.4,1.857,2.137,2.137,0,0,0,1.614.806C2095.734,1827.413,2095.078,1826.54,2093.489,1826.177Z" transform="translate(-2090.254 -1824.754)" fill="rgb(var())"/>
</svg>`;
}
//#endregion

//#region //. Side-settings ----------------------------------------------
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

updateSettings(settings['opened_settings']);
//#endregion

//#region  //. Panel buttons -----------------------------------------------

document.getElementById('close-btn').addEventListener('mouseover', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgb(var(--mid))';
    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--white))';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--white))';
});

document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(var(--header-contrast-ultra), 0)';
    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--header-contrast-ultra))';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--header-contrast-ultra))';
});

document.getElementById('minimize-btn').addEventListener('mouseover', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgb(var(--mid))';
    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--white))';
});

document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(var(--mid), 0)';
    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--header-contrast-ultra))';
});

document.getElementById('reload-btn').addEventListener('mouseover', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgb(var(--mid))';
    document.getElementById('reload-icon').style.fill = 'rgb(var(--white))';
});

document.getElementById('reload-btn').addEventListener('mouseleave', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(var(--mid), 0)';
    document.getElementById('reload-icon').style.fill = 'rgb(var(--header-contrast-ultra))';
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

document.getElementById('account-nav').addEventListener('click', () => {
    console.log('showing [account]');
    selected_section = 'account';
    update_selected_section();

    settings['on_page'] = 'account';
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
            document.getElementById('account-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.remove('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-right';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-right';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            document.getElementById('account-section').classList = 'account-section main-right';
            break;

        case 'news':
            document.getElementById('news-nav').classList = 'nav-element active';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            document.getElementById('account-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-right';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            document.getElementById('account-section').classList = 'account-section main-right';
            break;

        case 'settings':
            document.getElementById('settings-nav').classList = 'nav-element active';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            document.getElementById('account-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-left';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            document.getElementById('account-section').classList = 'account-section main-right';
            break;

        case 'shop':
            document.getElementById('shop-nav').classList = 'nav-element active';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('account-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-left';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-left';
            document.getElementById('shop-section').classList = 'shop-section';
            document.getElementById('account-section').classList = 'account-section main-right';
            break;

        case 'account':
            document.getElementById('shop-nav').classList = 'nav-element';
            document.getElementById('play-nav').classList = 'nav-element';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('account-nav').classList = 'nav-element active';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-left';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-left';
            document.getElementById('shop-section').classList = 'shop-section main-left';
            document.getElementById('account-section').classList = 'account-section';
            break;

        default:
            document.getElementById('play-nav').classList = 'nav-element active';
            document.getElementById('news-nav').classList = 'nav-element';
            document.getElementById('settings-nav').classList = 'nav-element';
            document.getElementById('shop-nav').classList = 'nav-element';
            document.getElementById('account-nav').classList = 'nav-element';
            
            document.getElementById('play-section').classList.add('main-left');
            document.getElementById('play-section').classList.remove('main-right');
            document.getElementById('news-section').classList = 'news-section mCustomScrollbar main-right';
            document.getElementById('settings-section').classList = 'settings-section mCustomScrollbar main-right';
            document.getElementById('shop-section').classList = 'shop-section main-right';
            document.getElementById('account-section').classList = 'account-section main-right';
            console.log('no section selected. settings to play');
            selected_section = 'play';
            break;
    }
}

update_selected_section();
//#endregion