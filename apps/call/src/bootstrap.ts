function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

function waitForScriptLoad(scriptEl: HTMLScriptElement, src: string) {
  return new Promise<void>((resolve, reject) => {
    if (scriptEl.dataset.loaded === 'true') {
      resolve()
      return
    }

    scriptEl.addEventListener(
      'load',
      () => {
        scriptEl.dataset.loaded = 'true'
        resolve()
      },
      { once: true }
    )
    scriptEl.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), {
      once: true
    })
  })
}

function waitForCssLoad(linkEl: HTMLLinkElement, href: string) {
  return new Promise<void>((resolve, reject) => {
    if (linkEl.dataset.loaded === 'true') {
      resolve()
      return
    }

    linkEl.addEventListener(
      'load',
      () => {
        linkEl.dataset.loaded = 'true'
        resolve()
      },
      { once: true }
    )
    linkEl.addEventListener('error', () => reject(new Error(`Failed to load css: ${href}`)), {
      once: true
    })
  })
}

function loadScriptOnce(src: string) {
  const existed = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
  if (existed) {
    return waitForScriptLoad(existed, src)
  }

  const script = document.createElement('script')
  script.src = src
  document.head.appendChild(script)
  return waitForScriptLoad(script, src)
}

function loadCssOnce(href: string) {
  const existed = document.querySelector(`link[href="${href}"]`) as HTMLLinkElement | null
  if (existed) {
    return waitForCssLoad(existed, href)
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.appendChild(link)
  return waitForCssLoad(link, href)
}

async function bootstrap() {
  if (!isMobile()) {
    await loadScriptOnce('https://a.ibe.app:8000/mtn-virtual-lib/js/fileDbHelper.js')
    await loadScriptOnce('https://a.ibe.app:8000/mtn-virtual-lib/js/exe_controller.js')
    await loadScriptOnce('https://a.ibe.app:8000/mtn-virtual-lib/js/storage_controller.js')
    await loadScriptOnce('https://a.ibe.app:8000/mtn-virtual-lib/js/file_controller.js')
    await loadScriptOnce('https://a.ibe.app:8000/mtn-virtual-lib/js/finsdk.js')
    await loadCssOnce('https://a.ibe.app:8000/mtn-virtual-lib/css/index.css')
  }

  await import('./main.tsx')
}

void bootstrap()
