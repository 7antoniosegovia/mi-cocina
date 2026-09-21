const KEY="mi-cocina-data-v2";
const defaultData={shopping:[],recipes:[]};
let data=load(), currentTab="shopping", recipeSearch="";

function load(){try{return JSON.parse(localStorage.getItem(KEY))||structuredClone(defaultData)}catch{return structuredClone(defaultData)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function render(){
 document.getElementById("pageTitle").textContent={shopping:"Compra",recipes:"Recetas",settings:"Ajustes"}[currentTab];
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===currentTab));
 document.getElementById("addButton").style.display=currentTab==="settings"?"none":"block";
 document.getElementById("content").innerHTML=currentTab==="shopping"?shoppingView():currentTab==="recipes"?recipesView():settingsView();
}
function shoppingView(){
 const active=data.shopping.filter(x=>!x.done),done=data.shopping.filter(x=>x.done);
 return `<div class="section-title"><h2>Lista de la compra</h2><span class="muted">${active.length} pendientes</span></div>
 <div class="card">${active.length?active.map(itemRow).join(""):`<div class="empty"><div class="emoji">🛒</div>Tu lista está vacía.</div>`}</div>
 ${done.length?`<div class="section-title"><h2>Comprado</h2><button class="small-button" onclick="clearDone()">Borrar</button></div><div class="card">${done.map(itemRow).join("")}</div>`:""}`;
}
function itemRow(i){return `<div class="row"><button class="check ${i.done?"checked":""}" onclick="toggleItem('${i.id}')"></button><div class="item-name ${i.done?"done":""}">${esc(i.name)}</div><div class="row-actions"><button class="small-button" onclick="editItem('${i.id}')">Editar</button><button class="small-button" onclick="deleteItem('${i.id}')">×</button></div></div>`}
function recipesView(){
 const list=data.recipes.filter(r=>(r.name+" "+r.ingredients.join(" ")).toLowerCase().includes(recipeSearch.toLowerCase()));
 return `<input class="search" placeholder="Buscar recetas..." value="${esc(recipeSearch)}" oninput="recipeSearch=this.value;render()"><div class="section-title"><h2>Mis recetas</h2><span class="muted">${data.recipes.length}</span></div>${list.length?list.map(recipeCard).join(""):`<div class="empty"><div class="emoji">🍳</div>No hay recetas.</div>`}`;
}
function recipeCard(r){return `<div class="card recipe-card"><div class="recipe-head"><div class="recipe-emoji">${esc(r.emoji||"🍳")}</div><div class="recipe-info"><h3>${esc(r.name)}</h3><p>${esc(r.time||"Sin tiempo")} · ${r.ingredients.length} ingredientes</p></div></div><div class="recipe-actions"><button class="primary" onclick="viewRecipe('${r.id}')">Ver receta</button><button class="secondary" onclick="editRecipe('${r.id}')">Editar</button></div></div>`}
function settingsView(){
 return `<div class="section-title"><h2>Datos</h2></div><div class="card">
 <div class="setting-row"><span class="setting-icon">📤</span><div class="setting-copy"><strong>Exportar copia</strong><span>Guarda todas tus recetas y compras en un JSON.</span></div><button class="secondary" onclick="exportData()">Exportar</button></div>
 <div class="setting-row"><span class="setting-icon">📥</span><div class="setting-copy"><strong>Importar copia</strong><span>Restaura una copia anterior.</span></div><button class="secondary" onclick="document.getElementById('fileInput').click()">Importar</button></div>
 <div class="setting-row"><span class="setting-icon">🗑️</span><div class="setting-copy"><strong>Borrar todos los datos</strong><span>Esta acción no se puede deshacer.</span></div><button class="danger" onclick="resetData()">Borrar</button></div>
 </div>
 <input id="fileInput" type="file" accept="application/json,.json" style="display:none" onchange="importData(event)">
 <div class="section-title"><h2>Sobre la app</h2></div><div class="card"><div style="padding:16px;color:#666;font-size:14px;line-height:1.5">Los datos se guardan localmente en este iPhone. La exportación crea una copia independiente que puedes guardar en Archivos o iCloud Drive.</div></div>`;
}
function openSheet(html){document.getElementById("sheetContent").innerHTML=html;document.getElementById("sheet").classList.remove("hidden");document.getElementById("sheetBackdrop").classList.remove("hidden")}
function closeSheet(){document.getElementById("sheet").classList.add("hidden");document.getElementById("sheetBackdrop").classList.add("hidden")}
function addItem(){openSheet(`<h2>Añadir a la compra</h2><label>Producto</label><input id="newItem" placeholder="Ej. Leche" autofocus><div class="form-actions"><button class="secondary" onclick="closeSheet()">Cancelar</button><button class="primary" onclick="saveItem()">Añadir</button></div>`)}
function saveItem(){const n=document.getElementById("newItem").value.trim();if(!n)return;data.shopping.push({id:crypto.randomUUID(),name:n,done:false});save();closeSheet();render();toast("Añadido")}
function editItem(id){const i=data.shopping.find(x=>x.id===id);openSheet(`<h2>Editar producto</h2><label>Producto</label><input id="editItem" value="${esc(i.name)}"><div class="form-actions"><button class="secondary" onclick="closeSheet()">Cancelar</button><button class="primary" onclick="saveEditedItem('${id}')">Guardar</button></div>`)}
function saveEditedItem(id){const n=document.getElementById("editItem").value.trim();if(!n)return;data.shopping.find(x=>x.id===id).name=n;save();closeSheet();render()}
function toggleItem(id){const i=data.shopping.find(x=>x.id===id);i.done=!i.done;save();render()}
function deleteItem(id){data.shopping=data.shopping.filter(x=>x.id!==id);save();render()}
function clearDone(){data.shopping=data.shopping.filter(x=>!x.done);save();render()}
function addRecipe(){openSheet(recipeForm())}
function recipeForm(r={}){return `<h2>${r.id?"Editar receta":"Nueva receta"}</h2><label>Nombre</label><input id="rName" value="${esc(r.name||"")}" placeholder="Ej. Curry de pollo"><label>Emoji</label><input id="rEmoji" value="${esc(r.emoji||"🍳")}" maxlength="2"><label>Tiempo</label><input id="rTime" value="${esc(r.time||"")}" placeholder="Ej. 30 min"><label>Ingredientes (uno por línea)</label><textarea id="rIngredients" placeholder="400 g pollo\n1 cebolla\n200 ml leche de coco">${esc((r.ingredients||[]).join("\n"))}</textarea><label>Preparación</label><textarea id="rSteps" placeholder="Explica los pasos...">${esc(r.steps||"")}</textarea><div class="form-actions"><button class="secondary" onclick="closeSheet()">Cancelar</button><button class="primary" onclick="saveRecipe('${r.id||""}')">Guardar</button></div>`}
function saveRecipe(id){const r={id:id||crypto.randomUUID(),name:document.getElementById("rName").value.trim(),emoji:document.getElementById("rEmoji").value.trim()||"🍳",time:document.getElementById("rTime").value.trim(),ingredients:document.getElementById("rIngredients").value.split("\n").map(x=>x.trim()).filter(Boolean),steps:document.getElementById("rSteps").value.trim()};if(!r.name)return;if(id)data.recipes=data.recipes.map(x=>x.id===id?r:x);else data.recipes.push(r);save();closeSheet();render();toast("Guardado")}
function viewRecipe(id){const r=data.recipes.find(x=>x.id===id);openSheet(`<div class="detail"><h2>${esc(r.emoji||"🍳")} ${esc(r.name)}</h2><div class="meta">${esc(r.time||"Tiempo no indicado")}</div><h3>Ingredientes</h3><ul>${r.ingredients.map(i=>`<li>${esc(i)}</li>`).join("")}</ul><h3>Preparación</h3><p>${esc(r.steps||"Sin preparación indicada.").replace(/\n/g,"<br>")}</p><div class="form-actions"><button class="secondary" onclick="editRecipe('${r.id}')">Editar</button><button class="primary" onclick="addRecipeIngredients('${r.id}')">Añadir a compra</button></div></div>`)}
function editRecipe(id){openSheet(recipeForm(data.recipes.find(x=>x.id===id)))}
function addRecipeIngredients(id){const r=data.recipes.find(x=>x.id===id),names=new Set(data.shopping.map(x=>x.name.toLowerCase()));let n=0;r.ingredients.forEach(i=>{if(!names.has(i.toLowerCase())){data.shopping.push({id:crypto.randomUUID(),name:i,done:false});names.add(i.toLowerCase());n++}});save();closeSheet();toast(`${n} ingrediente${n===1?"":"s"} añadido${n===1?"":"s"}`)}
function exportData(){const payload={app:"Mi Cocina",version:2,exportedAt:new Date().toISOString(),data};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`mi-cocina-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);toast("Copia preparada")}
function importData(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const x=JSON.parse(reader.result);if(!x.data||!Array.isArray(x.data.shopping)||!Array.isArray(x.data.recipes))throw Error();data=x.data;save();render();toast("Copia restaurada")}catch{alert("El archivo no parece una copia válida de Mi Cocina.")}e.target.value=""};reader.readAsText(file)}
function resetData(){if(confirm("¿Borrar todas las recetas y la lista?")){data=structuredClone(defaultData);save();render();toast("Datos borrados")}}
function toast(m){const e=document.createElement("div");e.className="toast";e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),1600)}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{currentTab=b.dataset.tab;render()}));
document.getElementById("addButton").addEventListener("click",()=>currentTab==="shopping"?addItem():addRecipe());
document.getElementById("sheetBackdrop").addEventListener("click",closeSheet);
render();
