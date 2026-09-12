'use strict';

/* =============================================
   INSTRUMENTS
   ============================================= */
const INSTRUMENTS = [
    { id: 'AAPL', name: 'Apple', fullName: 'Apple Inc.', sector: 'Magnificent 7', emoji: '🍎', type: 'mag7', dividendHistory: { 2015: 0.49, 2016: 0.57, 2017: 0.61, 2018: 0.70, 2019: 0.76, 2020: 0.81, 2021: 0.86, 2022: 0.91, 2023: 0.95, 2024: 0.99 } },
    { id: 'MSFT', name: 'Microsoft', fullName: 'Microsoft Corp.', sector: 'Magnificent 7', emoji: '🪟', type: 'mag7', dividendHistory: { 2015: 1.29, 2016: 1.47, 2017: 1.59, 2018: 1.72, 2019: 1.89, 2020: 2.09, 2021: 2.30, 2022: 2.54, 2023: 2.79, 2024: 3.08 } },
    { id: 'GOOGL', name: 'Alphabet', fullName: 'Alphabet Inc.', sector: 'Magnificent 7', emoji: '🔍', type: 'mag7', dividendHistory: { 2024: 0.80 } },
    { id: 'AMZN', name: 'Amazon', fullName: 'Amazon.com Inc.', sector: 'Magnificent 7', emoji: '📦', type: 'mag7', dividendHistory: {} },
    { id: 'META', name: 'Meta', fullName: 'Meta Platforms Inc.', sector: 'Magnificent 7', emoji: '🦋', type: 'mag7', dividendHistory: { 2024: 2.00 } },
    { id: 'NVDA', name: 'NVIDIA', fullName: 'NVIDIA Corp.', sector: 'Magnificent 7', emoji: '🎮', type: 'mag7', dividendHistory: { 2015: 0.39, 2016: 0.48, 2017: 0.56, 2018: 0.60, 2019: 0.64, 2020: 0.64, 2021: 0.16, 2022: 0.16, 2023: 0.16, 2024: 0.04 } },
    { id: 'TSLA', name: 'Tesla', fullName: 'Tesla Inc.', sector: 'Magnificent 7', emoji: '⚡', type: 'mag7', dividendHistory: {} },
    { id: 'SOXL', name: 'SOXL', fullName: '半導体株 3倍ブルETF', sector: 'レバレッジETF', emoji: '🔥', type: 'etf', dividendHistory: { 2015: 0.05, 2016: 0.08, 2017: 0.12, 2018: 0.20, 2019: 0.15, 2020: 0.12, 2021: 0.18, 2022: 0.35, 2023: 0.45, 2024: 0.55 } },
    { id: 'TQQQ', name: 'TQQQ', fullName: 'Nasdaq100 3倍ブルETF', sector: 'レバレッジETF', emoji: '🚀', type: 'etf', dividendHistory: { 2015: 0.02, 2016: 0.03, 2017: 0.05, 2018: 0.10, 2019: 0.15, 2020: 0.18, 2021: 0.25, 2022: 0.35, 2023: 0.45, 2024: 0.30 } },
    { id: 'QQQ', name: 'QQQ', fullName: 'Nasdaq-100 ETF', sector: 'インデックスETF', emoji: '📊', type: 'index', dividendHistory: { 2015: 1.37, 2016: 1.49, 2017: 1.30, 2018: 1.41, 2019: 1.58, 2020: 1.73, 2021: 1.69, 2022: 2.14, 2023: 2.32, 2024: 2.84 } },
];

const GLOBAL_QUARTERLY_DATA = {
    // 2015(Q1-Q4), 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025(Q1)
    // Values are roughly split-adjusted closing prices (USD)
    AAPL: [30, 31, 27, 25, 27, 23, 28, 28, 35, 36, 38, 42, 41, 46, 55, 39, 47, 49, 56, 73, 76, 91, 115, 132, 122, 136, 141, 177, 174, 136, 138, 129, 164, 193, 171, 192, 171, 210, 233, 227, 230],
    MSFT: [40, 44, 44, 55, 50, 51, 57, 62, 65, 69, 74, 85, 91, 98, 114, 101, 117, 133, 139, 157, 158, 203, 210, 222, 235, 270, 281, 336, 308, 256, 232, 239, 288, 340, 315, 376, 420, 446, 430, 403, 410],
    GOOGL: [27, 26, 30, 38, 37, 34, 40, 39, 41, 46, 48, 52, 51, 56, 60, 52, 59, 54, 61, 66, 58, 70, 88, 87, 103, 125, 133, 144, 139, 109, 95, 88, 103, 119, 130, 139, 150, 182, 166, 175, 180],
    AMZN: [18, 21, 25, 33, 29, 35, 41, 37, 44, 48, 47, 58, 72, 84, 100, 75, 89, 94, 86, 92, 97, 137, 157, 162, 154, 172, 164, 166, 162, 106, 113, 84, 102, 130, 127, 151, 180, 193, 186, 188, 200],
    META: [82, 85, 89, 104, 114, 114, 128, 115, 142, 150, 170, 176, 159, 194, 164, 131, 166, 193, 178, 205, 166, 235, 261, 273, 294, 347, 339, 336, 222, 161, 135, 120, 211, 286, 300, 353, 485, 504, 567, 584, 590],
    NVDA: [0.5, 0.5, 0.6, 0.8, 0.9, 1.1, 1.7, 2.6, 2.7, 3.8, 4.4, 4.8, 5.6, 5.6, 7.2, 3.3, 4.4, 4.0, 4.3, 5.8, 6.5, 9.5, 14, 13, 13, 20, 20, 29, 27, 15, 12, 14, 27, 42, 43, 49, 90, 123, 121, 138, 130],
    TSLA: [12, 17, 16, 16, 15, 14, 13, 14, 18, 24, 22, 20, 17, 22, 20, 14, 18, 27, 30, 73, 270, 235, 264, 226, 222, 258, 352, 313, 352, 224, 265, 123, 207, 261, 250, 248, 175, 197, 261, 350, 310],
    QQQ: [106, 107, 102, 111, 109, 107, 118, 118, 132, 141, 145, 156, 160, 171, 185, 154, 179, 187, 188, 212, 225, 247, 277, 313, 318, 354, 358, 397, 362, 298, 280, 266, 320, 370, 358, 409, 444, 480, 488, 510, 520],
    SOXL: [3, 4, 3, 3, 3, 4, 7, 11, 14, 22, 25, 34, 44, 40, 25, 11, 18, 15, 17, 26, 27, 45, 43, 64, 53, 45, 45, 72, 51, 21, 20, 12, 15, 26, 21, 31, 44, 58, 36, 25, 22],
    TQQQ: [5, 6, 5, 6, 6, 5, 8, 10, 13, 20, 23, 29, 39, 35, 21, 8, 16, 18, 18, 26, 27, 53, 56, 85, 81, 115, 110, 165, 137, 59, 57, 42, 22, 40, 34, 47, 58, 79, 64, 52, 55]
};

const USD_JPY_HISTORY = [
    // 2015 - 2025Q1 (41 points)
    119.5, 122.5, 120.2, 120.3, // 2015
    112.7, 102.9, 101.1, 116.9, // 2016
    111.4, 112.4, 112.5, 112.7, // 2017
    106.3, 110.7, 113.6, 109.6, // 2018
    110.8, 107.8, 108.1, 108.6, // 2019
    107.5, 107.9, 105.7, 103.3, // 2020
    110.6, 110.5, 111.5, 115.1, // 2021
    121.7, 135.7, 144.7, 132.3, // 2022
    133.0, 144.5, 149.3, 141.0, // 2023
    151.3, 160.8, 142.2, 152.0, // 2024
    150.0 // 2025 Q1
];

/* =============================================
   HISTORICAL PERIODS
   ============================================= */
const HISTORICAL_SPLITS = [
    { id: 'AAPL', date: '2020-08-31', ratio: 4 },
    { id: 'NVDA', date: '2021-07-20', ratio: 4 },
    { id: 'NVDA', date: '2024-06-10', ratio: 10 },
    { id: 'GOOGL', date: '2022-07-15', ratio: 20 },
    { id: 'AMZN', date: '2022-06-06', ratio: 20 },
    { id: 'TSLA', date: '2020-08-31', ratio: 5 },
    { id: 'TSLA', date: '2022-08-25', ratio: 3 },
    { id: 'SOXL', date: '2015-05-20', ratio: 4 },
    { id: 'SOXL', date: '2021-03-02', ratio: 15 },
    { id: 'TQQQ', date: '2017-01-12', ratio: 2 },
    { id: 'TQQQ', date: '2018-05-24', ratio: 3 },
    { id: 'TQQQ', date: '2021-01-21', ratio: 2 },
    { id: 'TQQQ', date: '2022-01-13', ratio: 2 },
];

const BOARD_HANDLES = [
    '勝ち組投資家', '損切りマン', '専業トレーダーK', '寝てたい', 'FIRE志望', '匿名希望@利確',
    '落ち目ハンター', '追証こわい', 'イナゴの王', '逆張り侍', '塩漬け王', '買い専の白',
    'ガチホ勢', '相場は友達', '億り人(予定)', 'ナンピン地獄'
];

const BOARD_TEMPLATES = {
    bull: [
        'ここから青天井！', '全力買い一択だわ', '乗り遅れるなよ、置いてくぞ', '祭りが始まったなw',
        '安すぎる。買い増し！', '今買わないでいつ買うの？', 'ガチホで余裕', 'ホルダーおめ！',
        'これ10倍行くやつだろ', '売り豚息してるかー？', 'もっと評価されるべき', '底を打ったな'
    ],
    bear: [
        '終わったな…', '逃げ遅れたやつ乙', '底ナシ沼で草', 'まだ売ってない奴いるの？',
        'もうダメぽ', '追証メールきたわ…', '買い煽り必死すぎw', '退場します、さようなら',
        '空売りでウマウマ', 'どこまで下がるんだこれ', '救いはないんですか？', '損切り一択'
    ],
    neutral: [
        '様子見かな', '嵐の前の静けさ', '相変わらずボラが激しい', 'しばらく横ばいそう',
        'どっちに行くか分からん', '指値にかからん', '昼寝してる間に上がってて', '今は休みも相場'
    ],
    era: {
        2020: ['給付金入ったしNVDA全力', 'コロナショックとか買い場すぎw', 'マスク会食より株よ'],
        2021: ['レバナス民だけど質問ある？', 'ダイヤモンドハンドで耐える', 'NFTとかバブルだな'],
        2022: ['利上げしんど…', '景気後退くるか？', 'インフレ止まらん'],
        2023: ['AI革命きたああ', 'ChatGPTすごすぎ', '半導体持たざるリスク'],
        2024: ['NVDA教に入信しました', '新NISAでオルカンよりマグ7でしょ', 'バブルじゃない、実力だ']
    },
    influencers: {
        powell: [
            'パウエルまた余計なことを…', '利上げ停止まだかよ', 'パウエル神信じてるぞ',
            'メガネ（パウエル）黙ってろw', '金利の神様にお祈りタイム', 'Higher for longer とか勘弁して'
        ],
        musk: [
            'またイーロンが呟いたぞw', 'テスラ損切りした瞬間にこれかよ', 'イーロン信じてガチホ一択',
            'CEOが売り抜けてて草', 'イーロン砲きたあああ', 'ドージコインの話してくれよ'
        ],
        trump: [
            'トランプ大統領期待で爆上げか？', '関税爆弾とかやめてくれよ', 'MAGA! MAGA!',
            'トランプなら株価2倍だろ', 'もしトラ（もしトランプになったら）を想定しろ', '壁を作る前に株価を上げてくれ'
        ]
    }
};

const HISTORICAL_PERIODS = [
    {
        id: 'bear2022',
        label: '2022年 弱気相場',
        subtitle: 'インフレ・FRB利上げショック（0→4.5%）',
        emoji: '📉',
        description: 'FRBが歴史的ペースで利上げ。NASDAQ -33%、一部テック株は-80%超の暴落。',
        startDate: '2022-01-03',
        tradingDays: 252,
        events: [
            { day: 20, text: 'FRB、3月の利上げを示唆。市場は動揺', type: 'negative' },
            { day: 42, text: 'ロシア、ウクライナに軍事侵攻。リスクオフ加速', type: 'negative' },
            { day: 80, text: 'FRB、0.25%の利上げを実施。22年ぶり', type: 'negative' },
            { day: 105, text: 'FRB、0.5%の大幅利上げ。インフレ抑制を最優先', type: 'negative' },
            { day: 120, text: 'CPI、前年比8.6%。40年ぶりの高インフレ', type: 'negative' },
            { day: 130, text: 'FRB、0.75%の大幅利上げ。1994年以来', type: 'negative' },
            { day: 175, text: 'インフレ鈍化の兆し。CPI伸び率が低下', type: 'positive' },
            { day: 200, text: 'FRB、利上げ終了時期を模索か。市場の期待', type: 'positive' },
            { day: 230, text: 'インフレ鈍化続く。年末に向け市場が小反発', type: 'positive' },
        ],
    },
    {
        id: 'bull2023',
        label: '2023年 AI相場',
        subtitle: 'ChatGPT・生成AI革命',
        emoji: '🚀',
        description: 'ChatGPTが世界を席巻。NVIDIAは年間+239%。NASDAQ100は+54%の歴史的強気相場。',
        startDate: '2023-01-03',
        tradingDays: 252,
        events: [
            { day: 15, text: 'Microsoft、OpenAIに100億ドル追加投資を発表', type: 'positive' },
            { day: 40, text: 'Googleがチャットボット「Bard」発表。AI競争激化', type: 'positive' },
            { day: 75, text: 'ChatGPT、月間ユーザー1億人突破。史上最速', type: 'positive' },
            { day: 100, text: 'NVIDIA Q1決算：売上が予想を大幅上回る。AI需要爆発', type: 'positive' },
            { day: 120, text: 'Meta、AI投資強化。コスト削減も奏功し株価急騰', type: 'positive' },
            { day: 145, text: 'FRB、利上げ一時停止を示唆。市場に安堵感', type: 'positive' },
            { day: 170, text: 'NVIDIA Q2決算：売上135億ドル、予想超えでAI株急騰', type: 'positive' },
            { day: 200, text: 'Fed、金利据え置き。利下げ期待が高まる', type: 'positive' },
            { day: 235, text: 'AAPL・MSFTが時価総額過去最高を更新', type: 'positive' },
        ],
    },
    {
        id: 'covid2020',
        label: '2020年 コロナショック',
        subtitle: 'V字回復と巣ごもり需要',
        emoji: '🦠',
        description: 'COVID-19が世界を席巻。市場は歴史的暴落(-34%)の後、テック株中心にV字回復。NASDAQ +85%。',
        startDate: '2020-01-02',
        tradingDays: 253,
        events: [
            { day: 20, text: 'WHO：新型コロナウイルスが世界的脅威と警告', type: 'negative' },
            { day: 38, text: 'コロナ感染が欧州・米国で急拡大。市場パニック売り', type: 'negative' },
            { day: 50, text: 'WHO、パンデミック宣言。S&P500は30日で34%暴落', type: 'negative' },
            { day: 55, text: 'FRB、緊急ゼロ金利・QE無制限を発動。市場が反発', type: 'positive' },
            { day: 62, text: '米国、2兆ドルの経済対策を可決。株価急反発', type: 'positive' },
            { day: 90, text: '巣ごもり需要でAmazon・Netflix急騰。テック株牽引', type: 'positive' },
            { day: 160, text: 'ワクチン開発が進展。ファイザー第3相試験へ', type: 'positive' },
            { day: 200, text: 'テック株が最高値更新。NASDAQ+50%超（安値比）', type: 'positive' },
            { day: 230, text: 'ファイザー・モデルナ、ワクチン緊急承認。経済正常化期待', type: 'positive' },
        ],
    },
    {
        id: 'longterm2015',
        label: '2015-2025 長期投資',
        subtitle: '歴史の荒波を乗り越える',
        emoji: '🏛️',
        description: 'チャイナショック、コロナ、AI革命、そしてLiberation Day。10年間の全歴史を通じて資産を築き上げよう。',
        startDate: '2015-01-02',
        tradingDays: 2583,
        events: [
            { day: 151, text: 'チャイナショック発生。上海市場が暴落', type: 'negative' },
            { day: 252, text: '2015年終了。激動の1年を経て市場は調整局面へ', type: 'neutral' },
            { day: 504, text: '2016年終了。トランプ大統領当選で市場に期待感', type: 'positive' },
            { day: 1008, text: '2018年終了。米中貿易摩擦で市場は冷え込み', type: 'negative' },
            { day: 1300, text: '2020年：パンデミック発生。未曾有の暴落と金融緩和', type: 'negative' },
            { day: 1764, text: '2021年：強気相場の絶頂。暗号資産やテック株が急騰', type: 'positive' },
            { day: 2016, text: '2022年：利上げショック。10年ぶりの弱気相場へ', type: 'negative' },
            { day: 2268, text: '2024年：Microsoft市場最高値。AI需要がテックを牽引', type: 'positive' },
            { day: 2350, text: 'NVDA 10対1の株式分割を実施。時価総額も世界首位へ', type: 'positive' },
            { day: 2450, text: 'Fed、4年ぶりの利下げを実施。強気相場が継続', type: 'positive' },
            { day: 2520, text: '2024年：トランプ氏が米大統領選で再選', type: 'neutral' },
            { day: 2560, text: '2025年 Q1：「解放の日」関税発表。市場に激震', type: 'negative' },
        ],
    },
];

/* =============================================
   GAME CONFIG
   ============================================= */
const INITIAL_CASH = 1_000_000; // ¥
const FEE_RATE = 0.001;
// 以前の固定レートは削除し、state.jpyRate を使用します
const CIRCUMFERENCE = 2 * Math.PI * 26;

let state = null;
let tickTimerId = null;
let selectedPeriodId = 'bear2022';
let selectedDuration = 5; // minutes

/* =============================================
   DATA INTERPOLATION
   12 monthly prices → N daily prices (linear)
   ============================================= */
function interpolate(monthly, totalDays) {
    const M = monthly.length;
    const result = [];
    if (M === 0) return result;
    if (M === 1) return new Array(totalDays).fill(monthly[0]);
    for (let d = 0; d < totalDays; d++) {
        const pos = (d / (totalDays - 1)) * (M - 1);
        const m0 = Math.floor(pos);
        const m1 = Math.min(m0 + 1, M - 1);
        const frac = pos - m0;
        result.push(+(monthly[m0] + frac * (monthly[m1] - monthly[m0])).toFixed(2));
    }
    return result;
}

/* =============================================
   TRADING DATE HELPER
   ============================================= */
function dateAfterTradingDays(startStr, n) {
    const d = new Date(startStr);
    let added = 0;
    while (added < n) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d;
}
function fmtDate(d) {
    return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
}
function fmtJPY(n) {
    if (isNaN(n)) return '¥0';
    return (n < 0 ? '-' : '') + '¥' + Math.abs(Math.floor(n)).toLocaleString();
}

function fmtUSD(n) {
    if (isNaN(n)) return '$0.00';
    return (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* =============================================
   GAME STATE
   ============================================= */
function createState(period, durationMin) {
    const dailyPrices = {};
    let startIndex = 0;

    // 2015-01-01 からの全日数を計算
    const startGlobal = new Date('2015-01-01');
    const startScenario = new Date(period.startDate);

    if (period.id === 'longterm2015') {
        startIndex = 0;
    } else {
        // 概算の営業日数 (1年=252日)
        const years = (startScenario.getFullYear() - 2015);
        const months = startScenario.getMonth();
        startIndex = Math.round(years * 252 + (months / 12) * 252);
    }

    const dailyAdjustedPrices = {}; // チャート用の修正株価
    const dailyNominalPrices = {};  // 取引用の名目株価

    INSTRUMENTS.forEach(inst => {
        const qData = GLOBAL_QUARTERLY_DATA[inst.id];
        const totalSimDays = qData.length * 63;
        const adj = interpolate(qData, totalSimDays);
        dailyAdjustedPrices[inst.id] = adj;

        // 名目価格の生成 (分割を逆算)
        let nom = [...adj];
        const relevantSplits = HISTORICAL_SPLITS
            .filter(s => s.id === inst.id)
            .map(s => ({
                day: Math.floor((new Date(s.date) - new Date('2015-01-02')) / (1000 * 60 * 60 * 24 * (365 / 252))),
                ratio: s.ratio
            }))
            .filter(s => s.day > 0 && s.day < totalSimDays)
            .sort((a, b) => b.day - a.day); // 未来から過去へ

        relevantSplits.forEach(split => {
            for (let i = 0; i < split.day; i++) {
                if (nom[i] !== undefined) nom[i] *= split.ratio;
            }
        });
        dailyNominalPrices[inst.id] = nom;
    });

    const stocks = INSTRUMENTS.map(inst => {
        const nom = dailyNominalPrices[inst.id];
        const adj = dailyAdjustedPrices[inst.id];
        return {
            ...inst,
            daily: nom,          // 取引値
            dailyAdjusted: adj,  // チャート用
            price: nom[startIndex],
            startPrice: nom[startIndex],
            prevPrice: nom[startIndex],
            history: [nom[startIndex]],
            changeAbs: 0,
            changePct: 0,
            holdings: 0,
            avgCost: 0,
            shortHoldings: 0,
            shortAvgCost: 0,
            dcaActive: false,
            dcaAmount: 100000, // デフォルト積立額 (¥)
        };
    });

    const tickMs = (durationMin * 60 * 1000) / period.tradingDays;

    return {
        period,
        durationMin,
        totalDays: period.tradingDays,
        currentDay: 0,
        startIndex,
        tickMs,
        cash: INITIAL_CASH,
        stocks,
        newsLog: [],
        pendingOrders: [],
        running: false,
        paused: false,
        totalSeconds: durationMin * 60,
        elapsed: 0,
        firedEvents: new Set(),
        jpyRate: USD_JPY_HISTORY[0],
        fxHistory: interpolate(USD_JPY_HISTORY, period.tradingDays + 1)
    };
}

/* =============================================
   PRICE UPDATE & ADVANCED FEATURES
   ============================================= */
function togglePause() {
    if (!state || !state.running) return;
    state.paused = !state.paused;
    const btn = document.getElementById('pause-btn');
    const icon = document.getElementById('pause-icon');
    if (state.paused) {
        clearInterval(tickTimerId);
        icon.textContent = '▶️';
        btn.classList.add('paused');
        showToast('相場を一時停止しました', 'info');
    } else {
        tickTimerId = setInterval(gameTick, state.tickMs);
        icon.textContent = '⏸️';
        btn.classList.remove('paused');
        showToast('相場を再開しました', 'success');
    }
}

function gameTick() {
    if (!state || !state.running) return;
    state.currentDay++;
    state.elapsed += state.tickMs / 1000;

    if (state.currentDay >= state.totalDays) { endGame(); return; }

    // --- 株式分割 (Stock Splits) ---
    state.stocks.forEach(stock => {
        const split = HISTORICAL_SPLITS.find(s => {
            if (s.id !== stock.id) return false;
            // 相対的な日付計算 (startDate からの日数)
            const splitDay = Math.floor((new Date(s.date) - new Date(state.period.startDate)) / (1000 * 60 * 60 * 24 * (365 / 252)));
            return splitDay === state.currentDay;
        });

        if (split) {
            const oldHoldings = stock.holdings;
            if (oldHoldings > 0) {
                stock.holdings *= split.ratio;
                stock.avgCost /= split.ratio;
            }
            // 指値注文の調整
            state.pendingOrders.forEach(order => {
                if (order.stockId === stock.id) {
                    order.targetPrice /= split.ratio;
                    order.qty *= split.ratio;
                }
            });
            addNews(`【株式分割】${stock.id} が 1:${split.ratio} の分割を実施`, 'positive');
            showToast(`${stock.id} が分割されました (株数 ${split.ratio}倍)`, 'success');
        }
    });

    // --- 配当金 (Dividends): 63営業日(約3ヶ月)ごとに実行 ---
    if (state.currentDay > 0 && state.currentDay % 63 === 0) {
        let totalDiv = 0;
        const currentYear = new Date(state.period.startDate).getFullYear() + Math.floor(state.currentDay / 252);

        state.stocks.forEach(stock => {
            if (stock.holdings > 0) {
                const inst = INSTRUMENTS.find(i => i.id === stock.id);
                const yearlyDiv = (inst.dividendHistory && inst.dividendHistory[currentYear]) || 0;
                if (yearlyDiv > 0) {
                    // 四半期配当 = 年間配当 / 4
                    const div = stock.holdings * (yearlyDiv / 4) * state.jpyRate;
                    totalDiv += div;
                }
            }
        });
        if (totalDiv > 0) {
            state.cash += totalDiv;
            addNews(`配当金受取: ${fmtJPY(totalDiv)}`, 'positive');
            showToast(`配当金 ${fmtJPY(totalDiv)} を受領しました`, 'success');
        }
    }

    // --- 積立投資 (DCA): 21営業日(約1ヶ月)ごとに実行 ---
    if (state.currentDay > 0 && state.currentDay % 21 === 0) {
        state.stocks.forEach(stock => {
            if (stock.dcaActive && stock.dcaAmount > 0) {
                const qty = Math.floor(stock.dcaAmount / (stock.price * state.jpyRate * (1 + FEE_RATE)));
                if (qty > 0) {
                    const cost = qty * stock.price * state.jpyRate * (1 + FEE_RATE);
                    if (state.cash >= cost) {
                        const prevTotal = stock.holdings * stock.avgCost;
                        stock.holdings += qty;
                        stock.avgCost = (prevTotal + qty * stock.price) / stock.holdings;
                        state.cash -= cost;
                        addNews(`自動積立: ${stock.id} を ${qty}株 購入`, 'positive');
                    } else {
                        addNews(`自動積立失敗: 現金不足 (${stock.id})`, 'negative');
                    }
                }
            }
        });
    }

    state.stocks.forEach(stock => {
        stock.prevPrice = stock.price;
        stock.price = stock.daily[state.startIndex + state.currentDay];
        stock.changeAbs = stock.price - stock.startPrice;
        stock.changePct = (stock.changeAbs / stock.startPrice) * 100;
        stock.history.push(stock.price);
        if (stock.history.length > 60) stock.history.shift();
    });

    // --- 指値注文のチェック (Limit Orders) ---
    if (state.pendingOrders.length > 0) {
        state.pendingOrders = state.pendingOrders.filter(order => {
            const stock = state.stocks.find(s => s.id === order.stockId);
            let triggered = false;

            if (order.mode === 'buy') {
                if (stock.price <= order.targetPrice) triggered = true;
            } else {
                if (stock.price >= order.targetPrice) triggered = true;
            }

            if (triggered) {
                const costOrProceeds = order.qty * stock.price * state.jpyRate * (order.mode === 'buy' ? (1 + FEE_RATE) : (1 - FEE_RATE));

                if (order.mode === 'buy') {
                    if (state.cash >= costOrProceeds) {
                        const prevTotal = stock.holdings * stock.avgCost;
                        stock.holdings += order.qty;
                        stock.avgCost = (prevTotal + order.qty * stock.price) / stock.holdings;
                        state.cash -= costOrProceeds;
                        addNews(`指値約定: ${stock.id} を ${order.qty}株 購入 ($${order.targetPrice.toFixed(2)}以下)基`, 'positive');
                        showToast(`${stock.id} の指値買いが約定しました`, 'success');
                        return false; // 削除
                    } else {
                        addNews(`指値失効: 現金不足 (${stock.id})`, 'negative');
                        return false; // 削除
                    }
                } else {
                    if (stock.holdings >= order.qty) {
                        const proceeds = order.qty * stock.price * state.jpyRate * (1 - FEE_RATE);
                        stock.holdings -= order.qty;
                        if (stock.holdings === 0) stock.avgCost = 0;
                        state.cash += proceeds;
                        addNews(`指値約定: ${stock.id} を ${order.qty}株 売却 ($${order.targetPrice.toFixed(2)}以上)`, 'positive');
                        showToast(`${stock.id} の指値売りが約定しました`, 'success');
                        return false; // 削除
                    } else {
                        addNews(`指値失効: 保有不足 (${stock.id})`, 'negative');
                        return false; // 削除
                    }
                }
            }
            return true; // 継続
        });
    }

    // --- 為替レート(USD/JPY)の更新 ---
    state.jpyRate = state.fxHistory[state.currentDay] || state.jpyRate;

    checkEvents();
    triggerBoardSentiment();
    renderAll();
}

function switchSideTab(tab) {
    document.querySelectorAll('.panel-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));

    if (tab === 'news') {
        document.querySelector('.panel-tab-btn[onclick*="news"]').classList.add('active');
        document.getElementById('news-panel').classList.remove('hidden');
    } else if (tab === 'board') {
        document.querySelector('.panel-tab-btn[onclick*="board"]').classList.add('active');
        document.getElementById('board-panel').classList.remove('hidden');
    } else if (tab === 'orders') {
        document.querySelector('.panel-tab-btn[onclick*="orders"]').classList.add('active');
        document.getElementById('orders-panel').classList.remove('hidden');
        renderOrdersPanel();
    }
}

function addBoardComment(text, sentiment = 'neutral') {
    const log = document.getElementById('board-log');
    const empty = log.querySelector('.board-empty');
    if (empty) empty.remove();

    const user = BOARD_HANDLES[Math.floor(Math.random() * BOARD_HANDLES.length)];
    const item = document.createElement('div');
    item.className = 'board-item';
    item.innerHTML = `
        <div class="board-header">
            <span class="board-user">${user}</span>
            <span class="board-sentiment ${sentiment}">${sentiment === 'bull' ? '強気' : sentiment === 'bear' ? '弱気' : '普通'}</span>
        </div>
        <div class="board-text">${text}</div>
    `;

    log.prepend(item);
    if (log.children.length > 30) log.lastElementChild.remove();
}

function triggerBoardSentiment() {
    // 毎フレームではなく、確率で発生させる
    if (Math.random() > 0.05) return;

    const currentYear = new Date(state.period.startDate).getFullYear() + Math.floor(state.currentDay / 252);

    // 一番変動が激しい株を特定
    let maxChange = 0;
    let targetStock = null;
    state.stocks.forEach(s => {
        const change = (s.price - s.prevPrice) / s.prevPrice;
        if (Math.abs(change) > Math.abs(maxChange)) {
            maxChange = change;
            targetStock = s;
        }
    });

    let msg = "";
    let sentiment = 'neutral';

    // 1. 重要人物への反応 (15%の確率)
    if (Math.random() < 0.15) {
        if (targetStock && targetStock.id === 'TSLA') {
            msg = BOARD_TEMPLATES.influencers.musk[Math.floor(Math.random() * BOARD_TEMPLATES.influencers.musk.length)];
            sentiment = maxChange > 0 ? 'bull' : 'bear';
        } else if (Math.abs(maxChange) > 0.05) { // 市場全体が動いている時
            msg = BOARD_TEMPLATES.influencers.powell[Math.floor(Math.random() * BOARD_TEMPLATES.influencers.powell.length)];
            sentiment = maxChange > 0 ? 'bull' : 'bear';
        } else if (currentYear >= 2024 || currentYear === 2016) { // 選挙イヤー近辺
            msg = BOARD_TEMPLATES.influencers.trump[Math.floor(Math.random() * BOARD_TEMPLATES.influencers.trump.length)];
            sentiment = 'neutral';
        }
    }

    // 2. 時代特有のメッセージ (さらに20%の確率)
    if (!msg && Math.random() < 0.2 && BOARD_TEMPLATES.era[currentYear]) {
        const pool = BOARD_TEMPLATES.era[currentYear];
        msg = pool[Math.floor(Math.random() * pool.length)];
    }
    // 3. 汎用的な変動メッセージ
    if (!msg) {
        if (maxChange > 0.02) {
            msg = targetStock.id + ": " + BOARD_TEMPLATES.bull[Math.floor(Math.random() * BOARD_TEMPLATES.bull.length)];
            sentiment = 'bull';
        } else if (maxChange < -0.02) {
            msg = targetStock.id + ": " + BOARD_TEMPLATES.bear[Math.floor(Math.random() * BOARD_TEMPLATES.bear.length)];
            sentiment = 'bear';
        } else {
            msg = BOARD_TEMPLATES.neutral[Math.floor(Math.random() * BOARD_TEMPLATES.neutral.length)];
        }
    }

    if (msg) addBoardComment(msg, sentiment);
}

function renderOrdersPanel() {
    const log = document.getElementById('orders-log');
    if (!log) return;
    log.innerHTML = '';

    if (state.pendingOrders.length === 0) {
        log.innerHTML = '<div class="orders-empty">待機中の注文はありません</div>';
        return;
    }

    state.pendingOrders.forEach((order, index) => {
        const stock = state.stocks.find(s => s.id === order.stockId);
        if (!stock) return;

        let orderTypeLabel = "";
        let isBuy = order.mode === 'buy';
        if (order.positionType === 'long') {
            orderTypeLabel = isBuy ? '現物買' : '現物売';
        } else {
            orderTypeLabel = isBuy ? '空売り' : '買戻し';
        }

        const item = document.createElement('div');
        item.className = 'order-item';
        // Add basic inline styles if classes aren't enough (we'll add CSS next)
        item.innerHTML = `
            <div class="order-header">
                <span class="order-ticker">${stock.emoji} ${stock.id}</span>
                <span class="order-badge ${order.mode}">${orderTypeLabel}</span>
            </div>
            <div class="order-details">
                <span>指値: $${order.targetPrice.toFixed(2)}</span>
                <span>数量: ${order.qty}株</span>
            </div>
            <button class="btn-cancel-order" onclick="cancelOrder(${index})">取消</button>
        `;
        log.appendChild(item);
    });
}

function cancelOrder(index) {
    if (index < 0 || index >= state.pendingOrders.length) return;
    const order = state.pendingOrders[index];
    state.pendingOrders.splice(index, 1);
    showToast(`${order.stockId} の指値注文を取り消しました`, 'info');
    renderOrdersPanel();
}

/* =============================================
   MARKET EVENTS
   ============================================= */
function checkEvents() {
    const d = state.currentDay;
    state.period.events.forEach((ev, i) => {
        if (!state.firedEvents.has(i) && d >= ev.day && d < ev.day + 3) {
            state.firedEvents.add(i);
            addNews(ev.text, ev.type);
            addTickerItem(ev.text, ev.type);
        }
    });
}

/* =============================================
   RENDER
   ============================================= */
function renderAll() {
    renderHeader();
    renderSpeedBar();
    updateAllRows();
    renderPortfolio();
    renderOrdersPanel();
    renderTimer();
}

function renderHeader() {
    const total = calcTotal();
    const pnl = total - INITIAL_CASH;
    const pct = (pnl / INITIAL_CASH) * 100;

    // The HTML has:
    // id="total-assets" (expecting JPY format, e.g. ¥1,000,000)
    // id="cash" (expecting JPY format)
    // id="pnl" (expecting PnL with percentage)

    document.getElementById('total-assets').textContent = fmtJPY(total);
    document.getElementById('cash').textContent = fmtJPY(state.cash);

    const pnlEl = document.getElementById('pnl');
    const pnlSign = pnl >= 0 ? '+' : '';
    pnlEl.textContent = `${pnlSign}${fmtJPY(pnl)} (${pct >= 0 ? '+' : ''}${(pct || 0).toFixed(2)}%)`;
    pnlEl.className = 'stat-value ' + (pnl > 0 ? 'up' : pnl < 0 ? 'down' : 'neutral');
}

function renderSpeedBar() {
    const d = state.currentDay;
    const T = state.totalDays;
    const pct = (d / T) * 100;
    const date = d === 0 ? new Date(state.period.startDate) : dateAfterTradingDays(state.period.startDate, d);

    document.getElementById('current-date-display').textContent = `📅 ${fmtDate(date)}`;
    document.getElementById('progress-display').textContent = `${d} / ${T} 営業日`;
    document.getElementById('progress-fill').style.width = pct + '%';
}

function renderTimer() {
    const rem = Math.max(0, state.totalSeconds - state.elapsed);
    const m = Math.floor(rem / 60);
    const s = Math.floor(rem % 60);
    document.getElementById('timer-display').textContent = `${m}:${String(s).padStart(2, '0')}`;

    const used = state.elapsed / state.totalSeconds;
    const offset = CIRCUMFERENCE * used;
    document.getElementById('timer-ring').style.strokeDashoffset = offset;

    const card = document.querySelector('.timer-card');
    card.classList.remove('timer-warn', 'timer-danger');
    if (rem <= 30) card.classList.add('timer-danger');
    else if (rem <= 60) card.classList.add('timer-warn');
}

/* =============================================
   STOCK TABLE
   ============================================= */
function buildTable() {
    const tbody = document.getElementById('stock-table-body');
    tbody.innerHTML = '';
    state.stocks.forEach(stock => {
        const tr = document.createElement('tr');
        tr.id = `row-${stock.id}`;
        tr.innerHTML = `
      <td>
        <div class="stock-name-cell">
          <div class="stock-ticker">
            ${stock.emoji} ${stock.id}
            <span class="stock-type-badge badge-${stock.type}">${stock.type === 'mag7' ? 'Mag7' : stock.type.toUpperCase()}</span>
          </div>
          <div class="stock-sector">${stock.sector}</div>
        </div>
      </td>
      <td id="price-${stock.id}" class="price-neutral">${fmtUSD(stock.price)}</td>
      <td id="chg-${stock.id}" class="change-cell price-neutral">0.00%</td>
      <td>
        <div class="dca-cell">
           <button class="dca-btn ${stock.dcaActive ? 'active' : ''}" id="dca-btn-${stock.id}" onclick="openDCAModal('${stock.id}')">
             ${stock.dcaActive ? 'ON' : 'OFF'}
           </button>
           <div class="dca-label" id="dca-label-${stock.id}">${stock.dcaActive ? fmtJPY(stock.dcaAmount) : ''}</div>
        </div>
      </td>
      <td class="sparkline-cell" id="spark-cell-${stock.id}">
        <svg id="spark-${stock.id}" width="80" height="36"></svg>
      </td>
      <td>
        <div class="trade-btns">
          <button class="btn-buy"  onclick="openModal('buy','${stock.id}')">買い</button>
          <button class="btn-sell" onclick="openModal('sell','${stock.id}')">売り</button>
        </div>
      </td>`;
        tbody.appendChild(tr);

        document.getElementById(`spark-cell-${stock.id}`)
            .addEventListener('click', () => openChartModal(stock.id));
        drawSparkline(stock);
    });
}

function updateAllRows() {
    state.stocks.forEach(stock => {
        const pr = document.getElementById(`price-${stock.id}`);
        const ch = document.getElementById(`chg-${stock.id}`);
        const row = document.getElementById(`row-${stock.id}`);
        if (!pr) return;

        const up = stock.price >= stock.prevPrice;
        pr.textContent = fmtUSD(stock.price);
        pr.className = stock.price > stock.prevPrice ? 'price-up' : stock.price < stock.prevPrice ? 'price-down' : 'price-neutral';

        const sign = stock.changePct >= 0 ? '+' : '';
        ch.textContent = `${sign}${stock.changePct.toFixed(2)}%`;
        ch.className = 'change-cell ' + (stock.changePct > 0 ? 'price-up' : stock.changePct < 0 ? 'price-down' : 'price-neutral');

        row.classList.remove('flash-up', 'flash-down');
        void row.offsetWidth;
        if (stock.price !== stock.prevPrice) row.classList.add(up ? 'flash-up' : 'flash-down');

        drawSparkline(stock);
        updateChartModalIfOpen(stock.id);
    });
}

function drawSparkline(stock) {
    const svg = document.getElementById(`spark-${stock.id}`);
    if (!svg) return;
    const W = 80, H = 36, pad = 3;
    const hist = stock.history;
    if (hist.length < 2) return;

    const mn = Math.min(...hist), mx = Math.max(...hist);
    const range = mx - mn || 1;
    const toX = i => pad + (i / (hist.length - 1)) * (W - 2 * pad);
    const toY = v => (H - pad) - ((v - mn) / range) * (H - 2 * pad);

    const path = hist.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
    const last = hist[hist.length - 1];
    const first = hist[0];

    // Read colors from CSS variables based on the current class
    const isJp = document.body.classList.contains('jp-colors');
    const upColor = isJp ? '#ff5252' : '#00e676'; // jp-up vs green
    const downColor = isJp ? '#00e5ff' : '#ff5252'; // jp-down vs red
    const color = last >= first ? upColor : downColor;

    svg.innerHTML = `
    <defs>
      <linearGradient id="sg-${stock.id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${path} L${toX(hist.length - 1)},${H} L${toX(0)},${H} Z" fill="url(#sg-${stock.id})"/>
    <path d="${path}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="${toX(hist.length - 1)}" cy="${toY(last)}" r="2.5" fill="${color}"/>`;
}

/* =============================================
   PORTFOLIO
   ============================================= */
function calcTotal() {
    let stockVal = 0;
    state.stocks.forEach(st => {
        // Long position value
        if (st.holdings > 0) {
            stockVal += st.holdings * st.price * state.jpyRate;
        }
        // Short position value
        // The embedded cash from the short sale is already in state.cash.
        // We need to subtract the cost to buy it back at the current price (the liability).
        if (st.shortHoldings > 0) {
            stockVal -= st.shortHoldings * st.price * state.jpyRate;
        }
    });
    return state.cash + stockVal;
}

function renderPortfolio() {
    const heldLong = state.stocks.filter(s => s.holdings > 0);
    const heldShort = state.stocks.filter(s => s.shortHoldings > 0);
    const totalCount = heldLong.length + heldShort.length;

    document.getElementById('portfolio-count').textContent = `${totalCount}銘柄`;

    const list = document.getElementById('portfolio-list');
    if (totalCount === 0) {
        list.innerHTML = '<div class="empty-portfolio">まだ保有していません</div>';
        return;
    }

    let html = '';

    // Render Long Positions
    html += heldLong.map(s => {
        const val = s.holdings * s.price * state.jpyRate;
        const cost = s.holdings * s.avgCost * state.jpyRate;
        const pnl = val - cost;
        const pct = cost > 0 ? (pnl / cost) * 100 : 0;
        return `
      <div class="portfolio-item">
        <div class="pf-top">
          <div class="pf-ticker">${s.emoji} ${s.id} × ${s.holdings}</div>
          <div class="pf-value">${fmtJPY(val)}</div>
        </div>
        <div class="pf-bottom">
          <span>（現物） 平均 ${fmtUSD(s.avgCost)}</span>
          <span class="pf-pnl ${pnl >= 0 ? 'up' : 'down'}">${pnl >= 0 ? '+' : ''}${fmtJPY(pnl)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)</span>
        </div>
      </div>`;
    }).join('');

    // Render Short Positions
    html += heldShort.map(s => {
        // For short, cost is the cash we received. Value is the cost to buy it back now.
        const receivedCash = s.shortHoldings * s.shortAvgCost * state.jpyRate;
        const currentLiability = s.shortHoldings * s.price * state.jpyRate;
        const pnl = receivedCash - currentLiability;
        const pct = receivedCash > 0 ? (pnl / receivedCash) * 100 : 0;
        return `
      <div class="portfolio-item" style="border-left: 3px solid var(--red); padding-left: 8px;">
        <div class="pf-top">
          <div class="pf-ticker">${s.emoji} ${s.id} [空売り ${s.shortHoldings}株]</div>
          <div class="pf-value" style="color: var(--text2);">買戻額: ${fmtJPY(currentLiability)}</div>
        </div>
        <div class="pf-bottom">
          <span>（信用） 平均 ${fmtUSD(s.shortAvgCost)}</span>
          <span class="pf-pnl ${pnl >= 0 ? 'up' : 'down'}">${pnl >= 0 ? '+' : ''}${fmtJPY(pnl)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)</span>
        </div>
      </div>`;
    }).join('');

    list.innerHTML = html;
}

/* =============================================
   NEWS
   ============================================= */
function addNews(text, type) {
    const date = dateAfterTradingDays(state.period.startDate, state.currentDay);
    state.newsLog.unshift({ text, type, date });
    if (state.newsLog.length > 20) state.newsLog.pop();

    const log = document.getElementById('news-log');
    log.innerHTML = state.newsLog.slice(0, 10).map(n =>
        `<div class="news-item ${n.type}">
       ${n.text}
       <div class="news-time">${fmtDate(n.date)}</div>
     </div>`
    ).join('');
}

function addTickerItem(text, type) {
    const el = document.createElement('span');
    el.className = `ticker-item ${type}`;
    el.textContent = '📰 ' + text + '　　';
    const tc = document.getElementById('ticker-content');
    tc.appendChild(el.cloneNode(true)); // duplicate for seamless loop
    tc.appendChild(el);
    // restart animation
    tc.style.animation = 'none';
    void tc.offsetWidth;
    const totalW = tc.scrollWidth / 2;
    tc.style.animation = `ticker ${totalW / 60}s linear infinite`;
}

/* =============================================
   MODAL (TRADE)
   ============================================= */
let modalMode = null, modalStockId = null, orderType = 'market', positionType = 'long';

function setPositionType(type) {
    positionType = type;
    document.getElementById('pos-long-btn').classList.toggle('active', type === 'long');
    document.getElementById('pos-short-btn').classList.toggle('active', type === 'short');

    // Update labels based on exact mode + position combo
    const badge = document.getElementById('modal-type-badge');
    const stock = state.stocks.find(s => s.id === modalStockId);

    if (positionType === 'long') {
        badge.textContent = modalMode === 'buy' ? '買い (現物)' : '現金化 (売り)';
        badge.className = `type-badge ${modalMode}`;
        document.getElementById('trade-available-label').textContent = modalMode === 'buy' ? '利用可能現金' : '保有株数(現物)';
        document.getElementById('trade-available').textContent = modalMode === 'buy'
            ? fmtJPY(state.cash)
            : `${stock ? stock.holdings : 0}株`;
    } else {
        badge.textContent = modalMode === 'buy' ? '空売り (新規)' : '買い戻し (返済)';
        // Visually swap: Shorting is a "Sell" action, Covering is a "Buy" action
        badge.className = `type-badge ${modalMode === 'buy' ? 'sell' : 'buy'}`;
        document.getElementById('trade-available-label').textContent = modalMode === 'buy' ? '利用可能現金' : '空売り建玉';
        document.getElementById('trade-available').textContent = modalMode === 'buy'
            ? fmtJPY(state.cash) // Require cash as margin even for short
            : `${stock ? stock.shortHoldings : 0}株`;
    }
}

function setOrderType(type) {
    orderType = type;
    document.getElementById('order-market-btn').classList.toggle('active', type === 'market');
    document.getElementById('order-limit-btn').classList.toggle('active', type === 'limit');
    document.getElementById('limit-price-group').classList.toggle('hidden', type === 'market');
    updateModalSummary();
}

function openModal(mode, stockId) {
    if (!state || !state.running) return;
    const stock = state.stocks.find(s => s.id === stockId);
    modalMode = mode; modalStockId = stockId;

    document.getElementById('modal-stock-name').textContent = `${stock.emoji} ${stock.id}`;
    document.getElementById('modal-stock-sector').textContent = stock.fullName;
    document.getElementById('modal-current-price').textContent = fmtUSD(stock.price);
    document.getElementById('limit-price-input').value = stock.price.toFixed(2);
    document.getElementById('quantity-input').value = 1;

    setOrderType('market'); // Default to market
    setPositionType('long'); // Default to long

    updateModalSummary();
    document.getElementById('trade-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('trade-modal').classList.add('hidden');
    modalMode = null; modalStockId = null;
}

function updateModalSummary() {
    const stock = state.stocks.find(s => s.id === modalStockId);
    if (!stock) return;
    const qty = parseInt(document.getElementById('quantity-input').value) || 0;
    const price = orderType === 'market' ? stock.price : parseFloat(document.getElementById('limit-price-input').value) || 0;

    const subtotal = qty * price;
    const fee = subtotal * FEE_RATE;

    // In long mode: matching mode. In short mode: mode 'buy' = short(sell action), mode 'sell' = cover(buy action).
    const actionIsBuy = (positionType === 'long' && modalMode === 'buy') || (positionType === 'short' && modalMode === 'sell');
    const total = actionIsBuy ? (subtotal + fee) * state.jpyRate : (subtotal - fee) * state.jpyRate;

    document.getElementById('trade-subtotal').textContent = fmtUSD(subtotal);
    document.getElementById('trade-fee').textContent = fmtUSD(fee);
    document.getElementById('trade-total').textContent = fmtJPY(total);
}

function executeTrade() {
    const stock = state.stocks.find(s => s.id === modalStockId);
    const qty = parseInt(document.getElementById('quantity-input').value) || 0;
    if (!stock || qty <= 0) { showToast('株数を正しく入力してください', 'error'); return; }

    if (orderType === 'limit') {
        const targetPrice = parseFloat(document.getElementById('limit-price-input').value);
        if (!targetPrice || targetPrice <= 0) { showToast('指値価格を正しく入力してください', 'error'); return; }

        state.pendingOrders.push({
            stockId: stock.id,
            mode: modalMode,
            positionType: positionType,
            qty: qty,
            targetPrice: targetPrice
        });
        showToast(`${stock.id} の指値注文（$${targetPrice.toFixed(2)}）を承りました`, 'info');
        closeModal();
        return;
    }

    const tradeValue = qty * stock.price * state.jpyRate;
    const fee = tradeValue * FEE_RATE;

    if (positionType === 'long') {
        if (modalMode === 'buy') {
            const cost = tradeValue + fee;
            if (cost > state.cash) { showToast('現金が不足しています', 'error'); return; }
            const prevTotal = stock.holdings * stock.avgCost;
            stock.holdings += qty;
            stock.avgCost = (prevTotal + qty * stock.price) / stock.holdings;
            state.cash -= cost;
            showToast(`${stock.id} を ${qty}株 購入しました`, 'success');
        } else {
            if (qty > stock.holdings) { showToast('保有株数が不足しています', 'error'); return; }
            const proceeds = tradeValue - fee;
            stock.holdings -= qty;
            if (Math.abs(stock.holdings) < 0.0001) {
                stock.holdings = 0;
                stock.avgCost = 0;
            }
            state.cash += proceeds;
            showToast(`${stock.id} を ${qty}株 売却しました`, 'success');
        }
    } else {
        // SHORT MODE
        if (modalMode === 'buy') {
            // 空売り (Short Sale)
            const marginRequired = tradeValue; // Require cash as 100% margin to prevent instant bankruptcy
            if (marginRequired > state.cash) { showToast('証拠金（現金）が不足しています', 'error'); return; }

            const proceeds = tradeValue - fee;
            const prevShortTotal = stock.shortHoldings * stock.shortAvgCost;
            stock.shortHoldings += qty;
            stock.shortAvgCost = (prevShortTotal + qty * stock.price) / stock.shortHoldings;
            state.cash += proceeds; // Gain cash today, but owe the stock
            showToast(`${stock.id} を ${qty}株 空売りしました`, 'success');
        } else {
            // 買い戻し (Cover)
            if (qty > stock.shortHoldings) { showToast('空売り建玉が不足しています', 'error'); return; }
            const costToCover = tradeValue + fee;
            if (costToCover > state.cash) { showToast('現金を確保してから買い戻してください', 'error'); return; }

            stock.shortHoldings -= qty;
            if (Math.abs(stock.shortHoldings) < 0.0001) {
                stock.shortHoldings = 0;
                stock.shortAvgCost = 0;
            }
            state.cash -= costToCover;
            showToast(`${stock.id} を ${qty}株 買い戻しました`, 'success');
        }
    }

    closeModal();
    renderPortfolio();
    renderHeader();
}

/* =============================================
   DCA MODAL
   ============================================= */
let dcaStockId = null;

function openDCAModal(stockId) {
    if (!state) return;
    dcaStockId = stockId;
    const stock = state.stocks.find(s => s.id === stockId);

    document.getElementById('dca-stock-name').textContent = `${stock.emoji} ${stock.id}`;
    document.getElementById('dca-stock-fullname').textContent = stock.fullName;
    document.getElementById('dca-amount-input').value = stock.dcaAmount;

    updateDCAModalUI(stock);
    document.getElementById('dca-modal').classList.remove('hidden');
}

function updateDCAModalUI(stock) {
    const statusText = document.getElementById('dca-status-text');
    const toggleBtn = document.getElementById('dca-toggle-btn');

    if (stock.dcaActive) {
        statusText.textContent = 'ON (実行中)';
        statusText.style.color = 'var(--green)';
        toggleBtn.textContent = '積立を停止';
        toggleBtn.className = 'btn-secondary';
    } else {
        statusText.textContent = 'OFF';
        statusText.style.color = 'var(--text3)';
        toggleBtn.textContent = '積立を開始';
        toggleBtn.className = 'btn-primary';
    }
}

function closeDCAModal() {
    document.getElementById('dca-modal').classList.add('hidden');
    dcaStockId = null;
}

function saveDCASettings() {
    const stock = state.stocks.find(s => s.id === dcaStockId);
    if (!stock) return;

    const amount = parseInt(document.getElementById('dca-amount-input').value) || 0;
    stock.dcaAmount = amount;

    showToast(`${stock.id} の積立額を ${fmtJPY(amount)} に設定しました`, 'success');
    renderAll();
    buildTable(); // DCAラベル更新のため
}

function toggleDCA() {
    const stock = state.stocks.find(s => s.id === dcaStockId);
    if (!stock) return;

    stock.dcaActive = !stock.dcaActive;
    updateDCAModalUI(stock);
    showToast(`${stock.id} の積立を ${stock.dcaActive ? '開始' : '停止'} しました`, 'info');
    renderAll();
    buildTable();
}

/* =============================================
   CHART MODAL
   ============================================= */
let chartOpenId = null;
let chartRange = 'MAX'; // 1D | 5D | 1M | 6M | YTD | 1Y | 5Y | MAX

// 期間 → 遡る営業日数
function rangeToDays(range, totalIdx) {
    switch (range) {
        case '1D': return Math.min(1, totalIdx);
        case '5D': return Math.min(5, totalIdx);
        case '1M': return Math.min(21, totalIdx);
        case '6M': return Math.min(126, totalIdx);
        case 'YTD': return state.currentDay; // ゲーム開始時点から
        case '1Y': return Math.min(252, totalIdx);
        case '5Y': return Math.min(1260, totalIdx);
        case 'MAX': return totalIdx;
        default: return totalIdx;
    }
}

function openChartModal(stockId) {
    if (!state) return;
    chartOpenId = stockId;
    refreshChartModal();
    document.getElementById('chart-modal').classList.remove('hidden');
}

function refreshChartModal() {
    if (!chartOpenId || !state) return;
    const stock = state.stocks.find(s => s.id === chartOpenId);
    const qqq = state.stocks.find(s => s.id === 'QQQ');

    document.getElementById('chart-modal-title').textContent = `${stock.emoji} ${stock.id}`;
    document.getElementById('chart-modal-fullname').textContent = stock.fullName;
    document.getElementById('chart-modal-price').textContent = fmtUSD(stock.price);

    // 期間に応じた騰落率を計算
    const currentIdx = state.startIndex + state.currentDay;
    const days = rangeToDays(chartRange, currentIdx);
    const fromDay = Math.max(0, currentIdx - days);
    const fromPrice = stock.daily[fromDay];
    const rangePct = fromPrice > 0 ? ((stock.price - fromPrice) / fromPrice) * 100 : 0;

    const ch = document.getElementById('chart-modal-change');
    const rangeLabels = { '1D': '1日', '5D': '5日', '1M': '1ヶ月', '6M': '6ヶ月', 'YTD': '年初来', '1Y': '1年', '5Y': '5年', 'MAX': '最大' };
    const rangeLabel = rangeLabels[chartRange];
    ch.textContent = `${rangePct >= 0 ? '+' : ''}${rangePct.toFixed(2)}% (${rangeLabel})`;
    ch.className = `chart-modal-change ${rangePct >= 0 ? 'up' : 'down'}`;

    document.getElementById('legend-stock-label').textContent = `${stock.id}（${rangeLabel}）`;
    drawModalChart(stock, qqq);
}

function updateChartModalIfOpen(stockId) {
    if (chartOpenId !== stockId) return;
    refreshChartModal();
}

function closeChartModal() {
    document.getElementById('chart-modal').classList.add('hidden');
    chartOpenId = null;
    chartRange = 'MAX';
    // ボタン表示リセット
    document.querySelectorAll('.range-btn').forEach(b => b.classList.toggle('active', b.dataset.range === 'MAX'));
}

function drawModalChart(stock, qqq) {
    const svg = document.getElementById('chart-modal-svg');
    const W = svg.clientWidth || 700;
    const H = svg.clientHeight || 300;
    const P = { t: 20, r: 20, b: 30, l: 56 };

    // 期間に応じたデータをフィルタリング
    const currentIdx = state.startIndex + state.currentDay;
    const days = rangeToDays(chartRange, currentIdx);
    const fromIdx = Math.max(0, currentIdx - days);
    const hist = stock.dailyAdjusted.slice(fromIdx, currentIdx + 1);
    const qqqHist = qqq.dailyAdjusted.slice(fromIdx, currentIdx + 1);

    if (hist.length < 2) {
        svg.innerHTML = `<text x="${W / 2}" y="${H / 2}" fill="#5a5a80" text-anchor="middle">データが不足しています</text>`;
        return;
    }

    // 選択期間の開始値を 0% として正規化
    const s0 = hist[0], q0 = qqqHist[0];
    const norm = hist.map(v => (v / s0 - 1) * 100);
    const qnorm = qqqHist.map(v => (v / q0 - 1) * 100);

    const allV = [...norm, ...qnorm];
    const minV = Math.min(...allV), maxV = Math.max(...allV);
    const rng = maxV - minV || 1;
    const n = hist.length;

    const toX = i => P.l + (i / (n - 1)) * (W - P.l - P.r);
    const toY = v => P.t + (1 - (v - minV) / rng) * (H - P.t - P.b);

    const stockPath = norm.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const qqqPath = qnorm.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');
    const zeroY = toY(0).toFixed(1);

    // Y-axis labels
    const yLabels = [];
    const step = rng / 4;
    for (let i = 0; i <= 4; i++) {
        const v = minV + step * i;
        yLabels.push(`<text x="${P.l - 6}" y="${toY(v) + 4}" fill="#5a5a80" font-size="10" text-anchor="end">${v >= 0 ? '+' : ''}${v.toFixed(0)}%</text>`);
    }

    const isJp = document.body.classList.contains('jp-colors');
    const upColor = isJp ? '#ff5252' : '#ffd740';
    // for this chart we keep #ffd740 (yellow) for US up/neutral, and red for JP up. Let's make it simple.
    // Actually the standard is just drawing it. Let's stick with the main chart color:
    const chartColor = isJp ? '#ff5252' : '#ffd740';
    const qqqColor = '#00e5ff'; // Keep QQQ constant

    svg.innerHTML = `
    ${yLabels.join('')}
    <line x1="${P.l}" y1="${zeroY}" x2="${W - P.r}" y2="${zeroY}" stroke="#444" stroke-dasharray="4,3" stroke-width="1"/>
    <path d="${qqqPath}" fill="none" stroke="${qqqColor}" stroke-width="1.5" opacity="0.7" stroke-linejoin="round"/>
    <path d="${stockPath}" fill="none" stroke="${chartColor}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${toX(n - 1).toFixed(1)}" cy="${toY(norm[n - 1]).toFixed(1)}" r="4" fill="${chartColor}"/>
    <circle cx="${toX(n - 1).toFixed(1)}" cy="${toY(qnorm[n - 1]).toFixed(1)}" r="3" fill="${qqqColor}" opacity="0.8"/>`;
}

/* =============================================
   TOAST
   ============================================= */
function showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    clearTimeout(t._tid);
    t._tid = setTimeout(() => t.classList.add('hidden'), 3000);
}

/* =============================================
   GAME LIFECYCLE
   ============================================= */
function startGame() {
    const period = HISTORICAL_PERIODS.find(p => p.id === selectedPeriodId);
    state = createState(period, selectedDuration);
    state.running = true;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    // Init speed bar text
    const dpm = (period.tradingDays / selectedDuration).toFixed(1);
    document.getElementById('speed-bar-info').textContent =
        `${selectedDuration}分で${period.tradingDays}日体験 · ${dpm}日/分`;
    document.getElementById('timer-display').textContent =
        `${selectedDuration}:00`;

    buildTable();
    renderAll();

    // Init ticker
    const tc = document.getElementById('ticker-content');
    tc.innerHTML = '';
    addTickerItem(period.description, 'neutral');

    tickTimerId = setInterval(gameTick, state.tickMs);
}

function endGame() {
    state.running = false;
    clearInterval(tickTimerId);

    const total = calcTotal();
    const pnl = total - INITIAL_CASH;
    const retPct = (pnl / INITIAL_CASH) * 100;

    const ranks = [
        { min: 50, emoji: '👑', label: '伝説のトレーダー', comment: '圧倒的なリターン！市場を完全に読み切りました。' },
        { min: 20, emoji: '🏆', label: 'エキスパート', comment: '素晴らしい成果！プロ顔負けの投資判断です。' },
        { min: 5, emoji: '🥇', label: '優秀なトレーダー', comment: '市場平均を大きく上回りました。' },
        { min: 0, emoji: '✅', label: 'まずまず', comment: 'プラスで終了。着実な投資判断でした。' },
        { min: -10, emoji: '📉', label: '要修業', comment: 'マイナスでしたが、相場を体験できましたね。' },
        { min: -Infinity, emoji: '💀', label: '大損', comment: 'かなりの損失。次回はニュースに注目しましょう！' },
    ];
    const rank = ranks.find(r => retPct >= r.min);

    document.getElementById('gameover-rank').textContent = rank.emoji;
    document.getElementById('gameover-title').textContent = rank.label;
    document.getElementById('go-total').textContent = fmtJPY(total);
    document.getElementById('go-total').className = `result-value ${pnl >= 0 ? 'price-up' : 'price-down'}`;
    document.getElementById('go-return').textContent = `${retPct >= 0 ? '+' : ''}${retPct.toFixed(2)}%`;
    document.getElementById('go-return').className = `result-value ${retPct >= 0 ? 'price-up' : 'price-down'}`;
    document.getElementById('go-pnl').textContent = `${pnl >= 0 ? '+' : ''}${fmtJPY(pnl)}`;
    document.getElementById('go-pnl').className = `result-value ${pnl >= 0 ? 'price-up' : 'price-down'}`;
    document.getElementById('go-cash').textContent = fmtJPY(state.cash);
    document.getElementById('go-cash').className = 'result-value';
    document.getElementById('gameover-comment').textContent = rank.comment;

    const p = state.period;
    const qqq = state.stocks.find(s => s.id === 'QQQ');
    const qqqRet = ((qqq.price - qqq.startPrice) / qqq.startPrice * 100).toFixed(1);
    document.getElementById('go-period-result').innerHTML =
        `<strong>${p.emoji} ${p.label}</strong><br>
     ${p.description}<br><br>
     QQQ（Nasdaq100）の実績: ${qqqRet >= 0 ? '+' : ''}${qqqRet}%`;

    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('gameover-screen').classList.remove('hidden');
}

/* =============================================
   EVENT LISTENERS
   ============================================= */

// Period cards
document.querySelectorAll('.period-card').forEach(card => {
    card.addEventListener('click', () => {
        document.querySelectorAll('.period-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedPeriodId = card.dataset.period;
        updateSpeedInfo();
    });
});

// Duration buttons
document.querySelectorAll('.dur-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDuration = parseInt(btn.dataset.dur);
        updateSpeedInfo();
    });
});

function updateSpeedInfo() {
    const period = HISTORICAL_PERIODS.find(p => p.id === selectedPeriodId);
    const days = period ? period.tradingDays : 252;
    const dpm = (days / selectedDuration).toFixed(1);
    const years = (days / 252).toFixed(1);
    document.getElementById('speed-text').textContent =
        `${selectedDuration}分間で${days}営業日（約${years}年）を体験 · ${dpm}日/分`;
}

// Start button
document.getElementById('start-btn').addEventListener('click', startGame);

// Restart buttons
document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('gameover-screen').classList.add('hidden');
    startGame();
});
document.getElementById('back-to-select-btn').addEventListener('click', () => {
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
});

// Trade modal
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('trade-modal').addEventListener('click', e => {
    if (e.target.id === 'trade-modal') closeModal();
});
document.getElementById('execute-btn').addEventListener('click', executeTrade);

document.getElementById('quantity-input').addEventListener('input', updateModalSummary);
document.getElementById('limit-price-input').addEventListener('input', updateModalSummary);

document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const el = document.getElementById('quantity-input');
        const val = Math.max(1, (parseInt(el.value) || 0) + parseInt(btn.dataset.delta));
        el.value = val;
        updateModalSummary();
    });
});

document.querySelectorAll('.pct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (!modalStockId) return;
        const stock = state.stocks.find(s => s.id === modalStockId);
        const pct = parseFloat(btn.dataset.pct);
        let qty;
        if (modalMode === 'buy') {
            const maxCost = state.cash * pct;
            qty = Math.floor(maxCost / (stock.price * state.jpyRate * (1 + FEE_RATE)));
        } else {
            qty = Math.floor(stock.holdings * pct);
        }
        document.getElementById('quantity-input').value = Math.max(1, qty);
        updateModalSummary();
    });
});

// Pause button
document.getElementById('pause-btn')?.addEventListener('click', togglePause);
document.getElementById('timer-btn')?.addEventListener('click', togglePause);

// Spacebar Pause Shortcut
document.addEventListener('keydown', (e) => {
    // Ignore spacebar if user is typing in an input or the game hasn't started/is over
    if (e.code === 'Space') {
        if (!state.running && document.getElementById('game-screen').classList.contains('hidden')) return;
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            return;
        }
        e.preventDefault(); // Prevent page scrolling
        togglePause();
    }
});

// DCA modal
document.getElementById('dca-modal-close')?.addEventListener('click', closeDCAModal);
document.getElementById('dca-save-btn')?.addEventListener('click', () => {
    saveDCASettings();
    closeDCAModal();
});
document.getElementById('dca-toggle-btn')?.addEventListener('click', toggleDCA);

document.querySelectorAll('.dca-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const el = document.getElementById('dca-amount-input');
        const val = Math.max(0, (parseInt(el.value) || 0) + parseInt(btn.dataset.delta));
        el.value = val;
    });
});

document.getElementById('dca-modal')?.addEventListener('click', e => {
    if (e.target.id === 'dca-modal') closeDCAModal();
});

// Chart modal
document.getElementById('chart-modal-close').addEventListener('click', closeChartModal);
document.getElementById('chart-modal').addEventListener('click', e => {
    if (e.target.id === 'chart-modal') closeChartModal();
});

// Chart Modal Range Buttons
document.querySelectorAll('.range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        chartRange = btn.dataset.range;
        refreshChartModal();
    });
});

// Color scheme toggle
let isJpColors = true;
document.body.classList.add('jp-colors'); // Set JP colors by default

const colorToggleBtn = document.getElementById('color-scheme-toggle');
if (colorToggleBtn) {
    colorToggleBtn.addEventListener('click', () => {
        isJpColors = !isJpColors;
        if (isJpColors) {
            document.body.classList.add('jp-colors');
            colorToggleBtn.textContent = '🇯🇵 JP配色';
        } else {
            document.body.classList.remove('jp-colors');
            colorToggleBtn.textContent = '🇺🇸 US配色';
        }

        // Redraw table rows (for sparklines)
        if (state) {
            state.stocks.forEach(s => drawSparkline(s));
            if (chartOpenId) {
                refreshChartModal();
            }
        }
    });
}

// Init speed info on load
updateSpeedInfo();
