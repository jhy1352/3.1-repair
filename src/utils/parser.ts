import {
  GMResponseMetadata,
  NPC,
  WorldInfo,
  Character,
  NarrativeSeed,
  WorldSecret,
} from '../types/trpg';

export interface ParseResult {
  cleanProse: string;
  cleanText: string;
  metadata: GMResponseMetadata | null;
  rawBlock: string | null;
  updatedWorldInfo: WorldInfo;
  updatedCharacter: Character;
}

/**
 * Extracts and parses the mandatory 14th system markdown code block from the GM's response.
 * Strips this block from the literary prose so the reader sees pure literary storytelling.
 * Automatically synchronizes updated NPCs, narrative seeds, factions, and character stats.
 */
export function parseGMResponseMetaData(
  rawText: string,
  prevWorldInfo?: WorldInfo,
  prevCharacter?: Character
): ParseResult {
  const fallbackWorldInfo: WorldInfo = prevWorldInfo || {
    worldName: '강호',
    mode: 'popular_genre',
    genre: '정통 무협',
    loreOverview: '',
    timeline: '',
    currentLocation: '',
    npcs: [],
    factions: [],
    seeds: [],
    secrets: [],
    offCameraEvents: [],
    chapters: {
      currentChapter: '제1장: 낯선 강호의 바람',
      summary: '',
      plannedChapters: [],
    },
  };

  const fallbackCharacter: Character = prevCharacter || {
    name: '',
    title: '',
    age: 20,
    gender: '남',
    appearance: '',
    stats: {},
    inventory: [],
    metaElements: {
      background: { type: 'tabula_rasa', title: '', description: '' },
      flaw: { type: 'tabula_rasa', title: '', description: '' },
      oath: { type: 'tabula_rasa', title: '', description: '' },
      anchor: { type: 'tabula_rasa', title: '', description: '' },
      faction: { type: 'tabula_rasa', title: '', description: '' },
    },
    location: '',
    statusNotes: '양호',
    chronology: [],
  };

  if (!rawText) {
    return {
      cleanProse: '',
      cleanText: '',
      metadata: null,
      rawBlock: null,
      updatedWorldInfo: fallbackWorldInfo,
      updatedCharacter: fallbackCharacter,
    };
  }

  // Look for ``` or ```markdown blocks that contain item 1~7 or [외부 검색 / [시스템 상태
  const codeBlockRegex = /```(?:markdown|json|text)?\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let foundBlock: string | null = null;
  let cleanText = rawText;

  // Search for the 14th system code block
  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const blockContent = match[1];
    if (
      blockContent.includes('[외부 검색') ||
      blockContent.includes('[활성화된 미회수 복선') ||
      blockContent.includes('[카메라 밖') ||
      blockContent.includes('[진행 및 예정 챕터') ||
      blockContent.includes('[주인공 스탯') ||
      blockContent.includes('[DC 누적 통계') ||
      blockContent.includes('[개연성/맥락 준수 선언') ||
      blockContent.includes('1)') ||
      blockContent.includes('2)')
    ) {
      foundBlock = blockContent;
      // Strip the entire matched code block from cleanText
      cleanText = rawText.replace(match[0], '').trim();
      break;
    }
  }

  if (!foundBlock) {
    return {
      cleanProse: rawText.trim(),
      cleanText: rawText.trim(),
      metadata: null,
      rawBlock: null,
      updatedWorldInfo: fallbackWorldInfo,
      updatedCharacter: fallbackCharacter,
    };
  }

  // Parse items from the extracted block
  const metadata: GMResponseMetadata = {
    rawBlock: foundBlock.trim(),
    verified: foundBlock.includes('인터넷 검색을 통해') || foundBlock.includes('검증 완료'),
  };

  const lines = foundBlock.split('\n');
  const activeSeeds: string[] = [];
  const offCameraEvents: string[] = [];
  const plannedChapters: string[] = [];
  let currentChapter = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 1) Search & UI & NPC report
    if (line.includes('1)') || line.includes('[외부 검색')) {
      metadata.searchAndUiReport = line.replace(/^[0-9]+\)\s*/, '').trim();
    }
    // 2) Active narrative seeds
    else if (line.includes('2)') || line.includes('[활성화된 미회수 복선')) {
      const seedContent = line.replace(/^[0-9]+\)\s*/, '').replace(/\[활성화된 미회수 복선 씨앗\]:?/, '').trim();
      if (seedContent && seedContent !== '(없음)' && seedContent !== '없음') {
        const parts = seedContent.split(/;|\/|,/).map(s => s.trim()).filter(Boolean);
        if (parts.length > 0) activeSeeds.push(...parts);
        else activeSeeds.push(seedContent);
      }
    }
    // 3) Off-camera world movements
    else if (line.includes('3)') || line.includes('[카메라 밖')) {
      const offContent = line.replace(/^[0-9]+\)\s*/, '').replace(/\[카메라 밖 강호 정세 자율 변동\]:?/, '').trim();
      if (offContent) offCameraEvents.push(offContent);
    }
    // 4) Chapters
    else if (line.includes('4)') || line.includes('[진행 및 예정 챕터')) {
      const chapterContent = line.replace(/^[0-9]+\)\s*/, '').replace(/\[진행 및 예정 챕터 현황\]:?/, '').trim();
      if (chapterContent) {
        currentChapter = chapterContent.split(/->|;|향후/)[0]?.trim() || chapterContent;
        const remaining = chapterContent.substring(currentChapter.length);
        if (remaining) {
          const chList = remaining.split(/,|;|\//).map(c => c.trim()).filter(Boolean);
          plannedChapters.push(...chList);
        }
      }
    }
    // 5) Stats & Inventory updates
    else if (line.includes('5)') || line.includes('[주인공 스탯')) {
      metadata.statAndInventoryUpdates = line.replace(/^[0-9]+\)\s*/, '').replace(/\[주인공 스탯 및 소장품\]:?/, '').trim();
    }
    // 6) DC distribution stats
    else if (line.includes('6)') || line.includes('[DC 누적 통계')) {
      metadata.dcDistributionReport = line.replace(/^[0-9]+\)\s*/, '').replace(/\[DC 누적 통계 관리\]:?/, '').trim();
    }
    // 7) Plausibility & context declaration
    else if (line.includes('7)') || line.includes('[개연성/맥락 준수 선언')) {
      metadata.contextDeclaration = line.replace(/^[0-9]+\)\s*/, '').replace(/\[개연성\/맥락 준수 선언\]:?/, '').trim();
    }
  }

  metadata.activeSeeds = activeSeeds;
  metadata.offCameraEvents = offCameraEvents;
  metadata.chapterStatus = {
    current: currentChapter,
    planned: plannedChapters,
  };

  const { worldInfo: updatedWorldInfo, character: updatedCharacter } =
    synchronizeStateWithMetadata(fallbackWorldInfo, fallbackCharacter, metadata, 1);

  return {
    cleanProse: cleanText,
    cleanText,
    metadata,
    rawBlock: foundBlock.trim(),
    updatedWorldInfo,
    updatedCharacter,
  };
}

/**
 * Synchronizes GM metadata back into worldInfo and character state
 */
export function synchronizeStateWithMetadata(
  prevWorldInfo: WorldInfo,
  prevCharacter: Character,
  metadata: GMResponseMetadata | null,
  currentTurn: number
): { worldInfo: WorldInfo; character: Character } {
  if (!metadata) {
    return { worldInfo: prevWorldInfo, character: prevCharacter };
  }

  const updatedWorldInfo: WorldInfo = { ...prevWorldInfo };
  const updatedCharacter: Character = { ...prevCharacter };

  // 1. Sync Narrative Seeds
  if (metadata.activeSeeds && metadata.activeSeeds.length > 0) {
    const existingSeeds = [...(updatedWorldInfo.seeds || [])];
    metadata.activeSeeds.forEach((seedTitle) => {
      if (seedTitle && !existingSeeds.some(s => s.title.includes(seedTitle) || seedTitle.includes(s.title))) {
        existingSeeds.push({
          id: `seed_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title: seedTitle,
          description: `턴 ${currentTurn}에서 촉발된 미회수 서사 복선`,
          status: 'active',
          turnPlanted: currentTurn,
        });
      }
    });
    // Keep max 3 active seeds
    updatedWorldInfo.seeds = existingSeeds.slice(-5);
  }

  // 2. Sync Off-Camera Events
  if (metadata.offCameraEvents && metadata.offCameraEvents.length > 0) {
    const events = [...(updatedWorldInfo.offCameraEvents || [])];
    metadata.offCameraEvents.forEach((ev) => {
      if (ev && !events.includes(ev)) {
        events.push(`[턴 ${currentTurn}] ${ev}`);
      }
    });
    updatedWorldInfo.offCameraEvents = events.slice(-10);
  }

  // 3. Sync Chapter info
  if (metadata.chapterStatus?.current) {
    updatedWorldInfo.chapters = {
      currentChapter: metadata.chapterStatus.current || updatedWorldInfo.chapters.currentChapter,
      summary: updatedWorldInfo.chapters.summary,
      plannedChapters:
        metadata.chapterStatus.planned && metadata.chapterStatus.planned.length > 0
          ? metadata.chapterStatus.planned
          : updatedWorldInfo.chapters.plannedChapters,
    };
  }

  // 4. Parse NPC/Faction mentions if present in searchAndUiReport
  if (metadata.searchAndUiReport) {
    // If it mentions adding an NPC or class rating
    const report = metadata.searchAndUiReport;
    const npcs = [...updatedWorldInfo.npcs];

    // Example match: "X인물(Class B)" or "NPC: 이름"
    const npcMatch = report.match(/([가-힣\w\s]+)\((?:Class\s*([ABC]))\)/);
    if (npcMatch) {
      const npcName = npcMatch[1].trim();
      const classRating = `Class ${npcMatch[2]}` as 'Class A' | 'Class B' | 'Class C';
      const existingIdx = npcs.findIndex(n => n.name === npcName);
      if (existingIdx >= 0) {
        npcs[existingIdx] = {
          ...npcs[existingIdx],
          classRating,
          lastEncounterTurn: currentTurn,
        };
      } else {
        npcs.push({
          id: `npc_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: npcName,
          isCanon: !npcName.includes('(OC)'),
          classRating,
          relationship: '미인지 상태 (서사 내 직접 조우 전)',
          thought: '💭 아직 직접 대면하지 않아 인상이 형성되지 않음',
          status: 'active',
          lastEncounterTurn: currentTurn,
        });
      }
      updatedWorldInfo.npcs = npcs;
    }
  }

  return { worldInfo: updatedWorldInfo, character: updatedCharacter };
}

/**
 * Parses save package from text (Requirement 15 Lossless Save Package)
 */
export function generateSavePackageText(
  worldInfo: WorldInfo,
  character: Character,
  dcRecords: any[],
  currentTurn: number
): string {
  const dcDistribution = dcRecords.reduce((acc: Record<number, number>, rec) => {
    if (rec.targetDC >= 5 && rec.targetDC <= 15) {
      acc[rec.targetDC] = (acc[rec.targetDC] || 0) + 1;
    }
    return acc;
  }, {});

  return `\`\`\`json
{
  "version": "TRPG_ENGINE_SESSION_V1",
  "exportedAt": "${new Date().toISOString()}",
  "currentTurn": ${currentTurn},
  "characterState": {
    "name": "${character.name}",
    "title": "${character.title || ''}",
    "age": ${character.age},
    "location": "${character.location || worldInfo.currentLocation}",
    "stats": ${JSON.stringify(character.stats)},
    "inventory": ${JSON.stringify(character.inventory)},
    "metaElements": ${JSON.stringify(character.metaElements)},
    "chronology": ${JSON.stringify(character.chronology)}
  },
  "worldInfo": {
    "worldName": "${worldInfo.worldName}",
    "genre": "${worldInfo.genre}",
    "currentLocation": "${worldInfo.currentLocation}",
    "npcs": ${JSON.stringify(worldInfo.npcs)},
    "factions": ${JSON.stringify(worldInfo.factions)},
    "activeSeeds": ${JSON.stringify(worldInfo.seeds)},
    "offCameraEvents": ${JSON.stringify(worldInfo.offCameraEvents)},
    "chapters": ${JSON.stringify(worldInfo.chapters)}
  },
  "dcStatistics": {
    "totalRolls": ${dcRecords.length},
    "distribution": ${JSON.stringify(dcDistribution)}
  }
}
\`\`\``;
}
