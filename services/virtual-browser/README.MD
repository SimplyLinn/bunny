# Virtual Browser

This is the virtual browser docker image, though technically it can also be run on any computer
that meets the right requirements.

## Options 

- `-s, --signal-server <url>`
  - The url of the signaling server to use 
- `-v, --verbosity <level>`
  - The verbosity level of the script
  - `0` (default) = error and success messages only
  - `1` = everything

## Explaining my poor decisions

### ProcessSpawner and ProcessBus
The process spawner and process bus are two hastily creating utilities that when combined manage all the CRUD of the processes that the virtual browser uses.

The most useful aspect, and the reason why I personally prefer using a scripting language like js over a couple shell scripts that would run when the container does, is being notified when any given process crashes or exits unexpectedly. Additionally I can easily separate the output or turn it off altogether.

I tried looking for a well maintained library that already did this, but came up empty. If anyone knows of any that would be useful in this case, or if anyone wants to just improve the API, send a PR my way.