function initializeHealth(){
 state.workspace.healthLog??=[];
 state.workspace.kitchen??={plans:{},avoid:'',profile:null};
 delete state.workspace.waterDate;
}
function healthTotals(date){
 const entries=state.workspace.healthLog.filter(item=>item.date===date);
 return {minutes:entries.reduce((sum,item)=>sum+(item.kind==='exercise'?item.minutes:0),0)};
}
function latestWeeklyWeight(){return state.weights.filter(item=>item.weekly).at(-1)}
function nextWeightDate(){
 const last=latestWeeklyWeight();if(!last)return today();
 const date=new Date(last.date+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+7);return date.toISOString().slice(0,10);
}
function recordWeeklyWeight(kg){
 const last=latestWeeklyWeight();
 if(last&&today()<nextWeightDate())last.kg=kg;
 else state.weights.push({date:today(),kg,weekly:true});
 state.workspace.kitchen.profile.weight=kg;
}
function weeklyWeightEditor(){
 const due=today()>=nextWeightDate();
 editor(due?'Peso de esta semana':'Corregir último peso',[field('kg','Peso en kg','number',{min:30,max:350,step:0.01})],due?{}:{kg:latestWeeklyWeight().kg},values=>{recordWeeklyWeight(values.kg)});
}
function weightPanel(){
 const profile=state.workspace.kitchen.profile;
 if(!profile)return '<section class="panel"><h2>Tu punto de partida</h2><p>Registra tu estatura y tu peso para ver tu evolución y estimar las porciones del menú.</p>'+action('Completar mi perfil','kitchenProfile()')+'</section>';
 const next=nextWeightDate(),due=today()>=next;
 const bmi=(profile.weight/(profile.height/100)**2).toLocaleString('es-CO',{maximumFractionDigits:1});
 return '<section class="panel"><small>Seguimiento semanal</small><h2>'+(due?'Hoy toca registrar tu peso':'Próximo registro · '+dateLabel(next))+'</h2>'+metrics([['Peso actual',profile.weight.toLocaleString('es-CO')+' kg'],['Estatura',profile.height+' cm'],['IMC',bmi]])+'<div class="controls">'+action(due?'Registrar peso semanal':'Corregir último peso','weeklyWeightEditor()')+action('Editar perfil','kitchenProfile()')+'</div></section>';
}
function healthView(){
 const date=ui.healthDate||today(),totals=healthTotals(date);
 ui.healthArea??='Menú';const view=by('view');
 view.innerHTML='<section class="wellHead"><div><small>Salud</small><h1>'+({'Menú':'Mi cocina','Actividad':'Mi actividad','Progreso':'Mi progreso'}[ui.healthArea])+'</h1></div><label>Día <input class="field" type="date" id="healthDay" value="'+date+'"></label></section><div class="wellTabs">'+['Menú','Actividad','Progreso'].map(area=>'<button aria-pressed="'+(ui.healthArea===area)+'" onclick="ui.healthArea=\''+area+'\';render()">'+area+'</button>').join('')+'</div>';
 by('healthDay').onchange=event=>{ui.healthDate=event.target.value||today();render()};
 view.insertAdjacentHTML('beforeend',weightPanel());
 if(ui.healthArea==='Menú')view.append(kitchenPanel(date));
 if(ui.healthArea==='Actividad'){
  const entries=state.workspace.healthLog.map((item,index)=>({item,index})).filter(({item})=>item.kind==='exercise'&&item.date===date).sort((a,b)=>a.item.time.localeCompare(b.item.time));
  view.insertAdjacentHTML('beforeend','<section class="panel"><small>'+dateLabel(date)+'</small><div class="moduleHead"><h2>'+totals.minutes+' min de ejercicio</h2>'+action('＋ Registrar ejercicio','exerciseEditor()')+'</div>'+entries.map(({item,index})=>'<div class="row"><div><small>'+safe(item.time)+'</small><br><b>'+safe(item.name)+'</b> · '+item.minutes+' min</div><div class="controls">'+action('Editar','exerciseEditor('+index+')')+action('Eliminar','removeHealthEntry('+index+')')+'</div></div>').join('')+'</section>');
 }
}
function exerciseEditor(index=-1){
 const entries=state.workspace.healthLog,previous=entries[index];
 const fields=[field('name','Ejercicio realizado'),field('minutes','Duración en minutos','number',{min:1,max:1440,step:1}),field('date','Fecha','date'),field('time','Hora','time')];
 const now=new Date(),time=[now.getHours(),now.getMinutes()].map(value=>String(value).padStart(2,'0')).join(':');
 editor(previous?'Editar ejercicio':'Registrar ejercicio',fields,previous||{date:ui.healthDate||today(),time},values=>{
  const item={kind:'exercise',...values};if(previous)entries[index]=item;else entries.push(item);
  ui.healthDate=values.date;
 });
 const options=records('routines');
 if(options.length){
  const name=document.querySelector('dialog[open] [name=name]'),label=document.createElement('label'),select=document.createElement('select');
  label.textContent='Usar una rutina guardada';
  select.add(new Option('Escribir libremente',''));options.forEach((item,index)=>select.add(new Option(item.name,String(index))));
  select.onchange=()=>{if(select.value!=='')name.value=options[Number(select.value)].name;name.focus()};
  label.append(select);name.closest('label').before(label);
 }
}
function removeHealthEntry(index){
 if(confirm('¿Eliminar este registro del diario?')){state.workspace.healthLog.splice(index,1);saveView()}
}
