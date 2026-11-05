"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { axes, frequencyLabels, modeInfo, questionsForMode, scoreAnswers, type QuizMode, type Report } from "../lib/quiz";
import { interpretTrait, reportReflection } from "./interpretations";
import { downloadCard } from "./sharePoster";

type View = "home" | "quiz" | "result" | "archive" | "method";
// v2 uses interleaved question order; older in-progress answers cannot be reinterpreted.
const PROGRESS_KEY = "fieldnotes_pages_progress_v2";
const HISTORY_KEY = "fieldnotes_pages_reports_v1";
type Progress = { mode: QuizMode; answers: (number|null)[]; index: number };
const emptyAnswers = (mode: QuizMode) => Array<number|null>(questionsForMode(mode).length).fill(null);

function Seal({ small = false }: { small?: boolean }) {
  return <span className={`brand-seal ${small ? "brand-seal-small" : ""}`} aria-hidden="true"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="20" fill="none" stroke="currentColor" strokeWidth=".8"/><circle cx="22" cy="22" r="14" fill="none" stroke="currentColor" strokeWidth=".6"/><path d="M22 5 26 18 39 22 26 26 22 39 18 26 5 22 18 18Z" fill="none" stroke="currentColor" strokeWidth=".95"/><circle cx="22" cy="22" r="3.5" fill="currentColor"/></svg></span>;
}

const cardOrder=[0,4,6,1,5,2,3] as const;
const virtueArt=["humility","kindness","patience","diligence","generosity","temperance","chastity"] as const;
function CardArt({ axis, loading="lazy", kind="sin" }: {axis:number;loading?:"lazy"|"eager";kind?:"sin"|"virtue"}) {
  return <img src={`${import.meta.env.BASE_URL}assets/${kind==="sin"?"sins":"virtues"}/${kind==="sin"?axes[axis].art:virtueArt[axis]}.webp`} loading={loading} alt={`${kind==="sin"?axes[axis].sin:axes[axis].virtue} · 白底钴蓝大理石雕塑卡牌`}/>;
}

function HeroCardComposition() {
  return <div className="hero-card-composition" aria-label="七宗罪古典卡牌作品选集">
    <div className="hero-astral-ring" aria-hidden="true"/>
    <div className="hero-art-card hero-art-card-left"><CardArt axis={1}/></div>
    <div className="hero-art-card hero-art-card-right"><CardArt axis={2}/></div>
    <div className="hero-art-card hero-art-card-center"><CardArt axis={0} loading="eager"/></div>
    <span className="hero-art-label">THE SEVEN ENGRAVINGS <i>·</i> 01—07</span>
  </div>;
}

function FlipDeck({report}:{report:Report}) {
  const [flipped,setFlipped]=useState<boolean[]>(()=>Array(7).fill(false));
  useEffect(()=>{setFlipped(Array(7).fill(false));},[report.id]);
  return <div className="flip-deck" aria-label="七宗罪七美德双面卡牌，点击卡牌翻面查看分数">
    {cardOrder.map((axisIndex,pos)=>{
      const axis=axes[axisIndex], pair=report.scores[axisIndex], isOpen=flipped[pos];
      return <button type="button" key={axis.sin} className={`flip-card ${isOpen?"is-flipped":""}`} aria-label={`${axis.sin}与${axis.virtue}，${isOpen?"点击翻回插画":"点击翻转查看两项分数"}`} aria-pressed={isOpen} onClick={()=>setFlipped(prev=>prev.map((v,i)=>i===pos?!v:v))}>
        <span className="flip-card-inner">
          <span className="flip-card-face flip-card-front"><CardArt axis={axisIndex}/><span className="flip-hint"><span>✧</span> CLICK TO REVEAL <span>↻</span></span></span>
          <span className="flip-card-face flip-card-back">
            <span className="flip-back-top"><span>FIELDNOTES / {String(pos+1).padStart(2,"0")}</span><span>✳</span></span>
            <span className="flip-back-virtue-portrait"><CardArt axis={axisIndex} kind="virtue"/></span>
            <span className="flip-back-heading">TWO SIDES<br/>OF ONE SELF</span>
            <span className="flip-back-rule"/>
            <span className="flip-score-group"><span className="flip-score-title">SHADOW / {axis.sin}</span><span className="flip-score-number">{pair.sin}<small>/100</small></span><span className="flip-score-track"><span style={{width:`${pair.sin}%`}}/></span></span>
            <span className="flip-score-group virtue"><span className="flip-score-title">LIGHT / {axis.virtue}</span><span className="flip-score-number">{pair.virtue}<small>/100</small></span><span className="flip-score-track"><span style={{width:`${pair.virtue}%`}}/></span></span>
            <span className="flip-back-note">两个维度独立计分<br/>不是此消彼长的比例</span>
            <span className="flip-back-bottom">TAP TO RETURN <span>↺</span></span>
          </span>
        </span>
      </button>;
    })}
  </div>;
}

function PortalArt() {
  return <svg className="portal-art" viewBox="0 0 600 590" role="img" aria-label="原创钴蓝天球、古典拱门与大理石头像线描插画">
    <defs>
      <linearGradient id="cobalt-grad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#547cff"/><stop offset="1" stopColor="#173bd1"/></linearGradient>
      <pattern id="fine-lines" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(26)"><path d="M0 0V5" stroke="#25273a" strokeOpacity=".18" strokeWidth=".7"/></pattern>
      <clipPath id="arch"><path d="M126 518V200C126 107 201 51 300 51S474 107 474 200V518Z"/></clipPath>
    </defs>
    <g opacity=".26" fill="none" stroke="#1a307e" strokeWidth=".8"><circle cx="307" cy="274" r="245"/><circle cx="307" cy="274" r="216"/><circle cx="307" cy="274" r="183"/><path d="M307 20v508M53 274h507M127 94l360 360M487 94 127 454" strokeDasharray="2 8"/></g>
    <g stroke="#25315a" strokeWidth="1.1" fill="none"><path d="M110 530V194C110 89 194 35 300 35s190 54 190 159v336"/><path d="M127 530V194C127 99 203 52 300 52s173 47 173 142v336"/><path d="M94 530h412M94 540h412M105 551h390"/><path d="M94 211h34M473 211h33"/></g>
    <g clipPath="url(#arch)"><path d="M126 518V200C126 107 201 51 300 51S474 107 474 200V518Z" fill="#fff"/>
      <ellipse cx="330" cy="257" rx="176" ry="70" fill="none" stroke="#174bff" strokeWidth="1.5" transform="rotate(-26 330 257)"/>
      <ellipse cx="330" cy="257" rx="133" ry="191" fill="none" stroke="#174bff" strokeOpacity=".65" strokeWidth="1.1" transform="rotate(63 330 257)"/>
      <circle cx="374" cy="222" r="99" fill="url(#cobalt-grad)"/>
      <g fill="none" stroke="#fff" strokeOpacity=".54" strokeWidth=".75"><ellipse cx="374" cy="222" rx="29" ry="99"/><ellipse cx="374" cy="222" rx="68" ry="99"/><path d="M275 222h198M288 174h172M288 268h172M309 137h129M309 307h129"/></g>
      <path d="M181 519c6-48 24-86 65-108l27-8 77 2c50 17 75 58 86 114" fill="#d8d8d6" stroke="#383b48" strokeWidth="1.3"/>
      <path d="M181 519c6-48 24-86 65-108l27-8 77 2c50 17 75 58 86 114" fill="url(#fine-lines)"/>
      <path d="M250 414c-18-19-28-55-24-91 3-22 8-48 18-73 7-14 18-30 31-41l54 4c34 19 47 53 44 85l-11 48-16 40 3 28-37 24-45-13Z" fill="#eae9e7" stroke="#2c2d31" strokeWidth="1.4"/>
      <path d="M280 212c-38 16-51 48-50 83l-12-7c-8-33-8-66 4-88 17-37 56-60 91-57 23 2 47 18 59 36 16 27 12 56 3 76l-11 10c-5-34-25-55-41-58-19-6-32-8-43 5Z" fill="#797979" stroke="#25252b" strokeWidth="1"/>
      <path d="M216 249c-21-27-8-62 15-83M237 189c-15-16-8-40 13-50M267 172c-7-26 12-45 34-45M323 151c17-14 46-1 56 25M358 180c27 7 37 39 25 57" fill="none" stroke="#4b4b55" strokeWidth="3"/>
      <g fill="none" stroke="#5b5c62" strokeWidth="1"><path d="M255 281q16-10 31-3M323 278q15-9 30-3M269 286l16 1M330 286l16-1M309 282l-8 42 17 3M291 353q19 8 36-2M283 368q28 15 51-1M255 312q6 33 22 43M344 315q-6 25-13 38M260 399l15 24M343 395l-11 28"/></g>
      <g stroke="#5c5c61" strokeWidth=".6" opacity=".55"><path d="M246 296l12 75M253 307l11 79M262 311l10 74M342 303l9 66M351 306l5 50M280 422l-16 98M289 427l-6 93M343 418l18 102M353 420l26 100"/></g>
      <path d="M170 520l89-65 15 20 39-41 24 26 26-20 91 80" fill="none" stroke="#174bff" strokeWidth="1.8"/>
      <g fill="#174bff"><path d="M158 117l4 12 12 4-12 4-4 12-4-12-12-4 12-4Z"/><circle cx="208" cy="172" r="3"/><circle cx="443" cy="346" r="3.5"/><path d="M430 107l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z"/></g>
    </g>
    <g fontFamily="Georgia,serif" fontSize="12" fill="#1d3ac6" letterSpacing="2"><text x="89" y="83">FIG. 01</text><text x="430" y="569">AEQUITAS</text></g>
    <path d="M60 484h66M474 484h66" stroke="#174bff" strokeWidth="1"/><circle cx="300" cy="35" r="4" fill="#174bff"/>
  </svg>;
}

function Radar({ values, labels, color, name }: { values: number[]; labels: string[]; color: string; name: string }) {
  const cx=178, cy=159, radius=104;
  const point=(i:number, scale:number) => { const angle=-Math.PI/2 + i*Math.PI*2/7; return `${cx+Math.cos(angle)*radius*scale},${cy+Math.sin(angle)*radius*scale}`; };
  const polygon=(scale:number) => Array.from({length:7},(_,i)=>point(i,scale)).join(" ");
  const data=values.map((v,i)=>point(i,Math.max(.025,v/100))).join(" ");
  return <svg className="radar" viewBox="0 0 356 328" role="img" aria-label={`${name}七维雷达图：${labels.map((l,i)=>`${l}${values[i]}分`).join('、')}`}>
    <title>{name}七维雷达</title>
    {[.25,.5,.75,1].map(s=><polygon key={s} points={polygon(s)} fill="none" stroke="#d7d8d6" strokeWidth="1"/>)}
    {Array.from({length:7},(_,i)=><line key={i} x1={cx} y1={cy} x2={point(i,1).split(',')[0]} y2={point(i,1).split(',')[1]} stroke="#dddeda" strokeWidth="1"/>)}
    <polygon points={data} fill={color} fillOpacity=".18" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    {values.map((v,i)=><circle key={i} cx={point(i,v/100).split(',')[0]} cy={point(i,v/100).split(',')[1]} r="3.5" fill={color} stroke="white" strokeWidth="1"/>)}
    {labels.map((label,i)=>{const angle=-Math.PI/2 + i*Math.PI*2/7; const x=cx+Math.cos(angle)*139; const y=cy+Math.sin(angle)*139;return <text key={i} x={x} y={y} textAnchor={Math.abs(x-cx)<15?"middle":x<cx?"end":"start"} dominantBaseline="middle" fontSize="13" fill="#3a3c46">{label}</text>})}
    <text x={cx+7} y={cy-57} fontSize="9" fill="#a1a3a6">50</text><text x={cx+7} y={cy-108} fontSize="9" fill="#a1a3a6">100</text>
  </svg>;
}

function PairBars({ report }: { report: Report }) {
  return <div className="pair-table">{axes.map((axis,i)=>{const p=report.scores[i]; return <div className="pair-row" key={axis.sin}>
    <span className="pair-roman">{axis.sigil}</span><span className="pair-name">{axis.sin}<small>{p.sin}</small></span>
    <div className="double-meter" aria-label={`${axis.sin}${p.sin}分，${axis.virtue}${p.virtue}分`}><div className="meter-sin" style={{width:`${p.sin}%`}}/><div className="meter-virtue" style={{width:`${p.virtue}%`}}/></div>
    <span className="pair-name virtue-name"><small>{p.virtue}</small>{axis.virtue}</span></div>})}</div>;
}

function TraitExplanations({report}:{report:Report}) {
  return <section className="trait-reading" aria-labelledby="reading-title">
    <div className="section-rule"><span>05 / THE NOTES BETWEEN THE LINES</span><span>OPEN EACH NOTE / 点击展开</span></div>
    <h2 className="section-display" id="reading-title">十四种倾向，各有故事。</h2>
    <p className="reading-intro">这些文字依据你在本问卷的回答频率分为三个解释区间，并结合社会比较、情绪调节、自我控制、共情等心理学概念撰写。请用真实经历检验它，任何句子都不是对你的诊断。</p>
    <div className="reading-columns">{(["sin","virtue"] as const).map(kind=><div className={`reading-column ${kind}`} key={kind}>
      <div className="reading-column-header"><span>{kind==="sin"?"I / THE SHADOW":"II / THE LIGHT"}</span><strong>{kind==="sin"?"七种暗影":"七种光亮"}</strong></div>
      {axes.map((axis,i)=>{const note=interpretTrait(i,kind,report.scores[i][kind]);return <details className="trait-entry" key={axis.sigil} open={(kind==="sin"&&i===report.dominantSin)||(kind==="virtue"&&i===report.dominantVirtue)}>
        <summary><span className="trait-index">{axis.sigil}</span><span className="trait-title"><strong>{note.name}</strong><small>{note.theme}</small></span><span className="trait-score">{note.score}<small>/100</small></span><span className="trait-chevron">＋</span></summary>
        <div className="trait-entry-body"><span className="trait-concept">观察视角 / {note.concept}</span><p>{note.body}</p><p className="trait-prompt"><strong>一个小实验：</strong>{note.prompt}</p></div>
      </details>})}</div>)}</div>
    <p className="reading-note">“低 / 中 / 高”仅指本测试的预设分数段（0–34、35–69、70–100），不是人群常模或人格等级。回答频率受记忆偏差、近期情境和自我呈现影响。</p>
  </section>;
}

function isReport(value: unknown): value is Report {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<Report>;
  return typeof r.id === "string" && r.id.length <= 80 && typeof r.createdAt === "string" &&
    typeof r.title === "string" && r.title.length <= 80 && typeof r.subtitle === "string" && r.subtitle.length <= 80 &&
    Number.isInteger(r.dominantSin) && (r.dominantSin as number) >= 0 && (r.dominantSin as number) < 7 &&
    Number.isInteger(r.dominantVirtue) && (r.dominantVirtue as number) >= 0 && (r.dominantVirtue as number) < 7 &&
    [r.shadow,r.light].every(n => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100) &&
    Array.isArray(r.scores) && r.scores.length === 7 && r.scores.every(s => s && [s.sin,s.virtue].every(n => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 100));
}

function loadReports(): Report[] {
  try { const data=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]") as unknown; return Array.isArray(data)?data.filter(isReport).slice(0,20):[]; }
  catch{return [];}
}

function encodeReport(report: Report): string {
  return btoa(encodeURIComponent(JSON.stringify(report))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

function decodeReport(token: string): Report | null {
  try {
    if (token.length > 6000) return null;
    const normalized=token.replace(/-/g,"+").replace(/_/g,"/");
    const data=JSON.parse(decodeURIComponent(atob(normalized))) as unknown;
    return isReport(data)?data:null;
  } catch{return null;}
}

function shareLink(report: Report): string {
  return `${window.location.origin}${window.location.pathname}#report=${encodeReport(report)}`;
}

export default function Home() {
  const [view,setView]=useState<View>("home");
  const [mode,setMode]=useState<QuizMode>("deep");
  const [answers,setAnswers]=useState<(number|null)[]>(()=>emptyAnswers("deep"));
  const [index,setIndex]=useState(0);
  const [report,setReport]=useState<Report|null>(null);
  const [archive,setArchive]=useState<Report[]>([]);
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState("");
  const [galleryKind,setGalleryKind]=useState<"sin"|"virtue">("sin");
  const [ready,setReady]=useState(false);
  const advanceTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const activeQuestions=useMemo(()=>questionsForMode(mode),[mode]);
  const clearAdvance=()=>{if(advanceTimer.current!==null){clearTimeout(advanceTimer.current);advanceTimer.current=null;}};
  useEffect(()=>()=>{if(advanceTimer.current!==null)clearTimeout(advanceTimer.current);},[]);

  const openReport=useCallback((token:string)=>{
    const item=decodeReport(token);
    if(item){setReport(item);setView("result");setFeedback("");return item;}
    setFeedback("分享链接中的报告无效，请重新生成或核对完整链接。");setView("home");return null;
  },[]);

  useEffect(()=>{
    try { const saved=JSON.parse(localStorage.getItem(PROGRESS_KEY)||"null") as Progress|null;
      if(saved && (saved.mode==="deep"||saved.mode==="brief") && Array.isArray(saved.answers) && saved.answers.length===modeInfo[saved.mode].count && saved.answers.every(v=>v===null||(Number.isInteger(v)&&v>=0&&v<=4))){setMode(saved.mode);setAnswers(saved.answers);setIndex(Math.min(saved.answers.length-1,Math.max(0,saved.index||0)));}
    } catch {}
    setReady(true);
    const token=new URLSearchParams(window.location.hash.slice(1)).get("report");if(token)openReport(token);
  },[openReport]);

  useEffect(()=>{if(ready)localStorage.setItem(PROGRESS_KEY,JSON.stringify({mode,answers,index}));},[mode,answers,index,ready]);
  // Keep the next question in sight on phones: scrolling to the page top would
  // force the participant to pass the header again after every answer.
  // Desktop navigation and report transitions retain their original behavior.
  useLayoutEffect(()=>{
    if(view==="quiz"&&window.matchMedia("(max-width: 790px)").matches){
      const questionCard=document.querySelector<HTMLElement>(".question-main");
      if(questionCard){questionCard.scrollIntoView({block:"start",behavior:"instant"});return;}
    }
    window.scrollTo({top:0,behavior:"instant"});
  },[view,index]);
  const answered=useMemo(()=>answers.filter(v=>v!==null).length,[answers]);
  const progress=Math.round(answered/activeQuestions.length*100);
  const displayProgress=view==="result"&&report?100:progress;
  const displayAnswered=view==="result"&&report?(report.questionCount||35):answered;
  const displayTotal=view==="result"&&report?(report.questionCount||35):activeQuestions.length;
  const resume=()=>{clearAdvance();setFeedback("");setView("quiz");};
  const restart=()=>{clearAdvance();setAnswers(emptyAnswers(mode));setIndex(0);setReport(null);setFeedback("");window.history.replaceState(null,"",window.location.pathname);setView("quiz");};
  const changeMode=(next:QuizMode)=>{if(next===mode)return;if(answers.some(a=>a!==null)&&!window.confirm("切换测试版本会清空本次未完成的作答，确定切换吗？"))return;clearAdvance();setMode(next);setAnswers(emptyAnswers(next));setIndex(0);setReport(null);setFeedback("");};
  const submit=async(completed:(number|null)[]=answers)=>{
    if(completed.some(a=>a===null)){setFeedback("还有题目未完成，请先补全全部回答。");const i=completed.findIndex(a=>a===null);if(i>=0)setIndex(i);return;}
    setBusy(true);setFeedback("");
    try {const id=typeof crypto.randomUUID==="function"?crypto.randomUUID():`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;const result: Report={...scoreAnswers(completed as number[],mode),id,createdAt:new Date().toISOString()};setReport(result);const next=[result,...loadReports().filter(x=>x.id!==result.id)].slice(0,20);localStorage.setItem(HISTORY_KEY,JSON.stringify(next));localStorage.removeItem(PROGRESS_KEY);setView("result");window.history.replaceState(null,"",shareLink(result));}
    catch(e){setFeedback(e instanceof Error?e.message:"网络错误，请重试");}
    finally{setBusy(false);}
  };
  const choose=(selected:number)=>{
    if(busy)return;
    clearAdvance();
    const currentIndex=index;
    const completed=answers.map((v,i)=>i===currentIndex?selected:v);
    setAnswers(completed);setFeedback("");
    // Short acknowledgment keeps the selection visible while retaining single-tap flow.
    advanceTimer.current=setTimeout(()=>{
      advanceTimer.current=null;
      if(currentIndex===activeQuestions.length-1)void submit(completed);
      else setIndex(currentIndex+1);
    },320);
  };
  const goPrevious=()=>{clearAdvance();setIndex(i=>Math.max(0,i-1));setFeedback("");};
  const goArchive=()=>{clearAdvance();setView("archive");setFeedback("");setArchive(loadReports());window.history.replaceState(null,"",window.location.pathname);};
  const share=async()=>{if(!report)return;const url=shareLink(report);try{await navigator.clipboard.writeText(url);setFeedback("报告链接已复制；链接本身包含匿名汇总分数，知道链接的人都能查看。");}catch{setFeedback(`分享链接：${url}`);}};
  const invite=async()=>{const url="https://hardzionl.github.io/ai-interview-lab/seven-vices-virtues/";try{await navigator.clipboard.writeText(url);setFeedback("好友测试入口已复制。朋友打开后会独立开始测试，看不到你的个人分数。");}catch{setFeedback(`测试入口：${url}`);}};
  const move=(destination:View)=>{clearAdvance();if(destination==="archive")void goArchive();else{setFeedback("");setView(destination);if(destination==="home"||destination==="method")window.history.replaceState(null,"",window.location.pathname);}};

  return <div className="site-shell">
    <aside className="left-rail">
      <button type="button" className="identity" onClick={()=>move("home")}><Seal/><span><strong>FIELDNOTES</strong><small>A STUDIO OF SELF-DISCOVERY</small></span></button>
      <div className="rail-rule"/><p className="rail-label">COLLECTION / 001</p><h2 className="rail-heading">人性<br/>双生图鉴<span className="tiny-star">✦</span></h2>
      <p className="rail-description">THE SEVEN SINS<br/>AND THE SEVEN VIRTUES</p>
      <div className="rail-rule"/><p className="rail-label">EXPLORE / 导航</p>
      <nav className="rail-nav" aria-label="主要导航">
        <button className={view==="home"?"active":""} onClick={()=>move("home")}><span>01</span> 序章 · 图鉴 <span className="mobile-nav-label">图鉴</span></button>
        <button className={view==="quiz"?"active":""} onClick={resume}><span>02</span> 开始探索 <span className="mobile-nav-label">测试</span></button>
        <button className={view==="archive"?"active":""} onClick={()=>void goArchive()}><span>03</span> 我的档案 <span className="mobile-nav-label">档案</span></button>
        <button className={view==="method"?"active":""} onClick={()=>move("method")}><span>04</span> 关于这套测试 <span className="mobile-nav-label">说明</span></button>
      </nav>
      {view==="quiz"?<div className="rail-quiet-note"><span>ANONYMOUS REFLECTION</span><p>此刻只需关注自己的真实反应。</p><small>维度与结果将在完成后揭晓。</small></div>:<><div className="rail-rule"/><p className="rail-label">THE SEVEN CHAPTERS</p><div className="rail-chapters">{axes.map(axis=><div key={axis.sin}><span>{axis.sigil}</span><span>{axis.sin}<b>/</b>{axis.virtue}</span></div>)}</div></>}
      <div className="rail-bottom"><span className="tiny-star">✦</span><p>“认识人性，不是为了判决自己，而是学会与它温柔相处。”</p><span>VOL. I — MMXXVI</span></div>
    </aside>

    <main className="main-content">
      <header className="topline"><div>PERSONAL ATLAS <span className="top-slash">/</span> 人格探索实验室</div><div className="top-right"><span className="status-dot"/> INDEPENDENT EDITION <span className="top-slash">·</span> 2026</div></header>
      {view==="home"&&<>
        <section className="home-hero"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> THE MORAL SPECTRUM · ISSUE NO. 01</p><h1><span className="big-display">Vices <i>&</i><br/>Virtues<span className="display-period">.</span></span><span className="hero-chinese">人性，是一场<br/>光与影的对话。</span></h1><p className="hero-intro">七种本能，七种光亮。以过去三个月的真实经历为线索，从十四个独立观察方向勾勒属于你的性格素描。</p>
          <div className="hero-actions"><button className="primary-button" onClick={answered>0?resume:()=>document.getElementById("mode-title")?.scrollIntoView({behavior:"smooth",block:"start"})}>{answered>0?"继续我的探索":"选择探索版本"}<span aria-hidden="true">↗</span></button><button className="text-button" onClick={()=>move("method")}>了解测试原理 <span>→</span></button></div><div className="hero-caption"><span>NO RIGHT OR WRONG ANSWER</span><span>SCROLL TO DISCOVER ↓</span></div></div>
          <div className="hero-illustration"><HeroCardComposition/></div>
        </section>
        <section className="intro-bottom"><div className="section-number">01 / THE INQUIRY</div><div className="intro-bottom-title">不必完美，<br/><em>只需诚实。</em></div><div className="intro-bottom-copy"><p>请根据过去三个月的真实生活作答，选择行为出现的频率，而不是“应该”怎样。它是一份原创自我觉察问卷，并非经验证的心理量表。</p><div className="metric-row"><span><strong>42 / 70</strong> 道行为题</span><span><strong>14</strong> 个独立指标</span><span><strong>5</strong> 级频率量尺</span></div></div></section>
        <section className="home-duality"><article className="duality-card"><span className="card-index">I — VII / SHADOW</span><div className="sunmark dark-sun" aria-hidden="true"><CardArt axis={0}/></div><h3>七宗罪 <small>THE VICES</small></h3><p>那些使我们热烈、敏感、执着，有时也让我们失去平衡的本能。</p></article><article className="duality-card light-card"><span className="card-index">VIII — XIV / LIGHT</span><div className="sunmark blue-sun" aria-hidden="true"><CardArt axis={0} kind="virtue"/></div><h3>七美德 <small>THE VIRTUES</small></h3><p>那些让我们愿意倾听、分享、等待、节制，并与世界友善相处的能力。</p></article></section>
        <section className="mode-section" aria-labelledby="mode-title"><div className="section-rule"><span>02 / CHOOSE YOUR EXPLORATION</span><span>YOUR PACE / YOUR CHOICE</span></div><h2 className="section-display" id="mode-title">选择你的探索深度</h2><div className="mode-options">{(["brief","deep"] as const).map(value=><button key={value} className={`mode-card ${mode===value?"selected":""}`} aria-pressed={mode===value} onClick={()=>changeMode(value)}><span className="mode-index">{value==="brief"?"I / THE SKETCH":"II / THE PORTRAIT"}</span><span className="mode-count">{modeInfo[value].count}<small> QUESTIONS</small></span><strong>{modeInfo[value].name}</strong><span className="mode-desc">每个特质 {modeInfo[value].perTrait} 题 · {modeInfo[value].time}</span><span className="mode-tick">{mode===value?"✓ 当前选择":"选择此版本 ↗"}</span></button>)}</div><p className="mode-caveat">同一题型使用五级频率作答；两种长度不可视为等价的正式心理测量。更长版本能提供更多观察线索，但仍未经过信效度验证。</p><button className="primary-button" onClick={resume}>开始 {modeInfo[mode].count} 道探索 <span>↗</span></button></section>
        <section className="gallery-section" aria-labelledby="gallery-title"><div className="section-rule"><span>03 / THE FOURTEEN ENGRAVINGS</span><span>COBALT & MARBLE</span></div><h2 className="section-display" id="gallery-title">光与影 · 十四张古典图鉴</h2><p className="gallery-intro">十四幅原创白底钴蓝雕塑寓言：七宗罪与七美德完整配对。切换两套画卷，感受同一片星空下的人性两面。</p><div className="gallery-switch" role="group" aria-label="切换图鉴画卷"><button className={galleryKind==="sin"?"selected":""} aria-pressed={galleryKind==="sin"} onClick={()=>setGalleryKind("sin")}>Ⅰ · 七宗罪 / VICES</button><button className={galleryKind==="virtue"?"selected":""} aria-pressed={galleryKind==="virtue"} onClick={()=>setGalleryKind("virtue")}>Ⅱ · 七美德 / VIRTUES</button></div><div className="card-gallery">{cardOrder.map((axisIndex,i)=><figure className="gallery-card" key={`${galleryKind}-${axes[axisIndex].art}`}><div className="gallery-art"><CardArt axis={axisIndex} kind={galleryKind}/></div><figcaption><span>{String(i+1).padStart(2,"0")}</span><strong>{galleryKind==="sin"?axes[axisIndex].sin:axes[axisIndex].virtue}</strong><small>{axes[axisIndex].en.split(" / ")[galleryKind==="sin"?0:1]}</small></figcaption></figure>)}</div></section>
      </>}

      {view==="quiz"&&<section className="question-section"><div className="quiz-heading"><span className="eyebrow"><span className="eyebrow-line"/> A MOMENT OF REFLECTION · {modeInfo[mode].name}</span><span className="question-pager"><small>QUESTION</small> {String(index+1).padStart(2,'0')} <span>/ {activeQuestions.length}</span></span></div>
        <div className="quiz-line"><div style={{width:`${progress}%`}}/></div><div className="question-main"><div className="question-topline"><span>✦ &nbsp; {activeQuestions[index].scene}</span><span>NO. {String(index+1).padStart(2,'0')}</span></div><h1 key={index}>{activeQuestions[index].text}</h1><p className="question-instruction">回想过去三个月，这种反应在你的真实生活中出现得有多频繁？</p>
          <div className="option-list frequency-list" role="group" aria-label="行为出现频率">{frequencyLabels.map((label,i)=><button key={label} type="button" className={`answer-option ${answers[index]===i?'selected':''}`} aria-pressed={answers[index]===i} onClick={()=>choose(i)} disabled={busy}><span className="option-letter">{String(i+1).padStart(2,'0')}</span><span>{label}</span><span className="option-indicator">{answers[index]===i?'✓':'↗'}</span></button>)}</div>
        </div><div className="quiz-footer"><button className="previous-button" disabled={index===0||busy} onClick={goPrevious}>← 返回上一题</button><span className="auto-advance-hint"><span aria-hidden="true">✧</span> 选择后自动进入下一题{index===activeQuestions.length-1?"，并生成报告":""}</span></div>
        {feedback&&<p className="feedback" role="status">{feedback}</p>}</section>}

      {view==="result"&&report&&<section className="result-section"><div className="result-opening"><p className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL ATLAS / REPORT NO. {report.id.slice(0,8).toUpperCase()}</p><span className="result-stamp">✦</span><h1>你的灵魂，<br/><em>有两种笔触。</em></h1><p>暗影与光亮并不是两种互相排斥的身份。它们共同构成你在不同处境中的选择与反应。</p><p className="report-version">{report.version===2?`${report.mode==="brief"?"探索版":"深入版"} · ${report.questionCount} 道题 · 十四维独立计分`:`历史版本 · 35 道题 · 与新版分数不可直接比较`}</p></div>
        <div className="result-portrait"><div className="result-portrait-art-stack"><figure className="result-portrait-art"><CardArt axis={report.dominantSin}/><figcaption>SHADOW · {axes[report.dominantSin].sin}</figcaption></figure><figure className="result-portrait-art"><CardArt axis={report.dominantVirtue} kind="virtue"/><figcaption>LIGHT · {axes[report.dominantVirtue].virtue}</figcaption></figure></div><div className="result-portrait-copy"><span className="eyebrow">A PORTRAIT OF BOTH SIDES</span><h2>暗影落在<em>{axes[report.dominantSin].sin}</em>，<br/>光亮映着<em>{axes[report.dominantVirtue].virtue}。</em></h2><p>{axes[report.dominantSin].sinNote}；与此同时，{axes[report.dominantVirtue].virtueNote}。</p><div className="portrait-divider"/><small>请把画面看作一道寓言，而不是一张判决书。没有任何单一特质可以定义完整的你。</small></div></div>
        {report.qualityNote&&<p className="quality-note" role="note"><strong>解读提醒 /</strong> {report.qualityNote}</p>}
        <div className="result-duo"><div className="result-emblem"><span>RELATIVELY HIGH VICE / 相对突出的暗影</span><div className="result-big-name">{axes[report.dominantSin].sin}<small>{report.scores[report.dominantSin].sin}</small></div><h3>{report.title}</h3><p>{axes[report.dominantSin].sinNote}</p></div><div className="result-emblem lit"><span>RELATIVELY HIGH VIRTUE / 相对突出的光亮</span><div className="result-big-name">{axes[report.dominantVirtue].virtue}<small>{report.scores[report.dominantVirtue].virtue}</small></div><h3>{report.subtitle}</h3><p>{axes[report.dominantVirtue].virtueNote}</p></div></div>
        <div className="section-rule"><span>02 / YOUR SEVEN ENGRAVINGS</span><span>TAP TO REVEAL / 点击翻面</span></div><div className="flip-deck-heading"><div><span>THE REVEAL</span><h2>翻开你的七重肖像</h2></div><p>七张古典钴蓝卡牌，十四个独立得分。点击任意卡牌翻面，看见每种本能与美德在这次回答中的位置。</p></div><FlipDeck report={report}/>
        <div className="section-rule"><span>03 / YOUR FOURTEEN DIMENSIONS</span><span>0 — 100</span></div><h2 className="section-display">十四维性格星图</h2><div className="radar-group"><div className="radar-card"><h3><span className="dot-black"/> THE VICES <small>暗影轨道</small></h3><Radar values={report.scores.map(p=>p.sin)} labels={axes.map(a=>a.sin)} color="#3b3c45" name="七宗罪"/></div><div className="radar-card"><h3><span className="dot-blue"/> THE VIRTUES <small>光亮轨道</small></h3><Radar values={report.scores.map(p=>p.virtue)} labels={axes.map(a=>a.virtue)} color="#174bff" name="七美德"/></div></div>
        <div className="result-summary"><div><span>SHADOW INDEX</span><strong>{report.shadow}<small>/ 100</small></strong>暗影均值</div><div><span>LIGHT INDEX</span><strong className="blue-number">{report.light}<small>/ 100</small></strong>光亮均值</div><p>两个指数是本版七组题目得分的算术平均，仅适合在同一版测试中参考，不是道德等级或临床指标。</p></div>
        <div className="section-rule"><span>04 / THE SEVEN CONTRASTS</span><span>VICE / VIRTUE</span></div><h2 className="section-display">你身上的七组对话</h2><PairBars report={report}/>
        <div className="interpretation"><span className="eyebrow">PERSONAL NOTES / 给你的几行旁注</span><h3>{axes[report.dominantSin].sin}的影子，<br/>与{axes[report.dominantVirtue].virtue}的光亮。</h3><p>{reportReflection(report)}</p><p>可以回想最近一次情绪强烈的情境：是什么触发了它？当时有哪些选择？下一次是否想尝试不同回应？</p></div>
        <TraitExplanations report={report}/>
        <div className="invite-panel"><div><span className="eyebrow">AN INVITATION / 邀请共鸣</span><h3>让朋友也照见自己的光与影。</h3><p>分享图内已嵌入测试首页二维码。扫码开始独立测试，不会看到你的结果。分享图包含你的匿名十四维分数，请自主决定分享范围。</p></div><img src={`${import.meta.env.BASE_URL}assets/invite-qr.png`} alt="扫码打开七宗罪与七美德测试首页的邀请二维码" width="142" height="142"/></div>
        <div className="report-actions"><button className="primary-button" onClick={()=>{setFeedback("正在绘制高清长图…");void downloadCard(report).then(()=>setFeedback("分享长图已生成：包含十四维雷达图、完整分数和好友测试二维码。")).catch((e:unknown)=>setFeedback(e instanceof Error?e.message:"生成长图失败，请重试"));}}>下载分享长图 <span>↓</span></button><button className="outline-button" onClick={()=>void invite()}>复制好友测试入口 <span>↗</span></button><button className="text-button" onClick={()=>void share()}>复制个人报告链接 ↗</button><button className="text-button" onClick={restart}>重新测试 →</button></div>{feedback&&<p className="feedback" role="status">{feedback}</p>}
        <p className="disclaimer">本问卷为尚未经心理测量学验证的原创趣味自我觉察工具，不用于心理诊断、道德评判或评估个人价值。题目与计分规则由本项目独立编制，并未使用其他平台的专有评分模型。分数只代表此版题目中的作答频率，非人群百分位。</p>
      </section>}

      {view==="result"&&!report&&<div className="empty-state">{busy?"正在读取你的星图…":feedback||"报告暂时无法显示"}<button className="primary-button" onClick={()=>move("home")}>返回首页 ↗</button></div>}
      {view==="archive"&&<section className="archive-section"><p className="eyebrow"><span className="eyebrow-line"/> PERSONAL ARCHIVE</p><h1 className="page-display">我的性格档案<span>.</span></h1><p className="page-lead">报告只保存在当前设备的浏览器中，不会同步到其他设备。你可以复制包含匿名结果的分享链接并自行保留。</p><div className="archive-list">{archive.length===0?<div className="archive-empty"><Seal/><h3>{busy?"正在读取…":"这里还没有报告"}</h3><p>完成第一次探索，让它成为你的第一份人格手稿。</p><button className="primary-button" onClick={resume}>开始探索 ↗</button></div>:archive.map((item,i)=><button key={item.id} className="archive-item" onClick={()=>{setReport(item);setView("result");window.history.replaceState(null,"",shareLink(item));}}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{item.title} × {item.subtitle}</strong><small>{new Date(item.createdAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'})} · {item.version===2?`${item.questionCount} 题${item.mode==="brief"?"探索版":"深入版"}`:"历史版本"} · 光亮 {item.light} / 暗影 {item.shadow}</small></div><span>↗</span></button>)}</div></section>}
      {view==="method"&&<section className="method-section">
        <p className="eyebrow"><span className="eyebrow-line"/> NOTES ON THE METHOD · STATIC EDITION</p>
        <h1 className="page-display">图鉴的方法论<span>.</span></h1>
        <p className="page-lead">古典的名字，现代的行为线索。这是一套尚未经实证验证的原创趣味探索工具，不是专业心理诊断，也不是“心理学家认证”的量表。</p>
        <div className="method-columns">
          <div><span>01 / STRUCTURE</span><h2>42 题或 70 题，十四个指标。</h2><p>每个特质采用 3 或 5 条原创行为陈述。回顾最近三个月，根据真实生活出现频率选择；两档分别每组 6 题或 10 题。</p></div>
          <div><span>02 / SCORING</span><h2>独立计算，包含反向题。</h2><p>五级答案记 0、1、2、3、4 分，反向题使用 4 减原始分。同一特质题项求平均后除以 4、乘以 100。十四个维度各自计算，互不强迫互补。该分数不是人群百分位。</p></div>
          <div><span>03 / INTERPRETATION</span><h2>分层叙述，依然不等于人格判定。</h2><p>十四维各按回答频率落入三个预设解读区间，结合具体行为、可能的情境原因和可尝试的小实验。文字为原创、非临床的反思性叙述，可能产生巴纳姆效应；请据自身经历检验，不能把符合感当作测量效度。未经过信效度、常模、因子结构及公平性检验。</p></div>
          <div><span>04 / PRIVACY & PORTABILITY</span><h2>没有服务器，也不上传答案。</h2><p>评分全部在你的浏览器中完成。未完成进度、最多 20 份匿名汇总报告只存储在当前设备。分享链接的片段中包含匿名汇总分数，接收者可读取甚至修改；因此它不是可验证的成绩凭证。旧平台的历史报告不会自动同步。</p></div>
        </div>
        <div className="method-sources"><h3>研究依据与灵感</h3><p>解读选取了可观察的行为方向，借鉴自我调节、情绪调节、社会比较和共情研究；并非把其中任一正式量表或研究结论直接等同于十四种文学概念。相关研究为概念写作提供背景，不为本问卷的准确度背书。</p><a href="https://ncme.org/resources/books/testing-standards/" target="_blank" rel="noreferrer">AERA / APA / NCME · 测量规范 ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/9457784/" target="_blank" rel="noreferrer">Gross (1998) · 情绪调节研究 ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/17201571/" target="_blank" rel="noreferrer">Steel (2007) · 拖延行为元分析 ↗</a><a href="https://doi.org/10.1037/0022-3514.44.1.113" target="_blank" rel="noreferrer">Davis (1983) · 共情多维研究 ↗</a></div>
        <button className="primary-button" onClick={resume}>开始 {modeInfo[mode].count} 道探索 <span>↗</span></button>
      </section>}
      <footer className="site-footer"><span>FIELDNOTES — THE HUMAN ATLAS</span><span>DESIGNED IN COBALT & QUIETUDE</span><span>© 2026 · INDEPENDENT EDITION</span></footer>
    </main>

    <aside className="right-rail"><div className="right-top"><span>ATLAS / STATUS</span><span>✧</span></div><div className="right-panel"><p className="eyebrow">YOUR JOURNEY / 旅程</p><div className="progress-ring" style={{background:`conic-gradient(#174bff ${displayProgress*3.6}deg,#e7e8e5 0)`}}><div><strong>{displayProgress}<small>%</small></strong><span>已完成</span></div></div><div className="right-metrics"><div><strong>{displayAnswered}<small> / {displayTotal}</small></strong><span>已回答</span></div><div><strong>{view==="quiz"?"✓":"14"}</strong><span>{view==="quiz"?"匿名探索":"个独立维度"}</span></div></div><div className="right-divider"/>{view==="quiz"?<div className="right-neutral"><span>EVERY ANSWER COUNTS</span><h3>让答案先于标签。</h3><p>不会显示当前题目的所属维度，也不会提前揭示任何特质分数。</p><div className="neutral-orbit" aria-hidden="true">✧</div><small>YOUR ATLAS UNFOLDS AFTER THE FINAL ANSWER</small></div>:<><p className="eyebrow">SEVEN PAIRS / 七重对照</p><div className="right-axis-list">{axes.map(axis=><div className="right-axis" key={axis.sin}><span>{axis.sigil}</span><div><strong>{axis.sin}<em> / </em>{axis.virtue}</strong><div className="micro-bars">{Array.from({length:7},(_,j)=><i key={j} className={view==="result"?"filled":""}/>)}</div></div></div>)}</div></>}</div><div className="right-quote"><span className="quote-mark">“</span><p>There is no light without an inner shadow.</p><span>— A NOTE ON HUMAN NATURE</span></div><div className="privacy-note"><span>◌</span> 不需注册 · 不采集身份信息</div></aside>
  </div>;
}
