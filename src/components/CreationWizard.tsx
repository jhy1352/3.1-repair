import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  User,
  ArrowRight,
  ArrowLeft,
  Dices,
  RotateCcw,
  Check,
  Star,
  Layers,
  Globe,
  Feather,
  Shield,
  BookOpen,
} from 'lucide-react';
import {
  Character,
  WorldInfo,
  WorldMode,
  MetaElements,
  MetaElementValue,
  MetaInputType,
} from '../types/trpg';
import { rollCryptoDie } from '../utils/dice';
import { createEmptyMetaElements } from '../utils/factory';
import { SupportedLocale, translations } from '../locales';

interface CreationWizardProps {
  onComplete: (worldInfo: WorldInfo, character: Character) => void;
  locale: SupportedLocale;
  initialWorld?: WorldInfo;
  initialCharacter?: Character;
}

const POPULAR_GENRES = [
  { id: 'wuxia', label: '정통 무협 (Wuxia)', desc: '김용식 신필 무협, 협(俠)과 의(義), 문파와 비급, 절정고수의 풍류' },
  { id: 'dark_fantasy', label: '다크 판타지 (Dark Fantasy)', desc: '톨킨식 중세 서사시, 흑마법, 부패한 성기사단, 고대 악의 각성' },
  { id: 'cyberpunk', label: '사이버펑크 (Cyberpunk)', desc: '거대 메가코프, 사이버웨어, 뒷골목 넷러너와 신체 개조의 비극' },
  { id: 'steampunk', label: '스팀펑크 (Steampunk)', desc: '증기기관과 비공정, 톱니바퀴의 연금술, 탐정과 빅토리아풍 미스터리' },
  { id: 'cthulhu', label: '크툴루 신화 (Cosmic Horror)', desc: '형용할 수 없는 고대신, 붕괴하는 이성, 1920년대 은밀한 탐사' },
  { id: 'space_opera', label: '스페이스 오페라 (Space Opera)', desc: '은하 제국, 초공간 도약, 고대 외계 유적과 성간 분쟁' },
];

function getDefaultPresetsForGenre(genreOrName: string) {
  const g = (genreOrName || '').toLowerCase();
  if (g.includes('판타지') || g.includes('fantasy')) {
    return {
      backgrounds: [
        { title: '몰락한 기사 가문의 마지막 혈통', description: '가문이 반역죄로 몰살당하고 가문의 가보 검 한 자루만 지닌 채 유랑함' },
        { title: '금지된 대도서관의 필사생', description: '고대 마도서의 봉인을 우연히 필사하다 이단으로 쫓겨난 학자' },
        { title: '용병단 출신의 베테랑 척후병', description: '북부 국경 전쟁에서 수많은 사선을 넘고 살아남은 흉터 많은 용병' },
        { title: '신탁을 거부한 이단의 사제', description: '성당의 위선과 비밀 의식을 목격하고 신전을 탈출한 파문 사제' }
      ],
      flaws: [
        { title: '피의 갈증과 저주받은 낙인', description: '고대 악마의 낙인이 박혀 있어 마력을 과용하면 이성을 잃고 폭주함' },
        { title: '전우에 대한 죄책감', description: '혼자만 살아남았다는 트라우마로 인해 위기 상황에서 무모한 희생을 자처함' },
        { title: '금지된 지식에 대한 탐욕', description: '고대 유적이나 비전서를 보면 위험을 잊고 뛰어드는 맹목성' },
        { title: '성물/은에 대한 알레르기성 반응', description: '성스러운 기운이나 특정 광물에 닿으면 극심한 통증과 무력화가 옴' }
      ],
      oaths: [
        { title: '어둠에 맞서는 불멸의 서약', description: '세상이 멸망할지라도 악의 군단에 무릎 꿇지 않고 끝까지 검을 들겠다는 맹세' },
        { title: '가문의 명예와 진실 규명', description: '가문을 음해한 배후 세력을 모두 밝혀내고 명예를 회복하겠다는 결의' },
        { title: '무고한 자들의 방패', description: '자신의 목숨보다 민초와 약자의 안위를 우선하겠다는 기사도적 서약' },
        { title: '금지된 마법의 정화와 봉인', description: '세상을 파멸로 이끌 수 있는 고대 아티팩트를 찾아 영구 봉인하겠다는 사명' }
      ],
      anchors: [
        { title: '어릴 적 여동생이 엮어준 가죽 부적', description: '절망적인 순간마다 손에 쥐며 인간성을 붙잡게 해주는 유품' },
        { title: '사부가 물려준 빛바랜 성서 조각', description: '신앙이 흔들릴 때마다 읽어보는 초심의 문구' },
        { title: '고향 마을의 흙이 담긴 작은 가죽 주머니', description: '언젠가 반드시 돌아가겠다는 다짐의 상징' },
        { title: '전우들과 함께 나눴던 은화 한 닢', description: '그들의 희생을 헛되게 하지 않겠다는 맹세의 증표' }
      ],
      factions: [
        { title: '은빛 태양 기사단', description: '빛의 신을 섬기며 언데드와 악마를 멸하는 대륙 최정예 기사단' },
        { title: '그림자 밀수 연합', description: '국경과 법망을 피해 진귀한 마법 아티팩트를 거래하는 거대 암시장 세력' },
        { title: '비전 마법 대학 (비전원)', description: '대륙의 지식과 마나 흐름을 독점 통제하는 마법사 학술 연합' },
        { title: '자유 국경 용병 동맹', description: '어느 군주에게도 얽매이지 않고 실력과 금화로만 계약하는 무장 집단' }
      ]
    };
  }

  if (g.includes('사이버') || g.includes('cyber')) {
    return {
      backgrounds: [
        { title: '메가코프 전직 블랙옵스 요원', description: '기업의 더러운 비밀을 알고 숙청 직전 잠적한 전직 암살자' },
        { title: '뒷골목 자생 넷러너', description: '폐기된 하드웨어를 주워 독학으로 거대 방화벽을 뚫는 천재 해커' },
        { title: '불법 크롬 개조 시술의', description: '빈민가 지하에서 면허 없이 사이버웨어를 개조·이식해 주는 베테랑' },
        { title: '기업 슬럼가 출신 폭주족 리더', description: '오염된 네온 도시의 하층부를 장악한 사이버 모터 갱단의 수장' }
      ],
      flaws: [
        { title: '사이버 사이코시스 초기 증상', description: '과도한 신체 개조로 인해 감정이 마모되고 환각과 폭력 충동이 일어남' },
        { title: '거대 코퍼레이션의 현상수배', description: '안면 인식 드론과 추적자들이 끊임없이 생명을 노림' },
        { title: '군용 신경가속제 중독', description: '약물이 떨어지면 극심한 신경통과 반응 속도 저하가 발생함' },
        { title: '인간성에 대한 깊은 불신', description: '모든 사람을 데이터와 거래 관계로만 보아 진정한 동료를 만들지 못함' }
      ],
      oaths: [
        { title: '기업 독점 체제의 파괴', description: '인간의 영혼까지 데이터로 지배하는 메가코프의 시스템을 붕괴시키겠다는 결의' },
        { title: '슬럼가 아이들의 자립 수호', description: '자신이 나고 자란 최하층 구역만은 기업의 착취로부터 지키겠다는 맹세' },
        { title: '잃어버린 유기체 인간성의 보존', description: '아무리 기계로 몸을 채워도 마지막 인간의 심장과 양심은 팔지 않겠다는 약속' },
        { title: '전설적인 데이터 포트 해킹', description: '인류 역사의 모든 진실이 잠든 블랙 서버를 뚫고 세상에 폭로하겠다는 야망' }
      ],
      anchors: [
        { title: '오프라인 저장된 옛 가족 사진 칩', description: '네트워크에 연결하지 않고 홀로그램으로만 보는 순수 인간 시절의 기억' },
        { title: '첫 해킹에 성공했던 구형 덱 부품', description: '자신의 시작을 잊지 않게 해주는 부적 같은 고철' },
        { title: '슬럼가 단골 라멘집의 식권', description: '비정한 도시에서 유일하게 따뜻함을 느끼는 장소' },
        { title: '망가진 아날로그 기계식 손목시계', description: '디지털 신호에 오염되지 않은 절대적 시간의 상징' }
      ],
      factions: [
        { title: '아라사카/밀리테크 연합 메가코프', description: '도시의 부와 무력을 99% 독점한 지배 기업 연합' },
        { title: '언더그라운드 넷러너 결사대', description: '사이버스페이스의 자유를 위해 기업 서버를 타격하는 해커 집단' },
        { title: '나이트시티 부랑자 연대', description: '하층민과 슬럼가 주민들이 자치적으로 조직한 무장 자위대' },
        { title: '크롬 바이오 개조 신디케이트', description: '금지된 군용 사이버웨어를 유통하는 암흑가 범죄 조직' }
      ]
    };
  }

  // Default: Wuxia (정통 무협)
  return {
    backgrounds: [
      { title: '몰락한 명문세가의 후예', description: '가문이 멸문당하고 유일하게 가문의 비급 조각을 지닌 채 살아남음' },
      { title: '은둔 기인의 수제자', description: '심산유곡에서 사부의 비전을 십수 년간 연마하고 갓 강호에 출도함' },
      { title: '저자거리 낭인 협객', description: '어릴 적부터 거친 저자거리를 떠돌며 실전 생존 무예를 터득함' },
      { title: '도관의 파문된 제자', description: '도문의 규율을 어겨 파문당했으나 깊은 도가 무학의 기초를 체화함' }
    ],
    flaws: [
      { title: '핏빛 주화입마의 잔재', description: '체내에 갈무리되지 않은 내력의 역류로 극한의 상황에서 기혈이 뒤틀림' },
      { title: '신뢰의 트라우마', description: '과거 가장 믿었던 동료의 배신으로 타인에게 온전히 등을 맡기지 못함' },
      { title: '가문 원수에 대한 맹목적 집착', description: '원수와 관련된 단서를 접하면 이성을 잃고 무모해짐' },
      { title: '의협심의 멍에', description: '눈앞의 불의를 지나치지 못해 자신과 동료를 곤경에 빠뜨림' }
    ],
    oaths: [
      { title: '위국위민의 대협 (爲國爲民)', description: '약자를 구하고 천하의 정의를 세우기 위해 검을 쓴다는 신념' },
      { title: '은원은 천 배로 갚는다 (恩怨分明)', description: '입은 은혜는 반드시 보답하고, 받은 원한은 피로 갚는다는 철칙' },
      { title: '천하제일인의 도달', description: '세상의 모든 절정고수를 꺾고 무학의 극의를 확인하겠다는 열망' },
      { title: '평온한 안식처의 수호', description: '자신과 소중한 사람들이 살아갈 작은 터전을 외압으로부터 지키겠다는 맹세' }
    ],
    anchors: [
      { title: '사부가 남긴 부러진 목검', description: '초심을 잃거나 공포에 질릴 때 쥐어보는 유품' },
      { title: '어린 날의 유일한 벗과의 약속', description: '언젠가 천하의 중심에서 다시 만나자던 어릴 적 맹세' },
      { title: '어머니의 낡은 옥패', description: '자신의 뿌리를 상기시켜 주는 유일한 가문의 흔적' },
      { title: '술 한 잔과 강호의 풍류', description: '생사의 갈림길에서도 마음의 여유를 잃지 않게 해주는 여유' }
    ],
    factions: [
      { title: '구파일방 (정파 무림맹)', description: '강호의 정통성과 대의를 중시하는 중원 정파의 연합' },
      { title: '사파 십팔채 (녹림/장강)', description: '규율에 얽매이지 않고 실리와 힘으로 움직이는 세력' },
      { title: '천마신교 (마교)', description: '절대적인 힘과 약육강식을 숭상하는 외세 무림' },
      { title: '강호 무소속 협객련', description: '문파의 이익 다툼에 휘둘리지 않는 자유로운 낭인들의 연대' }
    ]
  };
}

export const CreationWizard: React.FC<CreationWizardProps> = ({
  onComplete,
  locale,
  initialWorld,
  initialCharacter,
}) => {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const t = translations[locale];

  // Phase 1 State: World
  const [worldMode, setWorldMode] = useState<WorldMode>(initialWorld?.mode || 'popular_genre');
  const [worldName, setWorldName] = useState<string>(initialWorld?.worldName || '정통 무협 강호');
  const [genre, setGenre] = useState<string>(initialWorld?.genre || '정통 무협 (Wuxia)');
  const [worldDetails, setWorldDetails] = useState<string>(initialWorld?.loreOverview || '');
  const [currentLocation, setCurrentLocation] = useState<string>(initialWorld?.currentLocation || '낙양 저자거리 삼화루');

  // Phase 2 State: Meta-Elements
  const [metaElements, setMetaElements] = useState<MetaElements>(
    initialCharacter?.metaElements || createEmptyMetaElements()
  );
  const [generatedPresets, setGeneratedPresets] = useState<{
    backgrounds: Array<{ title: string; description: string }>;
    flaws: Array<{ title: string; description: string }>;
    oaths: Array<{ title: string; description: string }>;
    anchors: Array<{ title: string; description: string }>;
    factions: Array<{ title: string; description: string }>;
  } | null>(null);
  const [isLoadingPresets, setIsLoadingPresets] = useState<boolean>(false);

  // Phase 3 State: Character
  const [charName, setCharName] = useState<string>(initialCharacter?.name || '');
  const [charTitle, setCharTitle] = useState<string>(initialCharacter?.title || '');
  const [charAge, setCharAge] = useState<number>(initialCharacter?.age || 20);
  const [charGender, setCharGender] = useState<string>(initialCharacter?.gender || '남');
  const [charAppearance, setCharAppearance] = useState<string>(
    initialCharacter?.appearance || '청초한 남빛 무복과 대나무 삿갓'
  );
  const [stats, setStats] = useState<Record<string, number>>(
    initialCharacter?.stats || {
      근골: 12,
      신법: 14,
      내력: 13,
      혜안: 11,
      심계: 12,
      풍모: 15,
    }
  );

  // Re-roll stats using CSPRNG
  const rollStats = () => {
    const isWuxia = genre.includes('무협') || genre.includes('Wuxia');
    if (isWuxia) {
      setStats({
        근골: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        신법: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        내력: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        혜안: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        심계: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        풍모: 9 + rollCryptoDie(6) + rollCryptoDie(4),
      });
    } else {
      setStats({
        완력: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        민첩: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        체력: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        지능: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        통찰: 9 + rollCryptoDie(6) + rollCryptoDie(4),
        매력: 9 + rollCryptoDie(6) + rollCryptoDie(4),
      });
    }
  };

  // Fetch Meta-Element Presets from Backend on Phase 2 enter
  const fetchMetaPresets = async () => {
    setIsLoadingPresets(true);
    try {
      const res = await fetch('/api/generate-meta-presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldName,
          genre,
          mode: worldMode,
          worldDetails,
        }),
      });
      const data = await res.json();
      setGeneratedPresets(data);

      // Set initial defaults from preset if available
      if (data.backgrounds?.[0]) {
        setMetaElements((prev) => ({
          ...prev,
          background: {
            type: 'preset',
            title: data.backgrounds[0].title,
            description: data.backgrounds[0].description,
          },
          flaw: {
            type: 'preset',
            title: data.flaws?.[0]?.title || prev.flaw.title,
            description: data.flaws?.[0]?.description || prev.flaw.description,
          },
          oath: {
            type: 'preset',
            title: data.oaths?.[0]?.title || prev.oath.title,
            description: data.oaths?.[0]?.description || prev.oath.description,
          },
          anchor: {
            type: 'preset',
            title: data.anchors?.[0]?.title || prev.anchor.title,
            description: data.anchors?.[0]?.description || prev.anchor.description,
          },
          faction: {
            type: 'preset',
            title: data.factions?.[0]?.title || prev.faction.title,
            description: data.factions?.[0]?.description || prev.faction.description,
          },
        }));
      }
    } catch (err) {
      console.error('Failed to load presets:', err);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  const goToPhase2 = () => {
    const activeWorldName = worldName.trim() || (worldMode === 'popular_genre' ? genre : '정통 무협 강호');
    setWorldName(activeWorldName);
    setPhase(2);
    if (!generatedPresets) {
      const defaultPresets = getDefaultPresetsForGenre(genre || activeWorldName);
      setGeneratedPresets(defaultPresets);
      setMetaElements((prev) => ({
        ...prev,
        background: prev.background.title ? prev.background : {
          type: 'preset',
          title: defaultPresets.backgrounds[0].title,
          description: defaultPresets.backgrounds[0].description,
        },
        flaw: prev.flaw.title ? prev.flaw : {
          type: 'preset',
          title: defaultPresets.flaws[0].title,
          description: defaultPresets.flaws[0].description,
        },
        oath: prev.oath.title ? prev.oath : {
          type: 'preset',
          title: defaultPresets.oaths[0].title,
          description: defaultPresets.oaths[0].description,
        },
        anchor: prev.anchor.title ? prev.anchor : {
          type: 'preset',
          title: defaultPresets.anchors[0].title,
          description: defaultPresets.anchors[0].description,
        },
        faction: prev.faction.title ? prev.faction : {
          type: 'preset',
          title: defaultPresets.factions[0].title,
          description: defaultPresets.factions[0].description,
        },
      }));
    }
  };

  const goToPhase3 = () => {
    setPhase(3);
    if (Object.keys(stats).length === 0) {
      rollStats();
    }
  };

  const handleStartCampaign = () => {
    const finalWorldInfo: WorldInfo = {
      worldName: worldName.trim() || '강호',
      mode: worldMode,
      genre: genre,
      loreOverview: worldDetails.trim() || `${worldName}의 장대한 정사 서막`,
      timeline: '난세의 서막',
      currentLocation: currentLocation.trim() || '낙양 저자거리 삼화루',
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

    const finalCharacter: Character = {
      name: charName.trim() || (genre.includes('무협') ? '운무현' : '에반'),
      title: charTitle.trim() || (genre.includes('무협') ? '무명검객' : '방랑자'),
      age: charAge,
      gender: charGender,
      appearance: charAppearance.trim() || '검소한 옷차림',
      stats,
      inventory: [
        {
          id: 'item_init_1',
          name: genre.includes('무협') ? '청강검' : '단검',
          description: '손때 묻은 믿음직한 무기',
          quantity: 1,
        },
        {
          id: 'item_init_2',
          name: genre.includes('무협') ? '엽전 세 냥' : '은화 10닢',
          description: '여비',
          quantity: 1,
        },
      ],
      metaElements,
      location: currentLocation.trim() || '낙양 삼화루',
      statusNotes: '양호',
      chronology: [`${worldName}의 ${currentLocation}에서 서사의 첫 발을 내딛음.`],
    };

    onComplete(finalWorldInfo, finalCharacter);
  };

  // Helper for updating a specific meta-element
  const updateMetaElement = (
    key: keyof MetaElements,
    type: MetaInputType,
    title: string,
    description: string,
    isGolden?: boolean
  ) => {
    setMetaElements((prev) => ({
      ...prev,
      [key]: {
        type,
        title,
        description,
        isGoldenData: isGolden ?? (type === 'custom'),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 selection:bg-amber-800 selection:text-stone-100">
      <div className="w-full max-w-4xl bg-stone-900/90 border border-amber-900/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Wizard Top Progress Bar */}
        <div className="bg-stone-950/80 px-6 py-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-stone-100 shadow-md">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-stone-100 tracking-tight">{t.appName}</h1>
              <p className="text-xs text-amber-400/90 font-medium">{t.tagline}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono transition-all ${
                  phase === step
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : phase > step
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                    : 'bg-stone-800 text-stone-500'
                }`}
              >
                <span>0{step}</span>
                <span className="hidden sm:inline">
                  {step === 1 ? '세계관' : step === 2 ? '메타 엘리먼트' : '캐릭터 & 스탯'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* ================= PHASE 1 ================= */}
          {phase === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-100">{t.creation.phase1Title}</h2>
                <p className="text-xs text-stone-400 mt-1">{t.creation.phase1Subtitle}</p>
              </div>

              {/* Mode Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setWorldMode('popular_genre');
                    setWorldName(genre);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    worldMode === 'popular_genre'
                      ? 'bg-amber-950/30 border-amber-500 shadow-sm'
                      : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    {worldMode === 'popular_genre' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h3 className="text-sm font-semibold text-stone-100">정통 장르 프리셋</h3>
                  <p className="text-xs text-stone-400 mt-1">정통 무협, 다크 판타지, 사이버펑크 등 검증된 룰셋</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorldMode('original_ip');
                    setWorldName('김용 사조영웅전 / 소오강호');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    worldMode === 'original_ip'
                      ? 'bg-amber-950/30 border-amber-500 shadow-sm'
                      : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="w-5 h-5 text-sky-400" />
                    {worldMode === 'original_ip' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h3 className="text-sm font-semibold text-stone-100">원작 IP 고증 (검색 연동)</h3>
                  <p className="text-xs text-stone-400 mt-1">김용 월드, 반지의 제왕 등 실시간 정사 팩트체크</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setWorldMode('custom_world');
                    setWorldName('새로운 오리지널 세계관');
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    worldMode === 'custom_world'
                      ? 'bg-amber-950/30 border-amber-500 shadow-sm'
                      : 'bg-stone-950/40 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    {worldMode === 'custom_world' && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h3 className="text-sm font-semibold text-stone-100">독창적 커스텀 세계</h3>
                  <p className="text-xs text-stone-400 mt-1">플레이어가 직접 구상한 독창적 설정 및 AI 승인</p>
                </button>
              </div>

              {/* Genre Grid for Popular Preset */}
              {worldMode === 'popular_genre' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-stone-300">장르 프리셋 선택</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {POPULAR_GENRES.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setGenre(g.label);
                          setWorldName(g.label);
                        }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          genre === g.label
                            ? 'bg-amber-900/30 border-amber-500 text-stone-100'
                            : 'bg-stone-950/40 border-stone-800/80 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="text-xs font-semibold text-amber-400">{g.label}</div>
                        <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">{g.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* World Name & Lore Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">세계관 / 원작 명칭</label>
                  <input
                    type="text"
                    value={worldName}
                    onChange={(e) => setWorldName(e.target.value)}
                    placeholder="예: 김용 사조삼부곡 강호, 톨킨 중간계, 네오 서울 2099..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">시작 지점 (위치)</label>
                  <input
                    type="text"
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                    placeholder="예: 낙양 저자거리 삼화루 2층 주안상..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">세계관 배경 및 타임라인 요약</label>
                <textarea
                  rows={3}
                  value={worldDetails}
                  onChange={(e) => setWorldDetails(e.target.value)}
                  placeholder="세계의 시대적 배경, 현재 강호나 대륙의 정세, 대립 구도 등을 간략히 기술하세요..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-3 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={goToPhase2}
                  className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                >
                  <span>{t.creation.nextPhase}: 메타 엘리먼트 설정</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= PHASE 2 ================= */}
          {phase === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-stone-100">{t.creation.phase2Title}</h2>
                  <p className="text-xs text-stone-400 mt-1">{t.creation.phase2Subtitle}</p>
                </div>
                <button
                  onClick={fetchMetaPresets}
                  disabled={isLoadingPresets}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-lg text-xs flex items-center gap-1.5 border border-stone-700 transition-colors"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isLoadingPresets ? 'animate-spin' : ''}`} />
                  <span>{isLoadingPresets ? '생성 중...' : 'AI 프리셋 새로고침'}</span>
                </button>
              </div>

              {/* 5 Meta Elements Selection */}
              <div className="space-y-4">
                {(
                  [
                    { key: 'background', label: '출신 / 배경 (Background)', presets: generatedPresets?.backgrounds },
                    { key: 'flaw', label: '결핍 / 약점 (Flaw)', presets: generatedPresets?.flaws },
                    { key: 'oath', label: '맹세 / 신념 (Oath)', presets: generatedPresets?.oaths },
                    { key: 'anchor', label: '심리적 닻 (Anchor)', presets: generatedPresets?.anchors },
                    { key: 'faction', label: '소속 세력 (Faction)', presets: generatedPresets?.factions },
                  ] as const
                ).map(({ key, label, presets }) => {
                  const current = metaElements[key];
                  return (
                    <div
                      key={key}
                      className="p-4 bg-stone-950/60 border border-stone-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400">{label}</span>
                        <div className="flex gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              updateMetaElement(
                                key,
                                'preset',
                                presets?.[0]?.title || '기본 프리셋',
                                presets?.[0]?.description || ''
                              )
                            }
                            className={`px-2 py-1 rounded transition-colors ${
                              current.type === 'preset'
                                ? 'bg-amber-900/60 text-amber-200 font-semibold border border-amber-700/50'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            AI 프리셋
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMetaElement(key, 'custom', current.title, current.description, true)}
                            className={`px-2 py-1 rounded transition-colors ${
                              current.type === 'custom'
                                ? 'bg-amber-900/60 text-amber-200 font-semibold border border-amber-700/50'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            ⭐ Golden Data
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateMetaElement(
                                key,
                                'tabula_rasa',
                                '백지 상태 (Tabula Rasa)',
                                '기억 상실 / 미지의 요람에서 깨어남'
                              )
                            }
                            className={`px-2 py-1 rounded transition-colors ${
                              current.type === 'tabula_rasa'
                                ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-700/50'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            🌀 Tabula Rasa
                          </button>
                        </div>
                      </div>

                      {/* Mode: Preset */}
                      {current.type === 'preset' && (
                        <div className="space-y-2">
                          {presets && presets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {presets.map((p, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => updateMetaElement(key, 'preset', p.title, p.description)}
                                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                    current.title === p.title
                                      ? 'bg-amber-950/40 border-amber-500 text-stone-100'
                                      : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
                                  }`}
                                >
                                  <div className="font-semibold text-stone-200">{p.title}</div>
                                  <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                                    {p.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-xs text-stone-500 italic py-2">
                              프리셋을 생성 중이거나 로드할 수 없습니다.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mode: Custom / Golden Data */}
                      {current.type === 'custom' && (
                        <div className="space-y-2">
                          <div className="text-[11px] text-amber-300/80 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>사용자 직접 입력 (Golden Data): AI GM이 최우선 서사 훅으로 깊이 있게 다룹니다.</span>
                          </div>
                          <input
                            type="text"
                            placeholder="명칭 / 제목..."
                            value={current.title}
                            onChange={(e) => updateMetaElement(key, 'custom', e.target.value, current.description, true)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                          />
                          <textarea
                            rows={2}
                            placeholder="상세 내력 및 사연..."
                            value={current.description}
                            onChange={(e) => updateMetaElement(key, 'custom', current.title, e.target.value, true)}
                            className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      )}

                      {/* Mode: Tabula Rasa */}
                      {current.type === 'tabula_rasa' && (
                        <div className="p-3 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs text-indigo-300 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                          <span>
                            <strong>정체성 미스터리 프로토콜:</strong> 출신이나 본질이 지워진 백지 상태로 시작합니다. AI
                            GM은 이를 단순한 무개성이 아닌 잃어버린 기억을 추적하는 서사적 촉매로 다룹니다.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPhase(1)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.creation.prevPhase}</span>
                </button>
                <button
                  type="button"
                  onClick={goToPhase3}
                  className="px-6 py-2.5 bg-amber-700 hover:bg-amber-600 text-stone-100 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
                >
                  <span>{t.creation.nextPhase}: 캐릭터 & 능력치</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= PHASE 3 ================= */}
          {phase === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-stone-100">{t.creation.phase3Title}</h2>
                <p className="text-xs text-stone-400 mt-1">{t.creation.phase3Subtitle}</p>
              </div>

              {/* Character Profile Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">{t.creation.characterName}</label>
                  <input
                    type="text"
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    placeholder={genre.includes('무협') ? '운무현' : '에반'}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">{t.creation.characterTitle}</label>
                  <input
                    type="text"
                    value={charTitle}
                    onChange={(e) => setCharTitle(e.target.value)}
                    placeholder="예: 청운검객, 유령 방랑자"
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">{t.creation.characterAge}</label>
                  <input
                    type="number"
                    value={charAge}
                    onChange={(e) => setCharAge(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">{t.creation.characterGender}</label>
                  <select
                    value={charGender}
                    onChange={(e) => setCharGender(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="남">남성</option>
                    <option value="여">여성</option>
                    <option value="중성/불명">기타/불명</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">인상 및 복색</label>
                <input
                  type="text"
                  value={charAppearance}
                  onChange={(e) => setCharAppearance(e.target.value)}
                  placeholder="예: 흑요석 같은 눈매, 검소한 남빛 무복과 부러진 검집..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* CSPRNG Stats Dice Roll Section */}
              <div className="p-5 bg-stone-950/70 border border-amber-900/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Dices className="w-4 h-4" />
                      CSPRNG 암호학적 주사위 스탯
                    </h3>
                    <p className="text-[11px] text-stone-400">
                      window.crypto.getRandomValues() 난수 엔진으로 능력치를 산출합니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={rollStats}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.creation.generateStats}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
                  {Object.entries(stats).map(([statKey, val]) => (
                    <div
                      key={statKey}
                      className="p-3 bg-stone-900 border border-stone-800 rounded-xl text-center"
                    >
                      <span className="text-xs text-stone-400 block font-medium">{statKey}</span>
                      <span className="text-xl font-bold font-mono text-stone-100">{val}</span>
                      <span className="text-[10px] text-amber-400 block mt-0.5 font-mono">
                        보정 {val >= 10 ? `+${Math.floor((val - 10) / 2)}` : Math.floor((val - 10) / 2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setPhase(2)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.creation.prevPhase}</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartCampaign}
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-xl transition-all active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t.creation.startAdventure}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
