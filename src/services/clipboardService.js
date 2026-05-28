export const clipboardService = {
  async copyText(text) {
    await navigator.clipboard.writeText(text)
  },
}
