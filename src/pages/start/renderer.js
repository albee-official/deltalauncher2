const { ajax } = require('jquery');

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

ipcRenderer.send('check-for-updates');

ipcRenderer.on('update-available', event => {
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
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
body.style.backgroundImage = `url("${bg_path}")`;
console.log(bg_path);

//#region //. Top panel -----------------------------
let exitLisHover = document.getElementById('close-btn').addEventListener('mouseover', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
});

let exitLisLeave = document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.backgroundColor = 'rgba(255, 255, 255, 0)';
});

let minimizeLisHover = document.getElementById('minimize-btn').addEventListener('mouseover', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
});

let minimizeLisLeave = document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
    document.getElementById('minimize-btn').style.backgroundColor = 'rgba(255, 255, 255, 0)';
});

let reloadLisHover = document.getElementById('reload-btn').addEventListener('mouseover', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
});

let reloadLisLeave = document.getElementById('reload-btn').addEventListener('mouseleave', () => {
    document.getElementById('reload-btn').style.backgroundColor = 'rgba(255, 255, 255, 0)';
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

    document.getElementById('exit-icon1').style.stroke = '#2D132C';
    document.getElementById('exit-icon2').style.stroke = '#2D132C';

    document.getElementById('minimize-icon').style.stroke = '#2D132C';

    document.getElementById('reload-icon').style.fill = '#2D132C';

    document.getElementById('close-btn').addEventListener('mouseover', () => {
        document.getElementById('close-btn').style.backgroundColor = 'rgb(219, 33, 48)';
        document.getElementById('exit-icon1').style.stroke = '#ffffff';
        document.getElementById('exit-icon2').style.stroke = '#ffffff';
    });
    
    document.getElementById('close-btn').addEventListener('mouseleave', () => {
        document.getElementById('close-btn').style.backgroundColor = 'rgba(255, 255, 255, 0)';
        document.getElementById('exit-icon1').style.stroke = '#2D132C';
        document.getElementById('exit-icon2').style.stroke = '#2D132C';
    });

    document.getElementById('minimize-btn').addEventListener('mouseover', () => {
        document.getElementById('minimize-btn').style.backgroundColor = 'rgb(219, 33, 48)';
        document.getElementById('minimize-icon').style.stroke = '#ffffff';
    });
    
    document.getElementById('minimize-btn').addEventListener('mouseleave', () => {
        document.getElementById('minimize-btn').style.backgroundColor = 'rgba(255, 255, 255, 0)';
        document.getElementById('minimize-icon').style.stroke = '#2D132C';
    });

    document.getElementById('reload-btn').addEventListener('mouseover', () => {
        document.getElementById('reload-btn').style.backgroundColor = 'rgb(219, 33, 48)';
        document.getElementById('reload-icon').style.fill = '#ffffff';
    });
    
    document.getElementById('reload-btn').addEventListener('mouseleave', () => {
        document.getElementById('reload-btn').style.backgroundColor = 'rgba(255, 255, 255, 0)';
        document.getElementById('reload-icon').style.fill = '#2D132C';
    });

    setInterval(() => {
        win.loadFile('src/pages/main/index.html');
    }, 2000);
}

function checkUpdate() {
    return new Promise((resolve, reject) => {
        verify_root_dirs();

        let updateProgress = 0;
        let updateProgress_interval = setInterval(() => {
            if (updateProgress < 100)
            {
                updateProgress++;
                document.getElementById('update-progress-label').innerHTML = 'Проверка обновлений: ' + updateProgress + '%';
                document.getElementById('update-progress-bar').style.width = updateProgress.toString() + '%';
            }
            else
            {
                document.getElementById('update-progress-container').classList.remove('active');
                document.getElementById('auth-progress-container').classList.add('active');
                clearInterval(updateProgress_interval);
                resolve();
            }
        }, 20);
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

    ipcRenderer.send('check-for-updates');
});

document.getElementById('login-button').addEventListener('click', () => {
    login().then(() => {
        finish();
    });
});