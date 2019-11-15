import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import Electron from 'electron'

const { ipcRenderer } = window.electron

const App: React.FC = () => {
  const [version, setVersion] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [notify, setNotify] = useState<boolean>(false)
  const [notifyRestart, setNotifyRestart] = useState<boolean>(false)

  window.electron.ipcRenderer.send('app_version')

  // electron handlers.
  window.electron.ipcRenderer.on(
    'app_version',
    (event: any, arg: { version: string }): void => {
      console.log('version', arg.version)
      setVersion(`Version ${arg.version} EaDGR Sombish okay okay what!`)
      window.electron.ipcRenderer.removeAllListeners('app_version')
    }
  )
  ipcRenderer.on('update_available', (): void => {
    ipcRenderer.removeAllListeners('update_available')
    setMessage('A new update is available. Downloading now...')
    setNotify(true)
    setNotifyRestart(false)
  })
  ipcRenderer.on(
    'download_progress',
    (event: Electron.IpcRendererEvent, args: any[]): void => {
      setMessage(`Progressing...`)
      console.log(args)
      setNotify(true)
      setNotifyRestart(false)
    }
  )
  ipcRenderer.on('update_downloaded', (): void => {
    ipcRenderer.removeAllListeners('update_downloaded')
    ipcRenderer.removeAllListeners('download_progress')
    setMessage(
      'Update Downloaded. It will be installed on restart. Restart now?'
    )
    setNotifyRestart(true)
    setNotify(true)
  })

  const closeNotification = (): void => {
    setNotify(false)
    setNotifyRestart(false)
  }
  const restartApp = (): void => {
    window.electron.ipcRenderer.send('restart_app')
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Roberto-Stat</h1>
        {version && <p>{version}</p>}
        {notify ? (
          <div className="Notification">
            <p>{message}</p>
            <button onClick={closeNotification}>Close</button>
            {notifyRestart && (
              <button id="restart-button" onClick={restartApp}>
                Restart
              </button>
            )}
          </div>
        ) : null}
      </header>
    </div>
  )
}

export default App
