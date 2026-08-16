import app,{PartnerReferrals}from"./founder-order-communications-v4.js";
export{PartnerReferrals};

const STORE="kaizuro-partner-submissions";
const FROM="notifications@portal.kaizuro.com";
const INFO="info@kaizuro.com";
const TEST_ORDER="KZO-B54E0ECF92";
const rid=p=>`${p}-${crypto.randomUUID().replace(/-/g,"").slice(0,10).toUpperCase()}`;
function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,t){try{return await db(env).listAll(t)}catch{return[]}}
async function save(env,r){return db(env).createSubmission({...r,createdAt:r.createdAt||new Date().toISOString()});}
async function send(env,to,subject,text){if(!env.PARTNER_NOTIFICATIONS)throw new Error("Email binding is not configured");return env.PARTNER_NOTIFICATIONS.send({to,from:{email:FROM,name:"KAIZURO"},replyTo:INFO,subject,text});}
function nums(product){const p=String(product||"").toUpperCase();if(p.includes("ASSAULT"))return{value:799,deposit:240,balance:559};if(p.includes("HALO"))return{value:999,deposit:300,balance:699};return null;}
async function smoke(env){
 if(String(env.SQUARE_ENVIRONMENT||"sandbox").toLowerCase()!=="sandbox")return{ok:false,error:"Sandbox only"};
 const sales=await all(env,"sale");
 const sale=sales.find(x=>String(x.orderId||"")===TEST_ORDER);
 if(!sale)return{ok:false,error:"Test order not found"};
 const n=nums(sale.product);if(!n)return{ok:false,error:"Unsupported product"};
 const mathsValid=Number(sale.amount||0)===n.value&&Number(sale.depositAmount||0)===n.deposit&&Number(sale.balanceOutstanding||0)===n.balance;
 const events=await all(env,"founder-email-event"),key=`release3-smoke:${sale.orderId}`;
 let emailStatus="already-sent";
 if(!events.some(x=>String(x.eventKey||"")===key)){
   const customer=`Hi ${sale.customerName||"Founder"},\n\nYour KAIZURO Founder 100 deposit has been received successfully.\n\nRod: ${sale.product}\nOrder: ${sale.orderId}\nDeposit received: $${n.deposit} AUD\nFounder order value: $${n.value} AUD\nBalance remaining: $${n.balance} AUD\n\nYour Founder allocation is now secured. No further payment is required until KAIZURO sends you a formal balance payment request.\n\nKAIZURO`;
   const internal=`Release 3 Sandbox verification.\n\nFounder deposit received.\nRod: ${sale.product}\nOrder: ${sale.orderId}\nDeposit: $${n.deposit} AUD\nBalance: $${n.balance} AUD\nPayment status: ${sale.paymentStatus||"Deposit Paid"}`;
   await send(env,sale.customerEmail,`KAIZURO Founder 100 deposit received · ${sale.product}`,customer);
   await send(env,INFO,`Founder deposit received · ${sale.product} · ${sale.orderId}`,internal);
   await save(env,{id:rid("KZMAIL"),type:"founder-email-event",partnerId:"network",eventKey:key,orderId:sale.orderId,customerId:sale.customerId||"",emailType:"Release 3 smoke deposit + internal",status:"Sent"});
   emailStatus="sent";
 }
 return{ok:mathsValid&&Boolean(sale.customerEmail),environment:"sandbox",orderRef:sale.orderId,product:sale.product,orderValue:n.value,deposit:n.deposit,balance:n.balance,mathsValid,emailBinding:Boolean(env.PARTNER_NOTIFICATIONS),customerEmailPresent:Boolean(sale.customerEmail),internalRecipientConfigured:true,emailStatus,balanceRequestSupported:Boolean(n)};
}
export default{async fetch(request,env,ctx){const u=new URL(request.url),path=u.pathname.replace(/\/$/,"")||"/";if(request.method==="GET"&&path==="/api/release3/smoke"&&u.searchParams.get("order")===TEST_ORDER){try{return new Response(JSON.stringify(await smoke(env)),{headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow,noarchive"}})}catch(e){return new Response(JSON.stringify({ok:false,error:String(e?.message||e)}),{status:500,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow,noarchive"}})}}return app.fetch(request,env,ctx)},async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx)}};