export function getOS() {
  const userAgent = navigator.userAgent
  let os = 'Unknown'
  let osVersion = 'Unknown'

  if (/Windows/.test(userAgent)) {
    os = 'Windows'
    if (/Windows NT 10/.test(userAgent)) osVersion = '10'
    else if (/Windows NT 6.3/.test(userAgent)) osVersion = '8.1'
    else if (/Windows NT 6.2/.test(userAgent)) osVersion = '8'
    else if (/Windows NT 6.1/.test(userAgent)) osVersion = '7'
    else if (/Windows NT 6.0/.test(userAgent)) osVersion = 'Vista'
    else if (/Windows NT 5.1/.test(userAgent)) osVersion = 'XP'
  } else if (/Mac/.test(userAgent)) {
    os = 'Mac OS X'
    var match = /Mac OS X (\d+[._]\d+[._]\d+)/.exec(userAgent)
    if (match) osVersion = match[1].replace(/_/g, '.')
  } else if (/Linux/.test(userAgent)) {
    os = 'Linux'
  } else if (/Android/.test(userAgent)) {
    os = 'Android'
    var match = /Android (\d+[._]\d+[._]\d+)/.exec(userAgent)
    if (match) osVersion = match[1].replace(/_/g, '.')
  } else if (/iOS|iPhone|iPad|iPod/.test(userAgent)) {
    os = 'iOS'
    var match = /OS (\d+[._]\d+[._]\d+)/.exec(userAgent)
    if (match) osVersion = match[1].replace(/_/g, '.')
  }

  return {
    os: os,
    versionOs: osVersion
  }
}
