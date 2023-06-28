window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector:any, text:any) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
});
