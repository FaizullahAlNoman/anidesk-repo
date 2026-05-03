// ==AniDeskExtension==
// @name         HentaiMama
// @id           hentaimama
// @type         anime
// @lang         en
// @baseUrl      https://hentaimama.io
// @version      1.0
// @nsfw         true
// ==/AniDeskExtension==
(function(){
const _APIS=['https://api.consumet.org/anime/gogoanime'];
class _Src extends AnimeSource {
  constructor(){super({id:'hentaimama',name:'HentaiMama',lang:'en',baseUrl:'https://hentaimama.io',icon:'🔞',version:'1.0',nsfw:true});}
  async _scrape(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://hentaimama.io'}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  async getPopular(p){
    try{
      const doc=await this._scrape('https://hentaimama.io/?page='+(p||1));
      const items=[];
      doc.querySelectorAll('.film_list-wrap .flw-item').forEach(el=>{
        const a=el.querySelector('.film-name a,.fd-infor a');
        const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.split('/').filter(Boolean).pop()||href;
        const title=(a.getAttribute('title')||a.textContent||'').trim();
        const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new AnimeItem({id,title,cover,status:'completed',nsfw:true}));
      });
      return items;
    }catch(e){return[];}
  }
  async getLatest(p){return this.getPopular(p);}
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{
      const doc=await this._scrape('https://hentaimama.io/?s='+encodeURIComponent(q));
      const items=[];
      doc.querySelectorAll('.film_list-wrap .flw-item,.post').forEach(el=>{
        const a=el.querySelector('.film-name a,h2 a,h3 a');
        const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.split('/').filter(Boolean).pop()||href;
        const title=(a.getAttribute('title')||a.textContent||'').trim();
        if(id&&title)items.push(new AnimeItem({id,title,cover:img&&img.getAttribute('src')||'',status:'completed'}));
      });
      return items;
    }catch(e){return[];}
  }
  async getDetails(id){
    try{
      const url=id.startsWith('http')?id:'https://hentaimama.io/tvshows/'+id;
      const doc=await this._scrape(url);
      const title=doc.querySelector('h1.entry-title,.film-name')?.textContent?.trim()||id;
      const cover=doc.querySelector('.film-poster img,.entry-thumbnail img')?.getAttribute('src')||'';
      const desc=doc.querySelector('.film-description,.entry-content p')?.textContent?.trim()||'';
      return new AnimeItem({id,title,cover,description:desc,status:'completed'});
    }catch(e){return new AnimeItem({id,title:id});}
  }
  async getEpisodes(id){
    try{
      const url=id.startsWith('http')?id:'https://hentaimama.io/tvshows/'+id;
      const doc=await this._scrape(url);
      const eps=[];let n=1;
      doc.querySelectorAll('.ep-item,.episodes-list a,[class*="episode"] a').forEach(a=>{
        const href=a.getAttribute('href')||'';
        const epId=href.split('/').filter(Boolean).pop()||href;
        const text=a.textContent?.trim()||'Episode '+n;
        if(epId)eps.push(new Episode({id:epId,title:text,number:n++,url:href}));
      });
      if(!eps.length)eps.push(new Episode({id,title:'Watch Episode 1',number:1}));
      return eps;
    }catch(e){return[];}
  }
  async getVideos(id,eid){
    try{
      const url=eid.startsWith('http')?eid:'https://hentaimama.io/episodes/'+eid;
      const doc=await this._scrape(url);
      const links=[];
      doc.querySelectorAll('source[src],video source').forEach(s=>{
        const src=s.getAttribute('src')||'';
        if(src)links.push(new VideoLink({url:src,quality:s.getAttribute('label')||'Auto',isM3U8:src.includes('.m3u8')}));
      });
      // Try iframe
      const iframes=doc.querySelectorAll('iframe[src]');
      iframes.forEach(iframe=>{
        const src=iframe.getAttribute('src')||'';
        if(src&&src.startsWith('http'))links.push(new VideoLink({url:src,quality:'Stream'}));
      });
      return links;
    }catch(e){return[];}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('hentaimama'))ExtManager.register(new _Src());
})();
