let libraryConnection,importBusy=false,importMessage='';
function libraryDB(){
 if(!libraryConnection)libraryConnection=new Promise((resolve,reject)=>{
  const request=indexedDB.open('kive-books:'+location.pathname,1);
  request.onupgradeneeded=()=>{for(const key of ['books','pages'])request.result.createObjectStore(key,{keyPath:'id'})};
  request.onerror=()=>{libraryConnection=null;reject(request.error)};request.onsuccess=()=>resolve(request.result);
 });return libraryConnection;
}
async function bookQuery(store,key){
 const db=await libraryDB();return new Promise((resolve,reject)=>{
  const table=db.transaction(store).objectStore(store),request=key===undefined?table.getAll():table.get(key);
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 });
}
async function storeBook(book,pages){
 const db=await libraryDB();return new Promise((resolve,reject)=>{
  const tx=db.transaction(pages?['books','pages']:['books'],'readwrite');
  tx.objectStore('books').put(book);if(pages)tx.objectStore('pages').put({id:book.id,pages});
  tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);
 });
}
function relativeEntry(base,reference){
 if(!reference||/^[a-z][a-z\d+.-]*:|^\/\//i.test(reference))return '';
 try{const url=new URL(reference,'https://epub.invalid/'+base);return url.origin==='https://epub.invalid'?decodeURIComponent(url.pathname.slice(1)):''}catch{return ''}
}
function xmlDoc(content){const doc=new DOMParser().parseFromString(content,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('El EPUB contiene un documento ilegible.');return doc}
const xmlItems=(parent,tag)=>Array.from(parent.getElementsByTagNameNS('*',tag));
async function parseBook(file){
 if(file.size>60*1024*1024)throw Error('El límite es de 60 MB por libro.');
 const buffer=await file.arrayBuffer(),zip=await JSZip.loadAsync(buffer);
 const files=Object.values(zip.files);if(files.some(entry=>entry._data?.uncompressedSize>24*1024*1024)||files.reduce((sum,entry)=>sum+(entry._data?.uncompressedSize||0),0)>160*1024*1024)throw Error('El contenido descomprimido supera el límite del lector.');
 async function xml(path){const entry=zip.file(path);if(!entry)throw Error('Falta un documento necesario del EPUB.');return xmlDoc(await entry.async('string'))}
 const container=await xml('META-INF/container.xml'),opf=xmlItems(container,'rootfile')[0]?.getAttribute('full-path'),pkg=await xml(opf);
 const metadata=xmlItems(pkg,'metadata')[0]||pkg,meta=tag=>xmlItems(metadata,tag)[0]?.textContent.trim()||'';
 const title=meta('title')||file.name.replace(/\.epub$/i,''),author=xmlItems(metadata,'creator').map(item=>item.textContent.trim()).join(', ')||'Autor sin indicar';
 const description=meta('description').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
 const manifest=new Map(),assets=new Map();
 for(const item of xmlItems(pkg,'item')){
  const path=relativeEntry(opf,item.getAttribute('href')),resource={path,type:item.getAttribute('media-type'),properties:item.getAttribute('properties')||''};
  manifest.set(item.getAttribute('id'),resource);assets.set(path,resource);
 }
 const encrypted=zip.file('META-INF/encryption.xml');
 if(encrypted){
  const enc=await xml('META-INF/encryption.xml');
  if(xmlItems(enc,'EncryptionMethod').some(item=>!['http://www.idpf.org/2008/embedding','http://ns.adobe.com/pdf/enc#RC'].includes(item.getAttribute('Algorithm'))))throw Error('Este libro está protegido. Elige un EPUB sin DRM.');
 }
 const images=new Map();
 async function picture(asset){
  if(!asset||!/^image\/(jpeg|png|gif|webp|avif)$/.test(asset.type)||!zip.file(asset.path))return '';
  if(!images.has(asset.path))images.set(asset.path,'data:'+asset.type+';base64,'+await zip.file(asset.path).async('base64'));return images.get(asset.path);
 }
 const coverMeta=xmlItems(metadata,'meta').find(item=>item.getAttribute('name')==='cover')?.getAttribute('content');
 let cover=await picture([...assets.values()].find(asset=>asset.properties.split(/\s+/).includes('cover-image'))||manifest.get(coverMeta));
 const pages=[];let firstText='';
 for(const ref of xmlItems(pkg,'itemref')){
  const res=manifest.get(ref.getAttribute('idref'));if(!res||!['application/xhtml+xml','text/html'].includes(res.type)||!zip.file(res.path))continue;
  const doc=await xml(res.path),body=xmlItems(doc,'body')[0];if(!body)continue;
  const chapter=(xmlItems(body,'h1')[0]||xmlItems(body,'h2')[0]||xmlItems(doc,'title')[0])?.textContent.trim()||'Lectura';
  let blocks=[],length=0;
  function flush(){if(blocks.length)pages.push({chapter,html:blocks.join('')});blocks=[];length=0}
  function block(html,cost){if(length&&length+cost>1400)flush();blocks.push(html);length+=cost}
  let paragraph='';
  function emit(tag='p'){
   const value=paragraph.replace(/\s+/g,' ').trim();paragraph='';if(!value)return;
   if(!firstText&&value.length>80)firstText=value.slice(0,420);
   let piece='';for(const word of value.split(' ')){if(piece.length+word.length>1350&&piece){block('<'+tag+'>'+safe(piece)+'</'+tag+'>',piece.length);piece=''}piece+=(piece?' ':'')+word}
   if(piece)block('<'+tag+'>'+safe(piece)+'</'+tag+'>',piece.length);
  }
  async function read(node){
   if(node.nodeType===3||node.nodeType===4){paragraph+=node.nodeValue;return}
   if(node.nodeType!==1)return;const tag=node.localName.toLowerCase();
   if(['script','style','iframe','object','form','audio','video','noscript'].includes(tag))return;
   if(tag==='img'||tag==='image'){
    emit();const src=node.getAttribute('src')||node.getAttribute('href')||node.getAttributeNS('http://www.w3.org/1999/xlink','href');
    const img=await picture(assets.get(relativeEntry(res.path,src)));
    if(img){if(!cover&&!pages.length&&!blocks.length)cover=img;block('<img alt="'+safe(node.getAttribute('alt')||'Ilustración')+'" src="'+img+'">',1000)}return;
   }
   const boundary=['p','div','section','h1','h2','h3','h4','li','br','blockquote','tr'].includes(tag);if(boundary)emit();
   for(const child of node.childNodes)await read(child);
   if(boundary)emit(/^h[1-4]$/.test(tag)?'h3':'p');
  }
  await read(body);emit();flush();
 }
 if(!pages.length)throw Error('Este EPUB no contiene páginas de lectura compatibles.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),byte=>byte.toString(16).padStart(2,'0')).join('');
 return {book:{id:hash,title,author,description,excerpt:firstText,cover,count:pages.length,position:0,started:false,finished:false},pages};
}
function shelfPanel(){return '<section class="panel bookshelf"><div class="moduleHead"><div><small>Libros electrónicos</small><h2>Mi estantería</h2></div>'+action('＋ Importar EPUB',"by('epubPicker').click()")+'<input hidden type="file" id="epubPicker" multiple accept=".epub,application/epub+zip" onchange="importBooks(this)"></div><p id="bookStatus" role="status"></p><div id="shelfGrid"></div></section>'}
function bookPercent(book){return book.finished?100:Math.floor(100*book.position/book.count)}
function jacket(book){return book.cover?'<img class="jacket" src="'+book.cover+'" alt="">':'<span class="jacket fallbackCover"><b>'+safe(book.title)+'</b><small>'+safe(book.author)+'</small></span>'}
async function loadShelf(){
 const grid=by('shelfGrid');if(!grid)return;
 try{
  const books=await bookQuery('books');if(!grid.isConnected)return;
  grid.parentElement.querySelector('.shelfTools')?.remove();
  const tools=document.createElement('div');tools.className='shelfTools';
  const recent=books.filter(book=>book.started&&!book.finished).sort((a,b)=>(b.lastRead||0)-(a.lastRead||0))[0];
  if(recent)tools.innerHTML='<section class="readingSpot"><small>En lectura</small><h3>'+safe(recent.title)+'</h3><p>'+safe(recent.author)+' · Página '+(recent.position+1)+' de '+recent.count+'</p>'+action('Retomar libro',"openBook('"+recent.id+"',true)")+'</section>';
  const modes=['Todos','Por empezar','En lectura','Terminados'];
  const group=book=>book.finished?'Terminados':book.started?'En lectura':'Por empezar';
  if(books.length)tools.innerHTML+='<div class="areaTabs">'+modes.map(mode=>'<button aria-pressed="'+((ui.bookFilter||'Todos')===mode)+'" onclick="ui.bookFilter=\''+mode+'\';loadShelf()">'+mode+' · '+books.filter(book=>mode==='Todos'||group(book)===mode).length+'</button>').join('')+'</div>';
  grid.before(tools);
  const visible=books.filter(book=>!ui.bookFilter||ui.bookFilter==='Todos'||group(book)===ui.bookFilter);
  grid.innerHTML=visible.sort((a,b)=>a.title.localeCompare(b.title,'es')).map(book=>'<button class="bookTile" onclick="openBook(\''+book.id+'\')">'+jacket(book)+'<strong>'+safe(book.title)+'</strong><span>'+safe(book.author)+'</span><progress aria-label="Progreso de lectura" max="100" value="'+bookPercent(book)+'"></progress><small>'+bookPercent(book)+' % leído</small></button>').join('')||(books.length?'<p>Sin libros en este grupo.</p>':'');
  by('bookStatus').textContent=importMessage||(books.length?'':'Importa un archivo .epub para empezar tu colección.');
 }catch{if(grid.isConnected)by('bookStatus').textContent='Este navegador no permite guardar libros aquí.'}
}
async function importBooks(input){
 if(importBusy)return;importBusy=true;const messages=[];
 for(const file of input.files){try{
  importMessage='Importando '+file.name+'…';if(by('bookStatus'))by('bookStatus').textContent=importMessage;
  const {book,pages}=await parseBook(file);
  if(await bookQuery('books',book.id)){messages.push(book.title+' ya está en tu estantería.');continue}
  await storeBook(book,pages);ui.bookFilter='Todos';messages.push('Importado: '+book.title+'.');
 }catch(error){messages.push(file.name+' · '+(error.name==='QuotaExceededError'?'Espacio insuficiente en el navegador.':error.message||'No se pudo importar.'))}}
 importBusy=false;input.value='';importMessage=messages.join(' ');await loadShelf();
}
async function openBook(id,resume=false){
 const book=await bookQuery('books',id);if(!book)return;
 const dialog=document.createElement('dialog');dialog.className='editor bookDialog';
 dialog.innerHTML='<div class="bookDetails">'+jacket(book)+'<div><small>Ficha del libro</small><h2>'+safe(book.title)+'</h2><p>'+safe(book.author)+'</p><h3>'+(book.description?'Sinopsis':book.excerpt?'Fragmento inicial':'Sinopsis')+'</h3><p>'+safe(book.description||book.excerpt||'El archivo no incluye una sinopsis.')+'</p></div></div><div class="controls"><button class="action" id="readEpub">'+(book.finished?'Volver a leer':book.started?'Continuar lectura':'Leer libro')+'</button><button id="leaveBook">Cerrar</button></div>';
 document.body.append(dialog);dialog.onclose=()=>{dialog.remove();loadShelf()};dialog.querySelector('#leaveBook').onclick=()=>dialog.close();dialog.showModal();
 dialog.querySelector('#readEpub').onclick=async()=>{
  const data=await bookQuery('pages',id);if(!dialog.open)return;
  if(!data?.pages?.length){dialog.querySelector('#readEpub').textContent='Contenido no disponible';return}
  if(book.finished){book.position=0;book.finished=false}book.started=true;book.lastRead=Date.now();dialog.classList.add('readerMode');
  function draw(){
   const page=data.pages[book.position];dialog.innerHTML='<div class="readerTop"><small>'+safe(book.title)+'</small><button id="leaveBook">Cerrar lectura</button></div><article class="readerPage"><small>'+safe(page.chapter)+'</small>'+page.html+'</article><div class="readerNav"><button id="prevPage" '+(!book.position?'disabled':'')+'>Anterior</button><span>'+ (book.position+1)+' / '+book.count+'</span><button id="nextPage">'+(book.position===book.count-1?'Terminar libro':'Siguiente')+'</button></div>';
   dialog.querySelector('#leaveBook').onclick=()=>dialog.close();
   const size=document.createElement('label');size.className='readerSize';size.innerHTML='Letra <select aria-label="Tamaño de letra">'+[17,20,24,28].map(value=>'<option value="'+value+'" '+((state.workspace.preferences.readSize||20)===value?'selected':'')+'>'+value+' px</option>').join('')+'</select>';dialog.querySelector('.readerTop').after(size);
   const article=dialog.querySelector('.readerPage');article.style.fontSize=size.querySelector('select').value+'px';
   size.onchange=event=>{state.workspace.preferences.readSize=Number(event.target.value);article.style.fontSize=event.target.value+'px';saveLocal()};
   async function move(delta){const position=book.position;book.position=Math.min(book.count-1,position+delta);book.finished=delta===1&&position===book.count-1;
    dialog.querySelectorAll('button').forEach(button=>button.disabled=true);
    try{await storeBook(book);if(book.finished)dialog.close();else draw()}catch{book.position=position;book.finished=false;draw();dialog.insertAdjacentHTML('afterbegin','<p role="alert">No se pudo guardar el avance.</p>')}
   }
   dialog.querySelector('#prevPage').onclick=()=>move(-1);dialog.querySelector('#nextPage').onclick=()=>move(1);dialog.scrollTop=0;
  }
  try{await storeBook(book);draw()}catch{dialog.querySelector('#readEpub').textContent='No se pudo guardar el avance'}
 };
 if(resume)dialog.querySelector('#readEpub').click();
}
