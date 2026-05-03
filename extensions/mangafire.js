// ==AniDeskExtension==
// @name         MangaFire
// @id           mangafire
// @type         manga
// @lang         en
// @baseUrl      https://mangafire.to
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'mangafire',name:'MangaFire',lang:'en',baseUrl:'https://mangafire.to',icon:'🔥',version:'2.0',description:'MangaFire - fast, great catalog'});}
  async _s(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://mangafire.to'}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  // MangaFire slugs are like "chainsaw-man.7oa9" — the code is the part after the last dot
  _code(id){const m=id.match(/\.([a-z0-9]+)$/i);return m?m[1]:id;}
  async getPopular(p){
    try{const doc=await this._s('https://mangafire.to/filter?sort=view&type=manga&page='+(p||1));const items=[];
    doc.querySelectorAll('.unit .inner,.card-sm').forEach(el=>{const a=el.querySelector('a[href*="/manga/"]');const img=el.querySelector('img');if(!a)return;const href=a.getAttribute('href')||'';const id=href.split('/manga/')[1]?.replace(/\/$/,'')||'';const title=(el.querySelector('.title,.name')?.textContent||a.getAttribute('title')||'').trim();const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';if(id&&title)items.push(new MangaItem({id,title,cover}));});return items;}catch(e){return[];}
  }
  async getLatest(p){
    try{const doc=await this._s('https://mangafire.to/filter?sort=updated&type=manga&page='+(p||1));const items=[];
    doc.querySelectorAll('.unit .inner,.card-sm').forEach(el=>{const a=el.querySelector('a[href*="/manga/"]');const img=el.querySelector('img');if(!a)return;const href=a.getAttribute('href')||'';const id=href.split('/manga/')[1]?.replace(/\/$/,'')||'';const title=(el.querySelector('.title,.name')?.textContent||a.getAttribute('title')||'').trim();const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';if(id&&title)items.push(new MangaItem({id,title,cover}));});return items;}catch(e){return[];}
  }
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{const doc=await this._s('https://mangafire.to/filter?keyword='+encodeURIComponent(q)+'&page='+(p||1));const items=[];
    doc.querySelectorAll('.unit .inner,.card-sm').forEach(el=>{const a=el.querySelector('a[href*="/manga/"]');const img=el.querySelector('img');if(!a)return;const href=a.getAttribute('href')||'';const id=href.split('/manga/')[1]?.replace(/\/$/,'')||'';const title=(el.querySelector('.title,.name')?.textContent||a.getAttribute('title')||'').trim();const cover=img&&(img.getAttribute('src')||img.getAttribute('data-src'))||'';if(id&&title)items.push(new MangaItem({id,title,cover}));});return items;}catch(e){return[];}
  }
  async getDetails(id){
    try{const doc=await this._s('https://mangafire.to/manga/'+id);
    const title=doc.querySelector('h1.name,[class*="manga-name"]')?.textContent?.trim()||id;
    const cover=doc.querySelector('.poster img,.cover img,.manga-poster img')?.getAttribute('src')||'';
    const desc=doc.querySelector('.summary p,.description p,.synops')?.textContent?.trim()||'';
    return new MangaItem({id,title,cover,description:desc});}catch(e){return new MangaItem({id,title:id});}
  }
  async getChapters(id){
    // CRITICAL FIX: MangaFire AJAX needs just the code (e.g. "7oa9"), not the full slug
    const code=this._code(id);
    try{
      const r=await $.fetch('https://mangafire.to/ajax/manga/'+code+'/chapter/en',{headers:{'X-Requested-With':'XMLHttpRequest','Referer':'https://mangafire.to/manga/'+id,'Accept':'application/json'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=JSON.parse(r.data);
      const html=data.result||data.html||'';
      if(!html)throw new Error('Empty response');
      const doc=this._html(html);
      const chs=[];
      // Chapter list items: <li data-id="12345"><a href="...">Chapter 1</a></li>
      doc.querySelectorAll('li[data-id]').forEach(li=>{
        const a=li.querySelector('a');
        const chId=li.getAttribute('data-id')||'';
        const text=(a&&a.textContent?.trim())||'';
        const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
        if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num}));
      });
      if(!chs.length){
        // Try alternate selector
        doc.querySelectorAll('a[href*="/read/"]').forEach(a=>{
          const href=a.getAttribute('href')||'';
          const chId=href.split('/').filter(Boolean).pop()||'';
          const text=a.textContent?.trim()||'';
          const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
          if(chId&&!chs.find(c=>c.id===chId))chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num}));
        });
      }
      return chs.sort((a,b)=>b.number-a.number);
    }catch(e){
      // Fallback: scrape manga page
      try{
        const doc=await this._s('https://mangafire.to/manga/'+id);
        const chs=[];
        doc.querySelectorAll('ul.chapter-list li,#chapter-list li').forEach(li=>{
          const a=li.querySelector('a');if(!a)return;
          const chId=li.getAttribute('data-id')||a.getAttribute('href')?.split('/').filter(Boolean).pop()||'';
          const text=a.textContent?.trim()||'';
          const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
          if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num}));
        });
        return chs.sort((a,b)=>b.number-a.number);
      }catch(e2){return[];}
    }
  }
  async getPages(id,cid){
    try{
      // Note: it's "googel" not "google" — MangaFire's quirky endpoint name
      const r=await $.fetch('https://mangafire.to/ajax/read/'+cid+'/googel-image',{headers:{'X-Requested-With':'XMLHttpRequest','Referer':'https://mangafire.to','Accept':'application/json'}});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const data=JSON.parse(r.data);
      const imgs=data.result&&data.result.images||[];
      if(imgs.length)return imgs.map((p,i)=>({number:i+1,url:Array.isArray(p)?p[0]:p}));
      // Fallback: read chapter page
      const doc=await this._s('https://mangafire.to/read/'+id+'/en/chapter-'+cid);
      const pgs=[];
      doc.querySelectorAll('.content img,.page img,[class*="reader"] img').forEach((img,i)=>{
        const src=img.getAttribute('src')||img.getAttribute('data-src')||'';
        if(src&&src.startsWith('http'))pgs.push({number:i+1,url:src});
      });
      if(!pgs.length)throw new Error('No pages found');
      return pgs;
    }catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('mangafire'))ExtManager.register(new _Src());
})();
