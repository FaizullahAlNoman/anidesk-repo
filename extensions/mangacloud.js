// ==AniDeskExtension==
// @name         MangaCloud
// @id           mangacloud
// @type         manga
// @lang         en
// @baseUrl      https://mangacloud.org
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'mangacloud',name:'MangaCloud',lang:'en',baseUrl:'https://mangacloud.org',icon:'☁️',version:'1.0'});}
  async _s(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://mangacloud.org'}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  async getPopular(p){
    try{
      const doc=await this._s('https://mangacloud.org/latest/?page='+(p||1));
      const items=[];
      doc.querySelectorAll('.bs,.bsx').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/manga\//,'').replace(/\/$/,'')||href.split('/').filter(Boolean).pop();
        const title=(el.querySelector('.tt,.title')?.textContent||a.getAttribute('title')||'').trim();
        const cover=img&&(img.getAttribute('src')||img.getAttribute('data-src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async getLatest(p){return this.getPopular(p);}
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{
      const doc=await this._s('https://mangacloud.org/?s='+encodeURIComponent(q));
      const items=[];
      doc.querySelectorAll('.bs,.bsx').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/manga\//,'').replace(/\/$/,'')||href.split('/').filter(Boolean).pop();
        const title=(el.querySelector('.tt,.title')?.textContent||a.getAttribute('title')||'').trim();
        const cover=img&&(img.getAttribute('src')||img.getAttribute('data-src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async getDetails(id){
    try{
      const doc=await this._s('https://mangacloud.org/manga/'+id+'/');
      const title=doc.querySelector('.entry-title,h1')?.textContent?.trim()||id;
      const cover=doc.querySelector('.thumb img')?.getAttribute('src')||'';
      const desc=doc.querySelector('.entry-content p,.summary__content')?.textContent?.trim()||'';
      return new MangaItem({id,title,cover,description:desc});
    }catch(e){return new MangaItem({id,title:id});}
  }
  async getChapters(id){
    try{
      const doc=await this._s('https://mangacloud.org/manga/'+id+'/');
      const chs=[];
      doc.querySelectorAll('.eplister li a,#chapterlist li a').forEach(a=>{
        const href=a.getAttribute('href')||'';
        const chId=href.split('/').filter(Boolean).pop()||'';
        const text=a.querySelector('.chapternum')?.textContent?.trim()||a.textContent?.trim()||'';
        const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
        if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num,url:href}));
      });
      return chs;
    }catch(e){return[];}
  }
  async getPages(id,cid){
    try{
      const url=cid.startsWith('http')?cid:'https://mangacloud.org/'+id+'/'+cid+'/';
      const doc=await this._s(url);
      const pgs=[];
      // Check ts_reader.run data
      const scripts=doc.querySelectorAll('script');
      for(const s of scripts){
        const m=(s.textContent||'').match(/ts_reader\.run\(({.*?})\)/s);
        if(m){try{const data=JSON.parse(m[1]);const imgs=data.sources&&data.sources[0]&&data.sources[0].images||[];imgs.forEach((url,i)=>pgs.push({number:i+1,url}));break;}catch(e){}}
      }
      if(!pgs.length){
        doc.querySelectorAll('#readerarea img,.page-break img').forEach((img,i)=>{
          const src=img.getAttribute('src')||img.getAttribute('data-src')||'';
          if(src)pgs.push({number:i+1,url:src.trim()});
        });
      }
      if(!pgs.length)throw new Error('No pages found');
      return pgs;
    }catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('mangacloud'))ExtManager.register(new _Src());
})();
