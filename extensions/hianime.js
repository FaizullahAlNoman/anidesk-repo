// ==AniDeskExtension==
// @name         HiAnime
// @id           hianime
// @type         anime
// @lang         en
// @baseUrl      https://hianime.to
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// HiAnime uses the Zoro/Aniwatch consumet endpoint — different from gogoanime
const _ZORO=[
  'https://api.consumet.org/anime/zoro',
  'https://consumet-api.onrender.com/anime/zoro',
  'https://consumet.pages.dev/anime/zoro',
];
let _zi=0;
async function _get(path){
  for(let i=0;i<_ZORO.length;i++){
    const idx=(_zi+i)%_ZORO.length;
    try{
      const r=await $.fetch(_ZORO[idx]+path,{headers:{Accept:'application/json'}});
      if(r.status===200&&r.data){_zi=idx;return JSON.parse(r.data);}
    }catch(e){}
  }
  return null;
}
function _m(r){return new AnimeItem({id:r.id,title:r.title||r.name||'',cover:r.image||'',status:(r.status||'ongoing').toLowerCase(),genres:r.genres||[]});}
class _Src extends AnimeSource {
  constructor(){super({id:'hianime',name:'HiAnime',lang:'en',baseUrl:'https://hianime.to',icon:'⚔️',version:'2.0',description:'HiAnime - Zoro/Aniwatch, huge sub & dub library'});}
  async getPopular(p){p=p||1;const d=await _get('/top-airing?page='+p);if(d&&d.results&&d.results.length)return d.results.map(_m);return[];}
  async getLatest(p){p=p||1;const d=await _get('/recent-episodes?page='+p);if(d&&d.results&&d.results.length)return d.results.map(_m);return[];}
  async search(q,p){p=p||1;if(!q)return this.getPopular(p);const d=await _get('/'+encodeURIComponent(q)+'?page='+p);if(d&&d.results)return d.results.map(_m);return[];}
  async getDetails(id){const d=await _get('/info?id='+encodeURIComponent(id));if(d)return new AnimeItem({id,title:d.title,cover:d.image||'',description:d.description||'',status:(d.status||'ongoing').toLowerCase(),genres:d.genres||[]});return new AnimeItem({id,title:id});}
  async getEpisodes(id){
    const d=await _get('/episodes/'+encodeURIComponent(id));
    if(d&&d.episodes&&d.episodes.length)return d.episodes.map(ep=>new Episode({id:ep.id,title:ep.title||'Episode '+ep.number,number:ep.number||0}));
    // Fallback: get from info
    const info=await _get('/info?id='+encodeURIComponent(id));
    if(info&&info.episodes)return info.episodes.map(ep=>new Episode({id:ep.id,title:ep.title||'Episode '+ep.number,number:ep.number||0}));
    return[];
  }
  async getVideos(id,eid){
    const d=await _get('/watch/'+encodeURIComponent(eid));
    if(d&&d.sources&&d.sources.length){
      const l=d.sources.map(s=>new VideoLink({url:s.url,quality:s.quality||'Auto',isM3U8:!!(s.isM3U8||(s.url&&s.url.includes('.m3u8')))}));
      l.sort((a,b)=>{const sc=q=>q.includes('1080')?3:q.includes('720')?2:q.includes('480')?1:0;return sc(b.quality)-sc(a.quality);});
      return l;
    }
    return[];
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('hianime'))ExtManager.register(new _Src());
})();
