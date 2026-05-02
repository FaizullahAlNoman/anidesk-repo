// ==AniDeskExtension==
// @name         Comix.to
// @id           comixto
// @type         manga
// @lang         en
// @baseUrl      https://comix.to
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// Comix.to - use MangaDex as fallback since comix.to blocks scrapers
class _Src extends MangaSource {
  constructor(){super({id:'comixto',name:'Comix.to',lang:'en',baseUrl:'https://comix.to',icon:'💥',version:'1.0'});this._cv='https://uploads.mangadex.org/covers';}
  _ti(m){if(!m||!m.attributes)return null;const t=m.attributes.title.en||Object.values(m.attributes.title||{})[0]||'Unknown';const cr=(m.relationships||[]).find(r=>r.type==='cover_art');const cover=cr&&cr.attributes&&cr.attributes.fileName?this._cv+'/'+m.id+'/'+cr.attributes.fileName+'.256.jpg':'';return new MangaItem({id:m.id,title:t,cover,description:(m.attributes.description||{}).en||'',status:m.attributes.status||'ongoing',genres:(m.attributes.tags||[]).map(t=>t.attributes&&t.attributes.name&&t.attributes.name.en).filter(Boolean)});}
  async _f(p){const r=await $.fetch('https://api.mangadex.org'+p,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return JSON.parse(r.data);}
  async getPopular(p){p=p||1;try{const d=await this._f('/manga?limit=20&offset='+(p-1)*20+'&order[followedCount]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en');return(d.data||[]).map(m=>this._ti(m)).filter(Boolean);}catch(e){return[];}}
  async getLatest(p){p=p||1;try{const d=await this._f('/manga?limit=20&offset='+(p-1)*20+'&order[updatedAt]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en');return(d.data||[]).map(m=>this._ti(m)).filter(Boolean);}catch(e){return[];}}
  async search(q,p){p=p||1;if(!q)return this.getPopular(p);try{const d=await this._f('/manga?title='+encodeURIComponent(q)+'&limit=20&offset='+(p-1)*20+'&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive');return(d.data||[]).map(m=>this._ti(m)).filter(Boolean);}catch(e){return[];}}
  async getDetails(id){try{const d=await this._f('/manga/'+id+'?includes[]=cover_art');return this._ti(d.data)||new MangaItem({id,title:id});}catch(e){return new MangaItem({id,title:id});}}
  async getChapters(id){try{const all=[];let o=0;const seen=new Set();while(true){const d=await this._f('/manga/'+id+'/feed?limit=96&offset='+o+'&order[chapter]=desc&translatedLanguage[]=en&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica');if(!d||!d.data||!d.data.length)break;for(const ch of d.data){if(seen.has(ch.id))continue;seen.add(ch.id);const num=parseFloat(ch.attributes&&ch.attributes.chapter)||0;all.push(new Chapter({id:ch.id,title:'Chapter '+(ch.attributes&&ch.attributes.chapter||'?'),number:num}));}if(d.data.length<96)break;o+=96;if(o>=600)break;}const bn={};all.forEach(c=>{const k=c.number.toFixed(1);if(!bn[k])bn[k]=c;});return Object.values(bn).sort((a,b)=>b.number-a.number);}catch(e){return[];}}
  async getPages(id,cid){try{const d=await this._f('/at-home/server/'+cid);const base=d.baseUrl,hash=d.chapter&&d.chapter.hash,pgs=(d.chapter&&d.chapter.data)||[];if(!base||!hash||!pgs.length)throw new Error('No pages');return pgs.map((p,i)=>({number:i+1,url:base+'/data/'+hash+'/'+p}));}catch(e){throw new Error('Pages: '+e.message);}}
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('comixto'))ExtManager.register(new _Src());
})();
