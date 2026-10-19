(function(){
"use strict";
/* ================= storage ================= */
const KEY="tk_demo_v3";
function blank(){return {user:null,events:[],bot:[],unread:0}}
let S;
try{S=JSON.parse(localStorage.getItem(KEY))||blank()}catch(e){S=blank()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast("Память браузера заполнена: удалите часть фото")}}
const MEM={audio:{}};

/* ================= helpers ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function sum(n){return Math.round(n).toLocaleString("ru-RU").replace(/,/g," ")+" сум"}
function uid(){return Math.random().toString(36).slice(2,9)}
function nowT(){const d=new Date();return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")}
function toast(t){const l=$("#layer");const el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=t;l.appendChild(el);setTimeout(()=>el.remove(),2600)}
function getPath(o,p){return p.split(".").reduce((a,k)=>a==null?a:a[k],o)}
function setPath(o,p,v){const ks=p.split(".");let a=o;for(let i=0;i<ks.length-1;i++){if(a[ks[i]]==null)a[ks[i]]={};a=a[ks[i]]}a[ks[ks.length-1]]=v}
function enc(obj){const s=JSON.stringify(obj);try{if(window.LZString)return "z"+LZString.compressToEncodedURIComponent(s)}catch(e){}return "b"+btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
function dec(str){try{if(str[0]==="z")return JSON.parse(LZString.decompressFromEncodedURIComponent(str.slice(1)));let b=str.slice(1).replace(/-/g,"+").replace(/_/g,"/");while(b.length%4)b+="=";return JSON.parse(decodeURIComponent(escape(atob(b))))}catch(e){return null}}
function qrSvg(text){try{const q=qrcode(0,"L");q.addData(text);q.make();return q.createSvgTag({cellSize:4,margin:0,scalable:true})}catch(e){return '<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#ddd"/><text x="5" y="5.6" font-size="1.4" text-anchor="middle" fill="#666">QR</text></svg>'}}
function copyText(v,msg){const ok=()=>toast(msg||"Скопировано");try{navigator.clipboard.writeText(v).then(ok,()=>fallback())}catch(e){fallback()}
  function fallback(){const t=document.createElement("textarea");t.value=v;document.body.appendChild(t);t.select();try{document.execCommand("copy");ok()}catch(_){toast("Не удалось скопировать")}t.remove()}}
const ICON={
  tg:'<svg class="ico" viewBox="0 0 24 24" fill="currentColor"><path d="M21.4 4.3 2.9 11.4c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.8-1.4-1.4ZM9.3 14.6l8.6-7.7c.4-.3-.1-.5-.6-.2L6.9 13.5"/></svg>',
  back:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  check:'<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  note:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/></svg>',
  eye:'<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>'
};
const PRICE={base:250000,music:50000,photo:100000,print:100000};
const back=(href,label)=>`<a class="back" href="${href}">${ICON.back} ${label}</a>`;

/* ================= templates: layout × palette × font ================= */
const STYLE_NAME={milliy:"Milliy",klassika:"Klassika",gotika:"Gotika",gul:"Gullar va bog’",min:"Minimalizm",street:"Rok & graffiti"};
const COLOR_NAME={oq:"Светлые",qizil:"Красные",yashil:"Зелёные",kok:"Синие",pushti:"Розовые",oltin:"Золотые",qora:"Тёмные",sariq:"Жёлтые"};
/* fonts: every pair has Cyrillic in the body face; display faces marked lat are Latin-only */
const FONTS={
  cormorant:{n:"Cormorant",d:"Cormorant Garamond",b:"Manrope",it:1,sz:3.2,g:["Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500","Manrope:wght@400;600"]},
  playfair:{n:"Playfair",d:"Playfair Display",b:"PT Serif",it:1,sz:2.9,g:["Playfair+Display:ital@0;1","PT+Serif:ital@0;1"]},
  prata:{n:"Prata",d:"Prata",b:"Lora",sz:2.7,g:["Prata","Lora:ital@0;1"]},
  forum:{n:"Forum",d:"Forum",b:"Montserrat",sz:3,g:["Forum","Montserrat:wght@400;500"]},
  alice:{n:"Alice",d:"Alice",b:"Nunito",sz:2.9,g:["Alice","Nunito:wght@400;600"]},
  oldstd:{n:"Old Standard",d:"Old Standard TT",b:"PT Serif",it:1,sz:2.9,g:["Old+Standard+TT:ital@0;1","PT+Serif:ital@0;1"]},
  marck:{n:"Marck Script",d:"Marck Script",b:"Lora",sz:3.3,g:["Marck+Script","Lora:ital@0;1"]},
  badscript:{n:"Bad Script",d:"Bad Script",b:"Nunito",sz:3,g:["Bad+Script","Nunito:wght@400;600"]},
  lobster:{n:"Lobster",d:"Lobster",b:"Nunito",sz:3,g:["Lobster","Nunito:wght@400;600"]},
  yeseva:{n:"Yeseva One",d:"Yeseva One",b:"Lora",sz:2.6,g:["Yeseva+One","Lora:ital@0;1"]},
  oranienbaum:{n:"Oranienbaum",d:"Oranienbaum",b:"PT Serif",sz:3.1,g:["Oranienbaum","PT+Serif:ital@0;1"]},
  ruslan:{n:"Ruslan Display",d:"Ruslan Display",b:"PT Serif",sz:2.6,g:["Ruslan+Display","PT+Serif:ital@0;1"]},
  unifraktur:{n:"Unifraktur",d:"UnifrakturMaguntia",b:"Old Standard TT",sz:3,lat:1,g:["UnifrakturMaguntia","Old+Standard+TT:ital@0;1"]},
  tenor:{n:"Tenor Sans",d:"Tenor Sans",b:"Manrope",sz:2.6,up:1,g:["Tenor+Sans","Manrope:wght@400;600"]},
  unbounded:{n:"Unbounded",d:"Unbounded",b:"Manrope",sz:2.2,g:["Unbounded:wght@300;500","Manrope:wght@400;600"]},
  comfortaa:{n:"Comfortaa",d:"Comfortaa",b:"Nunito",sz:2.6,g:["Comfortaa:wght@400;600","Nunito:wght@400;600"]},
  russo:{n:"Russo One",d:"Russo One",b:"Rubik",sz:2.5,up:1,g:["Russo+One","Rubik:wght@400;500"]},
  rubikdirt:{n:"Rubik Dirt",d:"Rubik Dirt",b:"Rubik",sz:2.7,up:1,g:["Rubik+Dirt","Rubik:wght@400;500"]},
  spray:{n:"Rubik Spray Paint",d:"Rubik Spray Paint",b:"Rubik",sz:2.8,up:1,g:["Rubik+Spray+Paint","Rubik:wght@400;500"]},
  wetpaint:{n:"Rubik Wet Paint",d:"Rubik Wet Paint",b:"Rubik",sz:2.8,up:1,g:["Rubik+Wet+Paint","Rubik:wght@400;500"]},
  pacifico:{n:"Pacifico",d:"Pacifico",b:"Rubik",sz:2.7,g:["Pacifico","Rubik:wght@400;500"]},
  caveat:{n:"Caveat",d:"Caveat",b:"Nunito",sz:3.4,g:["Caveat:wght@500;700","Nunito:wght@400;600"]},
  kurale:{n:"Kurale",d:"Kurale",b:"PT Serif",sz:2.9,g:["Kurale","PT+Serif:ital@0;1"]},
  philosopher:{n:"Philosopher",d:"Philosopher",b:"Nunito",sz:3,g:["Philosopher:ital@0;1","Nunito:wght@400;600"]},
  amatic:{n:"Amatic SC",d:"Amatic SC",b:"Nunito",sz:3.6,g:["Amatic+SC:wght@400;700","Nunito:wght@400;600"]}
};
const fontLoaded={};
function loadFont(id){const f=FONTS[id];if(!f||fontLoaded[id])return;fontLoaded[id]=1;const l=document.createElement("link");l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?"+f.g.map(x=>"family="+x).join("&")+"&display=swap";document.head.appendChild(l)}
/* music: "syn" are generated in the browser; the rest stream from Wikimedia Commons */
const CMN="https://upload.wikimedia.org/wikipedia/commons/";
const MUSIC={
  t1:{n:"Nafis",d:"Мелодия Taklifnoma · фортепиано",syn:1},t2:{n:"Bahor",d:"Мелодия Taklifnoma · светлая",syn:1},t3:{n:"Kechki vals",d:"Мелодия Taklifnoma · вальс",syn:1},
  canon:{n:"Пахельбель — Канон ре мажор",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"c/c6/Canon_in_D_Major_%28ISRC_USUAN1100301%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Canon_in_D_Major_(ISRC_USUAN1100301).mp3"},
  bridal:{n:"Вагнер — Свадебный хор",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"a/a3/Wagner_Bridal_Chorus_%28ISRC_USUAN1100021%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Wagner_Bridal_Chorus_(ISRC_USUAN1100021).mp3"},
  nocturne:{n:"Шопен — Ноктюрн ми-бемоль мажор",d:"Фортепиано · CC0",u:CMN+"5/50/Nocturne_Op._9_no._2_in_E_flat_major.mp3",p:"https://commons.wikimedia.org/wiki/File:Nocturne_Op._9_no._2_in_E_flat_major.mp3"},
  air:{n:"Бах — Ария",d:"Струнный оркестр ВВС США · общественное достояние",u:CMN+"e/ec/Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3",p:"https://commons.wikimedia.org/wiki/File:Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3"},
  clair:{n:"Дебюсси — Лунный свет",d:"Медные духовые ВВС США · общественное достояние",u:CMN+"6/63/Clair_de_Lune_-_Wright_Brass_-_United_States_Air_Force_Band_of_Flight.mp3",p:"https://commons.wikimedia.org/wiki/File:Clair_de_Lune_-_Wright_Brass_-_United_States_Air_Force_Band_of_Flight.mp3"},
  gymno:{n:"Сати — Гимнопедия № 1",d:"Гитара, M. Laucke · общественное достояние",u:CMN+"transcoded/a/a6/Satie_Gymnopedie_No_1_performed_by_Michael_Laucke.flac/Satie_Gymnopedie_No_1_performed_by_Michael_Laucke.flac.mp3",p:"https://commons.wikimedia.org/wiki/File:Satie_Gymnopedie_No_1_performed_by_Michael_Laucke.flac"},
  flowers:{n:"Чайковский — Вальс цветов",d:"Оркестр армии США · общественное достояние",u:CMN+"e/e4/P.I._Tchaikovsky%27s_Waltz_of_the_Flowers_Performed_by_The_U.S._Army_Band%2C_c._2019.mp3",p:"https://commons.wikimedia.org/wiki/File:P.I._Tchaikovsky%27s_Waltz_of_the_Flowers_Performed_by_The_U.S._Army_Band,_c._2019.mp3"},
  danube:{n:"Штраус — На прекрасном голубом Дунае",d:"Оркестр морской пехоты США · общественное достояние",u:CMN+"d/de/%22An_der_sch%C3%B6nen%2C_blauen_Donau%22%2C_performed_by_the_US_Marine_Band.mp3",p:"https://commons.wikimedia.org/wiki/File:%22An_der_sch%C3%B6nen,_blauen_Donau%22,_performed_by_the_US_Marine_Band.mp3"},
  water:{n:"Гендель — Музыка на воде",d:"The Hallé, запись 1930-х · общественное достояние",u:CMN+"transcoded/1/12/PDP-CH_-_The_Hall%C3%A9_-_Malcolm_Sargent_-_Water_Music%2C_HWV_348-350_-_Suite_in_F_major%2C_HWV_348_-_Air%2C_Bourr%C3%A9e_-_Handel_-_Harty_-_Hmv-c3306-2er623.flac/PDP-CH_-_The_Hall%C3%A9_-_Malcolm_Sargent_-_Water_Music%2C_HWV_348-350_-_Suite_in_F_major%2C_HWV_348_-_Air%2C_Bourr%C3%A9e_-_Handel_-_Harty_-_Hmv-c3306-2er623.flac.mp3",p:"https://commons.wikimedia.org/wiki/File:PDP-CH_-_The_Hall%C3%A9_-_Malcolm_Sargent_-_Water_Music,_HWV_348-350_-_Suite_in_F_major,_HWV_348_-_Air,_Bourr%C3%A9e_-_Handel_-_Harty_-_Hmv-c3306-2er623.flac"},
  toccata:{n:"Бах — Токката и фуга ре минор",d:"Стоковский, запись 1920-х · общественное достояние",u:CMN+"transcoded/8/82/PDP-CH_-_Philadelphia_Orchestra_-_Leopold_Stokowski_-_Toccata_and_Fugue_in_D_minor%2C_BWV_565_-_Part_1_-_Johann_Sebastian_Bach_-_Electrola-ej231-5-0761.flac/PDP-CH_-_Philadelphia_Orchestra_-_Leopold_Stokowski_-_Toccata_and_Fugue_in_D_minor%2C_BWV_565_-_Part_1_-_Johann_Sebastian_Bach_-_Electrola-ej231-5-0761.flac.mp3",p:"https://commons.wikimedia.org/wiki/File:PDP-CH_-_Philadelphia_Orchestra_-_Leopold_Stokowski_-_Toccata_and_Fugue_in_D_minor,_BWV_565_-_Part_1_-_Johann_Sebastian_Bach_-_Electrola-ej231-5-0761.flac"},
  morning:{n:"Григ — Утро",d:"Musopen Symphony · общественное достояние",u:CMN+"transcoded/c/c2/Grieg_-_Peer_Gynt_Suite_No._1%2C_Op._46_-_I._Morning_Mood_%28Musopen_Symphony%29.flac/Grieg_-_Peer_Gynt_Suite_No._1%2C_Op._46_-_I._Morning_Mood_%28Musopen_Symphony%29.flac.mp3",p:"https://commons.wikimedia.org/wiki/File:Grieg_-_Peer_Gynt_Suite_No._1,_Op._46_-_I._Morning_Mood_(Musopen_Symphony).flac"},
  sockhop:{n:"Sock Hop — рок-н-ролл 50-х",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"d/d5/Sock_Hop_%28ISRC_USUAN1100495%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Sock_Hop_(ISRC_USUAN1100495).mp3"},
  surf:{n:"Surf Shimmy — сёрф-рок",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"c/c3/Surf_Shimmy_%28ISRC_USUAN1700018%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Surf_Shimmy_(ISRC_USUAN1700018).mp3"},
  rock:{n:"Rock Over London",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"8/89/Rock_Over_London_%28ISRC_USUAN1100092%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Rock_Over_London_(ISRC_USUAN1100092).mp3"},
  griphop:{n:"Griphop — хип-хоп",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"1/1e/Griphop_%28ISRC_USUAN1100413%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Griphop_(ISRC_USUAN1100413).mp3"},
  chillin:{n:"Chillin Hard — бит",d:"Kevin MacLeod · CC BY 3.0",cc:"Kevin MacLeod (incompetech.com), CC BY 3.0",u:CMN+"c/c7/Chillin_Hard_%28ISRC_USUAN1600028%29.mp3",p:"https://commons.wikimedia.org/wiki/File:Chillin_Hard_(ISRC_USUAN1600028).mp3"}
};
const pv=(paper,surface,ink,muted,accent,gold,line,ground,btn)=>({paper,surface,ink,muted,accent,gold,line,ground,btn});
const LAY={
  suzani:{name:"Suzani",style:"milliy",desc:"Розетки сюзане по углам, гранатовые и золотые тона вышивки.",fonts:["prata","marck","kurale"],music:["t1","canon","nocturne"],
    pals:[{id:"krem",name:"Krem",c:"qizil",v:pv("#F3EADB","#FBF5EA","#3A1E1E","#7D5A50","#A3262E","#B8893B","#E1CDB0","#E6D6BE","#FFFFFF")},
          {id:"oq",name:"Oq",c:"oq",v:pv("#FFFDF8","#FFFFFF","#3A1E1E","#846459","#B0272F","#C09243","#EADFCF","#EFE6D8","#FFFFFF")},
          {id:"zaytun",name:"Zaytun",c:"yashil",v:pv("#EEEEDD","#F8F8EC","#2F2A18","#6C6648","#8E2A23","#A88A3B","#D9D7BC","#DCDBC2","#FFFFFF")}]},
  samarqand:{name:"Samarqand",style:"milliy",desc:"Арка-михраб, восьмиконечная звезда и узор изразцов.",fonts:["forum","oranienbaum","philosopher"],music:["t3","air","canon"],
    pals:[{id:"kobalt",name:"Kobalt",c:"kok",dark:1,v:pv("#0F2A5C","#163670","#F4EBD8","#B9C4DA","#D4A64A","#D4A64A","rgba(212,166,74,.45)","#0A1E45","#0F2A5C")},
          {id:"moviy",name:"Moviy",c:"kok",v:pv("#F1F5FA","#FFFFFF","#13284F","#5B6B87","#1E4E9C","#2F7FA8","#CFDBEA","#DDE6F1","#FFFFFF")},
          {id:"firuza",name:"Firuza",c:"yashil",dark:1,v:pv("#0E3B3E","#144A4E","#F2EFE4","#A9C4C2","#E0B85A","#E0B85A","rgba(224,184,90,.4)","#092B2D","#0E3B3E")}]},
  bahor:{name:"Bahor",style:"gul",desc:"Цветущее «древо жизни» и весенние побеги.",fonts:["alice","badscript","comfortaa"],music:["t2","morning","flowers"],
    pals:[{id:"oq",name:"Oq",c:"oq",v:pv("#FBFBF7","#FFFFFF","#1F3B33","#61756E","#2E7D6A","#2E7D6A","#DDE7E2","#E7EFEA","#FFFFFF")},
          {id:"yalpiz",name:"Yalpiz",c:"yashil",v:pv("#E9F6EF","#F6FCF8","#173A31","#557067","#1F7A63","#1F7A63","#CFE6DA","#D4ECDF","#FFFFFF")},
          {id:"pushti",name:"Pushti",c:"pushti",v:pv("#FBEFF0","#FFF8F8","#3B2730","#84656F","#B5466A","#B5466A","#EFD6DB","#F1DDE1","#FFFFFF")}]},
  saroy:{name:"Saroy",style:"klassika",desc:"Дворцовая классика с узбекским золотым орнаментом на глубоком фоне.",fonts:["playfair","yeseva","oldstd"],music:["t1","danube","water"],
    pals:[{id:"bordo",name:"Bordo",c:"qizil",dark:1,v:pv("#5C1A23","#6E2330","#F6E9D7","#DABFA8","#D9B26A","#D9B26A","rgba(217,178,106,.4)","#45121A","#5C1A23")},
          {id:"zumrad",name:"Zumrad",c:"yashil",dark:1,v:pv("#123D33","#184B40","#F2EAD6","#B9CDBF","#D6B46A","#D6B46A","rgba(214,180,106,.4)","#0C2E26","#123D33")},
          {id:"tun",name:"Tun",c:"kok",dark:1,v:pv("#141B2E","#1C2540","#EFE7D6","#AEB6CC","#CFAE6B","#CFAE6B","rgba(207,174,107,.4)","#0D1222","#141B2E")},
          {id:"oltin",name:"Oltin",c:"oltin",v:pv("#F7F1E6","#FFFBF3","#3B2A1A","#7F6A53","#9A7433","#B8914A","#E5D7BE","#ECE1CD","#FFFFFF")}]},
  ivory:{name:"Ivory",style:"min",desc:"Сдержанный минимализм: много воздуха и тонкий орнамент ислими.",fonts:["cormorant","tenor","playfair"],music:["gymno","nocturne","t2"],
    pals:[{id:"fil",name:"Fil suyagi",c:"oq",v:pv("#F6F3EC","#FFFFFF","#2B2A28","#7A746A","#2B2A28","#B49A6A","#DDD5C6","#E9E4DA","#FFFFFF")},
          {id:"shalfey",name:"Shalfey",c:"yashil",v:pv("#EEF1EA","#FAFBF7","#26302A","#66736A","#4E6B55","#7E9884","#D3DBCF","#DDE4D8","#FFFFFF")},
          {id:"pudra",name:"Pudra",c:"pushti",v:pv("#F7EEEA","#FFF9F6","#3A2A2A","#8A6F6A","#9C5F57","#C29A8F","#EAD6CF","#EBDDD7","#FFFFFF")}]},
  barokko:{name:"Barokko",style:"klassika",isNew:1,desc:"Картуши и акантовые фризы с гравюр XVII–XVIII веков, золото на мраморе или бордо.",fonts:["playfair","oldstd","marck"],music:["water","air","canon"],
    pals:[{id:"fil",name:"Fil suyagi",c:"oltin",v:pv("#F5EFE3","#FFFBF2","#3A2C1C","#7D6A55","#9A7433","#A8823C","#E2D3B8","#E9DFCB","#FFFFFF")},
          {id:"bordo",name:"Bordo",c:"qizil",dark:1,v:pv("#4A1520","#5A1C29","#F4E6D2","#D2B8A0","#D4AF6A","#D4AF6A","rgba(212,175,106,.4)","#36101A","#4A1520")},
          {id:"marmar",name:"Marmar",c:"oq",v:pv("#EDEDEA","#F8F8F6","#2A2A2E","#6C6C72","#7A6033","#9C8045","#D6D6D0","#DEDED8","#FFFFFF")}]},
  lui:{name:"Versal",style:"klassika",isNew:1,desc:"Королевский дворец эпохи Людовика: рокайльный картуш, лилии-флёр-де-лис, синий и золото.",fonts:["oranienbaum","cormorant","yeseva"],music:["danube","bridal","water"],
    pals:[{id:"versal",name:"Versal",c:"kok",dark:1,v:pv("#13234A","#1A2D5C","#F3EBDA","#B4BFD6","#D8B76A","#D8B76A","rgba(216,183,106,.4)","#0C1835","#13234A")},
          {id:"oq",name:"Oq oltin",c:"oq",v:pv("#FBFAF6","#FFFFFF","#1E2A44","#66708A","#2B3F75","#B8944A","#E6E1D3","#ECE8DD","#FFFFFF")},
          {id:"lavanda",name:"Lavanda",c:"pushti",v:pv("#F1EEF6","#FBFAFD","#2E2640","#6F6683","#6A55A0","#B39456","#DCD5E8","#E3DDEE","#FFFFFF")}]},
  gotika:{name:"Gotika",style:"gotika",isNew:1,desc:"Стрельчатые арки, витражная роза и ажурный готический орнамент.",fonts:["ruslan","unifraktur","oldstd"],music:["toccata","clair","nocturne"],
    pals:[{id:"tun",name:"Tun",c:"qora",dark:1,v:pv("#141214","#1E1A1E","#EDE6DA","#A9A09A","#B8343F","#C9A35E","rgba(201,163,94,.35)","#0B0A0B","#FFFFFF")},
          {id:"qon",name:"Qon",c:"qizil",dark:1,v:pv("#3A0E14","#4A141C","#F2E4D6","#C9A9A0","#D7B26A","#D7B26A","rgba(215,178,106,.35)","#28090D","#3A0E14")},
          {id:"tosh",name:"Tosh",c:"oq",v:pv("#E6E3DE","#F2F0EC","#26232A","#66626C","#5B2430","#6E6670","#CFCAC2","#D6D2CB","#FFFFFF")}]},
  bog:{name:"Gulzor",style:"gul",isNew:1,desc:"Цветочный сад: букеты с гравюр Редуте — анемоны и розы.",fonts:["badscript","cormorant","alice"],music:["flowers","morning","canon"],
    pals:[{id:"oq",name:"Oq",c:"oq",v:pv("#FCFBF7","#FFFFFF","#2F3A2E","#6E776B","#7A4E86","#6E8B5E","#E3E6DD","#ECEEE6","#FFFFFF")},
          {id:"shalfey",name:"Shalfey",c:"yashil",v:pv("#EEF2EA","#F8FAF5","#253024","#5F6B5D","#A04E5A","#6E8B5E","#D4DDCE","#DCE4D5","#FFFFFF")},
          {id:"tun",name:"Tungi bog’",c:"qora",dark:1,v:pv("#1D2B22","#26372C","#F0EDE4","#B3C0B4","#E3A6B4","#C9B47A","rgba(201,180,122,.35)","#142019","#1D2B22")}]},
  atirgul:{name:"Atirgul",style:"gul",isNew:1,desc:"Розы Редуте: алые, розовые и бордовые.",fonts:["marck","cormorant","playfair"],music:["nocturne","canon","bridal"],
    pals:[{id:"pudra",name:"Pudra",c:"pushti",v:pv("#F8EDEB","#FFF8F6","#3B2326","#86656A","#A8344A","#B98A7E","#EBD5D1","#EEDCD8","#FFFFFF")},
          {id:"krem",name:"Krem",c:"oq",v:pv("#F7F1E5","#FFFBF2","#3A2A22","#7F6A5C","#9E2A3A","#A88A5C","#E5D9C4","#EBE1CF","#FFFFFF")},
          {id:"bordo",name:"Bordo",c:"qizil",dark:1,v:pv("#3E1018","#4D1620","#F6E6E0","#D3AFAA","#E9A3AE","#D9B27A","rgba(217,178,122,.35)","#2B0A10","#3E1018")}]},
  liliya:{name:"Liliya",style:"gul",isNew:1,desc:"Лилии из «Лилейных» Редуте — тонкие и графичные.",fonts:["cormorant","tenor","yeseva"],music:["air","clair","nocturne"],
    pals:[{id:"oq",name:"Oq",c:"oq",v:pv("#FBFBF8","#FFFFFF","#233029","#66746C","#2F6B57","#A5925C","#E1E6E0","#E9EDE7","#FFFFFF")},
          {id:"zumrad",name:"Zumrad",c:"yashil",dark:1,v:pv("#0F3A30","#154638","#F2EEE2","#B4CAC0","#E9C77B","#E9C77B","rgba(233,199,123,.35)","#0A2A22","#0F3A30")},
          {id:"shaftoli",name:"Shaftoli",c:"pushti",v:pv("#FBF0E8","#FFF8F3","#3A2A22","#84695C","#C0533A","#B98A5C","#EED9CB","#F1E0D3","#FFFFFF")}]},
  lola:{name:"Lola",style:"gul",isNew:1,desc:"Тюльпаны — символ узбекской весны. Гравюры Редуте.",fonts:["alice","prata","caveat"],music:["morning","flowers","canon"],
    pals:[{id:"oq",name:"Oq",c:"oq",v:pv("#FCFAF6","#FFFFFF","#2A2A22","#6F6E62","#C23B2E","#6E8B3D","#E6E3D9","#EEEBE1","#FFFFFF")},
          {id:"bahor",name:"Bahor",c:"yashil",v:pv("#EEF4E6","#F8FBF3","#24301D","#627058","#C23B2E","#5E8A3A","#D6E2C9","#DDE8CF","#FFFFFF")},
          {id:"qizil",name:"Qizil",c:"qizil",dark:1,v:pv("#6E1A1A","#7E2222","#FBEFE3","#E3BFB2","#F2C14E","#F2C14E","rgba(242,193,78,.35)","#521212","#6E1A1A")}]},
  kungaboqar:{name:"Kungaboqar",style:"gul",isNew:1,desc:"Подсолнухи — солнечный летний шаблон.",fonts:["comfortaa","caveat","alice"],music:["morning","t2","canon"],
    pals:[{id:"krem",name:"Krem",c:"sariq",v:pv("#FBF6E8","#FFFCF2","#33291A","#7A6B52","#B07A14","#6C7A2E","#ECE2C8","#F0E7CF","#FFFFFF")},
          {id:"osmon",name:"Osmon",c:"kok",v:pv("#E8F1F8","#F6FAFD","#1E2C3A","#5C6E80","#B57A0A","#2F6E9E","#CFDFEC","#D6E5F1","#FFFFFF")},
          {id:"zaytun",name:"Zaytun",c:"yashil",dark:1,v:pv("#2C3A1E","#364726","#F5EFD9","#C6C9A8","#F2BE3A","#F2BE3A","rgba(242,190,58,.35)","#1F2A15","#2C3A1E")}]},
  gortenziya:{name:"Gortenziya",style:"gul",isNew:1,desc:"Гортензии из «Флоры Японии» Зибольда: голубые и розовые.",fonts:["cormorant","philosopher","badscript"],music:["clair","gymno","flowers"],
    pals:[{id:"moviy",name:"Moviy",c:"kok",v:pv("#EEF2FA","#F9FAFE","#222B44","#626C88","#4A5FA8","#7E8FC7","#D8DFF0","#DEE4F3","#FFFFFF")},
          {id:"lavanda",name:"Lavanda",c:"pushti",v:pv("#F2EEF8","#FBF9FD","#2D2440","#6F6585","#7A55A6","#B08BC8","#E0D8EC","#E6DFF1","#FFFFFF")},
          {id:"oq",name:"Oq",c:"oq",v:pv("#FCFCFB","#FFFFFF","#2A2E35","#6B7079","#5468A6","#9AA6C9","#E5E7EB","#ECEEF1","#FFFFFF")}]},
  mevali:{name:"Mevali bog’",style:"gul",isNew:1,desc:"Фруктовый сад: гранаты и черешня из акварелей USDA.",fonts:["lobster","alice","amatic"],music:["morning","flowers","t2"],
    pals:[{id:"krem",name:"Krem",c:"oq",v:pv("#FBF5EA","#FFFBF3","#3A2318","#7F6555","#A3262E","#6E8B3D","#EADCC7","#EFE3CF","#FFFFFF")},
          {id:"shaftoli",name:"Shaftoli",c:"pushti",v:pv("#FCEEE4","#FFF8F2","#3B2418","#87665A","#C2452E","#7C9A45","#F0D8C8","#F3DFD0","#FFFFFF")},
          {id:"yashil",name:"Yashil bog’",c:"yashil",dark:1,v:pv("#1F3524","#28432E","#F6EEDF","#BDCDB8","#E86A5A","#E3C46E","rgba(227,196,110,.35)","#15261A","#1F3524")}]},
  minimal:{name:"Modern",style:"min",isNew:1,desc:"Современный минимализм: крупная типографика, тонкие линии, никакого декора.",fonts:["unbounded","tenor","cormorant"],music:["gymno","clair","nocturne"],
    pals:[{id:"oq",name:"Oq-qora",c:"oq",v:pv("#FFFFFF","#F6F6F4","#111111","#7A7A7A","#111111","#111111","#E5E5E5","#EDEDED","#FFFFFF")},
          {id:"qum",name:"Qum",c:"oltin",v:pv("#EFE9E0","#F7F3EC","#2B2621","#857B70","#2B2621","#A0866A","#DDD3C6","#E4DCD0","#EFE9E0")},
          {id:"grafit",name:"Grafit",c:"qora",dark:1,v:pv("#1C1D1F","#26272A","#F2F0EC","#9A9894","#F2F0EC","#C8B79A","#34363A","#121314","#1C1D1F")}]},
  rok:{name:"Rock’n’roll",style:"street",isNew:1,desc:"Афиша 50-х: звёзды, шахматная лента, винил и полутона.",fonts:["russo","rubikdirt","pacifico"],music:["sockhop","surf","rock"],
    pals:[{id:"klassik",name:"Klassik",c:"qizil",v:pv("#F4EBDD","#FFF7EA","#1A1A1A","#6B5F55","#D7262E","#1A1A1A","#1A1A1A","#1A1A1A","#FFFFFF")},
          {id:"tun",name:"Tun",c:"qora",dark:1,v:pv("#141414","#1F1F1F","#F4EBDD","#A9A29A","#E3342F","#F2C14E","#3A3A3A","#0A0A0A","#FFFFFF")},
          {id:"diner",name:"Diner",c:"pushti",v:pv("#CFEDE3","#E6F7F1","#1E2B33","#4C6670","#E2557A","#1E2B33","#1E2B33","#F6C9D3","#FFFFFF")}]},
  graffiti:{name:"Graffiti",style:"street",isNew:1,desc:"Стена, брызги краски и теги — для дня рождения и молодёжного праздника.",fonts:["spray","wetpaint","russo"],music:["griphop","chillin","rock"],
    pals:[{id:"neon",name:"Neon",c:"qora",dark:1,v:pv("#141418","#1D1D24","#F3F3F3","#A2A2AE","#FF3EA5","#B6FF3A","#2C2C36","#0B0B0E","#141418")},
          {id:"gisht",name:"G’isht",c:"qizil",dark:1,v:pv("#8A3B2C","#9A4535","#FFF4E8","#F0C9B8","#FFD23F","#34E0C4","rgba(255,244,232,.25)","#6A2B20","#2A1410")},
          {id:"devor",name:"Oq devor",c:"oq",v:pv("#F2F2EE","#FFFFFF","#1A1A1A","#666666","#3A5BFF","#FF4D2E","#DADAD4","#E2E2DC","#FFFFFF")}]}
};
const LAY_ORDER=["suzani","samarqand","saroy","bahor","ivory","barokko","lui","gotika","bog","atirgul","liliya","lola","kungaboqar","gortenziya","mevali","minimal","rok","graffiti"];
function palOf(ev){const L=LAY[ev.tpl]||LAY.suzani;return L.pals.find(p=>p.id===ev.pal)||L.pals[0]}
function fontOf(ev){const L=LAY[ev.tpl]||LAY.suzani;const id=L.fonts.includes(ev.font)?ev.font:(FONTS[ev.font]?ev.font:L.fonts[0]);return {id,...FONTS[id]}}
function palStyle(p,f){const v=p.v;let s=`--paper:${v.paper};--surface:${v.surface};--ink:${v.ink};--muted:${v.muted};--accent:${v.accent};--gold:${v.gold};--line:${v.line};--ground:${v.ground};--btn-fg:${v.btn};color-scheme:${p.dark?"dark":"light"}`;
  if(f){loadFont(f.id);s+=`;--f-display:"${f.d}",Georgia,serif;--f-body:"${f.b}","Helvetica Neue",Arial,sans-serif;--names-size:${f.sz}rem;--names-style:${f.it?"italic":"normal"};--names-tt:${f.up?"uppercase":"none"}`}return s}
function styleOf(ev){return palStyle(palOf(ev),fontOf(ev))}
const O=id=>`orn/${id}.webp`, A=id=>`art/${id}.webp`;
const img=(id,cls,st)=>`<img src="${O(id)}" class="${cls||""}" style="${st||""}" alt="" loading="lazy" decoding="async">`;
const art=(id,cls,st)=>`<img src="${A(id)}" class="${cls||""}" style="${st||""}" alt="" loading="lazy" decoding="async">`;
const maskU=(u,cls,st)=>`<span class="mask ${cls||""}" style="-webkit-mask-image:url(${u});mask-image:url(${u});${st||""}" aria-hidden="true"></span>`;
const mask=(id,cls,st)=>maskU(O(id),cls,st), amask=(id,cls,st)=>maskU(A(id),cls,st);
/* hand-drawn vector motifs */
const SV={
  fleur:(c,w)=>`<svg viewBox="0 0 100 120" width="${w}" height="${w*1.2}" aria-hidden="true" style="display:block;margin:0 auto"><g fill="${c}"><path d="M50 4c-9 14-12 30-6 46 2 6 4 12 6 18 2-6 4-12 6-18 6-16 3-32-6-46z"/><path d="M44 56C34 44 16 40 8 52c-6 9 0 22 12 22 8 0 12-6 10-12-3 4-10 4-12-1-2-6 4-11 11-9 6 2 10 6 15 12z"/><path d="M56 56c10-12 28-16 36-4 6 9 0 22-12 22-8 0-12-6-10-12 3 4 10 4 12-1 2-6-4-11-11-9-6 2-10 6-15 12z"/><rect x="26" y="66" width="48" height="8" rx="2"/><path d="M44 76h12l-2 26c0 6-8 6-8 0z"/><path d="M40 102h20l-4 14h-12z"/></g></svg>`,
  rose:(c,w)=>{let p="";for(let i=0;i<12;i++){p+=`<path d="M50 50 L50 8 A42 42 0 0 1 ${50+42*Math.sin(Math.PI/6)} ${50-42*Math.cos(Math.PI/6)} Z" transform="rotate(${i*30} 50 50)" fill="none" stroke="${c}" stroke-width="1"/><circle cx="50" cy="20" r="5" fill="none" stroke="${c}" stroke-width="1" transform="rotate(${i*30+15} 50 50)"/>`}
    return `<svg viewBox="0 0 100 100" width="${w}" height="${w}" aria-hidden="true" style="display:block;margin:0 auto"><circle cx="50" cy="50" r="47" fill="none" stroke="${c}" stroke-width="2"/><circle cx="50" cy="50" r="42" fill="none" stroke="${c}" stroke-width="1"/>${p}<circle cx="50" cy="50" r="10" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="50" cy="50" r="4" fill="${c}"/></svg>`},
  garch:c=>`<svg class="arch" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true"><path d="M8 296V130Q8 50 100 6Q192 50 192 130V296" fill="none" stroke="${c}" stroke-width="1.6" vector-effect="non-scaling-stroke"/><path d="M18 296V134Q18 62 100 20Q182 62 182 134V296" fill="none" stroke="${c}" stroke-width=".8" opacity=".6" vector-effect="non-scaling-stroke"/></svg>`,
  star:(c,w)=>`<svg viewBox="0 0 24 24" width="${w}" height="${w}" aria-hidden="true"><path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6l-6.4 3.5L7 14l-5.3-5 7.2-.9z" fill="${c}"/></svg>`,
  vinyl:(c,a)=>`<svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true"><circle cx="50" cy="50" r="48" fill="${c}"/>${[40,34,28].map(r=>`<circle cx="50" cy="50" r="${r}" fill="none" stroke="#fff" stroke-opacity=".12"/>`).join("")}<circle cx="50" cy="50" r="17" fill="${a}"/><circle cx="50" cy="50" r="2.5" fill="${c}"/></svg>`,
  drips:(c,h)=>{let p="";const xs=[6,14,27,39,48,61,72,84,93];xs.forEach((x,i)=>{const L=8+((i*37)%5)*6;p+=`<path d="M${x-2} 0h4v${L}a2 2 0 0 1-4 0z"/><circle cx="${x}" cy="${L+3}" r="2.2"/>`});return `<svg viewBox="0 0 100 40" preserveAspectRatio="none" width="100%" height="${h}" aria-hidden="true" style="display:block"><rect width="100" height="3" fill="${c}"/><g fill="${c}">${p}</g></svg>`},
  spray:(c,w)=>`<svg viewBox="0 0 100 100" width="${w}" height="${w}" aria-hidden="true"><defs><radialGradient id="sg${c.replace(/\W/g,"")}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".55" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#sg${c.replace(/\W/g,"")})"/>${Array.from({length:26},(_, i)=>{const a=i*2.4,r=34+((i*13)%14);return `<circle cx="${(50+r*Math.cos(a)).toFixed(1)}" cy="${(50+r*Math.sin(a)).toFixed(1)}" r="${(0.8+(i%3)*.5).toFixed(1)}" fill="${c}"/>`}).join("")}</svg>`
};
const ART_ROW=(a,b,w)=>`<div class="pair" aria-hidden="true">${art(a,"",`width:${w}px`)}${art(b,"",`width:${w}px`)}</div>`;
const DECO={
  ivory:{hero:()=>mask(361,"orn-top","width:56px;height:84px"),div:()=>mask(339,"","width:150px;height:46px"),band:()=>"",seal:ev=>`<div class="seal ini">${esc(initials(ev))}</div>`,top:()=>mask(361,"orn-top","width:40px;height:60px")},
  suzani:{hero:()=>img(471,"corner tl")+img(471,"corner tr"),div:()=>img(472,"","height:44px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${img(470)}</div>`,top:()=>img(471,"corner tl")+img(471,"corner tr")+img(471,"corner bl")+img(471,"corner br")},
  samarqand:{hero:p=>arch(p.v.gold)+img(433,"orn-top","width:92px"),div:()=>img(319,"","height:44px;width:auto"),band:()=>`<div class="band" style="background-image:url(${O(459)})" aria-hidden="true"></div>`,seal:()=>`<div class="seal">${img(433)}</div>`,top:p=>arch(p.v.gold)+img(433,"orn-top","width:70px")},
  bahor:{hero:()=>img(476,"orn-top","width:118px"),div:()=>img(477,"","height:46px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${img(478)}</div>`,top:()=>img(476,"orn-top","width:80px")},
  saroy:{hero:()=>mask(474,"orn-top","width:150px;height:128px"),div:()=>mask(339,"","width:160px;height:50px"),band:()=>mask(339,"band","height:30px;margin:0"),seal:()=>`<div class="seal">${mask(474,"","width:120px;height:104px")}</div>`,top:()=>mask(474,"orn-top","width:100px;height:86px")},
  barokko:{hero:()=>amask("bar_frame","orn-top","width:190px;height:150px"),div:()=>amask("bar_cart","","width:110px;height:56px"),band:()=>amask("bar_frieze","band","height:46px;margin:0;-webkit-mask-size:auto 100%;mask-size:auto 100%"),seal:()=>`<div class="seal">${amask("bar_frame","","width:130px;height:110px")}</div>`,top:()=>amask("bar_frame","orn-top","width:120px;height:96px")},
  lui:{hero:p=>amask("lui_cart","orn-top","width:150px;height:150px")+SV.fleur(p.v.gold,34),div:p=>`<div class="pair">${SV.fleur(p.v.gold,16)}${SV.fleur(p.v.gold,22)}${SV.fleur(p.v.gold,16)}</div>`,band:()=>amask("bar_frieze","band","height:40px;margin:0"),seal:(ev,p)=>`<div class="seal">${SV.fleur(p.v.gold,80)}</div>`,top:p=>SV.fleur(p.v.gold,40)},
  gotika:{hero:p=>SV.garch(p.v.gold)+`<div class="orn-top">${SV.rose(p.v.gold,96)}</div>`,div:p=>SV.rose(p.v.gold,40),band:()=>amask("goth_tr","band","height:70px;margin:0"),seal:(ev,p)=>`<div class="seal">${SV.rose(p.v.gold,110)}</div>`,top:p=>SV.garch(p.v.gold)+`<div class="orn-top">${SV.rose(p.v.gold,64)}</div>`},
  bog:{hero:()=>art("bouq_anem","corner tl big")+art("bouq_rose","corner tr big"),div:()=>art("bouq_anem","","height:64px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("bouq_anem","","height:130px;width:auto")}</div>`,top:()=>art("bouq_anem","corner tl big")+art("bouq_rose","corner tr big")},
  atirgul:{hero:()=>art("rose_red","corner tl big")+art("rose_pink","corner tr big"),div:()=>art("rose_b","","height:70px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("rose_red","","height:130px;width:auto")}</div>`,top:()=>art("rose_red","corner tl big")+art("rose_pink","corner br big")},
  liliya:{hero:()=>art("lily_red","orn-top","height:170px;width:auto"),div:()=>art("lily_yel","","height:76px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("lily_pink","","height:130px;width:auto")}</div>`,top:()=>art("lily_red","corner tl big")},
  lola:{hero:()=>ART_ROW("tulip_b","tulip_syl",70),div:()=>art("tulip_sua","","height:64px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("tulip_b","","height:130px;width:auto")}</div>`,top:()=>ART_ROW("tulip_b","tulip_syl",48)},
  kungaboqar:{hero:()=>art("sun_b","orn-top","height:160px;width:auto"),div:()=>art("sun_a","","height:60px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("sun_b","","height:130px;width:auto")}</div>`,top:()=>art("sun_b","corner tr big")},
  gortenziya:{hero:()=>art("hyd_blue","orn-top","height:150px;width:auto"),div:()=>art("hyd_pink","","height:60px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("hyd_blue","","height:120px;width:auto")}</div>`,top:()=>art("hyd_blue","corner tr big")},
  mevali:{hero:()=>art("pom_b","corner tl big")+art("cherry_b","corner tr big"),div:()=>art("pom_a","","height:50px;width:auto"),band:()=>"",seal:()=>`<div class="seal">${art("pom_a","","height:110px;width:auto")}</div>`,top:()=>art("pom_b","corner tl big")+art("cherry_a","corner br big")},
  minimal:{hero:()=>`<div class="mline" aria-hidden="true"></div>`,div:()=>`<div class="mline short" aria-hidden="true"></div>`,band:()=>"",seal:ev=>`<div class="seal ini sq">${esc(initials(ev))}</div>`,top:()=>`<div class="mline" aria-hidden="true"></div>`},
  rok:{hero:p=>`<div class="halftone" aria-hidden="true"></div><div class="pair">${SV.star(p.v.accent,26)}${SV.star(p.v.gold,34)}${SV.star(p.v.accent,26)}</div>`,div:p=>`<div class="pair">${SV.star(p.v.accent,16)}${SV.star(p.v.accent,16)}${SV.star(p.v.accent,16)}</div>`,band:()=>`<div class="checker" aria-hidden="true"></div>`,seal:(ev,p)=>`<div class="seal">${SV.vinyl("#151515",p.v.accent)}</div>`,top:p=>`<div class="pair">${SV.star(p.v.accent,20)}${SV.star(p.v.gold,26)}${SV.star(p.v.accent,20)}</div>`},
  graffiti:{hero:p=>`<div class="sprayL" aria-hidden="true">${SV.spray(p.v.accent,190)}</div><div class="sprayR" aria-hidden="true">${SV.spray(p.v.gold,150)}</div>`,div:p=>`<div class="tagline" aria-hidden="true">${SV.drips(p.v.accent,26)}</div>`,band:p=>SV.drips(p.v.gold,34),seal:(ev,p)=>`<div class="seal">${SV.spray(p.v.accent,130)}</div>`,top:p=>`<div class="sprayL" aria-hidden="true">${SV.spray(p.v.accent,120)}</div>`}
};
function arch(c){return `<svg class="arch" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true"><path d="M8 296V112C8 58 60 22 100 8c40 14 92 50 92 104v184" fill="none" stroke="${c}" stroke-width="1.4" vector-effect="non-scaling-stroke"/><path d="M16 296V114C16 66 64 34 100 20c36 14 84 46 84 94v182" fill="none" stroke="${c}" stroke-width=".8" opacity=".6" vector-effect="non-scaling-stroke"/></svg>`}

/* ================= dictionaries ================= */
const MON={uz:["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"],
  ru:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
  ruG:["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]};
const IT={
uz:{kinds:{wedding:"Nikoh to’yi",beshik:"Beshik to’yi",birthday:"Tug’ilgan kun"},amp:"va",
  days:["Yakshanba","Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"],wd:["Du","Se","Ch","Pa","Ju","Sh","Ya"],
  dear:"Aziz mehmonlar!",hello:n=>`Hurmatli ${n}!`,aboutH:"Tantana haqida",famG:"Kuyovning ota-onasi",famB:"Kelinning ota-onasi",fam1:"Ota-onasi",
  blk:{osh:"Nahorgi osh",nikoh:"Nikoh marosimi",toy:"To’y bazmi",main:"Bazm"},
  dateH:"Sana",start:t=>`Boshlanishi ${t} da`,addCal:"Kalendarga qo’shish",cdH:"Tantanagacha qoldi",cd:["kun","soat","daqiqa","soniya"],cdDone:"Bizni tabriklaganingiz uchun rahmat!",
  venueH:"Manzil",mapOpen:"Xaritada ochish",albumH:"Fotoalbom",progH:"Dastur",dressH:"Kiyinish uslubi",
  rsvpH:"Ishtirokingizni tasdiqlang",rsvpSub:d=>`${d.getDate()}-${MON.uz[d.getMonth()].toLowerCase()}gacha javob bersangiz, xursand bo’lamiz`,
  name:"Ismingiz",namePh:"Masalan, Aziz Karimov",o1:"Albatta boraman",o2:"Oilam bilan boraman",o3:"Afsuski, bora olmayman",count:"Necha kishi bo’lasiz?",comment:"Izoh (ixtiyoriy)",send:"Yuborish",
  errName:"Ismingizni yozing.",errOpt:"Javob variantini tanlang.",errWish:"Tilagingizni yozing.",thx:"Rahmat!",thxYes:"Javobingiz qabul qilindi. Sizni kutamiz!",thxNo:"Javobingiz qabul qilindi. Sizni sog’inib qolamiz.",
  wishesH:"Tilaklar kitobi",wishText:"Tilagingiz",wishSend:"Tilak qoldirish",wishThx:"Tilagingiz uchun rahmat!",wishEmpty:"Birinchi bo’lib tilak qoldiring",
  giftH:"Sovg’a",giftNote:"Siz bilan birga bo’lishimiz — eng katta sovg’a!",giftCopy:"Karta raqamini nusxalash",
  contactsH:"Aloqa",fin:"Sizni kutamiz!",envKicker:"Taklifnoma",envTo:"Hurmatli mehmon!",open:"Ochish",printText:"Sizni tantanamizga taklif qilamiz",qr:"Ishtirokni tasdiqlang va xaritani ko’ring",
  draft:"QORALAMA · oila bilan kelishish uchun",draftRsvp:"Bu qoralama: javoblar hali qabul qilinmaydi."},
ru:{kinds:{wedding:"Свадебное торжество",beshik:"Бешик-той",birthday:"День рождения"},amp:"и",
  days:["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"],wd:["Пн","Вт","Ср","Чт","Пт","Сб","Вс"],
  dear:"Дорогие гости!",hello:n=>`Здравствуйте, ${n}!`,aboutH:"О торжестве",famG:"Родители жениха",famB:"Родители невесты",fam1:"Родители",
  blk:{osh:"Утренний плов",nikoh:"Никох",toy:"Свадебный банкет",main:"Праздник"},
  dateH:"Дата",start:t=>`Начало в ${t}`,addCal:"Добавить в календарь",cdH:"До торжества осталось",cd:["дней","часов","минут","секунд"],cdDone:"Спасибо, что были с нами!",
  venueH:"Место",mapOpen:"Открыть на карте",albumH:"Фотоальбом",progH:"Программа",dressH:"Дресс-код",
  rsvpH:"Подтвердите присутствие",rsvpSub:d=>`Будем рады ответу до ${d.getDate()} ${MON.ruG[d.getMonth()]}`,
  name:"Ваше имя",namePh:"Например, Азиз Каримов",o1:"Обязательно приду",o2:"Приду с семьёй",o3:"К сожалению, не смогу",count:"Сколько вас будет?",comment:"Комментарий (необязательно)",send:"Отправить",
  errName:"Напишите ваше имя.",errOpt:"Выберите вариант ответа.",errWish:"Напишите пожелание.",thx:"Спасибо!",thxYes:"Ваш ответ получен. Ждём вас!",thxNo:"Ваш ответ получен. Будем скучать.",
  wishesH:"Книга пожеланий",wishText:"Ваше пожелание",wishSend:"Оставить пожелание",wishThx:"Спасибо за пожелание!",wishEmpty:"Оставьте пожелание первым",
  giftH:"Подарок",giftNote:"Ваше присутствие — лучший подарок для нас!",giftCopy:"Скопировать номер карты",
  contactsH:"Контакты",fin:"Ждём вас!",envKicker:"Приглашение",envTo:"Дорогой гость!",open:"Открыть",printText:"Приглашаем вас на наше торжество",qr:"Подтвердите присутствие и посмотрите карту",
  draft:"ЧЕРНОВИК · для согласования с семьёй",draftRsvp:"Это черновик: ответы пока не принимаются."}};
const PRESET={
  wedding:{uz:"Hayotimizdagi eng baxtli kunlardan birini siz bilan birga nishonlashni istaymiz. Sizni farzandlarimiz {g} va {b}ning nikoh to’yi tantanasiga taklif qilamiz.",
           ru:"Мы хотим разделить с вами один из самых счастливых дней нашей жизни. Приглашаем вас на свадебное торжество наших детей — {g} и {b}."},
  beshik:{uz:"Oilamizdagi quvonchli kunni siz bilan baham ko’rmoqchimiz. Sizni nevaramiz {g}ning beshik to’yiga taklif qilamiz.",
          ru:"Хотим разделить с вами радость в нашей семье. Приглашаем вас на бешик-той нашего внука {g}."},
  birthday:{uz:"Sizni {g}ning tug’ilgan kuni munosabati bilan o’tkaziladigan bazmga taklif qilamiz.",
            ru:"Приглашаем вас на праздник в честь дня рождения {g}."}};

/* ================= invitation renderer ================= */
function evDate(ev){return new Date(ev.date+"T"+(ev.time||"18:00")+":00+05:00")}
function wdOf(date){return new Date(date+"T12:00:00Z").getUTCDay()}
function fill(s,ev){return String(s||"").replace(/\{g\}/g,ev.g||"").replace(/\{b\}/g,ev.b||"")}
function txt(ev,field,lang){const v=ev[field]||{};return v[lang]!=null&&v[lang]!==""?v[lang]:(v.uz||v.ru||"")}
function namesHTML(ev,lang){return ev.kind==="wedding"?`${esc(ev.g)}<span class="amp">${IT[lang].amp}</span>${esc(ev.b)}`:esc(ev.g)}
function initials(ev){return ev.kind==="wedding"?((ev.g||"?")[0]+"&"+(ev.b||"?")[0]):(ev.g||"?")[0]}
function fmtDate(d){const [y,m,dd]=String(d).split("-");return `${dd} · ${m} · ${y}`}
function shortDate(d,lang){const [y,m,dd]=String(d).split("-").map(Number);return lang==="uz"?`${dd}-${MON.uz[m-1].toLowerCase()}`:`${dd} ${MON.ruG[m-1]}`}
function calendar(ev,lang){const t=IT[lang];const [y,m,dd]=ev.date.split("-").map(Number);const first=(new Date(Date.UTC(y,m-1,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(y,m,0)).getUTCDate();
  let h=t.wd.map(w=>`<div class="wd">${w}</div>`).join("");for(let i=0;i<first;i++)h+="<div></div>";for(let d=1;d<=days;d++)h+=`<div class="d${d===dd?" on":""}"><span>${d}</span></div>`;
  return `<div class="cal"><div class="cal-month">${MON[lang][m-1]} ${y}</div><div class="cal-grid">${h}</div></div>`}
function gcal(ev,lang){const s=evDate(ev),e=new Date(s.getTime()+4*3600e3);const f=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title(ev)+" — "+IT[lang].kinds[ev.kind])}&dates=${f(s)}/${f(e)}&location=${encodeURIComponent((ev.venue||"")+", "+(ev.addr||""))}&ctz=Asia/Tashkent`}
function blocks(ev){const out=[];const x=ev.extra||{};
  if(x.osh&&x.osh.on)out.push({k:"osh",date:x.osh.date,time:x.osh.time,place:x.osh.place});
  if(ev.kind==="wedding"&&x.nikoh&&x.nikoh.on)out.push({k:"nikoh",date:x.nikoh.date,time:x.nikoh.time,place:x.nikoh.place});
  out.push({k:ev.kind==="wedding"?"toy":"main",date:ev.date,time:ev.time,place:ev.venue});
  return out.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))}

function rsvpForm(lang,pfx,prefill){const t=IT[lang];return `<form class="gform" novalidate>
  <label class="gf" for="${pfx}n">${t.name}<input type="text" id="${pfx}n" autocomplete="name" placeholder="${t.namePh}" value="${esc(prefill||"")}"></label>
  <div class="opts" role="radiogroup">
   <label class="opt"><input type="radio" name="${pfx}o" value="o1">${t.o1}</label>
   <label class="opt"><input type="radio" name="${pfx}o" value="o2">${t.o2}</label>
   <label class="opt"><input type="radio" name="${pfx}o" value="o3">${t.o3}</label></div>
  <label class="gf" for="${pfx}c">${t.count}<input type="number" id="${pfx}c" min="1" max="30" value="1" inputmode="numeric"></label>
  <label class="gf" for="${pfx}m">${t.comment}<textarea id="${pfx}m"></textarea></label>
  <div class="gerr" aria-live="polite"></div>
  <button type="submit" class="ibtn solid">${t.send}</button></form>`}
function wishForm(lang,pfx,prefill){const t=IT[lang];return `<form class="wform" novalidate>
  <label class="gf" for="${pfx}wn">${t.name}<input type="text" id="${pfx}wn" value="${esc(prefill||"")}"></label>
  <label class="gf" for="${pfx}wt">${t.wishText}<textarea id="${pfx}wt"></textarea></label>
  <div class="gerr" aria-live="polite"></div><button type="submit" class="ibtn">${t.wishSend}</button></form>`}
function wishList(ev,lang){const w=(ev.wishes||[]).slice().reverse();const t=IT[lang];
  return w.length?`<div class="wishes">${w.map(x=>`<div class="wish-i"><b>${esc(x.name)}</b><small>${new Date(x.ts).toLocaleDateString("ru-RU")}</small><p>${esc(x.text)}</p></div>`).join("")}</div>`:`<p class="imuted" style="margin-bottom:16px">${t.wishEmpty}</p>`}

/* mode: "prev" (builder), "g" (guest), "demo" (template page) */
function inviteHTML(ev,lang,mode){
  const t=IT[lang],P=palOf(ev),D=DECO[ev.tpl]||DECO.suzani,pfx=mode+"_";
  const dl=ev.rsvpBy?new Date(ev.rsvpBy+"T12:00:00Z"):null;
  const prog=(ev.program||[]).filter(r=>r.time||r.uz||r.ru);
  const contacts=(ev.contacts||[]).filter(c=>c.name||c.phone);
  const dress=txt(ev,"dress",lang);
  const photos=ev.photos||[];
  const band=D.band(P);
  const greetName=ev.to?esc(ev.to):"";
  const fam=ev.kind==="wedding"?(ev.famG||ev.famB?`<div class="fam">${ev.famG?`<div><small>${t.famG}</small>${esc(ev.famG)}</div>`:""}${ev.famB?`<div><small>${t.famB}</small>${esc(ev.famB)}</div>`:""}</div>`:""):(ev.famG?`<div class="fam one"><div><small>${t.fam1}</small>${esc(ev.famG)}</div></div>`:"");
  const bl=blocks(ev);
  return `<div class="inv" data-tpl="${ev.tpl}" style="${styleOf(ev)}">
  ${ev.draft?`<div class="wm-ribbon">${t.draft}</div><div class="watermark"></div>`:""}
  <section class="sec hero">${D.hero(P)}
    <div class="kicker">${t.kinds[ev.kind]}</div>
    <h1 class="names">${namesHTML(ev,lang)}</h1>
    <div class="hero-date">${fmtDate(ev.date)}</div>
    <div class="hero-day">${t.days[wdOf(ev.date)]} · ${esc(ev.time)}</div>
    ${greetName?`<div class="greet">${t.hello(greetName)}</div>`:""}
  </section>
  ${photos[0]?`<section class="sec"><div class="frame"><img src="${photos[0]}" alt=""></div></section>`:""}
  ${band}
  <section class="sec">${D.div(P)}<h2 class="ih2">${greetName?t.hello(greetName):t.dear}</h2><p>${esc(fill(txt(ev,"text",lang),ev))}</p>
    ${fam?`<div style="height:10px"></div>${fam}`:""}
    <div class="evcards">${bl.map(b=>`<div class="evcard"><div class="tm">${esc(b.time)}</div><b>${t.blk[b.k]}</b><span>${esc(b.place)}</span><em>${t.days[wdOf(b.date)]}, ${shortDate(b.date,lang)}</em></div>`).join("")}</div>
    ${txt(ev,"sign",lang)?`<p class="imuted" style="margin-top:18px;font-style:italic">${esc(txt(ev,"sign",lang))}</p>`:""}</section>
  <section class="sec"><div class="kicker">${t.dateH}</div><div style="height:12px"></div>${calendar(ev,lang)}<div class="time-line">${t.start(esc(ev.time))}</div>
    <div class="maps"><a class="ibtn" href="${gcal(ev,lang)}" target="_blank" rel="noopener">${t.addCal}</a></div></section>
  <section class="sec"><div class="kicker">${t.cdH}</div><div style="height:14px"></div><div class="cd" data-ts="${evDate(ev).getTime()}" data-lang="${lang}"></div></section>
  <section class="sec">${D.div(P)}<h2 class="ih2">${t.venueH}</h2><div class="venue-name">${esc(ev.venue)}</div><div class="imuted">${esc(ev.addr)}</div>
    <div class="maps">${ev.map?`<a class="ibtn" href="${esc(ev.map)}" target="_blank" rel="noopener">${t.mapOpen}</a>`:""}
    <a class="ibtn" href="https://yandex.uz/maps/?text=${encodeURIComponent((ev.venue||"")+" "+(ev.addr||""))}" target="_blank" rel="noopener">Yandex</a>
    <a class="ibtn" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((ev.venue||"")+" "+(ev.addr||""))}" target="_blank" rel="noopener">Google</a></div></section>
  ${photos.length>1?`<section class="sec"><h2 class="ih2">${t.albumH}</h2><div class="album">${photos.map((p,i)=>`<button type="button" data-lb="${i}" aria-label="Фото ${i+1}"><img src="${p}" alt=""></button>`).join("")}</div></section>`:""}
  ${prog.length?`<section class="sec"><h2 class="ih2">${t.progH}</h2><ol class="prog">${prog.map(r=>`<li><time>${esc(r.time)}</time><span>${esc(r[lang]||r.uz||r.ru)}</span></li>`).join("")}</ol></section>`:""}
  ${dress?`<section class="sec"><h2 class="ih2">${t.dressH}</h2><p>${esc(dress)}</p>${(ev.dressColors||[]).length?`<div class="swatches" aria-hidden="true">${ev.dressColors.map(c=>`<span style="background:${esc(c)}"></span>`).join("")}</div>`:""}</section>`:""}
  ${band}
  <section class="sec">${D.div(P)}<h2 class="ih2">${t.rsvpH}</h2>${dl?`<p class="imuted" style="margin-bottom:20px">${t.rsvpSub(dl)}</p>`:""}<div class="rsvp-box">${ev.draft?`<p class="imuted">${t.draftRsvp}</p>`:rsvpForm(lang,pfx,ev.to)}</div></section>
  ${ev.opts&&ev.opts.wishes!==false?`<section class="sec"><h2 class="ih2">${t.wishesH}</h2><div class="wish-box">${wishList(ev,lang)}${ev.draft?"":wishForm(lang,pfx,ev.to)}</div></section>`:""}
  ${ev.gift&&ev.gift.on&&ev.gift.card?`<section class="sec"><h2 class="ih2">${t.giftH}</h2><div class="gift"><div class="imuted" style="font-size:13px">${esc(ev.gift.holder)}</div><div class="card-no">${esc(ev.gift.card)}</div><button type="button" class="ibtn" data-copy="${esc(ev.gift.card.replace(/\s/g,""))}">${t.giftCopy}</button><p class="imuted" style="margin:6px 0 0;font-size:13px">${t.giftNote}</p></div></section>`:""}
  ${contacts.length?`<section class="sec"><h2 class="ih2">${t.contactsH}</h2><div class="contacts">${contacts.map(c=>`<div class="contact"><div><small>${esc(c.label)}</small>${esc(c.name)}${c.phone?` · <span class="num">${esc(c.phone)}</span>`:""}</div></div>`).join("")}</div></section>`:""}
  <section class="sec final">${D.div(P)}<div class="ih2" style="margin-bottom:4px">${t.fin}</div><div class="names">${esc(initials(ev).replace("&"," & "))}</div><div class="brand">taklifnoma</div>${ev.opts&&ev.opts.music&&MUSIC[ev.music]&&MUSIC[ev.music].cc?`<div class="brand" style="margin-top:6px;text-transform:none;letter-spacing:0">♪ ${esc(MUSIC[ev.music].n)} · ${esc(MUSIC[ev.music].cc)}</div>`:""}</section>
  </div>`}
function miniHTML(ev,lang){const t=IT[lang],P=palOf(ev),D=DECO[ev.tpl];
  return `<div class="inv" data-tpl="${ev.tpl}" style="${styleOf(ev)}"><section class="sec hero">${D.hero(P)}<div class="kicker">${t.kinds[ev.kind]}</div><div class="names">${namesHTML(ev,lang)}</div><div class="hero-date">${fmtDate(ev.date)}</div><div class="hero-day">${t.days[wdOf(ev.date)]} · ${esc(ev.time)}</div></section>${D.band(P)}<section class="sec">${D.div(P)}<div class="ih2">${t.dear}</div><p>${esc(fill(txt(ev,"text",lang),ev))}</p></section></div>`}
function printCard(ev,lang,link){const t=IT[lang],P=palOf(ev),D=DECO[ev.tpl];
  return `<div class="inv a6" data-tpl="${ev.tpl}" style="${styleOf(ev)}">
   <div class="safe-line" aria-hidden="true"></div>${D.top(P)}
   <div style="position:relative"><div class="kicker">${t.kinds[ev.kind]}</div><div class="names">${namesHTML(ev,lang)}</div><div class="ps">${t.printText}</div></div>
   <div style="position:relative"><div class="dt">${fmtDate(ev.date)}</div><div class="ps">${t.days[wdOf(ev.date)]}, ${esc(ev.time)} · ${esc(ev.venue)}<br>${esc(ev.addr)}</div></div>
   <div class="qr-plate"><div class="qr">${qrSvg(link)}</div><span>${t.qr}</span></div></div>`}

function tickAll(){$$(".cd[data-ts]").forEach(el=>{const t=IT[el.dataset.lang];let s=Math.floor((+el.dataset.ts-Date.now())/1000);
  if(s<=0){el.style.display="block";el.innerHTML=`<p>${t.cdDone}</p>`;return}
  const v=[Math.floor(s/86400),Math.floor(s%86400/3600),Math.floor(s%3600/60),s%60];el.innerHTML=v.map((n,i)=>`<div><b>${String(n).padStart(2,"0")}</b><small>${t.cd[i]}</small></div>`).join("")})}
setInterval(tickAll,1000);

/* ================= music (generated in the browser as a stand-in for the licensed library) ================= */
const SONGS={t1:{ch:[[57,64,69,72],[53,60,65,69],[48,55,60,64],[55,62,67,71]],ms:360,wave:"triangle",pat:[0,1,2,3,2,1]},
  t2:{ch:[[60,64,67,72],[55,59,62,67],[57,60,64,69],[53,57,60,65]],ms:300,wave:"sine",pat:[0,2,1,3,2,1,0,2]},
  t3:{ch:[[50,57,62,65],[46,53,58,62],[53,57,60,65],[48,55,60,64]],ms:420,wave:"triangle",pat:[0,2,3]}};
const AU={ctx:null,timer:null,step:0,el:null,cur:null};
function midi(n){return 440*Math.pow(2,(n-69)/12)}
function stopMusic(){clearInterval(AU.timer);AU.timer=null;if(AU.el)AU.el.pause();AU.cur=null;$$(".music").forEach(b=>b.classList.remove("playing"));$$(".play[data-play]").forEach(b=>b.textContent="Слушать");$$(".track[data-play]").forEach(b=>b.setAttribute("aria-pressed","false"))}
function playMusic(id){stopMusic();if(!id||id==="none")return;AU.cur=id;
  if(MUSIC[id]&&MUSIC[id].u){AU.el=AU.el||new Audio();AU.el.src=MUSIC[id].u;AU.el.loop=true;AU.el.play().catch(()=>toast("Не удалось включить трек. Проверьте интернет."));$$(".music").forEach(b=>b.classList.add("playing"));return}
  if(id==="own"){const url=MEM.audio.url;if(!url){toast("Своя мелодия хранится только в этой сессии демо");return}AU.el=AU.el||new Audio();AU.el.src=url;AU.el.loop=true;AU.el.play().catch(()=>{});$$(".music").forEach(b=>b.classList.add("playing"));return}
  try{if(!AU.ctx){AU.ctx=new(window.AudioContext||window.webkitAudioContext)();const m=AU.ctx.createGain();m.gain.value=.5;const dl=AU.ctx.createDelay();dl.delayTime.value=.33;const fb=AU.ctx.createGain();fb.gain.value=.26;m.connect(AU.ctx.destination);m.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(AU.ctx.destination);AU.master=m}
    AU.ctx.resume();const S2=SONGS[id];AU.step=0;
    AU.timer=setInterval(()=>{const pl=S2.pat.length,ch=S2.ch[Math.floor(AU.step/(pl*2))%4],i=AU.step%pl,now=AU.ctx.currentTime+.05;note(midi(ch[S2.pat[i]]+12),now,1.3,.11,S2.wave);if(i===0)note(midi(ch[0]-12),now,2.4,.09,S2.wave);AU.step++},S2.ms);
    $$(".music").forEach(b=>b.classList.add("playing"))}catch(e){}}
function note(f,w,d,v,wave){const o=AU.ctx.createOscillator(),g=AU.ctx.createGain();o.type=wave;o.frequency.value=f;g.gain.setValueAtTime(0,w);g.gain.linearRampToValueAtTime(v,w+.03);g.gain.exponentialRampToValueAtTime(.0008,w+d);o.connect(g);g.connect(AU.master);o.start(w);o.stop(w+d+.05)}

/* ================= bot (imitation of the Telegram bot) ================= */
let botOpen=false;
function botSay(text,extra){S.bot.push(Object.assign({from:"b",text,t:nowT()},extra||{}));if(!botOpen)S.unread++;save();renderBot()}
function meSay(text){S.bot.push({from:"m",text,t:nowT()});save();renderBot()}
function openBot(){botOpen=true;S.unread=0;save();renderBot()}
function closeBot(){botOpen=false;renderBot()}
function renderBot(){const r=$("#botRoot");const route=parseRoute();
  if(route[0]==="g"||route[0]==="pay"){r.innerHTML="";return}
  if(!botOpen){r.innerHTML=S.user||route[0]==="login"?`<button type="button" class="bot-fab" id="botFab">${ICON.tg} Бот${S.unread?` <span class="badge">${S.unread}</span>`:""}</button>`:"";const f=$("#botFab");if(f)f.onclick=openBot;return}
  r.innerHTML=`<div class="bot" role="dialog" aria-label="Бот @taklifnoma_bot (имитация)">
   <div class="bot-h"><div class="bot-av">T</div><div><div class="nm">Taklifnoma Bot</div><div class="st">@taklifnoma_bot · имитация</div></div><button type="button" class="btn sm cl" id="botClose">Свернуть</button></div>
   <div class="bot-msgs" id="botMsgs">${S.bot.length?S.bot.map((m,i)=>msgHTML(m,i)).join(""):`<div class="msg b">Нажмите «Войти через Telegram» на сайте, чтобы начать.<span class="tm">${nowT()}</span></div>`}</div>
   <div class="bot-foot">Так будет выглядеть бот в Telegram. В демо он работает внутри страницы.</div></div>`;
  $("#botClose").onclick=closeBot;const ms=$("#botMsgs");ms.scrollTop=ms.scrollHeight;
  $$("[data-kb]",ms).forEach(b=>b.onclick=()=>botAction(b.dataset.kb,b.dataset.arg))}
function msgHTML(m,i){
  let body=esc(m.text);
  if(m.code)body+=`\n<span class="code">${m.code}</span>`;
  if(m.file)body=`<div class="file"><div class="fi">XLSX</div><div><b>${esc(m.file)}</b><br><span style="font-size:12px;color:#6D7A86">${esc(m.text)}</span></div></div>`;
  const kb=(m.kb&&m.kb.length&&!m.used)?`<div class="kb">${m.kb.map(k=>`<button type="button" data-kb="${k.a}" data-arg="${esc(k.arg!=null?k.arg:i)}">${esc(k.l)}</button>`).join("")}</div>`:"";
  return `<div class="msg ${m.from}">${body}<span class="tm">${m.t}</span></div>${kb}`}
function botAction(a,arg){
  if(a==="contact"){const m=S.bot[+arg];if(m)m.used=true;meSay("Контакт: +998 90 123 45 67");
    const code=String(Math.floor(100000+Math.random()*900000));S.pendingCode=code;save();
    setTimeout(()=>botSay("Код для входа на сайт. Никому его не сообщайте.",{code}),600);
    setTimeout(()=>botSay("Введите этот код на сайте.",{kb:[{l:"Вернуться на сайт",a:"back"}]}),900)}
  if(a==="back"){closeBot();const i=$("#c0");if(i)i.focus()}
  if(a==="xlsx"){const ev=S.events.find(e=>e.id===arg);if(ev)downloadXlsx(ev)}
}

/* ================= router ================= */
function parseRoute(){return (location.hash.replace(/^#\/?/,"")||"").split("/").filter(Boolean)}
function go(h){if(location.hash==="#"+h)render();else location.hash=h}
window.addEventListener("hashchange",()=>{stopMusic();$$("#layer .sms,#layer .lightbox").forEach(x=>x.remove());render();window.scrollTo(0,0)});
function needAuth(){if(!S.user){S.after=location.hash.slice(1);save();go("/login");return true}return false}
function getEv(id){return S.events.find(e=>e.id===id)}

function header(){return `<header class="hdr gut"><div class="container"><a class="logo" href="#/">Taklif<span>noma</span></a>
  <div class="hdr-r"><span class="demo-tag">демо</span><a class="btn sm ghost" href="#/templates">Шаблоны</a>${S.user?`<a class="btn sm ghost" href="#/app">Мои приглашения</a>`:`<a class="btn sm" href="#/login">Войти</a>`}</div></div></header>`}
function footer(){return `<footer class="foot gut"><div class="container"><span>Демо-версия. Данные хранятся только в этом браузере, оплата и SMS имитируются. Орнаменты: TBC Ornaments. Иллюстрации и записи: Wikimedia Commons (общественное достояние, CC0, CC BY — Kevin MacLeod, incompetech.com).</span><button type="button" class="linkbtn" id="resetDemo">Сбросить демо</button></div></footer>`}

function render(){
  const r=parseRoute(),root=$("#root");
  document.body.style.background="";
  let v;
  switch(r[0]){
    case undefined: case "": v=vLanding();break;
    case "templates": v=vCatalog();break;
    case "t": v=vTemplate(r[1],r[2]);break;
    case "use": if(needAuth())return; {const ev=newEvent({tpl:r[1],pal:r[2]});S.events.unshift(ev);save();location.replace("#/edit/"+ev.id);return}
    case "login": v=vLogin();break;
    case "app": if(needAuth())return; v=vDash();break;
    case "new": if(needAuth())return; {const ev=newEvent();S.events.unshift(ev);save();location.replace("#/edit/"+ev.id);return}
    case "edit": if(needAuth())return; v=vEdit(r[1],+r[2]||0);break;
    case "checkout": if(needAuth())return; v=vCheckout(r[1]);break;
    case "pay": if(needAuth())return; v=vPay(r[1]);break;
    case "done": if(needAuth())return; v=vDone(r[1]);break;
    case "event": if(needAuth())return; v=vEvent(r[1]);break;
    case "print": if(needAuth())return; v=vPrint(r[1]);break;
    case "g": v=vGuest(r[1]);break;
    default: v=vLanding();
  }
  root.innerHTML=v.html; if(v.after)v.after();
  const rs=$("#resetDemo");if(rs)rs.onclick=()=>{if(rs.dataset.armed){try{localStorage.removeItem(KEY)}catch(e){}S=blank();botOpen=false;go("/");renderBot()}else{rs.dataset.armed=1;rs.textContent="Нажмите ещё раз, чтобы удалить все данные демо"}};
  bindInvite(null,true);tickAll();renderBot();
}

/* ================= data ================= */
function newEvent(o){o=o||{};const tpl=LAY[o.tpl]?o.tpl:"suzani";const pal=(LAY[tpl].pals.find(p=>p.id===o.pal)||LAY[tpl].pals[0]).id;
  return{id:uid(),status:"draft",created:Date.now(),tpl,pal,kind:"wedding",langs:"both",
  g:"Jasur",b:"Madina",famG:"Karimov Botir va Karimova Dilfuza",famB:"Rahimov Anvar va Rahimova Nodira",
  date:"2026-11-21",time:"18:00",venue:"«Gulzor» to’yxonasi, Oltin zal",addr:"Toshkent sh., Yunusobod tumani",map:"",
  extra:{osh:{on:true,date:"2026-11-21",time:"06:00",place:"Kuyov xonadoni, Chilonzor 12-mavze"},nikoh:{on:true,date:"2026-11-20",time:"15:00",place:"Minor masjidi"}},
  text:{uz:PRESET.wedding.uz,ru:PRESET.wedding.ru},sign:{uz:"Hurmat bilan, Karimovlar va Rahimovlar oilasi",ru:"С уважением, семьи Каримовых и Рахимовых"},
  dress:{uz:"Klassik uslub. Iltimos, oq rangli kiyimdan saqlaning.",ru:"Классический стиль. Пожалуйста, избегайте белого."},dressColors:["#1F2A44","#6B4E3D","#8A9A7B","#B79C7A","#2E2E2E"],
  program:[{time:"17:30",uz:"Mehmonlarni kutib olish",ru:"Встреча гостей"},{time:"18:00",uz:"Kelin-kuyovni kutib olish",ru:"Встреча молодых"},{time:"19:00",uz:"Bazm va raqslar",ru:"Банкет и танцы"},{time:"22:30",uz:"Yakuniy so’z",ru:"Завершение вечера"}],
  contacts:[{label:"Kuyov tomoni / Сторона жениха",name:"Botir",phone:"+998 90 123 45 67"},{label:"Kelin tomoni / Сторона невесты",name:"Nodira",phone:"+998 93 765 43 21"}],
  slug:"jasur-madina",rsvpBy:"2026-11-15",photos:[],music:LAY[tpl].music[0],font:LAY[tpl].fonts[0],opts:{music:true,print:false,wishes:true},gift:{on:false,holder:"",card:""},musicAgree:false,
  paid:{base:false,photo:false,music:false,print:false},disc:false,rsvps:[],wishes:[],guests:[]}}
function sampleEv(tpl,pal){return Object.assign(newEvent({tpl,pal}),{wishes:[{name:"Dilnoza",text:"Baxtli bo’linglar! Oilangiz mustahkam bo’lsin.",ts:Date.now()-86400e3},{name:"Азиз",text:"Поздравляем! Любви и терпения.",ts:Date.now()-3600e3}]})}
function langsOf(ev){return ev.langs==="both"?["uz","ru"]:[ev.langs]}
function title(ev){return ev.kind==="wedding"?`${ev.g||"…"} & ${ev.b||"…"}`:(ev.g||"…")}
function items(ev){const it=[{k:"base",l:`Шаблон «${LAY[ev.tpl].name} · ${palOf(ev).name}»${ev.disc?" · −50% на следующее событие":""}`,p:PRICE.base*(ev.disc?.5:1)}];
  if(ev.opts.music&&ev.music!=="none")it.push({k:"music",l:"Музыка",p:PRICE.music});
  if((ev.photos||[]).length)it.push({k:"photo",l:`Свои фото (${ev.photos.length})`,p:PRICE.photo});
  if(ev.opts.print)it.push({k:"print",l:"Выгрузка для печати (PDF)",p:PRICE.print});return it}
function due(ev){return items(ev).filter(i=>!ev.paid[i.k])}
function pubData(ev,extra){const c=Object.assign({},ev);["photos","rsvps","paid","musicAgree","wishes","guests","created","paidAt","paidTotal"].forEach(k=>delete c[k]);return Object.assign(c,extra||{})}
function guestLink(ev,extra){return location.origin+location.pathname+"#/g/"+enc(pubData(ev,extra))}
function prettyLink(ev){return "taklifnoma.uz/"+(ev.slug||ev.id)}

/* ================= views ================= */
function vLanding(){
  const th=["suzani","samarqand","bahor"].map(tp=>{const e=newEvent({tpl:tp});return `<a class="thumb" href="#/t/${tp}/${e.pal}"><div class="mini">${miniHTML(e,"uz")}</div><div class="cap">${LAY[tp].name}</div></a>`}).join("");
  return{html:header()+`<main class="gut"><div class="container land">
   <div class="land-hero"><div class="stack">
     <div class="lbl">Онлайн-приглашения на той</div>
     <h1 class="h1">Приглашение на свадьбу за 10 минут. Ссылка для гостей и список ответов.</h1>
     <p class="muted">Выберите шаблон с узбекским орнаментом, впишите имена, семьи, дату и тойхону. Гости откроют приглашение по ссылке в Telegram и сразу ответят, придут ли. Ответы и список в Excel приходят вам в бот.</p>
     <div class="row"><a class="btn pri" href="#/login">${ICON.tg} Войти через Telegram</a><a class="btn" href="#/templates">Смотреть шаблоны</a></div>
   </div><div class="thumbs">${th}</div></div>
   <div class="steps3">
     <div class="panel"><b>1. Соберите</b><span class="muted">18 макетов: от сюзане и барокко до роз, тюльпанов и граффити. Цвет, шрифт и музыку можно сменить в любой момент.</span></div>
     <div class="panel"><b>2. Согласуйте и оплатите</b><span class="muted">Бесплатная ссылка-черновик для семьи. После оплаты — ссылка для гостей и QR-код.</span></div>
     <div class="panel"><b>3. Получайте ответы</b><span class="muted">Ответы и пожелания гостей приходят в бот. Список скачивается в Excel.</span></div>
   </div>
   <div style="margin-top:40px"><div class="h2">Цены</div>
   <div class="prices">
     <div class="panel"><div class="lbl">Шаблон</div><div class="sum">250 000</div><div class="small muted">сум · приглашение, ответы гостей, кабинет. Следующее событие семьи −50%</div></div>
     <div class="panel"><div class="lbl">Музыка</div><div class="sum">+50 000</div><div class="small muted">сум · из библиотеки или своя</div></div>
     <div class="panel"><div class="lbl">Свои фото</div><div class="sum">+100 000</div><div class="small muted">сум · фото на обложке и альбом до 6 фото</div></div>
     <div class="panel"><div class="lbl">Печать</div><div class="sum">+100 000</div><div class="small muted">сум · PDF открытки A6 с QR-кодом</div></div>
   </div></div>
  </div></main>`+footer()}}

let catStyle="all",catColor="all";
function vCatalog(){
  const all=[];LAY_ORDER.forEach(l=>LAY[l].pals.forEach(p=>all.push({l,p})));
  const list=all.filter(x=>(catStyle==="all"||LAY[x.l].style===catStyle)&&(catColor==="all"||x.p.c===catColor));
  const card=x=>{const e=newEvent({tpl:x.l,pal:x.p.id});return `<a class="cat-card" href="#/t/${x.l}/${x.p.id}"><div class="mini">${miniHTML(e,"uz")}</div><div class="cap"><b>${LAY[x.l].name} · ${x.p.name}</b>${LAY[x.l].isNew?`<span class="pill new">Новинка</span>`:`<span class="swatch-row"><i style="background:${x.p.v.paper}"></i><i style="background:${x.p.v.accent}"></i></span>`}</div></a>`};
  return{html:header()+`<main class="gut"><div class="container page">
   <div class="page-head"><div><div class="lbl">Каталог</div><h1 class="h2" style="font-size:1.7rem">Шаблоны приглашений</h1><p class="muted" style="margin:6px 0 0">${all.length} вариантов: ${LAY_ORDER.length} макетов в нескольких цветах, у каждого свои шрифты и музыка. Подходят для никоха, бешик-тоя и дня рождения.</p></div></div>
   <div class="stack" style="gap:10px">
    <div class="chips" id="cs">${[["all","Все стили"],...Object.entries(STYLE_NAME)].map(([v,l])=>`<button type="button" class="chip-btn" data-v="${v}" aria-pressed="${catStyle===v}">${l}</button>`).join("")}</div>
    <div class="chips" id="cc">${[["all","Все цвета"],...Object.entries(COLOR_NAME)].map(([v,l])=>`<button type="button" class="chip-btn" data-v="${v}" aria-pressed="${catColor===v}">${l}</button>`).join("")}</div>
   </div>
   ${list.length?`<div class="cat-grid">${list.map(card).join("")}</div>`:`<div class="panel empty" style="margin-top:18px"><b>Нет шаблонов с таким сочетанием.</b><p class="muted">Сбросьте один из фильтров.</p></div>`}
  </div></main>`+footer(),after(){
   $$("#cs button").forEach(b=>b.onclick=()=>{catStyle=b.dataset.v;render()});
   $$("#cc button").forEach(b=>b.onclick=()=>{catColor=b.dataset.v;render()});}}}

let demoLang="uz";
function vTemplate(l,pid){if(!LAY[l])return vCatalog();const L=LAY[l];const ev=sampleEv(l,pid);const P=palOf(ev);
  return{html:header()+`<main class="gut"><div class="container page">
   ${back("#/templates","Все шаблоны")}
   <div class="tdetail" style="margin-top:10px"><div class="stack">
     <div><div class="lbl">${STYLE_NAME[L.style]}${L.isNew?" · новинка":""}</div><h1 class="h1" style="font-size:2.6rem">${L.name} · ${P.name}</h1><p class="muted" style="font-size:1.05rem">${L.desc}</p></div>
     <div class="f"><span>Цвет</span><div class="pal-pick">${L.pals.map(p=>`<a class="pal-btn" href="#/t/${l}/${p.id}" aria-pressed="${p.id===P.id}" style="text-decoration:none;color:inherit"><span class="swatch-row"><i style="background:${p.v.paper}"></i><i style="background:${p.v.accent}"></i><i style="background:${p.v.gold}"></i></span>${p.name}</a>`).join("")}</div></div>
     <div class="grid2"><div class="f"><span>Шрифты на выбор</span><div class="stack" style="gap:6px">${L.fonts.map(fid=>{loadFont(fid);const f=FONTS[fid];return `<div class="font-card" style="font-family:'${f.d}',serif">${f.lat?"Jasur & Madina":"Жасур и Мадина"}<small>${f.n}${f.lat?" · латиница":""}</small></div>`}).join("")}</div></div>
     <div class="f"><span>Музыка к шаблону</span><div class="stack" style="gap:6px">${L.music.map(m=>`<button type="button" class="track" data-play="${m}"><b>${esc(MUSIC[m].n)}</b><small>${esc(MUSIC[m].d)}</small></button>`).join("")}</div></div></div>
     <div class="panel pad"><div class="h3" style="margin-bottom:10px">Что есть в приглашении</div><ul class="feat">
       <li>Конверт с печатью и музыкой</li><li>Имена и родители с обеих сторон</li><li>Нахорги ош, никох и той — отдельными карточками</li><li>Календарь и «Добавить в календарь»</li><li>Обратный отсчёт</li><li>Карта: Яндекс и Google</li><li>Фото и альбом до 6 фото</li><li>Программа и дресс-код с цветами</li><li>Ответ гостя: приду, с семьёй, не смогу</li><li>Книга пожеланий</li><li>Персональные ссылки по именам гостей</li><li>Узбекский и русский, гость выбирает</li></ul></div>
     <div class="row"><a class="btn pri" href="#/use/${l}/${P.id}">Создать с этим шаблоном</a><span class="muted small">от 250 000 сум · создание и черновик для семьи бесплатно</span></div>
     <p class="hint">Орнаменты: каталог узбекских орнаментов TBC Ornaments.</p>
   </div>
   <aside><div class="prev-bar"><span class="lbl">Живое демо</span><div class="seg" id="dl">${["uz","ru"].map(x=>`<button type="button" data-v="${x}" aria-pressed="${demoLang===x}">${x.toUpperCase()}</button>`).join("")}</div></div>
     <div class="phone"><div class="scr" id="demoScr">${inviteHTML(ev,demoLang,"demo")}</div></div></aside></div>
  </div></main>`+footer(),after(){$$("#dl button").forEach(b=>b.onclick=()=>{demoLang=b.dataset.v;render()});bindInvite(ev,true,false,"demo");$$(".track[data-play]").forEach(b=>b.onclick=()=>{if(AU.cur===b.dataset.play)stopMusic();else{playMusic(b.dataset.play);b.setAttribute("aria-pressed","true")}})}}}

function vLogin(){
  if(S.user)return{html:header()+`<main class="gut"><div class="panel auth stack"><div class="h2">Вы уже вошли</div><p class="muted">${esc(S.user.phone)}</p><a class="btn pri" href="#/app">Мои приглашения</a></div></main>`};
  return{html:header()+`<main class="gut"><div class="panel auth">
    <div class="h2" style="margin-bottom:6px">Вход через Telegram</div>
    <p class="muted small" style="margin:0 0 10px">Пароль не нужен. Бот подтвердит ваш номер и пришлёт код.</p>
    <div class="tg-step ${S.pendingCode?"done":""}"><div class="n">1</div><div style="flex:1"><b>Откройте бота</b><div class="small muted">Нажмите кнопку и поделитесь номером телефона</div><div style="margin-top:10px"><button type="button" class="btn pri" id="openTg">${ICON.tg} Открыть @taklifnoma_bot</button></div></div></div>
    <div class="tg-step"><div class="n">2</div><div style="flex:1"><b>Введите код из бота</b>
      <div class="code-in" id="codeIn">${[0,1,2,3,4,5].map(i=>`<input id="c${i}" inputmode="numeric" maxlength="1" aria-label="Цифра ${i+1}" autocomplete="one-time-code">`).join("")}</div>
      <div class="err" id="cerr" aria-live="polite"></div>
      <button type="button" class="btn pri wide" id="cgo">Войти</button>
      <div class="small muted" style="margin-top:8px">Код не пришёл? <button type="button" class="linkbtn" id="resend">Отправить снова</button></div></div></div>
  </div></main>`,after(){
    $("#openTg").onclick=()=>{if(!S.bot.some(m=>m.kb&&m.kb[0]&&m.kb[0].a==="contact"&&!m.used)){meSay("/start");setTimeout(()=>botSay("Assalomu alaykum! Добро пожаловать в Taklifnoma.\nЧтобы войти на сайт, поделитесь номером телефона.",{kb:[{l:"Отправить номер телефона",a:"contact",arg:String(S.bot.length)}]}),400)}openBot()};
    $("#resend").onclick=()=>{S.pendingCode=null;S.bot.forEach(m=>{if(m.kb&&m.kb[0]&&m.kb[0].a==="contact")m.used=true});save();$("#openTg").click()};
    const ins=$$("#codeIn input");
    codeInputs(ins,tryLogin);$("#cgo").onclick=tryLogin;
    function tryLogin(){const v=ins.map(x=>x.value).join("");const err=$("#cerr");
      if(!S.pendingCode){err.textContent="Сначала откройте бота и отправьте номер телефона.";return}
      if(v.length<6){err.textContent="Введите все 6 цифр кода.";return}
      if(v!==S.pendingCode){err.textContent="Код не подходит. Проверьте сообщение от бота.";ins.forEach(x=>x.value="");ins[0].focus();return}
      S.user={phone:"+998 90 123 45 67",since:Date.now()};S.pendingCode=null;const after=S.after;S.after=null;save();
      botSay("Вы вошли на сайт. Сюда будут приходить ответы гостей, пожелания, оплаты и списки в Excel.");closeBot();go(after||"/app")}
  }}}
function codeInputs(ins,done){ins.forEach((inp,i)=>{inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\D/g,"").slice(-1);if(inp.value&&ins[i+1])ins[i+1].focus();if(ins.every(x=>x.value))done()});
  inp.addEventListener("keydown",e=>{if(e.key==="Backspace"&&!inp.value&&ins[i-1])ins[i-1].focus()});
  inp.addEventListener("paste",e=>{const v=(e.clipboardData.getData("text")||"").replace(/\D/g,"").slice(0,6);if(v.length){e.preventDefault();ins.forEach((x,j)=>x.value=v[j]||"");done()}})})}

function vDash(){
  const evs=S.events;
  const cards=evs.map(ev=>{const yes=ev.rsvps.filter(r=>r.opt!=="o3"),ppl=yes.reduce((a,r)=>a+r.count,0);
    return `<div class="panel ev-card"><div class="row" style="justify-content:space-between"><span class="pill ${ev.status==="live"?"ok":"draft"}">${ev.status==="live"?"Опубликовано":"Черновик"}</span><span class="small muted">${LAY[ev.tpl].name} · ${palOf(ev).name} · ${fmtDate(ev.date).replace(/ · /g,".")}</span></div>
     <div class="t">${esc(title(ev))}</div>
     ${ev.status==="live"?`<div class="kv"><span>Ответили: <b>${ev.rsvps.length}</b></span><span>Придут: <b>${ppl}</b> чел.</span><span>Пожеланий: <b>${(ev.wishes||[]).length}</b></span></div>`:`<div class="small muted">Не опубликовано. К оплате: ${sum(due(ev).reduce((a,i)=>a+i.p,0))}</div>`}
     <div class="row">${ev.status==="live"?`<a class="btn pri sm" href="#/event/${ev.id}">Гости и ответы</a><a class="btn sm" href="#/edit/${ev.id}">Редактировать</a>`:`<a class="btn pri sm" href="#/edit/${ev.id}">Продолжить</a>`}
       <button type="button" class="btn sm ghost" data-dup="${ev.id}">Дублировать · −50%</button></div></div>`}).join("");
  return{html:header()+`<main class="gut"><div class="container page">
   <div class="page-head"><div><div class="lbl">Кабинет</div><h1 class="h2" style="font-size:1.7rem">Мои приглашения</h1></div><div class="row"><a class="btn" href="#/templates">Выбрать шаблон</a><a class="btn pri" href="#/new">Создать приглашение</a></div></div>
   ${evs.length?`<div class="ev-list">${cards}</div><p class="hint" style="margin-top:14px">«Дублировать» копирует имена, семьи, места и контакты в новое приглашение — например, с никоха на той или келин салом. Шаблон для следующего события стоит 125 000 сум.</p>`:`<div class="panel empty stack" style="justify-items:center"><div class="h3">Здесь появятся ваши приглашения</div><p class="muted" style="margin:0">Создайте первое: мы заполним его примером, вы замените данные на свои.</p><div class="row" style="justify-content:center"><a class="btn" href="#/templates">Выбрать шаблон</a><a class="btn pri" href="#/new">Создать приглашение</a></div></div>`}
  </div></main>`+footer(),after(){$$("[data-dup]").forEach(b=>b.onclick=()=>{const src=getEv(b.dataset.dup);const c=JSON.parse(JSON.stringify(src));
    Object.assign(c,{id:uid(),status:"draft",created:Date.now(),paid:{base:false,photo:false,music:false,print:false},disc:true,rsvps:[],wishes:[],guests:[],slug:(src.slug||"event")+"-2",paidAt:null,paidTotal:0});
    S.events.unshift(c);save();toast("Копия создана. Шаблон со скидкой 50%");go("/edit/"+c.id)})}}}

/* ----- builder ----- */
const STEPS=["Шаблон","Имена и семьи","Дата и места","Текст и программа","Фото и музыка","Гости и печать"];
let prevLang="uz";
function vEdit(id,step){
  const ev=getEv(id);if(!ev)return{html:header()+`<main class="gut"><div class="container page"><p>Приглашение не найдено. <a href="#/app">В кабинет</a></p></div></main>`};
  if(!langsOf(ev).includes(prevLang))prevLang=langsOf(ev)[0];
  const L=langsOf(ev),LN={uz:"узб.",ru:"рус."};
  const per=(path,label,ta)=>L.map(l=>`<label class="f"><span>${label}${L.length>1?` (${LN[l]})`:""}</span>${ta?`<textarea data-k="${path}.${l}">${esc(getPath(ev,path+"."+l)||"")}</textarea>`:`<input type="text" data-k="${path}.${l}" value="${esc(getPath(ev,path+"."+l)||"")}">`}</label>`).join("");
  const sub=(key,label,hint)=>{const x=ev.extra[key];return `<div class="sub-box"><label class="check"><input type="checkbox" data-on="${key}" ${x.on?"checked":""}><span><b>${label}</b><br><span class="muted">${hint}</span></span></label>
    <div class="grid3" ${x.on?"":"hidden"}><label class="f"><span>Дата</span><input type="date" data-k="extra.${key}.date" value="${esc(x.date)}"></label><label class="f"><span>Время</span><input type="time" data-k="extra.${key}.time" value="${esc(x.time)}"></label><label class="f"><span>Место</span><input type="text" data-k="extra.${key}.place" value="${esc(x.place)}"></label></div></div>`};
  const bodies=[
   ()=>`<div class="f"><span>Событие</span><div class="seg" data-seg="kind">${[["wedding","Свадьба"],["beshik","Бешик-той"],["birthday","День рождения"]].map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${ev.kind===v}">${l}</button>`).join("")}</div></div>
     <div class="f"><span>Макет</span><div class="tpl-pick">${LAY_ORDER.map(tp=>{const pal=tp===ev.tpl?ev.pal:LAY[tp].pals[0].id;return `<button type="button" class="tpl-opt" data-tpl="${tp}" aria-pressed="${ev.tpl===tp}"><div class="mini">${miniHTML(Object.assign({},ev,{tpl:tp,pal}),L[0])}</div><div class="cap">${LAY[tp].name}</div></button>`}).join("")}</div>
       <p class="hint">Смена шаблона не стирает введённые данные.</p></div>
     <div class="f"><span>Цвет</span><div class="pal-pick">${LAY[ev.tpl].pals.map(p=>`<button type="button" class="pal-btn" data-pal="${p.id}" aria-pressed="${ev.pal===p.id}"><span class="swatch-row"><i style="background:${p.v.paper}"></i><i style="background:${p.v.accent}"></i><i style="background:${p.v.gold}"></i></span>${p.name}</button>`).join("")}</div></div>
     <div class="f"><span>Шрифт</span><div class="font-pick">${fontChoices(ev).map(fid=>{loadFont(fid);const f=FONTS[fid];return `<button type="button" class="font-card" data-font="${fid}" aria-pressed="${fontOf(ev).id===fid}" style="font-family:'${f.d}',serif">${esc(f.lat?latin(ev):title(ev))}<small>${f.n}${LAY[ev.tpl].fonts.includes(fid)?" · для этого шаблона":""}${f.lat?" · только латиница":""}</small></button>`}).join("")}</div>
       <button type="button" class="linkbtn" id="moreFonts" style="justify-self:start">${S.allFonts?"Показать только подходящие":"Показать все шрифты"}</button></div>
     <div class="f"><span>Язык приглашения</span><div class="seg" data-seg="langs">${[["uz","Узбекский"],["ru","Русский"],["both","Оба, гость выбирает"]].map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${ev.langs===v}">${l}</button>`).join("")}</div></div>`,
   ()=>`<div class="grid2"><label class="f"><span>${ev.kind==="wedding"?"Имя жениха":ev.kind==="beshik"?"Имя малыша":"Имя именинника"}</span><input type="text" data-k="g" value="${esc(ev.g)}" maxlength="24"></label>
      ${ev.kind==="wedding"?`<label class="f"><span>Имя невесты</span><input type="text" data-k="b" value="${esc(ev.b)}" maxlength="24"></label>`:"<div></div>"}</div>
     ${ev.kind==="wedding"?`<div class="grid2"><label class="f"><span>Родители жениха</span><input type="text" data-k="famG" value="${esc(ev.famG)}" placeholder="Фамилия Имя отца и матери"></label><label class="f"><span>Родители невесты</span><input type="text" data-k="famB" value="${esc(ev.famB)}"></label></div>`
      :`<label class="f"><span>Родители</span><input type="text" data-k="famG" value="${esc(ev.famG)}"></label>`}
     <p class="hint">Пишите так, как должно стоять в приглашении. Родителей можно не указывать — блок тогда не появится.</p>`,
   ()=>`<div class="grid2"><label class="f"><span>Дата ${ev.kind==="wedding"?"тоя":"праздника"}</span><input type="date" data-k="date" value="${esc(ev.date)}"></label><label class="f"><span>Начало</span><input type="time" data-k="time" value="${esc(ev.time)}"></label></div>
     <label class="f"><span>Тойхона и зал</span><input type="text" data-k="venue" value="${esc(ev.venue)}"></label>
     <label class="f"><span>Адрес</span><input type="text" data-k="addr" value="${esc(ev.addr)}"></label>
     <label class="f"><span>Ссылка на карту (необязательно)</span><input type="text" data-k="map" value="${esc(ev.map)}" placeholder="Вставьте ссылку из Яндекс Карт или Google Maps"></label>
     ${sub("osh","Нахорги ош","Утренний плов — отдельной карточкой в приглашении")}
     ${ev.kind==="wedding"?sub("nikoh","Никох","Церемония никоха: мечеть, дом или ЗАГС"):""}`,
   ()=>`<div class="row"><span class="small muted">Готовый текст под событие:</span><button type="button" class="btn sm" id="preset">Вставить шаблонный текст</button></div>
     ${per("text","Текст приглашения",true)}${per("sign","Подпись",false)}
     <div class="f"><span>Программа</span><div class="stack" style="gap:10px">${ev.program.map((r,i)=>`<div class="prog-row"><input type="time" class="inp" data-k="program.${i}.time" value="${esc(r.time)}" aria-label="Время"><div class="both">${L.map(l=>`<input type="text" class="inp" data-k="program.${i}.${l}" value="${esc(r[l]||"")}" placeholder="${l==="uz"?"O’zbekcha":"По-русски"}">`).join("")}</div><button type="button" class="x" data-del="${i}" aria-label="Удалить пункт">×</button></div>`).join("")}</div>
       <div><button type="button" class="btn sm" id="addProg">Добавить пункт</button></div></div>
     ${per("dress","Дресс-код (необязательно)",false)}
     <div class="f"><span>Цвета дресс-кода</span><div class="colors-edit">${ev.dressColors.map((c,i)=>`<input type="color" value="${esc(c)}" data-col="${i}" aria-label="Цвет ${i+1}">`).join("")}${ev.dressColors.length<6?`<button type="button" class="btn sm" id="addCol">+</button>`:""}${ev.dressColors.length?`<button type="button" class="btn sm ghost" id="delCol">Убрать последний</button>`:""}</div></div>`,
   ()=>`<div class="paid-box"><div class="top"><div><b>Свои фото</b><div class="small muted">Первое фото — на обложке, остальные — в альбоме. До 6 фото.</div></div><span class="price-tag">+100 000 сум</span></div>
       <div class="album-edit">${ev.photos.map((p,i)=>`<div class="ph"><img src="${p}" alt="Фото ${i+1}">${i===0?`<span class="main">обложка</span>`:""}<button type="button" data-pdel="${i}" aria-label="Удалить фото">×</button></div>`).join("")}
         ${ev.photos.length<6?`<label class="btn sm" for="photoIn">${ev.photos.length?"Добавить фото":"Загрузить фото"}</label><input type="file" id="photoIn" accept="image/*" multiple hidden>`:""}</div>
       ${ev.paid.photo?`<span class="pill ok">Оплачено</span>`:""}</div>
     <div class="paid-box"><div class="top"><div><b>Музыка</b><div class="small muted">Включается, когда гость открывает конверт</div></div><span class="price-tag">+50 000 сум</span></div>
       <div class="radio-list">
        <label><input type="radio" name="mus" value="none" ${ev.music==="none"?"checked":""}>Без музыки</label>
        <div class="lbl" style="margin-top:6px">Подобрано к шаблону «${LAY[ev.tpl].name}»</div>
        ${LAY[ev.tpl].music.map(trackRow(ev)).join("")}
        <details ${LAY[ev.tpl].music.includes(ev.music)||ev.music==="none"||ev.music==="own"?"":"open"}><summary class="small" style="cursor:pointer;padding:6px 0">Вся библиотека · ${Object.keys(MUSIC).length} треков</summary><div class="radio-list" style="margin-top:6px">${Object.keys(MUSIC).filter(m=>!LAY[ev.tpl].music.includes(m)).map(trackRow(ev)).join("")}</div></details>
        <label><input type="radio" name="mus" value="own" ${ev.music==="own"?"checked":""}><span><b>Своя мелодия</b> <span class="small muted">· mp3 или m4a до 10 МБ</span></span></label></div>
       <div id="ownBox" ${ev.music==="own"?"":"hidden"} class="stack" style="gap:10px">
        <div class="row"><label class="btn sm" for="audIn">${MEM.audio.name?"Заменить файл":"Выбрать файл"}</label><input type="file" id="audIn" accept="audio/*" hidden><span class="small">${esc(MEM.audio.name||ev.ownName||"Файл не выбран")}</span></div>
        <label class="check"><input type="checkbox" id="agree" ${ev.musicAgree?"checked":""}><span>Я подтверждаю, что у меня есть право использовать эту мелодию, и принимаю ответственность за претензии правообладателей.</span></label></div>
       ${ev.paid.music?`<span class="pill ok">Оплачено</span>`:""}</div>`,
   ()=>`<label class="f"><span>Адрес ссылки</span><div class="row" style="flex-wrap:nowrap;gap:0"><span style="border:1px solid var(--line);border-right:0;border-radius:10px 0 0 10px;padding:10px;background:var(--soft);font-size:14px;white-space:nowrap">taklifnoma.uz/</span><input type="text" data-k="slug" value="${esc(ev.slug)}" style="border-radius:0 10px 10px 0"></div></label>
     <label class="f"><span>Ответить до</span><input type="date" data-k="rsvpBy" value="${esc(ev.rsvpBy)}"></label>
     <div class="f"><span>Контакты организаторов</span>${ev.contacts.map((c,i)=>`<div class="grid2" style="margin-bottom:8px"><input type="text" class="inp" data-k="contacts.${i}.name" value="${esc(c.name)}" placeholder="Имя"><input type="tel" class="inp" data-k="contacts.${i}.phone" value="${esc(c.phone)}" placeholder="+998 ..."></div>`).join("")}</div>
     <label class="check"><input type="checkbox" id="optWish" ${ev.opts.wishes!==false?"checked":""}><span><b>Книга пожеланий</b> · бесплатно<br><span class="muted">Гости оставляют пожелания прямо в приглашении, вам приходят уведомления в бот.</span></span></label>
     <div class="sub-box"><label class="check"><input type="checkbox" id="optGift" ${ev.gift.on?"checked":""}><span><b>Подарок (тоёна) на карту</b> · необязательно<br><span class="muted">Номер карты с кнопкой «скопировать». Включайте, только если это уместно для вашей семьи.</span></span></label>
       <div class="grid2" ${ev.gift.on?"":"hidden"}><input type="text" class="inp" data-k="gift.holder" value="${esc(ev.gift.holder)}" placeholder="Получатель, например «Jasur K.»"><input type="text" class="inp" data-k="gift.card" value="${esc(ev.gift.card)}" placeholder="8600 0000 0000 0000" inputmode="numeric"></div></div>
     <div class="paid-box"><div class="top"><div><b>Печатная версия</b><div class="small muted">Открытка A6 в этом же стиле с QR-кодом на приглашение. PDF для любой типографии.</div></div><span class="price-tag">+100 000 сум</span></div>
       <label class="check"><input type="checkbox" id="optPrint" ${ev.opts.print?"checked":""}><span>Добавить выгрузку для печати</span></label>
       ${ev.paid.print?`<span class="pill ok">Оплачено</span>`:""}</div>`
  ];
  const tot=due(ev).reduce((a,i)=>a+i.p,0);
  const last=step===STEPS.length-1;
  return{html:header()+`<main class="gut"><div class="container page">
   <div class="page-head"><div>${back("#/app","Мои приглашения")}<h1 class="h2" style="font-size:1.6rem;margin-top:4px">${esc(title(ev))}</h1></div>
     <button type="button" class="btn mob-prev-btn" id="mobPrev">${ICON.eye} Предпросмотр</button></div>
   <div class="builder"><div>
     <nav class="stepper" aria-label="Шаги">${STEPS.map((s,i)=>`<button type="button" data-step="${i}" ${i===step?'aria-current="step"':""} class="${i<step?"done":""}">${i+1}. ${s}</button>`).join("")}</nav>
     <div class="panel form" id="form">${bodies[step]()}
       <div class="fam-link"><span><b>Ссылка для семьи</b> — бесплатно. Приглашение с пометкой «черновик», чтобы согласовать с родителями.</span><button type="button" class="btn sm" id="famLink">Скопировать</button></div>
       <div class="form-nav"><div class="total-bar" style="flex:1"><span class="muted">${ev.status==="live"?(tot?"Доплата за новые опции":"Изменения сохраняются автоматически"):"Итого к оплате"}</span>${tot||ev.status!=="live"?`<b id="totNow">${sum(tot)}</b>`:""}</div>
        <div class="row">${step>0?`<button type="button" class="btn" data-step="${step-1}">Назад</button>`:""}
        ${last?(ev.status==="live"&&!tot?`<a class="btn pri" href="#/event/${ev.id}">Готово</a>`:`<a class="btn pri" href="#/checkout/${ev.id}" id="toPay">К оплате</a>`):`<button type="button" class="btn pri" data-step="${step+1}">Далее</button>`}</div></div>
     </div></div>
     <aside class="preview-col"><div class="prev-bar"><span class="lbl">Так увидит гость</span>${L.length>1?`<div class="seg" data-prevlang>${L.map(l=>`<button type="button" data-v="${l}" aria-pressed="${prevLang===l}">${l.toUpperCase()}</button>`).join("")}</div>`:""}</div>
       <div class="phone"><div class="scr" id="prev">${inviteHTML(ev,prevLang,"prev")}</div></div></aside>
   </div></div></main>`,after(){
    const refresh=()=>{save();const p=$("#prev");if(p){const st=p.scrollTop;p.innerHTML=inviteHTML(ev,prevLang,"prev");p.scrollTop=st;bindInvite(ev,true,false,"prev")}const tn=$("#totNow");if(tn)tn.textContent=sum(due(ev).reduce((a,i)=>a+i.p,0));tickAll()};
    let tmr;const deb=()=>{clearTimeout(tmr);tmr=setTimeout(refresh,180)};
    $$("[data-k]").forEach(inp=>inp.addEventListener("input",()=>{let v=inp.value;if(inp.dataset.k==="slug"){v=v.toLowerCase().replace(/[^a-z0-9-]/g,"-").replace(/-+/g,"-");if(v!==inp.value)inp.value=v}setPath(ev,inp.dataset.k,v);deb()}));
    $$("[data-step]").forEach(b=>b.onclick=()=>go(`/edit/${ev.id}/${b.dataset.step}`));
    $$("[data-seg]").forEach(sg=>$$("button",sg).forEach(b=>b.onclick=()=>{const k=sg.dataset.seg;ev[k]=b.dataset.v;if(k==="kind"){ev.text={uz:PRESET[ev.kind].uz,ru:PRESET[ev.kind].ru};if(ev.kind!=="wedding")ev.b="";else if(!ev.b)ev.b="Madina"}save();render()}));
    $$("[data-prevlang] button").forEach(b=>b.onclick=()=>{prevLang=b.dataset.v;$$("[data-prevlang] button").forEach(x=>x.setAttribute("aria-pressed",x===b));refresh()});
    $$(".tpl-opt").forEach(b=>b.onclick=()=>{if(ev.tpl!==b.dataset.tpl){const old=LAY[ev.tpl];ev.tpl=b.dataset.tpl;ev.pal=LAY[ev.tpl].pals[0].id;ev.font=LAY[ev.tpl].fonts[0];if(!ev.music||old.music.includes(ev.music))ev.music=LAY[ev.tpl].music[0]}save();render()});
    $$("[data-font]").forEach(b=>b.onclick=()=>{ev.font=b.dataset.font;save();render()});
    const mf=$("#moreFonts");if(mf)mf.onclick=()=>{S.allFonts=!S.allFonts;save();render()};
    $$("[data-pal]").forEach(b=>b.onclick=()=>{ev.pal=b.dataset.pal;save();render()});
    $$("[data-on]").forEach(c=>c.onchange=()=>{ev.extra[c.dataset.on].on=c.checked;save();render()});
    const ap=$("#addProg");if(ap)ap.onclick=()=>{ev.program.push({time:"",uz:"",ru:""});save();render()};
    $$("[data-del]").forEach(b=>b.onclick=()=>{ev.program.splice(+b.dataset.del,1);save();render()});
    const pr=$("#preset");if(pr)pr.onclick=()=>{ev.text={uz:PRESET[ev.kind].uz,ru:PRESET[ev.kind].ru};save();render()};
    $$("[data-col]").forEach(c=>c.addEventListener("input",()=>{ev.dressColors[+c.dataset.col]=c.value;deb()}));
    const ac=$("#addCol");if(ac)ac.onclick=()=>{ev.dressColors.push("#A0A0A0");save();render()};
    const dc=$("#delCol");if(dc)dc.onclick=()=>{ev.dressColors.pop();save();render()};
    const pi=$("#photoIn");if(pi)pi.onchange=async()=>{const files=[...pi.files].slice(0,6-ev.photos.length);for(const f of files){try{ev.photos.push(await shrink(f))}catch(e){toast("Не получилось открыть фото. Попробуйте JPG или PNG.")}}save();render();if(files.length)toast(`Добавлено фото: ${files.length}`)};
    $$("[data-pdel]").forEach(b=>b.onclick=()=>{ev.photos.splice(+b.dataset.pdel,1);save();render()});
    $$("input[name=mus]").forEach(r=>r.onchange=()=>{ev.music=r.value;ev.opts.music=r.value!=="none";const ob=$("#ownBox");if(ob)ob.hidden=r.value!=="own";refresh()});
    $$("[data-play]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();if(AU.cur===b.dataset.play)stopMusic();else{playMusic(b.dataset.play);b.textContent="Стоп"}});
    const ai=$("#audIn");if(ai)ai.onchange=()=>{const f=ai.files[0];if(!f)return;if(f.size>10*1024*1024){toast("Файл больше 10 МБ. Выберите другой.");return}if(MEM.audio.url)URL.revokeObjectURL(MEM.audio.url);MEM.audio={url:URL.createObjectURL(f),name:f.name};ev.ownName=f.name;save();render()};
    const ag=$("#agree");if(ag)ag.onchange=()=>{ev.musicAgree=ag.checked;save()};
    const op=$("#optPrint");if(op)op.onchange=()=>{ev.opts.print=op.checked;refresh()};
    const ow=$("#optWish");if(ow)ow.onchange=()=>{ev.opts.wishes=ow.checked;refresh()};
    const og=$("#optGift");if(og)og.onchange=()=>{ev.gift.on=og.checked;save();render()};
    $("#famLink").onclick=()=>copyText(guestLink(ev,{draft:1}),"Ссылка-черновик скопирована. Отправьте её семье");
    const tp=$("#toPay");if(tp)tp.onclick=e=>{if(ev.music==="own"&&ev.opts.music&&!ev.musicAgree){e.preventDefault();go(`/edit/${ev.id}/4`);setTimeout(()=>toast("Подтвердите права на свою мелодию или выберите трек из библиотеки"),50)}};
    const mp=$("#mobPrev");if(mp)mp.onclick=()=>{const l=$("#layer");l.innerHTML=`<div class="overlay" id="ov"><div class="sheet"><div class="sheet-h"><b>Так увидит гость</b><div class="row">${L.length>1?`<div class="seg" data-ml>${L.map(x=>`<button type="button" data-v="${x}" aria-pressed="${prevLang===x}">${x.toUpperCase()}</button>`).join("")}</div>`:""}<button type="button" class="btn sm" id="ovc">Закрыть</button></div></div><div class="sheet-b" id="ovb">${inviteHTML(ev,prevLang,"mob")}</div></div></div>`;
      const close=()=>{l.innerHTML=""};$("#ovc").onclick=close;$("#ov").onclick=e=>{if(e.target.id==="ov")close()};$$("[data-ml] button").forEach(b=>b.onclick=()=>{prevLang=b.dataset.v;$("#ovb").innerHTML=inviteHTML(ev,prevLang,"mob");$$("[data-ml] button").forEach(x=>x.setAttribute("aria-pressed",x===b));bindInvite(ev,true,false,"mob");tickAll()});bindInvite(ev,true,false,"mob");tickAll()};
    bindInvite(ev,true,false,"prev");
  }}}
function trackRow(ev){return m=>`<label><input type="radio" name="mus" value="${m}" ${ev.music===m?"checked":""}><span><b>${esc(MUSIC[m].n)}</b><br><span class="small muted">${esc(MUSIC[m].d)}</span></span><button type="button" class="btn sm play" data-play="${m}">Слушать</button></label>`}
function fontChoices(ev){const own=LAY[ev.tpl].fonts;return S.allFonts?own.concat(Object.keys(FONTS).filter(f=>!own.includes(f))):own}
function latin(ev){return ev.kind==="wedding"?`${ev.g||"Jasur"} & ${ev.b||"Madina"}`:(ev.g||"Jasur")}
function shrink(f){return new Promise((res,rej)=>{const rd=new FileReader();rd.onerror=rej;rd.onload=()=>{const im=new Image();im.onerror=rej;im.onload=()=>{const W=720,sc=Math.min(1,W/im.width),c=document.createElement("canvas");c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.75))};im.src=rd.result};rd.readAsDataURL(f)})}

/* ----- checkout & payment ----- */
function vCheckout(id){const ev=getEv(id);if(!ev)return vDash();
  const it=items(ev),tot=due(ev).reduce((a,i)=>a+i.p,0);
  if(!tot){location.replace("#/done/"+ev.id);return{html:""}}
  return{html:header()+`<main class="gut"><div class="container page narrow">
   ${back(`#/edit/${ev.id}/5`,"Вернуться к редактированию")}
   <h1 class="h2" style="font-size:1.6rem;margin:6px 0 16px">Оплата</h1>
   <div class="panel pad"><div class="h3" style="margin-bottom:4px">${esc(title(ev))}</div><div class="small muted">${LAY[ev.tpl].name} · ${palOf(ev).name} · ${fmtDate(ev.date)} · ${esc(prettyLink(ev))}</div>
    <div class="lines" style="margin-top:12px">${it.map(i=>`<div class="${ev.paid[i.k]?"paid":""}"><span>${i.l}${ev.paid[i.k]?" (оплачено)":""}</span><span>${sum(i.p)}</span></div>`).join("")}<div class="tot"><span>К оплате</span><span>${sum(tot)}</span></div></div>
    <button type="button" class="btn pri wide" id="goPay" style="margin-top:8px">Оплатить ${sum(tot)} через Rahmat</button>
    <p class="small muted" style="margin:10px 0 0">После оплаты приглашение сразу публикуется. Текст, дату, места и шаблон можно менять бесплатно и после публикации.</p></div>
  </div></main>`+footer(),after(){$("#goPay").onclick=()=>go("/pay/"+ev.id)}}}

let payState={step:"card",code:null};
function vPay(id){const ev=getEv(id);if(!ev)return vDash();const tot=due(ev).reduce((a,i)=>a+i.p,0);
  if(!tot){location.replace("#/done/"+ev.id);return{html:""}}
  if(payState.id!==id)payState={id,step:"card",code:null};
  const top=`<div class="pay-top"><div><b>Оплата заказа</b><br><small>Получатель: Taklifnoma · через Rahmat</small></div><div style="text-align:right"><b style="font-variant-numeric:tabular-nums">${sum(tot)}</b><br><small>Заказ № ${ev.id.toUpperCase()}</small></div></div>`;
  let body="";
  if(payState.step==="card")body=`<div class="test-note">Тестовая оплата. Карты ненастоящие, деньги не списываются.</div>
    <div class="lbl">Выберите карту</div><div class="cards">
     <label><input type="radio" name="card" value="uz" checked><span class="chip" style="background:linear-gradient(135deg,#2F6FB3,#1C3F6E)"></span><span><b>UZCARD •••• 4021</b><br><span class="small muted">Тестовая карта</span></span></label>
     <label><input type="radio" name="card" value="hu"><span class="chip" style="background:linear-gradient(135deg,#3BA06A,#1F5E3D)"></span><span><b>HUMO •••• 7735</b><br><span class="small muted">Тестовая карта</span></span></label></div>
    <button type="button" class="btn pri wide" id="payGo" style="background:#22252B;border-color:#22252B">Оплатить ${sum(tot)}</button>
    <button type="button" class="btn ghost wide" id="payCancel">Отменить и вернуться</button>`;
  if(payState.step==="sms")body=`<div><b>Подтвердите оплату</b><p class="small muted" style="margin:4px 0 0">Мы отправили SMS с кодом на номер +998 90 *** ** 67</p></div>
    <div class="code-in" id="smsIn" style="margin:4px 0">${[0,1,2,3,4,5].map(i=>`<input id="s${i}" inputmode="numeric" maxlength="1" aria-label="Цифра ${i+1}" autocomplete="one-time-code">`).join("")}</div>
    <div class="err" id="serr" aria-live="polite"></div>
    <button type="button" class="btn pri wide" id="smsGo" style="background:#22252B;border-color:#22252B">Подтвердить</button>
    <button type="button" class="btn ghost wide" id="smsBack">Выбрать другую карту</button>`;
  if(payState.step==="proc")body=`<div style="text-align:center"><div class="spinner"></div><b>Проводим платёж…</b><p class="small muted">Не закрывайте страницу</p></div>`;
  return{html:`<main class="gut" style="padding-block:20px"><div class="pay-shell">${top}<div class="pay-b">${body}</div></div><p class="small muted" style="text-align:center">Страница платёжного провайдера (имитация для демо)</p></main>`,after(){
    if(payState.step==="card"){$("#payGo").onclick=()=>{payState.step="sms";payState.code=String(Math.floor(100000+Math.random()*900000));render();showSms(payState.code)};$("#payCancel").onclick=()=>go("/checkout/"+ev.id)}
    if(payState.step==="sms"){const ins=$$("#smsIn input");ins[0].focus();codeInputs(ins,check);$("#smsGo").onclick=check;$("#smsBack").onclick=()=>{payState.step="card";render()};
      function check(){const v=ins.map(x=>x.value).join("");if(v.length<6){$("#serr").textContent="Введите все 6 цифр из SMS.";return}
        if(v!==payState.code){$("#serr").textContent="Неверный код. Проверьте SMS и попробуйте снова.";ins.forEach(x=>x.value="");ins[0].focus();return}
        payState.step="proc";render();
        setTimeout(()=>{due(ev).forEach(i=>ev.paid[i.k]=true);const first=ev.status!=="live";ev.status="live";ev.paidAt=Date.now();ev.paidTotal=(ev.paidTotal||0)+tot;save();payState={step:"card"};
          botSay(`Оплата ${sum(tot)} получена.\n${first?"Приглашение «"+title(ev)+"» опубликовано. Отправляйте ссылку гостям.":"Новые опции подключены."}`);
          go("/done/"+ev.id)},1600)}}
  }}}
function showSms(code){const l=$("#layer");const el=document.createElement("div");el.className="sms";el.setAttribute("role","status");el.innerHTML=`<b>Сообщения · сейчас</b>Код подтверждения оплаты: <span style="font-weight:700;letter-spacing:.12em;font-variant-numeric:tabular-nums">${code}</span>. Никому не сообщайте.`;l.appendChild(el);setTimeout(()=>el.remove(),9000)}

/* ----- done ----- */
function vDone(id){const ev=getEv(id);if(!ev)return vDash();const link=guestLink(ev);
  return{html:header()+`<main class="gut"><div class="container page narrow">
   <div class="panel done-hero"><div class="check-big">${ICON.check}</div><h1 class="h2" style="font-size:1.6rem">Приглашение опубликовано</h1>
    <p class="muted" style="margin:0">Отправьте ссылку гостям в Telegram. Ответы и пожелания будут приходить вам в бот.</p>
    <div class="small"><b>${esc(prettyLink(ev))}</b> <span class="muted">— так будет выглядеть ссылка в продукте</span></div>
    <div class="linkbox"><input type="text" id="lnk" value="${esc(link)}" readonly aria-label="Ссылка на приглашение"><button type="button" class="btn" id="cp">Копировать</button></div>
    <p class="small muted" style="margin:0;max-width:30em">В демо ссылка длинная: данные приглашения зашиты прямо в неё, чтобы её можно было открыть на любом телефоне.</p>
    <div class="row" style="justify-content:center"><a class="btn pri" href="https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(title(ev)+" — taklifnoma")}" target="_blank" rel="noopener">${ICON.tg} Отправить в Telegram</a><a class="btn" href="#/g/${enc(pubData(ev))}">${ICON.eye} Открыть как гость</a></div>
    <div class="qr-box">${qrSvg(link)}</div><div class="small muted">QR-код на приглашение</div>
    <div class="row" style="justify-content:center"><a class="btn" href="#/event/${ev.id}">Гости и ответы</a><a class="btn" href="#/event/${ev.id}/links">Личные ссылки гостям</a>${ev.paid.print?`<a class="btn" href="#/print/${ev.id}">Печатная версия</a>`:""}</div>
   </div></div></main>`+footer(),after(){$("#cp").onclick=()=>copyText($("#lnk").value,"Ссылка скопирована")}}}

/* ----- organizer event page ----- */
let filt="all";
const SAMPLE=["Aziz Karimov","Dilnoza Yusupova","Bekzod Tursunov","Malika Rahimova","Sardor Aliyev","Gulnora Xasanova","Otabek Nazarov","Shahnoza Ergasheva","Jamshid Qodirov","Feruza Mirzayeva","Ulug’bek Sobirov","Nigora Abdullayeva"];
const WISH_S=["Baxtli bo’linglar! Oilangiz mustahkam bo’lsin.","Поздравляем! Любви, терпения и уюта.","Bir umr birga bo’linglar!","Счастья молодым и здоровья родителям!"];
const ANS={o1:"Придёт",o2:"Придёт с семьёй",o3:"Не придёт"};
function vEvent(id){const ev=getEv(id);if(!ev)return vDash();const tab=parseRoute()[2]||"answers";
  const rs=ev.rsvps,no=rs.filter(r=>r.opt==="o3"),ppl=rs.filter(r=>r.opt!=="o3").reduce((a,r)=>a+r.count,0);
  const list=rs.filter(r=>filt==="all"||(filt==="yes"?r.opt!=="o3":r.opt==="o3")).slice().reverse();
  let body="";
  if(tab==="answers")body=`<div class="filters"><div class="seg" id="flt">${[["all","Все"],["yes","Придут"],["no","Не придут"]].map(([v,l])=>`<button type="button" data-v="${v}" aria-pressed="${filt===v}">${l}</button>`).join("")}</div></div>
     ${list.length?`<div class="tbl-wrap"><table><thead><tr><th>Гость</th><th>Ответ</th><th>Чел.</th><th>Комментарий</th><th>Когда</th></tr></thead><tbody>${list.map(r=>`<tr><td>${esc(r.name)}${r.personal?` <span class="pill draft" title="Ответ по личной ссылке">личная</span>`:""}</td><td><span class="pill ${r.opt==="o3"?"no":"ok"}">${ANS[r.opt]}</span></td><td class="num">${r.opt==="o3"?"—":r.count}</td><td>${esc(r.comment||"")}</td><td class="num small muted">${new Date(r.ts).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</td></tr>`).join("")}</tbody></table></div>`
      :`<div class="empty"><div class="h3">Ответов пока нет</div><p class="muted">Откройте приглашение как гость и ответьте, или добавьте тестовые ответы.</p></div>`}`;
  if(tab==="links")body=`<div class="pad stack" style="gap:12px"><p class="muted" style="margin:0">Личная ссылка обращается к гостю по имени: «Hurmatli Aziz aka!». Имя сразу подставится в ответ.</p>
     <form id="addG" class="row" style="flex-wrap:nowrap"><input type="text" class="inp" id="gName" placeholder="Например, Aziz aka" aria-label="Имя гостя"><button type="submit" class="btn pri">Добавить</button></form>
     ${(ev.guests||[]).length?`<div class="tbl-wrap"><table><thead><tr><th>Гость</th><th>Ответил</th><th></th></tr></thead><tbody>${ev.guests.map((g,i)=>{const ans=rs.find(r=>r.name.toLowerCase()===g.name.toLowerCase());const ln=guestLink(ev,{to:g.name});return `<tr><td>${esc(g.name)}</td><td>${ans?`<span class="pill ${ans.opt==="o3"?"no":"ok"}">${ANS[ans.opt]}</span>`:`<span class="pill wait">Ждём</span>`}</td><td><div class="row" style="gap:6px;justify-content:flex-end"><button type="button" class="btn sm" data-cpl="${i}">Ссылка</button><a class="btn sm" href="https://t.me/share/url?url=${encodeURIComponent(ln)}" target="_blank" rel="noopener">${ICON.tg}</a><a class="btn sm ghost" href="#/g/${enc(pubData(ev,{to:g.name}))}">${ICON.eye}</a><button type="button" class="x" data-gdel="${i}" aria-label="Удалить">×</button></div></td></tr>`}).join("")}</tbody></table></div>`:`<div class="empty" style="padding:20px"><p class="muted" style="margin:0">Добавьте первых гостей — каждому будет своя ссылка.</p></div>`}</div>`;
  if(tab==="wishes")body=(ev.wishes||[]).length?ev.wishes.slice().reverse().map(w=>`<div class="wish"><b>${esc(w.name)}</b> <span class="small muted">${new Date(w.ts).toLocaleString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</span><p style="margin:4px 0 0">${esc(w.text)}</p></div>`).join(""):`<div class="empty"><div class="h3">Пожеланий пока нет</div><p class="muted">Они появятся, когда гости оставят их в приглашении.</p></div>`;
  return{html:header()+`<main class="gut"><div class="container page">
   <div class="page-head"><div>${back("#/app","Мои приглашения")}<h1 class="h2" style="font-size:1.7rem;margin-top:4px">${esc(title(ev))}</h1><div class="small muted">${fmtDate(ev.date)} · ${esc(ev.time)} · ${esc(ev.venue)}</div></div>
    <div class="row"><a class="btn" href="#/edit/${ev.id}">Редактировать</a><a class="btn" href="#/done/${ev.id}">Ссылка и QR</a></div></div>
   <div class="stats"><div class="panel stat"><span class="lbl">Ответили</span><b>${rs.length}</b></div><div class="panel stat ok"><span class="lbl">Придут, человек</span><b>${ppl}</b></div><div class="panel stat"><span class="lbl">Пожеланий</span><b>${(ev.wishes||[]).length}</b></div><div class="panel stat no"><span class="lbl">Не придут</span><b>${no.length}</b></div></div>
   <div class="ev-grid"><div class="panel">
     <div class="tabs" role="tablist">${[["answers","Ответы"],["links","Личные ссылки"],["wishes","Пожелания"]].map(([v,l])=>`<button type="button" role="tab" aria-selected="${tab===v}" data-tab="${v}">${l}</button>`).join("")}</div>
     ${body}</div>
   <div class="stack">
     <div class="panel pad" style="display:grid;gap:10px"><div class="h3">Список гостей</div>
       <button type="button" class="btn pri" id="toBot">${ICON.tg} Отправить Excel в бот</button>
       <button type="button" class="btn" id="dlX">Скачать Excel</button></div>
     <div class="panel pad" style="display:grid;gap:10px"><div class="h3">Проверить сценарий гостя</div>
       <a class="btn" href="#/g/${enc(pubData(ev))}">${ICON.eye} Открыть как гость</a>
       <button type="button" class="btn" id="fake">Добавить 5 тестовых ответов</button>
       <p class="small muted" style="margin:0">Каждый ответ и пожелание гостя приходят уведомлением в бот.</p></div>
     <div class="panel pad" style="display:grid;gap:10px"><div class="h3">Печать</div>
       ${ev.paid.print?`<a class="btn" href="#/print/${ev.id}">Открыть PDF-макет A6</a>`:`<p class="small muted" style="margin:0">Открытка A6 в стиле приглашения с QR-кодом. 100 000 сум.</p><button type="button" class="btn" id="addPrint">Добавить печатную версию</button>`}</div>
   </div></div>
  </div></main>`+footer(),after(){
    $$("[data-tab]").forEach(b=>b.onclick=()=>go(`/event/${ev.id}/${b.dataset.tab}`));
    $$("#flt button").forEach(b=>b.onclick=()=>{filt=b.dataset.v;render()});
    $("#dlX").onclick=()=>downloadXlsx(ev);
    $("#toBot").onclick=()=>{botSay(`Список гостей на ${new Date().toLocaleDateString("ru-RU")}: ответили ${rs.length}, придут ${ppl} чел.`,{file:fileName(ev),kb:[{l:"Скачать файл",a:"xlsx",arg:ev.id}]});openBot()};
    $("#fake").onclick=()=>{for(let i=0;i<5;i++){const n=SAMPLE[Math.floor(Math.random()*SAMPLE.length)],x=Math.random(),opt=x<.55?"o1":x<.85?"o2":"o3";addRsvp(ev,{name:n,opt,count:opt==="o1"?1+Math.floor(Math.random()*2):opt==="o2"?2+Math.floor(Math.random()*4):0,comment:Math.random()<.25?"Tabriklaymiz!":""});if(Math.random()<.4)addWish(ev,{name:n.split(" ")[0],text:WISH_S[Math.floor(Math.random()*WISH_S.length)]})}save();render();toast("Добавлено 5 ответов. Уведомления пришли в бот")};
    const apn=$("#addPrint");if(apn)apn.onclick=()=>{ev.opts.print=true;save();go("/checkout/"+ev.id)};
    const ag=$("#addG");if(ag)ag.onsubmit=e=>{e.preventDefault();const n=$("#gName").value.trim();if(!n){$("#gName").focus();return}ev.guests=ev.guests||[];ev.guests.push({name:n,ts:Date.now()});save();render();setTimeout(()=>{const i=$("#gName");if(i)i.focus()},0)};
    $$("[data-cpl]").forEach(b=>b.onclick=()=>copyText(guestLink(ev,{to:ev.guests[+b.dataset.cpl].name}),"Личная ссылка скопирована"));
    $$("[data-gdel]").forEach(b=>b.onclick=()=>{ev.guests.splice(+b.dataset.gdel,1);save();render()});
  }}}
function fileName(ev){return `Mehmonlar_${(ev.slug||ev.id)}.xlsx`}
function downloadXlsx(ev){const rows=ev.rsvps.map((r,i)=>({"№":i+1,"Гость":r.name,"Ответ":ANS[r.opt],"Человек":r.opt==="o3"?0:r.count,"Комментарий":r.comment||"","Дата ответа":new Date(r.ts).toLocaleString("ru-RU")}));
  try{const wb=XLSX.utils.book_new();const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{"№":"","Гость":"Ответов пока нет"}]);ws["!cols"]=[{wch:4},{wch:26},{wch:18},{wch:9},{wch:30},{wch:20}];XLSX.utils.book_append_sheet(wb,ws,"Гости");
    if((ev.wishes||[]).length){const w2=XLSX.utils.json_to_sheet(ev.wishes.map(w=>({"Имя":w.name,"Пожелание":w.text,"Дата":new Date(w.ts).toLocaleString("ru-RU")})));w2["!cols"]=[{wch:20},{wch:60},{wch:20}];XLSX.utils.book_append_sheet(wb,w2,"Пожелания")}
    XLSX.writeFile(wb,fileName(ev))}
  catch(e){const csv="﻿"+["№;Гость;Ответ;Человек;Комментарий;Дата"].concat(rows.map(r=>Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";"))).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=fileName(ev).replace(".xlsx",".csv");a.click()}}
function addRsvp(ev,r){r.ts=Date.now();const ex=ev.rsvps.findIndex(x=>x.name.toLowerCase()===r.name.toLowerCase());if(ex>=0)ev.rsvps[ex]=r;else ev.rsvps.push(r);
  botSay(`Новый ответ · ${title(ev)}\n${r.name} — ${ANS[r.opt].toLowerCase()}${r.opt!=="o3"?", "+r.count+" чел.":""}${r.comment?"\n«"+r.comment+"»":""}`)}
function addWish(ev,w){w.ts=Date.now();ev.wishes=ev.wishes||[];ev.wishes.push(w);botSay(`Новое пожелание · ${title(ev)}\n${w.name}: «${w.text}»`)}

/* ----- print ----- */
function vPrint(id){const ev=getEv(id);if(!ev)return vDash();
  if(!ev.paid.print)return{html:header()+`<main class="gut"><div class="container page narrow"><div class="panel pad"><div class="h3">Печатная версия не подключена</div><p class="muted">Добавьте её за 100 000 сум.</p><button type="button" class="btn pri" id="ap">Добавить и оплатить</button></div></div></main>`,after(){$("#ap").onclick=()=>{ev.opts.print=true;save();go("/checkout/"+ev.id)}}};
  const L=langsOf(ev);let pl=L[0];
  return{html:header()+`<main class="gut"><div class="container print-page">
   <div class="page-head"><div>${back(`#/event/${ev.id}`,"Гости и ответы")}<h1 class="h2" style="font-size:1.6rem;margin-top:4px">Печатная версия</h1><div class="small muted">Открытка A6, 105×148 мм, в стиле «${LAY[ev.tpl].name} · ${palOf(ev).name}». Пунктир — безопасная зона, при печати он не виден.</div></div>
    <div class="row">${L.length>1?`<div class="seg" id="pl">${L.map(l=>`<button type="button" data-v="${l}" aria-pressed="${l===pl}">${l.toUpperCase()}</button>`).join("")}</div>`:""}<button type="button" class="btn pri" id="pdf">Сохранить PDF</button></div></div>
   <div class="a6-wrap" id="card">${printCard(ev,pl,guestLink(ev))}</div>
   <p class="small muted" style="text-align:center;margin-top:16px">В окне печати выберите «Сохранить как PDF». В продукте файл будет готовым PDF с вылетами 3 мм и метками реза.</p>
  </div></main>`,after(){$("#pdf").onclick=()=>window.print();$$("#pl button").forEach(b=>b.onclick=()=>{pl=b.dataset.v;$("#card").innerHTML=printCard(ev,pl,guestLink(ev));$$("#pl button").forEach(x=>x.setAttribute("aria-pressed",x===b))})}}}

/* ----- guest ----- */
let gLang=null;const coverShown={};
function vGuest(code){const pub=dec(code||"");
  if(!pub)return{html:`<main class="gut"><div class="panel auth"><div class="h2">Приглашение не найдено</div><p class="muted">Ссылка повреждена. Попросите организатора прислать её ещё раз.</p></div></main>`};
  const local=getEv(pub.id);const ev=local?Object.assign({},local,{to:pub.to,draft:pub.draft}):Object.assign({rsvps:[],wishes:[],photos:[]},pub);ev.opts=ev.opts||{};
  const L=langsOf(ev);const nav=(navigator.language||"").slice(0,2);if(!gLang||!L.includes(gLang))gLang=L.includes(nav)?nav:L[0];
  const P=palOf(ev);document.body.style.background=P.v.ground;
  const t=IT[gLang];const ck=pub.id+(pub.to||"")+(pub.draft||"");const showCover=!coverShown[ck];
  const hasMusic=ev.opts.music&&ev.music&&ev.music!=="none";
  return{html:`<div class="guest-bg gut" style="background:${P.v.ground};color:${P.v.ink}">
   <div class="guest-top">${S.user&&local?`<a href="#/event/${ev.id}" style="color:inherit">${ICON.back} Кабинет организатора</a>`:`<span style="opacity:.6">taklifnoma</span>`}
    ${L.length>1?`<div class="lang-sw" id="gl">${L.map(l=>`<button type="button" data-v="${l}" aria-pressed="${l===gLang}" style="color:inherit">${l.toUpperCase()}</button>`).join("")}</div>`:""}</div>
   <div class="guest-card">${inviteHTML(ev,gLang,"g")}</div></div>
   ${hasMusic?`<div class="inv" data-tpl="${ev.tpl}" style="${styleOf(ev)};position:static;overflow:visible;background:none"><button type="button" class="music" id="gm" aria-label="Музыка" ${showCover?"hidden":""}>${ICON.note}</button></div>`:""}
   ${showCover?`<div class="inv cover" data-tpl="${ev.tpl}" id="cover" style="${styleOf(ev)};background:${P.v.ground};position:fixed;overflow:hidden"><div class="env"><div class="flap top"></div><div class="flap bot"></div>${DECO[ev.tpl].seal(ev,P)}<div class="env-text"><div class="kicker">${t.envKicker}</div><div class="to">${ev.to?t.hello(esc(ev.to)):t.envTo}</div><button type="button" class="ibtn solid" id="openEnv">${t.open}</button></div></div></div>`:""}`,
   after(){
    $$("#gl button").forEach(b=>b.onclick=()=>{gLang=b.dataset.v;const pl=AU.cur;render();if(pl)playMusic(pl)});
    const oe=$("#openEnv");if(oe)oe.onclick=()=>{coverShown[ck]=1;const c=$("#cover");c.classList.add("opening");setTimeout(()=>c.remove(),matchMedia("(prefers-reduced-motion: reduce)").matches?0:1200);const gm=$("#gm");if(gm){gm.hidden=false;playMusic(ev.music)}};
    const gm=$("#gm");if(gm)gm.onclick=()=>{AU.cur?stopMusic():playMusic(ev.music)};
    bindInvite(ev,false,!!local,"g",local);
   }}}

/* forms, wishes, album and copy buttons inside any rendered invitation */
function bindInvite(ev,preview,stored,mode,target){
  if(!ev)return;
  const root=mode==="prev"?$("#prev"):mode==="mob"?$("#ovb"):mode==="demo"?$("#demoScr"):document;
  if(!root)return;
  const lang=mode==="g"?gLang:mode==="demo"?demoLang:prevLang;const t=IT[lang]||IT.uz;const tgt=target||ev;
  $$("form.gform",root).forEach(f=>{f.onsubmit=e=>{e.preventDefault();
    const name=$("input[type=text]",f).value.trim(),opt=(f.querySelector("input[type=radio]:checked")||{}).value,err=$(".gerr",f);
    if(!name){err.textContent=t.errName;return}if(!opt){err.textContent=t.errOpt;return}
    if(preview){toast("В предпросмотре ответы не сохраняются");return}
    const r={name,opt,count:opt==="o3"?0:Math.max(1,parseInt($("input[type=number]",f).value,10)||1),comment:$("textarea",f).value.trim(),personal:!!ev.to};
    if(stored){addRsvp(tgt,r);save()}
    f.closest(".rsvp-box").innerHTML=`<div class="thanks" role="status"><b>${t.thx}</b><p>${esc(r.name)} — ${t[r.opt]}${r.opt!=="o3"?" · "+r.count:""}</p><p class="imuted">${r.opt!=="o3"?t.thxYes:t.thxNo}</p>${stored?"":`<p class="imuted" style="font-size:12px">Демо: ответ попадёт в кабинет, только если приглашение открыто на устройстве организатора.</p>`}</div>`}});
  $$("form.wform",root).forEach(f=>{f.onsubmit=e=>{e.preventDefault();const [n,tx]=[$("input",f).value.trim(),$("textarea",f).value.trim()],err=$(".gerr",f);
    if(!n){err.textContent=t.errName;return}if(!tx){err.textContent=t.errWish;return}
    if(preview){toast("В предпросмотре пожелания не сохраняются");return}
    const w={name:n,text:tx};if(stored){addWish(tgt,w);save();ev.wishes=tgt.wishes}else{ev.wishes=(ev.wishes||[]).concat([Object.assign({ts:Date.now()},w)])}
    const box=f.closest(".wish-box");box.innerHTML=wishList(ev,lang)+`<p class="imuted">${t.wishThx}</p>`}});
  $$("[data-copy]",root).forEach(b=>b.onclick=()=>copyText(b.dataset.copy,"Номер карты скопирован"));
  $$("[data-lb]",root).forEach(b=>b.onclick=()=>lightbox(ev.photos||[],+b.dataset.lb));
}
function lightbox(ph,i){const l=$("#layer");const show=()=>{l.querySelectorAll(".lightbox").forEach(x=>x.remove());const d=document.createElement("div");d.className="lightbox";d.setAttribute("role","dialog");d.innerHTML=`<img src="${ph[i]}" alt="Фото ${i+1}"><div class="lb-bar"><button type="button" data-a="p" aria-label="Предыдущее">‹</button><span>${i+1} / ${ph.length}</span><button type="button" data-a="n" aria-label="Следующее">›</button><button type="button" data-a="x">Закрыть</button></div>`;
  d.onclick=e=>{const a=e.target.dataset.a;if(a==="p"){i=(i-1+ph.length)%ph.length;show()}else if(a==="n"){i=(i+1)%ph.length;show()}else if(a==="x"||e.target===d)d.remove()};l.appendChild(d)};show()}

render();
})();
