import type { CharacterId } from "./learning";

export type SavedProgress = {
  version: 1;
  selectedCharacter: CharacterId;
  totalStars: number;
};
