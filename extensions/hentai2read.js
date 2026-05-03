// ==AniDeskExtension==
// @name         Hentai2Read
// @id           hentai2read
// @type         manga
// @lang         en
// @baseUrl      https://hentai2read.com
// @version      1.0
// @nsfw         true
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'hentai2read',name:'Hentai2Read',lang:'en',baseUrl:'https://hentai2read.com',icon:'🔞',version:'1.0',nsfw:true});}
  async _s(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://hentai2read.com'}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  async getPopular(p){
    try{
      const doc=await this._s('https://hentai2read.com/trending/?page='+(p||1));
      const items=[];
      doc.querySelectorAll('.row li,.book-list-item').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*hentai2read\.com\//,'').replace(/\/$/,'').split('/')[0];
        const title=(img&&img.getAttribute('alt'))||a.textContent.trim();
        const cover=img&&(img.getAttribute('data-original')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover,status:'completed'}));
      });
      return items;
    }catch(e){return[];}
  }
  async getLatest(p){
    try{
      const doc=await this._s('https://hentai2read.com/?page='+(p||1));
      const items=[];
      doc.querySelectorAll('.row li').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*hentai2read\.com\//,'').replace(/\/$/,'').split('/')[0];
        const title=(img&&img.getAttribute('alt'))||a.textContent.trim();
        const cover=img&&(img.getAttribute('data-original')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover,status:'completed'}));
      });
      return items;
    }catch(e){return[];}
  }
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{
      const doc=await this._s('https://hentai2read.com/search/?q='+encodeURIComponent(q)+'&page='+(p||1));
      const items=[];
      doc.querySelectorAll('.row li').forEach(el=>{
        const a=el.querySelector('a');const img=el.querySelector('img');
        if(!a)return;
        const href=a.getAttribute('href')||'';
        const id=href.replace(/.*hentai2read\.com\//,'').replace(/\/$/,'').split('/')[0];
        const title=(img&&img.getAttribute('alt'))||a.textContent.trim();
        const cover=img&&(img.getAttribute('data-original')||img.getAttribute('src'))||'';
        if(id&&title)items.push(new MangaItem({id,title,cover,status:'completed'}));
      });
      return items;
    }catch(e){return[];}
  }
  async getDetails(id){
    try{
      const doc=await this._s('https://hentai2read.com/'+id+'/');
      const title=doc.querySelector('.section-title h1')?.textContent?.trim()||id;
      const cover=doc.querySelector('.book-cover img')?.getAttribute('src')||'';
      const desc=doc.querySelector('.book-summary')?.textContent?.trim()||'';
      return new MangaItem({id,title,cover,description:desc,status:'completed'});
    }catch(e){return new MangaItem({id,title:id});}
  }
  async getChapters(id){
    try{
      const doc=await this._s('https://hentai2read.com/'+id+'/');
      const chs=[];
      doc.querySelectorAll('.book-episodes li a').forEach(a=>{
        const href=a.getAttribute('href')||'';
        const chId=href.replace(/.*hentai2read\.com\//,'').replace(/\/$/,'');
        const text=a.textContent?.trim()||'';
        const num=parseFloat(text.replace(/[^0-9.]/g,''))||1;
        if(chId)chs.push(new Chapter({id:chId,title:text||'Chapter '+num,number:num,url:href}));
      });
      return chs.length?chs:[new Chapter({id,title:'Read',number:1})];
    }catch(e){return[];}
  }
  async getPages(id,cid){
    try{
      const url=cid.startsWith('http')?cid:'https://hentai2read.com/'+cid+'/1/';
      const doc=await this._s(url);
      const pgs=[];
      // Extract from script
      const scripts=doc.querySelectorAll('script');
      for(const s of scripts){
        const m=(s.textContent||'').match(/var\s+images\s*=\s*(\[.*?\]);/s)||
                (s.textContent||'').match(/"images"\s*:\s*(\[.*?\])/s);
        if(m){try{const imgs=JSON.parse(m[1]);imgs.forEach((url,i)=>pgs.push({number:i+1,url:typeof url==='string'?url:url.url||''}));break;}catch(e){}}
      }
      if(!pgs.length){
        doc.querySelectorAll('#comic-contain img,#pages img').forEach((img,i)=>{
          const src=img.getAttribute('src')||img.getAttribute('data-src')||'';
          if(src)pgs.push({number:i+1,url:src});
        });
      }
      if(!pgs.length)throw new Error('No pages found');
      return pgs;
    }catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('hentai2read'))ExtManager.register(new _Src());
})();
