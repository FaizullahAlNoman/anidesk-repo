// ==AniDeskExtension==
// @name         AllManga
// @id           allmangatv
// @type         manga
// @lang         en
// @baseUrl      https://allmanga.to
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends MangaSource {
  constructor(){super({id:'allmangatv',name:'AllManga',lang:'en',baseUrl:'https://allmanga.to',icon:'🌏',version:'1.0'});}
  async _q(query,vars){const r=await $.fetch('https://api.allanime.day/api?variables='+encodeURIComponent(JSON.stringify(vars||{}))+'&query='+encodeURIComponent(query),{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://allmanga.to'}});if(!r.ok)throw new Error('HTTP '+r.status);const d=JSON.parse(r.data);if(d.errors)throw new Error(d.errors[0].message);return d.data;}
  _m(s){return new MangaItem({id:s._id,title:s.name||s.englishName||'',cover:s.thumbnail||'',status:(s.status||'ongoing').toLowerCase(),genres:s.genres||[]});}
  async getPopular(p){try{const d=await this._q('query($p:Int){shows(input:{page:$p,sortBy:"Top",isManga:true}){edges{_id name englishName thumbnail genres status}}}',{p:p||1});if(d&&d.shows)return d.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}catch(e){return[];}}
  async getLatest(p){try{const d=await this._q('query($p:Int){shows(input:{page:$p,sortBy:"Recent",isManga:true}){edges{_id name englishName thumbnail genres status}}}',{p:p||1});if(d&&d.shows)return d.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}catch(e){return[];}}
  async search(q,p){if(!q)return this.getPopular(p);try{const d=await this._q('query($q:String,$p:Int){shows(input:{search:{query:$q},page:$p,isManga:true}){edges{_id name englishName thumbnail genres status}}}',{q,p:p||1});if(d&&d.shows)return d.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}catch(e){return[];}}
  async getDetails(id){try{const d=await this._q('query($id:String!){show(_id:$id){_id name englishName thumbnail description genres status}}',{id});if(d&&d.show)return this._m(d.show)||new MangaItem({id,title:id});return new MangaItem({id,title:id});}catch(e){return new MangaItem({id,title:id});}}
  async getChapters(id){try{const d=await this._q('query($id:String!){show(_id:$id){availableChaptersByCh{lang chapterString}}}',{id});if(!d||!d.show)return[];const chs=[];(d.show.availableChaptersByCh||[]).filter(c=>c.lang==='en').forEach(c=>{const num=parseFloat(c.chapterString)||0;chs.push(new Chapter({id:id+'__'+c.chapterString,title:'Chapter '+c.chapterString,number:num}));});return chs.sort((a,b)=>b.number-a.number);}catch(e){return[];}}
  async getPages(id,cid){try{const parts=cid.split('__');const sid=parts[0],ch=parts[1]||'1';const d=await this._q('query($id:String!,$ch:String!,$t:VaildTranslationTypeEnumType!){chapterPages(showId:$id,chapterString:$ch,translationType:$t){url}}',{id:sid,ch,t:'en'});if(d&&d.chapterPages)return d.chapterPages.map((p,i)=>({number:i+1,url:p.url}));return[];}catch(e){throw new Error('Pages: '+e.message);}}
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('allmangatv'))ExtManager.register(new _Src());
})();
