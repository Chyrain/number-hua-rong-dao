# 数字华容道

数字华容道游戏H5版

## 玩法

移动滑块，直到数字按顺序1-15排列

[Demo](http://chyrain.github.io/games/huarongdao/) （仅支持手机）
![二维码](./qrcode)

## init

Run this to init project.

```sh
npm run init
```

init includes iconfont build and dll build.

- build iconfont

Run this after you run `npm install`, and when you change fonts icon(svg) in `src/assets/fonts/`.

```sh
gulp font:icon
```

- build dll

Run this after you run `npm install`, and when you change lib.

```sh
npm run build:dll
```

- build dist

Run this when you finish development and need generate to a distribution directory.

```sh
npm run build:dist
```

## develop with hot loader

```sh
npm start # npm run start
```

## release production

```sh
npm run release # equals `npm run build:dll && npm run build:dist`
```


## Others

```sh
npm run server	# A server to test distribution
npm run clean 	# Clear dist/ directory
```