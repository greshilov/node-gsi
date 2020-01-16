import { TeamType } from './interface';

export function checkKey(rawObject: any, key: string) {
  return key in rawObject && Object.keys(rawObject[key]).length !== 0;
}

export function getTeam(teamName: string) {
  switch (teamName) {
    case TeamType.Dire:
      return TeamType.Dire;
    case TeamType.Radiant:
      return TeamType.Radiant;
    default:
      return undefined;
  }
}
