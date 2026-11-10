const topo=require("topojson-client");
const fs=require("fs");
const B={x0:8,x1:56,y0:22,y1:46}, K=20, C=Math.cos(36*Math.PI/180);
const P=([lon,lat])=>[ (lon-B.x0)*C*K, (B.y1-lat)*K ];
function simplify(pts,tol){ // Douglas-Peucker
  if(pts.length<4) return pts; const keep=new Uint8Array(pts.length); keep[0]=keep[pts.length-1]=1; const st=[[0,pts.length-1]];
  while(st.length){ const [a,b]=st.pop(); let md=0,mi=-1; const [ax,ay]=pts[a],[bx,by]=pts[b]; const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;
    for(let i=a+1;i<b;i++){ const d=(dx===0&&dy===0)?Math.hypot(pts[i][0]-ax,pts[i][1]-ay):Math.abs(dy*pts[i][0]-dx*pts[i][1]+bx*ay-by*ax)/L; if(d>md){md=d;mi=i;} }
    if(md>tol){ keep[mi]=1; st.push([a,mi],[mi,b]); } }
  return pts.filter((_,i)=>keep[i]); }
const inb=([lon,lat],m=3)=>lon>B.x0-m&&lon<B.x1+m&&lat>B.y0-m&&lat<B.y1+m;
function ringsOf(g){ if(!g) return []; if(g.type==="Polygon") return g.coordinates; if(g.type==="MultiPolygon") return g.coordinates.flat(); if(g.type==="GeometryCollection") return g.geometries.flatMap(ringsOf); if(g.type==="FeatureCollection") return g.features.flatMap(f=>ringsOf(f.geometry)); return []; }

function clipRing(pts,x0,y0,x1,y1){ // Sutherland–Hodgman
  const edges=[[p=>p[0]>=x0,(a,b)=>{const t=(x0-a[0])/(b[0]-a[0]);return [x0,a[1]+t*(b[1]-a[1])];}],
    [p=>p[0]<=x1,(a,b)=>{const t=(x1-a[0])/(b[0]-a[0]);return [x1,a[1]+t*(b[1]-a[1])];}],
    [p=>p[1]>=y0,(a,b)=>{const t=(y0-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),y0];}],
    [p=>p[1]<=y1,(a,b)=>{const t=(y1-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),y1];}]];
  let out=pts; for(const [ins,inter] of edges){ const inp=out; out=[]; if(!inp.length) break;
    for(let i=0;i<inp.length;i++){ const cur=inp[i], prev=inp[(i+inp.length-1)%inp.length];
      if(ins(cur)){ if(!ins(prev)) out.push(inter(prev,cur)); out.push(cur); } else if(ins(prev)) out.push(inter(prev,cur)); } }
  return out; }
function pathFor(rings,tol,minLen,minSize=0.6){ let d=""; let n0=0,n1=0,n2=0; for(const r of rings){ if(!r.some(c=>inb(c))) continue; n0++; let pts=clipRing(r.map(P),-10,-10,800,490); if(pts.length<3) continue; pts=simplify(pts.concat([pts[0]]),tol); if(pts.length<minLen) continue; n1++;
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]); if(Math.max(...xs)-Math.min(...xs)<minSize && Math.max(...ys)-Math.min(...ys)<minSize) continue;
  n2++; d+="M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join("L")+"Z"; } console.error("dbg",rings.length,n0,n1,n2); return d; }
const land10=require("world-atlas/land-10m.json"); const land=topo.feature(land10,land10.objects.land);
const landD=pathFor(ringsOf(land),0.12,4);
const lakes=require("./node_modules/@geo-maps/earth-lakes-10m/map.geo.json"), rivers=require("./node_modules/@geo-maps/earth-rivers-10m/map.geo.json");
const lakeD=pathFor(ringsOf(lakes),0.1,4,2.2), riverD=pathFor(ringsOf(rivers),0.12,3,1.2);
const W=((B.x1-B.x0)*C*K).toFixed(0), H=((B.y1-B.y0)*K).toFixed(0);
fs.writeFileSync("base.json",JSON.stringify({w:+W,h:+H,b:B,k:K,c:C,land:landD,lakes:lakeD,rivers:riverD}));
console.log(W,H,landD.length,lakeD.length,riverD.length);
