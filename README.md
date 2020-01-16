
# Usage example
```
import { Dota2GSIServer } from 'node-gsi/dota2/Dota2GSIServer';
import { IDota2ObserverState, IDota2State } from 'node-gsi/dota2/interface';

const server = new Dota2GSIServer('/gsi', 9001);

server.events.on('state', (state: IDota2State) => {
  if (state.player) {
    console.log(state.player.gold);
  }
});

server.run();
```
# Configuration file example
Place this content in file `steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/gamestate_integration_*.cfg`. 
Don't forget to replace asterisk `*` with your name.

```
"dota2-gsi Configuration"
{
    "uri"               "http://localhost:9001/"
    "timeout"           "5.0"
    "buffer"            "0.1"
    "throttle"          "0.1"
    "heartbeat"         "30.0"
    "data"
    {
        "buildings"     "1"
        "provider"      "1"
        "map"           "1"
        "player"        "1"
        "hero"          "1"
        "abilities"     "1"
        "items"         "1"
        "draft"         "1"
        "wearables"     "1"
    }
    "auth"
    {
        "token"         "hello1234"
    }
}
```
