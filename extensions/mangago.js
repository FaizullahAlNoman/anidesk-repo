// ==AniDeskExtension==
// @name         MangaGo
// @id           mangago
// @type         manga
// @lang         en
// @baseUrl      https://mangago.me
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'mangago',name:'MangaGo',lang:'en',baseUrl:'https://mangago.me',icon:'📚',version:'1.0'});}
  async _s(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://mangago.me'}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  async getPopular(p){
    try{
      const doc=await this._s('https://www.mangago.me/list/manga/hot/?page='+(p||1));
      const items=[];
      doc.querySelectorAll('.pic_list li,.updatesec li').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/read-manga\//,'').replace(/\/$/,'');
        const title=(img&&img.getAttribute('alt'))||a.textContent.trim();
        const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async getLatest(p){
    try{
      const doc=await this._s('https://www.mangago.me/list/manga/new/?page='+(p||1));
      const items=[];
      doc.querySelectorAll('.pic_list li').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/read-manga\//,'').replace(/\/$/,'');
        const title=(img&&img.getAttribute('alt'))||a.textContent.trim();
        const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{
      const doc=await this._s('https://www.mangago.me/r/m_search?word='+encodeURIComponent(q)+'&page='+(p||1));
      const items=[];
      doc.querySelectorAll('.pic_list li,#search_list li').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*\/read-manga\//,'').replace(/\/$/,'');
        const title=(img&&img.getAttribute('alt'))||a.textContent.trim();
        const cover=img&&(img.getAttribute('data-src')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover}));
      });
      return items;
    }catch(e){return[];}
  }
  async getDetails(id){
    try{
      const doc=await this._s('https://www.mangago.me/read-manga/'+id+'/');
      const title=doc.querySelector('#page_top h1,.manga-title')?.textContent?.trim()||id;
      const cover=doc.querySelector('#page_top img,.cover img')?.getAttribute('src')||'';
      const desc=doc.querySelector('.manga_intro,.description')?.textContent?.trim()||'';
      return new MangaItem({id,title,cover,description:desc});
    }catch(e){return new MangaItem({id,title:id});}
  }
  async getChapters(id){
    try{
      const doc=await this._s('https://www.mangago.me/read-manga/'+id+'/');
      const chs=[];
      doc.querySelectorAll('#chapters li a,#chapter_list li a').forEach(a=>{
        const href=a.getAttribute('href')||'';
        const chId=href.split('/').filter(Boolean).pop()||'';
        const text=a.textContent?.trim()||'';
        const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
        if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num,url:href}));
      });
      return chs;
    }catch(e){return[];}
  }
  async getPages(id,cid){
    try{
      const url=cid.startsWith('http')?cid:'https://www.mangago.me/read-manga/'+id+'/'+cid;
      const doc=await this._s(url);
      const pgs=[];
      // MangaGo uses a script with page data
      const scripts=doc.querySelectorAll('script');
      for(const s of scripts){
        const text=s.textContent||'';
        const m=text.match(/var\s+(?:imgsrcs|pages)\s*=\s*(\[.*?\])/);
        if(m){try{const imgs=JSON.parse(m[1]);imgs.forEach((url,i)=>pgs.push({number:i+1,url:typeof url==='string'?url:(url.u||url)}));break;}catch(e){}}
      }
      if(!pgs.length){
        doc.querySelectorAll('.read-pic img,#picture img').forEach((img,i)=>{
          const src=img.getAttribute('src')||img.getAttribute('data-src')||'';
          if(src)pgs.push({number:i+1,url:src});
        });
      }
      if(!pgs.length)throw new Error('No pages found');
      return pgs;
    }catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('mangago'))ExtManager.register(new _Src());
})();
