import app,{PartnerReferrals}from"./website-crm-ingestion-v4.js";
export{PartnerReferrals};

const STORE="kaizuro-partner-submissions";
const PUBLIC_HOSTS=new Set(["kaizuro.com","www.kaizuro.com"]);
const WEBHOOK_URL="https://kaizuro.com/api/square/webhook";
const API_VERSION="2026-07-15";
const text=(v,max=500)=>String(v||"").trim().slice(0,max);
const low=v=>String(v||"").trim().toLowerCase();
const mobile=v=>String(v||"").replace(/[^0-9+]/g,"").slice(0,40);
const rid=p=>`${p}-${crypto.randomUUID().replace(/-/g,"").slice(0,10).toUpperCase()}`;
function db(env){return env.PARTNER_REFERRALS.get(env.PARTNER_REFERRALS.idFromName(STORE));}
async function all(env,type){try{return await db(env).listAll(type)}catch{return[]}}
async function save(env,row){return db(env).createSubmission({...row,createdAt:row.createdAt||new Date().toISOString()});}
function squareBase(env){return String(env.SQUARE_ENVIRONMENT||"sandbox").toLowerCase()==="production"?"https://connect.squareup.com":"https://connect.squareupsandbox.com";}
function squareReady(env){return Boolean(String(env.SQUARE_ACCESS_TOKEN||"").trim()&&String(env.SQUARE_LOCATION_ID||"").trim()&&String(env.SQUARE_WEBHOOK_SIGNATURE_KEY||"").trim());}
function founderProduct(rod){
 const r=text(rod,120).toUpperCase();
 if(r.includes("ASSAULT"))return{product:"ASSAULT PE6-8",fullCents:79900,depositCents:24000};
 if(r.includes("HALO"))return{product:"HALO PE10-12",fullCents:99900,depositCents:30000};
 return null;
}
function bytesEqual(a,b){if(a.length!==b.length)return false;let n=0;for(let i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
async function squareSignature(body,key){
 const cryptoKey=await crypto.subtle.importKey("raw",new TextEncoder().encode(String(key)),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const sig=await crypto.subtle.sign("HMAC",cryptoKey,new TextEncoder().encode(WEBHOOK_URL+body));
 let binary="";for(const b of new Uint8Array(sig))binary+=String.fromCharCode(b);return btoa(binary);
}
async function createSquareCheckout(env,{customerId,name,email,phone,rod}){
 if(!String(env.SQUARE_ACCESS_TOKEN||"").trim())throw new Error("Square access token is not configured");
 if(!String(env.SQUARE_LOCATION_ID||"").trim())throw new Error("Square location is not configured");
 const product=founderProduct(rod);if(!product)throw new Error("Unknown Founder rod selection");
 const orderId=rid("KZO"),idempotencyKey=crypto.randomUUID(),returnUrl=`https://kaizuro.com/?founder_payment_return=1&order=${encodeURIComponent(orderId)}#founder-deposit`;
 const payload={idempotency_key:idempotencyKey,order:{location_id:String(env.SQUARE_LOCATION_ID),reference_id:orderId,line_items:[{name:`KAIZURO Founder 100 Deposit — ${product.product}`,quantity:"1",base_price_money:{amount:product.depositCents,currency:"AUD"}}]},checkout_options:{redirect_url:returnUrl},pre_populated_data:{buyer_email:email||undefined,buyer_phone_number:phone||undefined},payment_note:`KAIZURO ${customerId} · ${orderId} · Founder 100 deposit · ${product.product}`};
 const response=await fetch(`${squareBase(env)}/v2/online-checkout/payment-links`,{method:"POST",headers:{Authorization:`Bearer ${String(env.SQUARE_ACCESS_TOKEN)}`,"Content-Type":"application/json","Square-Version":API_VERSION},body:JSON.stringify(payload)});
 const out=await response.json().catch(()=>({}));
 if(!response.ok||!out?.payment_link?.url||!out?.payment_link?.order_id)throw new Error(out?.errors?.[0]?.detail||`Square checkout failed (${response.status})`);
 const createdAt=new Date().toISOString();
 const checkout={id:rid("KZSQCO"),type:"square-checkout",partnerId:"network",orderId,customerId,customerName:name,customerEmail:email,customerMobile:phone,product:product.product,amount:product.fullCents/100,depositAmount:product.depositCents/100,balanceOutstanding:(product.fullCents-product.depositCents)/100,currency:"AUD",paymentStatus:"Pending Deposit",source:"Founder 100",squareOrderId:out.payment_link.order_id,squarePaymentLinkId:out.payment_link.id||"",squareCheckoutUrl:out.payment_link.url,squareEnvironment:String(env.SQUARE_ENVIRONMENT||"sandbox").toLowerCase(),createdAt};
 await save(env,checkout);
 await save(env,{id:rid("KZCRM"),type:"crm-activity",partnerId:"network",customerId,customerName:name,customerEmail:email,customerMobile:phone,entityType:"Customer",entityRef:customerId,relatedRef:orderId,channel:"Square",direction:"Outbound",subject:"Founder 100 Square checkout created",notes:`${product.product} · Deposit ${(product.depositCents/100).toFixed(2)} AUD · Order ${orderId}`,outcome:"Pending Deposit",owner:"KAIZURO Website",createdAt});
 return checkout;
}
async function founderWithSquare(request,env,ctx){
 const clone=request.clone();let form;try{form=await clone.formData()}catch{return app.fetch(request,env,ctx)}
 const base=await app.fetch(request,env,ctx);
 if(base.status<300||base.status>=400)return base;
 const location=base.headers.get("Location")||"";let customerId="";try{customerId=new URL(location,new URL(request.url)).searchParams.get("founder_submitted")||""}catch{}
 if(!customerId)return base;
 const input={customerId,name:text(form.get("Full name"),140),email:low(form.get("Email")).slice(0,254),phone:mobile(form.get("Phone")),rod:text(form.get("Preferred rod"),120)};
 try{const checkout=await createSquareCheckout(env,input);return Response.redirect(checkout.squareCheckoutUrl,303)}catch(e){
  const url=new URL("/",request.url);url.searchParams.set("founder_submitted",customerId);url.searchParams.set("square_error",text(e?.message||"Square checkout could not be created",180));url.hash="founder-deposit";return Response.redirect(url.toString(),303);
 }
}
async function processCompletedPayment(env,payment){
 const squareOrderId=text(payment?.order_id,160),paymentId=text(payment?.id,160);if(!squareOrderId||!paymentId)return;
 const checkout=(await all(env,"square-checkout")).find(x=>String(x.squareOrderId||"")===squareOrderId);if(!checkout)return;
 const existing=(await all(env,"sale")).find(x=>String(x.squarePaymentId||"")===paymentId||String(x.squareOrderId||"")===squareOrderId);if(existing)return;
 const depositPaid=Number(payment?.amount_money?.amount||0)/100||Number(checkout.depositAmount||0),createdAt=new Date().toISOString();
 await save(env,{id:rid("KZSALE"),type:"sale",partnerId:"",partnerName:"",customerId:checkout.customerId,customerName:checkout.customerName,customerEmail:checkout.customerEmail,customerMobile:checkout.customerMobile,orderId:checkout.orderId,externalEventId:paymentId,product:checkout.product,quantity:1,amount:Number(checkout.amount||0),currency:"AUD",depositAmount:depositPaid,balanceOutstanding:Math.max(0,Number(checkout.amount||0)-depositPaid),paymentStatus:"Deposit Paid",fulfilmentStatus:"Founder Allocation",source:"Website / Square",channel:"Retail",campaign:"Founder 100",squareOrderId,squarePaymentId:paymentId,squareReceiptUrl:text(payment?.receipt_url,1000),squareStatus:text(payment?.status,60),paidAt:text(payment?.updated_at||payment?.created_at,80),createdAt});
 await save(env,{id:rid("KZCRM"),type:"crm-activity",partnerId:"network",customerId:checkout.customerId,customerName:checkout.customerName,customerEmail:checkout.customerEmail,customerMobile:checkout.customerMobile,entityType:"Customer",entityRef:checkout.customerId,relatedRef:checkout.orderId,channel:"Square",direction:"Inbound",subject:"Founder 100 deposit paid",notes:`${checkout.product} · Deposit ${depositPaid.toFixed(2)} AUD · Order ${checkout.orderId}`,outcome:"Deposit Paid",owner:"KAIZURO Admin",createdAt});
}
async function webhook(request,env){
 if(!String(env.SQUARE_WEBHOOK_SIGNATURE_KEY||"").trim())return new Response("Webhook signature key not configured",{status:503});
 const raw=await request.text(),received=request.headers.get("x-square-hmacsha256-signature")||"";if(!received)return new Response("Missing signature",{status:403});
 const expected=await squareSignature(raw,env.SQUARE_WEBHOOK_SIGNATURE_KEY);if(!bytesEqual(received,expected))return new Response("Invalid signature",{status:403});
 let event;try{event=JSON.parse(raw)}catch{return new Response("Invalid JSON",{status:400})}
 const eventId=text(event?.event_id,180);if(eventId&&(await all(env,"square-webhook-event")).some(x=>String(x.eventId||x.id||"")===eventId))return new Response("OK",{status:200});
 const payment=event?.data?.object?.payment;if((event?.type==="payment.created"||event?.type==="payment.updated")&&payment?.status==="COMPLETED")await processCompletedPayment(env,payment);
 if(eventId)await save(env,{id:rid("KZSQEV"),type:"square-webhook-event",partnerId:"network",eventId,eventType:text(event?.type,100),squareMerchantId:text(event?.merchant_id,160),squarePaymentId:text(payment?.id,160),squareOrderId:text(payment?.order_id,160),paymentStatus:text(payment?.status,60),createdAt:new Date().toISOString()});
 return new Response("OK",{status:200,headers:{"Cache-Control":"no-store"}});
}
function decorateSquareReturn(response,url){
 const returned=url.searchParams.get("founder_payment_return"),squareError=url.searchParams.get("square_error");if(!returned&&!squareError)return response;
 const markup=returned?'<div class="kz-founder-square-note" role="status"><b>Square checkout returned.</b><br>If your Sandbox payment completed successfully, KAIZURO will confirm the deposit automatically from Square.</div>':`<div class="kz-founder-square-error" role="alert"><b>Founder details were saved, but Square checkout was not created.</b><br>${String(squareError||"").replace(/[<>]/g,"")}</div>`;
 const css='<style id="kz-square-founder-v4">.kz-founder-square-note,.kz-founder-square-error{grid-column:1/-1;margin:0 0 22px;padding:15px 17px;font-size:12px;line-height:1.55}.kz-founder-square-note{border:1px solid #789d82;background:#e9f2eb;color:#214f30}.kz-founder-square-error{border:1px solid #b98d8d;background:#f4e8e8;color:#713838}</style>';
 return new HTMLRewriter().on("head",{element:e=>e.append(css,{html:true})}).on("form.founder-form",{element:e=>e.prepend(markup,{html:true})}).transform(response);
}
export default{async fetch(request,env,ctx){
 const url=new URL(request.url),host=url.hostname.toLowerCase(),path=url.pathname.replace(/\/$/,"")||"/";
 if(request.method==="GET"&&PUBLIC_HOSTS.has(host)&&path==="/api/square/status")return new Response(JSON.stringify({ok:true,environment:String(env.SQUARE_ENVIRONMENT||"sandbox").toLowerCase(),configured:squareReady(env),accessToken:Boolean(env.SQUARE_ACCESS_TOKEN),location:Boolean(env.SQUARE_LOCATION_ID),webhookSignature:Boolean(env.SQUARE_WEBHOOK_SIGNATURE_KEY)}),{headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow,noarchive"}});
 if(request.method==="POST"&&PUBLIC_HOSTS.has(host)&&path==="/api/square/webhook")return webhook(request,env);
 if(request.method==="POST"&&PUBLIC_HOSTS.has(host)&&path==="/api/crm/founder")return founderWithSquare(request,env,ctx);
 const response=await app.fetch(request,env,ctx);if(request.method==="GET"&&PUBLIC_HOSTS.has(host)&&path==="/"&&response.status===200&&(response.headers.get("Content-Type")||"").includes("text/html"))return decorateSquareReturn(response,url);return response;
},async email(message,env,ctx){if(typeof app.email==="function")return app.email(message,env,ctx)}};