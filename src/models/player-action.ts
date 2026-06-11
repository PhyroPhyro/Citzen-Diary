export interface PlayerSuggestion {
  type: 'task' | 'destination' | 'vision';
  taskId?: string;
  locationId?: string;
  text?: string;
  message: string | null;
}

export interface PendingPlayerAction {
  id: string;
  characterId: string;
  playerId: string;
  action: PlayerSuggestion;
  createdAt: Date;
  processedAt: Date | null;
  wasFollowed: boolean | null;
}
