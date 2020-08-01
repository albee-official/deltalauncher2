const { ajax } = require('jquery');

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

ipcRenderer.on('update-message', (event, text) => {
    console.log(text);
});

const body = document.body;

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
    document.getElementById('close-btn').style.backgroundColor = 'rgba(var(--white), 0.4)';
});

let exitLisLeave = document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(var(--white), 0)';
});

let minimizeLisHover = document.getElementById('minimize-btn').addEventListener('mouseover', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(var(--white), 0.3)';
});

let minimizeLisLeave = document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(var(--white), 0)';
});

let reloadLisHover = document.getElementById('reload-btn').addEventListener('mouseover', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(var(--white), 0.2)';
});

let reloadLisLeave = document.getElementById('reload-btn').addEventListener('mouseleave', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(var(--white), 0)';
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
    document.getElementById('top-container').style.opacity = '0';

    document.getElementById('top-lines').style.animationPlayState = 'running';
    document.getElementById('top-lines').style.opacity = '0';

    document.getElementById('top').style.animation = 'open-circle 2s cubic-bezier(0.645, 0.045, 0.355, 1) paused';
    document.getElementById('top').style.animationPlayState = 'running';
    document.getElementById('top').style.clipPath = 'circle(128% at 6% 50%)';

    document.getElementById('close-btn').removeEventListener('mouseover', exitLisHover);
    document.getElementById('close-btn').removeEventListener('mouseleave', exitLisLeave);
    document.getElementById('minimize-btn').removeEventListener('mouseover', minimizeLisHover);
    document.getElementById('minimize-btn').removeEventListener('mouseleave', minimizeLisLeave);
    document.getElementById('reload-btn').removeEventListener('mouseover', reloadLisHover);
    document.getElementById('reload-btn').removeEventListener('mouseleave', reloadLisLeave);

    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--header-contrast-ultra))';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--header-contrast-ultra))';

    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--header-contrast-ultra))';

    document.getElementById('reload-icon').style.fill = 'rgb(var(--header-contrast-ultra))';

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

    setInterval(() => {
        win.loadFile('src/pages/main/index.html');
    }, 2000);
}

let update_required = false;
let downloading_update = false;

//#region //. Check for update --------------------------------------
function checkUpdate() {
    return new Promise(async (resolve, reject) => {
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
                    document.getElementById('update-progress-label').innerHTML = `Выключение лаунчер...`;
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
        console.log('Starting login!');
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
            dataType: 'json'
        }).done((data) => {
            document.getElementById('auth-container').classList.add('open-auth');
            document.getElementById('auth-container').classList.remove('auth-locked');
            document.getElementById('auth-container').style.transition = 'all 1s cubic-bezier(0.645, 0.045, 0.355, 1)';
            requestResult = data;
        }).then((result) => {
            if (result['uid'] != undefined && result['uid'] != "" && result['uid'] != null)
            {
                console.log('Login Succesfull!');
                console.log(result['uid']);

                ipcRenderer.send('update-user-info', { 
                    info: result, 
                    password: document.getElementById('password').value 
                });

                ipcRenderer.on('user-info-updated', (event, args) => {
                    closeLogin();
                    resolve();
                });
            }   
        });
    });
}
//#endregion

//#region //. Finishing (downloading and requesting user information)
function finish() {
    return new Promise((resolve, reject) => {

        document.getElementById('finish-progress-container').classList.add('active');
        document.getElementById('auth-progress-container').classList.remove('active');

        ajax({
            url: 'https://deltaminecraft.000webhostapp.com/includes/launcher.getuserinfo.inc.php',
            method: 'POST',
            data: {
                uid: document.getElementById('login').value,
            },
            dataType: 'json'
        }).done(async (data) => {
            ipcRenderer.send('update-user-server-info', data);

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
        downloading_icon = true;
        ipcRenderer.send('download-from-link', {
            threads: 2,
            path: verify_and_get_resources_folder(),
            url: `https://deltaminecraft.000webhostapp.com/uploads/profileImgs/${document.getElementById('login').value}.png`,
            filename: `user.png`
        });
    
        ipcRenderer.on('download-progress', (event, progress) => {
            document.getElementById('finish-progress-bar').style.width = progress.procentage * 100 + '%';
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
}

let downloading_skin = false;
async function download_user_skin()
{
    return new Promise((resolve, reject) => {
        downloading_skin = true;
        ipcRenderer.send('download-from-link', {
            threads: 2,
            path: verify_and_get_resources_folder(),
            url: `https://deltaminecraft.000webhostapp.com/uploads/skins/${document.getElementById('login').value}.png`,
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
}
//#endregion
//#endregion

//#region //. -------------------------------- CODE ----------------------------------

update_theme();

checkUpdate().then(() => {
    let user_credentials = ipcRenderer.sendSync('get-user-credentials');

    if (update_required) return;
    if (user_credentials == {})
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

document.getElementById('login-button').addEventListener('click', () => {
    login().then(() => {
        finish();
    });
});
//#endregion