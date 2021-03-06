'use strict';

const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { Player } = require('./src/player');
const { YamTouchBar } = require('./src/yamTouchBar');
const { ShortcutManager } = require('./src/shortcutManager');
const { YamTray } = require('./src/yamTray');
const { YamMenu } = require('./src/yamMenu');
const { YamDock } = require('./src/yamDock');
const { Notificator } = require('./src/notificator');
const store = require('./src/store');


let win = null;

app.on('ready', () => {
    win = new BrowserWindow({
            backgroundColor: '#121212',
            width: 1200, height: 800,
            webPreferences: {
                preload: path.join(__dirname, 'src/inject.js'),
                nodeIntegration: true,
                experimentalFeatures: true,
                show: false,
                icon: path.join(__dirname, 'build/icon.png')
            },
            minimizable: false,
    });
    const player = new Player(win, ipcMain);
    const touchBar = new YamTouchBar(player);
    const yamMenu = new YamMenu(player);
    const yamTray = new YamTray(win, player);
    const yamDock = new YamDock(player);
    const notificator = new Notificator(player);

    const shortcuts = new ShortcutManager(win, player);

    player.on('EVENT_READY', () => {
        if (process.env.NODE_ENV !== 'test') {
            win.setTouchBar(touchBar.build());
            yamMenu.build();
            yamTray.build();
            notificator.build();
            yamDock.build();
            shortcuts.bindKeys(win);
        }
    });

    win.loadURL('https://music.yandex.ru');

    win.on('closed', () => {
        win = null;
    });

    win.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            win.hide();
            if(store.get('settings.tray')) {
                app.dock.hide();
            }
        }

        return false;
    });

    app.on('activate', () => win.show());

    win.on('ready-to-show', () => {
        app.dock.show();
        win.show();
        win.focus();
    });
});
