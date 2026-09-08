import { isTauri } from '../db'

/**
 * Save text to a file the user chooses. Uses the native save dialog in the
 * desktop app and a browser download otherwise.
 * Returns the chosen path (desktop) or the filename (browser), or null if cancelled.
 */
export async function saveTextFile(
  suggestedName: string,
  contents: string,
): Promise<string | null> {
  if (isTauri()) {
    const [{ save }, { invoke }] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/api/core'),
    ])
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: 'Hobby Tracker backup', extensions: ['json'] }],
    })
    if (!path) return null
    await invoke('write_backup', { path, contents })
    return path
  }

  const blob = new Blob([contents], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = suggestedName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return suggestedName
}

/**
 * Ask the user for a text file and return its contents,
 * or null if they cancelled.
 */
export async function openTextFile(): Promise<string | null> {
  if (isTauri()) {
    const [{ open }, { invoke }] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/api/core'),
    ])
    const path = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'Hobby Tracker backup', extensions: ['json'] }],
    })
    if (typeof path !== 'string') return null
    return await invoke<string>('read_backup', { path })
  }

  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      file.text().then(resolve, () => resolve(null))
    }
    // A cancelled picker fires no event in some browsers; `cancel` covers modern ones.
    input.oncancel = () => resolve(null)
    input.click()
  })
}
