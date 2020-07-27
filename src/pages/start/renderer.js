const { ajax } = require('jquery');

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

ipcRenderer.on('update-message', (event, text) => {
    console.log(text);
});

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
            
        case 'default':
            bg_path = '../../res/bg.jpg';
            break;
    
        default:
            bg_path = '../../res/bg.jpg';
            break;
    }
}

switch (settings['theme']) 
{
    case 'night sky':
        document.body.style.setProperty('--darkest', '14, 19, 39');
        document.body.style.setProperty('--dark', '23, 29, 55');
        document.body.style.setProperty('--mid', '49, 50, 81');
        document.body.style.setProperty('--light', '68, 64, 99');
        document.body.style.setProperty('--lightest', '107, 87, 120');
        document.body.style.setProperty('--white', '255, 255, 255');
        document.body.style.setProperty('--white-contrast', '201, 201, 201');
        break;
    case 'green hills':
        document.body.style.setProperty('--darkest', '8, 38, 38');
        document.body.style.setProperty('--dark', '21, 89, 77');
        document.body.style.setProperty('--mid', '28, 140, 88');
        document.body.style.setProperty('--light', '44, 191, 123');
        document.body.style.setProperty('--lightest', '54, 217, 141');
        document.body.style.setProperty('--white', '255, 255, 255');
        document.body.style.setProperty('--white-contrast', '201, 201, 201');
        break;
    case 'red sunset':
        document.body.style.setProperty('--darkest', '45, 19, 44');
        document.body.style.setProperty('--dark', '128, 19, 54');
        document.body.style.setProperty('--mid', '199, 44, 65');
        document.body.style.setProperty('--light', '238, 69, 64');
        document.body.style.setProperty('--lightest', '255, 97, 38');
        document.body.style.setProperty('--white', '255, 255, 255');
        document.body.style.setProperty('--white-contrast', '201, 201, 201');
        break;
    case 'default':
        document.body.style.setProperty('--darkest', '45, 19, 44');
        document.body.style.setProperty('--dark', '128, 19, 54');
        document.body.style.setProperty('--mid', '199, 44, 65');
        document.body.style.setProperty('--light', '238, 69, 64');
        document.body.style.setProperty('--lightest', '255, 97, 38');
        document.body.style.setProperty('--white', '255, 255, 255');
        document.body.style.setProperty('--white-contrast', '201, 201, 201');
        break;

    default:
        document.body.style.setProperty('--darkest', '45, 19, 44');
        document.body.style.setProperty('--dark', '128, 19, 54');
        document.body.style.setProperty('--mid', '199, 44, 65');
        document.body.style.setProperty('--light', '238, 69, 64');
        document.body.style.setProperty('--lightest', '255, 97, 38');
        document.body.style.setProperty('--white', '255, 255, 255');
        document.body.style.setProperty('--white-contrast', '201, 201, 201');
        break;
}

body.style.backgroundImage = `url("${bg_path}")`;
console.log(bg_path);

//#region //. Top panel -----------------------------
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

    document.getElementById('exit-icon1').style.stroke = 'rgb(var(--darkest))';
    document.getElementById('exit-icon2').style.stroke = 'rgb(var(--darkest))';

    document.getElementById('minimize-icon').style.stroke = 'rgb(var(--darkest))';

    document.getElementById('reload-icon').style.fill = 'rgb(var(--darkest))';

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

    setInterval(() => {
        win.loadFile('src/pages/main/index.html');
    }, 2000);
}

let update_required = false;

function checkUpdate() {
    return new Promise(async (resolve, reject) => {
        verify_root_dirs();

        ipcRenderer.send('check-for-updates');
        
        ipcRenderer.on('update-available', (event, args) => {
            ipcRenderer.send('download-update');
            update_required = true;
        });

        ipcRenderer.on('update-not-available', (event, args) => {
            resolve();
        });

        ipcRenderer.on('download-progress', (event, progressObj) => {
            document.getElementById('update-progress-label').innerHTML = ` Загрузка обновления: ${progressObj.percent.toPrecision(2)}%`;
            document.getElementById('update-progress-bar').style.width = progressObj.percent + '%';
        });

        ipcRenderer.on('update-downloaded', (event) => {
            setTimeout(() => {
                document.getElementById('update-progress-label').innerHTML = `Подготовка к установке...`;
                setTimeout(() => {
                    document.getElementById('update-progress-label').innerHTML = `Выключение лаунчер...`;
                    ipcRenderer.send('install-update');
                    resolve();
                }, 4500);
            }, 500);
        });
    });
}

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

                ipcRenderer.sendSync('update-user-info', { 
                    info: result, 
                    password: document.getElementById('password').value 
                });

                closeLogin();
                resolve();
            }   
        });
    });
}

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
        }).done((data) => {
            ipcRenderer.send('update-user-server-info', data);

            document.getElementById('finish-progress-container').classList.remove('active');
            console.log('done');

            hideTopContent();
            resolve();
        })
    });
}

//. CODE -------------------------------------------------------------------------------------------

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