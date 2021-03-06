const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

let win;
let errorCode;

function createWindow() {
  const icon = path.resolve(__dirname, 'icon.ico');
  win = new BrowserWindow({ width: 800, height: 600, title: 'Account', show: false, icon });
  win.setMenu(null);
  const address = url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.resolve(__dirname, 'signIn.html'),
  });
  win.loadURL(address);

  ipcMain.on('config', (event, token) => {
    process.stdout.write(token);
    win.close();
    win = null;
  });

  ipcMain.on('error', (event, error) => {
    process.stderr.write(error);
    errorCode = 1;
    win.close();
    win = null;
  });

  win.once('ready-to-show', () => {
    win.show();
  });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => app.exit(errorCode));
app.on('activate', () => {
  if (win === null) createWindow();
});
// Ignore TLS certificates validation if local environment
app.on('certificate-error', (event, webContents, remoteUrl, error, certificate, callback) => {
  if (remoteUrl.startsWith('https://remoteworkspace.developer.samsung.com') ||
    remoteUrl.startsWith('https://localworkspace.developer.samsung.com')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});
