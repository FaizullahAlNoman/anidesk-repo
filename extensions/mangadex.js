// ==AniDeskExtension==
// @name         MangaDex
// @id           mangadex
// @type         manga
// @lang         en
// @baseUrl      https://api.mangadex.org
// @version      2.1
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'mangadex',name:'MangaDex',lang:'en',baseUrl:'https://api.mangadex.org',icon:'📖',version:'2.1',description:'MangaDex - official API, largest manga library'});this._cv='https://uploads.mangadex.org/covers';}
  async _f(p){const r=await $.fetch('https://api.mangadex.org'+p,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return JSON.parse(r.data);}
  _ti(m){
    if(!m||!m.attributes)return new MangaItem({id:(m&&m.id)||'',title:'Unknown'});
    const t=m.attributes.title.en||Object.values(m.attributes.title||{})[0]||'Unknown';
    const cr=(m.relationships||[]).find(r=>r.type==='cover_art');
    const cover=cr&&cr.attributes&&cr.attributes.fileName?this._cv+'/'+m.id+'/'+cr.attributes.fileName+'.256.jpg':'';
    const ar=(m.relationships||[]).find(r=>r.type==='author');
    return new MangaItem({id:m.id,title:t,cover,description:((m.attributes.description||{}).en||''),status:m.attributes.status||'ongoing',genres:(m.attributes.tags||[]).map(t=>t.attributes&&t.attributes.name&&t.attributes.name.en).filter(Boolean),author:ar&&ar.attributes?ar.attributes.name||'':''});
  }
  async getPopular(p){p=p||1;const d=await this._f('/manga?limit=20&offset='+(p-1)*20+'&order[followedCount]=desc&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en');return(d.data||[]).map(m=>this._ti(m));}
  async getLatest(p){p=p||1;const d=await this._f('/manga?limit=20&offset='+(p-1)*20+'&order[updatedAt]=desc&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en');return(d.data||[]).map(m=>this._ti(m));}
  async search(q,p){p=p||1;if(!q)return this.getPopular(p);const d=await this._f('/manga?title='+encodeURIComponent(q)+'&limit=20&offset='+(p-1)*20+'&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive');return(d.data||[]).map(m=>this._ti(m));}
  async getDetails(id){const d=await this._f('/manga/'+id+'?includes[]=cover_art&includes[]=author');return this._ti(d.data);}
  async getChapters(id){
    const all=[];let o=0;const seen=new Set();
    // FIXED: removed 600 offset cap — now fetches ALL chapters
    while(true){
      try{
        const d=await this._f('/manga/'+id+'/feed?limit=96&offset='+o+'&order[chapter]=desc&translatedLanguage[]=en&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=scanlation_group');
        if(!d||!d.data||!d.data.length)break;
        for(const ch of d.data){
          if(seen.has(ch.id))continue;seen.add(ch.id);
          const num=parseFloat((ch.attributes&&ch.attributes.chapter)||'0')||0;
          all.push(new Chapter({id:ch.id,title:(ch.attributes&&ch.attributes.title)||('Chapter '+(ch.attributes&&ch.attributes.chapter||'?')),number:num,date:ch.attributes&&ch.attributes.publishAt}));
        }
        if(d.data.length<96)break;
        o+=96;
        // Safety cap at 10000 chapters (handles even the longest series)
        if(o>=10000)break;
      }catch(e){break;}
    }
    // Deduplicate by chapter number, keep latest scanlation
    const bn={};all.forEach(c=>{const k=c.number.toFixed(1);if(!bn[k])bn[k]=c;});
    return Object.values(bn).sort((a,b)=>b.number-a.number);
  }
  async getPages(id,cid){
    const d=await this._f('/at-home/server/'+cid);
    const base=d.baseUrl,hash=d.chapter&&d.chapter.hash,pgs=(d.chapter&&d.chapter.data)||[];
    if(!base||!hash||!pgs.length)throw new Error('No pages found');
    return pgs.map((p,i)=>({number:i+1,url:base+'/data/'+hash+'/'+p}));
  }
}
if(typeof ExtManager!=='undefined')ExtManager.register(new _Src());
})();
