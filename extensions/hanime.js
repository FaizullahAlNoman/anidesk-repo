// ==AniDeskExtension==
// @name         Hanime.tv
// @id           hanime
// @type         anime
// @lang         en
// @baseUrl      https://hanime.tv
// @version      1.0
// @nsfw         true
// ==/AniDeskExtension==
(function(){
class _Src extends AnimeSource {
  constructor(){super({id:'hanime',name:'Hanime.tv',lang:'en',baseUrl:'https://hanime.tv',icon:'🔞',version:'1.0',nsfw:true});}
  async _get(path){const r=await $.fetch('https://hanime.tv/api/v8'+path,{headers:{'X-Signature-Version':'web2','Accept':'application/json','Referer':'https://hanime.tv'}});if(!r.ok)throw new Error('HTTP '+r.status);return JSON.parse(r.data);}
  async getPopular(p){try{const d=await this._get('/browse_home/home_rows?hentai_tags=1');const vids=d&&(d.hentai_videos||d.featured_playlist_hentai_videos||[]);return vids.slice(0,20).map(v=>new AnimeItem({id:String(v.slug||v.id),title:v.name||v.title||'',cover:v.cover_url||v.poster_url||'',status:'completed'}));}catch(e){return[];}}
  async getLatest(p){try{const d=await this._get('/browse?ordering=created_at_unix&page='+(p||1));const vids=d&&(d.hentai_videos||[]);return vids.map(v=>new AnimeItem({id:String(v.slug||v.id),title:v.name||'',cover:v.cover_url||'',status:'completed'}));}catch(e){return[];}}
  async search(q,p){try{const d=await this._get('/search?search='+encodeURIComponent(q||'')+'&page='+(p||1));const vids=d&&(d.hentai_videos||[]);return vids.map(v=>new AnimeItem({id:String(v.slug||v.id),title:v.name||'',cover:v.cover_url||'',status:'completed'}));}catch(e){return[];}}
  async getDetails(id){try{const d=await this._get('/video?id='+id);if(d&&d.hentai_video)return new AnimeItem({id,title:d.hentai_video.name||id,cover:d.hentai_video.cover_url||'',description:d.hentai_video.description||'',status:'completed'});return new AnimeItem({id,title:id});}catch(e){return new AnimeItem({id,title:id});}}
  async getEpisodes(id){return[new Episode({id:id,title:'Watch',number:1})];}
  async getVideos(id,eid){try{const d=await this._get('/video?id='+id);const streams=d&&d.videos_manifest&&d.videos_manifest.servers&&d.videos_manifest.servers[0]&&d.videos_manifest.servers[0].streams||[];return streams.map(s=>new VideoLink({url:s.url,quality:s.height?s.height+'p':'Auto',isM3U8:s.url&&s.url.includes('.m3u8')})).filter(v=>v.url);}catch(e){return[];}}
}
if(typeof ExtManager!=='undefined'&&!ExtManager.get('hanime'))ExtManager.register(new _Src());
})();
