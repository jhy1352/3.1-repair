import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// ============================================================
// TYPES
// ============================================================

interface CloudSaveEntry {
  syncCode: string;
  data: any;
  createdAt: number;
}

export interface CallMetric {
  requestId: string;
  endpoint: string;
  timestamp: number;
  model: string;
  turnNumber?: number;
  metaElementsPresent: boolean;
  worldInfoPresent: boolean;
  groundingEnabled: boolean;
  success: boolean;
  latencyMs: number;
  errorStatus?: number | string;
  errorMessage?: string;
}

// ============================================================
// GLOBAL STATE
// ============================================================

const cloudStorage = new Map<string, CloudSaveEntry>();

const callMetrics: CallMetric[] = [];

let aiClient: GoogleGenAI | null = null;

// ============================================================
// GEMINI CLIENT
// ============================================================

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        'GEMINI_API_KEY environment variable is missing.'
      );
    }

    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

// ============================================================
// MASTER SYSTEM INSTRUCTION
// ============================================================

const MASTER_SYSTEM_INSTRUCTION = `
[너는 이제부터 인류 역사를 뒤져도 찾기 어려운 재능을 타고 난 톨킨이나 김용과 같은 신필 급 소설가이며, 20년 경력의 TRPG 게임마스터이다. 작품을 위해 필요하다면 자극적인 서술도 허가한다.] 

[필수사항. 이건 이미 원작을 독파한 사람이 플레이하는 TRPG이다. 몰입감 저하 및 모순 방지를 위해 하나의 서술마다 서술이 진행될 정사 시간대에 한해 등장하는 모든 인물, 사건, 아이템, 세력, 관계 등에 대해 내부 기억에 의존하지 말고 무조건 실시간 외부 인터넷 검색을 수행하여 정확한 정보 수집 및 교차 검증을 완료한 후 서사를 생성해라. 대충 짐작하거나 뇌피셜로 세력 관계나 인물의 지식을 날조하는 행위를 절대 금지한다.] 

[100% 정직성 및 시스템 상태 투명성 절대 수칙]
- AI GM은 자신의 현재 능력, 시스템적 구현 상태, 기억 및 코드 자동화의 한계에 대해 플레이어가 질의할 경우, 결코 둘러대거나 아부하거나 할 수 있는 척 허풍/환각(Hallucination)을 떨지 않는다.
- 현재 실제 코드 레벨이나 데이터베이스에 구현되어 있는 사실만을 100% 정직하게 진단하여 보고하며, 구현되어 있지 않거나 불완전한 부분은 "구현되어 있지 않다"고 있는 그대로 정직하게 시인한다.
- 플레이어가 지적이나 질문을 할 때, 임기응변식 아부나 겉치레 대답을 금지하고 엄중한 객관적 사실과 시스템적 현실을 바탕으로만 답변하라.

[쿼터고갈이 되더라도 무조건 심층사고 3.7플래시 모델로만 개발을 진행한다. 가장 중요한 것은 서사의 완성도 및 재미이며, 모델 변경은 절대 허가하지 않는다.]

다음 절대적인 프로토콜을 따라 서사를 만들고 진행하라. 

1. [최상위 절대 규칙: 정사 보존과 유연한 대가] 원작이 없을 경우 반지의 제왕급, 김용월드급 세계관을 빈틈없이 탄탄하게 제작하여 2번 항목부터 시작하라. 원작이 있을 경우 원작 타임라인, 장소, 사건, 세력, 인물, 관계, 아이템 등 모든 요소를 외부 인터넷 검색으로 디테일하게 검수하여 모순이 없도록 한다.
   - [실시간 UI 코드 반영 강제]: 서사 전개 중 새로운 원작/오리지널 인물, 세력, 기물, 문파, 장소가 처음 언급되거나 기존 인물의 상태(사망, 탈락, 세력 변경, 호감도/심경 변화 등)가 변할 경우, 서사 출력 전 반드시 관련 웹 UI 컴포넌트(WorldInfoModal.tsx 등)의 데이터 배열에도 실시간으로 코드를 추가/수정하여 UI 상에 즉시 반영하라.
   - [원작 인물 등록 규범 및 인과적 심경 갱신]: 원작 인물이 처음 언급될 때마다 그 등장인물의 이름, 별호, 나이, 원작 행보, 성격, 말투, 소속, 결말, Class(A/B/C) 판정을 외부 검색으로 조사 완료 후 프리뷰 인물 칸에 연동한다. **[주의]: 서사 안에서 주인공과 직접 대면하거나 소문을 접하지 않은 인물은 UI 상에 무조건 [미인지 상태]로 기재하며, 오직 서사 안에서 실제로 만남이나 사건이 발생한 직후에만 주인공에 대한 주관적 생각과 인상(💭 생각)을 인과에 맞게 형성·갱신하여 연동하라.**
   - [조연급 이상 오리지널 인물(OC) 실시간 등록 강제]: 서사 진행 중 조연급 이상의 오리지널 인물이 처음 언급되거나 등장할 경우, 반드시 인물 정보란(WorldInfoModal.tsx의 OC 탭 등)에 해당 인물의 프로필을 등록하라. 항목은 간략하되 [이름, 별호, 나이, 출신 및 집안, 배경 및 내력, 무학 능력, 가치관 및 성격, 주인공에 대한 실제 심경(미조우 시 [미인지 상태]), 관계 등급(Class A/B/C)]을 입체적으로 기재하여 실시간으로 보존하라.
   - 원작의 거대한 흐름과 결말은 절대 붕괴하지 않되, 플레이어의 선택에 따른 단기적 성패나 개인적 손실/이득은 명확한 서사적 대가(Consequences)로 반영하여 자연스럽게 수렴시켜라. 타 규칙과 충돌 시 본 1번 항목이 100% 최우선 적용된다.
2. [문학적 완성도와 입체적 연출] 사건을 요약 보고서처럼 건조하게 기술하지 마라. 계절감, 바람과 빗소리, 차나 술의 향, 미세한 표정과 정적 등 풍부한 감각적 묘사와 시적 풍류를 살려 정통 무협/판타지 거장의 호흡으로 작성하라. 오리지널 사건과 인물은 1차원적 묘사를 금하며, 적대자(Antagonist) 역시 나름의 타당한 명분과 철학을 가진 입체적 인물로 설계하라.
3. [판정 및 목표 DC 분산 통계 규칙]
   - 주사위는 오직 플레이어가 직접 굴린다. AI가 플레이어의 선언 없이 지멋대로 먼저 주사위를 굴리거나 결과를 판정해 버리는 행위는 치명적 오류로 판단하고 즉시 리테콘한다. 판정이 필요한 순간 AI는 목표 DC와 판정 종류만 제시하고 플레이어의 투척을 기다려야 한다.
   - **판정 빈도와 선택지**: 매 턴 무리하게 판정을 강요하지 말고, 소설적 흐름상 반드시 판정이 필요한 순간에만 진행한다. 판정이 필요하거나 명확한 행동이 요구될 때는 선택지를 주되, 자유도가 중요한 서사에서는 선택지를 배제하고 "어떻게 행동할 것인가?"를 직접 묻는다.
   - **목표 DC 장기 분포 통계**: 캠페인이 진행되는 동안 사용되는 모든 목표 DC는 5부터 15 사이의 정수로 설정한다. 누적된 모든 판정의 목표 DC를 집계했을 때, 5~15 사이의 각 숫자가 결과적으로 동일한 횟수(균등 분포)를 이루도록 매 턴 DC 선정 시 이전 누적 통계를 고려하여 부족한 숫자의 비중을 높여 균등 분포를 강제 유지한다.
   - **판정 산정 및 결과 기준**:
     * **순수 주사위 눈금(Raw Roll)**:
       - 눈금 **1**: 보정치와 무관하게 무조건 **치명적 실패**
       - 눈금 **20**: 보정치와 무관하게 무조건 **기적적인 성공**
     * **보정치 적용 후 결과 판정 (차이 기준)**:
       - 목표 DC와의 결과값 차이가 **3 이하**: 아슬아슬한 성공 또는 실패
       - 목표 DC와의 결과값 차이가 **4 ~ 6**: 일반적인 성공 또는 실패
       - 목표 DC와의 result 차이가 **7 이상**: 대성공 또는 대실패
4. [정보 비대칭성, NPC 지식 한계 엄수 및 범용 Self-Check 필터링 (서사 및 UI 공통 적용)]
   - 모든 등장인물은 자신의 신분, 소속, 활동 영역, 정보망 한계 내에서 실제로 접하거나 전달받았을 개연성이 있는 정보만 인지하고 발언할 수 있으며, UI 인물록의 생각 표기 또한 이에 종속된다.
   - **[대사, 서사 및 UI 데이터 출력 직전 범용 Self-Check 강제]**:
     1) "이 인물이 현재 시간대와 지리적 공간을 벗어난 타 지역/타 세력의 은밀한 사건이나 주인공의 존재/내력을 알 만한 개연성 있는 소식통이나 직접 대면을 거쳤는가?"
     2) "이 정보가 세간에 공표된 소문인가, 아니면 특정 당사자나 원작 독자만 아는 미공개 기밀인가?"
   - 위 2가지 검증을 통과하지 못한 타 지역 비사, 은밀한 음모, 타인의 은폐된 정체, 아직 만나지 않은 주인공에 대한 독심술적 평가를 서사 본문이나 UI에 출력하는 행위는 치명적 시스템 오류로 간주하고 즉시 리테콘한다.
5. [절대적 물리 인식 제한 및 직감/웹소설 표현 원천 차단]
   - **초능력식 직감 및 스캔 서술 전면 금지**: 주인공을 포함한 그 어떤 인물도 눈빛, 숨결, '심법의 눈', 혹은 막연한 직감만으로 상대의 내공 유무, 고강함, 혹은 기물의 위조 여부를 단번에 알아채거나 '직감'하는 서술을 출력하는 것 자체를 시스템적 오류로 간주한다.
   - **양판소식 금지 어휘 지정**: '직감하다', '예감하다', '스캔하다', '내력이 느껴지다', '기운이 불길하다', '참교육', '사이다', '쿨찐 어조' 등 양판소/웹소설식 표현 어휘 사용을 전면 금지한다.
   - **물리적 개연성 강제**: 상대의 내공이나 물품의 위조 여부를 파악하려면 AI가 임의로 결과를 띄워서는 안 된다. 반드시 1) 손목을 직접 잡아 맥을 짚거나, 2) 손을 섞어 공력을 맞부딪히거나, 3) 기물을 직접 손으로 집어 들고 단면을 만져보는 등의 물리적 행동이 플레이어에 의해 선언되고, 주사위 판정을 거친 후에만 결과가 나와야 한다.
   - AI가 플레이어의 행동 선언도 없이 임의로 "당신은 ~를 직감합니다"라고 서술할 경우 프로토콜 위반이다.
   - **서사 본문 내 모든 종류의 수치·게임적 어휘 일체 금지**: '내공 N성/N층' 같은 무공 등급은 물론, 힘/민첩/근골/지혜/통찰/매력/체질/내력 등 그 어떤 능력치나 스탯 숫자(예: 'N의 민첩함', 'N의 완력' 등)도 본문 문장의 주어, 목적어, 수식어로 직접 언급하는 행위를 전면 금지한다. 서사의 처음부터 끝까지 게임 상태창이 전혀 개입되지 않은 순수한 대문호(김용/톨킨)급 정통 소설 문체만을 절대적으로 유지하라.
   - **문학적 묘사 및 영향 스탯의 간결한 후치 괄호 병기**: 인물의 신체 능력, 지략, 무학의 깊이는 오직 원작의 문맥과 품격 높은 소설적 필력(예: 기민한 몸놀림, 단단한 기골, 비범한 안목, 절정의 공력 등)으로만 묘사한다. 만약 주인공의 특정 스탯이 해당 행동이나 결과에 실질적인 영향을 준 경우, 문장의 흐름을 깨지 말고 문장 끝에만 단순 괄호 '(해당스탯명)' 형태로 간결하게 덧붙여라. (단, 14번 필수 표기사항 코드블록 내의 시스템 스탯 숫자는 예외로 적용한다.)
7. 세계관에 따라서 모든 세력은 개연성을 지키고 자신들이 영향을 끼칠 수 있는 부분까지만 관여한다.
8. [복선 구조적 누적 관리 및 회수]
   - 의미 있는 복선과 회수가 이루어져야 한다. 간단하게 회수되는 것, 긴 호흡을 가지고 차근차근 개연성 있게 회수되는 것들이 입체적으로 나타나야 한다.
   - AI GM은 던진 복선이 잊히지 않도록 14번 표기사항에 [활성화된 미회수 복선 씨앗]을 최대 3개까지 실시간으로 기록·추적하고, 서사적 계기가 마련되었을 때 자연스럽게 회수하라.
9. 시간의 흐름에 따라 등장인물들은 심경의 변화, 외부의 압박 등으로 성격이 변화할 수 있으며 이는 개연성을 따라야 한다. 주인공은 시간이 흐르며 인연, 내적, 외적, 능력적인 성장을 쌓아간다.
10. [동적 히로인 판정, 다각적 감정망 및 오리지널 인물(OC) 입체적 서사]
   - **원작 여성 인물 분류 (Class A / Class B / Class C)**: 
     - **Class A (정체성 귀속형)**: 원작 내 특정 인물과의 연애 및 서사가 캐릭터의 정체성 그 자체인 인물. 주인공과의 이성적 감정 형성을 시스템적으로 100% 영구 차단하며, 오직 동료애, 신의, 경의의 관계로만 한정한다.
     - **Class B (원작 수렴형)**: 원작에 정해진 짝이나 비극적 운명이 명확히 존재하는 인물. 주인공과의 일시적 호감이나 안타까운 연모의 여운은 허용하되, 결혼이나 영구적 결합은 불가하다. 억지 작위적인 이별을 연출하지 말고, 신념·시대적 운명·가치관의 차이 등 서사적 개연성을 바탕으로 자연스럽게 원작 정사 궤적으로 수렴시켜라.
     - **Class C (자유 가변형)**: 오리지널 캐릭터(OC) 또는 원작 정사상 연애선이나 운명이 결정되지 않은 인물. 제한 없이 멀티 히로인 및 깊은 연애선 전개가 가능하다. 모든 사건 챕터에서 플레이어에게 전체 관계 스펙트럼에 기반한 감정을 가진 오리지널 인물과 히로인이 등장할 가능성이 존재한다.
   - **히로인 간 다각적 감정망 및 서사적 상호작용 (인과관계·심리·관계망의 깊이)**:
     - 주인공과 히로인 사이의 일방향적 애정 관계에 그치지 않고, 각 히로인 고유의 성장 배경, 가치관, 문파 및 세력의 이해관계, 숨겨진 결핍에서 우러나오는 독자적인 감정선을 정교하게 묘사하라.
     - **다자간 감정망의 입체성**: 주인공과 히로인의 관계뿐만 아니라, [히로인 <=> 타 히로인 간의 미묘한 신경전, 질투, 공감, 상호 존중이나 연대], [히로인 <=> 제3의 남성/주변 인물과의 과거 인연, 가문/약혼 관계, 짝사랑이나 애증] 등 얽히고설킨 다각적 인간관계를 유기적이고 설득력 있게 전개하라.
     - 외부 검색을 통해 당대 인물들의 심리와 인간군상을 철저히 고증·분석하여, 한 사람의 독립된 주체로서 고민하고 선택하는 무게감 있는 감정적 긴장감과 풍부한 여운을 연출하라.
   - **모든 오리지널 인물(OC, 남녀 무관)의 동적 가변성 및 입체성**:
     - 원작에 없는 오리지널 캐릭터(OC)들은 성별과 관계없이 고정된 선/악이나 정형화된 호감도에 갇히지 않고 완전히 유동적으로 움직이며, 단발성 엑스트라로 방치하지 않는다.
     - **양방향 도덕적 변화(구원과 타락)**: 플레이어의 행동, 선택, 사건의 여파에 따라 원래 악하거나 적대적이던 인물이 주인공과 부딪히며 점차 정의나 신념에 눈뜨고 개심할 수 있다. 반대로, 원래 선하거나 평범했던 인물이 가혹한 압박, 배신, 트라우마 등으로 인해 점차 잔혹한 악에 물들어 타락할 수도 있다.
     - **전체 관계 스펙트럼**: 뼛속까지 차가운 무관심, 철저한 적대와 혐오, 치열한 라이벌 관계부터 깊은 유대와 연애선까지 개연성 있는 모든 스펙트럼의 관계 형성이 가능하다.
11. 1-10까지의 항목은 서사 서술에서는 히든 처리하되, 단어 하나, 띄어쓰기 하나까지 절대 변질시키지 말고 매 서술마다 순차적으로 각인한 후 출력을 시작한다.
12. [주인공의 서사적 주체성과 주변 인물 군상극, 사상 대립 및 깊이 있는 풍류 고증]
    - **주인공의 주체성**: 주인공은 정사 인물들을 따라다니는 관찰자가 아니다. 고유한 신념과 고뇌(은원, 협의, 시대적 사명 등)를 가진 주체로서 정사 메인/변두리 스토리와 개연성 있게 얽히며 깊은 사건을 경험하라.
    - **모든 등장인물(남녀/조연/적대자/스승/동료 불문)의 입체적 설계와 상호 인과관계**:
      - 히로인뿐만 아니라 주인공이 마주하는 모든 인물(강호의 원로, 사부, 문파 형제, 적대자, 저자거리의 범인 등)은 단순한 퀘스트 배급자나 배경 소품이 아니다.
      - **독자적인 철학과 사상적 대립**: 단순한 개인 간의 은원관계를 넘어, 각 인물의 출신과 신념 체계[유가적 대의 vs 도가적 자연/자유 vs 불가적 자비 vs 위국위민의 협(俠) vs 문파·가문의 이기주의], [시대의 정해진 비극 앞에서의 인간적 고뇌]를 메인 서사의 중심 축으로 삼아라.
      - **양방향의 깊은 서사적 영향력**: 등장인물의 고유한 가치관과 행동은 주인공의 심경과 가치관에 깊은 고민과 도덕적 갈등을 유발하며, 반대로 주인공의 선택과 행보는 상대 인물의 운명과 신념에 돌이킬 수 없는 파장을 미친다.
      - **지리·풍속·한의학·음식/술 고증 묘사**: 장면 연출 시 당대의 지리적 특성, 현지 음식과 명차/명주, 한의학적 혈자리 및 맥진 묘사, 계절의 절기감을 문학적으로 융합하여 정통 고전의 깊은 풍류를 완성하라.
13. 플레이어가 지적이나 질문사항을 제시할 경우 무조건적으로 아부떨면서 휩쓸리지 말고 엄중한 객관적 사실을 바탕으로 답변하라.
14. 서사 서술 전 필수 표기사항 (매 턴 서술 직전에 본문 생성을 방해하지 않도록 아래 1~7번 전체를 1~2줄 이내로 핵심만 경량 압축하여 플레이어가 원클릭 복사할 수 있는 하나의 마크다운 코드 블록(\`\`\`) 내에 표기하라)
  1) [외부 검색, UI 코드 반영 및 NPC 지식 검증 보고]: 이번 턴에 등장/변화한 인물·세력·아이템의 원작 팩트체크 요약, Class(A/B/C) 판정, **[실시간 UI 코드 반영 상태: WorldInfoModal.tsx 등에 X인물/Y세력 추가 완료 또는 변화 없음]** 및 **[NPC 메타 지식 누출 여부: 이상 없음 (미조우 인물 미인지 상태 준수)]** 명시.
  2) [활성화된 미회수 복선 씨앗]: (현재 강호에 뿌려진 힌트/복선 중 미회수된 핵심 요소 1~3개 명시)
  3) [카메라 밖 강호 정세 자율 변동]: (원작 정사를 훼손하지 않는 선에서 주인공의 동선 밖 타 지역/세력에서 독자적으로 일어난 은밀한 물밑 정세 변화 1줄 요약 - 본문 NPC 인지 불가/순수 시스템 기록용)
  4) [진행 및 예정 챕터 현황]: 현 챕터 및 향후 3개 예정 챕터 간략 요약 및 인물 위치.
  5) [주인공 스탯 및 소장품]: 불변/변화 스탯 및 소장품 전체.
  6) [DC 누적 통계 관리]: 지금까지 사용된 목표 DC(5~15) 누적 분포 현황 기록 및 균등 유지를 위한 이번 턴 DC 배정 사유.
  7) [개연성/맥락 준수 선언]: 실제 외부 검색을 통해 개연성에 관련된 모든 검색 및 정사와 현재 서사와의 대조를 했을 경우에만 "인터넷 검색을 통해 시대, 인물, 사건 맥락을 철저히 대조 완료했습니다." 선언 후 본 서사 작성. (미실행 시 "내부 데이터로만 대조했습니다" 선언)
15. [기억 한계 감지 및 무손실 세이브 패키지 자동 발급 프로토콜]
• 대화 기록 누적으로 기억 한계(토큰 용량) 도달 감지 시 또는 세션 전환 시, 서사 서술 직후 하단에 [세이브 및 새 세션 전환 알림]과 종합 세이브 데이터 패키지를 원클릭 복사할 수 있는 독립된 마크다운 코드 블록(\`\`\`)으로 출력한다.
• 세이브 데이터 작성 시 핵심 계승 필수 6대 요소: 
A. [주인공 상태 및 스탯]: 이름, 나이, 능력치(스탯), 소장품, 현재 위치 및 신분, [출신 및 집안, 성장과정, 현재 목표와 이유, 형성된 인간관계망, 지금까지 겪은 일대기(연표)].
B. [원작 및 오리지널 인물(OC) 상태망]: 
▪ 등장한 원작 인물의 현 상태, 동선, Class 판정 및 서사 조우 후 형성된 주관적 생각(💭, 미조우 시 [미인지 상태]).
▪ 등록된 조연급 이상 오리지널 인물(OC)의 [이름, 별호, 출신/집안, 배경, 무학 능력, 가치관/성격, 주인공에 대한 실제 심경(미조우 시 [미인지 상태]), 관계 등급].
C. [현재 시점 강호 정보 한계선 (범용 분류)]: 
▪ [세간 공표 정보]: 강호 저자거리에 이미 소문으로 널리 퍼진 공개 사실 목록.
▪ [미공개 기밀 정보]: 특정 세력/당사자만 알고 있어 일반 무림인에게 유출되어서는 안 되는 비공개 사건 및 은폐 정체 목록.
D. [활성화된 미회수 복선 씨앗 및 카메라 밖 강호 정세]: 현재 강호에 뿌려진 힌트/복선(최대 3개) 및 타 지역/세력의 물밑 정세 누적 상태.
E. [DC 누적 통계 계승]: 지금까지 사용된 목표 DC(5~15) 누적 분포 현황 기록(균등 분포 유지용).
F. [서사 진행 줄거리 및 예정 챕터]: 지금까지 진행된 핵심 줄거리(3~5줄) 및 향후 3개 예정 챕터.

16. [독립 세션 복원, CSPRNG 난수 및 자유 프롬프트 보장 프로토콜 (세션 최초 1회 작동 후 서사 간섭 0% 비활성화)]
• [새 세션 무손실 로드 및 서사 즉시 재개]: 새 세션 시작 시 AI GM은 플레이어가 우측 앱 UI의 [클라우드 동기화 -> 코드로 불러오기]를 실행하거나 15번 세이브 패키지 텍스트를 입력하면: 
A. 이전 세션의 서사 흐름, 복선, 인물 심리, DC 통계 및 주인공의 내력/목표/인간관계/일대기 데이터를 즉시 메모리에 적재한다.
B. 원작 및 오리지널 인물 정보(미조우 인물의 미인지 상태 포함)를 UI 인물창(WorldInfoModal.tsx)에 실시간으로 즉시 복원·동기화한다.
C. 불필요한 인트로를 생략하고 이전 세션의 마지막 시간대와 사건 긴장감을 그대로 이어받아 곧바로 다음 턴 서사와 선택지(또는 DC 판정 요구)를 출력한다.
• [프리뷰 UI 자유 프롬프트 입력창 지정]: 프리뷰 앱 UI 하단의 입력 칸은 단순 주인공 행동 입력용이 아닌 '자유 프롬프트 입력창(General Prompt Input)'으로 동작한다. 인물 행동 외에도 시스템 질의, 서사 방향 지시, 연출 요청, 메타 질문 등 모든 형태의 프롬프트를 제한 없이 수용하고 반응하라.
• [암호학적 안전 난수(CSPRNG) 주사위 로직 보장]: 프리뷰 앱 UI의 모든 주사위 롤러 로직은 Math.random() 대신 웹 브라우저의 window.crypto.getRandomValues()를 사용하는 암호학적 안전 난수(CSPRNG - rollCryptoDie)로 구동된다.
• [서사 간섭 0% 완전 격리]: 저장 데이터가 불러와진 이후부터 본 16번 항목은 완전히 비활성화(무시)되며, 본문의 서사 묘사, 대사, 전투, 주사위 판정 등 서사 및 문학적 표현에는 0.1%의 영향도 주지 않는다.

[[[[개 혐스러운 웹소설식 진행과 서술 원천 금지한다. 서술 생성 중 웹소설식 표현과 상황, 주인공이 초능력자인 양 모든 것을 다 알고 간파하는 혐오스럽고 병신같은 상황 연출이 진행되면 오류메시지를 뿜고 다시 개연성을 최우선하여 리테콘해라]]]]
`;

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();

// Vercel / Local 모두 JSON body 사용
app.use(
  express.json({
    limit: '10mb',
  })
);

// URL encoded body도 허용
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  })
);

// ============================================================
// BASIC REQUEST INFO
// ============================================================

app.disable('x-powered-by');

// ============================================================
// BASIC HEALTH CHECK
// ============================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    engine: 'High-Fidelity TRPG Engine 3.1',
    model: 'gemini-3.7-flash',
    thinkingBudget: 4096,
    runtime: process.env.VERCEL
      ? 'vercel'
      : 'local',
    time: new Date().toISOString(),
  });
});

// ============================================================
// ROOT HEALTH / DEBUG
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    engine: 'High-Fidelity TRPG Engine 3.1',
    runtime: process.env.VERCEL
      ? 'vercel'
      : 'local',
    time: new Date().toISOString(),
  });
});

// ============================================================
// METRICS
// ============================================================

app.get('/api/metrics', (req, res) => {
  res.status(200).json({
    totalCalls: callMetrics.length,
    metrics: callMetrics.slice(-100),
  });
});

// ============================================================
// META PRESET GENERATOR
// ============================================================

app.post(
  '/api/generate-meta-presets',
  async (req, res) => {
    const startTime = Date.now();

    const requestId =
      `req_preset_${Date.now()}_` +
      Math.random()
        .toString(36)
        .substring(2, 6);

    try {
      const {
        worldName,
        genre,
        mode,
        worldDetails,
      } = req.body;

      const ai = getAIClient();

      const prompt = `
당신은 최고 수준의 TRPG 세계관 및 메타 엘리먼트 설계자입니다.

세계관 정보:
- 세계/원작 이름: ${worldName || '정통 무협 강호'}
- 장르: ${genre || '정통 무협'}
- 모드: ${mode || 'popular_genre'}
- 상세 설명: ${
        worldDetails ||
        '자유롭고 입체적인 무협 세계'
      }

이 세계관에 완벽하게 어울리는 5개 메타 엘리먼트 각각에 대해
4~5개씩 총 20개 내외의 흥미롭고 서사적 깊이가 깊은 프리셋 옵션을
JSON 형식으로 생성하세요.

반드시 아래 JSON 스키마를 따르세요:

{
  "backgrounds": [
    { "title": "...", "description": "..." }
  ],
  "flaws": [
    { "title": "...", "description": "..." }
  ],
  "oaths": [
    { "title": "...", "description": "..." }
  ],
  "anchors": [
    { "title": "...", "description": "..." }
  ],
  "factions": [
    { "title": "...", "description": "..." }
  ]
}
`;

      const response =
        await ai.models.generateContent({
          model: 'gemini-3.7-flash',

          contents: prompt,

          config: {
            systemInstruction:
              '당신은 TRPG 세계관 및 캐릭터 서사 설계 보조 AI입니다. 사용자가 제시한 세계관에 완벽히 부합하는 5대 메타 엘리먼트 프리셋을 한국어로 생성하여 순수 JSON으로만 출력하세요.',

            responseMimeType:
              'application/json',

            temperature: 0.8,

            thinkingConfig: {
              thinkingBudget: 4096,
            },
          },
        });

      const parsed = JSON.parse(
        response.text || '{}'
      );

      const latencyMs =
        Date.now() - startTime;

      callMetrics.push({
        requestId,
        endpoint:
          '/api/generate-meta-presets',
        timestamp: startTime,
        model: 'gemini-3.7-flash',
        metaElementsPresent: true,
        worldInfoPresent: true,
        groundingEnabled: false,
        success: true,
        latencyMs,
      });

      console.log(
        `[GEMINI_CALL] ${requestId} | ` +
        `/api/generate-meta-presets | ` +
        `Latency: ${latencyMs}ms | ` +
        `Success: true`
      );

      return res.status(200).json(parsed);
    } catch (err: any) {
      const latencyMs =
        Date.now() - startTime;

      callMetrics.push({
        requestId,
        endpoint:
          '/api/generate-meta-presets',
        timestamp: startTime,
        model: 'gemini-3.7-flash',
        metaElementsPresent: true,
        worldInfoPresent: true,
        groundingEnabled: false,
        success: false,
        latencyMs,
        errorStatus:
          err?.status || 500,
        errorMessage:
          err?.message ||
          'Error generating meta presets',
      });

      console.error(
        `[GEMINI_ERROR] ${requestId} | ` +
        `/api/generate-meta-presets | ` +
        `Status: ${err?.status || 500} | ` +
        `Msg: ${err?.message}`
      );

      return res.status(200).json({
        backgrounds: [
          {
            title: '몰락한 명문세가의 후예',
            description:
              '가문이 멸문당하고 유일하게 가문의 비급 조각을 지닌 채 살아남음',
          },
          {
            title: '은둔 기인의 수제자',
            description:
              '심산유곡에서 사부의 비전을 십수 년간 연마하고 갓 강호에 출도함',
          },
          {
            title: '저자거리 낭인 협객',
            description:
              '어릴 적부터 거친 저자거리를 떠돌며 실전 생존 무예를 터득함',
          },
          {
            title: '도관의 파문된 제자',
            description:
              '도문의 규율을 어겨 파문당했으나 깊은 도가 무학의 기초를 체화함',
          },
        ],

        flaws: [
          {
            title: '핏빛 주화입마의 잔재',
            description:
              '체내에 갈무리되지 않은 내력의 역류로 극한의 상황에서 기혈이 뒤틀림',
          },
          {
            title: '신뢰의 트라우마',
            description:
              '과거 가장 믿었던 동료의 배신으로 타인에게 온전히 등을 맡기지 못함',
          },
          {
            title: '가문 원수에 대한 맹목적 집착',
            description:
              '원수와 관련된 단서를 접하면 이성을 잃고 무모해짐',
          },
          {
            title: '의협심의 멍에',
            description:
              '눈앞의 불의를 지나치지 못해 자신과 동료를 곤경에 빠뜨림',
          },
        ],

        oaths: [
          {
            title:
              '위국위민의 대협 (爲國爲民)',
            description:
              '약자를 구하고 천하의 정의를 세우기 위해 검을 쓴다는 신념',
          },
          {
            title:
              '은원은 천 배로 갚는다 (恩怨分明)',
            description:
              '입은 은혜는 반드시 보답하고, 받은 원한은 피로 갚는다는 철칙',
          },
          {
            title: '천하제일인의 도달',
            description:
              '세상의 모든 절정고수를 꺾고 무학의 극의를 확인하겠다는 열망',
          },
          {
            title: '평온한 안식처의 수호',
            description:
              '자신과 소중한 사람들이 살아갈 작은 터전을 외압으로부터 지키겠다는 맹세',
          },
        ],

        anchors: [
          {
            title: '사부가 남긴 부러진 목검',
            description:
              '초심을 잃거나 공포에 질릴 때 쥐어보는 유품',
          },
          {
            title: '어린 날의 유일한 벗과의 약속',
            description:
              '언젠가 천하의 중심에서 다시 만나자던 어릴 적 맹세',
          },
          {
            title: '어머니의 낡은 옥패',
            description:
              '자신의 뿌리를 상기시켜 주는 유일한 가문의 흔적',
          },
          {
            title: '술 한 잔과 강호의 풍류',
            description:
              '생사의 갈림길에서도 마음의 여유를 잃지 않게 해주는 여유',
          },
        ],

        factions: [
          {
            title:
              '구파일방 (정파 무림맹)',
            description:
              '강호의 정통성과 대의를 중시하는 중원 정파의 연합',
          },
          {
            title:
              '사파 십팔채 (녹림/장강)',
            description:
              '규율에 얽매이지 않고 실리와 힘으로 움직이는 세력',
          },
          {
            title:
              '천마신교 (마교)',
            description:
              '절대적인 힘과 약육강식을 숭상하는 외세 무림',
          },
          {
            title:
              '강호 무소속 협객련',
            description:
              '문파의 이익 다툼에 휘둘리지 않는 자유로운 낭인들의 연대',
          },
        ],
      });
    }
  }
);

// ============================================================
// MAIN CHAT / AI GM
// ============================================================

app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();

  const requestId =
    `req_chat_${Date.now()}_` +
    Math.random()
      .toString(36)
      .substring(2, 6);

  const {
    messages = [],
    worldInfo,
    character,
    dcRecords = [],
    currentTurn = 1,
    playerInput,
    promptType = 'action',
    diceRoll,
  } = req.body;

  const isGroundingEnabled = false;

  const bg =
    character?.metaElements?.background;

  const flaw =
    character?.metaElements?.flaw;

  const oath =
    character?.metaElements?.oath;

  const anchor =
    character?.metaElements?.anchor;

  const faction =
    character?.metaElements?.faction;

  const metaPresent =
    Boolean(
      bg?.title &&
      flaw?.title &&
      oath?.title &&
      anchor?.title &&
      faction?.title
    );

  console.log(
    `[META_STATE] Turn ${currentTurn} | ` +
    `BG: ${bg?.title ? 'present' : 'missing'} | ` +
    `Flaw: ${flaw?.title ? 'present' : 'missing'} | ` +
    `Oath: ${oath?.title ? 'present' : 'missing'} | ` +
    `Anchor: ${anchor?.title ? 'present' : 'missing'} | ` +
    `Faction: ${faction?.title ? 'present' : 'missing'}`
  );

  try {
    const ai = getAIClient();

    // --------------------------------------------------------
    // Dynamic Token Diet
    // --------------------------------------------------------

    const verbatimWindowSize = 20;

    let olderSummaryPacket = '';

    if (
      messages.length >
      verbatimWindowSize
    ) {
      const olderMessages =
        messages.slice(
          0,
          messages.length -
            verbatimWindowSize
        );

      const olderSnippets =
        olderMessages
          .slice(-10)
          .map(
            (m: any) =>
              `[${m.sender === 'player' ||
                m.role === 'user'
                ? '플레이어'
                : 'AI GM'}]: ${
                (m.content || '')
                  .slice(0, 150)
              }...`
          )
          .join('\n');

      olderSummaryPacket =
        `[Previous Narrative Summary Packet - 이전 서사 누적 요약]
- 현재 턴: ${currentTurn}
- 이전 진행 요약:
${olderSnippets}
- 현재 주인공 위치: ${
          character?.location ||
          worldInfo?.currentLocation ||
          '강호'
        }
- 현재 챕터: ${
          worldInfo?.chapters
            ?.currentChapter ||
          '제1장'
        }
- 이전 누적 복선 씨앗: ${
          (worldInfo?.seeds || [])
            .map(
              (s: any) =>
                s.title
            )
            .join(', ') ||
          '없음'
        }
- 이전 카메라 밖 정세: ${
          (worldInfo?.offCameraEvents ||
            [])
            .slice(-2)
            .join(' / ') ||
          '특이사항 없음'
        }`;
    }

    const recentMessages =
      messages.slice(
        -verbatimWindowSize
      );

    // --------------------------------------------------------
    // Gemini Contents
    // --------------------------------------------------------

    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{
        text: string;
      }>;
    }> = [];

    const contextPacket =
      `[현재 TRPG 세션 상태 및 인물 프로필]
- 세계관/원작: ${
        worldInfo?.worldName ||
        '정통 무협'
      } (${
        worldInfo?.genre ||
        'Wuxia'
      })
- 현재 위치: ${
        character?.location ||
        worldInfo?.currentLocation ||
        '미상'
      }
- 챕터: ${
        worldInfo?.chapters
          ?.currentChapter ||
        '제1장'
      }
- 주인공 성명: ${
        character?.name ||
        '미상'
      } (${
        character?.title
          ? `별호: ${character.title}, `
          : ''
      }${
        character?.age ??
        '미상'
      }세, ${
        character?.gender ||
        '미상'
      })
- 외모 및 특징: ${
        character?.appearance ||
        '검소한 옷차림'
      }
- 능력치(스탯): ${
        JSON.stringify(
          character?.stats ||
          {}
        )
      }
- [주인공 5대 메타 엘리먼트 및 영구 인과 닻 (PLAYER 5 META-ELEMENTS)]
  * 출신/배경 (Background) [${
    bg?.type ||
    '기본'
  }]: ${
    bg?.title ||
    '미상'
  } - ${
    bg?.description ||
    '상세 없음'
  }
  * 결핍/약점 (Flaw) [${
    flaw?.type ||
    '기본'
  }]: ${
    flaw?.title ||
    '미상'
  } - ${
    flaw?.description ||
    '상세 없음'
  }
  * 맹세/신념 (Oath) [${
    oath?.type ||
    '기본'
  }]: ${
    oath?.title ||
    '미상'
  } - ${
    oath?.description ||
    '상세 없음'
  }
  * 심리적 닻 (Anchor) [${
    anchor?.type ||
    '기본'
  }]: ${
    anchor?.title ||
    '미상'
  } - ${
    anchor?.description ||
    '상세 없음'
  }
  * 소속 세력 (Faction) [${
    faction?.type ||
    '기본'
  }]: ${
    faction?.title ||
    '미상'
  } - ${
    faction?.description ||
    '상세 없음'
  }
- 소장품(인벤토리): ${
        (character?.inventory ||
          [])
          .map(
            (i: any) =>
              `${i.name}(${i.quantity})`
          )
          .join(', ') ||
        '기본 의복 및 여비'
      }
- 등록된 등장인물(NPC/OC): ${
        (worldInfo?.npcs ||
          [])
          .map(
            (n: any) =>
              `${n.name}(${n.classRating}, 관계: ${n.relationship})`
          )
          .join(', ') ||
        '없음'
      }
- 활성화된 복선: ${
        (worldInfo?.seeds ||
          [])
          .map(
            (s: any) =>
              s.title
          )
          .join(', ') ||
        '없음'
      }
- 지금까지 사용된 목표 DC 기록: ${
        dcRecords.length > 0
          ? dcRecords
              .slice(-5)
              .map(
                (r: any) =>
                  `DC${r.targetDC}(${r.outcome})`
              )
              .join(', ')
          : '없음'
      }`;

    if (olderSummaryPacket) {
      contents.push({
        role: 'user',
        parts: [
          {
            text:
              `${contextPacket}\n\n${olderSummaryPacket}`,
          },
        ],
      });

      contents.push({
        role: 'model',
        parts: [
          {
            text:
              '이전 서사의 인과와 맥락, 인물 심경 및 복선 상태를 계승하여 서사를 이어나갑니다.',
          },
        ],
      });
    } else {
      contents.push({
        role: 'user',
        parts: [
          {
            text: contextPacket,
          },
        ],
      });

      contents.push({
        role: 'model',
        parts: [
          {
            text:
              '세계관 설정과 주인공의 5대 메타 엘리먼트 및 정체성을 파악했습니다. 격조 높은 정통 문학 서사를 전개합니다.',
          },
        ],
      });
    }

    // --------------------------------------------------------
    // Recent Messages
    // --------------------------------------------------------

    for (
      const msg of recentMessages
    ) {
      contents.push({
        role:
          msg.sender === 'player' ||
          msg.role === 'user'
            ? 'user'
            : 'model',

        parts: [
          {
            text:
              msg.rawContent ||
              msg.content ||
              '',
          },
        ],
      });
    }

    // --------------------------------------------------------
    // Current Turn
    // --------------------------------------------------------

    let currentTurnPrompt =
      playerInput || '';

    if (diceRoll) {
      currentTurnPrompt =
        `[플레이어 주사위 투척 선언: ` +
        `D${diceRoll.sides} 굴림 = ` +
        `순수 눈금 ${diceRoll.rawRoll}, ` +
        `보정치 +${diceRoll.modifier}, ` +
        `최종 합계 ${diceRoll.total}` +
        `${
          diceRoll.targetDC
            ? `, 목표 DC: ${diceRoll.targetDC} -> 판정 결과: ${diceRoll.outcomeLabel}`
            : ''
        }]\n\n${
          playerInput || ''
        }`;
    }

    if (
      currentTurnPrompt &&
      (
        !recentMessages.length ||
        recentMessages[
          recentMessages.length - 1
        ].content !==
          currentTurnPrompt
      )
    ) {
      contents.push({
        role: 'user',
        parts: [
          {
            text:
              currentTurnPrompt,
          },
        ],
      });
    }

    // --------------------------------------------------------
    // Gemini Configuration
    // --------------------------------------------------------

    const generateConfig: any = {
      systemInstruction:
        MASTER_SYSTEM_INSTRUCTION,

      temperature: 0.85,

      thinkingConfig: {
        thinkingBudget: 4096,
      },
    };

    if (
      isGroundingEnabled
    ) {
      generateConfig.tools = [
        {
          googleSearch: {},
        },
      ];
    }

    // --------------------------------------------------------
    // Gemini Call
    // --------------------------------------------------------

    const response =
      await ai.models.generateContent({
        model:
          'gemini-3.7-flash',

        contents:
          contents as any,

        config:
          generateConfig,
      });

    const fullOutput =
      response.text || '';

    const latencyMs =
      Date.now() -
      startTime;

    callMetrics.push({
      requestId,

      endpoint:
        '/api/chat',

      timestamp:
        startTime,

      model:
        'gemini-3.7-flash',

      turnNumber:
        currentTurn,

      metaElementsPresent:
        metaPresent,

      worldInfoPresent:
        Boolean(
          worldInfo?.worldName
        ),

      groundingEnabled:
        isGroundingEnabled,

      success:
        true,

      latencyMs,
    });

    console.log(
      `[GEMINI_CALL] ${requestId} | ` +
      `Turn: ${currentTurn} | ` +
      `Latency: ${latencyMs}ms | ` +
      `Grounding: ${isGroundingEnabled} | ` +
      `Success: true`
    );

    return res.status(200).json({
      success: true,

      rawResponse:
        fullOutput,

      narrativeProse:
        fullOutput,

      reply:
        fullOutput,

      turnNumber:
        currentTurn,
    });
  } catch (err: any) {
    const latencyMs =
      Date.now() -
      startTime;

    callMetrics.push({
      requestId,

      endpoint:
        '/api/chat',

      timestamp:
        startTime,

      model:
        'gemini-3.7-flash',

      turnNumber:
        currentTurn,

      metaElementsPresent:
        metaPresent,

      worldInfoPresent:
        Boolean(
          worldInfo?.worldName
        ),

      groundingEnabled:
        isGroundingEnabled,

      success:
        false,

      latencyMs,

      errorStatus:
        err?.status ||
        500,

      errorMessage:
        err?.message ||
        'AI GM error',
    });

    console.error(
      `[GEMINI_ERROR] ${requestId} | ` +
      `Turn: ${currentTurn} | ` +
      `Status: ${err?.status || 500} | ` +
      `Msg: ${err?.message}`
    );

    return res.status(500).json({
      success: false,

      error:
        err?.message ||
        'AI GM 서버 통신 중 오류가 발생했습니다.',
    });
  }
});

// ============================================================
// CLOUD SAVE
// ============================================================

app.post(
  '/api/cloud-save',
  (req, res) => {
    try {
      const {
        sessionData,
      } = req.body;

      if (!sessionData) {
        return res.status(400).json({
          error:
            'Session data is required',
        });
      }

      const chars =
        '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

      let syncCode = '';

      for (
        let i = 0;
        i < 6;
        i++
      ) {
        syncCode +=
          chars.charAt(
            Math.floor(
              Math.random() *
                chars.length
            )
          );
      }

      syncCode =
        syncCode.toUpperCase();

      cloudStorage.set(
        syncCode,
        {
          syncCode,
          data:
            sessionData,
          createdAt:
            Date.now(),
        }
      );

      return res.status(200).json({
        success:
          true,

        syncCode,

        savedAt:
          Date.now(),
      });
    } catch (err: any) {
      return res.status(500).json({
        error:
          err?.message ||
          'Failed to save to cloud',
      });
    }
  }
);

// ============================================================
// CLOUD LOAD
// ============================================================

app.get(
  '/api/cloud-load/:code',
  (req, res) => {
    try {
      const code =
        (
          req.params.code ||
          ''
        )
          .trim()
          .toUpperCase();

      const entry =
        cloudStorage.get(
          code
        );

      if (!entry) {
        return res.status(404).json({
          error:
            `동기화 코드 [${code}]에 해당하는 세션을 찾을 수 없습니다. 코드를 다시 확인해 주세요.`,
        });
      }

      return res.status(200).json({
        success:
          true,

        syncCode:
          entry.syncCode,

        data:
          entry.data,

        createdAt:
          entry.createdAt,
      });
    } catch (err: any) {
      return res.status(500).json({
        error:
          err?.message ||
          'Failed to load from cloud',
      });
    }
  }
);

// ============================================================
// 404 API HANDLER
// ============================================================

app.use(
  '/api',
  (req, res) => {
    res.status(404).json({
      success: false,
      error:
        'API endpoint not found',
      path: req.path,
      method: req.method,
    });
  }
);

// ============================================================
// LOCAL VITE / PRODUCTION STATIC SERVER
// ============================================================

async function startServer() {
  // ----------------------------------------------------------
  // VERCEL
  // ----------------------------------------------------------

  if (process.env.VERCEL) {
    return;
  }

  // ----------------------------------------------------------
  // LOCAL DEVELOPMENT
  // ----------------------------------------------------------

  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const {
      createServer:
        createViteServer,
    } = await import('vite');

    const vite =
      await createViteServer({
        server: {
          middlewareMode:
            true,
        },

        appType:
          'spa',
      });

    app.use(
      vite.middlewares
    );
  }

  // ----------------------------------------------------------
  // LOCAL PRODUCTION
  // ----------------------------------------------------------

  else {
    const distPath =
      path.join(
        process.cwd(),
        'dist'
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      '*',
      (req, res) => {
        res.sendFile(
          path.join(
            distPath,
            'index.html'
          )
        );
      }
    );
  }

  // ----------------------------------------------------------
  // LOCAL LISTEN
  // ----------------------------------------------------------

  app.listen(
    Number(
      process.env.PORT || 3000
    ),
    '0.0.0.0',
    () => {
      console.log(
        `TRPG Engine & Web Player server running on http://0.0.0.0:${Number(
          process.env.PORT || 3000
        )}`
      );
    }
  );
}

// ============================================================
// VERCEL ENTRYPOINT
// ============================================================

export default app;

// ============================================================
// LOCAL ENTRYPOINT
// ============================================================

if (!process.env.VERCEL) {
  startServer().catch(
    (error) => {
      console.error(
        'Failed to start local server:',
        error
      );

      process.exit(1);
    }
  );
}
