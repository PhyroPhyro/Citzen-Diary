import { Character, CrossCharacterEvent } from '../../models';
import { DBAdapter } from '../../db';
export declare function findNearbyCharacters(characterId: string, locationId: string, db: DBAdapter): Promise<Character[]>;
export declare function createInteractionEvent(character: Character, nearby: Character[], db: DBAdapter): Promise<CrossCharacterEvent | null>;
//# sourceMappingURL=cross-character.d.ts.map