import { 
  Dota2GSIServer,
  Dota2Event,
  IDota2ObserverStateEvent,
  IDota2StateEvent,
} from 'node-gsi';

const debug = true;
const server = new Dota2GSIServer('/gsi', debug);

server.events.on(Dota2Event.Dota2State, (event: IDota2StateEvent) => {
  console.log('Dota2 event!');
  if (event.state.player) {
    console.log(event.state.player.gold);
  }
});

server.events.on(Dota2Event.Dota2ObserverState, (event: IDota2ObserverStateEvent) => {
  console.log('Dota2 observer event!');
  if (event.state.player) {
    console.log(event.state.player[0].gold);
  }
});

server.listen(9001);
