const dateLabel=value=>new Date(value+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short'});
const months=value=>new Date(value+'-01T12:00:00').toLocaleDateString('es-CO',{month:'long',year:'numeric'});
const numberLabel=value=>Number(value).toLocaleString('es-CO');
function metrics(items){return '<div class="metrics">'+items.map(([label,value])=>'<div><small>'+safe(label)+'</small><strong>'+safe(value)+'</strong></div>').join('')+'</div>'}
function moduleWorkspace(){
 if(ui.area==='Agenda')return calendarView()+deck('Agenda','Eventos y tareas');
 const items=records(ui.area);
 return '<div id="moduleWorkspace"><section class="moduleHead"><small>Mi organización</small><h2>'+ui.area+'</h2>'+action('＋ Añadir ficha',"editRow('"+ui.area+"')")+'</section>'+items.map((item,index)=>entityPanel(ui.area,item,index)).join('')+'</div>';
}
function monthShift(offset){
 const date=new Date(ui.month+'-15T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+offset);
 ui.month=date.toISOString().slice(0,7);ui.day=ui.month+'-01';render();
}
function openToday(){
 ui.area='Agenda';ui.day=today();ui.month=ui.day.slice(0,7);go(0);
 document.querySelector('.organize').hidden=false;
 const detail=by('agendaDay');detail.focus({preventScroll:true});detail.scrollIntoView({block:'center'});
}
function refreshDayAlert(){
 const count=records('Agenda').filter(item=>item.date===today()&&!item.done).length;
 const label=count===0?'Hoy al día':count===1?'1 pendiente hoy':count+' pendientes hoy';
 const alert=by('dailyAlert');alert.textContent=label;alert.classList.toggle('pending',count>0);
 alert.setAttribute('aria-label',label+'. Abrir agenda de hoy');
}
let noticeDate=today();
function checkDayChange(){
 const day=today();if(day===noticeDate)return;noticeDate=day;refreshDayAlert();
 if(state.tab===2&&!document.querySelector('dialog[open]'))render();
 if(by('calendar')&&!document.querySelector('dialog[open]'))by('calendar').outerHTML=calendarView();
}
window.addEventListener('focus',checkDayChange);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkDayChange()});
setInterval(checkDayChange,60000);
function calendarView(){
 ui.day??=today();ui.month??=ui.day.slice(0,7);
 const events=records('Agenda').map((item,index)=>({...item,index}));
 const tripEvents=state.workspace.trips.flatMap((item,index)=>[{date:item.start,name:'Salida · '+item.name,trip:index},{date:item.end,name:'Regreso · '+item.name,trip:index}]);
 const all=[...events,...tripEvents],selected=all.filter(item=>item.date===ui.day);
 const first=new Date(ui.month+'-01T12:00:00'),count=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
 const due=events.filter(item=>!item.done&&item.date<today());
 return '<section class="panel" id="calendar"><small>Agenda personal</small><div class="moduleHead"><h2>'+months(ui.month)+'</h2><div class="controls">'+action('←','monthShift(-1)')+action('Hoy',"ui.day=today();ui.month=ui.day.slice(0,7);render()")+action('→','monthShift(1)')+'</div></div><div class="calendar">'+['L','M','X','J','V','S','D'].map(day=>'<b>'+day+'</b>').join('')+'<i></i>'.repeat((first.getDay()+6)%7)+Array.from({length:count},(_,index)=>{
  const day=ui.month+'-'+String(index+1).padStart(2,'0'),entries=all.filter(item=>item.date===day&&!item.done);
  const titles=entries.map(item=>item.name).join(' · ');
  return '<button class="calDay '+(day===ui.day?'active':'')+'" aria-label="'+safe(dateLabel(day)+(titles?' · '+titles:''))+'" aria-pressed="'+(day===ui.day)+'" onclick="ui.day=\''+day+'\';render()"><span>'+(index+1)+'</span>'+entries.slice(0,2).map(item=>'<span class="calTask">'+safe(item.name)+'</span>').join('')+(entries.length>2?'<span class="calTask">+'+(entries.length-2)+'</span>':'')+'</button>';
 }).join('')+'</div><h3 id="agendaDay" tabindex="-1">'+dateLabel(ui.day)+'</h3>'+selected.map(item=>'<div class="row"><span>'+safe(item.name)+'</span>'+(item.trip!=null?action('Ver viaje','openLinkedTrip('+item.trip+')'):action(item.done?'✓ Hecho':'Completar','finishEvent('+item.index+')'))+'</div>').join('')+(selected.length?'':'<p>Sin eventos programados.</p>')+action('＋ Evento este día',"editRow('Agenda',-1,{date:ui.day})")+(due.length?'<h3>Pendientes de días anteriores</h3>'+due.map(item=>'<div class="row">'+safe(item.name)+' · '+dateLabel(item.date)+action('Completar','finishEvent('+item.index+')')+'</div>').join(''):'')+'</section>';
}
function finishEvent(index){const event=records('Agenda')[index];event.done=!event.done;saveView()}
const ledgerFields={
 Estudios:[field('name','Tema estudiado'),field('date','Fecha','date'),field('minutes','Minutos','number',{min:1,step:1}),field('status','Resultado','select',{values:['En práctica','Dominado','Por repasar']})],
 Negocios:[field('name','Concepto'),field('date','Fecha','date'),field('kind','Tipo','select',{values:['Ingreso','Gasto']}),field('amount','Importe en COP','money')],
 Inventario:[field('name','Motivo'),field('date','Fecha','date'),field('kind','Tipo','select',{values:['Entrada','Salida']}),field('units','Unidades','number',{min:1,step:1})],
 Vehículos:[field('name','Concepto'),field('date','Fecha','date'),field('kind','Tipo','select',{values:['Mantenimiento','Combustible','Lectura de odómetro']}),field('km','Kilometraje','number',{step:1,min:0}),field('amount','Costo en COP','money',{zero:true}),field('litres','Litros (si aplica)','number',{min:0,optional:true})]
};
const logNames={Estudios:'Sesiones de estudio',Negocios:'Movimientos del proyecto',Inventario:'Movimientos de existencias',Vehículos:'Historial del vehículo'};
function ledgerSummary(key,item,logs){
 const sum=(name,filter=()=>true)=>logs.filter(filter).reduce((acc,line)=>acc+line[name],0);
 if(key==='Negocios'){
  const income=sum('amount',line=>line.kind==='Ingreso'&&line.currency!=='USD'),expenses=sum('amount',line=>line.kind==='Gasto'&&line.currency!=='USD');
  return [['Ingresos',money(income)],['Resultado neto',money(income-expenses)],['Margen',income?numberLabel(Math.round(1000*(income-expenses)/income)/10)+' %':'—']];
 }
 if(key==='Estudios')return [['Sesiones',logs.length],['Tiempo total',sum('minutes')+' min'],['Por repasar',logs.filter(line=>line.status==='Por repasar').length]];
 if(key==='Inventario')return [['Disponibles',item.count+sum('units',line=>line.kind==='Entrada')-sum('units',line=>line.kind==='Salida')],['Ubicación',item.details],['Movimientos',logs.length]];
 return [['Odómetro',numberLabel(Math.max(0,...logs.map(line=>line.km)))+' km'],['Gastos',money(sum('amount',line=>line.currency!=='USD'))],['Combustible',numberLabel(sum('litres',line=>line.kind==='Combustible'))+' L']];
}
function entityPanel(key,item,index){
 const logs=item.logs||[],ref="'"+key+"',"+index;
 return '<section class="panel entity"><div class="moduleHead"><div><small>'+safe(key)+'</small><h2>'+safe(item.name)+'</h2></div><div class="controls">'+action('Editar ficha','editRow('+ref+')')+action('Eliminar ficha','removeRow('+ref+')')+'</div></div><p>'+safe(item.details)+(key==='Vehículos'?' · Próxima revisión '+safe(item.date):'')+'</p>'+metrics(ledgerSummary(key,item,logs))+'<div class="moduleHead"><h3>'+logNames[key]+'</h3>'+action('＋ Registrar','editLog('+ref+')')+'</div>'+(!logs.length?'<p>Registra la primera entrada para ver el seguimiento.</p>':'')+logs.map((line,logIndex)=>({line,logIndex})).sort((a,b)=>b.line.date.localeCompare(a.line.date)).map(({line,logIndex})=>'<div class="row"><div><small>'+dateLabel(line.date)+'</small><br><b>'+safe(line.name)+'</b><p>'+safe([line.kind,line.status,line.minutes&&line.minutes+' min',line.units&&line.units+' ud.',line.km!=null&&numberLabel(line.km)+' km',line.amount!=null&&(line.currency==='USD'?usd(line.amount):money(line.amount))].filter(Boolean).join(' · '))+'</p></div><div class="controls">'+action('Editar','editLog('+ref+','+logIndex+')')+action('Quitar','deleteLog('+ref+','+logIndex+')')+'</div></div>').join('')+'</section>';
}
function stockValid(key,item,logs){return key!=='Inventario'||ledgerSummary(key,item,logs)[0][1]>=0}
function editLog(key,index,position=-1){
 const item=records(key)[index],logs=item.logs||[];
 const currency=logs[position]?.currency;
 editor(logNames[key],ledgerFields[key].map(spec=>currency==='USD'?{...spec,label:spec.label.replace('en COP','en USD')}:spec),logs[position]||{date:today(),amount:0},values=>{
  if(currency)values.currency=currency;
  const updated=logs.slice();if(position<0)updated.push(values);else updated[position]=values;
  if(!stockValid(key,item,updated))return 'La salida supera las existencias disponibles.';
  if(key==='Vehículos'&&values.kind==='Combustible'&&values.litres<=0)return 'Indica los litros cargados.';
  item.logs=updated;
 });
}
function deleteLog(key,index,position){
 const item=records(key)[index],updated=item.logs.filter((_,offset)=>offset!==position);
 if(!stockValid(key,item,updated)){alert('Ajusta las salidas antes de quitar esta entrada.');return}
 if(confirm('¿Quitar este registro del historial?')){item.logs=updated;saveView()}
}
const normalizePlace=name=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cityIndex=/*CITY_INDEX*/;
const regions=new Intl.DisplayNames(['es'],{type:'region'});
const cityAliases={bogota:'Bogotá',medellin:'Medellín',ibague:'Ibagué',paris:'París','new york':'Nueva York',london:'Londres',rome:'Roma',munich:'Múnich'};
function localCities(query){
 const term=normalizePlace(query.trim());if(term.length<2)return [];
 const matches=[];
 for(const [raw,province,country,lat,lon] of cityIndex){
  const name=cityAliases[normalizePlace(raw)]||raw,search=normalizePlace(name);
  if(!search.includes(term)&&!normalizePlace(raw).includes(term))continue;
  const region=/^[A-Z]{2}$/.test(country)?regions.of(country):country;
  matches.push({place:[name,province,region].filter((part,index,array)=>part&&array.indexOf(part)===index).join(', '),lat,lon,rank:search===term?0:search.startsWith(term)?1:2});
 }return matches.sort((a,b)=>a.rank-b.rank).slice(0,8);
}
function cityPicker(input,initial,keepMapPoint=false){
 let point=mapped(initial)?{lat:initial.lat,lon:initial.lon}:null;
 const box=document.createElement('div');box.className='cityChoices';input.closest('label').after(box);input.autocomplete='off';
 input.addEventListener('input',()=>{
  point=keepMapPoint?initial:null;box.replaceChildren();const matches=localCities(input.value);
  for(const city of matches){const button=document.createElement('button');button.type='button';button.textContent=city.place;button.onclick=()=>{input.value=city.place;point={lat:city.lat,lon:city.lon};box.replaceChildren()};box.append(button)}
  if(!matches.length&&input.value.trim().length>=2)box.textContent='Puedes guardar el nombre tal como lo escribiste.';
 });return ()=>point;
}
function mapped(point){return point&&Number.isFinite(point.lat)&&Number.isFinite(point.lon)}
function tripPath(current){return [current.originPoint,...current.stops,current.destinationPoint].filter(mapped)}
function tripDays(start,end){return 1+Math.round((Date.parse(end)-Date.parse(start))/86400000)}
function dayOffset(date,offset){return new Date(Date.parse(date)+offset*86400000).toISOString().slice(0,10)}
function planDate(){const current=trip();return ui.planDay>=current.start&&ui.planDay<=current.end?ui.planDay:current.start}
function setPlanDay(date){ui.planDay=date;render()}
function dayPlanner(current){
 const date=planDate(),day=tripDays(current.start,date),days=tripDays(current.start,current.end),night=current.nights?.[date];
 const entries=current.stops.map((stop,index)=>({stop,index})).filter(entry=>entry.stop.date===date).sort((a,b)=>a.stop.time.localeCompare(b.stop.time));
 return '<section class="panel tripDays"><small>Plan de viaje · '+days+' días / '+(days-1)+' noches</small><h2>'+safe(current.origin||'Origen por definir')+' → '+safe(current.place)+'</h2><div class="dayBar"><button aria-label="Día anterior" '+(day===1?'disabled':'')+' onclick="setPlanDay(\''+dayOffset(date,-1)+'\')">←</button><label>Día '+day+' de '+days+' <input class="field" type="date" value="'+date+'" min="'+current.start+'" max="'+current.end+'" onchange="if(this.value&&this.validity.valid)setPlanDay(this.value)"></label><button aria-label="Día siguiente" '+(day===days?'disabled':'')+' onclick="setPlanDay(\''+dayOffset(date,1)+'\')">→</button></div><h3>'+dateLabel(date)+'</h3>'+
 (entries.map(({stop,index})=>'<div class="row"><b>'+safe(stop.time)+'</b><div><b>'+safe(stop.name)+'</b><p>'+safe(stop.place)+'</p></div><div class="controls">'+(mapped(stop)?action('Mapa','selectStop('+index+');by(\'liveTravelMap\').scrollIntoView({block:\'center\'})'):'')+action('Editar',"editRow('stops',"+index+")")+action('Eliminar',"removeRow('stops',"+index+")")+'</div></div>').join('')||'<p>El día está libre. Añade la primera actividad y su hora.</p>')+
 action('＋ Actividad este día',"editRow('stops')")+action('Añadir gasto de este día','travelExpenseEditor()')+row('Costo previsto del día',cost(travelAmounts(current.expenses.filter(item=>item.date===date)).forecast))+(day<days?'<div class="nightBox"><small>Dónde dormimos · Noche '+day+'</small><h3>'+safe(night?.name||current.hotel||'Por decidir')+'</h3><p>'+safe(night?.address||(!night&&current.address)||'')+'</p>'+action('Elegir alojamiento','editNight()')+'</div>':'<p>Último día del viaje · Regreso</p>')+'</section>';
}
function editNight(){
 const current=trip(),date=planDate();editor('Alojamiento · '+dateLabel(date),[field('name','Hotel, casa o alojamiento'),field('address','Ciudad o dirección','text',{optional:true})],current.nights?.[date]||{name:current.hotel,address:current.address},values=>{current.nights??={};current.nights[date]=values});
}
function stopEditor(index,defaults){
 const current=trip(),previous=current.stops[index],initial=previous||{date:planDate(),time:'09:00',place:current.place,...defaults};
 const form=editor(previous?'Editar actividad':'Añadir actividad',schemas.stops.slice(0,4),initial,values=>{
  if(values.date<current.start||values.date>current.end)return 'La fecha debe estar dentro del viaje.';
  const coords=getPoint(),item={...values,lat:coords?.lat??null,lon:coords?.lon??null};if(previous)current.stops[index]=item;else current.stops.push(item);
  current.stops.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));ui.stop=current.stops.indexOf(item);ui.planDay=item.date;
 });
 form.elements.date.min=current.start;form.elements.date.max=current.end;
 const getPoint=cityPicker(form.elements.place,mapped(initial)?initial:initial.place===current.place?current.destinationPoint:null,!previous&&mapped(defaults)&&!defaults.place);
}
function routeStats(stops){
 let length=0;const radians=value=>value*Math.PI/180;
 for(let index=1;index<stops.length;index++){
  const from=stops[index-1],to=stops[index];
  const chord=Math.sin(radians(to.lat-from.lat)/2)**2+Math.cos(radians(from.lat))*Math.cos(radians(to.lat))*Math.sin(radians(to.lon-from.lon)/2)**2;
  length+=12742*Math.asin(Math.min(1,Math.sqrt(chord)));
 }
 return metrics([['Paradas',stops.length],['Días con plan',new Set(stops.map(stop=>stop.date)).size],['Línea recta',numberLabel(Math.round(length))+' km']]);
}
function savedPlaces(){
 const unique=new Map();
 for(const current of state.workspace.trips)for(const stop of current.stops){
  if(!mapped(stop))continue;
  const key=stop.place+'|'+stop.lat+'|'+stop.lon;unique.set(key,{place:stop.place,lat:stop.lat,lon:stop.lon});
 }return [...unique.values()];
}
function lookupLink(path,params,label){const query=new URLSearchParams({api:'1',...params});return '<a class="mapLink" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/'+path+'/?'+safe(query.toString())+'">'+safe(label)+' ↗</a>'}
function planner(){
 const stops=trip().stops,selected=stops[ui.stop],next=stops[ui.stop+1],prev=stops[ui.stop-1];
 const origin=next?selected:prev,end=next||selected;
 const coord=stop=>mapped(stop)?stop.lat+','+stop.lon:stop.place;
 return '<section id="planner" class="panel"><small>Kive Travel · Planificador</small><div class="moduleHead"><h2>Explorar el recorrido</h2><span>'+stops.length+' paradas</span></div><label>Buscar un lugar <input class="field" type="search" id="placeSearch" placeholder="Ciudad o parada guardada"></label><div class="controls">'+action('Buscar ciudad en línea','findCity()')+'</div><div id="placeResults" aria-live="polite"></div>'+(selected?'<div class="routeCard"><small>Parada '+(ui.stop+1)+'</small><h3>'+safe(selected.place)+'</h3><p>'+dateLabel(selected.date)+' · '+safe(selected.time)+' · '+safe(selected.name)+'</p><div class="controls">'+lookupLink('search',{query:coord(selected)},'Abrir en Google Maps')+'</div></div>':'')+(origin&&end?'<div class="row"><span><small>Tramo seleccionado</small><br>'+safe(origin.place)+' → '+safe(end.place)+'</span>'+lookupLink('dir',{origin:coord(origin),destination:coord(end),travelmode:'driving'},'Calcular ruta en Maps')+'</div>':'')+'</section>';
}
let placeResults=[];
function showResults(items,heading){
 placeResults=items;by('placeResults').innerHTML='<p>'+safe(heading)+'</p><div class="controls">'+items.map((item,index)=>action('＋ '+item.place,'usePlace('+index+')')).join('')+'</div>';
}
function usePlace(index){const item=placeResults[index];editRow('stops',-1,{...item,name:item.place,date:planDate(),time:'09:00'})}
function bindPlanner(){
 const input=by('placeSearch');
 input.oninput=()=>{const term=normalizePlace(input.value.trim());const results=[...savedPlaces().filter(item=>normalizePlace(item.place).includes(term)),...localCities(term)].slice(0,10);showResults(results,term?(results.length?'Resultados sin conexión':'Prueba la búsqueda en línea o escribe el lugar al añadir una actividad.'):'Paradas disponibles sin conexión')};
 input.oninput();
}
async function findCity(){
 const input=by('placeSearch'),query=input.value.trim();if(query.length<2){showResults([],'Escribe al menos dos letras para buscar una ciudad.');return}
 showResults([],'Buscando en Open-Meteo…');const ticket=Symbol();input.searchTicket=ticket;
 try{
  const params=new URLSearchParams({name:query,count:'5',language:'es',format:'json'});
  const response=await fetch('https://geocoding-api.open-meteo.com/v1/search?'+params,{referrerPolicy:'no-referrer',signal:AbortSignal.timeout(9000)});
  if(!response.ok)throw Error();const data=await response.json();
  if(by('placeSearch')!==input||input.value.trim()!==query||input.searchTicket!==ticket)return;
  const results=(data.results||[]).map(item=>({place:[item.name,item.admin1,item.country].filter(Boolean).join(', '),lat:item.latitude,lon:item.longitude}));
  showResults(results,results.length?'Ciudades · Open-Meteo / GeoNames':'Sin resultados. Prueba otra ciudad.');
 }catch{if(by('placeSearch')===input&&input.value.trim()===query&&input.searchTicket===ticket)showResults([],'Búsqueda en línea no disponible. Puedes usar las paradas guardadas o introducir coordenadas.')}
}
function travelers(){return [...new Set(trip().people.split(/\s+y\s+|[,;\n]/i).map(name=>name.trim()).filter(Boolean))]}
function splitView(){
 const people=travelers(),expenses=trip().expenses;if(!people.length)return '';
 const balances=new Map(people.map(name=>[name,0]));
 for(const bill of expenses){
  if(!balances.has(bill.payer))continue;
  const cents=Math.round(bill.amount*100);balances.set(bill.payer,balances.get(bill.payer)+cents);
  people.forEach((name,index)=>balances.set(name,balances.get(name)-Math.floor(cents/people.length)-(index<cents%people.length?1:0)));
 }
 return '<section class="panel"><small>Pagos compartidos</small><h2>Reparto entre viajeros</h2><p>Los gastos con pagador se dividen por igual entre '+people.length+' viajeros.</p>'+expenses.map((bill,index)=>!bill.amount?'':'<label class="row">'+safe(bill.name)+' · '+cost(bill.amount)+'<select aria-label="Quién pagó '+safe(bill.name)+'" onchange="trip().expenses['+index+'].payer=this.value;saveView()"><option value="">Sin asignar</option>'+people.map(name=>'<option '+(bill.payer===name?'selected':'')+'>'+safe(name)+'</option>').join('')+'</select></label>').join('')+[...balances].map(([name,cents])=>row(safe(name),cents===0?'Al día':(cents>0?'Recibe ':'Aporta ')+cost(Math.abs(cents)/100))).join('')+'</section>';
}
