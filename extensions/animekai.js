// ==AniDeskExtension==
// @name         AnimeKai
// @id           animekai
// @type         anime
// @lang         en
// @baseUrl      https://animekai.to
// @version      2.0
// @nsfw         false
// ==/AniDeskExtension==
(function(){
// AnimeKai — uses AllAnime GraphQL as reliable backend
class _Src extends AnimeSource {
  constructor(){super({id:'animekai',name:'AnimeKai',lang:'en',baseUrl:'https://animekai.to',icon:'⚡',version:'2.0',description:'AnimeKai - powered by AllAnime backend'});}
  async _q(query,vars){
    const r=await $.fetch('https://api.allanime.day/api?variables='+encodeURIComponent(JSON.stringify(vars||{}))+'&query='+encodeURIComponent(query),{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://allanime.to'}});
    if(r.status===200&&r.data)return JSON.parse(r.data);return null;
  }
  _m(s){if(!s)return null;return new AnimeItem({id:s._id,title:s.name||s.englishName||'',cover:s.thumbnail||'',status:(s.status||'Ongoing').toLowerCase(),genres:s.genres||[]});}
  async getPopular(p){p=p||1;const d=await this._q('query($p:Int){shows(input:{page:$p,sortBy:"Top",isManga:false}){edges{_id name englishName thumbnail genres status}}}',{p});if(d&&d.data&&d.data.shows)return d.data.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}
  async getLatest(p){p=p||1;const d=await this._q('query($p:Int){shows(input:{page:$p,sortBy:"Recent",isManga:false}){edges{_id name englishName thumbnail genres status}}}',{p});if(d&&d.data&&d.data.shows)return d.data.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}
  async search(q,p){if(!q)return this.getPopular(p);const d=await this._q('query($q:String,$p:Int){shows(input:{search:{query:$q},page:$p,isManga:false}){edges{_id name englishName thumbnail genres status}}}',{q,p:p||1});if(d&&d.data&&d.data.shows)return d.data.shows.edges.map(s=>this._m(s)).filter(Boolean);return[];}
  async getDetails(id){const d=await this._q('query($id:String!){show(_id:$id){_id name englishName thumbnail description genres status}}',{id});if(d&&d.data&&d.data.show)return this._m(d.data.show)||new AnimeItem({id,title:id});return new AnimeItem({id,title:id});}
  async getEpisodes(id){const d=await this._q('query($id:String!){show(_id:$id){availableEpisodes{sub}}}',{id});if(!d||!d.data||!d.data.show)return[];const n=(d.data.show.availableEpisodes&&d.data.show.availableEpisodes.sub)||0;const eps=[];for(let i=1;i<=Math.min(n,2000);i++)eps.push(new Episode({id:id+'__'+i,title:'Episode '+i,number:i}));return eps;}
  async getVideos(id,eid){
    const pts=eid.split('__');const sid=pts[0],en=pts[1]||'1';
    const d=await this._q('query($id:String!,$ep:String!,$t:VaildTranslationTypeEnumType!){episode(showId:$id,episodeString:$ep,translationType:$t){sourceUrls}}',{id:sid,ep:en,t:'sub'});
    if(!d||!d.data||!d.data.episode||!d.data.episode.sourceUrls)return[];
    const links=[];
    for(const src of d.data.episode.sourceUrls){
      try{
        let raw=typeof src==='string'?src:(src.sourceUrl||src.url||'');
        if(!raw)continue;
        raw=raw.replace(/^--gg--|^--ani--|^--s--|^--a--/,'');
        if(raw.startsWith('clock://')){raw='https://'+raw.slice(8);}
        if(raw.includes('.ebb.lat/')||raw.includes('/clock')){
          try{
            const cr=await $.fetch(raw,{headers:{'User-Agent':'Mozilla/5.0','Referer':'https://allanime.to'}});
            if(cr.status===200&&cr.data){const cd=JSON.parse(cr.data);if(cd.links&&cd.links.length){for(const l of cd.links){const url=l.link||l.url||'';if(url&&url.startsWith('http'))links.push(new VideoLink({url,quality:l.resolutionStr||'Auto',isM3U8:url.includes('.m3u8')}));}continue;}}
          }catch(e){}
        }
        if(raw.startsWith('http')&&(raw.includes('.m3u8')||raw.includes('.mp4')))links.push(new VideoLink({url:raw,quality:'Auto',isM3U8:raw.includes('.m3u8')}));
      }catch(e){}
    }
    return links.filter(l=>l.url&&l.url.startsWith('http'));
  }
}
if(typeof ExtManager!=='undefined')ExtManager.register(new _Src());
})();
