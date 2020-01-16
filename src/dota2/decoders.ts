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
  IWearable,
  IWearbleItem,
} from './interface';

import { getTeam } from './utils';

export function decodeBuildings(rawBuildings: any) {
  const building = new Map<string, IBuilding>();
  for (const [buildingName, buildingValue] of Object.entries(rawBuildings)) {
    building.set(buildingName, {
      health: (buildingValue as any).health,
      maxHealth: (buildingValue as any).max_health,
    } as IBuilding);
  }
  return building;
}

export function decodePlayer(rawPlayer: any, observerMode: boolean) {
  const player = {
    steamid: rawPlayer['steamid'],
    name: rawPlayer['name'],
    activity: rawPlayer['activity'],
    kills: rawPlayer['kills'],
    deaths: rawPlayer['deaths'],
    assists: rawPlayer['assists'],
    lastHits: rawPlayer['last_hits'],
    denies: rawPlayer['denies'],
    killStreak: rawPlayer['kill_streak'],
    commandsIssues: rawPlayer['commands_issued'],
    killList: Object.entries(rawPlayer['kill_list']).map(killObj => {
      const [victimId, killCount] = killObj;
      const victimSlot = Number(victimId.split('_').slice(-1));
      return {
        killCount,
        victimSlot,
      } as IPlayerKill;
    }),
    team: getTeam(rawPlayer['team_name']),
    gold: rawPlayer['gold'],
    goldReliable: rawPlayer['gold_reliable'],
    goldUnreliable: rawPlayer['gold_unreliable'],
    goldFromHeroKills: rawPlayer['gold_from_hero_kills'],
    goldFromCreepKills: rawPlayer['gold_from_creep_kills'],
    goldFromIncome: rawPlayer['gold_from_income'],
    goldFromShared: rawPlayer['gold_from_shared'],
    gpm: rawPlayer['gpm'],
    xpm: rawPlayer['xpm'],
  };
  if (observerMode) {
    return {
      ...player,
      netWorth: rawPlayer['net_worth'],
      heroDmg: rawPlayer['hero_damage'],
      wardsPurchased: rawPlayer['wards_purchased'],
      wardsDestroyed: rawPlayer['wards_destroyed'],
      runesActivated: rawPlayer['runes_activated'],
      campsStacked: rawPlayer['camps_stacked'],
      supportGoldSpent: rawPlayer['support_gold_spent'],
      consumableGoldSpent: rawPlayer['consumable_gold_spent'],
      itemGoldSpent: rawPlayer['item_gold_spent'],
      goldLostToDeath: rawPlayer['gold_lost_to_death'],
      goldSpentOnBuybacks: rawPlayer['gold_spent_on_buybacks'],
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
    xpos: rawHero['xpos'],
    ypos: rawHero['ypos'],
    id: rawHero['id'],
    name: rawHero['name'],
    level: rawHero['level'],
    alive: rawHero['alive'],
    respawnSeconds: rawHero['respawn_seconds'],
    buybackCost: rawHero['buyback_cost'],
    buybackCooldown: rawHero['buyback_cooldown'],
    health: rawHero['health'],
    maxHealth: rawHero['max_health'],
    healthPercent: rawHero['health_percent'],
    mana: rawHero['mana'],
    maxMana: rawHero['max_mana'],
    manaPercent: rawHero['mana_percent'],
    silenced: rawHero['silenced'],
    stunned: rawHero['stunned'],
    disarmed: rawHero['disarmed'],
    magicimmune: rawHero['magicimmune'],
    hexed: rawHero['hexed'],
    muted: rawHero['muted'],
    break: rawHero['break'],
    smoked: rawHero['smoked'],
    hasDebuff: rawHero['has_debuff'],
    selectedUnit: rawHero['selected_unit'],
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
    name: rawMap['name'],
    matchid: rawMap['matchid'],
    gameTime: rawMap['game_time'],
    clockTime: rawMap['clock_time'],
    dayTime: rawMap['daytime'],
    nightstalkerNight: rawMap['nightstalker_night'],
    gameState: rawMap['game_state'],
    paused: rawMap['paused'],
    winTeam: rawMap['win_team'],
    customgamename: rawMap['customgamename'],
  };
  if (observerMode) {
    return {
      ...map,
      radiantWardPurchaseCooldown: rawMap['radiant_ward_purchase_cooldown'],
      direWardPurchaseCooldown: rawMap['dire_ward_purchase_cooldown'],
      roshanState: rawMap['roshan_state'],
      roshanStateEndSeconds: rawMap['roshan_state_end_seconds'],
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
      name: rawAbility['name'],
      level: rawAbility['level'],
      canCast: rawAbility['can_cast'],
      passive: rawAbility['passive'],
      abilityActive: rawAbility['ability_active'],
      cooldown: rawAbility['cooldown'],
      ultimate: rawAbility['ultimate'],
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
  });
  return {
    activeteam: rawDraft['activeteam'],
    pick: rawDraft['pick'],
    activeteamTimeRemaining: rawDraft['activeteam_time_remaining'],
    radiantBonusTime: rawDraft['radiant_bonus_time'],
    direBonusTime: rawDraft['dire_bonus_time'],
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
  return iWearableList as IWearable;
}
