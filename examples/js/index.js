const gsi = require('node-gsi');

const debug = true;
const server = new gsi.Dota2GSIServer('/gsi', debug);

server.events.on(gsi.Dota2Event.Dota2State, event => {
  console.log('Dota2 event!');
  if (event.state.player) {
      console.log(event.state.player.gold);
  }
});
  
server.events.on(gsi.Dota2Event.Dota2ObserverState, event => {
  console.log('Dota2 observer event!');
  if (event.state.player) {
    console.log(event.state.player[0].gold);
  }
});

server.listen(9001);