state.workspace=null;
const ui={travel:'Resumen',stop:0,area:'Agenda'};
const safe=escapeText;
const id=()=>crypto.randomUUID();
const today=()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const field=(key,label,type='text',options={})=>({key,label,type,...options});
const schemas={
 goals:[field('name','Meta'),field('target','Objetivo en COP','money'),field('saved','Ahorrado en COP','money',{zero:true})],
 habits:[field('name','Hábito'),field('frequency','Frecuencia')],
 routines:[field('name','Rutina'),field('details','Ejercicios y duración','textarea')],
 recipes:[field('name','Receta'),field('ingredients','Ingredientes','textarea'),field('steps','Preparación','textarea')],
 Agenda:[field('name','Evento o tarea'),field('date','Fecha','date'),field('details','Detalles','textarea')],
 Estudios:[field('name','Materia'),field('details','Objetivo de estudio','textarea')],
 Negocios:[field('name','Proyecto'),field('details','Próxima acción','textarea')],
 Inventario:[field('name','Artículo'),field('count','Unidades','number',{min:1,step:1}),field('details','Ubicación')],
 Vehículos:[field('name','Vehículo'),field('details','Mantenimiento'),field('date','Próxima revisión','date')],
 stops:[field('name','Actividad'),field('date','Fecha','date'),field('time','Hora','time'),field('place','Lugar'),field('lat','Latitud','number',{min:-90,max:90}),field('lon','Longitud','number',{min:-180,max:180})],
 expenses:[field('name','Concepto'),field('category','Categoría','select',{values:['Alojamiento','Transporte','Comidas','Actividad','Otro']}),field('amount','Importe en moneda del viaje','money')],
 list:[field('name','Preparativo')],memo:[field('name','Nota para invitados','textarea')]
};
const tripFields=[field('name','Nombre del viaje'),field('place','Destino'),field('start','Salida','date'),field('end','Regreso','date'),field('people','Viajeros (nombres de ejemplo)'),field('currency','Moneda','select',{values:['COP','USD','PEN','EUR','CLP']}),field('limit','Presupuesto total','money',{zero:true}),field('hotel','Alojamiento','text',{optional:true}),field('address','Dirección del alojamiento','text',{optional:true})];
function blankTrip(values){
 return {id:id(),stops:[],expenses:[],list:[],memo:[],files:[],url:'',allowed:false,...values};
}
function initializePrototype(){
 if(state.workspace)return;
 const sample=blankTrip({name:'Patagonia austral',place:'Puerto Natales, Chile',start:'2027-03-12',end:'2027-03-14',people:'Alex y Dani',currency:'USD',limit:500,hotel:'Refugio Arrayán (ejemplo)',address:'Paseo del Sur 12 · Dirección ficticia'});
 const places=[['Puerto Natales',-51.73,-72.5],['Laguna Amarga',-50.98,-72.8],['Mirador del Cóndor',-51.1,-72.99]];
 sample.stops=state.plan.map((item,index)=>({name:item.title,time:item.time,date:'2027-03-'+(12+index),place:places[index][0],lat:places[index][1],lon:places[index][2]}));
 sample.expenses=[{name:'Dos noches',category:'Alojamiento',amount:180},{name:'Comidas',category:'Comidas',amount:90},{name:'Traslados',category:'Transporte',amount:60}];
 sample.list=names.map((name,index)=>({name,done:state.packed[index]}));sample.memo=[{name:'Encuentro en recepción antes de la salida.'}];
 sample.url=state.url;sample.allowed=state.allowed;
 state.workspace={active:sample.id,trips:[sample],goals:[{name:'Próxima escapada',target:800,saved:240}],habits:[{name:'Caminar',frequency:'Cada día'}],routines:[{name:'Caminata suave',details:'20 minutos en el parque'}],recipes:[{name:'Avena de montaña',ingredients:'Avena, leche y banano',steps:'Cocina la avena con leche y añade el banano en rodajas.'}]};
 for(const [key,item] of Object.entries({Agenda:{name:'Salida a Patagonia',date:sample.start,details:'Encuentro del grupo'},Estudios:{name:'Fotografía',details:'Practicar composición'},Negocios:{name:'Encuadernación',details:'Estimar materiales'},Inventario:{name:'Mochila',count:1,details:'Armario'},Vehículos:{name:'Bicicleta',details:'Revisión de frenos',date:'2027-02-12'}}))state.workspace[key]=[item];
 state.workspace.Estudios[0].logs=[{name:'Encuadre y luz',date:'2026-11-15',minutes:45,status:'Dominado'},{name:'Práctica de exposición',date:'2026-11-17',minutes:30,status:'Por repasar'}];
 state.workspace.Negocios[0].logs=[{name:'Venta de cuadernos',date:'2026-11-17',kind:'Ingreso',amount:240},{name:'Papel y cubiertas',date:'2026-11-14',kind:'Gasto',amount:85}];
 state.workspace.Inventario[0].logs=[{name:'Equipo adicional',date:'2026-11-15',kind:'Entrada',units:2}];
 state.workspace.Vehículos[0].logs=[{name:'Cambio de pastillas',date:'2026-11-14',kind:'Mantenimiento',km:1420,amount:18,litres:0}];
}
function trip(){return state.workspace.trips.find(item=>item.id===state.workspace.active)||state.workspace.trips[0]}
function records(key){return state.workspace[key]||trip()[key]}
function action(label,run){return '<button type="button" onclick="'+run+'">'+safe(label)+'</button>'}
function saveView(){render();saveLocal()}
function inputHTML(spec,value){
 const attributes=' name="'+spec.key+'" class="field" '+(spec.optional?'':'required');
 const text=safe(value??'');
 let control;
 if(spec.type==='textarea')control='<textarea maxlength="600" '+attributes+'>'+text+'</textarea>';
 else if(spec.type==='select')control='<select '+attributes+'>'+spec.values.map(option=>'<option '+(value===option?'selected':'')+'>'+safe(option)+'</option>').join('')+'</select>';
 else if(spec.type==='money')control='<input type="text" inputmode="decimal" '+attributes+' value="'+(value==null?'':Number(value).toLocaleString('de-DE'))+'">';
 else control='<input type="'+spec.type+'" maxlength="100" '+(spec.type==='number'?'inputmode="'+(spec.step===1?'numeric':'decimal')+'" step="'+(spec.step||'any')+'" min="'+(spec.min??0)+'" max="'+(spec.max??999999)+'"':'')+' '+attributes+' value="'+text+'">';
 return '<label>'+safe(spec.label)+control+'</label>';
}
function editor(title,fields,initial,commit){
 const dialog=document.createElement('dialog');dialog.className='editor';
 dialog.innerHTML='<form><h2>'+safe(title)+'</h2>'+fields.map(spec=>inputHTML(spec,initial[spec.key])).join('')+'<p role="alert"></p><button class="action">Guardar</button> <button type="button">Cancelar</button></form>';
 document.body.append(dialog);const form=dialog.querySelector('form');
 form.querySelector('button[type=button]').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();
 for(const spec of fields.filter(item=>item.type==='money')){
  const control=form.elements[spec.key];setupMovement({elements:{amount:control}});
  if(spec.zero)control.addEventListener('input',()=>{if(/^0([,.]0{0,2})?$/.test(control.value))control.setCustomValidity('')});
 }
 form.onsubmit=event=>{event.preventDefault();const values={};
  for(const spec of fields){const raw=form.elements[spec.key].value.trim();
   if(!raw&&!spec.optional){form.querySelector('[role=alert]').textContent='Completa el campo '+spec.label+'.';return}
   values[spec.key]=spec.type==='money'?Number(raw.replaceAll('.','').replace(',','.')):spec.type==='number'?Number(raw):raw;
  }
  const error=commit(values);if(error){form.querySelector('[role=alert]').textContent=error;return}
  dialog.close();saveView();
 };dialog.showModal();return form;
}
function editRow(key,index=-1,defaults={}){
 if(key==='stops')return stopEditor(index,defaults);
 const items=records(key);editor(index<0?'Añadir registro':'Editar registro',schemas[key],items[index]||defaults,values=>{
  if(key==='stops'&&(values.date<trip().start||values.date>trip().end))return 'La actividad debe estar entre la salida y el regreso.';
  if(key==='Inventario'&&index>=0&&!stockValid(key,values,items[index].logs||[]))return 'El inventario inicial debe cubrir las salidas registradas.';
  if(index<0)items.push(values);else Object.assign(items[index],values);
  if(key==='stops'){items.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));ui.stop=items.findIndex(item=>item.name===values.name&&item.time===values.time)}
  if(key==='Agenda'){ui.day=values.date;ui.month=values.date.slice(0,7)}
 });
}
function removeRow(key,index){if(confirm('¿Eliminar este registro?')){records(key).splice(index,1);saveView()}}
function deck(key,title){
 const items=records(key);return '<section class="panel"><h2>'+safe(title)+'</h2>'+items.map((item,index)=>{
  let detail=schemas[key].slice(1).map(spec=>safe(spec.label)+' · '+safe(spec.type==='money'?Number(item[spec.key]).toLocaleString('de-DE'):item[spec.key])).join('<br>');
  if(key==='goals')detail+='<progress aria-label="Avance de ahorro" max="'+Number(item.target)+'" value="'+Number(item.saved)+'"></progress>';
  const track=['habits','routines','list'].includes(key);
  const complete=key==='list'?item.done:item.last===today();
  return '<article class="record"><b>'+safe(item.name)+'</b><p>'+detail+'</p><div class="controls">'+(track?action(complete?'✓ Hecho':'Marcar hecho',"toggleDone('"+key+"',"+index+")"):'')+action('Editar',"editRow('"+key+"',"+index+")")+action('Eliminar',"removeRow('"+key+"',"+index+")")+'</div></article>';
 }).join('')+action('＋ Añadir',"editRow('"+key+"')")+'</section>';
}
function toggleDone(key,index){const item=records(key)[index];if(key==='list')item.done=!item.done;else item.last=item.last===today()?'':today();saveView()}
function enrichArea(){
 const view=by('view');
 if(state.tab===1&&by('movement')){
  const summary=state.workspace.trips.map((item,index)=>{
   const amount=item.expenses.reduce((sum,expense)=>sum+expense.amount,0);
   const detail=state.tab===1?new Intl.NumberFormat('es-CO',{style:'currency',currency:item.currency}).format(amount)+' en gastos de viaje':safe(item.start)+' — '+safe(item.end);
   return '<div class="row"><span><b>'+safe(item.name)+'</b><br>'+detail+'</span>'+action('Abrir viaje','openLinkedTrip('+index+')')+'</div>';
  }).join('');
  view.insertAdjacentHTML('beforeend','<section class="panel"><h2>'+(!state.tab?'Viajes en agenda':'Gastos registrados en Travel')+'</h2>'+summary+'</section>');
 }
 if(state.tab===2&&ui.healthArea==='Actividad'){
  view.insertAdjacentHTML('beforeend','<div class="grid">'+deck('habits','Hábitos de hoy')+deck('routines','Rutinas de hoy')+'</div>');
 }
 if(state.tab===2&&ui.healthArea==='Progreso'){
  const weights=state.weights.filter(item=>item.weekly).slice(-12);if(weights.length>1){
   const values=weights.map(item=>item.kg),low=Math.min(...values),high=Math.max(...values);
   const points=weights.map((item,index)=>[8+284*index/(weights.length-1),70-58*(item.kg-low)/(high-low||1)]);
   by('weightForm').querySelector('h2').insertAdjacentHTML('afterend','<svg class="trend" viewBox="0 0 300 80" role="img" aria-label="Tendencia del peso de '+low+' a '+high+' kg"><polyline fill="none" stroke="#a993ff" stroke-width="3" points="'+points.map(point=>point.join(',')).join(' ')+'"/>'+points.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="4" fill="#a7d6ff"/>').join('')+'</svg>');
  }
 }
 if(state.tab===3){
  view.querySelectorAll('.grid article').forEach((card,index)=>card.insertAdjacentHTML('beforeend',action('Editar','editNote('+index+')')+' '+action('Eliminar','deleteNote('+index+')')));
 }
}
function openLinkedTrip(index){switchTrip(state.workspace.trips[index].id,false);ui.travel=state.tab===1?'Gastos':'Resumen';go(4);saveLocal()}
function editNote(index){editor('Editar nota',[field('name','Título'),field('body','Texto','textarea')],{name:state.notes[index][0],body:state.notes[index][1]},values=>{state.notes[index]=[values.name,values.body]})}
function deleteNote(index){if(confirm('¿Eliminar esta nota?')){state.notes.splice(index,1);saveView()}}
function deleteMove(index){if(confirm('¿Eliminar este movimiento?')){state.moves.splice(index,1);saveView()}}
function tripEditor(create){
 const templates={'En blanco':[],'Escapada':['Preparar mochila','Revisar transporte'],'Internacional':['Revisar documentos','Confirmar alojamiento','Preparar equipaje'],...(state.workspace.templates||{})};
 const fields=[field('origin','Desde dónde salgo','text',{optional:!create}),tripFields[1],tripFields[2],tripFields[3],tripFields[0],...tripFields.slice(4)];
 if(create)fields.push(field('template','Plantilla de preparativos','select',{values:Object.keys(templates)}));
 const current=trip();const form=editor(create?'Planear un viaje':'Editar viaje',fields,create?{start:today(),end:today(),currency:'COP',limit:0}:current,values=>{
  if(values.end<values.start)return 'El regreso debe ser igual o posterior a la salida.';
  if(!create&&current.stops.some(stop=>stop.date<values.start||stop.date>values.end))return 'Ajusta primero las actividades que quedarían fuera del viaje.';
  if(!create&&Object.keys(current.nights||{}).some(date=>date<values.start||date>=values.end))return 'Ajusta primero los alojamientos que quedarían fuera del viaje.';
  if(!create&&current.expenses.some(item=>item.date&&(item.date<values.start||item.date>values.end)))return 'Ajusta primero los gastos que quedarían fuera del viaje.';
  values.originPoint=originPoint();values.destinationPoint=destinationPoint();
  if(create){const added=blankTrip(values);added.list=templates[values.template].map(name=>({name,done:false}));state.workspace.trips.push(added);switchTrip(added.id,false);ui.travel='Itinerario y mapa'}else Object.assign(current,values);
 });
 const originPoint=cityPicker(form.elements.origin,create?null:current.originPoint);
 const destinationPoint=cityPicker(form.elements.place,create?null:current.destinationPoint);
 const duration=document.createElement('p');form.elements.end.closest('label').after(duration);
 const update=()=>{const days=tripDays(form.elements.start.value,form.elements.end.value);duration.textContent=days>0?days+' días · '+(days-1)+' noches':''};
 form.elements.start.onchange=()=>{if(form.elements.end.value<form.elements.start.value)form.elements.end.value=form.elements.start.value;update()};form.elements.end.onchange=update;update();
}
function switchTrip(value,refresh=true){trip().url=state.url;trip().allowed=state.allowed;state.workspace.active=value;state.url=trip().url;state.allowed=trip().allowed;state.page=0;state.book=false;ui.travel='Resumen';ui.stop=0;ui.planDay=trip().start;if(refresh)saveView()}
function mapView(interactive){
 if(interactive)return travelMapPanel();
 const points=tripPath(trip());if(!points.length)return '<p>Elige una ciudad del catálogo o marca una parada en el mapa para trazar la ruta.</p>';
 const extent=key=>{const values=points.map(item=>Number(item[key]));return [Math.min(...values),Math.max(...values)]};
 const [west,east]=extent('lon'),[south,north]=extent('lat');
 const positions=points.map(item=>[east===west?200:25+350*(item.lon-west)/(east-west),north===south?105:185-155*(item.lat-south)/(north-south)]);
 return '<svg class="route" viewBox="0 0 400 210" aria-label="Recorrido por coordenadas, norte arriba"><rect width="400" height="210" fill="#e9e6f2"/><path d="M0 50H400M0 100H400M0 150H400M100 0V210M200 0V210M300 0V210" stroke="#d3cde5"/><text x="12" y="20">↑ N</text><polyline fill="none" stroke="#7961b7" stroke-width="3" points="'+positions.map(point=>point.join(',')).join(' ')+'"/>'+positions.map(([x,y],index)=>'<g '+(interactive?'role="button" tabindex="0" aria-label="Parada '+(index+1)+'" onclick="selectStop('+index+')" onkeydown="if(event.key===\'Enter\')selectStop('+index+')"':'')+'><circle cx="'+x+'" cy="'+y+'" r="11" fill="'+(interactive&&ui.stop===index?'#2559a8':'#594485')+'"/><text x="'+x+'" y="'+(y+4)+'" fill="white" text-anchor="middle">'+(index+1)+'</text></g>').join('')+'</svg><small>Ruta por coordenadas · Sin escala</small>';
}
function selectStop(index){ui.stop=index;const stop=trip().stops[index];if(stop)ui.planDay=stop.date;render();if(liveMap&&mapped(stop))liveMap.panTo([stop.lat,stop.lon])}
function tripSnapshot(current){
 const now=new Date(),stamp=today()+'T'+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const ordered=current.stops.map((stop,index)=>({stop,index,stamp:stop.date+'T'+stop.time})).sort((a,b)=>a.stamp.localeCompare(b.stamp));
 const next=ordered.find(entry=>entry.stamp>=stamp),featured=next||ordered.at(-1);
 const ready=current.list.filter(item=>item.done).length,spent=current.expenses.reduce((sum,item)=>sum+item.amount,0);
 return '<div class="travelBrief"><section class="tripLead"><small>'+(!featured?'Itinerario':next?'Próxima actividad':'Última actividad programada')+'</small><h2>'+safe(featured?.stop.name||'Planifica la primera parada')+'</h2>'+(featured?'<p>'+dateLabel(featured.stop.date)+' · '+safe(featured.stop.time)+' · '+safe(featured.stop.place)+'</p>'+action('Ver actividad en el mapa',"ui.travel='Itinerario y mapa';selectStop("+featured.index+")"):action('Añadir actividad',"editRow('stops')"))+'</section><div class="tripQuick">'+action('Preparativos · '+ready+' de '+current.list.length,"ui.travel='Preparativos';render()")+action('Saldo del viaje · '+cost(current.limit-spent),"ui.travel='Gastos';render()")+action('Documentos · '+current.files.length,"ui.travel='Documentos';render()")+'</div></div>';
}
function travelView(){
 const current=trip(),view=by('view');const tabs=['Resumen','Itinerario y mapa','Gastos','Documentos','Preparativos','Álbum'];
 view.innerHTML=hero('Kive Travel · '+safe(current.place),safe(current.name),safe(current.start)+' — '+safe(current.end)+' · '+safe(current.people))+'<div class="controls"><label>Mis viajes <select onchange="switchTrip(this.value)">'+state.workspace.trips.map(item=>'<option value="'+safe(item.id)+'" '+(item.id===current.id?'selected':'')+'>'+safe(item.name)+'</option>').join('')+'</select></label>'+action('＋ Crear viaje','tripEditor(true)')+action(state.book?'Volver al viaje':'Exportar · Travel Book','state.book=!state.book;render()')+'</div>';
 if(state.book){view.insertAdjacentHTML('beforeend',bookPanel());by('print').insertAdjacentHTML('afterend',action('Descargar folleto digital','downloadBook()'));preview();return}
 view.insertAdjacentHTML('beforeend','<div class="controls subsections">'+tabs.map(tab=>'<button class="'+(ui.travel===tab?'active':'')+'" onclick="ui.travel=\''+tab+'\';render()">'+tab+'</button>').join('')+'</div>');
 if(ui.travel==='Resumen'){
  view.insertAdjacentHTML('beforeend',tripSnapshot(current));
  const remaining=Math.ceil((Date.parse(current.start)-Date.parse(today()))/86400000);
  view.insertAdjacentHTML('beforeend','<section class="panel"><small>'+ (remaining>0?'Faltan '+remaining+' días':today()>current.end?'Viaje finalizado':'Viaje en curso')+'</small><h2>'+safe([current.origin,current.place].filter(Boolean).join(' → '))+'</h2>'+row('Duración',tripDays(current.start,current.end)+' días · '+(tripDays(current.start,current.end)-1)+' noches')+row('Viajeros',safe(current.people))+row('Alojamiento',safe(current.hotel||'Pendiente'))+row('Dirección',safe(current.address||'Pendiente'))+action('Editar viaje','tripEditor(false)')+'</section>'+deck('memo','Notas para el folleto'));
 }
 if(ui.travel==='Itinerario y mapa'){
  view.insertAdjacentHTML('beforeend',dayPlanner(current));
  ui.stop=Math.min(ui.stop,Math.max(0,current.stops.length-1));const selected=current.stops[ui.stop];
  view.insertAdjacentHTML('beforeend','<div class="grid"><section class="panel"><h2>Ruta</h2>'+mapView(true)+(selected?'<h3>'+safe(selected.place)+'</h3><p>'+safe(selected.name)+' · '+safe(selected.time)+'</p>':'')+'</section></div>');
  const routeGrid=view.lastElementChild;routeGrid.id='routeBoard';
  mountTravelMap();
  routeGrid.firstElementChild.insertAdjacentHTML('beforeend',routeStats(tripPath(current)));
  view.insertAdjacentHTML('beforeend',planner());bindPlanner();
 }
 if(ui.travel==='Gastos')view.insertAdjacentHTML('beforeend',travelExpensePanel(current));
 if(ui.travel==='Gastos')view.insertAdjacentHTML('beforeend',splitView());
 if(ui.travel==='Preparativos')view.insertAdjacentHTML('beforeend',deck('list','Checklist')+action('Guardar checklist como plantilla','saveTemplate()'));
 if(ui.travel==='Álbum')view.insertAdjacentHTML('beforeend','<section class="panel"><h2>Álbum del viaje</h2><p>Elige una foto de ejemplo y asígnala a una parada. Puedes usarla como portada del folleto.</p><input type="file" accept="image/jpeg,image/png" onchange="addPhoto(this)"><p id="photoStatus" role="status"></p><div class="grid">'+(current.photos||[]).map((photo,index)=>'<article class="record"><img class="photo" alt="'+safe(photo.name)+'" src="'+safe(photo.data)+'"><h3>'+safe(photo.name)+'</h3><p>'+safe(photo.place)+'</p>'+action(current.cover===photo.id?'✓ Portada':'Usar en portada','trip().cover=trip().photos['+index+'].id;saveView()')+action('Quitar','dropPhoto('+index+')')+'</article>').join('')+'</div></section>');
 if(ui.travel==='Documentos')view.insertAdjacentHTML('beforeend','<section class="panel"><h2>Documentos locales</h2><p>Adjunta PDF o imágenes de ejemplo. Estos archivos quedan fuera del folleto.</p><input type="file" accept="application/pdf,image/png,image/jpeg" onchange="attachFile(this)"><p role="status" id="fileStatus"></p>'+current.files.map((file,index)=>'<div class="row">'+safe(file.name)+action('Descargar','downloadTripFile('+index+')')+action('Quitar','removeFile('+index+')')+'</div>').join('')+'</section>');
}
function saveTemplate(){editor('Guardar plantilla',[field('name','Nombre')],{},values=>{state.workspace.templates??={};const key='Mi plantilla · '+values.name;if(Object.hasOwn(state.workspace.templates,key))return 'Ya existe una plantilla con ese nombre.';state.workspace.templates[key]=trip().list.map(item=>item.name)})}
function dropPhoto(index){if(confirm('¿Quitar esta foto del álbum?')){trip().photos.splice(index,1);saveView()}}
function addPhoto(input){
 const file=input.files[0];if(!file)return;
 if(!['image/jpeg','image/png'].includes(file.type)||file.size>1500000){by('photoStatus').textContent='Elige una imagen JPG o PNG de hasta 1,5 MB.';return}
 const current=trip(),reader=new FileReader();
 reader.onload=()=>editor('Guardar fotografía',[field('name','Pie de foto'),field('place','Lugar o actividad','select',{values:[...new Set([current.place,...current.stops.map(stop=>stop.place)])]})],{name:file.name},values=>{
  current.photos??=[];current.photos.push({...values,id:id(),data:reader.result});
  try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{current.photos.pop();return 'Espacio insuficiente. Prueba con una imagen más pequeña.'}
 });reader.readAsDataURL(file);
}
function downloadBook(){
 const body=by('printset').innerHTML;if(!body)return;
 const html='<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kive Travel Book</title><style>'+document.querySelector('style').textContent+by('size').textContent+'body{margin:auto;max-width:850px}.printset{display:block}.paper{margin:12px 0}@media print{body{max-width:none}.paper{margin:0}}</style><div class="printset">'+body+'</div></html>';
 const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));const link=document.createElement('a');link.href=url;link.download='Kive Travel Book.html';link.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function cost(amount){return new Intl.NumberFormat('es-CO',{style:'currency',currency:trip().currency}).format(amount)}
async function attachFile(input){
 const file=input.files[0];if(!file)return;const current=trip();
 if(!['application/pdf','image/png','image/jpeg'].includes(file.type)||file.size>1500000){by('fileStatus').textContent='Elige un PDF, PNG o JPEG de hasta 1,5 MB.';return}
 const reader=new FileReader();reader.onerror=()=>{if(by('fileStatus'))by('fileStatus').textContent='No se pudo leer el archivo.'};
 reader.onload=()=>{current.files.push({name:file.name,data:reader.result});try{localStorage.setItem(storageKey,JSON.stringify(state))}catch{current.files.pop();if(by('fileStatus'))by('fileStatus').textContent='El almacenamiento local está lleno.';return}render()};reader.readAsDataURL(file);
}
function downloadTripFile(index){const file=trip().files[index];const link=document.createElement('a');link.href=file.data;link.download=file.name;link.click()}
function removeFile(index){if(confirm('¿Quitar el archivo local?')){trip().files.splice(index,1);saveView()}}
function preview(){
 const current=trip(),link=validLink();current.url=state.url;current.allowed=state.allowed;
 by('qrstatus').textContent=!state.url?'QR pendiente de enlace.':!link?'Introduce una URL HTTP o HTTPS válida.':!state.allowed?'Pendiente de autorización.':'Enlace autorizado.';
 const pages=[];
 function page(section,html){if(state.selected.includes(section))pages.push({section,html})}
 function chunks(section,items,perPage,format){if(!items.length){page(section,'<p>Pendiente de completar.</p>');return}for(let index=0;index<items.length;index+=perPage)page(section,items.slice(index,index+perPage).map(format).join(''))}
 const cover=(current.photos||[]).find(item=>item.id===current.cover);
 page('Portada','<small>Cuaderno de expedición</small><h2>'+safe(current.name)+'</h2>'+(cover?'<img class="photo" alt="'+safe(cover.name)+'" src="'+safe(cover.data)+'">':'<div class="coverart"><div class="range"></div></div>')+'<h3>'+safe([current.origin,current.place].filter(Boolean).join(' → '))+'</h3><p>'+safe(current.start)+' — '+safe(current.end)+'</p><p>'+safe(current.people)+'</p>');
 chunks('Itinerario',current.stops,4,item=>'<section><small>'+'Día '+tripDays(current.start,item.date)+' · '+safe(item.date)+' · '+safe(item.time)+'</small><h3>'+safe(item.name)+'</h3><p>'+safe(item.place)+'</p></section>');
 page('Mapa',mapView(false));chunks('Checklist',current.list,8,item=>row(safe(item.name),item.done?'Listo':'Pendiente'));
 if(!Object.keys(current.nights||{}).length)page('Hotel','<h3>'+safe(current.hotel||'Por confirmar')+'</h3><p>'+safe(current.address||'Dirección pendiente')+'</p><p>Fechas del viaje · '+safe(current.start)+' — '+safe(current.end)+'</p>');
 else chunks('Hotel',Array.from({length:tripDays(current.start,current.end)-1},(_,index)=>dayOffset(current.start,index)),5,date=>'<section><small>Noche '+tripDays(current.start,date)+' · '+safe(date)+'</small><h3>'+safe(current.nights[date]?.name||current.hotel||'Por decidir')+'</h3><p>'+safe(current.nights[date]?.address??current.address??'')+'</p></section>');
 chunks('Presupuesto',travelBudgetLines(current),7,item=>row(safe(item.name),cost(item.amount)));
 chunks('Notas',current.memo,1,item=>'<p>'+safe(item.name)+'</p>');page('QR',state.allowed&&link?qr(link)+'<p>'+safe(link)+'</p>':'<p>Espacio reservado para el enlace de invitación.</p>');
 const sheets=[];
 for(const part of pages){
  const last=sheets.at(-1),first=last?.[0].section;
  const compactMap=part.section==='Mapa'&&first==='Itinerario'&&current.stops.length<=3&&current.stops.every(stop=>stop.name.length<80&&stop.place.length<45);
  const compactHotel=part.section==='Hotel'&&first==='Checklist'&&current.list.length<=5;
  const compactNotes=['Notas','QR'].includes(part.section)&&['Presupuesto','Notas'].includes(first)&&current.memo.length<=1&&(current.memo[0]?.name.length||0)<180&&current.expenses.length<=3&&(!state.allowed||state.url.length<100);
  if(compactMap||compactHotel||compactNotes)last.push(part);else sheets.push([part]);
 }
 state.page=Math.min(Math.max(state.page,0),Math.max(0,sheets.length-1));
 const output=sheets.map((parts,index)=>'<article class="paper" style="aspect-ratio:'+(state.letter?'8.5/11':'210/297')+'"><small>KIVE / TRAVEL BOOK</small>'+parts.map(({section,html},position)=>(section==='Portada'?'':position?'<h3>'+section+'</h3>':'<h2>'+section+'</h2>')+html).join('')+'<footer>'+safe(current.name)+' · '+(index+1)+' / '+sheets.length+'</footer></article>');
 by('sheet').innerHTML=output[state.page]||'<p>Selecciona una sección.</p>';by('printset').innerHTML=output.join('');by('counter').textContent=sheets.length?'Página '+(state.page+1)+' de '+sheets.length:'0 páginas';by('prev').disabled=!state.page;by('next').disabled=state.page>=sheets.length-1;by('print').disabled=!sheets.length;by('size').textContent='@page{size:'+(state.letter?'letter':'A4')+';margin:0}:root{--height:'+(state.letter?'279.3':'296.8')+'mm}';
}
