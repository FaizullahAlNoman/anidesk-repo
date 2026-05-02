// ==AniDeskExtension==
// @name         Miruro
// @id           miruro
// @type         anime
// @lang         en
// @baseUrl      https://www.miruro.to
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// Miruro uses AniList for metadata + gogoanime for streams
const _APIS=['https://api.consumet.org/anime/gogoanime','https://consumet-api.onrender.com/anime/gogoanime'];
let _ai=0;
async function _get(p){for(let i=0;i<_APIS.length;i++){const idx=(_ai+i)%_APIS.length;try{const r=await $.fetch(_APIS[idx]+p,{headers:{Accept:'application/json'}});if(r.status===200&&r.data){_ai=idx;return JSON.parse(r.data);}}catch(e){}}return null;}
async function _al(q,v){const r=await $.fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:q,variables:v||{}})});if(r.ok&&r.data){const d=JSON.parse(r.data);if(d.data)return d.data;}return null;}
class _Src extends AnimeSource {
  constructor(){super({id:'miruro',name:'Miruro',lang:'en',baseUrl:'https://www.miruro.to',icon:'🪐',version:'1.0'});}
  async getPopular(p){
    const d=await _al('query($p:Int){Page(page:$p,perPage:20){media(sort:POPULARITY_DESC,type:ANIME,status_not:NOT_YET_RELEASED){id title{romaji}coverImage{large}status genres}}}',{p:p||1});
    if(d&&d.Page)return d.Page.media.map(m=>new AnimeItem({id:String(m.id),title:m.title.romaji,cover:m.coverImage.large||'',status:(m.status||'RELEASING').toLowerCase().replace('releasing','ongoing').replace('finished','completed'),genres:m.genres||[]}));
    return[];
  }
  async getLatest(p){
    const d=await _al('query($p:Int){Page(page:$p,perPage:20){media(sort:UPDATED_AT_DESC,type:ANIME,status:RELEASING){id title{romaji}coverImage{large}status genres}}}',{p:p||1});
    if(d&&d.Page)return d.Page.media.map(m=>new AnimeItem({id:String(m.id),title:m.title.romaji,cover:m.coverImage.large||'',status:'ongoing'}));
    return[];
  }
  async search(q,p){
    if(!q)return this.getPopular(p);
    const d=await _al('query($q:String,$p:Int){Page(page:$p,perPage:20){media(search:$q,type:ANIME){id title{romaji}coverImage{large}status genres}}}',{q,p:p||1});
    if(d&&d.Page)return d.Page.media.map(m=>new AnimeItem({id:String(m.id),title:m.title.romaji,cover:m.coverImage.large||'',status:'ongoing'}));
    return[];
  }
  async getDetails(id){
    const d=await _al('query($id:Int){Media(id:$id,type:ANIME){id title{romaji english}coverImage{large}description status genres episodes}}',{id:parseInt(id)});
    if(d&&d.Media){const m=d.Media;return new AnimeItem({id,title:m.title.english||m.title.romaji,cover:m.coverImage.large||'',description:m.description?.replace(/<[^>]+>/g,'')||'',status:(m.status||'').toLowerCase().replace('releasing','ongoing').replace('finished','completed'),genres:m.genres||[]});}
    return new AnimeItem({id,title:id});
  }
  async getEpisodes(id){
    // Search gogoanime for episodes
    const d=await _al('query($id:Int){Media(id:$id){title{romaji}episodes}}',{id:parseInt(id)});
    if(!d||!d.Media)return[];
    const n=d.Media.episodes||0;
    const title=d.Media.title.romaji;
    // Find on gogoanime
    const sr=await _get('/'+encodeURIComponent(title));
    if(sr&&sr.results&&sr.results.length){
      const match=sr.results[0];
      const info=await _get('/info/'+match.id);
      if(info&&info.episodes)return info.episodes.map(ep=>new Episode({id:ep.id,title:ep.title||'Episode '+ep.number,number:ep.number||0}));
    }
    if(n>0){const eps=[];for(let i=1;i<=Math.min(n,500);i++)eps.push(new Episode({id:id+'__'+i,title:'Episode '+i,number:i}));return eps;}
    return[];
  }
  async getVideos(id,eid){
    if(eid.includes('__')){
      // Fallback: search and play
      return[];
    }
    const d=await _get('/watch/'+encodeURIComponent(eid));
    if(d&&d.sources)return d.sources.map(s=>new VideoLink({url:s.url,quality:s.quality||'Auto'}));
    return[];
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('miruro'))ExtManager.register(new _Src());
})();
