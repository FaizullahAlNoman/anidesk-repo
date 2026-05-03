// ==AniDeskExtension==
// @name         AnimePahe
// @id           animepahe
// @type         anime
// @lang         en
// @baseUrl      https://animepahe.ru
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// AnimePahe — uses their own public REST API directly (no Consumet needed)
const _B='https://animepahe.ru';
const _H={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36','Referer':'https://animepahe.ru/','Accept':'application/json, text/plain, */*'};
async function _j(url){const r=await $.fetch(url,{headers:_H});if(!r.ok)throw new Error('HTTP '+r.status);return JSON.parse(r.data);}
class _Src extends AnimeSource {
  constructor(){super({id:'animepahe',name:'AnimePahe',lang:'en',baseUrl:_B,icon:'🌸',version:'2.0',description:'AnimePahe - direct API, compressed high quality'});}
  _m(a){return new AnimeItem({id:a.session||a.id||'',title:a.title||'',cover:a.poster||a.image||a.snapshot||'',status:(a.status||'ongoing').toLowerCase()});}
  async getPopular(p){
    try{const d=await _j(_B+'/api?m=airing&page='+(p||1));if(d&&d.data)return d.data.map(a=>this._m(a));} catch(e){}
    return[];
  }
  async getLatest(p){
    try{const d=await _j(_B+'/api?m=airing&page='+(p||1));if(d&&d.data)return d.data.map(a=>this._m(a));}catch(e){}
    return[];
  }
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{const d=await _j(_B+'/api?m=search&q='+encodeURIComponent(q));if(d&&d.data)return d.data.map(a=>this._m(a));}catch(e){}
    return[];
  }
  async getDetails(id){
    try{const d=await _j(_B+'/api?m=search&q='+id.replace(/-/g,' '));if(d&&d.data){const m=d.data.find(a=>a.session===id)||d.data[0];if(m)return this._m(m);}}catch(e){}
    return new AnimeItem({id,title:id});
  }
  async getEpisodes(id){
    const eps=[];let page=1;
    try{
      while(true){
        const d=await _j(_B+'/api?m=release&id='+id+'&sort=episode_asc&page='+page);
        if(!d||!d.data||!d.data.length)break;
        for(const ep of d.data){
          eps.push(new Episode({id:id+'|'+ep.session,title:'Episode '+ep.episode,number:parseFloat(ep.episode)||0}));
        }
        if(!d.next_page_url)break;
        page++;
        if(page>50)break;
      }
    }catch(e){}
    return eps;
  }
  async getVideos(animeId,eid){
    const parts=eid.split('|');
    const session=parts[1]||parts[0];
    const animeSession=parts[0];
    // Fetch the play page to get kwik embed links
    try{
      const r=await $.fetch(_B+'/play/'+animeSession+'/'+session,{headers:{..._H,'Accept':'text/html,*/*'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const doc=(new DOMParser()).parseFromString(r.data||'','text/html');
      const links=[];
      // Get all quality buttons with data-src pointing to kwik
      doc.querySelectorAll('[data-src*="kwik"],[data-href*="kwik"],a[href*="kwik"]').forEach(el=>{
        const url=el.getAttribute('data-src')||el.getAttribute('data-href')||el.getAttribute('href')||'';
        const quality=(el.textContent||el.getAttribute('data-resolution')||'Auto').trim();
        if(url)links.push({url,quality});
      });
      if(links.length){
        // Resolve each kwik link to get actual m3u8
        const videos=[];
        for(const l of links){
          try{
            const kr=await $.fetch(l.url,{headers:{..._H,'Referer':_B+'/'}});
            if(kr.ok&&kr.data){
              const m=kr.data.match(/source\s*=\s*['"]([^'"]+\.m3u8[^'"]*)['"]/)||
                       kr.data.match(/file:\s*['"]([^'"]+\.m3u8[^'"]*)['"]/)||
                       kr.data.match(/"([^"]+\.m3u8[^"]*)"/);
              if(m&&m[1])videos.push(new VideoLink({url:m[1],quality:l.quality,isM3U8:true}));
            }
          }catch(e){}
        }
        if(videos.length)return videos;
      }
    }catch(e){}
    // Fallback: try consumet animepahe endpoint
    const _APIS=['https://api.consumet.org/anime/animepahe','https://consumet-api.onrender.com/anime/animepahe'];
    for(const api of _APIS){
      try{
        const r=await $.fetch(api+'/watch/'+encodeURIComponent(session),{headers:{Accept:'application/json'}});
        if(r.status===200&&r.data){const d=JSON.parse(r.data);if(d.sources&&d.sources.length)return d.sources.map(s=>new VideoLink({url:s.url,quality:s.quality||'Auto',isM3U8:!!(s.isM3U8||(s.url&&s.url.includes('.m3u8')))}));}
      }catch(e){}
    }
    return[];
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('animepahe'))ExtManager.register(new _Src());
})();
