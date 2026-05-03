// ==AniDeskExtension==
// @name         AniWaves
// @id           aniwaves
// @type         anime
// @lang         en
// @baseUrl      https://aniwaves.ru
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// AniWaves — uses Consumet Zoro (different from gogoanime, more reliable)
const _APIS=['https://api.consumet.org/anime/zoro','https://consumet-api.onrender.com/anime/zoro','https://consumet.pages.dev/anime/zoro'];
let _ai=0;
async function _get(p){for(let i=0;i<_APIS.length;i++){const idx=(_ai+i)%_APIS.length;try{const r=await $.fetch(_APIS[idx]+p,{headers:{Accept:'application/json'}});if(r.status===200&&r.data){_ai=idx;return JSON.parse(r.data);}}catch(e){}}return null;}
class _Src extends AnimeSource {
  constructor(){super({id:'aniwaves',name:'AniWaves',lang:'en',baseUrl:'https://aniwaves.ru',icon:'🌊',version:'2.0',description:'AniWaves - Zoro/Aniwatch powered'});}
  async getPopular(p){const d=await _get('/top-airing?page='+(p||1));if(d&&d.results)return d.results.map(r=>new AnimeItem({id:r.id,title:r.title||r.name,cover:r.image||'',status:(r.status||'ongoing').toLowerCase()}));return[];}
  async getLatest(p){const d=await _get('/recent-episodes?page='+(p||1));if(d&&d.results)return d.results.map(r=>new AnimeItem({id:r.id,title:r.title,cover:r.image||''}));return[];}
  async search(q,p){if(!q)return this.getPopular(p);const d=await _get('/'+encodeURIComponent(q)+'?page='+(p||1));if(d&&d.results)return d.results.map(r=>new AnimeItem({id:r.id,title:r.title,cover:r.image||''}));return[];}
  async getDetails(id){const d=await _get('/info?id='+encodeURIComponent(id));if(d)return new AnimeItem({id,title:d.title,cover:d.image||'',description:d.description||'',status:(d.status||'ongoing').toLowerCase(),genres:d.genres||[]});return new AnimeItem({id,title:id});}
  async getEpisodes(id){const d=await _get('/episodes/'+encodeURIComponent(id));if(d&&d.episodes)return d.episodes.map(ep=>new Episode({id:ep.id,title:ep.title||'Episode '+ep.number,number:ep.number||0}));const info=await _get('/info?id='+encodeURIComponent(id));if(info&&info.episodes)return info.episodes.map(ep=>new Episode({id:ep.id,title:ep.title||'Episode '+ep.number,number:ep.number||0}));return[];}
  async getVideos(id,eid){const d=await _get('/watch/'+encodeURIComponent(eid));if(d&&d.sources&&d.sources.length){const l=d.sources.map(s=>new VideoLink({url:s.url,quality:s.quality||'Auto',isM3U8:!!(s.isM3U8||s.url.includes('.m3u8'))}));l.sort((a,b)=>{const sc=q=>q.includes('1080')?3:q.includes('720')?2:q.includes('480')?1:0;return sc(b.quality)-sc(a.quality);});return l;}return[];}
}
if(typeof ExtManager!=='undefined')ExtManager.register(new _Src());
})();
