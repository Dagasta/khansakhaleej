/* ============================================================
   خنساء Editorial Intelligence — app.js
   Journalist dashboard: UAE/Dubai • Economy • Politics • Rankings
   ============================================================ */

'use strict';

// ── CONFIG ──────────────────────────────────────────────────
// Multiple CORS proxies — tried in order; falls back if one is down
const PROXIES = [
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  url => `https://thingproxy.freeboard.io/fetch/${url}`,
  url => `https://proxy.cors.sh/${url}`,
  url => `https://cors-anywhere.herokuapp.com/${url}`,
  url => `https://yproxy.io/proxy/${url}`,
  url => `https://serverless-cors-proxy.vercel.app/api/proxy?url=${encodeURIComponent(url)}`
];

const REFRESH_MS = 5 * 60 * 1000;

// ✅ COMPREHENSIVE OFFICIAL & TRUSTED SOURCES
const SOURCES = [
  // 🇦🇪 UAE & DUBAI (Primary Wires)
  { name: 'WAM Official News',       url: 'https://wam.ae/en/rss/latest',             label: 'WAM',      isOfficial: true, cat: 'uae' },
  { name: 'Khaleej Times Live',      url: 'https://www.khaleejtimes.com/rss.xml',     label: 'KT', cat: 'uae' },
  { name: 'The National UAE',        url: 'https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml', label: 'National', cat: 'uae' },
  { name: 'Arabian Business Dubai',   url: 'https://www.arabianbusiness.com/feed',     label: 'ABiz', cat: 'uae' },
  { name: 'Gulf Business News',      url: 'https://gulfbusiness.com/feed/',           label: 'GulfBus', cat: 'economy' },
  { name: 'Forbes Middle East',      url: 'https://www.forbesmiddleeast.com/rss',      label: 'Forbes', cat: 'economy' },
  
  // 💹 ECONOMY, CREDIT & DEBT (The Analysts)
  { name: 'Fitch / Moody\'s Focus',   url: 'https://news.google.com/rss/search?q=when:7D+(source:Fitch+OR+source:Moody)+UAE&hl=en-AE&gl=AE&ceid=AE:en', label: 'Credit', cat: 'economy' },
  { name: 'Zawya UAE Economy',       url: 'https://www.zawya.com/en/rss/economy',     label: 'Zawya', cat: 'economy' },
  { name: 'Mubasher UAE Biz',        url: 'https://feeds.feedburner.com/MubasherUaeEn', label: 'Mubasher', cat: 'economy' },
  { name: 'Dubai Business Sniper',    url: 'https://news.google.com/rss/search?q=when:24h+Dubai+Business+Economy&hl=en-AE&gl=AE&ceid=AE:en', label: 'DXB BIZ', cat: 'economy' },

  // 🏛️ POLITICS & GCC (Regional Stability)
  { name: 'GCC Political Radar',     url: 'https://news.google.com/rss/search?q=when:7D+GCC+Politics+Summit+Diplomacy&hl=en-US&gl=US&ceid=US:en', label: 'GCC', cat: 'politics' },
  { name: 'Reuters ME Politics',      url: 'https://www.reutersagency.com/feed/?best-topics=middle-east&post_type=best', label: 'Reuters', cat: 'politics' },
  { name: 'Al Arabiya GCC Wire',     url: 'https://news.google.com/rss/search?q=when:24h+Al+Arabiya+GCC+region+politics&hl=en-US&gl=US&ceid=US:en', label: 'AlArabiya', cat: 'politics' },

  // 🏆 GLOBAL RANKINGS (Index & Achievements)
  { name: 'Global Index Sniper',     url: 'https://news.google.com/rss/search?q=when:30D+UAE+Ranked+Index+Competitiveness&hl=en-US&gl=US&ceid=US:en', label: 'INDEX', cat: 'rankings' },
  { name: 'Dubai Achievements',      url: 'https://news.google.com/rss/search?q=when:30D+Dubai+Awarded+Ranking+Top+10&hl=en-US&gl=US&ceid=US:en', label: 'AWARD', cat: 'rankings' },

  // 💰 GOLD & CRYPTO (The First-Mover Analysis)
  { name: 'Investing.com Gold',      url: 'https://www.investing.com/rss/news_301.rss', label: 'Gold', cat: 'markets' },
  { name: 'Kitco Gold Analysis',     url: 'https://www.kitco.com/news/rss/news.xml',    label: 'XAU Analyz', cat: 'markets' },
  { name: 'CoinDesk Crypto Live',    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', label: 'Crypto', cat: 'markets' },
  { name: 'CryptoSlate Radar',       url: 'https://cryptoslate.com/feed/',             label: 'CSlate', cat: 'markets' },

  // 🌐 GLOBAL CORE (The High-Value Network)
  { name: 'Bloomberg Market Hub',    url: 'https://news.google.com/rss/search?q=when:24h+Bloomberg+Markets+Analysis&hl=en-US&gl=US&ceid=US:en', label: 'Bloomberg', cat: 'global' },
  { name: 'CNBC Breaking Biz',       url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', label: 'CNBC', cat: 'global' },
  { name: 'New York Times (NYT)',     url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', label: 'NYT', cat: 'global' },
  { name: 'Washington Post (World)',  url: 'https://feeds.washingtonpost.com/rss/world', label: 'WaPo', cat: 'global' },
  { name: 'Daily Mail (Global)',     url: 'https://www.dailymail.co.uk/articles.rss', label: 'DMail', cat: 'global' },
  { name: 'The Telegraph (UK)',      url: 'https://www.telegraph.co.uk/rss.xml',       label: 'Telegraph', cat: 'global' },
  { name: 'Associated Press (AP)',   url: 'https://news.google.com/rss/search?q=when:24h+breaking+news&hl=en-US&gl=US&ceid=US:en', label: 'AP', cat: 'global' },
  { name: 'BBC Global News',         url: 'https://feeds.bbci.co.uk/news/rss.xml',     label: 'BBC', cat: 'global' },

  // 🏆 EXTRA RANKINGS (To fill the vacant tab)
  { name: 'Dubai Global Ranking Radar', url: 'https://news.google.com/rss/search?q=when:7d+Dubai+ranked+globally+index+report&hl=en-US&gl=US&ceid=US:en', label: 'RANK', cat: 'rankings' },
  { name: 'UAE Achievement Wire',    url: 'https://news.google.com/rss/search?q=when:7d+UAE+ranked+first+award+achievement&hl=en-US&gl=US&ceid=US:en', label: 'AWARD', cat: 'rankings' },
  { name: 'Dubai Hub Index',         url: 'https://news.google.com/rss/search?q=when:7d+Dubai+global+hub+index+leader&hl=en-US&gl=US&ceid=US:en', label: 'LEADER', cat: 'rankings' }
];

// ── KEYWORD SCORING ──────────────────────────────────────────
const CATEGORIES = {
  uae: {
    label: 'UAE & Dubai', icon: '🇦🇪',
    keywords: [
      'uae','dubai','abu dhabi','sharjah','ajman','ras al khaimah','fujairah','emirate','emirati',
      'golden visa','uae cabinet','uae government','uae ministry','dubai economy','uae business',
      'emirates','etihad','flydubai','dp world','mubadala','emaar','nakheel','aldar','sobha','damac',
      'adnoc','etisalat','du telecom','dewa','rta','dmcc','difc','jafza','wasl',
      'sheikh mohammed','sheikh hamdan','sheikh khaled','sheikh mansour','sheikh zayed','mbz'
    ],
    exclude:  []
  },
  economy: {
    label: 'Economy & Business', icon: '📈',
    keywords: [
      'economy','economic','gdp','inflation','growth','fiscal','monetary','budget','tax',
      'business','corporate','firm','industry','merger','acquisition','ipo','startup','venture',
      'revenue','profit','dividend','equity','shares','stock market','bank','banking','finance',
      'oil','gas','energy','trade','export','import','fitch','moody','s&p','credit rating'
    ],
    exclude:  []
  },
  politics: {
    label: 'Politics & GCC', icon: '🏛️',
    keywords: [
      'political','diplomacy','summit','bilateral','sanction','ceasefire','gcc','gulf cooperation council',
      'united nations','peace deal','foreign minister','war','conflict','military','iran','israel','hamas','houthi',
      'saudi','riyadh','qatar','doha','kuwait','oman','bahrain','egypt','jordan','iraq','syria','gcc region'
    ],
    exclude:  []
  },
  rankings: {
    label: 'Global Rankings', icon: '🏆',
    keywords: [
      'ranking','ranked','global ranking','index','top 10','top 5','number one','first place',
      'competitiveness','index','innovation','happiness','ease of doing business','livability',
      'best city','world\'s best','wef','imf forecast','world bank report','henley','achievement','awarded','award','leader','leading','success'
    ],
    exclude:  []
  },
  markets: {
    label: 'Market Analysis', icon: '💰',
    keywords: [
      'gold','xau','precious metal','bullion','gold rate','spot price','jewellery','xauusd',
      'investing.com','price analysis','bullish','bearish','inflation','market analysis','souq market','gold analysis','market gap',
      'bitcoin','btc','crypto','cryptocurrency','blockchain','ethereum','eth','token','coinbase','binance'
    ],
    exclude: []
  }
};

// High-value signal words that boost priority
const HIGH_PRIORITY_WORDS   = ['breaking','urgent','exclusive','crisis','record','historic','landmark','ban','war','attack','billion','trillion','collapse','surge','crash','sanctions','arrêté','ministerial','royal decree','emergency'];
const MEDIUM_PRIORITY_WORDS = ['new report','agreement','partnership','launch','opens','expands','forecast','announces','growth','decline','update'];

// ── STATE ────────────────────────────────────────────────────
let allArticles   = [];
let activeFilter  = 'all';
let activePriority = 'all';
let searchQuery   = '';
let isListView    = false;
let sourceStatuses = {};

// ── DOM REFS ─────────────────────────────────────────────────
const loadingState  = document.getElementById('loadingState');
const errorState    = document.getElementById('errorState');
const newsGrid      = document.getElementById('newsGrid');
const emptyState    = document.getElementById('emptyState');
const lastUpdated   = document.getElementById('lastUpdated');
const statTotal     = document.getElementById('statTotal');
const statFiltered  = document.getElementById('statFiltered');
const statSources   = document.getElementById('statSources');
const tickerInner   = document.getElementById('tickerInner');
const dailyBrief    = document.getElementById('dailyBrief');
const trendingList  = document.getElementById('trendingList');
const coverageMap   = document.getElementById('coverageMap');
const sourceList    = document.getElementById('sourceList');
const searchInput   = document.getElementById('searchInput');

// Modal
const modalOverlay  = document.getElementById('modalOverlay');
const modalClose    = document.getElementById('modalClose');
const modalTitle    = document.getElementById('modalTitle');
const modalSummary  = document.getElementById('modalSummary');
const modalSource   = document.getElementById('modalSource');
const modalDate     = document.getElementById('modalDate');
const modalCategory = document.getElementById('modalCategory');
const modalLink     = document.getElementById('modalLink');
const modalCopy     = document.getElementById('modalCopy');
const modalPublish  = document.getElementById('modalPublishBlock');
const publishText   = document.getElementById('publishText');

// ── UTILS ────────────────────────────────────────────────────
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

function saveToStorage() {
  try {
    const data = JSON.stringify(allArticles.slice(0, 2000));
    localStorage.setItem('KHALEEJ_ARCHIVE', data);
  } catch(e) {}
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem('KHALEEJ_ARCHIVE');
    if (data) {
      allArticles = JSON.parse(data);
      // Migration: Repair old articles missing new metadata
      let repaired = false;
      allArticles.forEach(a => {
        if (a.isUAE === undefined || !a.priority || !a.category) {
          const score = scoreArticle(a, a.category || 'global');
          Object.assign(a, score);
          repaired = true;
        }
      });
      if (repaired) saveToStorage();
    }
  } catch(e) {}
}

function relativeTime(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)   return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

function scoreArticle(item, defaultCat) {
  const content = (item.title + ' ' + (item.description || item.rawDesc || '')).toLowerCase();
  
  const SILOS = {
    'uae': ['uae','dubai','abu dhabi','sharjah','emirate','government','golden visa','sheikh','emaar','nakheel','adnoc',' gold souq','etisalat'],
    'economy': ['economy','economic','gdp','inflation','business','merger','acquisition','ipo','startup','venture','mubadala','growth','zawya','arabian business','fitch','moody'],
    'politics': ['political','diplomacy','summit', 'gcc','gulf cooperation council','saudi','qatar','kuwait','oman','bahrain','war','conflict','regional stability'],
    'rankings': ['ranking','ranked','global ranking','index','top 10','top 5','competitiveness','innovation','happiness',' паспорт','henley','achievement','award','leader','leading','success','best city'],
    'markets': ['gold','xau','precious metal','bullion','spot price','jewellery', 'bitcoin','btc','crypto','cryptocurrency','blockchain','ethereum','eth','token','investing.com','kitco']
  };

  let category = defaultCat || 'global';
  for (let [cat, keys] of Object.entries(SILOS)) {
    if (keys.some(k => content.includes(k))) { category = cat; break; }
  }
  
  // RANKINGS SOVEREIGNTY: If a source is dedicated to rankings, and mentions UAE, keep it in rankings.
  if (defaultCat === 'rankings') category = 'rankings';

  // Priority detection
  let priority = 'low';
  if (HIGH_PRIORITY_WORDS.some(w => content.toLowerCase().includes(w.toLowerCase()))) priority = 'high';
  else if (MEDIUM_PRIORITY_WORDS.some(w => content.toLowerCase().includes(w.toLowerCase()))) priority = 'medium';
  else if (category !== 'global') priority = 'medium';

  const isUAE = category === 'uae' || SILOS.uae.some(k => content.includes(k));
  
  return { category, isUAE, priority, relevanceScore: priority === 'high' ? 10 : 5 };
}

function buildSummary(description) {
  const clean = stripHtml(description).trim().replace(/\s+/g,' ');
  if (!clean || clean.length < 20) return 'Click to read the full article.';
  return clean.length > 240 ? clean.slice(0, 237) + '…' : clean;
}

// ── FETCH — with multi-proxy fallback ───────────────────────
async function fetchWithProxy(url) {
  const shuffled = [...PROXIES].sort(() => Math.random() - 0.5);
  for (const proxyFn of shuffled) {
    try {
      const separator = url.includes('?') ? '&' : '?';
      const cacheBustedUrl = `${url}${separator}live_radar_v5=${Date.now()}`;
      // Reduced timeout to 4000ms for faster fallback
      const res = await fetch(proxyFn(cacheBustedUrl), { signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;
      const text = await res.text();
      if (text && text.length > 200) return text; 
    } catch (_) {}
  }
  throw new Error('All satellites blocked.');
}

async function fetchFeed(source) {
  const rawXml = await fetchWithProxy(source.url);
  const xml    = new DOMParser().parseFromString(rawXml, 'text/xml');
  const items  = [...xml.querySelectorAll('item')];
  return items.map(item => {
    const title       = item.querySelector('title')?.textContent?.trim() || '';
    const link        = item.querySelector('link')?.textContent?.trim() || '#';
    const description = item.querySelector('description')?.textContent?.trim() || '';
    const pubDate     = item.querySelector('pubDate')?.textContent?.trim() || new Date().toISOString();
    return { title, link, description: buildSummary(description), rawDesc: description, pubDate,
             source: source.name, sourceLabel: source.label, isOfficial: !!source.isOfficial,
             id: btoa(encodeURIComponent(link)).slice(0, 12) };
  }).filter(a => a.title.length > 10);
}

async function loadAllFeeds(isInitial = false) {
  const needsLoading = isInitial && allArticles.length === 0;
  if (needsLoading) {
    loadingState.style.display = 'flex';
    newsGrid.style.display     = 'none';
  }
  
  lastUpdated.innerHTML    = '<span class="radar-scan"></span> Background Sync Active...';
  lastUpdated.style.color    = '#0abfbc';

  // Optimized: Parallel fetch for massive speed increase
  // We use Promise.allSettled to ensure one failing source doesn't block the rest
  const results = await Promise.allSettled(SOURCES.map(s => fetchFeed(s)));
  
  let successCount = 0;
  results.forEach((res, index) => {
    const s = SOURCES[index];
    if (res.status === 'fulfilled') {
      const feedItems = res.value;
      feedItems.forEach(item => {
        const exists = allArticles.some(ex => ex.link === item.link || (ex.title === item.title && ex.source === item.source));
        if (!exists) {
          const score = scoreArticle(item, s.cat);
          Object.assign(item, score); 
          allArticles.unshift(item);
        }
      });
      successCount++;
      sourceStatuses[s.name] = 'online';
    } else {
      console.warn(`Failed: ${s.name}`, res.reason);
      sourceStatuses[s.name] = 'error';
    }
  });

  allArticles = allArticles.slice(0, 2000);
  saveToStorage();

  loadingState.style.display = 'none';
  newsGrid.style.display     = 'grid';
  errorState.style.display   = 'none';
  updateStats(allArticles, successCount);
  renderSourceList();
  renderTicker();
  renderRightPanel();
  applyFiltersAndRender();

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-AE', { hour:'2-digit', minute:'2-digit' });
  lastUpdated.innerHTML = `<span class="radar-scan"></span> All Satellites Green (${timeStr})`;
}


function notifyNewHighPriority(title) {
  const originalTitle = document.title;
  let count = 0;
  const interval = setInterval(() => {
    document.title = (count % 2 === 0) ? `🚨 NEW: ${title.slice(0, 25)}...` : originalTitle;
    if (++count > 20) { clearInterval(interval); document.title = originalTitle; }
  }, 1000);
}

// ── FALLBACK DEMO DATA ───────────────────────────────────────
function loadDemoFallback() {
  const demo = [
    { id:'d1', title:'Dubai Tops Global Competitiveness Index for Third Year',            category:'rankings', priority:'high',   source:'WAM', sourceLabel:'WAM', pubDate: new Date().toISOString(), link:'#', description: 'Dubai has been ranked first globally in the latest edition of the World Competitiveness Report, citing infrastructure excellence and ease of doing business as key drivers.' },
    { id:'d2', title:'UAE Economy Grows 5.4% in Q1, Driven by Non-Oil Sector Surge',     category:'economy',  priority:'high',   source:'Gulf News', sourceLabel:'GN', pubDate: new Date().toISOString(), link:'#', description: 'The UAE\'s non-oil economy expanded at its fastest pace in six years, driven by tourism, logistics and financial services growth.' },
    { id:'d3', title:'Sheikh Mohammed Chairs Cabinet Session on AI National Strategy',    category:'uae',      priority:'high',   source:'WAM', sourceLabel:'WAM', pubDate: new Date().toISOString(), link:'#', description: 'His Highness Sheikh Mohammed bin Rashid Al Maktoum presided over the UAE Cabinet, approving the updated National Artificial Intelligence Strategy 2031.' },
    { id:'d4', title:'GCC Leaders Convene Emergency Summit on Regional Stability',        category:'politics', priority:'high',   source:'Arab News', sourceLabel:'AN', pubDate: new Date().toISOString(), link:'#', description: 'Gulf Cooperation Council heads of state met in Riyadh for an extraordinary summit to discuss geopolitical developments across the Middle East.' },
    { id:'d5', title:'ADNOC Signs $10 Billion Energy Deal with Asian Partners',           category:'economy',  priority:'medium', source:'National', sourceLabel:'NAT', pubDate: new Date().toISOString(), link:'#', description: 'Abu Dhabi National Oil Company has signed multi-billion dollar energy supply agreements with South Korean and Japanese firms.' },
    { id:'d6', title:'Dubai Real Estate Sector Records Highest Q1 Transactions in Decade',category:'economy',  priority:'medium', source:'Khaleej Times', sourceLabel:'KT', pubDate: new Date().toISOString(), link:'#', description: 'Property sales in Dubai reached AED 92 billion in Q1, a 22% increase driven by high-net-worth investors from Europe and Asia.' },
    { id:'d7', title:'UAE Ranked 2nd Globally for Government Digital Services',           category:'rankings', priority:'medium', source:'WAM', sourceLabel:'WAM', pubDate: new Date().toISOString(), link:'#', description: 'The OECD Digital Government Index placed the UAE in second place globally, commending its seamless integration of AI-driven public services.' },
    { id:'d8', title:'OPEC+ Agrees to Further Oil Output Reduction Amid Market Pressures',category:'economy',  priority:'high',   source:'Reuters', sourceLabel:'Reuters', pubDate: new Date().toISOString(), link:'#', description: 'OPEC+ members agreed to extend production cuts through Q3, sending crude prices toward $90 per barrel.' },
    { id:'d9', title:'UAE Ministry Launches New Golden Visa Categories for Scientists',   category:'uae',      priority:'medium', source:'Gulf News', sourceLabel:'GN', pubDate: new Date().toISOString(), link:'#', description: 'The UAE has expanded its Golden Visa programme to include scientists, researchers, and outstanding students in STEM fields.' },
    { id:'d10',title:'IMF Upgrades UAE Growth Forecast to 5.1% for 2026',               category:'rankings', priority:'medium', source:'BBC', sourceLabel:'BBC', pubDate: new Date().toISOString(), link:'#', description: 'The International Monetary Fund revised the UAE\'s economic growth projection upward, citing robust non-oil activity and strong FDI inflows.' },
  ];
  demo.forEach(a => { a.relevanceScore = a.priority === 'high' ? 10 : 5; });
  allArticles = demo;
  updateStats(demo, 0);
  renderTicker();
  renderRightPanel();
  applyFiltersAndRender();
  // Show update time even for demo
  lastUpdated.textContent = `Demo data — ${new Date().toLocaleTimeString('en-AE', { hour:'2-digit', minute:'2-digit' })}`;
}

// ── STATS ────────────────────────────────────────────────────
function updateStats(articles, sources) {
  statTotal.textContent     = articles.length + (articles.length === 10 ? '' : '');
  statFiltered.textContent  = articles.filter(a => a.priority === 'high').length;
  statSources.textContent   = sources !== undefined ? sources : SOURCES.length;
}

// ── TICKER ─────────────────────────────────────────────────
function renderTicker() {
  // Prioritize Official/Verified HIGH priority news first
  const highArticles = allArticles.filter(a => a.priority === 'high');
  highArticles.sort((a,b) => (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0));
  
  const headlines = highArticles.slice(0, 8);
  if (!headlines.length) return;
  tickerInner.textContent = headlines.map(a => `  ●  ${a.isOfficial ? '[OFFICIAL] ' : ''}${a.title}`).join('  ');
}

// ── SOURCE LIST ──────────────────────────────────────────────
function renderSourceList() {
  sourceList.innerHTML = SOURCES.map(s => `
    <div class="source-item">
      <span>${s.name}</span>
      <span class="source-status ${sourceStatuses[s.name] === 'error' ? 'error' : ''}"></span>
    </div>
  `).join('');
}

// ── RIGHT PANEL ──────────────────────────────────────────────
function renderRightPanel() {
  renderDailyBrief();
  renderTrending();
  renderCoverage();
}

function renderDailyBrief() {
  const sections = Object.entries(CATEGORIES).map(([key, cat]) => {
    // FOR BRIEF: UAE/Economy/Politics/Rankings sections MUST follow the isUAE rule
    const items = allArticles.filter(a => {
      if (key === 'uae') return a.isUAE;
      if (key === 'economy') return a.category === 'economy' && a.isUAE;
      if (key === 'rankings') return a.category === 'rankings' && a.isUAE;
      if (key === 'politics') return a.category === 'politics' && a.isUAE;
      return a.category === key;
    }).slice(0, 3);

    if (!items.length) return '';
    const bullets = items.map(a => `<div class="brief-bullet">${a.title}</div>`).join('');
    return `<div class="brief-section"><div class="brief-section-title">${cat.icon} ${cat.label}</div>${bullets}</div>`;
  }).join('');
  dailyBrief.innerHTML = sections || '<p class="brief-placeholder">System is generating local brief…</p>';
}

function renderTrending() {
  // Sort by Priority (High first), then Official status
  const trending = [...allArticles].sort((a,b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (b.priority === 'high' && a.priority !== 'high') return 1;
    if (a.isOfficial && !b.isOfficial) return -1;
    if (b.isOfficial && !a.isOfficial) return 1;
    return 0;
  });

  const top5 = trending.slice(0, 5);
  trendingList.innerHTML = top5.map((a, i) => `
    <div class="trending-item">
      <span class="trending-num">${i + 1}</span>
      <span class="trending-text">${a.isOfficial ? '[WAM] ' : ''}${a.title.slice(0, 75)}${a.title.length > 75 ? '…' : ''}</span>
    </div>
  `).join('');
}

function renderCoverage() {
  const total = allArticles.length || 1;
  const catColors = { uae: 'var(--cat-uae)', economy: 'var(--cat-economy)', politics: 'var(--cat-politics)', rankings: 'var(--cat-rankings)' };
  coverageMap.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
    const count = allArticles.filter(a => a.category === key).length;
    const pct   = Math.round((count / total) * 100);
    return `
      <div class="coverage-row">
        <span class="coverage-label">${cat.icon} ${key === 'rankings' ? 'Rankings' : cat.label.split(' ')[0]}</span>
        <div class="coverage-bar-bg"><div class="coverage-bar-fill" style="width:${pct}%;background:${catColors[key]}"></div></div>
        <span class="coverage-pct">${pct}%</span>
      </div>`;
  }).join('');
}

// ── RENDER CARDS ─────────────────────────────────────────────
function applyFiltersAndRender() {
  let filtered = allArticles;

  if (activeFilter === 'all') {
    // Show Everything
  } else if (activeFilter === 'uae') {
    // UAE & Dubai Focus
    filtered = filtered.filter(a => a.isUAE);
  } else if (activeFilter === 'economy') {
    // Strict UAE & Dubai ECONOMY ONLY
    filtered = filtered.filter(a => a.category === 'economy' && a.isUAE);
  } else if (activeFilter === 'politics') {
    // Global & UAE Politics (Worldwide)
    filtered = filtered.filter(a => a.category === 'politics');
  } else if (activeFilter === 'rankings') {
    // UAE Global Rankings (Achievements only)
    filtered = filtered.filter(a => a.category === 'rankings' || a.sourceLabel === 'Credit');
  } else if (activeFilter === 'markets') {
    // Gold & Crypto (Analytic predicting)
    filtered = filtered.filter(a => a.category === 'markets');
  } else {
    filtered = filtered.filter(a => a.category === activeFilter);
  }

  if (activePriority !== 'all') filtered = filtered.filter(a => a.priority === activePriority);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }

  // Update counts (Universal Match Logic — MUST MATCH GRID FILTERS)
  document.getElementById('count-all').textContent      = allArticles.length;
  document.getElementById('count-uae').textContent      = allArticles.filter(a => a.isUAE).length;
  document.getElementById('count-economy').textContent  = allArticles.filter(a => a.category === 'economy' && a.isUAE).length;
  document.getElementById('count-politics').textContent = allArticles.filter(a => a.category === 'politics').length;
  document.getElementById('count-rankings').textContent = allArticles.filter(a => a.category === 'rankings' || a.sourceLabel === 'Credit').length;
  document.getElementById('count-markets').textContent  = allArticles.filter(a => a.category === 'markets').length;

  // Section title
  const titles = { all: 'All Topics', uae: '🇦🇪 UAE & Dubai', economy: '📈 Economy & Business', politics: '🏛️ Politics & GCC', rankings: '🏆 Global Rankings', markets: '💰 Gold & Crypto' };
  document.getElementById('sectionTitle').textContent = titles[activeFilter];

  if (!filtered.length) {
    newsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';
  newsGrid.style.display   = 'grid';
  newsGrid.innerHTML = filtered.map((a, i) => renderCard(a, i)).join('');

  // Card click handlers
  newsGrid.querySelectorAll('.news-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = +card.dataset.idx;
      openModal(filtered[idx]);
    });
  });
}

function renderCard(a, i) {
  const isFeatured = i === 0 && activeFilter === 'all' && activePriority === 'all' && !searchQuery;
  const catLabel   = CATEGORIES[a.category]?.label.split(' ')[0] || a.category;
  const listClass  = isListView ? 'list-view' : '';
  const featuredBadge = isFeatured ? `<div class="featured-badge">★ Top Story</div>` : '';

  if (isFeatured) {
    return `
      <div class="news-card featured ${listClass}" data-idx="${i}" data-id="${a.id}">
        <div class="card-accent ${a.category}"></div>
        <div class="card-body">
          ${featuredBadge}
          <div class="card-meta">
            <span class="card-cat ${a.category || 'global'}">${catLabel}</span>
            <span class="card-priority ${a.priority || 'medium'}"><span class="dot"></span>${(a.priority || 'medium').toUpperCase()}</span>
          </div>
          <div class="card-title">${a.title || 'Untitled Report'}</div>
          <div class="card-summary">${a.description || ''}</div>
          <div class="card-footer">
            <span class="card-source">${a.isOfficial ? '<span class="verified-badge">✓ Verified</span> ' : ''}${a.source}</span>
            <span class="card-time">${relativeTime(a.pubDate)}</span>
            <span class="card-read">Read more →</span>
          </div>
        </div>
      </div>`;
  }

  return `
    <div class="news-card ${listClass}" data-idx="${i}" data-id="${a.id}" style="animation-delay:${Math.min(i * 0.04, 0.5)}s">
      <div class="card-accent ${a.category}"></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-cat ${a.category || 'global'}">${catLabel}</span>
          <span class="card-priority ${a.priority || 'medium'}"><span class="dot"></span>${(a.priority || 'medium').toUpperCase()}</span>
        </div>
        <div class="card-title">${a.title || 'Untitled Report'}</div>
        <div class="card-summary">${a.description || ''}</div>
        <div class="card-footer">
          <span class="card-source">${a.isOfficial ? '<span class="verified-badge">✓ Verified</span> ' : ''}${a.source}</span>
          <span class="card-time">${relativeTime(a.pubDate)}</span>
          <span class="card-read">Read more →</span>
        </div>
      </div>
    </div>`;
}

// ── MODAL ────────────────────────────────────────────────────
function openModal(article) {
  modalTitle.textContent    = article.title;
  modalSummary.textContent  = article.description;
  modalSource.textContent   = article.source;
  modalDate.textContent     = relativeTime(article.pubDate);
  modalCategory.textContent = CATEGORIES[article.category]?.label || article.category;
  modalLink.href            = article.link;
  modalPublish.style.display = 'none';
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Generate publish snippet
  const snippet = `📌 ${CATEGORIES[article.category]?.label?.toUpperCase() || 'NEWS'}\n\n${article.title}\n\n${article.description}\n\nSource: ${article.source} | ${new Date(article.pubDate).toLocaleDateString('en-AE', { day:'numeric', month:'long', year:'numeric' })}`;
  publishText.textContent = snippet;
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

modalCopy.addEventListener('click', () => {
  modalPublish.style.display = modalPublish.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('copyPublishBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(publishText.textContent).then(() => {
    const btn = document.getElementById('copyPublishBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy Snippet'; btn.classList.remove('copied'); }, 2000);
  });
});

// ── FILTERS ──────────────────────────────────────────────────
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFiltersAndRender();
  });
});

document.querySelectorAll('[data-priority]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-priority]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activePriority = btn.dataset.priority;
    applyFiltersAndRender();
  });
});

// ── SEARCH ───────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  applyFiltersAndRender();
});

// ── VIEW TOGGLE ──────────────────────────────────────────────
document.getElementById('viewGrid').addEventListener('click', () => {
  isListView = false;
  newsGrid.classList.remove('list-view');
  document.getElementById('viewGrid').classList.add('active');
  document.getElementById('viewList').classList.remove('active');
  applyFiltersAndRender();
});
document.getElementById('viewList').addEventListener('click', () => {
  isListView = true;
  newsGrid.classList.add('list-view');
  document.getElementById('viewList').classList.add('active');
  document.getElementById('viewGrid').classList.remove('active');
  applyFiltersAndRender();
});

// ── REFRESH ──────────────────────────────────────────────────
document.getElementById('refreshBtn').addEventListener('click', loadAllFeeds);

// ── DAILY BRIEF COPY ────────────────────────────────────────
document.getElementById('copyBriefBtn').addEventListener('click', () => {
  const text = allArticles.slice(0, 8).map(a => `• [${(CATEGORIES[a.category]?.label || a.category).toUpperCase()}] ${a.title}`).join('\n');
  const full  = `EDITORIAL BRIEF — ${new Date().toLocaleDateString('en-AE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}\n\n${text}\n\nGenerated by خنساء Editorial Intelligence`;
  navigator.clipboard.writeText(full).then(() => {
    const btn = document.getElementById('copyBriefBtn');
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2200);
  });
});

// ══════════════════════════════════════════════════════════════
//  ARABIC EDITORIAL STUDIO
// ══════════════════════════════════════════════════════════════

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=';
let arabicHistory = JSON.parse(localStorage.getItem('arabicHistory') || '[]');

// ── Engine state ─────────────────────────────────────────────
function getGeminiKey()  { return localStorage.getItem('geminiApiKey') || ''; }
function hasGeminiKey()  { return !!getGeminiKey(); }

function updateEngineDisplay() {
  const dot   = document.getElementById('engineDot');
  const label = document.getElementById('engineLabel');
  if (!dot || !label) return;
  if (hasGeminiKey()) {
    dot.className   = 'engine-dot gemini';
    label.textContent = '✦ Gemini AI — Full editorial rewriting active';
  } else {
    dot.className   = 'engine-dot fallback';
    label.textContent = '⚠ Fallback mode — Basic translation (set API key for full rewriting)';
  }
}

// ── Arabic prompt builder ─────────────────────────────────────
function buildPrompt(text, format, tone) {
  const formatInstructions = {
    article:  'اكتب خبراً صحفياً كاملاً يتضمن عنواناً رئيسياً قوياً، ومقدمة قصيرة، وجسم الخبر بأسلوب الهرم المقلوب. لا تقل عن 150 كلمة.',
    brief:    'اكتب خبراً مقتضباً لا يتجاوز 80 كلمة يتضمن العنوان والمعلومة الأساسية فقط.',
    analysis: 'اكتب تحليلاً صحفياً معمقاً يشرح السياق والأبعاد والتداعيات المحتملة بأسلوب تحليلي رصين. لا يقل عن 200 كلمة.',
    headline: 'أعد صياغة هذا الخبر كعنوان صحفي رئيسي لا يتجاوز 15 كلمة، قوي وجذاب ومباشر.'
  };
  const toneInstructions = {
    formal:     'استخدم أسلوباً رسمياً وأكاديمياً مناسباً للصحافة الإماراتية الرسمية.',
    neutral:    'استخدم أسلوباً محايداً موضوعياً مشابهاً لوكالات الأنباء الدولية.',
    analytical: 'استخدم أسلوباً تحليلياً نقدياً يعكس عمق الفهم والخبرة الصحفية.'
  };

  return `أنت محرر صحفي عربي محترف متخصص في إعداد المحتوى للصحافة الإماراتية والخليجية. مهمتك إعادة صياغة المقال التالي ليصبح تقريراً صحفياً عربياً احترافياً جاهزاً للنشر.

تعليمات إلزامية:
- استخدم اللغة العربية الفصحى الرسمية المناسبة للصحافة الإماراتية
- تجنب الترجمة الحرفية كلياً — أعد البناء اللغوي بالكامل
- استخدم المصطلحات والتعابير الصحفية العربية المعتمدة
- ابدأ بعنوان رئيسي قوي (مميز بسطر واحد)
- اكتب بأسلوب يبدو وكأنه نُشر أصلاً بالعربية وليس مترجماً
- تجنب الأسلوب الأجنبي في بناء الجمل
- لا تضف تعليقات أو ملاحظات — أخرج النص الصحفي فقط

تعليمات الصيغة: ${formatInstructions[format] || formatInstructions.article}
تعليمات الأسلوب: ${toneInstructions[tone] || toneInstructions.formal}

النص الإنجليزي المراد تحريره:
"""
${text.trim()}
"""

أعد كتابة المحتوى أعلاه بالعربية الصحفية الاحترافية الآن:`;
}

// ── Gemini API call ───────────────────────────────────────────
async function rewriteWithGemini(text, format, tone) {
  const key = getGeminiKey();
  if (!key) throw new Error('NO_KEY');
  const prompt = buildPrompt(text, format, tone);
  const res = await fetch(GEMINI_ENDPOINT + key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
    }),
    signal: AbortSignal.timeout(30000)
  });
  if (res.status === 400) throw new Error('INVALID_KEY');
  if (res.status === 429) throw new Error('RATE_LIMIT');
  if (!res.ok) throw new Error('API_ERROR_' + res.status);
  const data = await res.json();
  const result = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!result) throw new Error('EMPTY_RESPONSE');
  return result.trim();
}

// ── MyMemory fallback ─────────────────────────────────────────
async function rewriteWithFallback(text) {
  // Translate chunks (MyMemory limit ~500 chars per call)
  const chunks = [];
  const words  = text.split(' ');
  let current  = '';
  for (const word of words) {
    if ((current + ' ' + word).length > 480) { chunks.push(current.trim()); current = word; }
    else current += ' ' + word;
  }
  if (current.trim()) chunks.push(current.trim());

  const translated = [];
  for (const chunk of chunks) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|ar`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    translated.push(data?.responseData?.translatedText || chunk);
    await new Promise(r => setTimeout(r, 200));
  }
  return '⚠️ ترجمة آلية (ليست تحريراً صحفياً)\n\n' + translated.join(' ');
}

// ── Main rewrite orchestrator ─────────────────────────────────
async function doRewrite(text, format, tone, targetTextEl, targetMetaEl, wordCountEl) {
  let result, engine;
  try {
    if (!hasGeminiKey()) throw new Error('NO_KEY');
    result = await rewriteWithGemini(text, format, tone);
    engine = 'Gemini AI';
  } catch (err) {
    if (err.message === 'INVALID_KEY') {
      localStorage.removeItem('geminiApiKey');
      updateEngineDisplay();
      result = await rewriteWithFallback(text);
      engine = 'MyMemory (key invalid, reset)';
    } else if (err.message === 'RATE_LIMIT') {
      result = await rewriteWithFallback(text);
      engine = 'MyMemory (rate limit reached)';
    } else {
      result = await rewriteWithFallback(text);
      engine = 'MyMemory (fallback)';
    }
  }

  targetTextEl.textContent = result;
  if (targetMetaEl) targetMetaEl.textContent = `Engine: ${engine} • ${new Date().toLocaleTimeString('en-AE', { hour:'2-digit', minute:'2-digit' })}`;
  if (wordCountEl) {
    const wc = result.trim().split(/\s+/).length;
    wordCountEl.textContent = `${wc} كلمة`;
  }
  return result;
}

// ── STUDIO PANEL UI ───────────────────────────────────────────
const studioOverlay  = document.getElementById('studioOverlay');
const studioIdle     = document.getElementById('studioIdle');
const studioLoading  = document.getElementById('studioLoading');
const studioResult   = document.getElementById('studioResult');
const arabicResultText = document.getElementById('arabicResultText');
const resultMeta     = document.getElementById('resultMeta');
const resultWordCount= document.getElementById('resultWordCount');
const studioHistory  = document.getElementById('studioHistory');

function openStudio(prefill) {
  studioOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  updateEngineDisplay();
  if (prefill) {
    document.getElementById('studioInputText').value = prefill;
  }
  renderHistory();
}
function closeStudio() {
  studioOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('openStudioBtn').addEventListener('click', () => openStudio());
document.getElementById('closeStudioBtn').addEventListener('click', closeStudio);
studioOverlay.addEventListener('click', e => { if (e.target === studioOverlay) closeStudio(); });

document.getElementById('studioRewriteBtn').addEventListener('click', async () => {
  const text   = document.getElementById('studioInputText').value.trim();
  const format = document.getElementById('studioFormat').value;
  const tone   = document.getElementById('studioTone').value;
  if (!text || text.length < 10) {
    document.getElementById('studioInputText').style.borderColor = 'var(--accent-red)';
    setTimeout(() => document.getElementById('studioInputText').style.borderColor = '', 2000);
    return;
  }
  // Show loading
  studioIdle.style.display    = 'none';
  studioResult.style.display  = 'none';
  studioLoading.style.display = 'flex';
  document.getElementById('studioRewriteBtn').disabled = true;
  document.getElementById('rewriteBtnText').style.display = 'none';
  document.getElementById('rewriteSpinner').style.display = 'block';

  try {
    const result = await doRewrite(text, format, tone, arabicResultText, resultMeta, resultWordCount);
    studioLoading.style.display = 'none';
    studioResult.style.display  = 'flex';
    // Save to history
    arabicHistory.unshift({ input: text.slice(0, 80), output: result, ts: Date.now() });
    if (arabicHistory.length > 10) arabicHistory = arabicHistory.slice(0, 10);
    localStorage.setItem('arabicHistory', JSON.stringify(arabicHistory));
    renderHistory();
  } catch (err) {
    studioLoading.style.display = 'none';
    studioIdle.style.display    = 'flex';
    studioIdle.querySelector('p').textContent = 'حدث خطأ، يرجى المحاولة مجدداً';
  } finally {
    document.getElementById('studioRewriteBtn').disabled = false;
    document.getElementById('rewriteBtnText').style.display = 'inline';
    document.getElementById('rewriteSpinner').style.display = 'none';
  }
});

document.getElementById('copyArabicBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(arabicResultText.textContent).then(() => {
    const btn = document.getElementById('copyArabicBtn');
    btn.textContent = '✓ تم النسخ!';
    setTimeout(() => { btn.textContent = '📋 نسخ النص'; }, 2000);
  });
});

document.getElementById('retryBtn').addEventListener('click', () => {
  studioResult.style.display = 'none';
  studioIdle.style.display   = 'flex';
  studioIdle.querySelector('p').textContent = 'أدخل النص الإنجليزي واضغط «تحرير عربي»';
});

function renderHistory() {
  if (!arabicHistory.length) { studioHistory.style.display = 'none'; return; }
  studioHistory.style.display = 'block';
  document.getElementById('historyList').innerHTML = arabicHistory.map((item, i) => `
    <div class="history-item" data-idx="${i}">
      <div class="history-item-title">${item.output.slice(0, 80)}…</div>
    </div>`).join('');
  document.getElementById('historyList').querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const h = arabicHistory[+el.dataset.idx];
      document.getElementById('studioInputText').value = h.input;
      arabicResultText.textContent = h.output;
      studioIdle.style.display   = 'none';
      studioResult.style.display = 'flex';
    });
  });
}

// ── API KEY MODAL ─────────────────────────────────────────────
const apikeyOverlay = document.getElementById('apikeyOverlay');
function openApiSetup() { apikeyOverlay.classList.add('open'); }
function closeApiSetup() { apikeyOverlay.classList.remove('open'); }

document.getElementById('openApiSetupBtn').addEventListener('click', () => {
  document.getElementById('geminiKeyInput').value = getGeminiKey();
  openApiSetup();
});
document.getElementById('closeApiKeyBtn').addEventListener('click', closeApiSetup);
document.getElementById('skipApiKeyBtn').addEventListener('click', closeApiSetup);

document.getElementById('toggleKeyVisibility').addEventListener('click', () => {
  const inp = document.getElementById('geminiKeyInput');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

document.getElementById('saveApiKeyBtn').addEventListener('click', () => {
  const key = document.getElementById('geminiKeyInput').value.trim();
  if (!key || key.length < 20) {
    document.getElementById('geminiKeyInput').style.borderColor = 'var(--accent-red)';
    setTimeout(() => document.getElementById('geminiKeyInput').style.borderColor = '', 2000);
    return;
  }
  localStorage.setItem('geminiApiKey', key);
  updateEngineDisplay();
  const btn = document.getElementById('saveApiKeyBtn');
  btn.textContent = '✓ Activated!';
  btn.style.background = 'var(--accent-green)';
  setTimeout(() => {
    btn.textContent = 'Save & Activate';
    btn.style.background = '';
    closeApiSetup();
  }, 1600);
});

// ── MODAL "Rewrite in Arabic" button ─────────────────────────
document.getElementById('modalRewriteArabic').addEventListener('click', async () => {
  const title   = document.getElementById('modalTitle').textContent;
  const summary = document.getElementById('modalSummary').textContent;
  const full    = `${title}\n\n${summary}`;
  const resultDiv = document.getElementById('modalArabicResult');
  const textDiv   = document.getElementById('modalArabicText');
  const btn       = document.getElementById('modalRewriteArabic');

  resultDiv.style.display = 'block';
  textDiv.textContent     = 'جارٍ إعداد التحرير الصحفي العربي...';
  btn.disabled = true;
  btn.textContent = '⏳ جارٍ...';

  try {
    await doRewrite(full, 'article', 'formal', textDiv, null, null);
  } catch {
    textDiv.textContent = 'حدث خطأ. تأكد من اتصالك بالإنترنت.';
  } finally {
    btn.disabled = false;
    btn.textContent = '✍️ تحرير عربي';
  }
});

document.getElementById('copyModalArabicBtn').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('modalArabicText').textContent).then(() => {
    const btn = document.getElementById('copyModalArabicBtn');
    btn.textContent = '✓ تم';
    setTimeout(() => { btn.textContent = 'نسخ'; }, 2000);
  });
});

// ── First-time: prompt API key setup ─────────────────────────
if (!hasGeminiKey() && !localStorage.getItem('studioSetupSeen')) {
  localStorage.setItem('studioSetupSeen', '1');
  // Don't auto-open — let user discover it naturally
}

// ── FIRST LOAD ───────────────────────────────────────────────
loadFromStorage();

// 🗑️ AUTO-CLEANUP: Remove news older than 48 hours (2 days)
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const now = Date.now();
allArticles = allArticles.filter(a => {
  const pubDate = new Date(a.pubDate).getTime();
  return (now - pubDate) < TWO_DAYS_MS;
});
saveToStorage();

loadAllFeeds(true); // Initial load with spinner
setInterval(() => loadAllFeeds(false), 2 * 60 * 1000); // 2-Minute Market Pulse (Shadow Scan)
updateEngineDisplay();
