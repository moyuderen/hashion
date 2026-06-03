# Hashion

浏览器端文件 Hash 计算 SDK，支持 MD5、SHA、进度回调、取消计算和 Web Worker。

[English](./README.md) | 简体中文

## 包结构

| 包 | 说明 |
| --- | --- |
| [`packages/sdk`](./packages/sdk/) | `hashion` npm 包 — 浏览器端文件 Hash 计算库 |
| [`docs`](./docs/) | VitePress 文档站点，部署在 [GitHub Pages](https://moyuderen.github.io/hashion) |

→ API 用法和安装说明请查看 [packages/sdk/README.zh-CN.md](./packages/sdk/README.zh-CN.md)。

## 开发

```bash
pnpm install
```

启动 SDK 开发服务器：

```bash
pnpm dev:sdk
```

启动文档开发服务器：

```bash
pnpm dev:docs
```

构建全部：

```bash
pnpm build:all
```

## 发布

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本。

```bash
# 创建变更集
pnpm change

# 更新版本号
pnpm change-version

# 预览发布内容
pnpm publish:dry

# 发布到 npm
pnpm publish:npm
```

## 许可证

MIT
