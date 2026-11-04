import { axes, type Report } from "../lib/quiz";

const COBALT="#174bff", INK="#242834", MUTED="#747b89", PAPER="#fdfdfc";
const ENTRY="https://hardzionl.github.io/ai-interview-lab/seven-vices-virtues/";
const pairArt=["humility","kindness","patience","diligence","generosity","temperance","chastity"];

function image(url:string):Promise<HTMLImageElement> {
  return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`图片资源未载入：${url}`));img.src=url;});
}
function box(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,stroke?:string){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);}}
function text(ctx:CanvasRenderingContext2D,s:string,x:number,y:number,size:number,color=INK,weight="400",family="serif",align:CanvasTextAlign="left") {
  ctx.textAlign=align;ctx.textBaseline="alphabetic";ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${family}`;ctx.fillText(s,x,y);ctx.textAlign="left";
}
function line(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,color="#d7dce7",width=1){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}

function combinedRadar(c:CanvasRenderingContext2D,report:Report){
  const cx=600,cy=933,R=267;
  const point=(angle:number,factor:number)=>[cx+Math.cos(angle)*R*factor,cy+Math.sin(angle)*R*factor] as const;
  const angles=Array.from({length:14},(_,i)=>-Math.PI/2+(i+.5)*Math.PI*2/14);
  for(const scale of [.25,.5,.75,1]){
    c.beginPath();angles.forEach((angle,i)=>{const [x,y]=point(angle,scale);if(i===0)c.moveTo(x,y);else c.lineTo(x,y);});c.closePath();c.strokeStyle="#d9dfec";c.lineWidth=1.5;c.stroke();
  }
  angles.forEach(angle=>{const [x,y]=point(angle,1);line(c,cx,cy,x,y,"#d8dfeb",1.3);});
  line(c,cx,620,cx,1244,"#b5c5eb",1.5);
  const vectors=[{kind:"virtue" as const,color:COBALT,fill:"#174bff31",index:0},{kind:"sin" as const,color:"#737985",fill:"#9aa0ac35",index:7}];
  vectors.forEach(v=>{
    c.beginPath();c.moveTo(cx,cy);
    for(let i=0;i<7;i++){const value=report.scores[i][v.kind];const [x,y]=point(angles[i+v.index],value/100);c.lineTo(x,y);}
    c.closePath();c.fillStyle=v.fill;c.fill();c.strokeStyle=v.color;c.lineWidth=4;c.stroke();
    for(let i=0;i<7;i++){
      const value=report.scores[i][v.kind],angle=angles[i+v.index], [x,y]=point(angle,value/100);
      c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fillStyle=v.color;c.fill();c.strokeStyle=PAPER;c.lineWidth=2;c.stroke();
      const [lx,ly]=point(angle,1.20);const label=v.kind==="sin"?axes[i].sin:axes[i].virtue;
      text(c,`${label} ${value}`,lx,ly+7,24,v.kind==="sin"?"#515663":COBALT,"500",'"Noto Serif SC", "Songti SC", serif',lx<cx?"right":"left");
    }
  });
  text(c,"50",cx+10,cy-130,16,"#a9b4ca","400","Arial");
  text(c,"100",cx+10,cy-260,16,"#a9b4ca","400","Arial");
  c.beginPath();c.arc(cx,cy,5,0,Math.PI*2);c.fillStyle=COBALT;c.fill();
}

export async function downloadCard(report:Report):Promise<void>{
  const root=import.meta.env.BASE_URL;
  const [vicePic,virtuePic,qrPic]=await Promise.all([
    image(`${root}assets/sins/${axes[report.dominantSin].art}.webp`),
    image(`${root}assets/virtues/${pairArt[report.dominantVirtue]}.webp`),
    image(`${root}assets/invite-qr.png`),
  ]);
  const W=1200,H=2140,canvas=document.createElement("canvas");canvas.width=W;canvas.height=H;
  const c=canvas.getContext("2d");if(!c)throw new Error("当前浏览器不支持导出画布");
  c.fillStyle=PAPER;c.fillRect(0,0,W,H);
  c.strokeStyle="#c4cbd8";c.lineWidth=2;c.strokeRect(34,35,1132,2070);
  c.strokeStyle="#e2e7f2";c.lineWidth=1;c.strokeRect(47,48,1106,2044);
  box(c,86,100,39,5,COBALT);
  text(c,"FIELDNOTES",142,120,29,INK,"500","Georgia,serif");
  text(c,"PERSONAL ATLAS / VOL. I",1114,119,20,MUTED,"500","Georgia,serif","right");
  line(c,86,154,1114,154);
  text(c,"七宗罪 × 七美德",88,248,78,INK,"600",'"Noto Serif SC", "Songti SC", serif');
  text(c,"THE TWO FACES OF HUMAN NATURE",90,287,21,COBALT,"400","Georgia,serif");
  text(c,`NO. ${report.id.slice(0,8).toUpperCase()}   ·   ${new Date(report.createdAt).toLocaleDateString("zh-CN",{timeZone:"Asia/Shanghai"})}`,1110,285,20,MUTED,"400","Georgia,serif","right");

  const tiles=[{x:84,name:axes[report.dominantSin].sin,en:"SHADOW / 相对突出",score:report.scores[report.dominantSin].sin,pic:vicePic,color:INK},
    {x:613,name:axes[report.dominantVirtue].virtue,en:"LIGHT / 相对突出",score:report.scores[report.dominantVirtue].virtue,pic:virtuePic,color:COBALT}];
  tiles.forEach(t=>{
    box(c,t.x,327,503,208,"#f4f6fb","#d9e0ef");
    box(c,t.x+11,338,12,186,t.color);
    text(c,t.en,t.x+40,377,21,MUTED,"400","Georgia,serif");
    text(c,t.name,t.x+39,455,55,t.color,"600",'"Noto Serif SC", "Songti SC", serif');
    text(c,`${t.score} / 100`,t.x+40,499,28,t.color,"500","Georgia,serif");
    c.save();c.beginPath();c.rect(t.x+366,340,122,182);c.clip();c.drawImage(t.pic,t.x+366,340,122,182);c.restore();
  });
  line(c,85,582,1114,582);
  text(c,"01 / THE FOURTEEN-FOLD STAR MAP",90,628,25,INK,"500","Georgia,serif");
  text(c,"左 / 暗影   ·   右 / 光亮",1110,628,21,MUTED,"400",'"Noto Serif SC", serif',"right");
  combinedRadar(c,report);

  line(c,84,1312,1115,1312);
  text(c,"02 / THE FOURTEEN CONTRASTS",90,1362,26,INK,"500","Georgia,serif");
  text(c,"十四维独立得分 / 非人群排名",1110,1360,20,MUTED,"400",'"Noto Serif SC",serif',"right");
  box(c,83,1387,506,52,"#f2f3f5");box(c,613,1387,503,52,"#eaf0ff");
  text(c,"暗影 · VICES",103,1422,24,"#515766","600",'"Noto Serif SC",serif');
  text(c,"光亮 · VIRTUES",630,1422,24,COBALT,"600",'"Noto Serif SC",serif');
  axes.forEach((axis,i)=>{
    const y=1486+i*64,p=report.scores[i];
    if(i%2===1){box(c,84,y-36,503,52,"#f6f6f5");box(c,613,y-36,503,52,"#f5f7ff");}
    text(c,`${axis.sigil}   ${axis.sin}`,104,y,26,INK,"400",'"Noto Serif SC",serif');
    text(c,`${p.sin}`,557,y,27,"#4b5362","500","Georgia,serif","right");
    text(c,`${axis.sigil}   ${axis.virtue}`,630,y,26,COBALT,"400",'"Noto Serif SC",serif');
    text(c,`${p.virtue}`,1090,y,27,COBALT,"500","Georgia,serif","right");
  });

  line(c,85,1905,1113,1905);
  text(c,"每个人都有自己的光与影。",91,1962,32,INK,"500",'"Noto Serif SC",serif');
  text(c,"邀请你在意的人，探索属于 TA 的十四维星图。",91,2002,23,MUTED,"400",'"Noto Serif SC",serif');
  text(c,"SCAN TO BEGIN  /  扫码参与测试",91,2052,19,COBALT,"600","Georgia,serif");
  box(c,887,1919,202,170,"#ffffff","#d7dfed");c.drawImage(qrPic,906,1920,164,164);
  text(c,"仅供趣味自我觉察 · 未经心理测量学验证 · 不用于诊断",84,2082,17,"#89909f","400",'"Noto Serif SC",serif');
  // The image and the QR both point at the same public, non-personal landing page.
  canvas.dataset.invite=ENTRY;
  await new Promise<void>((resolve,reject)=>canvas.toBlob(blob=>{
    if(!blob){reject(new Error("生成图片失败"));return;}
    const url=URL.createObjectURL(blob);const anchor=document.createElement("a");anchor.href=url;
    anchor.download=`FIELDNOTES_十四维性格星图_${report.id.slice(0,8)}.png`;
    document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),12000);resolve();
  },"image/png"));
}
