// ==AniDeskExtension==
// @name         MangaFire
// @id           mangafire
// @type         manga
// @lang         en
// @baseUrl      https://mangafire.to
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'mangafire',name:'MangaFire',lang:'en',baseUrl:'https://mangafire.to',icon:'🔥',version:'1.0'});}
  async _s(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://mangafire.to'}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  async getPopular(p){
    try{
      const doc=await this._s('https://mangafire.to/filter?sort=view&type=manga&page='+(p||1));
      const items=[];
      doc.querySelectorAll('.card-sm,.unit').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/manga\//,'').replace(/\/$/,'').split('/')[0]||href.split('/').filter(Boolean).pop();
        const title=(el.querySelector('.title,.name')?.textContent||a.getAttribute('title')||'').trim();
        const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async getLatest(p){
    try{
      const doc=await this._s('https://mangafire.to/filter?sort=updated&type=manga&page='+(p||1));
      const items=[];
      doc.querySelectorAll('.card-sm,.unit').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/manga\//,'').replace(/\/$/,'').split('/')[0]||href.split('/').filter(Boolean).pop();
        const title=(el.querySelector('.title,.name')?.textContent||a.getAttribute('title')||'').trim();
        const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{
      const doc=await this._s('https://mangafire.to/filter?keyword='+encodeURIComponent(q)+'&page='+(p||1));
      const items=[];
      doc.querySelectorAll('.card-sm,.unit').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/manga\//,'').split('/')[0]||href.split('/').filter(Boolean).pop();
        const title=(el.querySelector('.title,.name')?.textContent||a.getAttribute('title')||'').trim();
        if(id&&title)items.push(new MangaItem({id,title,cover:img&&img.getAttribute('src')||''}));
      });
      return items;
    }catch(e){return[];}
  }
  async getDetails(id){
    try{
      const doc=await this._s('https://mangafire.to/manga/'+id);
      const title=doc.querySelector('h1.name,.manga-name')?.textContent?.trim()||id;
      const cover=doc.querySelector('.poster img,.cover img')?.getAttribute('src')||'';
      const desc=doc.querySelector('.summary,.description')?.textContent?.trim()||'';
      const status=(doc.querySelector('[data-name="Status"] span')?.textContent||'ongoing').toLowerCase();
      return new MangaItem({id,title,cover,description:desc,status});
    }catch(e){return new MangaItem({id,title:id});}
  }
  async getChapters(id){
    try{
      // MangaFire uses a volumes/chapters endpoint
      const r=await $.fetch('https://mangafire.to/ajax/manga/'+id+'/chapter/en',{headers:{'X-Requested-With':'XMLHttpRequest','Referer':'https://mangafire.to/manga/'+id}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=JSON.parse(r.data);
      const doc=this._html(data.result||data.html||'');
      const chs=[];
      doc.querySelectorAll('li[data-id],li a').forEach(el=>{
        const a=el.tagName==='A'?el:el.querySelector('a');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const chId=el.getAttribute('data-id')||href.split('/').filter(Boolean).pop()||'';
        const text=a.textContent?.trim()||'';
        const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
        if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num,url:href}));
      });
      return chs.sort((a,b)=>b.number-a.number);
    }catch(e){
      // Fallback: scrape chapter list from manga page
      try{
        const doc=await this._s('https://mangafire.to/manga/'+id);
        const chs=[];
        doc.querySelectorAll('.chapter-list a,[class*="chapter"] a').forEach(a=>{
          const href=a.getAttribute('href')||'';
          const chId=href.split('/').filter(Boolean).pop()||'';
          const text=a.textContent?.trim()||'';
          const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
          if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num,url:href}));
        });
        return chs.sort((a,b)=>b.number-a.number);
      }catch(e2){return[];}
    }
  }
  async getPages(id,cid){
    try{
      const r=await $.fetch('https://mangafire.to/ajax/read/'+cid+'/googel-image',{headers:{'X-Requested-With':'XMLHttpRequest','Referer':'https://mangafire.to'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=JSON.parse(r.data);
      const pgs=data.result&&data.result.images||[];
      if(pgs.length)return pgs.map((p,i)=>({number:i+1,url:Array.isArray(p)?p[0]:p}));
      // Fallback: scrape reader
      const doc=await this._s('https://mangafire.to/read/'+id+'/en/chapter-'+cid);
      const imgs=[];
      doc.querySelectorAll('.images img,[class*="page"] img').forEach((img,i)=>{
        const src=img.getAttribute('src')||img.getAttribute('data-src')||'';
        if(src)imgs.push({number:i+1,url:src});
      });
      if(!imgs.length)throw new Error('No pages found');
      return imgs;
    }catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('mangafire'))ExtManager.register(new _Src());
})();
