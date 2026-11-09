"use strict";
/* Ô Forneau ! — app recettes (démo), par Maison Forneau. Charte forneau.com (crème/vert/or, Playfair).
   Données exemple sans porc ni alcool, sans nom de chef, visuels propres. Deux surfaces :
   Assistant (questions guidées -> recettes) et Catalogue (toutes les recettes + filtres à cocher). */

const DIETS = { vegan:{l:"100 % végétale",s:"Végétale"}, vegetarien:{l:"Végétarien",s:"Végétarien"},
  sans_gluten:{l:"Sans gluten",s:"Sans gluten"}, sans_lactose:{l:"Sans lactose",s:"Sans lactose"}, hypocalorique:{l:"Léger",s:"Léger"} };
const APPL = { poele:{l:"Poêle",i:"i-pan"}, four:{l:"Four",i:"i-oven"}, airfryer:{l:"Airfryer",i:"i-air"},
  micro_ondes:{l:"Micro-ondes",i:"i-micro"}, blender:{l:"Blender",i:"i-blend"}, sans_cuisson:{l:"Sans cuisson",i:"i-nocook"} };
const TIMES = [{v:10,l:"10 min"},{v:20,l:"20 min"},{v:30,l:"30 min"},{v:45,l:"45 min"},{v:60,l:"60 min"}];
const ALLERG = { gluten:{l:"Gluten"}, lactose:{l:"Lactose"}, fruits_coque:{l:"Fruits à coque"}, oeuf:{l:"Œuf"}, soja:{l:"Soja"} };

const SHOP="https://forneau.com/products/";
const PRODUCTS = {
  poele:{n:"Poêle titane Forneau",d:"Titane pur, sans PFAS, garantie à vie",have:1,i:"i-pan",h:"poele-titane-forneau"},
  sauteuse:{n:"Sauteuse 24 cm titane",d:"Sautés et plats mijotés",have:1,i:"i-pan",h:"la-sauteuse-forneau-24-cm-titane-pur"},
  wok:{n:"Wok 24 cm titane",d:"Sautés vifs, woks",have:1,i:"i-pan",h:"wok-titane-forneau-24cm"},
  casserole:{n:"Casserole 18 cm titane",d:"Currys, soupes, céréales",have:1,i:"i-pot",h:"casserole-titane-18-cm-sans-pfas"},
  marmite:{n:"Marmite 24 cm titane",d:"Grands volumes, pâtes, bouillons",have:1,i:"i-pot",h:"marmite-titane-24-cm-sans-pfas"},
  crepiere:{n:"Crêpière titane",d:"Pancakes, crêpes, galettes",have:1,i:"i-pan",h:"crepiere-titane-forneau"},
  planche:{n:"Planche titane Forneau",d:"Découpe hygiénique, inrayable",have:1,i:"i-board",h:"planche-titane-forneau"},
  plat_four:{n:"Plat à four titane",d:"Crumbles, gratins, cookies — à venir",have:0,i:"i-oven"},
  moule:{n:"Moule à cake titane",d:"Cakes et gâteaux — à venir",have:0,i:"i-oven"},
  bol:{n:"Bol titane",d:"Porridge, service — à venir",have:0,i:"i-bowl"},
};

const R = [
 {slug:"curry-pois-chiches",title:"Curry de pois chiches coco-épinards",product:"sauteuse",
  intro:"Tout se joue sur les épices réveillées à sec avant le lait de coco : c'est elles qui portent le plat.",
  diets:["vegan","vegetarien","sans_gluten","sans_lactose"],appl:["poele"],active:10,total:25,diff:"Facile",serv:4,
  ing:[[400,"g","pois chiches",{note:"égouttés"}],[400,"ml","lait de coco"],[2,"poignées","épinards"],[1,"","oignon"],
       [2,"gousses","ail"],[1,"c. à s.","curry",{staple:1,scalable:0}],[1,"c. à c.","cumin",{staple:1,scalable:0}],
       [1,"","citron"],[2,"c. à s.","huile d'olive",{staple:1}],[1,"pincée","sel",{staple:1,scalable:0}]],
  titane:"À sec dans la poêle titane bien chaude, nacrez les épices 30 secondes avant tout corps gras : le métal nu diffuse une chaleur vive et régulière qui les torréfie sans les brûler.",
  steps:[["Émincez l'oignon et l'ail. Dans la poêle titane à feu moyen, faites-les suer 3 minutes dans l'huile.",180],
         ["Poussez-les sur un bord, versez curry et cumin sur le métal nu, remuez 30 secondes jusqu'au parfum.",30,1],
         ["Ajoutez les pois chiches, enrobez, puis versez le lait de coco. Laissez frémir 12 minutes.",720,1],
         ["Incorporez les épinards hors du feu, pressez le citron, salez. Servez.",120]],
  macros:{kcal:410,p:14,l:24,g:34},
  subs:[["lait de coco","crème de soja, lait d'amande cuisine"],["épinards","blettes, roquette, pousses"]]},
 {slug:"buddha-bowl",title:"Buddha bowl quinoa, avocat, tahini",product:"planche",
  intro:"Un bol d'assemblage : la sauce tahini-citron lie des textures qui restent distinctes.",
  diets:["vegan","vegetarien","sans_gluten","sans_lactose"],appl:["sans_cuisson"],active:15,total:15,diff:"Facile",serv:2,
  ing:[[150,"g","quinoa",{note:"cuit"}],[1,"","avocat"],[200,"g","pois chiches",{note:"rôtis"}],[1,"","carotte",{note:"râpée"}],
       [2,"c. à s.","tahini"],[1,"","citron"],[1,"poignée","roquette"],[1,"c. à s.","graines de courge"],[1,"pincée","sel",{staple:1,scalable:0}]],
  titane:"Sur la planche titane, taillez l'avocat et la carotte au dernier moment : la surface inrayable n'emprisonne ni odeur ni bactérie, l'assemblage reste net.",
  steps:[["Fouettez le tahini avec le jus de citron et deux cuillères d'eau jusqu'à une sauce nappante.",60],
         ["Répartissez le quinoa au fond des bols. Disposez avocat, pois chiches, carotte et roquette par zones.",120],
         ["Nappez de sauce, parsemez de graines. Salez.",60]],
  macros:{kcal:480,p:16,l:26,g:42},
  subs:[["tahini","purée d'amande, purée de cajou"],["quinoa","sarrasin, boulgour"]]},
 {slug:"dahl",title:"Dahl de lentilles corail",product:"casserole",
  intro:"Les lentilles corail fondent sans trempage : surveillez surtout l'onctuosité en fin de cuisson.",
  diets:["vegan","vegetarien","sans_gluten","sans_lactose","hypocalorique"],appl:["poele"],active:10,total:30,diff:"Facile",serv:4,
  ing:[[250,"g","lentilles corail"],[400,"ml","lait de coco"],[1,"","oignon"],[2,"gousses","ail"],
       [1,"c. à c.","curcuma",{staple:1,scalable:0}],[1,"c. à c.","cumin",{staple:1,scalable:0}],[1,"","tomate"],
       [600,"ml","eau",{staple:1}],[1,"pincée","sel",{staple:1,scalable:0}]],
  titane:"Déglacez le fond de la poêle titane avec un peu d'eau dès que les épices accrochent : le métal nu libère les sucs sans qu'ils attachent.",
  steps:[["Suez l'oignon et l'ail 3 minutes. Ajoutez curcuma et cumin, remuez 30 secondes.",180,1],
         ["Versez lentilles, tomate concassée, eau et lait de coco. Portez à frémissement.",60],
         ["Laissez cuire 20 minutes à couvert, en remuant, jusqu'à une texture crémeuse. Salez.",1200,1]],
  macros:{kcal:320,p:15,l:12,g:38},
  subs:[["lait de coco","lait d'amande cuisine, crème d'avoine"],["lentilles corail","lentilles blondes"]]},
 {slug:"falafel-wrap",title:"Wrap falafel-houmous",product:"poele",
  intro:"Des falafels saisis en poêle plutôt que frits : moins gras, plus nets.",
  diets:["vegan","vegetarien","sans_lactose"],appl:["poele"],active:20,total:25,diff:"Intermédiaire",serv:2,
  ing:[[250,"g","pois chiches",{note:"égouttés"}],[1,"","oignon"],[2,"gousses","ail"],[1,"poignée","coriandre"],
       [1,"c. à c.","cumin",{staple:1,scalable:0}],[2,"c. à s.","farine",{note:"pois chiches"}],[2,"","galette",{note:"à wrap"}],
       [3,"c. à s.","houmous"],[1,"poignée","salade"],[2,"c. à s.","huile d'olive",{staple:1}]],
  titane:"Saisissez les falafels sans les bouger 3 minutes : la poêle titane forme une croûte qui les décolle seule quand elle est prête.",
  steps:[["Mixez pois chiches, oignon, ail, coriandre, cumin et farine en une pâte grossière. Façonnez des galets.",300],
         ["Saisissez-les 3 minutes par face dans la poêle titane huilée, sans les retourner trop tôt.",360],
         ["Tartinez les galettes de houmous, ajoutez salade et falafels, roulez serré.",120]],
  macros:{kcal:520,p:18,l:22,g:60},
  subs:[["houmous","purée d'avocat, tahini citronné"],["galette","tortilla de maïs (sans gluten)"]]},
 {slug:"pancakes",title:"Pancakes moelleux à la banane",product:"crepiere",
  intro:"La banane écrasée remplace une partie du sucre et garde les pancakes humides.",
  diets:["vegetarien"],appl:["poele"],active:10,total:15,diff:"Facile",serv:3,
  ing:[[2,"","banane",{note:"mûres"}],[150,"g","farine"],[200,"ml","lait"],[1,"","œuf"],
       [1,"c. à c.","levure chimique",{staple:1,scalable:0}],[1,"c. à s.","sirop d'érable"],[1,"noix","beurre",{staple:1}]],
  titane:"La poêle titane bien chaude puis à feu moyen cuit les pancakes sans beurre qui brûle : les bulles qui percent la surface disent qu'il faut retourner.",
  steps:[["Écrasez les bananes. Mélangez farine, levure, lait et œuf en une pâte lisse avec la banane.",180],
         ["Versez de petites louches dans la poêle titane chaude. Retournez quand les bulles percent.",240,1],
         ["Empilez, nappez de sirop d'érable.",30]],
  macros:{kcal:300,p:9,l:7,g:50},
  subs:[["lait","lait d'avoine, lait d'amande"],["œuf","2 c. à s. de compote de pomme"]]},
 {slug:"porridge",title:"Porridge pomme-cannelle express",product:"bol",
  intro:"Deux minutes au micro-ondes, en surveillant le débordement : remuez à mi-cuisson.",
  diets:["vegetarien","sans_lactose"],appl:["micro_ondes"],active:5,total:10,diff:"Facile",serv:1,
  ing:[[50,"g","farine d'avoine",{note:"flocons"}],[200,"ml","lait",{note:"végétal"}],[1,"","pomme"],
       [1,"c. à c.","cannelle",{staple:1,scalable:0}],[1,"c. à c.","sirop d'érable"],[1,"c. à s.","noix de pécan"]],
  titane:"Dans le bol titane, le porridge chauffe uniformément et se mange dans le même contenant : rien ne colle, rien ne se transfère.",
  steps:[["Mélangez flocons et lait végétal dans le bol. Micro-ondes 2 minutes, en remuant à mi-parcours.",120,1],
         ["Ajoutez la pomme en dés, la cannelle, le sirop et les noix.",60]],
  macros:{kcal:340,p:9,l:11,g:52},
  subs:[["noix de pécan","noix, amandes, graines de courge"],["pomme","poire, banane"]]},
 {slug:"cookies",title:"Cookies cacahuète et chocolat",product:"plat_four",
  intro:"Sortez-les quand les bords sont pris mais le centre encore tendre : ils finissent sur la plaque.",
  diets:["vegetarien"],appl:["four"],active:12,total:22,diff:"Facile",serv:6,
  ing:[[150,"g","beurre de cacahuète"],[100,"g","sucre"],[1,"","œuf"],[120,"g","farine"],
       [80,"g","chocolat noir",{note:"en morceaux"}],[1,"c. à c.","levure chimique",{staple:1,scalable:0}],[1,"pincée","sel",{staple:1,scalable:0}]],
  titane:"Sur le plat titane, pas de papier cuisson nécessaire : la surface nue dore uniformément et libère les cookies sans accroche.",
  steps:[["Mélangez beurre de cacahuète, sucre et œuf. Incorporez farine, levure, sel et chocolat.",240],
         ["Formez des boules, espacez-les sur le plat. Four à 180 °C, 10 minutes.",600],
         ["Laissez raffermir 5 minutes avant de décoller.",300]],
  macros:{kcal:230,p:7,l:13,g:22},
  subs:[["beurre de cacahuète","purée d'amande, purée de noisette"],["chocolat noir","pépites, chocolat au lait"]]},
 {slug:"banana-bread",title:"Banana bread aux noix",product:"moule",
  intro:"Plus les bananes sont tachetées, plus le pain est parfumé et moelleux.",
  diets:["vegetarien"],appl:["four"],active:15,total:55,diff:"Facile",serv:8,
  ing:[[3,"","banane",{note:"très mûres"}],[200,"g","farine"],[100,"g","sucre"],[2,"","œuf"],
       [60,"g","beurre",{note:"fondu"}],[60,"g","noix de pécan"],[1,"c. à c.","levure chimique",{staple:1,scalable:0}],
       [1,"c. à c.","cannelle",{staple:1,scalable:0}]],
  titane:"Le moule titane conduit la chaleur régulièrement : la croûte se forme sans que le cœur ne sèche, et le cake se démoule net.",
  steps:[["Écrasez les bananes. Mélangez avec le beurre fondu, le sucre et les œufs.",180],
         ["Incorporez farine, levure et cannelle, puis les noix.",120],
         ["Versez dans le moule. Four à 170 °C, 40 minutes. Vérifiez à la pointe d'un couteau.",2400]],
  macros:{kcal:310,p:6,l:13,g:42},
  subs:[["noix de pécan","noix, amandes, graines"],["beurre","huile de coco, purée d'amande"]]},
 {slug:"crumble",title:"Crumble pommes-cannelle",product:"plat_four",
  intro:"Le sable ne se travaille pas trop : des morceaux irréguliers donnent le croustillant.",
  diets:["vegetarien"],appl:["four"],active:15,total:45,diff:"Facile",serv:6,
  ing:[[6,"","pomme"],[120,"g","farine"],[80,"g","sucre"],[80,"g","beurre",{note:"froid"}],
       [50,"g","farine d'avoine",{note:"flocons"}],[1,"c. à c.","cannelle",{staple:1,scalable:0}]],
  titane:"Compotez les pommes à la poêle titane, puis gratinez dans le plat titane : deux surfaces nues, aucun revêtement au contact du sucre chaud.",
  steps:[["Coupez les pommes en dés, compotez-les 5 minutes à la poêle avec la cannelle.",300],
         ["Du bout des doigts, sablez farine, flocons, sucre et beurre froid en gros grumeaux.",180],
         ["Couvrez les pommes du sable dans le plat. Four à 180 °C, 30 minutes jusqu'à doré.",1800]],
  macros:{kcal:290,p:3,l:11,g:46},
  subs:[["beurre","huile de coco (sans lactose)"],["pomme","poire, pêche, abricot"]]},
 {slug:"gateau-yaourt",title:"Gâteau au yaourt sans gluten",product:"moule",
  intro:"Le pot de yaourt sert de mesure : simple, fiable, sans balance.",
  diets:["vegetarien","sans_gluten"],appl:["four"],active:10,total:40,diff:"Facile",serv:8,
  ing:[[1,"pot","yaourt nature"],[2,"pots","sucre"],[3,"pots","maïzena",{note:"ou farine de riz"}],[3,"","œuf"],
       [0.5,"pot","huile neutre",{staple:1}],[1,"c. à c.","levure chimique",{staple:1,scalable:0}],[1,"","citron",{note:"zeste"}]],
  titane:"Le moule titane assure un démoulage net sans beurrer ni fariner : la surface inrayable n'attache pas.",
  steps:[["Versez le yaourt dans un saladier, rincez le pot. Ajoutez sucre, œufs, huile, zeste.",120],
         ["Incorporez maïzena et levure jusqu'à une pâte lisse.",60],
         ["Moule titane, four à 180 °C, 30 minutes. La pointe doit ressortir sèche.",1800]],
  macros:{kcal:270,p:6,l:11,g:38},
  subs:[["maïzena","farine de riz, poudre d'amande"],["yaourt nature","yaourt de soja (vegan)"]]},
];
// Corpus complet : recettes réécrites (voix Forneau, anti-copie PASS) issues du pipeline Instagram.
if(typeof window!=="undefined"&&Array.isArray(window.MORE_RECIPES)){window.MORE_RECIPES.forEach(m=>{m.imported=1;R.push(m);});}
R.forEach((r,i)=>{r.id=i; if(!r.img)r.img="img/"+r.slug+".jpg";});
const MEAL={"curry-pois-chiches":"plat","buddha-bowl":"plat","dahl":"plat","falafel-wrap":"plat",
  "pancakes":"petitdej","porridge":"petitdej","cookies":"collation","banana-bread":"collation",
  "crumble":"dessert","gateau-yaourt":"dessert"};
R.forEach(r=>{if(!r.meal)r.meal=MEAL[r.slug]||"plat";});
const OBJECTIFS={perte:{l:"Perte de poids",kcal:1600,i:"i-flame"},equilibre:{l:"Équilibre",kcal:2000,i:"i-target"},masse:{l:"Prise de masse",kcal:2600,i:"i-spark"}};
// Objectif = facteur sur la dépense (TDEE) + base par défaut si pas de profil
const GOALS={perte:{l:"Perte de poids",s:"déficit ~20 %",f:0.8,base:1600,i:"i-flame"},
  maintien:{l:"Maintien",s:"équilibre",f:1.0,base:2000,i:"i-target"},
  masse:{l:"Prise de masse",s:"surplus ~15 %",f:1.15,base:2550,i:"i-spark"}};
// Type d'alimentation : répartition des macros (% des kcal) + filtre recettes
const DIETPLANS={
  equilibre:{l:"Équilibré",P:25,L:30,G:45,i:"i-target"},
  proteine:{l:"Hyperprotéiné",P:40,L:25,G:35,i:"i-flame",filter:"proteine"},
  lowcarb:{l:"Low carb",P:30,L:45,G:25,i:"i-leaf",filter:"lowcarb"},
  keto:{l:"Keto",P:25,L:70,G:5,i:"i-spark",filter:"keto"},
  mediterraneen:{l:"Méditerranéen",P:20,L:35,G:45,i:"i-olive"},
  vegetarien:{l:"Végétarien",P:22,L:30,G:48,i:"i-leaf",filter:"vegetarien"},
  vegan:{l:"100 % végétal",P:20,L:30,G:50,i:"i-leaf",filter:"vegan"}};
function carbShare(r){return r.macros?(r.macros.g*4)/Math.max(1,r.macros.kcal):1;}
function protShare(r){return r.macros?(r.macros.p*4)/Math.max(1,r.macros.kcal):0;}
function recipeMatchesDiet(r,diet){const f=(DIETPLANS[diet]||{}).filter;if(!f)return true;
  if(f==="vegetarien")return r.diets.includes("vegetarien");
  if(f==="vegan")return r.diets.includes("vegan");
  if(f==="keto")return r.macros&&carbShare(r)<0.22;
  if(f==="lowcarb")return r.macros&&carbShare(r)<0.38;
  if(f==="proteine")return r.macros&&protShare(r)>0.25;
  return true;}
function progTarget(){const p=S.prog,g=GOALS[p.goal]||GOALS.maintien;
  const tdee=memberKcal(p);const kcal=tdee?Math.round(tdee*g.f/10)*10:g.base;
  const d=DIETPLANS[p.diet]||DIETPLANS.equilibre;
  return{kcal,tdee,P:Math.round(kcal*d.P/100/4),L:Math.round(kcal*d.L/100/9),G:Math.round(kcal*d.G/100/4),plan:d};}
/* Foyer : adaptation portions + besoins nutritionnels (Mifflin-St Jeor, estimation indicative). */
const ACT={sedentaire:{l:"Sédentaire",f:1.2},leger:{l:"Peu actif",f:1.375},modere:{l:"Actif",f:1.55},intense:{l:"Très actif",f:1.725}};
function newMember(){return{sexe:"f",age:0,taille:0,poids:0,act:"modere"};}
function memberKcal(m){if(!m||!(m.poids>0&&m.taille>0&&m.age>0))return 0;
  const bmr=10*m.poids+6.25*m.taille-5*m.age+(m.sexe==="h"?5:-161);
  return Math.max(0,Math.round(bmr*((ACT[m.act]||ACT.modere).f)/10)*10);}
function foyerCount(){return S.foyer.mode==="solo"?1:Math.min(12,Math.max(1,S.foyer.count|0));}
function syncMembers(){const n=foyerCount(),m=S.foyer.members;while(m.length<n)m.push(newMember());if(m.length>n)m.length=n;}
function foyerNeeds(){const filled=S.foyer.members.filter(m=>memberKcal(m)>0);if(!filled.length)return null;
  const total=filled.reduce((a,m)=>a+memberKcal(m),0);return{total,n:filled.length,per:Math.round(total/filled.length/10)*10};}

const LS={get:(k,d)=>{try{return JSON.parse(localStorage.getItem("mf_"+k))??d}catch{return d}},
          set:(k,v)=>{try{localStorage.setItem("mf_"+k,JSON.stringify(v))}catch{}
            if(["favs","pantry","cart","foyer","prog"].includes(k)&&typeof saveCloud==="function")saveCloud();}};
const S={tab:"home",astep:0,q:"",catOpen:false,
  obj:"equilibre",repas:3,seed:1,sort:"default",
  prog:(()=>{const d={sexe:"f",age:0,taille:0,poids:0,act:"modere",goal:"maintien",diet:"equilibre"};
    const s=LS.get("prog",{})||{};return{...d,...s};})(),
  foyer:(()=>{const d={mode:"solo",count:2,family:false,nutri:false,members:[]};const s=LS.get("foyer",{})||{};
    return{...d,...s,members:Array.isArray(s.members)?s.members:[]};})(),
  diets:new Set(),appl:new Set(),time:null,avoid:new Set(),
  pantry:new Set(LS.get("pantry",[])),favs:new Set(LS.get("favs",[])),usePantry:false,cart:new Set(LS.get("cart",[]))};
const PANTRY_SUGG=["pois chiches","tomate","citron","avocat","banane","pomme","oignon","ail","lait","œuf","farine","épinards","coriandre","yaourt nature","beurre de cacahuète","quinoa"];

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=s=>s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"").replace(/s$/,"").trim();
const ic=(id,cls="ic",w=1.6)=>`<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><use href="#${id}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmtQty=q=>{if(q===0)return"";const r=Math.round(q*100)/100;return Math.abs(r-Math.round(r))<0.01?String(Math.round(r)):String(r).replace(".",",");};

function allergenHits(r){const h=new Set();
  for(const x of r.ing){const n=norm(x[2]+" "+((x[3]&&x[3].note)||""));
    if(/\b(farine|galette|chapelure|semoule|couscou|pain|biscuit|speculoo|tortilla)\b/.test(n)&&!/pois chiche/.test(n))h.add("gluten");
    if(/\bpate\b/.test(n))h.add("gluten");
    if(/\b(yaourt|creme|fromage|mascarpone|feta|mozzarella|parmesan)\b/.test(n))h.add("lactose");
    if(/\bbeurre\b/.test(n)&&!/(cacahuete|amande|noisette|cajou)/.test(n))h.add("lactose");
    if(/\blait\b/.test(n)&&!/(coco|amande|avoine|soja|vegetal|riz)/.test(n))h.add("lactose");
    if(/\b(amande|noisette|cajou|pecan|cacahuete|tahini|pistache)\b/.test(n))h.add("fruits_coque");
    if(/\bnoix\b/.test(n)&&!/muscade|coco/.test(n))h.add("fruits_coque");
    if(/\b(oeuf|œuf|mayonnaise)\b/.test(n))h.add("oeuf");
    if(/\b(soja|tofu|edamame)\b/.test(n))h.add("soja");}
  return h;}

function coverage(r){const key=r.ing.filter(x=>!(x[3]&&x[3].staple));
  if(!S.pantry.size)return{have:0,total:key.length,miss:key.length};
  const P=[...S.pantry].map(norm);let have=0;
  for(const x of key){const n=norm(x[2]);if(P.some(p=>n.includes(p)||p.includes(n)))have++;}
  return{have,total:key.length,miss:key.length-have};}

function filtered(){let list=R.slice();
  if(S.q){const q=norm(S.q);list=list.filter(r=>norm(r.title).includes(q)||r.ing.some(x=>norm(x[2]).includes(q)));}
  if(S.diets.size)list=list.filter(r=>[...S.diets].every(d=>r.diets.includes(d)));
  if(S.appl.size)list=list.filter(r=>[...S.appl].some(a=>r.appl.includes(a)));
  if(S.time)list=list.filter(r=>r.total<=S.time);
  if(S.avoid.size)list=list.filter(r=>{const h=allergenHits(r);return![...S.avoid].some(a=>h.has(a));});
  if(S.usePantry&&S.pantry.size)list=list.map(r=>({r,c:coverage(r)})).filter(o=>o.c.have>0)
    .sort((a,b)=>(b.c.have/b.c.total)-(a.c.have/a.c.total)||a.c.miss-b.c.miss).map(o=>o.r);
  if(S.sort==="time")list=list.slice().sort((a,b)=>a.total-b.total);
  else if(S.sort==="name")list=list.slice().sort((a,b)=>a.title.localeCompare(b.title,"fr"));
  else if(S.sort==="kcal")list=list.slice().sort((a,b)=>(a.macros?a.macros.kcal:1e9)-(b.macros?b.macros.kcal:1e9));
  else if(S.sort==="quick")list=list.slice().sort((a,b)=>a.active-b.active);
  else if(S.sort==="rated")list=list.slice().sort((a,b)=>(statOf(b).avg-statOf(a).avg)||(statOf(b).n-statOf(a).n)||a.title.localeCompare(b.title,"fr"));
  return list;}
const SORTS=[{k:"default",l:"Pertinence",i:"i-spark"},{k:"rated",l:"Les mieux notées",i:"i-heart"},
  {k:"time",l:"Temps total (court → long)",i:"i-clock"},
  {k:"quick",l:"Préparation la plus rapide",i:"i-timer"},{k:"name",l:"Ordre alphabétique (A → Z)",i:"i-sliders"},
  {k:"kcal",l:"Les plus légères (kcal)",i:"i-flame"}];

/* ---------- carte verticale ---------- */
function cardHTML(r){
  const c=coverage(r),showCov=S.usePantry&&S.pantry.size;
  const cov=showCov?`<span class="cov ${c.miss===0?'':'warn'}">${c.miss===0?'Tout y est':('Il manque '+c.miss)}</span>`:"";
  const fav=S.favs.has(r.id),prod=PRODUCTS[r.product];
  return `<button class="rcard" data-open="${r.id}" aria-label="${esc(r.title)}">
    <div class="ph">${cov}<img src="${r.img}" alt="${esc(r.title)}" loading="lazy" onerror="this.style.opacity=0"/>
      <span class="fav" role="button" aria-pressed="${fav}" data-fav="${r.id}" aria-label="Favori">${ic("i-heart",'ic',fav?2.2:1.6)}</span></div>
    <div class="body">
      <span class="leaf">${ic("i-leaf",'ic')}${esc((DIETS[r.diets[0]]||{}).s||"")}</span>
      <h3>${esc(r.title)}</h3>
      <span class="util">${ic(prod.i,'ic')}${esc(prod.n.replace(" Forneau","").replace(" titane",""))}</span>
      <div class="foot"><span class="m">${ic("i-clock",'ic')}<span class="tnum">${r.total} min</span></span>
        <span class="sep"></span><span class="m">${ic("i-spark",'ic')}${esc(r.diff)}</span></div>
    </div></button>`;
}
function grid(list,emptyIcon,emptyH,emptyP,btnId,btnTxt){
  return `<div class="list">${list.length?list.map(cardHTML).join(""):
    `<div class="empty" style="grid-column:1/-1">${ic(emptyIcon,'ic')}<h3>${esc(emptyH)}</h3><p>${esc(emptyP)}</p>${btnId?`<button class="btn ghost" id="${btnId}">${esc(btnTxt)}</button>`:""}</div>`}</div>`;
}

/* ---------- ACCUEIL (hub) ---------- */
const ICON3D={programme:"ic-programme",foyer:"ic-foyer",assistant:"ic-assistant",catalogue:"ic-catalogue",frigo:"ic-frigo"};
function menuCard(tab,icon,title,desc,feat,go){
  const i3=ICON3D[go||tab];
  const vis=i3?`<img src="img/3d/${i3}.png" alt="" loading="lazy" onerror="this.style.display='none'"/>`:ic(icon,'ic',1.7);
  return `<button class="menucard ${feat?'feat':''}" ${go?`data-go="${go}"`:`data-tab="${tab}"`}>
    <span class="mi">${vis}</span>
    <span class="mt"><span class="t">${esc(title)}</span><span class="d">${esc(desc)}</span></span>
    <span class="ma">${ic("i-arrow",'ic',2)}</span></button>`;
}
function viewHome(){
  const sig=R.slice(0,6).map(cardHTML).join("");
  return `<section class="hero"><div class="img">
      <img src="img/hero-forneau.jpg" alt="Poêle en titane Maison Forneau" onerror="this.style.display='none'"/>
      <div class="cap"><div class="ey">Ô Forneau !</div><h1>Bien manger, simplement</h1>
        <div class="ctag">par Maison Forneau</div></div></div></section>
    <p class="hsub">Les meilleures recettes virales des réseaux, réunies ici — réécrites, classées et adaptées à votre régime, votre appareil et votre foyer. Par où commencer&nbsp;?</p>
    <div class="menugrid">
      ${menuCard("programme","i-target","Mon programme nutritionnel","Un objectif, une journée de repas équilibrée.",true)}
      ${menuCard("foyer","i-users","Pour qui je cuisine ?","Solo ou famille — quantités et nutrition adaptées.")}
      ${menuCard("assistant","i-spark","Trouver une recette","Répondez à 4 questions, on vous propose.")}
      ${menuCard("catalogue","i-compass","Parcourir les recettes","Toutes les recettes, filtrées comme vous voulez.")}
      ${menuCard(null,"i-fridge","Cuisiner avec mon frigo","Ce que vous pouvez faire, avec ce que vous avez.",false,"frigo")}
    </div>
    <div class="sechead"><h2>Recettes signature</h2><button class="clearbtn" data-tab="catalogue">Tout voir</button></div>
    <div class="sigstrip">${sig}</div>`;
}

/* ---------- PROGRAMME NUTRITIONNEL ---------- */
function pickMeal(cat,off,diet){
  let pool=R.filter(r=>r.meal===cat&&r.macros&&recipeMatchesDiet(r,diet));
  if(!pool.length)pool=R.filter(r=>r.meal===cat&&r.macros);
  if(!pool.length)pool=R.filter(r=>r.macros&&recipeMatchesDiet(r,diet));
  if(!pool.length)return R.find(r=>r.macros)||R[0];
  return pool[(S.seed+off)%pool.length];}
function buildPlan(diet){const m=[{l:"Petit-déjeuner",r:pickMeal("petitdej",0,diet)},
  {l:"Déjeuner",r:pickMeal("plat",0,diet)},{l:"Dîner",r:pickMeal("plat",1,diet)}];
  if(S.repas>=4)m.push({l:"Collation",r:pickMeal("collation",0,diet)||pickMeal("dessert",0,diet)});
  return m;}
function updateProgLive(){const T=progTarget();
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set("pgTgt","objectif "+T.kcal+" kcal/jour");set("pgPt","/ "+T.P+" g");set("pgLt","/ "+T.L+" g");set("pgGt","/ "+T.G+" g");
  set("pgTdee",T.tdee?("Dépense estimée ~"+T.tdee+" kcal/jour (Mifflin-St Jeor).") :"Renseignez taille et poids pour un calcul personnalisé.");
  const ach=+(document.getElementById("pgKcal")||{}).dataset?.k||0,bar=document.getElementById("pgBar");
  if(bar)bar.style.width=Math.min(100,Math.round(ach/Math.max(1,T.kcal)*100))+"%";}
function viewProgramme(){
  const T=progTarget(),diet=S.prog.diet,p=S.prog;
  const plan=buildPlan(diet),nF=foyerCount();
  const tot=plan.reduce((a,x)=>({kcal:a.kcal+x.r.macros.kcal,p:a.p+x.r.macros.p,l:a.l+x.r.macros.l,g:a.g+x.r.macros.g}),{kcal:0,p:0,l:0,g:0});
  const pct=Math.min(100,Math.round(tot.kcal/Math.max(1,T.kcal)*100));
  const sx=(v,lab)=>`<button type="button" data-psex="${v}" aria-pressed="${p.sexe===v}">${lab}</button>`;
  const acts=Object.entries(ACT).map(([k,v])=>`<option value="${k}" ${p.act===k?"selected":""}>${v.l}</option>`).join("");
  const goalSeg=Object.entries(GOALS).map(([k,v])=>`<button class="segb" role="button" aria-pressed="${p.goal===k}" data-goal="${k}">${ic(v.i)}<span>${esc(v.l)}</span><span class="k">${esc(v.s)}</span></button>`).join("");
  const dietSeg=Object.entries(DIETPLANS).map(([k,v])=>`<button class="segb" role="button" aria-pressed="${p.diet===k}" data-diet="${k}">${ic(v.i)}<span>${esc(v.l)}</span><span class="k">P${v.P}·L${v.L}·G${v.G}</span></button>`).join("");
  const mealHTML=plan.map(x=>`<button class="meal" data-open="${x.r.id}">
      <span class="mph"><img src="${x.r.img}" alt="${esc(x.r.title)}" onerror="this.style.opacity=0"/></span>
      <span class="mx"><span class="ml">${esc(x.l)}</span><span class="mn">${esc(x.r.title)}</span>
        <span class="mk">${x.r.macros.kcal} kcal · ${x.r.total} min · ${esc((PRODUCTS[x.r.product].n).replace(" Forneau","").replace(" titane",""))}</span></span>
      <span class="mgo">${ic("i-arrow",'ic',2)}</span></button>`).join("");
  return `<section class="prog">
    <span class="eyebrow">Programme nutritionnel</span>
    <h2 style="font-size:28px;margin:8px 0 4px">Votre programme sur mesure</h2>
    <p style="color:var(--muted);margin:0">Renseignez votre profil et votre objectif&nbsp;: on calcule vos besoins et on compose une journée adaptée. Estimation indicative, pas un avis médical.</p>

    <div class="proglabel">Votre profil</div>
    <div class="pcard"><div class="flds">
      <div class="fld sex"><span>Sexe</span><div class="sexseg">${sx("f","Femme")}${sx("h","Homme")}</div></div>
      <div class="fld"><span>Âge</span><input type="number" inputmode="numeric" min="1" max="120" value="${p.age||""}" data-pf="age" placeholder="30"/></div>
      <div class="fld"><span>Taille</span><input type="number" inputmode="numeric" min="50" max="230" value="${p.taille||""}" data-pf="taille" placeholder="cm"/></div>
      <div class="fld"><span>Poids</span><input type="number" inputmode="numeric" min="10" max="250" value="${p.poids||""}" data-pf="poids" placeholder="kg"/></div>
      <div class="fld act"><span>Niveau d'activité</span><select data-pf="act">${acts}</select></div>
    </div><p class="disclaim" id="pgTdee" style="margin-top:10px">${T.tdee?`Dépense estimée ~${T.tdee} kcal/jour (Mifflin-St Jeor).`:"Renseignez taille et poids pour un calcul personnalisé."}</p></div>

    <div class="proglabel">Votre objectif</div>
    <div class="seg" style="grid-template-columns:repeat(3,1fr)">${goalSeg}</div>

    <div class="proglabel">Type d'alimentation</div>
    <div class="seg" style="grid-template-columns:repeat(2,1fr)">${dietSeg}</div>

    <div class="proglabel">Nombre de repas</div>
    <div class="seg" style="grid-template-columns:repeat(2,1fr)">
      <button class="segb" role="button" aria-pressed="${S.repas===3}" data-repas="3"><span>3 repas</span><span class="k">petit-déj · déj · dîner</span></button>
      <button class="segb" role="button" aria-pressed="${S.repas===4}" data-repas="4"><span>4 repas</span><span class="k">+ collation</span></button>
    </div>

    <div class="daytotals">
      <div class="top"><div><div class="kcal tnum" id="pgKcal" data-k="${tot.kcal}">${tot.kcal} kcal</div><div class="tgt" id="pgTgt">objectif ${T.kcal} kcal/jour</div></div>
        <button class="btn ghost" id="progGen" style="min-height:44px">${ic("i-swap")}Régénérer</button></div>
      <div class="bar"><i id="pgBar" style="width:${pct}%"></i></div>
      <div class="macro3">
        <div class="m"><div class="v tnum">${tot.p} g</div><div class="k">Protéines <b class="tgtv" id="pgPt">/ ${T.P} g</b></div></div>
        <div class="m"><div class="v tnum">${tot.l} g</div><div class="k">Lipides <b class="tgtv" id="pgLt">/ ${T.L} g</b></div></div>
        <div class="m"><div class="v tnum">${tot.g} g</div><div class="k">Glucides <b class="tgtv" id="pgGt">/ ${T.G} g</b></div></div>
      </div></div>

    ${nF>1?`<p class="disclaim" style="margin-top:12px">Valeurs par personne. Pour ${nF} personnes, multipliez les quantités de chaque recette par ${nF}.</p>`:""}
    <div class="proglabel">Votre journée «&nbsp;${esc(T.plan.l)}&nbsp;»</div>
    ${mealHTML}
    <div class="anav" style="margin-top:var(--s24)"><button class="btn" style="width:100%" id="progSave">${ic("i-heart")}Ajouter la journée à mes favoris</button></div>
  </section>`;
}

/* ---------- MON FOYER (pour qui je cuisine) ---------- */
function foyerSumHTML(needs){const n=foyerCount();
  let s=`<div class="top"><div><div class="kcal tnum">${n} personne${n>1?"s":""}</div>
    <div class="tgt">${needs?`besoin total ~${needs.total} kcal/jour`:"les quantités des recettes s'adapteront à votre foyer"}</div></div>
    <span class="mi" style="width:46px;height:46px;border-radius:14px;background:var(--sageSoft);color:var(--green);display:grid;place-items:center">${ic("i-users",'ic',1.7)}</span></div>`;
  if(needs)s+=`<div class="macro3" style="grid-template-columns:repeat(2,1fr);margin-top:14px">
      <div class="m"><div class="v tnum">${needs.per}</div><div class="k">kcal / personne / jour</div></div>
      <div class="m"><div class="v tnum">${needs.n}/${n}</div><div class="k">profils renseignés</div></div></div>`;
  return s;}
function memberCard(m,i,solo){const kc=memberKcal(m);
  const sx=(v,lab)=>`<button type="button" data-msex="${i}:${v}" aria-pressed="${m.sexe===v}">${lab}</button>`;
  const acts=Object.entries(ACT).map(([k,v])=>`<option value="${k}" ${m.act===k?"selected":""}>${v.l}</option>`).join("");
  return `<div class="pcard"><div class="ph"><span class="av">${ic("i-user",'ic',1.7)}</span>
      <span class="nm">${solo?"Moi":"Personne "+(i+1)}</span>
      <span class="kc tnum" data-kc="${i}">${kc?`${kc} <small>kcal/j</small>`:""}</span></div>
    <div class="flds">
      <div class="fld sex"><span>Sexe</span><div class="sexseg">${sx("f","Femme")}${sx("h","Homme")}</div></div>
      <div class="fld"><span>Âge</span><input type="number" inputmode="numeric" min="1" max="120" value="${m.age||""}" data-mf="${i}:age" placeholder="30"/></div>
      <div class="fld"><span>Taille</span><input type="number" inputmode="numeric" min="50" max="230" value="${m.taille||""}" data-mf="${i}:taille" placeholder="cm"/></div>
      <div class="fld"><span>Poids</span><input type="number" inputmode="numeric" min="10" max="250" value="${m.poids||""}" data-mf="${i}:poids" placeholder="kg"/></div>
      <div class="fld act"><span>Activité</span><select data-mf="${i}:act">${acts}</select></div>
    </div></div>`;}
function updateFoyerKcal(){S.foyer.members.forEach((m,i)=>{const el=document.querySelector(`[data-kc="${i}"]`);
    if(el){const v=memberKcal(m);el.innerHTML=v?`${v} <small>kcal/j</small>`:"";}});
  const sum=document.getElementById("foyerSum");if(sum)sum.innerHTML=foyerSumHTML(foyerNeeds());}
function viewFoyer(){syncMembers();const f=S.foyer,needs=foyerNeeds(),solo=f.mode==="solo";
  const cards=f.members.map((m,i)=>memberCard(m,i,solo)).join("");
  return `<section class="foyer">
    <span class="eyebrow">Mon foyer</span>
    <h2 style="font-size:28px;margin:8px 0 4px">Pour qui cuisinez-vous&nbsp;?</h2>
    <p style="color:var(--muted);margin:0">On adapte les quantités des recettes, et si vous le souhaitez les valeurs nutritionnelles, à votre foyer. Tout est optionnel&nbsp;: commencez simple.</p>

    <div class="proglabel">Je cuisine…</div>
    <div class="toggle2">
      <button class="segb" role="button" aria-pressed="${solo}" data-fmode="solo"><span>Juste pour moi</span><span class="k">1 personne</span></button>
      <button class="segb" role="button" aria-pressed="${!solo}" data-fmode="groupe"><span>Pour plusieurs</span><span class="k">famille, amis…</span></button>
    </div>

    ${!solo?`<div class="proglabel">Combien de personnes&nbsp;?</div>
    <div class="counter"><button type="button" data-fcount="-1" ${f.count<=1?"disabled":""} aria-label="Moins">${ic("i-minus")}</button>
      <span class="cv tnum">${foyerCount()}<small>personnes</small></span>
      <button type="button" data-fcount="1" ${f.count>=12?"disabled":""} aria-label="Plus">${ic("i-plus")}</button></div>
    <div class="proglabel">C'est une famille&nbsp;?</div>
    <div class="toggle2">
      <button class="segb" role="button" aria-pressed="${f.family===true}" data-ffam="1"><span>Oui</span><span class="k">avec enfants</span></button>
      <button class="segb" role="button" aria-pressed="${f.family===false}" data-ffam="0"><span>Entre adultes</span><span class="k">sans enfant</span></button>
    </div>`:""}

    <button class="foyercta" type="button" data-fnutri aria-expanded="${!!f.nutri}">
      ${ic("i-target")}<span class="fx"><span class="t">Affiner la nutrition</span>
      <span class="d">Renseignez âge, taille, poids et activité — on calcule les besoins de chacun.</span></span>
      <span class="chev">${ic("i-chevron")}</span></button>

    ${f.nutri?`${cards}
      <p class="disclaim">Besoins estimés par la formule de Mifflin-St Jeor (dépense énergétique indicative selon le sexe, l'âge, la taille, le poids et le niveau d'activité). Il s'agit d'une estimation et non d'un avis médical&nbsp;; pour un suivi personnalisé, consultez un professionnel de santé.</p>`:""}

    <div class="proglabel">Récapitulatif</div>
    <div class="daytotals" id="foyerSum">${foyerSumHTML(needs)}</div>
    <div class="anav" style="margin-top:var(--s24)">
      <button class="btn" data-tab="catalogue" style="width:100%">${ic("i-compass")}Voir les recettes adaptées</button></div>
  </section>`;}

/* ---------- ASSISTANT (formulaire guidé) ---------- */
const ASTEPS=[
  {n:"Étape 1 sur 4",q:"Un régime en particulier ?",p:"Plusieurs choix possibles — ou passez.",kind:"diet"},
  {n:"Étape 2 sur 4",q:"Avec quel appareil ?",p:"Ce que vous avez sous la main.",kind:"appl"},
  {n:"Étape 3 sur 4",q:"Combien de temps devant vous ?",p:"Temps total, préparation comprise.",kind:"time"},
  {n:"Étape 4 sur 4",q:"Quelque chose dans le frigo ?",p:"Ajoutez vos ingrédients, on classe par couverture.",kind:"pantry"},
];
function aopt(key,label,icon,pressed){
  return `<button class="aopt" role="button" aria-pressed="${pressed}" data-aopt="${key}">${icon?ic(icon):""}<span>${esc(label)}</span>
    <span class="tick">${ic("i-check",'ic',2.4)}</span></button>`;
}
function viewAssistant(){
  if(S.astep>=ASTEPS.length){ // résultats
    const list=filtered();
    return `<section class="assistant">
      <div class="aresult"><div class="big tnum">${list.length}</div><div class="lbl">recette${list.length>1?"s":""} pour vous</div></div>
      ${grid(list,"i-compass","Aucune recette ne correspond","Assouplissez un critère.","aBack","Modifier mes réponses")}
      <div class="anav"><button class="btn ghost" id="aBack">${ic("i-back")}Modifier</button>
        <button class="btn" data-tab="catalogue">Voir tout le catalogue</button></div></section>`;
  }
  const st=ASTEPS[S.astep];
  let opts="";
  if(st.kind==="diet") opts=Object.entries(DIETS).map(([k,v])=>aopt(k,v.l,null,S.diets.has(k))).join("");
  if(st.kind==="appl") opts=Object.entries(APPL).map(([k,v])=>aopt(k,v.l,v.i,S.appl.has(k))).join("");
  if(st.kind==="time") opts=TIMES.map(t=>aopt("t"+t.v,"Moins de "+t.l,"i-clock",S.time===t.v)).join("");
  const pantryBlock = st.kind==="pantry" ? `
    <form class="pantryin" id="aPantryForm" autocomplete="off" style="max-width:none">
      <input id="aPantryInput" placeholder="Pois chiches, citron, avocat…" aria-label="Ajouter un ingrédient"/>
      <button class="btn" type="submit">${ic("i-plus")}Ajouter</button></form>
    <div class="tags" id="aPantryTags" style="margin-bottom:8px"></div>
    <div class="sugg" id="aPantrySugg"></div>` : "";
  const count=filtered().length;
  return `<section class="hero"><div class="img">
      <img src="img/hero-forneau.jpg" alt="Poêle en titane Maison Forneau" onerror="this.style.display='none'"/>
      <div class="cap"><div class="ey">Ô Forneau !</div><h1>Que cuisine-t-on&nbsp;?</h1>
        <div class="ctag">répondez, on vous propose</div></div></div></section>
    <section class="assistant">
      <div class="asteps">${ASTEPS.map((_,i)=>`<span class="d ${i<=S.astep?'on':''}"></span>`).join("")}</div>
      <div class="aq"><div class="n">${st.n}</div><h2>${esc(st.q)}</h2><p>${esc(st.p)}</p></div>
      ${opts?`<div class="aopts">${opts}</div>`:""}
      ${pantryBlock}
      <div class="anav">
        ${S.astep>0?`<button class="btn ghost" id="aPrev">${ic("i-back")}Précédent</button>`:`<button class="btn ghost" id="aSkip">Passer</button>`}
        <button class="btn" id="aNext">${S.astep===ASTEPS.length-1?`Voir les ${count} recettes`:"Continuer"}${ic("i-arrow",'ic',2)}</button>
      </div></section>`;
}
function renderAPantry(){const t=$("#aPantryTags"),g=$("#aPantrySugg");if(!t)return;
  t.innerHTML=[...S.pantry].map(tagHTML).join("");
  g.innerHTML=PANTRY_SUGG.filter(x=>!S.pantry.has(x)).slice(0,10).map(x=>`<button class="chip" data-addtag="${esc(x)}">${ic("i-plus")}${esc(x)}</button>`).join("");}

/* ---------- CATALOGUE (toutes les recettes + cases à cocher) ---------- */
function checkRow(group,key,label,checked){
  return `<label class="check"><input type="checkbox" data-check="${group}" value="${key}" ${checked?"checked":""}/>
    <span class="box">${ic("i-check",'ic',2.6)}</span><span>${esc(label)}</span></label>`;
}
function filterGroups(){
  const g=(title,rows)=>`<div class="fgroup"><div class="h">${title}</div>${rows}</div>`;
  return g("Régime",Object.entries(DIETS).map(([k,v])=>checkRow("diet",k,v.l,S.diets.has(k))).join(""))
    +g("Appareil",Object.entries(APPL).map(([k,v])=>checkRow("appl",k,v.l,S.appl.has(k))).join(""))
    +g("Temps maximum",TIMES.map(t=>checkRow("time",String(t.v),"Moins de "+t.l,S.time===t.v)).join(""))
    +g("Exclure un allergène",Object.entries(ALLERG).map(([k,v])=>checkRow("avoid",k,v.l,S.avoid.has(k))).join(""))
    +`<button class="clearbtn" id="catClear" style="padding:8px 0">Tout réinitialiser</button>`;
}
function viewCatalogue(){
  const list=filtered();
  const nF=S.diets.size+S.appl.size+(S.time?1:0)+S.avoid.size;
  return `<div class="catwrap">
    <aside class="filterpanel">${filterGroups()}</aside>
    <div class="catmain">
      <div class="sechead" style="margin-top:0"><h2>Les recettes</h2>
        <span class="count"><b style="color:var(--ink)">${list.length}</b> sur ${R.length}</span></div>
      <label class="searchbar" style="margin:0 0 16px"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><use href="#i-search"/></svg>
        <input id="q" type="search" value="${esc(S.q)}" placeholder="Rechercher une recette, un ingrédient…" aria-label="Rechercher"/></label>
      <div style="margin-bottom:16px"><button class="filtersbtn" id="catToggle">${ic("i-sliders")}Filtres${nF?`<span class="n">${nF}</span>`:""}</button></div>
      <div id="catFilters" ${S.catOpen?"":"hidden"} style="margin-bottom:20px;padding:16px;border:1px solid var(--line);border-radius:var(--r14);background:var(--card)">${filterGroups()}</div>
      ${grid(list,"i-compass","Aucune recette avec ces filtres","Décochez un critère.","catClear2","Réinitialiser")}
    </div></div>`;
}

/* ---------- Favoris / Courses ---------- */
function viewFav(){const list=R.filter(r=>S.favs.has(r.id));
  return `<section style="padding-top:20px"><span class="eyebrow">Ma sélection</span>
    <h2 style="font-size:28px;margin:8px 0 20px">Favoris</h2>
    ${grid(list,"i-heart","Pas encore de favori","Touchez le cœur sur une recette pour la retrouver ici.")}</section>`;}
function viewCourses(){const groups={};const P=[...S.pantry].map(norm);
  R.filter(r=>S.favs.has(r.id)).forEach(r=>r.ing.filter(x=>!(x[3]&&x[3].staple)).forEach(x=>{const n=norm(x[2]);
    if(S.pantry.size&&P.some(p=>n.includes(p)||p.includes(n)))return;(groups[x[2]]=groups[x[2]]||[]).push(r.title);}));
  const items=Object.keys(groups);
  return `<section style="padding-top:20px"><span class="eyebrow">À acheter</span>
    <h2 style="font-size:28px;margin:8px 0 20px">Liste de courses</h2>
    ${items.length?`<div style="max-width:640px;display:flex;flex-direction:column">${items.map(n=>`<label class="ingrow" style="cursor:pointer">
      <input type="checkbox" data-course="${esc(n)}" ${S.cart.has(n)?"checked":""} style="width:22px;height:22px;accent-color:var(--green)"/>
      <span class="nm" style="${S.cart.has(n)?'text-decoration:line-through;color:var(--muted)':''}">${esc(n)}<br><small style="color:var(--muted)">${esc(groups[n][0])}${groups[n].length>1?` +${groups[n].length-1}`:""}</small></span></label>`).join("")}</div>`
    :`<div class="empty">${ic("i-cart",'ic')}<h3>Liste vide</h3><p>Ajoutez des recettes en favori : leurs ingrédients manquants s'accumulent ici.</p></div>`}</section>`;}
function tagHTML(name){return `<span class="tag">${esc(name)}<button data-untag="${esc(name)}" aria-label="Retirer">${ic("i-close",'ic',1.9)}</button></span>`;}

/* ---------- détail ---------- */
let curId=null,curServ=4,macroMode="personne";
function openDetail(id){const r=R[id];curId=id;curServ=S.foyer.mode==="groupe"?foyerCount():r.serv;macroMode="personne";draftRate={taste:0,ease:0,visual:0};draftPhoto=null;$("#detailTitle").textContent=r.title;renderDetail();
  if(SB){loadComments(r.slug);loadPhotos(r.slug);}
  $("#detail").classList.add("on");document.body.style.overflow="hidden";
  $("#detailFav").setAttribute("aria-pressed",S.favs.has(id));$("#detailFav").querySelector("svg").setAttribute("stroke-width",S.favs.has(id)?2.3:1.6);
  history.pushState({d:1},"");}
function closeDetail(){$("#detail").classList.remove("on");document.body.style.overflow="";curId=null;}
function renderDetail(){const r=R[curId],k=curServ/r.serv,cov=coverage(r),P=[...S.pantry].map(norm),prod=PRODUCTS[r.product];
  const ingHTML=r.ing.map(x=>{const[q,u,name,o={}]=x;const scal=o.scalable!==0&&!o.staple;const qty=scal?q*k:q;const n=norm(name);
    const have=S.pantry.size&&!o.staple&&P.some(p=>n.includes(p)||p.includes(n));
    return `<div class="ingrow"><span class="qty tnum">${fmtQty(qty)} ${esc(u)}</span>
      <span class="nm">${esc(name)}${o.note?` <small>(${esc(o.note)})</small>`:""}</span>
      ${!o.staple?`<span class="have ${have?'ok':'no'}">${have?ic("i-check",'ic',2.2)+"J'ai":"À acheter"}</span>`:""}</div>`;}).join("");
  const subsHTML=r.subs.map(s=>`<div style="padding:9px 0;font-size:14.5px;border-bottom:1px solid var(--lineSoft)">${ic("i-swap",'ic',1.8)} <b>${esc(s[0])}</b> <span style="color:var(--gold)">→</span> <span style="color:var(--muted)">${esc(s[1])}</span></div>`).join("");
  const stepsHTML=r.steps.map((s,i)=>`<div class="step"><span class="no">${i+1}</span><div class="tx"><div>${esc(s[0])}</div>${s[1]?`<span class="dur">${ic("i-clock",'ic')}<span class="tnum">${Math.round(s[1]/60)} min</span></span>`:""}</div></div>`).join("");
  const prodInner=`<div class="pic">${ic(prod.i,'ic',1.8)}</div>
      <div class="tx"><div class="k">Ustensile Forneau</div><div class="n">${esc(prod.n)}</div><div class="d">${esc(prod.d)}</div></div>
      ${prod.have?`<span class="cta">Voir le produit${ic("i-ext",'ic')}</span>`:`<span class="cta">Bientôt au catalogue</span>`}`;
  const prodHTML=prod.have&&prod.h?`<a class="product" href="${SHOP}${prod.h}" target="_blank" rel="noopener">${prodInner}</a>`:`<div class="product gap">${prodInner}</div>`;
  $("#detailBody").innerHTML=`
    <div class="dcover"><img src="${r.img}" alt="${esc(r.title)}" onerror="this.style.opacity=0"/></div>
    <h1 class="dtitle">${esc(r.title)}</h1><p class="dintro">${esc(r.intro)}</p>
    <div class="dmetarow"><span class="pillmeta">${ic("i-clock",'ic')}<span class="tnum">${r.active} min actifs · ${r.total} min</span></span>
      ${r.appl.map(a=>`<span class="pillmeta">${ic(APPL[a].i,'ic')}${APPL[a].l}</span>`).join("")}
      <span class="pillmeta">${ic("i-spark",'ic')}${esc(r.diff)}</span></div>
    <div class="dietrow">${r.diets.map(d=>`<span class="dot">${DIETS[d].l}</span>`).join("")}</div>
    <div class="section">${prodHTML}</div>
    <div class="section"><div class="portions"><span class="lab">Portions${S.foyer.mode==="groupe"?` <small style="color:var(--gold)">foyer : ${foyerCount()}</small>`:""}</span>
      <div class="stepper"><button id="servMinus" aria-label="Moins" ${curServ<=1?"disabled":""}>−</button>
        <span class="val tnum" id="servVal">${curServ}</span><button id="servPlus" aria-label="Plus" ${curServ>=12?"disabled":""}>+</button></div></div>
      ${curServ!==r.serv?`<div class="note" style="margin-top:8px">Recette prévue pour ${r.serv} — quantités ajustées à ${curServ} portion${curServ>1?"s":""}.</div>`:""}</div>
    <div class="section"><h2>Ingrédients ${S.pantry.size?`<span class="side">${cov.have}/${cov.total} dans votre frigo</span>`:""}</h2>${ingHTML}
      <div style="margin-top:16px"><button class="btn ghost" id="addCart" style="width:100%">${ic("i-cart")}Ajouter les manquants à mes courses</button></div></div>
    <div class="section"><div class="titane">${ic("i-pan")}<div><div class="t">Le geste titane</div><p>${esc(r.titane)}</p></div></div></div>
    ${r.macros?`<div class="section"><h2>Valeurs nutritionnelles</h2>
      <div class="nutseg"><button class="nbtn ${macroMode!=="plat"?"on":""}" data-macro="personne">Par personne</button><button class="nbtn ${macroMode==="plat"?"on":""}" data-macro="plat">Tout le plat${curServ>1?` (${curServ})`:""}</button></div>
      <div class="macros" style="margin-top:12px">
      <div class="macro"><div class="v tnum">${Math.round(r.macros.kcal*(macroMode==="plat"?curServ:1))}</div><div class="k">kcal</div></div>
      <div class="macro"><div class="v tnum">${Math.round(r.macros.p*(macroMode==="plat"?curServ:1))}</div><div class="k">Protéines</div></div>
      <div class="macro"><div class="v tnum">${Math.round(r.macros.l*(macroMode==="plat"?curServ:1))}</div><div class="k">Lipides</div></div>
      <div class="macro"><div class="v tnum">${Math.round(r.macros.g*(macroMode==="plat"?curServ:1))}</div><div class="k">Glucides</div></div></div>
      ${macroMode!=="plat"&&foyerNeeds()?`<div class="note">Soit environ ${Math.round(r.macros.kcal/foyerNeeds().per*100)}&nbsp;% des besoins d'une journée (~${foyerNeeds().per} kcal/personne, selon votre foyer).</div>`:`<div class="note">${macroMode==="plat"?`Pour tout le plat, soit ${curServ} portion${curServ>1?"s":""}. `:""}Estimation indicative (source CIQUAL), à confirmer.</div>`}</div>`:""}
    ${r.subs&&r.subs.length?`<div class="section"><h2>Substitutions</h2>${subsHTML}
      <p style="font-size:12.5px;color:var(--faint);margin-top:8px">Proposées dans la même famille d'ingrédients, à profil nutritionnel proche.</p></div>`:""}
    <div class="section"><h2>Préparation</h2><div class="steps">${stepsHTML}</div></div>
    ${SB?avisHTML(r):""}
    <div class="cta-sticky"><button class="btn ghost" id="toCart2" style="flex:0 0 56px" aria-label="Courses">${ic("i-cart")}</button>
      <button class="btn" id="startCook">${ic("i-play")}Mode cuisine</button></div>`;
  $("#servMinus").onclick=()=>{if(curServ>1){curServ--;renderDetail();}};
  $("#servPlus").onclick=()=>{if(curServ<12){curServ++;renderDetail();}};
  $("#startCook").onclick=()=>startCook(curId);
  $("#addCart").onclick=$("#toCart2").onclick=()=>{if(!S.favs.has(r.id)){S.favs.add(r.id);LS.set("favs",[...S.favs]);}toast("Ajouté à vos favoris et à vos courses");updateBadges();};
  if(SB){renderComments(r.slug);renderPhotos(r.slug);}
}

/* ---------- mode cuisine ---------- */
let cookStep=0,cookR=null,timerInt=null,timerLeft=0;
function startCook(id){cookR=R[id];cookStep=0;renderCook();setMicUI(false);$("#cook").classList.add("on");requestWake();}
function renderCook(){const r=cookR,s=r.steps[cookStep],n=r.steps.length;
  $("#cookKicker").textContent=`Étape ${cookStep+1} sur ${n}`;$("#cookCount").textContent=`${cookStep+1}/${n}`;
  $("#cookText").textContent=s[0];$("#cookProg").style.width=((cookStep+1)/n*100)+"%";$("#cookPrev").disabled=cookStep===0;
  $("#cookNext").querySelector("span").textContent=cookStep===n-1?"Terminer":"Étape suivante";
  stopTimer();const tw=$("#cookTimerWrap");if(s[1]&&s[1]>=60){tw.hidden=false;timerLeft=s[1];paintTimer();}else tw.hidden=true;}
function paintTimer(){const m=Math.floor(timerLeft/60),sec=timerLeft%60;$("#cookTimer").textContent=`${m}:${String(sec).padStart(2,"0")}`;}
function stopTimer(){if(timerInt){clearInterval(timerInt);timerInt=null;$("#cookTimerBtn").querySelector("span").textContent="Minuteur";}}
/* ---------- voix mains libres (mode cuisine) ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let recog=null,voiceOn=false;
function speak(txt){try{if(!window.speechSynthesis)return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt);u.lang="fr-FR";u.rate=1;window.speechSynthesis.speak(u);}catch(e){}}
function speakStep(){if(cookR)speak("Étape "+(cookStep+1)+". "+cookR.steps[cookStep][0]);}
function vstat(t){const el=$("#voiceStatus");if(el)el.textContent=t;}
function setMicUI(on){const b=$("#cookMic");if(b){b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);}const l=$("#voiceLabel");if(l)l.textContent=on?"Écoute…":"Activer la voix";}
function toggleVoice(){if(!SR){vstat("La commande vocale n'est pas disponible sur ce navigateur.");return;}voiceOn?stopVoice():startVoice();}
function startVoice(){if(!SR)return;try{if("Notification"in window&&Notification.permission==="default")Notification.requestPermission();}catch(e){}
  try{recog=new SR();}catch(e){return;}recog.lang="fr-FR";recog.continuous=true;recog.interimResults=false;
  recog.onresult=e=>{handleVoice((e.results[e.results.length-1][0].transcript||"").toLowerCase());};
  recog.onerror=e=>{if(e.error==="not-allowed"||e.error==="service-not-allowed"){voiceOn=false;setMicUI(false);vstat("Micro refusé. Autorisez le micro dans les réglages du téléphone.");}};
  recog.onend=()=>{if(voiceOn){try{recog.start();}catch(e){}}};
  try{recog.start();voiceOn=true;setMicUI(true);vstat("À l'écoute… « suivante », « minuteur », « répète »");}catch(e){}}
function stopVoice(){voiceOn=false;setMicUI(false);try{recog&&recog.stop();}catch(e){}recog=null;try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(e){}}
function handleVoice(t){const has=(...w)=>w.some(x=>t.includes(x));
  if(has("suivant","prochaine","continue","avance"," next")){cookAdvance();}
  else if(has("précéd","preced","retour","arrière","arriere","reviens","back")){if(cookStep>0){cookStep--;renderCook();speakStep();}}
  else if(has("répèt","repet","relis","redis","répéter","repeter")){speakStep();}
  else if(has("minuteur","chrono","timer","lance le temps")){startStepTimer();}
  else if(has("pause","arrête","arrete"," stop","attends")){stopTimer();speak("Minuteur en pause.");vstat("En pause.");}
  else if(has("fini","terminé","termine","c'est prêt","c'est bon")){cookAdvance();}}
function cookAdvance(){if(!cookR)return;if(cookStep<cookR.steps.length-1){cookStep++;renderCook();speakStep();}else{finishCook();}}
function startStepTimer(){if(!cookR)return;const s=cookR.steps[cookStep];if(s[1]&&s[1]>=60){$("#cookTimerWrap").hidden=false;if(!timerInt)$("#cookTimerBtn").click();speak("Minuteur lancé, "+Math.round(s[1]/60)+" minutes.");}else{speak("Cette étape n'a pas de minuteur.");vstat("Pas de minuteur pour cette étape.");}}
function finishCook(){$("#cook").classList.remove("on");releaseWake();stopVoice();toast("Bon appétit");}
function notifyTimer(){try{if("Notification"in window&&Notification.permission==="granted")new Notification("Ô Forneau !",{body:"Minuteur terminé — étape "+(cookStep+1)});}catch(e){}try{navigator.vibrate&&navigator.vibrate([200,120,200]);}catch(e){}}
$("#cookTimerBtn").addEventListener("click",()=>{if(timerInt){stopTimer();return;}$("#cookTimerBtn").querySelector("span").textContent="Pause";
  timerInt=setInterval(()=>{if(timerLeft>0){timerLeft--;paintTimer();}else{stopTimer();toast("Minuteur terminé");notifyTimer();speak("Minuteur terminé.");}},1000);});
$("#cookNext").onclick=()=>cookAdvance();
$("#cookPrev").onclick=()=>{if(cookStep>0){cookStep--;renderCook();if(voiceOn)speakStep();}};
$("#cookClose").onclick=()=>{$("#cook").classList.remove("on");stopTimer();releaseWake();stopVoice();};
$("#cookMic").onclick=()=>toggleVoice();
let wake=null;async function requestWake(){try{if("wakeLock"in navigator)wake=await navigator.wakeLock.request("screen");}catch{}}
function releaseWake(){try{wake&&wake.release();wake=null;}catch{}}

/* ---------- frigo (dans l'assistant) ---------- */
function addTag(v){v=v.trim();if(v&&!S.pantry.has(v)){S.pantry.add(v);LS.set("pantry",[...S.pantry]);renderAPantry();updateBadges();}}
function delTag(v){S.pantry.delete(v);LS.set("pantry",[...S.pantry]);renderAPantry();updateBadges();}

/* ---------- nav / badges ---------- */
function setTab(t){S.tab=t;if(t==="assistant")S.usePantry=S.pantry.size>0;render();window.scrollTo(0,0);}
function courseItems(){const g={};const P=[...S.pantry].map(norm);
  R.filter(r=>S.favs.has(r.id)).forEach(r=>r.ing.filter(x=>!(x[3]&&x[3].staple)).forEach(x=>{const n=norm(x[2]);
    if(S.pantry.size&&P.some(p=>n.includes(p)||p.includes(n)))return;g[x[2]]=1;}));return g;}
function updateBadges(){const f=S.favs.size,c=Object.keys(courseItems()).length;
  [["bnFav","sbFav",f],["bnCourses","sbCourses",c]].forEach(([a,b,v])=>{
    [document.getElementById(a),document.getElementById(b)].forEach(el=>{if(el){el.textContent=v;el.hidden=!v;}});});}
function activeFilterCount(){return S.diets.size+S.appl.size+(S.time?1:0)+S.avoid.size;}
function updateFilterCounts(){const n=activeFilterCount(),b=$("#fbCount");if(b){b.textContent=n;b.hidden=!n;}
  const c=$("#filterApplyCount");if(c)c.textContent=filtered().length;}
function openSheet(id){$("#scrim").classList.add("on");$("#"+id).classList.add("on");document.body.style.overflow="hidden";}
function closeSheets(){$("#scrim").classList.remove("on");$$(".sheet").forEach(s=>s.classList.remove("on"));
  if(!$("#detail").classList.contains("on"))document.body.style.overflow="";}
function fillFilterSheet(){$("#filterSheetBody").innerHTML=filterGroups()+
  `<div style="margin-top:22px;display:flex;gap:10px"><button class="btn ghost" id="catClear2" style="flex:0 0 auto">Effacer</button>
   <button class="btn" data-close style="flex:1">Voir <span id="filterApplyCount" class="tnum">${filtered().length}</span> recettes</button></div>`;}
function fillSortSheet(){$("#sortSheetBody").innerHTML=SORTS.map(s=>`<button class="sortrow" data-sort="${s.k}" aria-pressed="${S.sort===s.k}">${ic(s.i)}<span>${esc(s.l)}</span><span class="tk">${ic("i-check",'ic',2.3)}</span></button>`).join("");}
function render(){$$(".navitem,.bottomnav button").forEach(b=>b.setAttribute("aria-current",b.dataset.tab===S.tab?"page":"false"));
  S.usePantry=(S.tab==="assistant"&&(S.astep>=ASTEPS.length||S.pantry.size>0));
  const V={home:viewHome,foyer:viewFoyer,programme:viewProgramme,assistant:viewAssistant,catalogue:viewCatalogue,favoris:viewFav,courses:viewCourses};
  $("#view").innerHTML=(V[S.tab]||viewHome)();
  if(S.tab==="assistant"&&ASTEPS[S.astep]&&ASTEPS[S.astep].kind==="pantry")renderAPantry();
  const fb=$("#filterbar"),show=S.tab==="catalogue";if(fb){fb.hidden=!show;fb.classList.toggle("show",show);}
  updateFilterCounts();updateBadges();}

/* ---------- événements ---------- */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-open],[data-fav],[data-aopt],[data-tab],[data-go],[data-obj],[data-repas],[data-goal],[data-diet],[data-psex],[data-addtag],[data-untag],[data-course],[data-fmode],[data-fcount],[data-ffam],[data-fnutri],[data-msex],[data-macro],[data-sort],[data-close],[data-auth],[data-star],[data-report],[data-cdel],[data-repphoto],[data-delphoto],[data-authprompt],[data-photofull],#revSubmit,#acctBtn,#openFilters,#openSort,#scrim,#aNext,#aPrev,#aSkip,#aBack,#catToggle,#catClear,#catClear2,#progGen,#progSave,#detailBack,#detailFav,#qgo");
  if(!t)return;
  if(t.dataset.fav!==undefined){const id=+t.dataset.fav;S.favs.has(id)?S.favs.delete(id):S.favs.add(id);LS.set("favs",[...S.favs]);
    t.setAttribute("aria-pressed",S.favs.has(id));t.querySelector("svg").setAttribute("stroke-width",S.favs.has(id)?2.2:1.6);updateBadges();e.stopPropagation();return;}
  if(t.dataset.open!==undefined){openDetail(+t.dataset.open);return;}
  if(t.dataset.aopt!==undefined){const k=t.dataset.aopt;
    if(k[0]==="t"&&/^\d+$/.test(k.slice(1))){const v=+k.slice(1);S.time=S.time===v?null:v;}
    else if(DIETS[k]){S.diets.has(k)?S.diets.delete(k):S.diets.add(k);}
    else if(APPL[k]){S.appl.has(k)?S.appl.delete(k):S.appl.add(k);}
    render();return;}
  if(t.dataset.tab){setTab(t.dataset.tab);return;}
  if(t.dataset.go==="frigo"){S.tab="assistant";S.astep=ASTEPS.length-1;render();window.scrollTo(0,0);return;}
  if(t.dataset.obj){S.obj=t.dataset.obj;render();return;}
  if(t.dataset.goal){S.prog.goal=t.dataset.goal;LS.set("prog",S.prog);render();return;}
  if(t.dataset.diet){S.prog.diet=t.dataset.diet;LS.set("prog",S.prog);render();return;}
  if(t.dataset.psex){S.prog.sexe=t.dataset.psex;LS.set("prog",S.prog);render();return;}
  if(t.dataset.repas){S.repas=+t.dataset.repas;render();return;}
  if(t.dataset.fmode){S.foyer.mode=t.dataset.fmode;LS.set("foyer",S.foyer);render();return;}
  if(t.dataset.fcount){S.foyer.count=Math.min(12,Math.max(1,(S.foyer.count|0)+ +t.dataset.fcount));LS.set("foyer",S.foyer);render();return;}
  if(t.dataset.ffam!==undefined){S.foyer.family=t.dataset.ffam==="1";LS.set("foyer",S.foyer);render();return;}
  if(t.dataset.fnutri!==undefined){S.foyer.nutri=!S.foyer.nutri;LS.set("foyer",S.foyer);render();return;}
  if(t.dataset.msex){const[i,sx]=t.dataset.msex.split(":");if(S.foyer.members[+i]){S.foyer.members[+i].sexe=sx;LS.set("foyer",S.foyer);}render();return;}
  if(t.dataset.macro){macroMode=t.dataset.macro;renderDetail();return;}
  if(t.id==="acctBtn"){openAuth();return;}
  if(t.dataset.auth){const a=t.dataset.auth;
    if(a==="toggle"){authMode=authMode==="signup"?"login":"signup";renderAuth();}
    else if(a==="signup")doSignup();else if(a==="login")doLogin();else if(a==="logout")doLogout();
    else if(a==="save")saveProfileEdits();else if(a==="delete")deleteAccount();return;}
  if(t.id==="openFilters"){fillFilterSheet();openSheet("filterSheet");return;}
  if(t.id==="openSort"){fillSortSheet();openSheet("sortSheet");return;}
  if(t.id==="scrim"||t.dataset.close!==undefined){closeSheets();return;}
  if(t.dataset.sort){S.sort=t.dataset.sort;closeSheets();render();return;}
  if(t.id==="progGen"){S.seed++;render();return;}
  if(t.id==="progSave"){buildPlan().forEach(x=>{S.favs.add(x.r.id);});LS.set("favs",[...S.favs]);toast("Journée ajoutée à vos favoris");updateBadges();return;}
  if(t.dataset.addtag){addTag(t.dataset.addtag);return;}
  if(t.dataset.untag){delTag(t.dataset.untag);return;}
  if(t.dataset.course!==undefined){const n=t.dataset.course;S.cart.has(n)?S.cart.delete(n):S.cart.add(n);LS.set("cart",[...S.cart]);render();return;}
  if(t.id==="aNext"){S.astep++;render();window.scrollTo(0,0);return;}
  if(t.id==="aPrev"){if(S.astep>0)S.astep--;render();return;}
  if(t.id==="aSkip"){S.astep++;render();return;}
  if(t.id==="aBack"){S.astep=0;render();window.scrollTo(0,0);return;}
  if(t.id==="catToggle"){S.catOpen=!S.catOpen;render();return;}
  if(t.id==="catClear"||t.id==="catClear2"){S.diets.clear();S.appl.clear();S.time=null;S.avoid.clear();S.q="";render();return;}
  if(t.id==="detailBack"){history.back();return;}
  if(t.id==="detailFav"){const id=curId;S.favs.has(id)?S.favs.delete(id):S.favs.add(id);LS.set("favs",[...S.favs]);
    t.setAttribute("aria-pressed",S.favs.has(id));t.querySelector("svg").setAttribute("stroke-width",S.favs.has(id)?2.3:1.6);updateBadges();return;}
  if(t.dataset.star!==undefined){const[crit,n]=t.dataset.star.split(":");draftRate[crit]=+n;const grp=t.closest(".stars.ed");if(grp)grp.outerHTML=starsEdit(crit,+n);return;}
  if(t.id==="revSubmit"){submitReview();return;}
  if(t.dataset.report!==undefined){reportComment(t.dataset.report);return;}
  if(t.dataset.cdel!==undefined){delComment(t.dataset.cdel);return;}
  if(t.dataset.repphoto!==undefined){reportPhoto(t.dataset.repphoto);return;}
  if(t.dataset.delphoto!==undefined){delPhoto(t.dataset.delphoto);return;}
  if(t.dataset.authprompt!==undefined){openAuth();return;}
  if(t.dataset.photofull!==undefined){window.open(t.dataset.photofull,"_blank","noopener");return;}
});
document.addEventListener("change",e=>{if(e.target.id==="revPhoto"){const f=e.target.files&&e.target.files[0];if(f){draftPhoto=f;const n=$("#revPhotoName");if(n)n.textContent=f.name.length>26?f.name.slice(0,24)+"…":f.name;}return;}
  if(editProg(e.target))return;if(editMember(e.target))return;const c=e.target.closest("[data-check]");if(!c)return;
  const g=c.dataset.check,v=c.value;
  if(g==="diet")c.checked?S.diets.add(v):S.diets.delete(v);
  else if(g==="appl")c.checked?S.appl.add(v):S.appl.delete(v);
  else if(g==="avoid")c.checked?S.avoid.add(v):S.avoid.delete(v);
  else if(g==="time"){const n=+v;S.time=c.checked?n:(S.time===n?null:S.time);}
  render();});
function editProg(el){const pf=el.closest("[data-pf]");if(!pf)return false;const f=pf.dataset.pf;
  S.prog[f]=f==="act"?pf.value:(parseInt(pf.value,10)||0);LS.set("prog",S.prog);updateProgLive();return true;}
function editMember(el){const mf=el.closest("[data-mf]");if(!mf)return false;const[i,field]=mf.dataset.mf.split(":");const m=S.foyer.members[+i];
  if(m){m[field]=field==="act"?mf.value:(parseInt(mf.value,10)||0);LS.set("foyer",S.foyer);updateFoyerKcal();}return true;}
document.addEventListener("input",e=>{if(editProg(e.target))return;if(editMember(e.target))return;if(e.target.id==="q"){S.q=e.target.value;const list=filtered();
  const host=$(".catmain .list");if(host)host.innerHTML=list.length?list.map(cardHTML).join(""):`<div class="empty" style="grid-column:1/-1">${ic("i-compass",'ic')}<h3>Aucune recette</h3><p>Décochez un critère.</p></div>`;
  const cnt=$(".catmain .sechead .count b");if(cnt)cnt.textContent=list.length;}});
document.addEventListener("submit",e=>{if(e.target.id==="aPantryForm"){e.preventDefault();const i=$("#aPantryInput");addTag(i.value);i.value="";i.focus();}});
window.addEventListener("popstate",()=>{if($("#detail").classList.contains("on"))closeDetail();});
document.addEventListener("keydown",e=>{
  if(e.key==="Enter"&&e.target.closest("#authBody input")){e.preventDefault();const b=$("#authBody").querySelector('[data-auth="signup"],[data-auth="login"],[data-auth="save"]');if(b)b.click();return;}
  if(e.key==="Escape"){if($("#scrim").classList.contains("on"))closeSheets();if($("#detail").classList.contains("on"))history.back();if($("#cook").classList.contains("on"))$("#cookClose").click();}});

let toastT=null;function toast(msg){const el=$("#toast");el.textContent=msg;el.style.opacity="1";clearTimeout(toastT);toastT=setTimeout(()=>el.style.opacity="0",2200);}

/* ---------- COMPTE CLIENT (Supabase, UE) ---------- */
const SB=(window.supabase&&window.SB_URL)?window.supabase.createClient(window.SB_URL,window.SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}}):null;
S.user=null;S.profile=null;let authMode="signup";
function acctInitial(){const p=S.profile;const s=(p&&p.prenom)?p.prenom:(S.user&&S.user.email||"?");return s[0].toUpperCase();}
function updateAcct(){const b=$("#acctBtn"),l=$("#acctLbl");if(!b)return;
  if(S.user){b.classList.add("in");l.textContent=(S.profile&&S.profile.prenom)?S.profile.prenom:"Mon compte";}
  else{b.classList.remove("in");l.textContent="Se connecter";}}
function authErr(m){const e=$("#authErr");if(e){e.textContent=m||"";e.hidden=!m;}}
function trad(m){m=(m||"").toLowerCase();
  if(m.includes("already")||m.includes("registered")||m.includes("exists"))return "Cet e-mail a déjà un compte — connectez-vous.";
  if(m.includes("invalid")||m.includes("credentials"))return "E-mail ou mot de passe incorrect.";
  if(m.includes("password"))return "Mot de passe : 6 caractères minimum.";
  if(m.includes("email"))return "E-mail invalide.";
  return "Une erreur est survenue, réessayez.";}
function renderAuth(){const body=$("#authBody");if(!body)return;$("#authTitle").textContent=S.user?"Mon compte":(authMode==="signup"?"Créer un compte":"Se connecter");
  if(S.user){const p=S.profile||{};
    body.innerHTML=`<div class="acctcard"><span class="av">${esc(acctInitial())}</span>
      <div class="who"><div class="nm">${esc(p.prenom||"Bienvenue")}</div><div class="em">${esc(S.user.email||"")}</div></div></div>
      <div class="authform">
      <div class="fld"><span>Prénom</span><input id="apPrenom" value="${esc(p.prenom||"")}"/></div>
      <div class="fld"><span>Nom <span class="opt">(facultatif)</span></span><input id="apNom" value="${esc(p.nom||"")}"/></div>
      <div class="fld"><span>Téléphone <span class="opt">(facultatif)</span></span><input id="apTel" type="tel" value="${esc(p.telephone||"")}" placeholder="06…"/></div>
      <label class="consent"><input type="checkbox" id="apConsent" ${p.marketing_consent?"checked":""}/><span>Je souhaite recevoir les recettes, offres et nouveautés de Maison Forneau par e-mail. Désinscription à tout moment.</span></label>
      <button class="btn" data-auth="save">${ic("i-check")}Enregistrer</button>
      <button class="btn ghost" data-auth="logout">Se déconnecter</button>
      <a class="dangerlink" data-auth="delete">Supprimer mon compte et mes données</a></div>`;
  }else{const s=authMode==="signup";
    body.innerHTML=`<p style="color:var(--muted);margin:0 0 14px;font-size:14px">${s?"Créez votre compte pour retrouver vos favoris et votre programme sur tous vos appareils.":"Connectez-vous pour retrouver vos favoris et votre programme."}</p>
      <div class="authform"><div class="autherr" id="authErr" hidden></div>
      <div class="fld"><span>E-mail</span><input id="auEmail" type="email" autocomplete="email" placeholder="vous@exemple.com"/></div>
      ${s?`<div class="fld"><span>Prénom</span><input id="auPrenom" autocomplete="given-name" placeholder="Prénom"/></div>
      <div class="fld"><span>Nom <span class="opt">(facultatif)</span></span><input id="auNom" autocomplete="family-name"/></div>
      <div class="fld"><span>Téléphone <span class="opt">(facultatif)</span></span><input id="auTel" type="tel" autocomplete="tel" placeholder="06…"/></div>`:""}
      <div class="fld"><span>Mot de passe</span><input id="auPass" type="password" autocomplete="${s?"new-password":"current-password"}" placeholder="6 caractères min."/></div>
      ${s?`<label class="consent"><input type="checkbox" id="auConsent"/><span>Je souhaite recevoir les recettes, offres et nouveautés par e-mail. Facultatif, désinscription à tout moment.</span></label>`:""}
      <button class="btn" data-auth="${s?"signup":"login"}">${s?"Créer mon compte":"Se connecter"}</button>
      ${s?`<p class="authdisc">En créant un compte, vous acceptez notre <a href="legal/privacy.html" target="_blank" rel="noopener">politique de confidentialité</a>. Vos données sont hébergées dans l'Union européenne.</p>`:""}
      <div class="authtoggle">${s?"Déjà un compte ?":"Pas encore de compte ?"} <button data-auth="toggle">${s?"Se connecter":"Créer un compte"}</button></div></div>`;}}
function openAuth(){if(!SB){toast("Comptes bientôt disponibles");return;}renderAuth();openSheet("authSheet");}
function collectState(){return{favs:[...S.favs],pantry:[...S.pantry],cart:[...S.cart],foyer:S.foyer,prog:S.prog};}
let cloudT=null;
function saveCloud(){if(!S.user||!SB)return;clearTimeout(cloudT);cloudT=setTimeout(()=>{
  SB.from("user_profiles").update({app_state:collectState(),updated_at:new Date().toISOString()}).eq("id",S.user.id).then(()=>{},()=>{});},1200);}
function loadCloud(){const st=S.profile&&S.profile.app_state;if(!st||typeof st!=="object")return;
  if(Array.isArray(st.favs))st.favs.forEach(x=>S.favs.add(x));
  if(Array.isArray(st.pantry))st.pantry.forEach(x=>S.pantry.add(x));
  if(Array.isArray(st.cart))st.cart.forEach(x=>S.cart.add(x));
  if(st.foyer)S.foyer={...S.foyer,...st.foyer,members:Array.isArray(st.foyer.members)?st.foyer.members:S.foyer.members};
  if(st.prog)S.prog={...S.prog,...st.prog};
  try{localStorage.setItem("mf_favs",JSON.stringify([...S.favs]));localStorage.setItem("mf_pantry",JSON.stringify([...S.pantry]));localStorage.setItem("mf_cart",JSON.stringify([...S.cart]));}catch{}
  render();updateBadges();}
async function afterAuth(){try{const {data}=await SB.auth.getUser();S.user=data&&data.user||null;
  if(S.user){const r=await SB.from("user_profiles").select("*").eq("id",S.user.id).maybeSingle();S.profile=r.data||null;loadCloud();loadMyRatings();}
  updateAcct();}catch(e){}}
async function doSignup(){const email=$("#auEmail").value.trim(),pass=$("#auPass").value,prenom=$("#auPrenom").value.trim();
  authErr("");if(!email||!pass)return authErr("E-mail et mot de passe requis.");if(!prenom)return authErr("Votre prénom, s'il vous plaît.");if(pass.length<6)return authErr("Mot de passe : 6 caractères minimum.");
  const consent=($("#auConsent")||{}).checked||false;
  const {error}=await SB.auth.signUp({email,password:pass,options:{data:{prenom,nom:$("#auNom").value.trim(),telephone:$("#auTel").value.trim(),marketing_consent:consent,locale:"fr"}}});
  if(error)return authErr(trad(error.message));
  await afterAuth();saveCloud();closeSheets();toast("Bienvenue "+prenom+" ! Compte créé.");}
async function doLogin(){const email=$("#auEmail").value.trim(),pass=$("#auPass").value;authErr("");if(!email||!pass)return authErr("E-mail et mot de passe requis.");
  const {error}=await SB.auth.signInWithPassword({email,password:pass});if(error)return authErr(trad(error.message));
  await afterAuth();closeSheets();toast("Content de vous revoir !");}
async function doLogout(){await SB.auth.signOut();S.user=null;S.profile=null;updateAcct();closeSheets();toast("Déconnecté.");}
async function saveProfileEdits(){const patch={prenom:$("#apPrenom").value.trim(),nom:$("#apNom").value.trim(),telephone:$("#apTel").value.trim(),marketing_consent:$("#apConsent").checked};
  patch.consent_at=patch.marketing_consent?new Date().toISOString():null;
  const {error}=await SB.from("user_profiles").update({...patch,updated_at:new Date().toISOString()}).eq("id",S.user.id);
  if(error)return toast("Erreur d'enregistrement");S.profile={...S.profile,...patch};updateAcct();closeSheets();toast("Profil enregistré.");}
async function deleteAccount(){if(!confirm("Supprimer votre compte et toutes vos données ? Cette action est définitive."))return;
  try{await SB.from("user_profiles").delete().eq("id",S.user.id);}catch(e){}
  await SB.auth.signOut();S.user=null;S.profile=null;updateAcct();closeSheets();toast("Compte supprimé.");}

/* ---------- AVIS : agrégats publics (note moyenne, nb de notes/commentaires) ---------- */
const STATS={},MYRATE={};
function statOf(r){const s=STATS[r.slug];return s?{avg:+s.avg_rating||0,n:s.rating_count||0,c:s.comment_count||0}:{avg:0,n:0,c:0};}
function loadStats(){if(!SB)return;SB.from("recipe_stats").select("recipe_slug,avg_rating,rating_count,comment_count").then(({data})=>{
  if(data){data.forEach(s=>STATS[s.recipe_slug]=s);if(S.tab==="catalogue"||S.tab==="home")render();}},()=>{});}
function loadMyRatings(){if(!SB||!S.user)return;SB.from("recipe_ratings").select("recipe_slug,stars").eq("user_id",S.user.id).then(({data})=>{
  if(data)data.forEach(x=>MYRATE[x.recipe_slug]=x.stars);},()=>{});}

/* ---------- AVIS : UI (notes multi-critères + commentaires + photos, modérés) ---------- */
const CRITS=[["taste","Goût"],["ease","Faisabilité"],["visual","Visuel"]];
const CMTS={},PHOTOS={};
let draftRate={taste:0,ease:0,visual:0},draftPhoto=null;
function timeago(iso){const d=new Date(iso),s=(Date.now()-d.getTime())/1000;
  if(s<3600)return "il y a "+Math.max(1,Math.floor(s/60))+" min";
  if(s<86400)return "il y a "+Math.floor(s/3600)+" h";
  if(s<604800)return "il y a "+Math.floor(s/86400)+" j";
  return d.toLocaleDateString("fr-FR",{day:"numeric",month:"short"});}
function starsRO(v,sz){v=+v||0;let h=`<span class="stars ro"${sz?` style="font-size:${sz}px"`:""}>`;for(let i=1;i<=5;i++)h+=`<span class="st ${i<=Math.round(v)?'on':''}">★</span>`;return h+"</span>";}
function starsEdit(crit,val){let h=`<span class="stars ed">`;for(let i=1;i<=5;i++)h+=`<button type="button" class="st ${i<=(val||0)?'on':''}" data-star="${crit}:${i}" aria-label="${i} sur 5">★</button>`;return h+"</span>";}
function photoUrl(path){try{return SB.storage.from("dish-photos").getPublicUrl(path).data.publicUrl;}catch(e){return "";}}
function avisHTML(r){const slug=r.slug,st=statOf(r),ss=STATS[slug]||{};
  return `<div class="section avis"><h2>Avis de la communauté</h2>
    <div class="ratebox">
      <div class="ratesum"><div class="big tnum">${st.n?st.avg.toFixed(1):"—"}</div>
        <div>${starsRO(st.avg,17)}<div class="cnt">${st.n?(st.n+" avis"):"Pas encore d'avis"}${st.c?" · "+st.c+" comm.":""}</div></div></div>
      ${st.n?`<div class="critbars">${CRITS.map(([k,l])=>{const a=+ss["avg_"+k]||0;return `<div class="cb"><span>${l}</span><div class="bar"><i style="width:${a/5*100}%"></i></div><b class="tnum">${a?a.toFixed(1):"–"}</b></div>`;}).join("")}</div>`:""}
    </div>
    <div class="gallery" id="avisGallery" hidden></div>
    ${S.user?`<div class="reviewform"><div class="rfhead">Votre avis</div>
      ${CRITS.map(([k,l])=>`<div class="critrow"><span class="clab">${l}</span>${starsEdit(k,draftRate[k])}</div>`).join("")}
      <textarea id="revText" rows="3" maxlength="1000" placeholder="Une astuce, une variante, ce que vous en avez pensé…"></textarea>
      <label class="photobtn">${ic("i-plus")}<span id="revPhotoName">Ajouter une photo de votre plat</span><input type="file" accept="image/*" id="revPhoto" hidden></label>
      <button class="btn" id="revSubmit">Publier mon avis</button></div>`
      :`<button class="btn ghost" data-authprompt="1" style="width:100%;margin-top:12px">Connectez-vous pour noter, commenter et partager votre photo</button>`}
    <div id="avisList" class="avislist"></div></div>`;}
function renderPhotos(slug){const host=$("#avisGallery");if(!host)return;const list=PHOTOS[slug]||[];
  if(!list.length){host.hidden=true;host.innerHTML="";return;}host.hidden=false;
  host.innerHTML=list.map(p=>`<div class="gph"><img src="${photoUrl(p.path)}" alt="Plat de ${esc(p.author_name||"")}" loading="lazy" data-photofull="${esc(photoUrl(p.path))}"/>
    <span class="who">${esc(p.author_name||"")}</span>
    ${S.user&&p.user_id===S.user.id?`<button class="gact del" data-delphoto="${p.id}" aria-label="Supprimer ma photo">✕</button>`:(S.user?`<button class="gact rep" data-repphoto="${p.id}" aria-label="Signaler">⚑</button>`:"")}</div>`).join("");}
function renderComments(slug){const host=$("#avisList");if(!host)return;const list=CMTS[slug]||[];
  if(!list.length){host.innerHTML=`<p class="noavis">Soyez le premier à partager votre avis sur cette recette.</p>`;return;}
  host.innerHTML=list.map(c=>{const mine=S.user&&c.user_id===S.user.id;
    return `<div class="cmt"><div class="hd"><span class="au">${esc(c.author_name||"Gourmand")}</span><span class="dt">${timeago(c.created_at)}</span></div>
      <div class="bd">${esc(c.body)}</div>
      <div class="acts">${mine?`<button data-cdel="${c.id}">Supprimer</button>`:(S.user?`<button data-report="${c.id}">Signaler</button>`:"")}</div></div>`;}).join("");}
function loadComments(slug){if(!SB)return;SB.from("recipe_comments").select("id,user_id,author_name,body,created_at").eq("recipe_slug",slug).eq("status","visible").order("created_at",{ascending:false}).limit(60).then(({data})=>{CMTS[slug]=data||[];if(curId!=null&&R[curId].slug===slug)renderComments(slug);},()=>{});}
function loadPhotos(slug){if(!SB)return;SB.from("recipe_photos").select("id,user_id,author_name,path,created_at").eq("recipe_slug",slug).eq("status","visible").order("created_at",{ascending:false}).limit(40).then(({data})=>{PHOTOS[slug]=data||[];if(curId!=null&&R[curId].slug===slug)renderPhotos(slug);},()=>{});}
function refreshStat(slug){return SB.from("recipe_stats").select("*").eq("recipe_slug",slug).maybeSingle().then(({data})=>{if(data)STATS[slug]=data;},()=>{});}
function compressImage(file){return new Promise((res,rej)=>{const img=new Image(),url=URL.createObjectURL(file);
  img.onload=()=>{const max=1280;let w=img.width,h=img.height;if(w>h&&w>max){h=Math.round(h*max/w);w=max;}else if(h>max){w=Math.round(w*max/h);h=max;}
    const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);
    c.toBlob(b=>{URL.revokeObjectURL(url);b?res(b):rej();},"image/jpeg",0.82);};
  img.onerror=()=>{URL.revokeObjectURL(url);rej();};img.src=url;});}
async function submitReview(){if(!S.user){openAuth();return;}const r=R[curId],slug=r.slug;
  const ta=$("#revText"),text=ta?ta.value.trim():"";const hasRate=draftRate.taste||draftRate.ease||draftRate.visual;
  if(!hasRate&&!text&&!draftPhoto){toast("Ajoutez une note, un mot ou une photo.");return;}
  const btn=$("#revSubmit");if(btn){btn.disabled=true;btn.textContent="Publication…";}
  try{
    if(hasRate){const vals=[draftRate.taste,draftRate.ease,draftRate.visual].filter(Boolean);const global=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
      await SB.from("recipe_ratings").upsert({recipe_slug:slug,user_id:S.user.id,stars:global,taste:draftRate.taste||null,ease:draftRate.ease||null,visual:draftRate.visual||null,updated_at:new Date().toISOString()},{onConflict:"recipe_slug,user_id"});MYRATE[slug]=global;}
    if(text){const name=(S.profile&&S.profile.prenom)||"Gourmand";await SB.from("recipe_comments").insert({recipe_slug:slug,user_id:S.user.id,author_name:name,body:text});}
    if(draftPhoto){const blob=await compressImage(draftPhoto);const path=`${S.user.id}/${slug}-${Date.now()}.jpg`;
      const up=await SB.storage.from("dish-photos").upload(path,blob,{contentType:"image/jpeg",upsert:false});
      if(!up.error){const name=(S.profile&&S.profile.prenom)||"Gourmand";await SB.from("recipe_photos").insert({recipe_slug:slug,user_id:S.user.id,author_name:name,path});}}
    draftRate={taste:0,ease:0,visual:0};draftPhoto=null;toast("Merci pour votre avis !");
    await refreshStat(slug);loadComments(slug);loadPhotos(slug);renderDetail();
  }catch(e){toast("Publication impossible, réessayez.");if(btn){btn.disabled=false;btn.textContent="Publier mon avis";}}}
async function reportComment(id){if(!S.user){openAuth();return;}await SB.rpc("report_comment",{p_id:id});toast("Merci, l'avis a été signalé.");if(curId!=null)loadComments(R[curId].slug);}
async function delComment(id){if(!confirm("Supprimer votre commentaire ?"))return;await SB.from("recipe_comments").delete().eq("id",id);if(curId!=null){loadComments(R[curId].slug);refreshStat(R[curId].slug);}toast("Commentaire supprimé.");}
async function reportPhoto(id){if(!S.user){openAuth();return;}await SB.rpc("report_photo",{p_id:id});toast("Merci, la photo a été signalée.");if(curId!=null)loadPhotos(R[curId].slug);}
async function delPhoto(id){if(!confirm("Supprimer votre photo ?"))return;const ph=(PHOTOS[R[curId].slug]||[]).find(p=>p.id===id);
  await SB.from("recipe_photos").delete().eq("id",id);if(ph){try{await SB.storage.from("dish-photos").remove([ph.path]);}catch(e){}}
  if(curId!=null){loadPhotos(R[curId].slug);refreshStat(R[curId].slug);}toast("Photo supprimée.");}
if(SB){SB.auth.getSession().then(({data})=>{if(data&&data.session)afterAuth();});}

render();updateAcct();loadStats();
