# Server

## CLI Options
- `--docker-driver [driver]`
  - `aws` or `local`. (`google` is a future plan)
  - Choose which docker driver to use. The docker driver determines how docker instances will be created. The local driver

## Config File

Most of the above arguments can be supplied with a config.json file. Ex:
```json
{
  "docker" : {
    "driver" : "aws",
  },
  "database" : {
    "driver" : "local"
  }
}
```

## Troubleshooting

Learn from my mistakes.
Submit a PR to fix the issues if you can.

### Container Fails To Start Locally

Close everything and try running `docker container ls` and seeing if there is a homeless container 
running around that might be using up your good ports.