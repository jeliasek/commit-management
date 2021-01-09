const {BrowserWindow} = require('electron')
const {CLIENT_ID} = require('../../app_config')
const {loadRepos} = require("../models/repository");
const {buildContext} = require("../services/eventDispatcher");
const Config = require('../database/entities/Config')
const {createOctokit} = require("./octokit");

async function init(access_token) {
    const windows = BrowserWindow.getAllWindows()
    window = windows.find(win => win.isVisible()) || new BrowserWindow({
        width: 500,
        height: 500,
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (access_token) {
        let config = await Config.query().first()
        if (!config) {
            config = await Config.query().insert({
                accessToken: access_token
            })
        } else {
            await Config.query().patch({accessToken: access_token})
        }
        window.loadFile('src/components/windows/index.html')
        const repos = await loadRepos()
        //nao mandar a config pelo contexto, fazer um evento pra isso
        buildContext(window, {
            repositories: repos,
            config: config
        })
    } else {
        window.loadURL(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`)
    }
    window.setMenu(null)
    window.webContents.openDevTools()
    global.octokit = await createOctokit(access_token)


}

module.exports = {
    init
}