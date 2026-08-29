import app,{PartnerReferrals}from"./admin-partnerships-v1.js";
import publicSite from"./public.js";
export{PartnerReferrals};

const APEX="kaizuro.com";
const WWW="www.kaizuro.com";
const PUBLIC_HOSTS=new Set([APEX,WWW]);

function canonicalRedirect(url){
  const target=new URL(url.toString());
  target.protocol="https:";
  target.hostname=APEX;
  target.port="";
  if(target.pathname==="/index.html")target.pathname="/";
  return new Response(null,{status:301,headers:{Location:target.toString(),"Cache-Control":"public, max-age=3600","X-Robots-Tag":"all"}});
}

function publicRequest(request,url){
  const target=new URL(request.url);
  target.protocol="https:";
  target.hostname=APEX;
  target.port="";
  if(target.pathname==="/index.html")target.pathname="/";
  return new Request(target.toString(),request);
}

export default{
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const host=url.hostname.toLowerCase();
    if(PUBLIC_HOSTS.has(host)&&(request.method==="GET"||request.method==="HEAD")){
      if(url.protocol!=="https:"||host===WWW||url.pathname==="/index.html")return canonicalRedirect(url);
      if(host===APEX&&url.pathname==="/"){
        const response=await publicSite.fetch(publicRequest(request,url),env,ctx);
        const headers=new Headers(response.headers);
        headers.delete("WWW-Authenticate");
        headers.set("X-KAIZURO-Public","homepage");
        headers.set("X-Robots-Tag","all");
        return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
      }
    }
    return app.fetch(request,env,ctx);
  },
  async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx)}
};
