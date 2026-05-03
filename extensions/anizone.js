// ==AniDeskExtension==
// @name         AniZone
// @id           anizone
// @type         anime
// @lang         en
// @baseUrl      https://anizone.to
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// AniZone — uses GogoAnime Consumet with 9anime as fallback
const _APIS=['https://api.consumet.org/anime/gogoanime','https://consumet-api.onrender.com/anime/gogoanime','https://consumet.pages.dev/anime/gogoanime'];
let _ai=0;
async function _get(p){for(let i=0;i<_APIS.length;i++){const idx=(_ai+i)%_APIS.length;try{const r=await $.fetch(_APIS[idx]+p,{headers:{Accept:'application/json'}});if(r.status===200&&r.data){_ai=idx;return JSON.parse(r.data);}}catch(e){}}return null;}
class _Src extends AnimeSource {
  constructor(){super({id:'anizone',name:'AniZone',lang:'en',baseUrl:'https://anizone.to',icon:'🏯',version:'2.0',description:'AniZone - GogoAnime powered'});}
  async getPopular(p){const d=await _get('/top-airing?page='+(p||1));if(d&&d.results)return d.results.map(r=>new AnimeItem({id:r.id,title:r.title,cover:r.image||'',status:(r.status||'ongoing').toLowerCase()}));return[];}
  async getLatest(p){const d=await _get('/recent-episodes?page='+(p||1));if(d&&d.results)return d.results.map(r=>new AnimeItem({id:r.id,title:r.title,cover:r.image||''}));return[];}
  async search(q,p){if(!q)return this.getPopular(p);const d=await _get('/'+encodeURIComponent(q)+'?page='+(p||1));if(d&&d.results)return d.results.map(r=>new AnimeItem({id:r.id,title:r.title,cover:r.image||''}));return[];}
  async getDetails(id){const d=await _get('/info/'+id);if(d)return new AnimeItem({id,title:d.title,cover:d.image||'',description:d.description||'',status:(d.status||'ongoing').toLowerCase(),genres:d.genres||[]});return new AnimeItem({id,title:id});}
  async getEpisodes(id){const d=await _get('/info/'+id);if(d&&d.episodes)return d.episodes.map(ep=>new Episode({id:ep.id,title:'Episode '+ep.number,number:ep.number||0}));return[];}
  async getVideos(id,eid){
    const d=await _get('/watch/'+encodeURIComponent(eid));
    if(d&&d.sources&&d.sources.length){
      const l=d.sources.map(s=>new VideoLink({url:s.url,quality:s.quality||'Auto',isM3U8:!!(s.isM3U8||s.url.includes('.m3u8'))}));
      l.sort((a,b)=>{const sc=q=>q.includes('1080')?3:q.includes('720')?2:q.includes('480')?1:0;return sc(b.quality)-sc(a.quality);});
      return l;
    }
    return[];
  }
}
if(typeof ExtManager!=='undefined')ExtManager.register(new _Src());
})();
