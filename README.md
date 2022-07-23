# cosmos-voters

## How to use

```bash
$ yarn install
$ yarn start --help
index.ts [command]

Commands:
  index.ts get-voters  get voters from proposals

Options:
      --version  Show version number                            [boolean]
  -h, --help     Show help                                      [boolean]
Done in 2.59s.
```

## How to get chain voters

### JUNO

Juno voters must be done in 2 steps

- Pre juno-phoenix

```bash
$ yarn start get-voters --rpc_endpoint "https://junoclassic.blockpane.com" --max_height 2578098
# this could take a while...
```

- Post juno phoenix

```bash
$ yarn start get-voters --rpc_endpoint "https://juno-rpc.polkachu.com" --min_height 2578098
# this could take a while
```