# react-native-vdebug


[![NPM Version](http://img.shields.io/npm/v/react-native-vdebug.svg?style=flat)](https://www.npmjs.org/package/react-native-vdebug)
[![NPM Downloads](https://img.shields.io/npm/dm/react-native-vdebug.svg?style=flat)](https://npmcharts.com/compare/react-native-vdebug?minimal=true)
[![install size](https://packagephobia.now.sh/badge?p=react-native-vdebug)](https://packagephobia.now.sh/result?p=react-native-vdebug)


`React-Native 调试工具`

### 支持情况
- [x] Command 自定义上下文
- [x] 复制 cURL 至粘贴板
- [x] 重新请求 URL
- [x] 可视化 Response
- [x] Log 等级分类
- [x] 关键字过滤 Log / Network
- [ ] Command 历史记录 (ing...)
- [ ] 导出所有 Log / Network (ing...)

## Install

[Install NodeJS and suggest >= 8.11.0](https://nodejs.org/zh-cn/)

## Usage

```JavaScript
npm install 'react-native-vdebug'

import VDebug, { setExternalContext } from 'react-native-vdebug';

setExternalContext('your context')

return <VDebug info={{ obj: 'your object' }} />

```

## Snapshot

<img src="./snapshot/79tx5-qew2r.gif" />
<br />
<img src="./snapshot/abovz-11w3r.jpg" />
<br />
<img src="./snapshot/aka6s-nqpkq.jpg" />
<br />
<img src="./snapshot/a2wmv-9wikh.jpg" />
<br />

-------------------

`禁止商业用途 ❤ 研究学习范畴 ❤ 作者保留解释权`
Commercial use is forbidden and The author reserves the right of interpretion

[✶ MIT ✶](./LICENSE)