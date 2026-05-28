export function downloadTextFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

export function downloadCss(filename, css) {
  downloadTextFile(filename, css, 'text/css')
}

export function downloadHtml(filename, html) {
  downloadTextFile(filename, html, 'text/html')
}

export function downloadJson(filename, data) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), 'application/json')
}
