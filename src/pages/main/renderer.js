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
} else if (userData['username'] == 'Albee')
{
    reload_btn_div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" viewBox="0 0 958.99 540.85">
    <g id="Layer_8" data-name="Layer 8">
        <path
            d="M959,440c-2.37-.44-5-.34-7-1.41-17.51-9.19-35.37-17.84-52.24-28.11-21.52-13.1-43.87-20.32-69.27-16.44-15.27,2.33-30.69,3.7-45.94,6.16a37.87,37.87,0,0,0-23.36,13.37,24.88,24.88,0,0,1-20.22,9.24c-20-.46-39.93-.95-59.84-2.31-26.43-1.8-51.9,1-77,10-19.8,7.14-40.38,12.13-60.7,17.76-4.1,1.14-8.58.93-12.89,1.22-12.42.85-20.46-5.06-25.32-16.2-4-9.13-8-18.28-12.58-27.12a82.09,82.09,0,0,0-10.67-16.16,39.11,39.11,0,0,0-12.2-9.05c-6.24-3-10.3-7.27-11.25-14.1a122.36,122.36,0,0,1-1-13.4c-.33-12.06-5.11-21.84-14.56-29.34-1.69-1.35-3.34-2.76-5.08-4-11.52-8.44-17.05-20-18.17-34-1.39-17.51-4.86-34.62-11.82-50.78-4.72-11-4.27-21.37,1.43-31.58q13.49-24.15,27.33-48.11c6.74-11.66,13.83-23.11,20.54-34.78,1.63-2.84,3.44-3.84,6.7-3.83q38.7.06,77.41-.25c5.81-.05,11.63-.58,17.44-1a39.73,39.73,0,0,0,27.23-12.93c16.82-17.8,36.66-31.64,57.56-44.27,11.23-6.79,20.85-7.4,32,.51,26.68,19,53.94,37.2,80.94,55.76,5.35,3.68,10.75,7.31,15.79,11.38a15.19,15.19,0,0,0,12.36,3.35c25.26-3.09,50.8-4.68,75.08-13,13.51-4.63,26.53-10.65,40-15.42a135.91,135.91,0,0,1,22.23-5.47c8.15-1.41,10.93.56,12.83,8.66s3.3,16.62,4.85,25c2.07,11.11,4.15,22.22,6.07,33.36,1.73,10-.58,12.72-10.62,13-11.89.36-13.79,2.47-12.22,14.13,1.79,13.34,4.75,26.75,1.13,40.1-3.17,11.67-7,23.2-11.23,34.55-7.09,19.16-14.84,38.08-22,57.21-3.48,9.26-2.88,11.17,6.15,15.09,8.65,3.76,17.83,6.29,26.79,9.33,4.08,1.39,8.22,2.64,12.3,4.05,7.75,2.67,11.19,8.25,11.33,16.34.38,22.48,6.6,43.93,11.86,65.55Zm-323.68-282c2.2,3,3.82,4.7,4.76,6.68,5.17,11,10.19,22,15.24,33,7.07,15.43,9,30.92,2.44,47.27-8.19,20.36,11.85,48.63,35,47.81,7-.24,14.63-1.18,20.8-4.18a217.83,217.83,0,0,0,33.22-19.88c12.63-9.26,25.9-14.65,41.69-13.38,12.1,1,24.22,1.82,36.35,2.47,13.27.71,26.56,1.29,39.85,1.59,6.48.15,10.53-3.49,12.08-9.8,1.74-7.1,3.88-14.13,5.12-21.31,1.9-11-1.66-16.07-12.68-17.76a180.46,180.46,0,0,0-23.35-1.89c-24.79-.57-49.59-.63-74.37-1.36-7.42-.21-14.82-1.8-22.18-3.05-3.23-.54-4.77-2.71-5.29-6.26-1.61-11-3.4-22-5.78-32.87a14.94,14.94,0,0,0-5.56-8.16c-27.13-19.24-54.46-38.21-81.75-57.24-1.33-.94-2.73-1.79-4.82-3.15l-79.79,74.65c-20.16,18.86-20.87,43.35-19.76,68.36,0,.26.4.5,1.56,1.88,5.81-2.06,12.26-4,18.43-6.6,9.91-4.2,14.55-12.13,14.89-22.78.14-4.64.36-9.3.79-13.92.48-5.23,3.66-8.09,8.76-8.62,4.46-.46,8.95-.74,13.44-.83,19.15-.38,21.78-2.41,27.11-20.92C632.33,164.93,633.68,162.18,635.31,158.05Zm50.77,190.6c.06,12.18,2.35,14.81,13.47,15.79a127.09,127.09,0,0,0,13,.21c10.51-.15,18.91-4.71,25.45-12.72,3.68-4.5,7.34-9.06,10.55-13.9,15.48-23.36,37.59-31,64.43-27.15,12.32,1.79,24.49,4.59,36.8,6.46,8.93,1.35,12.71-3.83,9.49-12.38-2.29-6.1-7.33-9.34-13-11.54a41.83,41.83,0,0,0-33,.93c-9.17,4-18.06,4.33-27.45,0a20.82,20.82,0,0,0-13-1.29,132.5,132.5,0,0,0-26.17,9.39c-17.17,8.68-34,18.06-50.65,27.73C688.94,334.31,685.44,341.19,686.08,348.65ZM473.73,241a82.87,82.87,0,0,0,8.59-.83c12.36-2.25,15.63-10,8.84-20.56-.27-.42-.53-.85-.83-1.24-2.76-3.49-2.71-7.23-.16-10.59a104,104,0,0,1,10.65-12.46c8.88-8.52,18.35-16.44,27.09-25.1a64.17,64.17,0,0,0,10.31-13.92c2.41-4.25.46-7.62-4.4-8.31a47.44,47.44,0,0,0-11.42.05c-17.61,1.81-32.64,9.67-44.9,21.9-10.06,10.06-19.69,20.88-27.69,32.6-11.85,17.37-2.17,36.09,18.59,38ZM524,356.52c18.36-.95,36.38-4.14,53.54-10.6,9-3.4,17.38-8.76,25.76-13.7,3.33-2,5-5.69,3-9.57-3.06-6.19-7.36-11.3-15-11.51A66.63,66.63,0,0,0,577,312c-17.12,3.3-34.17,6.95-51.22,10.54-7.24,1.53-14.14,3.88-19.46,9.38-4.17,4.32-5.59,9.45-3.33,15.11,2.13,5.37,5.5,9.53,12,9.51ZM498.49,307c9.36-1,17.17-1.51,24.85-2.79,18.9-3.16,37.42-7.76,54.15-17.6,3.24-1.9,6.82-4.16,8.69-7.2,1.56-2.54,1.34-6.56.82-9.75-.14-.86-4.22-1.34-6.53-1.5a23,23,0,0,0-5.91.75c-13.36,2.63-26.66,5.54-40.07,7.88-10.38,1.82-20.79,2.92-30.11-4.25-1.8-1.38-4.69-1.76-7.11-1.84-10.09-.3-22.11,8.16-25.6,17.73-2.74,7.51-.88,12.52,6.82,14.8C485.41,305.26,492.74,306,498.49,307Zm50.42,88.95c22-.92,43.6-4.31,64.19-12.54,15.49-6.2,17-11.67,7.5-25.38-3-4.33-6.88-6.37-11.94-5.08-7.86,2-15.6,4.49-23.44,6.62-14.54,4-29,8.28-43.72,11.53-7.67,1.7-12,4.54-12.18,11.19-.19,7.54,4.51,12.91,12.11,13.62C543.91,396.12,546.41,395.93,548.91,395.93Z" />
        <path
            d="M676.28,540.85c-7.78-8.15-15.65-16.2-23.27-24.49a33.82,33.82,0,0,1-5-7.94c-1.71-3.43.09-4.82,3.37-4.06,2.37.55,5.07,1.32,6.74,2.92a81.71,81.71,0,0,1,19.74,30.14,14.78,14.78,0,0,1,.45,3.43Z" />
        <path
            d="M540,84.75c-20.06,5.11-39.11,10.48-58.43,14.69-12.76,2.78-22.93,9.08-30.63,19.08q-16,20.73-30.73,42.37C408.44,178,397.39,195.66,385.9,213c-1.79,2.69-1.83,4.61-.4,7.56,6,12.36,12.74,24.55,17,37.53,3,9.05,3.17,19.27,3.17,29,0,11.68,3.08,21.57,11.7,29.58,2,1.81,3.86,3.67,5.85,5.44,9.49,8.47,14,19.19,14.39,31.76q.31,8.73.8,17.44c.45,8.09,4.17,14.25,11.23,18.26,4.34,2.46,8.75,4.8,13.17,7.09,13.08,6.78,22.28,17.12,28.43,30.38,2.8,6,5.51,12.1,8.79,17.85,4,7.07,10.48,10.84,18.53,12.14,17.83,2.89,25.81,12.4,26.08,30.56a15.61,15.61,0,0,1-5.6,12.3,160.52,160.52,0,0,1-41.79,26.87c-2.13,1-6.05,0-8.15-1.42-8.57-6-16.64-12.71-25.13-18.82-6.19-4.46-12.6-8.64-19.18-12.48-5.36-3.12-11-3.13-17.31-1.69-13.75,3.15-27.72,5.33-41.63,7.76-2,.35-4.12-.14-7.75-.32,11.95-12.17,27.8-16,39.23-26l-.45-1.72c-2.79.18-5.72-.12-8.36.62-23,6.48-46.21,12.52-69,19.89C309.51,502.24,279.8,513,250,523.4c-9.65,3.36-11.17,2.51-17.54-5.37-2.19-2.71-6.65-4.7-10.21-4.94-6.74-.46-13.58.61-20.38,1a49.59,49.59,0,0,1-6,.09c-3.66-.23-5.23-1.74-3.3-5.51,1.78-3.49,1.26-6.12-3.19-6.9-3-.52-2.87-2.6-1.67-4.48,2.41-3.76,5-7.43,7.72-10.95,4.64-6,9.46-11.82,14.74-18.37-3.7-2-6.22-3.49-8.84-4.77-26-12.69-52.05-25.28-78-38.08-5.35-2.64-10.32-6.06-15.49-9.07-2.74-1.59-3.57-3.55-2-6.58a265.48,265.48,0,0,1,36.49-55.16c1.25-1.44,5-2,7-1.33q36.72,12.09,73.25,24.72,35.6,12.26,71.07,24.91c3.66,1.32,5.8,1,7.56-2.62a274.41,274.41,0,0,0,21.47-62c.91-4.13-.71-6.41-4.48-8.07-31.36-13.78-62.62-27.77-94-41.51-18-7.87-36.09-15.41-54.13-23.1-1.67-.71-3.3-1.5-5.75-2.61,33-62.38,69.79-122.24,104.94-183.55,4.41,1.84,8.51,3.53,12.6,5.26,11.94,5,23.94,10,35.78,15.26,3.41,1.52,6,1.22,9.25-.43q82.1-41.62,164.31-83c11-5.51,22.25-10.42,34.71-16.23C530.62,28.64,535.23,56.39,540,84.75ZM346.32,150.49c-2.75,2.42-4.57,3.64-5.91,5.27-14.27,17.28-28.61,34.51-42.61,52-4.8,6-4.56,6.83,2.31,10.31,23.41,11.84,46.94,23.44,70.5,35,3.94,1.93,8.24,3.14,12.37,4.68l1.21-1C373.64,221,363.18,185.18,346.32,150.49Z" />
        <path
            d="M132.59,221.41c-32-.81-64.18,2-95.68-6A65.09,65.09,0,0,1,20.19,208a22.1,22.1,0,0,1-7.58-8.34c-1.22-2.23-1.58-6.16-.36-8.1.93-1.47,5.24-1.91,7.54-1.2,5,1.56,9,.22,12.26-3.16a113.68,113.68,0,0,0,9.25-11c3.7-4.9,6.86-10.22,10.73-15,4.69-5.73,5.53-5.7,11.29-1.27,5.92,4.56,11.88,9.12,17.5,14,17.51,15.3,34.87,30.78,52.29,46.18Z" />
        <path
            d="M288.13,63.72c.31-2.56.38-3.84.63-5.09,1.78-8.74,3.89-17.43,5.3-26.23A18,18,0,0,1,303,19.29,91.62,91.62,0,0,1,344.06,6.78c5.95-.43,7.09,1.54,5,7-1.78,4.76-.58,8.35,4.06,12.16,5.52,4.52,6.33,7.06,1.64,12.35A255.22,255.22,0,0,1,332.62,60.4c-5.12,4.51-8.29,3.66-12.34-1.95-3.11-4.31-6.93-5.58-11.69-3.56-4.58,1.94-9,4.27-13.53,6.32C293.17,62.07,291.14,62.64,288.13,63.72Z" />
        <path
            d="M122.8,123.78a28.62,28.62,0,0,1-3.06-2.18C104.79,106.46,89.6,91.54,75,76c-7.36-7.83-6.6-11.49,1.38-18.79,9.68-8.87,13.89-9.5,25.37-3.31,4.67,2.52,9.08,5.5,13.61,8.26l-.57,1.69a29.91,29.91,0,0,0-5.13.9c-3.59,1.28-8.41,1.87-10.33,4.49-2.71,3.72,1.28,7.49,3.17,11.17,6.6,12.81,12.83,25.8,19.15,38.75C122.17,120.18,122.23,121.37,122.8,123.78Z" />
        <path
            d="M104.11,142.45a46,46,0,0,1-6.3-2.21Q55,118.28,12.27,96.11A52.35,52.35,0,0,1,2.11,89c-3.28-2.86-2.69-4.54,1.47-6.47A19.53,19.53,0,0,1,21,83c9.94,4.94,20,10,29.06,16.31C67,111,83.33,123.67,99.94,135.89c2,1.45,4,2.73,6.06,4.08Z" />
        <path
            d="M606.24,510.18c-4.75,11.22,3.53,19.47,5.84,30.32-7.06-2.74-14.25-5.22-21.13-8.35-3.16-1.43-3.91-4.78-1.38-7.5,4.95-5.32,10.24-10.32,15.39-15.46Z" />
    </g>
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