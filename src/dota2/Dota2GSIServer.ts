import { GSIServer } from '../GSIServer';
import {
  Dota2Event,
  IBuildings,
  IDota2ObserverStateEvent,
  IDota2StateEvent,
  IHero,
  IItemContainer,
  IPlayer,
  IProvider,
  IWearbleItem,
  TeamType,
  IEvent,
} from './interface';

import {
  decodeAblities,
  decodeBuildings,
  decodeDraft,
  decodeHero,
  decodeItems,
  decodeMap,
  decodePlayer,
  decodeWearable,
  decodeEvents,
} from './decoders';
import { checkKey } from './utils';

function* observerStateGenerator(teamPlayerObj: any) {
  for (const [teamName, rawPlayers] of Object.entries(teamPlayerObj)) {
    for (const [playerCode, rawObj] of Object.entries(rawPlayers as object)) {
      const slot = Number(playerCode.split('player').slice(-1));
      // Check slot before yield
      yield [slot, rawObj];
    }
  }
}

export class Dota2GSIServer extends GSIServer {
  public isObserverMode(rawState: any): boolean {
    return rawState['player'] !== undefined && rawState['player']['team2'] !== undefined;
  }

  public feedState(rawState: any): void {
    const observerMode = this.isObserverMode(rawState);
    const state = this.parseState(rawState, observerMode);
    const changes = this.parseState(rawState.previously, observerMode);

    if (observerMode) {
      this.events.emit(Dota2Event.Dota2ObserverState, {
        state,
        changes,
      } as IDota2ObserverStateEvent);
    } else {
      this.events.emit(Dota2Event.Dota2State, {
        state,
        changes,
      } as IDota2StateEvent);
    }
  }

  private parseState(rawState: any, observerMode: boolean): any {
    let buildings = null;
    if (checkKey(rawState, 'buildings')) {
      const direBuildings = rawState['buildings'][TeamType.Dire];
      const radiantBuildings = rawState['buildings'][TeamType.Radiant];
      buildings = {
        [TeamType.Dire]: direBuildings !== undefined ? decodeBuildings(direBuildings) : null,
        [TeamType.Radiant]: radiantBuildings !== undefined ? decodeBuildings(radiantBuildings) : null,
      } as IBuildings;
    }

    let provider = null;
    if (checkKey(rawState, 'provider')) {
      provider = rawState['provider'] as IProvider;
    }

    let map = null;
    if (checkKey(rawState, 'map')) {
      map = decodeMap(rawState['map'], observerMode);
    }

    let player = null;
    if (checkKey(rawState, 'player')) {
      const rawPlayerSection = rawState['player'];

      if (observerMode) {
        player = Array<IPlayer>(10);
        for (const [slot, rawPlayer] of observerStateGenerator(rawPlayerSection)) {
          player[slot] = decodePlayer(rawPlayer, observerMode);
        }
      } else {
        player = decodePlayer(rawPlayerSection, observerMode);
      }
    }

    let hero = null;
    if (checkKey(rawState, 'hero')) {
      const rawHeroSection = rawState['hero'];
      if (observerMode) {
        hero = Array<IHero>(10);
        for (const [slot, rawHero] of observerStateGenerator(rawHeroSection)) {
          hero[slot] = decodeHero(rawHero);
        }
      } else {
        hero = decodeHero(rawHeroSection);
      }
    }

    let abilities = null;
    if (checkKey(rawState, 'abilities')) {
      const rawAbilitiesSection = rawState['abilities'];
      if (observerMode) {
        abilities = Array<any>(10);
        for (const [slot, rawAbilities] of observerStateGenerator(rawAbilitiesSection)) {
          abilities[slot] = decodeAblities(rawAbilities);
        }
      } else {
        abilities = decodeAblities(rawAbilitiesSection);
      }
    }

    let items = null;
    if (checkKey(rawState, 'items')) {
      const rawItemsSection = rawState['items'];
      if (observerMode) {
        items = Array<IItemContainer>(10);
        for (const [slot, rawItems] of observerStateGenerator(rawItemsSection)) {
          items[slot] = decodeItems(rawItems);
        }
      } else {
        items = decodeItems(rawItemsSection);
      }
    }

    let draft = null;
    if (checkKey(rawState, 'draft')) {
      draft = decodeDraft(rawState['draft']);
    }

    let wearables = null;
    if (checkKey(rawState, 'wearables')) {
      const rawWearableSection = rawState['wearables'];
      if (observerMode) {
        wearables = Array<IWearbleItem[]>(10);
        for (const [slot, rawWearable] of observerStateGenerator(rawWearableSection)) {
          wearables[slot] = decodeWearable(rawWearable);
        }
      } else {
        wearables = decodeWearable(rawWearableSection);
      }
    }

    let events = null;
    if (checkKey(rawState, 'events')) {
      events = decodeEvents(rawState['events']);
    }

    return {
      buildings,
      provider,
      map,
      player,
      hero,
      abilities,
      items,
      draft,
      wearables,
      events,
    };
  }
}
