/**
 * FIELDNOTES v2 — an original, UNVALIDATED self-reflection questionnaire.
 * No norms, population percentiles, reliability coefficients or clinical claims.
 * Each of the 14 constructs is scored from its own three or five response items.
 */
export const axes = [
  { sin: "傲慢", virtue: "谦卑", en: "PRIDE / HUMILITY", sigil: "Ⅰ", art: "pride", insight: "自我评价、认可需要与接纳修正", sinNote: "更常关注自身贡献与地位；不等同于健康的自信", virtueNote: "更常承认局限并接受不同意见；不等于否定自我" },
  { sin: "嫉妒", virtue: "仁爱", en: "ENVY / KINDNESS", sigil: "Ⅱ", art: "envy", insight: "社会比较与体察他人处境", sinNote: "较容易因他人成就而产生比较与失落", virtueNote: "更常给予他人理解、支持与真诚认可" },
  { sin: "暴怒", virtue: "耐心", en: "WRATH / PATIENCE", sigil: "Ⅲ", art: "wrath", insight: "情绪反应与等待、调节的节奏", sinNote: "在受挫或被误解时较容易出现强烈反应", virtueNote: "面对不顺、等待与分歧时较能稳定回应" },
  { sin: "懒惰", virtue: "勤勉", en: "SLOTH / DILIGENCE", sigil: "Ⅳ", art: "sloth", insight: "回避启动与持续投入", sinNote: "重要任务遇到阻力时较容易延迟启动", virtueNote: "更常主动开始、分解并持续完成任务" },
  { sin: "贪婪", virtue: "慷慨", en: "GREED / GENEROSITY", sigil: "Ⅴ", art: "greed", insight: "资源占有感与分享意愿", sinNote: "对机会与资源的占有更敏感；不等于重视储蓄就是贪婪", virtueNote: "在能力范围内更愿意分享时间、资源和认可" },
  { sin: "暴食", virtue: "节制", en: "GLUTTONY / TEMPERANCE", sigil: "Ⅵ", art: "gluttony", insight: "即时满足与自我调节", sinNote: "在娱乐、购物等即时刺激前较难及时停下；不用于评价饮食或体型", virtueNote: "能在享受和长期安排间建立可持续的边界" },
  { sin: "色欲", virtue: "贞洁", en: "LUST / CHASTITY", sigil: "Ⅶ", art: "lust", insight: "亲密冲动与双方协商的边界", sinNote: "心动时较容易加快亲密互动节奏；不评价性取向或性欲本身", virtueNote: "更重视清晰沟通、相互同意与亲密边界；不意味着禁欲" },
] as const;

export type QuizMode = "brief" | "deep";
export const modeInfo = {
  brief: { name: "探索版", count: 42, perTrait: 3, time: "约 8 分钟" },
  deep: { name: "深入版", count: 70, perTrait: 5, time: "约 12–15 分钟" },
} as const;
export const frequencyLabels = ["几乎从不", "很少", "有时", "经常", "几乎总是"] as const;

export type Question = { axis: number; trait: "sin"|"virtue"; scene: string; text: string; reverse: boolean };
type Item = readonly [scene: string, text: string, reverse?: boolean];

// Five independently authored indicators per construct, including one plain-language
// reverse-keyed indicator. Reverse wording may itself produce method effects;
// this version makes no claim that such effects have been eliminated.
const sinItems: Item[][] = [
  [
    ["讨论 · 质疑","别人质疑我熟悉领域的判断时，我会先觉得对方了解得不够。"],
    ["团队 · 肯定","团队得到表扬时，我格外在意自己的贡献有没有被单独提到。"],
    ["合作 · 决策","在意见不一致时，我通常认为自己的判断比多数人可靠。"],
    ["社交 · 关注","成为大家关注的中心时，我会希望这种状态持续更久。"],
    ["成果 · 署名","即使功劳没有被特别提及，我也能很快放下这件事。",true],
  ],
  [
    ["朋友 · 晋升","朋友获得我也向往的机会后，我会较长时间想着彼此的差距。"],
    ["社交 · 展示","看到同龄人的成就时，我会下意识比较自己现在处于什么位置。"],
    ["竞争 · 成绩","别人的好消息有时会让我觉得自己的努力显得不够。"],
    ["生活 · 动态","看到别人过得精彩时，我会想尽快证明自己也不差。"],
    ["比较 · 调整","看到别人成功后，我通常能把注意力重新放回自己的目标。",true],
  ],
  [
    ["群聊 · 误解","被误解或指责时，我的语气会很快变得尖锐。"],
    ["合作 · 反复","别人反复犯同一种错误时，我很难压住烦躁。"],
    ["争执 · 回应","情绪上来时，我可能说出事后觉得过重的话。"],
    ["人际 · 冒犯","受到冒犯之后，我会在脑海里反复想怎样回击。"],
    ["冲突 · 平复","一场争执结束后，我通常能较快平复情绪。",true],
  ],
  [
    ["计划 · 截止","面对重要但不紧急的任务，我容易一拖再拖。"],
    ["学习 · 难题","任务变难时，我往往先转去做更轻松的事情。"],
    ["习惯 · 坚持","长期计划开始时我很投入，之后却常难以继续。"],
    ["工作 · 打断","做事被打断后，我常要很久才能重新进入状态。"],
    ["独处 · 自发","即使无人催促，我也能主动开始需要完成的任务。",true],
  ],
  [
    ["资源 · 机会","资源有限时，我会想尽量多留一些在自己手里。"],
    ["目标 · 获得","得到一项期待已久的机会后，我会很快开始寻找下一项。"],
    ["分享 · 顾虑","即使自己已经够用，我也常担心分享会让自己吃亏。"],
    ["合作 · 收益","分配共同收益时，我会格外关注自己能多获得多少。"],
    ["生活 · 充足","已有足够保障时，我能安心停止追逐更多资源。",true],
  ],
  [
    ["夜晚 · 娱乐","明知该休息，我仍容易继续刷视频或追剧。"],
    ["购物 · 兴趣","很喜欢的消费或娱乐一旦开始，我常不容易停下来。"],
    ["压力 · 放松","压力大时，我可能用超出计划的娱乐来回避烦恼。"],
    ["计划 · 冲动","为了当下的快乐，我有时会占用原本留给重要事情的时间。"],
    ["休闲 · 收尾","享受已经足够时，我通常能自然收尾而不继续追加。",true],
  ],
  [
    ["初识 · 吸引","刚被一个人强烈吸引时，我容易暂时忽略双方是否适合。"],
    ["亲密 · 节奏","在有好感的互动中，新鲜感会让我想加快关系节奏。"],
    ["心动 · 决定","非常心动时，我更容易先行动、事后再想后果。"],
    ["暧昧 · 期待","彼此期待还不清楚时，我仍可能想继续沉浸在亲密感里。"],
    ["关系 · 确认","即使吸引力很强，我也能先确认彼此的期待。",true],
  ],
];

const virtueItems: Item[][] = [
  [
    ["反馈 · 倾听","听到合理反馈时，我愿意主动问清对方的具体想法。"],
    ["学习 · 不懂","面对自己不熟悉的问题，我能自然承认还需要学习。"],
    ["讨论 · 修正","别人提出更好的做法时，我愿意当场调整原方案。"],
    ["团队 · 感谢","获得肯定时，我通常也会想到那些帮助过我的人。"],
    ["错误 · 辩解","被指出明显错误时，我常会花很久证明自己原本有道理。",true],
  ],
  [
    ["朋友 · 倾诉","有人遇到烦恼时，我愿意停下来认真听他讲。"],
    ["日常 · 帮助","即使事情与我无关，我也会留意别人是否需要帮助。"],
    ["分歧 · 理解","对方与我意见不同，我仍愿意理解他的处境。"],
    ["成长 · 欣赏","身边的人取得进步时，我会主动表达真诚的欣赏。"],
    ["他人 · 价值","听到朋友的好消息，我通常先想它能给自己带来什么。",true],
  ],
  [
    ["排队 · 延误","等待比预期更久时，我通常能调整自己的节奏。"],
    ["解释 · 重复","对方需要我重复说明时，我仍能保持平和。"],
    ["变化 · 应对","遇到临时变更时，我会先问清细节再回应。"],
    ["协作 · 进度","事情推进缓慢时，我愿意给对方合理的调整时间。"],
    ["计划 · 失控","事情没按预期发展时，我通常立即失去耐心。",true],
  ],
  [
    ["学习 · 日常","即使短期没有成果，我也能按节奏继续练习。"],
    ["任务 · 分解","面对复杂任务时，我通常会拆出一个可执行的下一步。"],
    ["承诺 · 交付","答应别人的任务，我会预留时间完成。"],
    ["准备 · 提前","时间允许时，我会主动提前处理未来要做的事情。"],
    ["长线 · 投入","需要投入很久的任务，我通常只完成最开始的一小段。",true],
  ],
  [
    ["学习 · 分享","如果有助于别人，我愿意分享自己掌握的实用方法。"],
    ["合作 · 认可","团队取得成果时，我会主动提及其他人的贡献。"],
    ["生活 · 陪伴","在能力允许时，我愿意为有需要的人付出一点时间。"],
    ["机会 · 提醒","发现适合朋友的机会时，即便我也感兴趣，我仍愿意告诉他。"],
    ["方法 · 保留","有价值的方法即使适合团队，我也倾向于只留给自己。",true],
  ],
  [
    ["休闲 · 安排","安排娱乐时，我通常能提前决定适合结束的时间。"],
    ["购物 · 判断","购物前，我能区分长期需要和一时冲动。"],
    ["生活 · 平衡","我能让喜欢的活动和既定责任维持一个可接受的平衡。"],
    ["目标 · 延迟","为了长期想实现的事，我能适度延后眼前的享受。"],
    ["屏幕 · 收手","原定娱乐时间到了以后，我通常还会继续很久。",true],
  ],
  [
    ["关系 · 意愿","别人表达不愿意继续某种互动时，我会立即尊重这个决定。"],
    ["亲密 · 沟通","关系变得亲近时，我愿意清晰表达自己的期待。"],
    ["相处 · 同意","亲密互动前，我会留意对方是否自愿而舒适。"],
    ["分歧 · 边界","发现双方边界不同，我愿意先沟通而不是自行猜测。"],
    ["熟悉 · 默认","觉得关系足够亲近时，我常认为某些界限不用明确沟通。",true],
  ],
];

const fullOrder = [0,3,4,7,8,1,2,5,6,9];
const briefOrder = [0,5,4,1,8,9];
const bank: Question[] = axes.flatMap((_,axis) => Array.from({length:5},(_,i) => {
  const s=sinItems[axis][i], v=virtueItems[axis][i];
  return [
    { axis, trait:"sin" as const, scene:s[0], text:s[1], reverse:!!s[2] },
    { axis, trait:"virtue" as const, scene:v[0], text:v[1], reverse:!!v[2] },
  ];
}).flat());

export function questionsForMode(mode: QuizMode): Question[] {
  const order=mode==="deep"?fullOrder:briefOrder;
  return axes.flatMap((_,axis)=>order.map(i=>bank[axis*10+i]));
}
export const questions = questionsForMode("deep");

export type PairScore = { sin: number; virtue: number };
export type Report = {
  id: string; createdAt: string; scores: PairScore[]; dominantSin: number; dominantVirtue: number;
  shadow: number; light: number; title: string; subtitle: string;
  version?: number; mode?: QuizMode; questionCount?: number; qualityNote?: string;
};
const sinTitles = ["镜中之冠","双生之花","燧火之心","迟暮行者","逐星藏家","盛宴旅人","星潮恋人"];
const virtueTitles = ["谦逊之镜","仁爱之灯","静水之锚","恒久之阶","赠予之手","节律之环","守界之星"];

export function scoreAnswers(answers: number[], mode: QuizMode): Omit<Report,"id"|"createdAt"> {
  if (mode!=="brief" && mode!=="deep") throw new Error("不支持的测评版本");
  const items=questionsForMode(mode);
  if(!Array.isArray(answers)||answers.length!==items.length||answers.some(x=>!Number.isInteger(x)||x<0||x>4)) throw new Error(`请完成全部 ${items.length} 道题后再生成报告`);
  const totals=axes.map(()=>({sin:0,virtue:0,sinCount:0,virtueCount:0}));
  items.forEach((item,i)=>{
    const adjusted=item.reverse?4-answers[i]:answers[i];
    totals[item.axis][item.trait]+=adjusted;
    if(item.trait==="sin")totals[item.axis].sinCount++;else totals[item.axis].virtueCount++;
  });
  const scores=totals.map(t=>({ sin:Math.round(t.sin/t.sinCount/4*100), virtue:Math.round(t.virtue/t.virtueCount/4*100) }));
  const dominantSin=scores.reduce((best,item,i)=>item.sin>scores[best].sin?i:best,0);
  const dominantVirtue=scores.reduce((best,item,i)=>item.virtue>scores[best].virtue?i:best,0);
  const shadow=Math.round(scores.reduce((sum,p)=>sum+p.sin,0)/7);
  const light=Math.round(scores.reduce((sum,p)=>sum+p.virtue,0)/7);
  const counts=[0,0,0,0,0];answers.forEach(a=>counts[a]++);
  const notes:string[]=[];
  if(Math.max(...counts)/answers.length>=.9) notes.push("多数问题采用相同频率选项，报告的区分度可能有限。");
  const viceRanks=scores.map(p=>p.sin).sort((a,b)=>b-a);
  const virtueRanks=scores.map(p=>p.virtue).sort((a,b)=>b-a);
  if(viceRanks[0]-viceRanks[1]<=5 || virtueRanks[0]-virtueRanks[1]<=5) notes.push("部分维度得分接近，第一名只是相对排序，不表示显著差异。");
  if(mode==="brief")notes.push("本次为每维3题的探索版，解读的不确定性更高。");
  return {version:2,mode,questionCount:items.length,scores,dominantSin,dominantVirtue,shadow,light,title:sinTitles[dominantSin],subtitle:virtueTitles[dominantVirtue],qualityNote:notes.join(" ")};
}
