// ==AniDeskExtension==
// @name         Miruro
// @id           miruro
// @type         anime
// @lang         en
// @baseUrl      https://www.miruro.to
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// Miruro — AniList for metadata (always works) + Consumet Zoro for video
const _ZORO=['https://api.consumet.org/anime/zoro','https://consumet-api.onrender.com/anime/zoro'];
let _zi=0;
async function _zget(p){for(let i=0;i<_ZORO.length;i++){const idx=(_zi+i)%_ZORO.length;try{const r=await $.fetch(_ZORO[idx]+p,{headers:{Accept:'application/json'}});if(r.status===200&&r.data){_zi=idx;return JSON.parse(r.data);}}catch(e){}}return null;}
async function _al(q,v){const r=await $.fetch('https://graphql.anilist.co',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({query:q,variables:v||{}})});if(r.ok&&r.data){const d=JSON.parse(r.data);if(d.data)return d.data;}return null;}
function _ms(m){if(!m)return null;const st=(m.status||'').toLowerCase();const status=st.includes('finish')?'completed':st.includes('cancel')?'cancelled':'ongoing';return new AnimeItem({id:String(m.id),title:(m.title&&(m.title.english||m.title.romaji))||'',cover:(m.coverImage&&m.coverImage.large)||'',description:(m.description||'').replace(/<[^>]+>/g,''),status,genres:m.genres||[]});}
class _Src extends AnimeSource {
  constructor(){super({id:'miruro',name:'Miruro',lang:'en',baseUrl:'https://www.miruro.to',icon:'🪐',version:'2.0',description:'Miruro - AniList metadata + Zoro streams'});}
  async getPopular(p){const d=await _al('query($p:Int){Page(page:$p,perPage:20){media(sort:POPULARITY_DESC,type:ANIME,status_not:NOT_YET_RELEASED){id title{romaji english}coverImage{large}status genres description}}}',{p:p||1});if(d&&d.Page)return d.Page.media.map(_ms).filter(Boolean);return[];}
  async getLatest(p){const d=await _al('query($p:Int){Page(page:$p,perPage:20){media(sort:UPDATED_AT_DESC,type:ANIME,status:RELEASING){id title{romaji english}coverImage{large}status genres}}}',{p:p||1});if(d&&d.Page)return d.Page.media.map(_ms).filter(Boolean);return[];}
  async search(q,p){if(!q)return this.getPopular(p);const d=await _al('query($q:String,$p:Int){Page(page:$p,perPage:20){media(search:$q,type:ANIME){id title{romaji english}coverImage{large}status genres description}}}',{q,p:p||1});if(d&&d.Page)return d.Page.media.map(_ms).filter(Boolean);return[];}
  async getDetails(id){const d=await _al('query($id:Int){Media(id:$id,type:ANIME){id title{romaji english}coverImage{large}description status genres episodes}}',{id:parseInt(id)});if(d&&d.Media)return _ms(d.Media)||new AnimeItem({id,title:id});return new AnimeItem({id,title:id});}
  async getEpisodes(id){
    // Get AniList title, then search Zoro
    const al=await _al('query($id:Int){Media(id:$id,type:ANIME){title{romaji english}episodes}}',{id:parseInt(id)});
    const title=al&&al.Media&&(al.Media.title.english||al.Media.title.romaji);
    if(title){
      const sr=await _zget('/'+encodeURIComponent(title)+'?page=1');
      if(sr&&sr.results&&sr.results.length){
        const match=sr.results[0];
        const ep=await _zget('/episodes/'+encodeURIComponent(match.id));
        if(ep&&ep.episodes&&ep.episodes.length)return ep.episodes.map(e=>new Episode({id:e.id,title:e.title||'Episode '+e.number,number:e.number||0}));
      }
    }
    // Fallback: numbered episodes from AniList episode count
    const n=al&&al.Media&&al.Media.episodes||0;
    if(n>0){const eps=[];for(let i=1;i<=n;i++)eps.push(new Episode({id:id+'__'+i,title:'Episode '+i,number:i}));return eps;}
    return[];
  }
  async getVideos(id,eid){
    if(!eid.includes('__')){const d=await _zget('/watch/'+encodeURIComponent(eid));if(d&&d.sources&&d.sources.length)return d.sources.map(s=>new VideoLink({url:s.url,quality:s.quality||'Auto',isM3U8:!!(s.isM3U8||s.url.includes('.m3u8'))}));}
    return[];
  }
}
if(typeof ExtManager!=='undefined')ExtManager.register(new _Src());
})();
