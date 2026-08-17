import {
  Character,
  GameSessionState,
  MetaElements,
  WorldInfo,
  GMResponseMetadata,
} from '../types/trpg';
import { rollCryptoDie } from './dice';

export const STORAGE_KEY_V1 = 'TRPG_ENGINE_SESSION_V1';

export function createEmptyMetaElements(): MetaElements {
  return {
    background: {
      type: 'tabula_rasa',
      title: '미지의 요람 (Tabula Rasa)',
      description: '과거의 기억이 지워진 채 낯선 땅에서 눈을 뜸 (백지 상태/정체성 미스터리)',
    },
    flaw: {
      type: 'tabula_rasa',
      title: '지워진 편린 (Tabula Rasa)',
      description: '자신의 과거와 본질을 알지 못하는 근원적 결핍',
    },
    oath: {
      type: 'tabula_rasa',
      title: '진실의 갈망 (Tabula Rasa)',
      description: '내가 누구이며 세상이 어디로 향하는지 밝혀내겠다는 맹세',
    },
    anchor: {
      type: 'tabula_rasa',
      title: '첫 조우의 기억 (Tabula Rasa)',
      description: '눈을 뜬 직후 감각한 첫 소리와 공기',
    },
    faction: {
      type: 'tabula_rasa',
      title: '무소속 방랑자 (Tabula Rasa)',
      description: '어느 문파나 세력에도 소속되지 않은 자유인',
    },
  };
}

export function createEmptyCharacter(genre: string = 'wuxia'): Character {
  // Pure factory: Dynamic default stats according to genre/dice
  const baseStats: Record<string, number> =
    genre === 'wuxia'
      ? {
          근골: 10 + rollCryptoDie(6),
          신법: 10 + rollCryptoDie(6),
          내력: 10 + rollCryptoDie(6),
          혜안: 10 + rollCryptoDie(6),
          심계: 10 + rollCryptoDie(6),
          풍모: 10 + rollCryptoDie(6),
        }
      : {
          완력: 10 + rollCryptoDie(6),
          민첩: 10 + rollCryptoDie(6),
          체력: 10 + rollCryptoDie(6),
          지능: 10 + rollCryptoDie(6),
          통찰: 10 + rollCryptoDie(6),
          매력: 10 + rollCryptoDie(6),
        };

  return {
    name: '',
    title: '',
    age: 20,
    gender: '남',
    appearance: '',
    stats: baseStats,
    inventory: [],
    metaElements: createEmptyMetaElements(),
    location: '',
    statusNotes: '양호 (특이 상태이상 없음)',
    chronology: [],
  };
}

export function createEmptyWorldInfo(): WorldInfo {
  return {
    worldName: '',
    mode: 'popular_genre',
    genre: '정통 무협 (Wuxia)',
    loreOverview: '',
    timeline: '천하가 요동치는 격동의 난세',
    currentLocation: '',
    npcs: [],
    factions: [],
    seeds: [],
    secrets: [],
    offCameraEvents: [],
    chapters: {
      currentChapter: '제1장: 낯선 강호의 바람',
      summary: '새로운 발걸음을 내딛는 서사의 서막',
      plannedChapters: [
        '제2장: 얽히는 은원과 칼날',
        '제3장: 비사에 감춰진 진실',
        '제4장: 결단의 갈림길',
      ],
    },
  };
}

export function createEmptyGMMetadata(): GMResponseMetadata {
  return {
    searchAndUiReport: '',
    activeSeeds: [],
    offCameraEvents: [],
    chapterStatus: {
      current: '',
      planned: [],
    },
    statAndInventoryUpdates: '',
    dcDistributionReport: '',
    contextDeclaration: '',
  };
}

export function createEmptyGameState(): GameSessionState {
  const now = Date.now();
  return {
    version: STORAGE_KEY_V1,
    sessionId: `session_${now}_${Math.random().toString(36).substring(2, 9)}`,
    gameState: 'creation',
    worldInfo: createEmptyWorldInfo(),
    character: createEmptyCharacter(),
    messages: [],
    dcRecords: [],
    currentTurn: 0,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Hydrates state from localStorage with strict version isolation.
 * If data is missing or corrupted, immediately returns clean 'creation' state.
 */
export function loadSessionFromStorage(): GameSessionState {
  if (typeof window === 'undefined') {
    return createEmptyGameState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) {
      return createEmptyGameState();
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_KEY_V1 || !parsed.gameState || !parsed.worldInfo || !parsed.character) {
      localStorage.removeItem(STORAGE_KEY_V1);
      return createEmptyGameState();
    }
    return parsed as GameSessionState;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY_V1);
    } catch {
      // ignore
    }
    return createEmptyGameState();
  }
}

export function saveSessionToStorage(state: GameSessionState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = {
      ...state,
      version: STORAGE_KEY_V1,
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save session to localStorage:', err);
  }
}

export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_V1);
  } catch {
    // ignore
  }
}

export const loadSessionState = loadSessionFromStorage;
export const saveSessionState = saveSessionToStorage;

