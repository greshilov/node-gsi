import {
  IAbility,
  IBuilding,
  IDraft,
  IHero,
  IItem,
  IItemContainer,
  IMap,
  IMapObserver,
  IPickBan,
  IPlayer,
  IPlayerKill,
  IPlayerObserver,
  IWearbleItem,
} from './interface';

import { getTeam } from './utils';

function getAttr(obj: any, attr: string, def: any = null) {
  return obj[attr] === undefined ? def : obj[attr];
}

export function decodeBuildings(rawBuildings: any) {
  const building: Record<string, IBuilding> = {};
  for (const [buildingName, buildingValue] of Object.entries(rawBuildings)) {
    building[buildingName] = {
      health: (buildingValue as any).health,
      maxHealth: (buildingValue as any).max_health,
    } as IBuilding;
  }
  return building;
}

export function decodePlayer(rawPlayer: any, observerMode: boolean) {
  const player = {
    steamid: getAttr(rawPlayer, 'steamid'),
    name: getAttr(rawPlayer, 'name'),
    activity: getAttr(rawPlayer, 'activity'),
    kills: getAttr(rawPlayer, 'kills'),
    deaths: getAttr(rawPlayer, 'deaths'),
    assists: getAttr(rawPlayer, 'assists'),
    lastHits: getAttr(rawPlayer, 'last_hits'),
    denies: getAttr(rawPlayer, 'denies'),
    killStreak: getAttr(rawPlayer, 'kill_streak'),
    commandsIssues: getAttr(rawPlayer, 'commands_issued'),
    killList: Object.entries(getAttr(rawPlayer, 'kill_list', [])).map(killObj => {
      const [victimId, killCount] = killObj;
      const victimSlot = Number(victimId.split('_').slice(-1));
      return {
        killCount,
        victimSlot,
      } as IPlayerKill;
    }),
    team: getTeam(rawPlayer['team_name']),
    gold: getAttr(rawPlayer, 'gold'),
    goldReliable: getAttr(rawPlayer, 'gold_reliable'),
    goldUnreliable: getAttr(rawPlayer, 'gold_unreliable'),
    goldFromHeroKills: getAttr(rawPlayer, 'gold_from_hero_kills'),
    goldFromCreepKills: getAttr(rawPlayer, 'gold_from_creep_kills'),
    goldFromIncome: getAttr(rawPlayer, 'gold_from_income'),
    goldFromShared: getAttr(rawPlayer, 'gold_from_shared'),
    gpm: getAttr(rawPlayer, 'gpm'),
    xpm: getAttr(rawPlayer, 'xpm'),
  };
  if (observerMode) {
    return {
      ...player,
      netWorth: getAttr(rawPlayer, 'net_worth'),
      heroDmg: getAttr(rawPlayer, 'hero_damage'),
      wardsPurchased: getAttr(rawPlayer, 'wards_purchased'),
      wardsDestroyed: getAttr(rawPlayer, 'wards_destroyed'),
      runesActivated: getAttr(rawPlayer, 'runes_activated'),
      campsStacked: getAttr(rawPlayer, 'camps_stacked'),
      supportGoldSpent: getAttr(rawPlayer, 'support_gold_spent'),
      consumableGoldSpent: getAttr(rawPlayer, 'consumable_gold_spent'),
      itemGoldSpent: getAttr(rawPlayer, 'item_gold_spent'),
      goldLostToDeath: getAttr(rawPlayer, 'gold_lost_to_death'),
      goldSpentOnBuybacks: getAttr(rawPlayer, 'gold_spent_on_buybacks'),
    } as IPlayerObserver;
  } else {
    return player as IPlayer;
  }
}

export function decodeItem(rawItem: any) {
  if (rawItem['name'] === 'empty') {
    return null;
  } else {
    const item = {
      name: rawItem['name'],
      purchaser: rawItem['purchaser'],
      passive: rawItem['passive'],
    } as IItem;
    ['can_cast', 'cooldown', 'charges'].forEach(prop => {
      if (prop in rawItem) {
        (item as any)[prop] = rawItem[prop];
      }
    });
    return item;
  }
}

export function decodeHero(rawHero: any) {
  const hero = {
    xpos: getAttr(rawHero, 'xpos'),
    ypos: getAttr(rawHero, 'ypos'),
    id: getAttr(rawHero, 'id'),
    name: getAttr(rawHero, 'name'),
    level: getAttr(rawHero, 'level'),
    alive: getAttr(rawHero, 'alive'),
    respawnSeconds: getAttr(rawHero, 'respawn_seconds'),
    buybackCost: getAttr(rawHero, 'buyback_cost'),
    buybackCooldown: getAttr(rawHero, 'buyback_cooldown'),
    health: getAttr(rawHero, 'health'),
    maxHealth: getAttr(rawHero, 'max_health'),
    healthPercent: getAttr(rawHero, 'health_percent'),
    mana: getAttr(rawHero, 'mana'),
    maxMana: getAttr(rawHero, 'max_mana'),
    manaPercent: getAttr(rawHero, 'mana_percent'),
    silenced: getAttr(rawHero, 'silenced'),
    stunned: getAttr(rawHero, 'stunned'),
    disarmed: getAttr(rawHero, 'disarmed'),
    magicimmune: getAttr(rawHero, 'magicimmune'),
    hexed: getAttr(rawHero, 'hexed'),
    muted: getAttr(rawHero, 'muted'),
    break: getAttr(rawHero, 'break'),
    smoked: getAttr(rawHero, 'smoked'),
    hasDebuff: getAttr(rawHero, 'has_debuff'),
    selectedUnit: getAttr(rawHero, 'selected_unit'),
    talents: [],
  } as IHero;
  Object.keys(rawHero)
    .filter(prop => prop.startsWith('talent_'))
    .forEach(talentName => {
      const talentSlot = Number(talentName.split('_').slice(-1)) - 1;
      hero.talents[talentSlot] = rawHero[talentName];
    });
  return hero;
}

export function decodeMap(rawMap: any, observerMode: boolean) {
  const map = {
    name: getAttr(rawMap, 'name'),
    matchid: getAttr(rawMap, 'matchid'),
    gameTime: getAttr(rawMap, 'game_time'),
    clockTime: getAttr(rawMap, 'clock_time'),
    dayTime: getAttr(rawMap, 'daytime'),
    nightstalkerNight: getAttr(rawMap, 'nightstalker_night'),
    gameState: getAttr(rawMap, 'game_state'),
    paused: getAttr(rawMap, 'paused'),
    winTeam: getAttr(rawMap, 'win_team'),
    customgamename: getAttr(rawMap, 'customgamename'),
  };
  if (observerMode) {
    return {
      ...map,
      radiantWardPurchaseCooldown: getAttr(rawMap, 'radiant_ward_purchase_cooldown'),
      direWardPurchaseCooldown: getAttr(rawMap, 'dire_ward_purchase_cooldown'),
      roshanState: getAttr(rawMap, 'roshan_state'),
      roshanStateEndSeconds: getAttr(rawMap, 'roshan_state_end_seconds'),
    } as IMapObserver;
  } else {
    return map as IMap;
  }
}

export function decodeAblities(rawAbilities: any) {
  const abilities = Array<IAbility>();
  for (const [abilityCode, rawAbilityUncasted] of Object.entries(rawAbilities)) {
    const abilitySlot = Number(abilityCode.slice(-1));
    const rawAbility = rawAbilityUncasted as any;
    abilities[abilitySlot] = {
      name: getAttr(rawAbility, 'name'),
      level: getAttr(rawAbility, 'level'),
      canCast: getAttr(rawAbility, 'can_cast'),
      passive: getAttr(rawAbility, 'passive'),
      abilityActive: getAttr(rawAbility, 'ability_active'),
      cooldown: getAttr(rawAbility, 'cooldown'),
      ultimate: getAttr(rawAbility, 'ultimate'),
    } as IAbility;
  }
  return abilities;
}

export function decodeItems(rawItems: any) {
  const items = {
    slot: Array<IItem>(),
    stash: Array<IItem>(),
  } as IItemContainer;
  for (const [itemCode, rawItem] of Object.entries(rawItems)) {
    const itemSlot = Number(itemCode.split(/slot|stash/).slice(-1));
    if (itemCode.startsWith('slot')) {
      items.slot[itemSlot] = decodeItem(rawItem);
    } else if (itemCode.startsWith('stash')) {
      items.stash[itemSlot] = decodeItem(rawItem);
    }
  }
  return items;
}

export function decodeDraft(rawDraft: any) {
  const picksPre = Array<any>(10);

  ['team2', 'team3'].forEach(team => {
    if (team in rawDraft) {
      for (const [propName, propValue] of Object.entries(rawDraft[team])) {
        const propMatch = propName.match(/(pick|ban)([0-9])_(id|class)/);
        // Very bad code, actually.
        if (propMatch !== null) {
          const [orig, pickType, rawSlot, valueType] = propMatch;
          const slot = team === 'team2' ? Number(rawSlot) : Number(rawSlot) + 5;
          if (picksPre[slot] === undefined) {
            picksPre[slot] = {
              [pickType]: {},
            };
          } else if (picksPre[slot][pickType] === undefined) {
            picksPre[slot][pickType] = {};
          }
          picksPre[Number(slot)][pickType][valueType] = propValue;
        }
      }
    }
  });
  return {
    activeteam: getAttr(rawDraft, 'activeteam'),
    pick: getAttr(rawDraft, 'pick'),
    activeteamTimeRemaining: getAttr(rawDraft, 'activeteam_time_remaining'),
    radiantBonusTime: getAttr(rawDraft, 'radiant_bonus_time'),
    direBonusTime: getAttr(rawDraft, 'dire_bonus_time'),
    pickBans: picksPre as IPickBan[],
  } as IDraft;
}

export function decodeWearable(rawWearable: any) {
  const weareables = [];
  const styles: any[] = [];
  for (const [wearableName, wearableValue] of Object.entries(rawWearable)) {
    const wearableMatch = wearableName.match(/(wearable|style)([0-9]*)/);
    if (wearableMatch !== null) {
      const [orig, wearableType, wearableSlot] = wearableMatch;
      const slot = Number(wearableSlot);
      if (wearableType === 'wearable') {
        weareables[slot] = wearableValue;
      } else {
        styles[slot] = wearableValue;
      }
    }
  }
  const iWearableList = Array<IWearbleItem>();
  weareables.forEach((wearable, index) => {
    const item = {
      wearable,
    } as IWearbleItem;
    if (styles[index] !== undefined) {
      item.style = styles[index];
    }
    iWearableList.push(item);
  });
  return iWearableList as IWearbleItem[];
}
