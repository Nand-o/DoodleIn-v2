const l=document.querySelector("header"),p=document.querySelector("#about-section"),h=document.querySelector(".logo"),g={root:null,threshold:.3};h.addEventListener("click",()=>{window.location.href="/"});const v=new IntersectionObserver(function(e,c){e.forEach(n=>{n.isIntersecting?l.classList.add("header-inverted"):l.classList.remove("header-inverted")})},g);v.observe(p);async function u(){try{const e=document.querySelector(".gallery-track");if(!e)return;const c=e.getAttribute("data-max"),n=c?parseInt(c,10):1/0,s=await fetch("/api/products");if(!s.ok){console.error("Failed to load products from API");return}const d=await s.json(),m=d.products||d||[];e.innerHTML="";const i=m.slice(0,n);i.forEach(r=>{const a=r.image||"",t=document.createElement("div");t.className="product-item",t.innerHTML=`
                <img src="${a}" alt="${o(r.name||"")}" />
                <div class="product-desc">
                    <h2>${o(r.name||"")}</h2>
                    <p>$${o(r.price||"")}</p>
                </div>
                <a href="/orders" class="card-order-button">Order Now</a>
            `,e.appendChild(t)}),i.forEach(r=>{const a=r.image||"",t=document.createElement("div");t.className="product-item",t.innerHTML=`
                <img src="${a}" alt="${o(r.name||"")}" />
                <div class="product-desc">
                    <h2>${o(r.name||"")}</h2>
                    <p>$${o(r.price||"")}</p>
                </div>
                <a href="/orders" class="card-order-button">Order Now</a>
            `,e.appendChild(t)})}catch(e){console.error("Failed to render home gallery",e)}}function o(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",u):u();
