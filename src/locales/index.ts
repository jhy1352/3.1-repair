export type SupportedLocale = 'ko' | 'en';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  gameStatus: {
    creation: string;
    playing: string;
    turn: string;
    dcBalance: string;
  };
  nav: {
    worldInfo: string;
    characterSheet: string;
    diceRoller: string;
    cloudSync: string;
    exportSave: string;
    resetSession: string;
    language: string;
  };
  navigation: {
    worldInfo: string;
    characterSheet: string;
    diceRoller: string;
    cloudSync: string;
    exportSave: string;
    resetSession: string;
    language: string;
  };
  metaElements: {
    background: string;
    flaw: string;
    oath: string;
    anchor: string;
    faction: string;
    presetMode: string;
    customMode: string;
    tabulaRasaMode: string;
    goldenDataTag: string;
    tabulaRasaTag: string;
  };
  stats: {
    strength: string;
    agility: string;
    endurance: string;
    intelligence: string;
    insight: string;
    charisma: string;
    qi: string;
    wisdom: string;
    martialMind: string;
    presence: string;
  };
  creation: {
    phase1Title: string;
    phase1Subtitle: string;
    phase2Title: string;
    phase2Subtitle: string;
    phase3Title: string;
    phase3Subtitle: string;
    worldModeOriginal: string;
    worldModePreset: string;
    worldModeCustom: string;
    characterName: string;
    characterTitle: string;
    characterAge: string;
    characterGender: string;
    generateStats: string;
    startAdventure: string;
    nextPhase: string;
    prevPhase: string;
  };
  chat: {
    inputPlaceholder: string;
    sendButton: string;
    quickActions: string;
    rollDice: string;
    systemNotice: string;
    gmThinking: string;
    metaBlockToggle: string;
    freePromptHint: string;
  };
  modals: {
    worldInfoTitle: string;
    characterSheetTitle: string;
    cloudSyncTitle: string;
    diceModalTitle: string;
    saveExportTitle: string;
    tabs: {
      npcs: string;
      factions: string;
      seeds: string;
      chapters: string;
      offCamera: string;
      secrets: string;
      rawLog: string;
    };
  };
  cloud: {
    saveTitle: string;
    loadTitle: string;
    saveDesc: string;
    loadDesc: string;
    syncCodeLabel: string;
    enterCodePlaceholder: string;
    saveButton: string;
    loadButton: string;
    codeCopied: string;
    saveSuccess: string;
    loadSuccess: string;
  };
}

export const translations: Record<SupportedLocale, TranslationDictionary> = {
  ko: {
    appName: 'TRPG Engine & Web Player',
    tagline: '신필급 AI GM 서사 엔진 & 하이 피델리티 TRPG 플레이어',
    gameStatus: {
      creation: '세계관 & 캐릭터 생성',
      playing: '캠페인 진행 중',
      turn: '턴',
      dcBalance: 'DC 균등도',
    },
    nav: {
      worldInfo: '강호/세계 정보록 (World Info)',
      characterSheet: '인물 상태창 (Character)',
      diceRoller: 'CSPRNG 주사위 판정기',
      cloudSync: '클라우드 동기화 (6자리 코드)',
      exportSave: '세이브 패키지 발급',
      resetSession: '새 세션 시작',
      language: 'Language',
    },
    navigation: {
      worldInfo: '강호/세계 정보록 (World Info)',
      characterSheet: '인물 상태창 (Character)',
      diceRoller: 'CSPRNG 주사위 판정기',
      cloudSync: '클라우드 동기화 (6자리 코드)',
      exportSave: '세이브 패키지 발급',
      resetSession: '새 세션 시작',
      language: 'Language',
    },
    metaElements: {
      background: '출신 / 배경 (Background)',
      flaw: '결핍 / 약점 (Flaw)',
      oath: '맹세 / 신념 (Oath)',
      anchor: '심리적 닻 (Anchor)',
      faction: '소속 세력 (Faction)',
      presetMode: 'AI 프리셋 선택',
      customMode: '사용자 지정 (Golden Data)',
      tabulaRasaMode: '백지 상태 (Tabula Rasa)',
      goldenDataTag: '⭐ Golden Data (최우선 서사 훅)',
      tabulaRasaTag: '🌀 Tabula Rasa (정체성 미스터리)',
    },
    stats: {
      strength: '근골 / 완력',
      agility: '신법 / 민첩',
      endurance: '체질 / 기골',
      intelligence: '지략 / 혜안',
      insight: '통찰 / 심계',
      charisma: '풍모 / 매력',
      qi: '내력 / 잠재력',
      wisdom: '혜안 / 지혜',
      martialMind: '심계 / 통찰',
      presence: '풍모 / 기품',
    },
    creation: {
      phase1Title: '1단계: 세계관 확립 (World Establishment)',
      phase1Subtitle: '원작 IP 고증, 정통 장르 프리셋, 혹은 독창적 세계관을 수립합니다.',
      phase2Title: '2단계: 메타 엘리먼트 프로토콜 (Meta-Elements)',
      phase2Subtitle: '출신, 결핍, 맹세, 닻, 세력을 설정합니다 (프리셋 / Golden Data / Tabula Rasa 선택 가능).',
      phase3Title: '3단계: 인물 구축 & CSPRNG 스탯 (Character Sheet)',
      phase3Subtitle: '암호학적 안전 난수(CSPRNG) 주사위로 능력치를 산정하고 서사를 시작합니다.',
      worldModeOriginal: '원작 IP 고증 (인터넷 검색 검증)',
      worldModePreset: '정통 장르 프리셋 (무협, 판타지, 사이버펑크 등)',
      worldModeCustom: '독창적 커스텀 세계관 (AI 검증 & 승인)',
      characterName: '주인공 성명',
      characterTitle: '강호 별호 / 칭호',
      characterAge: '연령',
      characterGender: '성별',
      generateStats: 'CSPRNG 주사위로 스탯 재굴림',
      startAdventure: '대서사 개막 (Start Campaign)',
      nextPhase: '다음 단계',
      prevPhase: '이전 단계',
    },
    chat: {
      inputPlaceholder: '자유 프롬프트 입력창: 주인공의 행동 선언, 대사, 시스템 질의, 서사 방향 지시...',
      sendButton: '전송 (Action)',
      quickActions: '빠른 선언 / 주사위 판정',
      rollDice: 'D20 판정 투척',
      systemNotice: '시스템 알림',
      gmThinking: 'AI GM이 정사 대조 및 서사를 빚어내고 있습니다...',
      metaBlockToggle: '14번 시스템 메타데이터 검증창',
      freePromptHint: '자유 프롬프트 창: 인물 행동뿐 아니라 메타 질의, 연출 요청, DC 판정 선언이 모두 가능합니다.',
    },
    modals: {
      worldInfoTitle: '강호/세계 정보록 (World Info & NPC Directory)',
      characterSheetTitle: '주인공 인물록 및 상태창 (Character Sheet)',
      cloudSyncTitle: '크로스 플랫폼 클라우드 동기화 (6-Digit Sync)',
      diceModalTitle: 'CSPRNG 암호학적 주사위 엔진 & DC 통계',
      saveExportTitle: '무손실 세이브 데이터 패키지 (Lossless Save Packet)',
      tabs: {
        npcs: '등장인물 (NPC/OC)',
        factions: '세력 동향 (Factions)',
        seeds: '미회수 복선 씨앗 (Seeds)',
        chapters: '챕터 로드맵 (Chapters)',
        offCamera: '카메라 밖 정세 (Off-Camera)',
        secrets: '정보 한계선 (Secrets)',
        rawLog: '14번 시스템 원본 로그',
      },
    },
    cloud: {
      saveTitle: '클라우드에 세션 저장',
      loadTitle: '6자리 코드로 불러오기',
      saveDesc: '현재 세션을 서버에 업로드하고 PC/모바일에서 이어할 수 있는 6자리 코드를 발급받습니다.',
      loadDesc: '발급받은 6자리 동기화 코드(예: X9K2A7)를 입력하여 세션을 즉시 복원합니다.',
      syncCodeLabel: '6자리 동기화 코드',
      enterCodePlaceholder: '예: X9K2A7',
      saveButton: '클라우드 저장 및 코드 발급',
      loadButton: '세션 동기화 로드',
      codeCopied: '동기화 코드가 클립보드에 복사되었습니다.',
      saveSuccess: '클라우드 저장이 완료되었습니다.',
      loadSuccess: '세션이 성공적으로 복원되었습니다.',
    },
  },
  en: {
    appName: 'TRPG Engine & Web Player',
    tagline: 'High-Fidelity AI GM Narrative Engine & Web TRPG Player',
    gameStatus: {
      creation: 'World & Character Setup',
      playing: 'Campaign Active',
      turn: 'Turn',
      dcBalance: 'DC Uniformity',
    },
    nav: {
      worldInfo: 'World Info & NPC Directory',
      characterSheet: 'Character Sheet',
      diceRoller: 'CSPRNG Dice Engine',
      cloudSync: 'Cloud Sync (6-Digit Code)',
      exportSave: 'Export Save Package',
      resetSession: 'New Campaign',
      language: 'Language',
    },
    navigation: {
      worldInfo: 'World Info & NPC Directory',
      characterSheet: 'Character Sheet',
      diceRoller: 'CSPRNG Dice Engine',
      cloudSync: 'Cloud Sync (6-Digit Code)',
      exportSave: 'Export Save Package',
      resetSession: 'New Campaign',
      language: 'Language',
    },
    metaElements: {
      background: 'Origin & Background',
      flaw: 'Core Flaw & Deficit',
      oath: 'Sacred Oath & Conviction',
      anchor: 'Psychological Anchor',
      faction: 'Affiliated Faction',
      presetMode: 'Select AI Preset',
      customMode: 'Custom Input (Golden Data)',
      tabulaRasaMode: 'Blank Slate (Tabula Rasa)',
      goldenDataTag: '⭐ Golden Data (Top Priority Narrative Hook)',
      tabulaRasaTag: '🌀 Tabula Rasa (Identity Mystery)',
    },
    stats: {
      strength: 'Strength / Physique',
      agility: 'Agility / Dexterity',
      endurance: 'Endurance / Constitution',
      intelligence: 'Intelligence / Tactics',
      insight: 'Insight / Perception',
      charisma: 'Charisma / Presence',
      qi: 'Internal Energy / Qi',
      wisdom: 'Wisdom / Sagacity',
      martialMind: 'Perception / Insight',
      presence: 'Demeanor / Aura',
    },
    creation: {
      phase1Title: 'Phase 1: World Establishment',
      phase1Subtitle: 'Establish world setting via Canon IP verification, Genre Presets, or Custom Lore.',
      phase2Title: 'Phase 2: Meta-Element Protocol',
      phase2Subtitle: 'Configure Background, Flaw, Oath, Anchor, Faction (Presets / Golden Data / Tabula Rasa).',
      phase3Title: 'Phase 3: Character & CSPRNG Stats',
      phase3Subtitle: 'Generate stats using Cryptographically Secure Dice and embark on the campaign.',
      worldModeOriginal: 'Original Canon IP (Live Google Search Grounding)',
      worldModePreset: 'Popular Genre Preset (Wuxia, Dark Fantasy, Cyberpunk)',
      worldModeCustom: 'Custom World Building (AI Validation)',
      characterName: 'Character Name',
      characterTitle: 'Epithet / Title',
      characterAge: 'Age',
      characterGender: 'Gender',
      generateStats: 'Re-roll Stats via CSPRNG',
      startAdventure: 'Begin Epic Campaign',
      nextPhase: 'Next Step',
      prevPhase: 'Previous Step',
    },
    chat: {
      inputPlaceholder: 'General Prompt: Character action declaration, dialogue, system queries, director prompts...',
      sendButton: 'Send Action',
      quickActions: 'Quick Action / Dice Test',
      rollDice: 'Roll D20 Check',
      systemNotice: 'System Notice',
      gmThinking: 'AI GM is researching lore and crafting literary prose...',
      metaBlockToggle: '14th System Metadata Verification Block',
      freePromptHint: 'Free Prompt Input: Handles actions, meta questions, system requests, and DC checks unrestricted.',
    },
    modals: {
      worldInfoTitle: 'World Information & NPC Directory',
      characterSheetTitle: 'Character Sheet & Inventory',
      cloudSyncTitle: 'Cross-Platform Cloud Sync (6-Digit Code)',
      diceModalTitle: 'CSPRNG Cryptographic Dice Engine & DC Uniformity',
      saveExportTitle: 'Lossless Save Package (Memory Limit Protocol)',
      tabs: {
        npcs: 'NPCs & OC Cast',
        factions: 'Factions',
        seeds: 'Active Seeds',
        chapters: 'Chapter Roadmap',
        offCamera: 'Off-Camera Movements',
        secrets: 'Knowledge Line',
        rawLog: '14th Block Raw Log',
      },
    },
    cloud: {
      saveTitle: 'Save Session to Cloud',
      loadTitle: 'Load Session via 6-Digit Code',
      saveDesc: 'Upload session to cloud server and receive a 6-digit sync code for PC/Mobile.',
      loadDesc: 'Enter a 6-digit synchronization code (e.g., X9K2A7) to restore your session.',
      syncCodeLabel: '6-Digit Sync Code',
      enterCodePlaceholder: 'e.g., X9K2A7',
      saveButton: 'Save & Generate Code',
      loadButton: 'Synchronize Session',
      codeCopied: 'Sync code copied to clipboard.',
      saveSuccess: 'Session saved to cloud successfully.',
      loadSuccess: 'Session restored successfully.',
    },
  },
};
