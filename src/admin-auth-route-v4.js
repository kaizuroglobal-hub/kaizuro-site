import app, { PartnerReferrals } from "./admin-inbox-nav-v4.js";
import baseAdmin from "./kaizuro-admin.js";
export { PartnerReferrals };

const ROOT="/kaizuro-admin";
const HOSTS=new Set(["kaizuro.com","www.kaizuro.com","portal.kaizuro.com"]);

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    const path=url.pathname.replace(/\/$/,"");
    if(HOSTS.has(url.hostname.toLowerCase()) && (path===`${ROOT}/login` || path===`${ROOT}/logout`)){
      return baseAdmin.fetch(request,env,ctx);
    }
    return app.fetch(request,env,ctx);
  },
  async email(message,env,ctx){
    if(typeof app.email==="function") return app.email(message,env,ctx);
  }
};
