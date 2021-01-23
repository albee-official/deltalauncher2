const win = remote.getCurrentWindow();
let resource_codes = {icon: '', skin: ''};

init_ipc();

Object.freeze(userInfo);
deepFreeze(userInfo);

ipcRenderer.on('message', (event, message) => {
    console.log(`[MSG] <main> ${message}`);
});

window.addEventListener('beforeunload', () => {
    win.webContents.emit('win-reload');
});

//#region  //. User Data -------------------------------------------------
document.querySelector('#profile-sub').addEventListener('click', async e => {
    ipcRenderer.send('logout', { login: userInfo['username'] });

    ipcRenderer.on('successful-logout', (event, { res }) => {
        console.log(res);
        app.relaunch();
        app.quit();
    });
});

document.getElementById('profile-name').innerHTML = userInfo['username'];
document.getElementById('profile-img').setAttribute('src', `${verify_and_get_resources_folder()}\\${resources.icon.full_name}`);

rpc = {
    ...rpc,
    details: 'В меню',
    state: userInfo['username'],
};
//#endregion

//#region  //. Side-settings ----------------------------------------------
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

//#region  //. Panel buttons ----------------------------------------------

function reloadWin(hard) {
    const win = remote.getCurrentWindow();
    if (hard) {
        console.log('Not saving settings');
    } else {
        update_settings();
    }
    win.reload();
}

document.getElementById('close-btn').addEventListener('mouseover', () => {
    document.getElementById('close-btn').style.backgroundColor = 'var(--header-sysbuttons-bg-hover)';
    document.getElementById('exit-icon1').style.stroke = 'var(--header-sysbuttons-icon-hover)';
    document.getElementById('exit-icon2').style.stroke = 'var(--header-sysbuttons-icon-hover)';
});

document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.backgroundColor = 'var(--header-sysbuttons-bg)';
    document.getElementById('exit-icon1').style.stroke = 'var(--header-sysbuttons-icon)';
    document.getElementById('exit-icon2').style.stroke = 'var(--header-sysbuttons-icon)';
});

document.getElementById('minimize-btn').addEventListener('mouseover', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'var(--header-sysbuttons-bg-hover)';
    document.getElementById('minimize-icon').style.stroke = 'var(--header-sysbuttons-icon-hover)';
});

document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'var(--header-sysbuttons-bg)';
    document.getElementById('minimize-icon').style.stroke = 'var(--header-sysbuttons-icon)';
});

document.getElementById('reload-btn').addEventListener('mouseover', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'var(--header-sysbuttons-bg-hover)';
    document.getElementById('reload-icon').style.fill = 'var(--header-sysbuttons-icon-hover)';
});

document.getElementById('reload-btn').addEventListener('mouseleave', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'var(--header-sysbuttons-bg)';
    document.getElementById('reload-icon').style.fill = 'var(--header-sysbuttons-icon)';
});

document.getElementById('close-btn').addEventListener('click', () => {
    update_settings();
    win.close();
});

document.getElementById('minimize-btn').addEventListener('click', () => {
    win.minimize();
});

document.getElementById('reload-btn').addEventListener('click', (e) => {
    reloadWin(e.ctrlKey);
});
//#endregion

//#region  //. Switchin between sections ----------------------------------

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

//#region  //. Console warning --------------------------------------------


if (win.webContents.isDevToolsOpened()) {
    let header_color = `${themes_json[settings['theme']]['css'][1].split(':')[1].substring(1)}`;
    let p_color = `#FFF`;
    console.log("%cПодожди-ка!", `color:${header_color}; font-size: 48px; padding: 8px 0; font-weight:bold`);
    console.log("%cТот, кто попросил вставить что либо сюда, с вероятностью 420/69 хочет тебя обмануть.", "color:#ffffff; font-size: 14px; padding: 8px 0");
    console.log("%cЕсли вставить сюда что-нибудь, плохие дяди смогут получить доступ к вашему аккаунту.", `color:${p_color}; font-size: 16px; padding: 8px 0; font-weight:bold`);
}

ipcRenderer.on('devtools-opened', (event, message) => {
    let header_color = `${themes_json[settings['theme']]['css'][1].split(':')[1].substring(1)}`;
    let p_color = `#FFF`;
    console.log("%cПодожди-ка!", `color:${header_color}; font-size: 48px; padding: 8px 0; font-weight:bold`);
    console.log("%cТот, кто попросил вставить что либо сюда, с вероятностью 420/69 хочет тебя обмануть.", "color:#ffffff; font-size: 14px; padding: 8px 0");
    console.log("%cЕсли вставить сюда что-нибудь, плохие дяди смогут получить доступ к вашему аккаунту.", `color:${p_color}; font-size: 16px; padding: 8px 0; font-weight:bold`);
});
//#endregion


