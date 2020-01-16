import { GSIServer } from '../GSIServer';
import {
  IAbility,
  IBuildings,
  IDota2ObserverState,
  IHero,
  IItemContainer,
  IPlayer,
  IPreviousObserver,
  IProvider,
  IWearable,
  TeamType,
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
  public parseState(rawState: any) {
    const observerMode = rawState['player'] !== undefined && rawState['player']['team2'] !== undefined;

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

    let heroes = null;
    if (checkKey(rawState, 'hero')) {
      const rawHeroSection = rawState['hero'];
      if (observerMode) {
        heroes = Array<IHero>(10);
        for (const [slot, rawHero] of observerStateGenerator(rawHeroSection)) {
          heroes[slot] = decodeHero(rawHero);
        }
      } else {
        heroes = decodeHero(rawHeroSection);
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
        wearables = Array<IWearable>(10);
        for (const [slot, rawWearable] of observerStateGenerator(rawWearableSection)) {
          wearables[slot] = decodeWearable(rawWearable);
        }
      } else {
        wearables = decodeWearable(rawWearableSection);
      }
    }

    return {
      buildings,
      provider,
      map,
      player,
      abilities,
      items,
      wearables,
      draft,
      previous: {} as IPreviousObserver,
    } as IDota2ObserverState;
  }
}
