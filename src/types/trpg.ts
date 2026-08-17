export type WorldMode = 'original_ip' | 'popular_genre' | 'custom_world';

export type MetaInputType = 'preset' | 'custom' | 'tabula_rasa';

export type CharacterClassRating = 'Class A' | 'Class B' | 'Class C';

export interface MetaElementValue {
  type: MetaInputType;
  title: string;
  description: string;
  isGoldenData?: boolean;
}

export interface MetaElements {
  background: MetaElementValue; // 출신 / 배경
  flaw: MetaElementValue;       // 결핍 / 약점
  oath: MetaElementValue;       // 맹세 / 신념
  anchor: MetaElementValue;     // 심리적 닻 / 소중한 것
  faction: MetaElementValue;    // 소속 세력
}

export interface CharacterStats {
  [key: string]: number;
}

export interface CharacterItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  tags?: string[];
}

export interface Character {
  name: string;
  title: string; // 별호
  age: number;
  gender: string;
  appearance: string;
  stats: CharacterStats;
  inventory: CharacterItem[];
  metaElements: MetaElements;
  location: string;
  statusNotes: string;
  chronology: string[]; // 지금까지 겪은 일대기
}

export interface NPC {
  id: string;
  name: string;
  title?: string; // 별호
  age?: number | string;
  isCanon: boolean; // 원작 인물 vs 조연급 오리지널 인물(OC)
  classRating: CharacterClassRating; // Class A, Class B, Class C
  faction?: string;
  origin?: string; // 출신 및 집안
  background?: string; // 배경 및 내력
  martialArt?: string; // 무학 능력
  mindset?: string; // 가치관 및 성격
  relationship: string; // 주인공과의 관계 (미조우 시 [미인지 상태])
  thought?: string; // 주인공에 대한 주관적 생각 (💭)
  status: 'active' | 'deceased' | 'missing' | 'unmet';
  lastEncounterTurn?: number;
}

export interface Faction {
  id: string;
  name: string;
  leader?: string;
  alignment?: string;
  influence: string;
  stanceToPlayer: 'hostile' | 'neutral' | 'friendly' | 'unknown';
  description: string;
}

export interface NarrativeSeed {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'resolved' | 'dormant';
  turnPlanted: number;
}

export interface WorldSecret {
  id: string;
  title: string;
  content: string;
  category: 'public' | 'confidential'; // 세간 공표 정보 vs 미공개 기밀
}

export interface DCRecord {
  turn: number;
  action: string;
  targetDC: number;
  rawRoll: number;
  modifier: number;
  finalTotal: number;
  outcome: 'miraculous_success' | 'great_success' | 'success' | 'narrow_success' | 'narrow_failure' | 'failure' | 'great_failure' | 'fatal_failure';
  reason?: string;
  timestamp: number;
}

export interface ChapterInfo {
  currentChapter: string;
  summary: string;
  plannedChapters: string[];
}

export interface WorldInfo {
  worldName: string;
  mode: WorldMode;
  genre: string;
  loreOverview: string;
  timeline: string;
  currentLocation: string;
  npcs: NPC[];
  factions: Faction[];
  seeds: NarrativeSeed[];
  secrets: WorldSecret[];
  offCameraEvents: string[];
  chapters: ChapterInfo;
}

export interface GMResponseMetadata {
  searchAndUiReport?: string;
  activeSeeds?: string[];
  offCameraEvents?: string[];
  chapterStatus?: {
    current?: string;
    planned?: string[];
  };
  statAndInventoryUpdates?: string;
  dcDistributionReport?: string;
  contextDeclaration?: string;
  verified?: boolean;
  rawBlock?: string;
}

export interface ChatMessage {
  id: string;
  role?: 'user' | 'assistant' | 'system';
  sender?: 'player' | 'gm' | 'system';
  content: string; // Clean literary prose for UI
  rawContent?: string; // Contains 14th block if GM
  metadata?: GMResponseMetadata;
  timestamp: number;
  turn?: number;
  turnNumber?: number;
  promptType?: 'action' | 'free_prompt' | 'dice_check' | 'system_query';
  diceRoll?: {
    sides: number;
    roll: number;
    modifier: number;
    targetDC?: number;
    outcome?: string;
  };
}

export type GameStateMode = 'creation' | 'playing';

export interface GameSessionState {
  version: string; // "TRPG_ENGINE_SESSION_V1"
  sessionId: string;
  gameState: GameStateMode;
  worldInfo: WorldInfo;
  character: Character;
  messages: ChatMessage[];
  dcRecords: DCRecord[];
  currentTurn: number;
  lastSyncCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CloudSavePayload {
  syncCode: string;
  data: GameSessionState;
  createdAt: number;
}

export interface SavePackageData {
  version: string;
  timestamp: number;
  characterState: {
    name: string;
    age: number;
    stats: CharacterStats;
    inventory: CharacterItem[];
    location: string;
    background: string;
    chronology: string[];
  };
  npcNetwork: NPC[];
  knowledgeBoundaries: {
    publicNews: string[];
    confidentialSecrets: string[];
  };
  narrativeSeeds: NarrativeSeed[];
  offCameraStatus: string[];
  dcStatistics: {
    history: DCRecord[];
    distribution: Record<number, number>;
  };
  chapterRoadmap: ChapterInfo;
  recentMessagesSummary: string;
}
