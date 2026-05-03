// ==AniDeskExtension==
// @name         MangaCloud
// @id           mangacloud
// @type         manga
// @lang         en
// @baseUrl      https://manga-cloud.net
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
const _B='https://manga-cloud.net';
class _Src extends MangaSource {
  constructor(){super({id:'mangacloud',name:'MangaCloud',lang:'en',baseUrl:_B,icon:'☁️',version:'2.0',description:'MangaCloud - online manga reader'});}
  async _s(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':_B}});if(!r.ok)throw new Error('HTTP '+r.status);return this._html(r.data);}
  async getPopular(p){
    try{const doc=await this._s(_B+'/?page='+(p||1));const items=[];
    doc.querySelectorAll('.bs,.bsx,.item-thumb').forEach(el=>{const a=el.querySelector('a');const img=el.querySelector('img');if(!a)return;const href=a.getAttribute('href')||'';const id=href.replace(_B,'').replace(/^\/manga\//,'').replace(/\/$/,'')||href.split('/').filter(Boolean).pop()||'';const title=(el.querySelector('.tt,.title,h2')?.textContent||a.getAttribute('title')||'').trim();const cover=img&&(img.getAttribute('src')||img.getAttribute('data-src'))||'';if(id&&title)items.push(new MangaItem({id,title,cover}));});return items;}catch(e){return[];}
  }
  async getLatest(p){return this.getPopular(p);}
  async search(q,p){
    if(!q)return this.getPopular(p);
    try{const doc=await this._s(_B+'/?s='+encodeURIComponent(q));const items=[];
    doc.querySelectorAll('.bs,.bsx,.item-thumb').forEach(el=>{const a=el.querySelector('a');const img=el.querySelector('img');if(!a)return;const href=a.getAttribute('href')||'';const id=href.replace(_B,'').replace(/^\/manga\//,'').replace(/\/$/,'')||href.split('/').filter(Boolean).pop()||'';const title=(el.querySelector('.tt,.title,h2')?.textContent||a.getAttribute('title')||'').trim();const cover=img&&(img.getAttribute('src')||img.getAttribute('data-src'))||'';if(id&&title)items.push(new MangaItem({id,title,cover}));});return items;}catch(e){return[];}
  }
  async getDetails(id){
    try{const url=id.startsWith('http')?id:_B+'/manga/'+id+'/';const doc=await this._s(url);
    const title=doc.querySelector('.entry-title,h1.manga-title,h1')?.textContent?.trim()||id;
    const cover=doc.querySelector('.thumb img,.manga-poster img,.cover img')?.getAttribute('src')||'';
    const desc=doc.querySelector('.entry-content p,.summary__content p')?.textContent?.trim()||'';
    return new MangaItem({id,title,cover,description:desc});}catch(e){return new MangaItem({id,title:id});}
  }
  async getChapters(id){
    try{const url=id.startsWith('http')?id:_B+'/manga/'+id+'/';const doc=await this._s(url);const chs=[];
    doc.querySelectorAll('.eplister li,#chapterlist li,.cl li').forEach(li=>{
      const a=li.querySelector('a');if(!a)return;
      const href=a.getAttribute('href')||'';
      const chId=href.replace(_B,'').replace(/\/$/,'').split('/').filter(Boolean).pop()||'';
      const text=(li.querySelector('.chapternum,.chapter-title')?.textContent||a.textContent||'').trim();
      const num=parseFloat(text.replace(/[^0-9.]/g,''))||0;
      if(chId)chs.push(new Chapter({id:href||chId,title:text||'Chapter '+num,number:num}));
    });return chs;}catch(e){return[];}
  }
  async getPages(id,cid){
    try{const url=cid.startsWith('http')?cid:_B+'/'+id+'/'+cid+'/';const doc=await this._s(url);const pgs=[];
    const scripts=[...doc.querySelectorAll('script')];
    for(const s of scripts){
      const m=(s.textContent||'').match(/ts_reader\.run\(({[\s\S]*?})\)/);
      if(m){try{const data=JSON.parse(m[1]);const imgs=(data.sources&&data.sources[0]&&data.sources[0].images)||[];imgs.forEach((u,i)=>pgs.push({number:i+1,url:u}));break;}catch(e){}}
    }
    if(!pgs.length)doc.querySelectorAll('#readerarea img,.page-break img,[class*="reader"] img').forEach((img,i)=>{const src=img.getAttribute('src')||img.getAttribute('data-src')||'';if(src)pgs.push({number:i+1,url:src.trim()});});
    if(!pgs.length)throw new Error('No pages found');return pgs;}catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined')ExtManager.register(new _Src());
})();
