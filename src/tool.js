function throttle(delay, noTrailing, callback, debounceMode) {
  let timeoutID;
  let lastExec = 0;
  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = undefined;
  }

  function wrapper(...args) {
    const self = this;
    const elapsed = Number(new Date()) - lastExec;

    function exec() {
      lastExec = Number(new Date());
      callback.apply(self, args);
    }

    function clear() {
      timeoutID = undefined;
    }

    if (debounceMode && !timeoutID) {
      exec();
    }

    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    if (!debounceMode && elapsed > delay) {
      exec();
    } else if (noTrailing !== true) {
      timeoutID = setTimeout(debounceMode ? clear : exec, !debounceMode ? delay - elapsed : delay);
    }
  }

  return wrapper;
}

function debounce(delay, atBegin, callback) {
  return callback === undefined ? throttle(delay, atBegin, false) : throttle(delay, callback, atBegin !== false);
}

function replaceReg(str) {
  const regStr = /\\|\$|\(|\)|\*|\+|\.|\[|\]|\?|\^|\{|\}|\|/gi;
  return str.replace(regStr, function (input) {
    return `\\${input}`;
  });
}

const EnvType = {
  WINDOWS: 'win',
  MACINTOSH: 'mac',
  LINUX: 'linux',
  IOS: 'iOS',
  ANDROID: 'Android',
  BLACKBERRY: 'bb',
  WINDOWS_PHONE: 'winphone',
  REACTNATIVE: 'react-native'
};

function getJSEnvironment() {
  if (navigator.userAgent) {
    var userAgent = navigator.userAgent;
    var platform, result;
    function getDesktopOS() {
      var pf = navigator.platform;
      if (pf.indexOf('Win') != -1) {
        var rVersion = /Windows NT (\d+).(\d)/i;
        var uaResult = userAgent.match(rVersion);
        var sVersionStr = '';
        if (uaResult[1] == '6') {
          if (uaResult[2] == 1) {
            sVersionStr = '7';
          } else if (uaResult[2] > 1) {
            sVersionStr = '8';
          }
        } else {
          sVersionStr = uaResult[1];
        }
        return { name: EnvType.WINDOWS, versionStr: sVersionStr };
      } else if (pf.indexOf('Mac') != -1) {
        return { name: EnvType.MACINTOSH, versionStr: '' };
      } else if (pf.indexOf('Linux') != -1) {
        return { name: EnvType.LINUX, versionStr: '' };
      }
      return null;
    }
    platform = /Windows Phone (?:OS )?([\d.]*)/;
    result = userAgent.match(platform);
    if (result) {
      return { name: EnvType.WINDOWS_PHONE, versionStr: result[1] };
    }
    if (userAgent.indexOf('(BB10;') > 0) {
      platform = /\sVersion\/([\d.]+)\s/;
      result = userAgent.match(platform);
      if (result) {
        return { name: EnvType.BLACKBERRY, versionStr: result[1] };
      } else {
        return { name: EnvType.BLACKBERRY, versionStr: '10' };
      }
    }
    platform = /\(([a-zA-Z ]+);\s(?:[U]?[;]?)([\D]+)((?:[\d._]*))(?:.*[\)][^\d]*)([\d.]*)\s/;
    result = userAgent.match(platform);
    if (result) {
      var appleDevices = /iPhone|iPad|iPod/;
      var bbDevices = /PlayBook|BlackBerry/;
      if (result[0].match(appleDevices)) {
        result[3] = result[3].replace(/_/g, '.');
        return { name: EnvType.IOS, versionStr: result[3] };
      } else if (result[2].match(/Android/)) {
        result[2] = result[2].replace(/\s/g, '');
        return { name: EnvType.ANDROID, versionStr: result[3] };
      } else if (result[0].match(bbDevices)) {
        return { name: EnvType.BLACKBERRY, versionStr: result[4] };
      }
    }
    platform = /\((Android)[\s]?([\d][.\d]*)?;.*Firefox\/[\d][.\d]*/;
    result = userAgent.match(platform);
    if (result) {
      return { name: EnvType.ANDROID, versionStr: result.length == 3 ? result[2] : '' };
    }
    // Desktop
    return getDesktopOS();
  } else {
    return { name: EnvType.REACTNATIVE, versionStr: '' };
  }
}

module.exports = {
  throttle,
  debounce,
  replaceReg,
  getJSEnvironment,
  EnvType
};
