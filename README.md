# Hashion

Browser file hashing SDK with MD5, SHA, progress reporting, cancellation, and Web Worker support.

English | [简体中文](./README.zh-CN.md)

## Packages

| Package | Description |
| --- | --- |
| [`packages/sdk`](./packages/sdk/) | The `hashion` npm package — browser file hashing library |
| [`docs`](./docs/) | VitePress documentation site, deployed to [GitHub Pages](https://moyuderen.github.io/hashion) |

→ For API usage and installation, see [packages/sdk/README.md](./packages/sdk/README.md).

## Development

```bash
pnpm install
```

Start SDK dev server:

```bash
pnpm dev:sdk
```

Start docs dev server:

```bash
pnpm dev:docs
```

Build everything:

```bash
pnpm build:all
```

## Publishing

This project uses [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
# Create a changeset
pnpm change

# Bump versions
pnpm change-version

# Dry-run publish
pnpm publish:dry

# Publish to npm
pnpm publish:npm
```

## License

MIT
