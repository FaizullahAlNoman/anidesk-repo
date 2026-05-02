// ==AniDeskExtension==
// @name         AllAnime
// @id           allanime
// @type         anime
// @lang         en
// @baseUrl      https://allmanga.to
// @version      1.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
class _Src extends AnimeSource {
  constructor(){super({id:'allanime',name:'AllAnime',lang:'en',baseUrl:'https://allmanga.to',icon:'🎬',version:'1.0'});this._g='https://api.allanime.day/api';}
  async _q(query,vars){try{const r=await $.fetch(this._g+'?variables='+encodeURIComponent(JSON.stringify(vars||{}))+'&query='+encodeURIComponent(query),{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://allanime.to'}});if(r.status===200&&r.data)return JSON.parse(r.data);}catch(e){}return null;}
  _m(s){if(!s)return null;return new AnimeItem({id:s._id,title:s.name||s.englishName||'',cover:s.thumbnail||'',status:(s.status||'Ongoing').toLowerCase(),genres:s.genres||[]});}
  async getPopular(p){p=p||1;const d=await this._q('query($p:Int){shows(input:{page:$p,sortBy:"Top",isManga:false}){edges{_id name englishName thumbnail genres status}}}',{p});if(d&&d.data&&d.data.shows)return d.data.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}
  async getLatest(p){p=p||1;const d=await this._q('query($p:Int){shows(input:{page:$p,sortBy:"Recent",isManga:false}){edges{_id name englishName thumbnail genres status}}}',{p});if(d&&d.data&&d.data.shows)return d.data.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}
  async search(q,p){if(!q)return this.getPopular(p);const d=await this._q('query($q:String,$p:Int){shows(input:{search:{query:$q},page:$p,isManga:false}){edges{_id name englishName thumbnail genres status}}}',{q,p:p||1});if(d&&d.data&&d.data.shows)return d.data.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}
  async getDetails(id){const d=await this._q('query($id:String!){show(_id:$id){_id name englishName thumbnail description genres status}}',{id});if(d&&d.data&&d.data.show)return this._m(d.data.show)||new AnimeItem({id,title:id});return new AnimeItem({id,title:id});}
  async getEpisodes(id){const d=await this._q('query($id:String!){show(_id:$id){availableEpisodes{sub}}}',{id});if(!d||!d.data||!d.data.show)return[];const n=(d.data.show.availableEpisodes&&d.data.show.availableEpisodes.sub)||0;const eps=[];for(let i=1;i<=Math.min(n,500);i++)eps.push(new Episode({id:id+'__'+i,title:'Episode '+i,number:i}));return eps;}
  async getVideos(id,eid){const pts=eid.split('__');const sid=pts[0],en=pts[1]||'1';const d=await this._q('query($id:String!,$ep:String!,$t:VaildTranslationTypeEnumType!){episode(showId:$id,episodeString:$ep,translationType:$t){sourceUrls}}',{id:sid,ep:en,t:'sub'});if(d&&d.data&&d.data.episode&&d.data.episode.sourceUrls)return d.data.episode.sourceUrls.map((u,i)=>new VideoLink({url:typeof u==='string'?u:(u.sourceUrl||''),quality:'Source '+(i+1)})).filter(v=>v.url);return[];}
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('allanime'))ExtManager.register(new _Src());
})();
