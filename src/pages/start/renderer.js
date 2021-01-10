const { ajax } = require('jquery');

const win = remote.getCurrentWindow();

ipcRenderer.on('update-message', (event, text) => {
    console.log(text);
});

const body = document.body;
console.log('Opened START');

//#region //. -------------------------------- Login Text fields ---------------------
document.getElementById("login").addEventListener("input", (e) => {
    checkLogin(e);
});

document.getElementById("login").addEventListener("focus", (e) => {
    checkLogin(e);
});

document.getElementById("login").addEventListener("blur", (e) => {
    checkLogin(e);
});

document.getElementById("password").addEventListener("input", (e) => {
    checkPassword(e);
});

document.getElementById("password").addEventListener("focus", (e) => {
    checkPassword(e);
});

document.getElementById("password").addEventListener("blur", (e) => {
    checkPassword(e);
});

function checkLogin(e) {
    let login = document.getElementById("login");
    if (
        (login.value != "" &&
            document
            .getElementById("login-line")
            .children[0].classList.contains("active-text-line")) ||
        e.currentTarget == document.activeElement
    ) {
        document
            .getElementById("login-line")
            .children[0].classList.add("active-text-line");
        document.getElementById("login").classList.add("active-text-field");
    } else if (
        (login.value == "" &&
            !document
            .getElementById("login-line")
            .children[0].classList.contains("active-text-line")) ||
        e.currentTarget != document.activeElement
    ) {
        document
            .getElementById("login-line")
            .children[0].classList.remove("active-text-line");
        document
            .getElementById("login")
            .classList.remove("active-text-field");
    }
}

function checkPassword(e) {
    let password = document.getElementById("password");
    if (
        (password.value != "" &&
            document
            .getElementById("password-line")
            .children[0].classList.contains("active-text-line")) ||
        e.currentTarget == document.activeElement
    ) {
        document
            .getElementById("password-line")
            .children[0].classList.add("active-text-line");
        document
            .getElementById("password")
            .classList.add("active-text-field");
    } else if (
        (password.value == "" &&
            !document
            .getElementById("password-line")
            .children[0].classList.contains("active-text-line")) ||
        e.currentTarget != document.activeElement
    ) {
        document
            .getElementById("password-line")
            .children[0].classList.remove("active-text-line");
        document
            .getElementById("password")
            .classList.remove("active-text-field");
    }
}
//#endregion

//#region //. -------------------------------- Top panel -----------------------------
let exitLisHover = document.getElementById('close-btn').addEventListener('mouseover', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(var(--global-clr-rgb), 1)';
});

let exitLisLeave = document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(var(--global-text-rgb), 0)';
});

let minimizeLisHover = document.getElementById('minimize-btn').addEventListener('mouseover', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(var(--global-text-rgb), .3)';
});

let minimizeLisLeave = document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(var(--global-text-rgb), 0)';
});

let reloadLisHover = document.getElementById('reload-btn').addEventListener('mouseover', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(var(--global-text-rgb), .1)';
});

let reloadLisLeave = document.getElementById('reload-btn').addEventListener('mouseleave', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(var(--global-text-rgb), 0)';
});

document.getElementById('close-btn').addEventListener('click', () => {
     win.close();
});

document.getElementById('minimize-btn').addEventListener('click', () => {
    win.minimize();
});

document.getElementById('reload-btn').addEventListener('click', () => {
    win.reload();
});

//#endregion

//#region //. -------------------------------- Stage functions -----------------------
function openLogin() {
    document.getElementById('auth-container').classList.add('open-auth');
    document.getElementById('main-container').classList.add('close-container');
}

function closeLogin() {
    document.getElementById('auth-container').classList.remove('open-auth');
    document.getElementById('main-container').classList.remove('close-container');
}

function hideTopContent() {
    document.getElementById('top-container').style.animationPlayState = 'running';
    document.getElementById('top-container').style.opacity = '0 !important';

    document.getElementById('top-lines').style.animationPlayState = 'running';
    document.getElementById('top-lines').style.opacity = '0 !important';

    document.getElementById('top').style.animation = 'open-circle 2s cubic-bezier(0.645, 0.045, 0.355, 1) paused';
    document.getElementById('top').style.animationPlayState = 'running';
    document.getElementById('top').style.clipPath = 'circle(128% at 6% 50%)';

    document.getElementById('logo').style.animation = 'finished-top-contents 1s cubic-bezier(0.645, 0.045, 0.355, 1) paused';
    document.getElementById('logo').style.animationPlayState = 'running';
    document.getElementById('logo').style.opacity = '0';

    document.getElementById('close-btn').removeEventListener('mouseover', exitLisHover);
    document.getElementById('close-btn').removeEventListener('mouseleave', exitLisLeave);
    document.getElementById('minimize-btn').removeEventListener('mouseover', minimizeLisHover);
    document.getElementById('minimize-btn').removeEventListener('mouseleave', minimizeLisLeave);
    document.getElementById('reload-btn').removeEventListener('mouseover', reloadLisHover);
    document.getElementById('reload-btn').removeEventListener('mouseleave', reloadLisLeave);

    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--header-sysbuttons-icon))';
    document.getElementById('exit-icon1').style.transition = 'stroke 1s';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--header-sysbuttons-icon))';
    document.getElementById('exit-icon2').style.transition = 'stroke 1s';

    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--header-sysbuttons-icon))';
    document.getElementById('minimize-icon').style.transition = 'stroke 1s';

    document.getElementById('reload-icon').style.fill = 'rgb(var(--header-sysbuttons-icon))';
    document.getElementById('reload-icon').style.transition = 'fill 1s';

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

    setInterval(() => {
        ipcRenderer.send('load-main-win');

        ipcRenderer.on('main-win-opened', () => {
            win.destroy();
            resolve();
        });
    }, 2000);
}

let update_required = false;
let downloading_update = false;

//#region //. Check for update --------------------------------------
function checkUpdate() {
    return new Promise(async (resolve, reject) => {
        console.log('-- Checking for updates --');
        verify_root_dirs();

        ipcRenderer.send('check-for-updates');
        
        ipcRenderer.on('update-available', (event, args) => {
            ipcRenderer.send('download-update');
            update_required = true;
            downloading_update = true;
        });

        ipcRenderer.on('update-error', () => {
            document.getElementById('update-progress-container').classList.remove('active');
            document.getElementById('auth-progress-container').classList.add('active');
            resolve();
        });

        ipcRenderer.on('update-not-available', (event, args) => {
            document.getElementById('update-progress-container').classList.remove('active');
            document.getElementById('auth-progress-container').classList.add('active');
            resolve();
        });

        ipcRenderer.on('already-checking-for-update', (event, args) => {
            document.getElementById('update-progress-container').classList.remove('active');
            document.getElementById('auth-progress-container').classList.add('active');
            resolve();
        });

        ipcRenderer.on('download-progress', (event, progressObj) => {
            if (downloading_update)
            {
                document.getElementById('update-progress-label').innerHTML = ` Загрузка обновления: ${progressObj.percent.toPrecision(2)}%`;
                document.getElementById('update-progress-bar').style.width = progressObj.percent + '%';
            }
        });

        ipcRenderer.on('update-downloaded', (event) => {
            setTimeout(() => {
                document.getElementById('update-progress-label').innerHTML = `Подготовка к установке...`;
                downloading_update = false;
                setTimeout(() => {
                    document.getElementById('update-progress-label').innerHTML = `Выключение лаунчера...`;
                    ipcRenderer.send('install-update');
                    resolve();
                }, 4500);
            }, 500);
        });
    });
}
//#endregion

//#region //. Login -------------------------------------------------
function login() {
    return new Promise((resolve, reject) => {
        console.log('-- Starting login --');

        document.getElementById('auth-container').classList.remove('open-auth');
        document.getElementById('auth-container').style.transition = 'all .2s linear';
        document.getElementById('auth-container').classList.add('auth-locked');
        ajax({
            url: 'https://deltaminecraft.000webhostapp.com/includes/launcher.login.inc.php',
            method: 'POST',
            data: {
                mailuid: document.getElementById('login').value,
                pwd: document.getElementById('password').value 
            },
            dataType: 'text'
        }).done((data) => {
            console.log(`got reply. data: \n ${data}`);
            document.getElementById('auth-container').classList.add('open-auth');
            document.getElementById('auth-container').classList.remove('auth-locked');
            document.getElementById('auth-container').style.transition = 'all 1s cubic-bezier(0.645, 0.045, 0.355, 1)';
            data.replaceAt(0, '{');
            requestResult = JSON.parse(data);
        }).then((result) => {
            result = JSON.parse(result);
            if (result['username'] != undefined && result['username'] != "" && result['username'] != null)
            {
                console.log('[LOGIN] Succesfull');
                console.log(`[LOGIN] username: ${result['username']}`);

                userInfo = {
                    ...userInfo,
                    ...result,
                };

                closeLogin();
                resolve();
            }   
        });
    });
}
//#endregion

//#region //. Finishing (downloading and requesting user information)
function finish() {
    return new Promise((resolve, reject) => {
        console.log('-- Finishing --');

        document.getElementById('finish-progress-container').classList.add('active');
        document.getElementById('auth-progress-container').classList.remove('active');

        ajax({
            url: 'https://deltaminecraft.000webhostapp.com/includes/launcher.getuserinfo.inc.php',
            method: 'POST',
            data: {
                username: document.getElementById('login').value,
            },
            dataType: 'json'
        }).done(async (data) => {
            userInfo = {
                ...userInfo,
                servers_info: data,
            }

            document.getElementById('finish-progress-bar').style.width = '80%';

            await download_user_icon();
            await download_user_skin();

            hideTopContent();
            resolve();
        });
    });
}

let downloading_icon = false;
async function download_user_icon()
{
    return new Promise((resolve, reject) => {
        ajax({
            url: 'https://deltaminecraft.000webhostapp.com/includes/launcher.getlink.inc.php',
            method: 'POST',
            data: {
                username: document.getElementById('login').value,
                type: 'icon',
            },
            dataType: 'text'
        }).then(res => {
            console.log(`Got link: ${res}`);

            downloading_icon = true;
            ipcRenderer.send('download-from-link', {
                threads: 2,
                path: verify_and_get_resources_folder(),
                url: res,
                filename: `user.png`
            });
        
            ipcRenderer.on('download-completed', (event, args) => {
                if (downloading_icon)
                {
                    document.getElementById('finish-progress-container').classList.remove('active');
                    console.log('done');
            
                    hideTopContent();
                    resolve();
                }
            });
        });
    });
}

let downloading_skin = false;
async function download_user_skin()
{
    return new Promise((resolve, reject) => {
        ajax({
            url: 'https://deltaminecraft.000webhostapp.com/includes/launcher.getlink.inc.php',
            method: 'POST',
            data: {
                username: document.getElementById('login').value,
                type: 'skin',
            },
            dataType: 'text'
        }).then(res => {
            console.log(`Got link: ${res}`);

            downloading_skin = true;
            ipcRenderer.send('download-from-link', {
                threads: 2,
                path: verify_and_get_resources_folder(),
                url: res,
                filename: `${document.getElementById('login').value}.png`
            });
        
            ipcRenderer.on('download-progress', (event, progress) => {
                document.getElementById('finish-progress-bar').style.width = progress.procentage * 100 + '%';
            });
        
            ipcRenderer.on('download-completed', (event, args) => {
                if (downloading_skin)
                {
                    document.getElementById('finish-progress-container').classList.remove('active');
                    console.log('done');
            
                    hideTopContent();
                    resolve();
                }
            });
        });
    });
}
//#endregion
//#endregion

//#region //. -------------------------------- CODE ----------------------------------

update_theme();

checkUpdate().then(() => {
    let user_credentials = ipcRenderer.sendSync('get-user-credentials');

    if (update_required) return;
    if (user_credentials == {} || user_credentials == undefined)
    {
        openLogin(); 
    }
    else
    {
        openLogin(); 
        document.getElementById('login').value = user_credentials[0]['account'];
        document.getElementById('password').value = user_credentials[0]['password'];
        login().then(() => {
            finish();
        });
    }
});

document.getElementById('login-button').addEventListener('click', (e) => {
    e.preventDefault();
    login().then(() => {
        finish();
    });
});
//#endregion

//#region  //. Console warning --------------------------------------------
if (win.webContents.isDevToolsOpened()) {
    let header_color = `rgb(${themes_json[settings['theme']]['css'][3].split(':')[1].substring(1)})`;
    let p_color = `rgb(${themes_json[settings['theme']]['css'][3].split(':')[1].substring(1)})`;
    console.log("%cПодожди-ка!", `color:${header_color}; font-size: 48px; padding: 8px 0; font-weight:bold`);
    console.log("%cТот, кто попросил вставить что либо сюда, с вероятностью 420/69 хочет тебя обмануть.", "color:#ffffff; font-size: 14px; padding: 8px 0");
    console.log("%cЕсли вставить сюда что-нибудь, плохие дяди смогут получить доступ к вашему аккаунту.", `color:${p_color}; font-size: 16px; padding: 8px 0; font-weight:bold`);
}

ipcRenderer.on('devtools-opened', (event, message) => {
    let header_color = `rgb(${themes_json[settings['theme']]['css'][3].split(':')[1].substring(1)})`;
    let p_color = `rgb(${themes_json[settings['theme']]['css'][3].split(':')[1].substring(1)})`;
    console.log("%cПодожди-ка!", `color:${header_color}; font-size: 48px; padding: 8px 0; font-weight:bold`);
    console.log("%cТот, кто попросил вставить что либо сюда, с вероятностью 420/69 хочет тебя обмануть.", "color:#ffffff; font-size: 14px; padding: 8px 0");
    console.log("%cЕсли вставить сюда что-нибудь, плохие дяди смогут получить доступ к вашему аккаунту.", `color:${p_color}; font-size: 16px; padding: 8px 0; font-weight:bold`);
});
//#endregion