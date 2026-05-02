// ==AniDeskExtension==
// @name         nHentai
// @id           nhentai
// @type         manga
// @lang         en
// @baseUrl      https://nhentai.net
// @version      1.0
// @nsfw         true
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'nhentai',name:'nHentai',lang:'en',baseUrl:'https://nhentai.net',icon:'🔞',version:'1.0',nsfw:true});}
  async _j(url){const r=await $.fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://nhentai.net','Accept':'application/json'}});if(!r.ok)throw new Error('HTTP '+r.status);return JSON.parse(r.data);}
  _m(g){if(!g)return null;const title=(g.title&&(g.title.english||g.title.pretty||g.title.japanese))||'Unknown';const cover=g.images&&g.images.cover?'https://t.nhentai.net/galleries/'+g.media_id+'/cover.'+({1:'jpg',2:'png',3:'gif'}[g.images.cover.t]||'jpg'):'';return new MangaItem({id:String(g.id),title,cover,status:'completed',genres:(g.tags||[]).filter(t=>t.type==='tag').map(t=>t.name)});}
  async getPopular(p){try{const d=await this._j('https://nhentai.net/api/galleries/all?page='+(p||1));if(d&&d.result)return d.result.map(g=>this._m(g)).filter(Boolean);return[];}catch(e){return[];}}
  async getLatest(p){return this.getPopular(p);}
  async search(q,p){if(!q)return this.getPopular(p);try{const d=await this._j('https://nhentai.net/api/galleries/search?query='+encodeURIComponent(q)+'&page='+(p||1));if(d&&d.result)return d.result.map(g=>this._m(g)).filter(Boolean);return[];}catch(e){return[];}}
  async getDetails(id){try{const d=await this._j('https://nhentai.net/api/gallery/'+id);if(d){const m=this._m(d);m.description='Pages: '+d.num_pages;return m;}return new MangaItem({id,title:id});}catch(e){return new MangaItem({id,title:id});}}
  async getChapters(id){return[new Chapter({id,title:'Read',number:1})];}
  async getPages(id,cid){
    try{
      const d=await this._j('https://nhentai.net/api/gallery/'+id);
      if(!d||!d.images||!d.images.pages)throw new Error('No pages');
      const exts={1:'jpg',2:'png',3:'gif'};
      return d.images.pages.map((p,i)=>({number:i+1,url:'https://i.nhentai.net/galleries/'+d.media_id+'/'+(i+1)+'.'+( exts[p.t]||'jpg')}));
    }catch(e){throw new Error('Pages: '+e.message);}
  }
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('nhentai'))ExtManager.register(new _Src());
})();
