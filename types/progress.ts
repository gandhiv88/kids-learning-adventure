import type { CharacterId } from "./learning";

export type SavedProgress = {
  version: 2;
  selectedCharacter: CharacterId;
  totalAdventureStars: number;
  lessonBestScores: Record<string, number>;
  committedSessionIds: readonly string[];
};
