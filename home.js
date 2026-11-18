const houseStages=['Ahorrando','Queremos','Ya tenemos'];
const homeBlocks={areas:'Vista general',money:'Resumen financiero',house:'Nuestra futura casa',tasks:'Pendientes de hoy',organize:'Organización'};
const palettes={Violeta:['#c9bdff','#353047'],Océano:['#99dcff','#193d55'],Bosque:['#9ce2c0','#213d37'],Ámbar:['#f4cd8b','#453a2b']};
const appStyles={original:['Original','Tarjetas y menú inferior'],estudio:['Estudio','Panel de trabajo en verde'],marea:['Marea','Azules y navegación superior'],cobre:['Cobre','Tonos cálidos y vista en lista']};
function openStylePicker(){
 const prefs=state.workspace.preferences,dialog=document.createElement('dialog');dialog.className='editor stylePicker';
 dialog.setAttribute('aria-label','Estilo de Kive');
 dialog.innerHTML='<h2>Estilo de Kive</h2><div class="styleChoices">'+Object.entries(appStyles).map(([key,[name,detail]])=>'<button type="button" data-style="'+key+'" aria-pressed="'+((prefs.appStyle||'original')===key)+'"><span class="styleSample" aria-hidden="true"><i></i><b></b><em></em></span><strong>'+name+'</strong><small>'+detail+'</small></button>').join('')+'</div><button class="action">Listo</button>';
 dialog.querySelector('.styleChoices').onclick=event=>{
  const choice=event.target.closest('[data-style]');if(!choice)return;
  prefs.appStyle=choice.dataset.style;applyPreferences();saveLocal();
  for(const button of dialog.querySelectorAll('[data-style]'))button.setAttribute('aria-pressed',String(button===choice));
 };
 dialog.querySelector('.action').onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
const pesos=value=>'$ '+Number(value).toLocaleString('de-DE',{maximumFractionDigits:2});
let houseFilter='Todos',audioContext;
function initializeHome(){
 const workspace=state.workspace;
 workspace.preferences??={palette:'Violeta',sound:false};
 workspace.preferences.homeOrder??=Object.keys(homeBlocks);
 workspace.preferences.homeHidden??=['tasks'];
 workspace.house??=[
  {name:'Nevera',category:'Electrodomésticos',stage:'Ahorrando',target:2500000,opening:300000,deposits:[]},
  {name:'Lavadora',category:'Electrodomésticos',stage:'Ahorrando',target:6000000,opening:5000000,deposits:[]},
  {name:'Mesa de comedor',category:'Muebles',stage:'Queremos',target:900000,opening:0,deposits:[]},
  {name:'Vajilla',category:'Cocina',stage:'Ya tenemos',target:0,opening:0,deposits:[]}
 ];applyPreferences();
}
function applyPreferences(){
 const colors=palettes[state.workspace.preferences.palette]||palettes.Violeta;
 document.documentElement.style.setProperty('--user-accent',colors[0]);document.documentElement.style.setProperty('--user-tint',colors[1]);
 const prefs=state.workspace.preferences;
 document.documentElement.dataset.appStyle=prefs.appStyle||'original';
 document.documentElement.classList.toggle('largeReading',!!prefs.largeReading);
 document.documentElement.classList.toggle('strongEdges',!!prefs.strongEdges);
}
async function playSound(){
 if(!state.workspace.preferences.sound)return;
 try{
  audioContext??=new AudioContext();await audioContext.resume();
  if(!state.workspace.preferences.sound)return;
  const tone=audioContext.createOscillator(),gain=audioContext.createGain(),start=audioContext.currentTime;
  tone.frequency.setValueAtTime(640,start);tone.frequency.exponentialRampToValueAtTime(820,start+.08);
  gain.gain.setValueAtTime(.001,start);gain.gain.exponentialRampToValueAtTime(.055,start+.012);gain.gain.exponentialRampToValueAtTime(.001,start+.11);
  tone.connect(gain).connect(audioContext.destination);tone.start(start);tone.stop(start+.12);
 }catch{}
}
function openPreferences(){
 const prefs=state.workspace.preferences,dialog=document.createElement('dialog');dialog.className='editor preferences';
 dialog.innerHTML='<small>Este dispositivo</small><h2>Configuración</h2><fieldset><legend>Color de acento</legend>'+Object.entries(palettes).map(([name,colors])=>'<label class="swatch"><input type="radio" name="palette" value="'+name+'" '+(prefs.palette===name?'checked':'')+'><i style="background:'+colors[0]+'"></i>'+name+'</label>').join('')+'</fieldset><label class="soundSetting"><input type="checkbox" '+(prefs.sound?'checked':'')+'> Sonido al guardar formularios</label><div class="controls"><button type="button" id="testTone">Probar sonido</button><button class="action" id="closePrefs">Listo</button></div>';
 document.body.append(dialog);dialog.onclose=()=>dialog.remove();
 dialog.querySelector('fieldset').onchange=event=>{prefs.palette=event.target.value;applyPreferences();saveLocal()};
 const sound=dialog.querySelector('[type=checkbox]'),test=dialog.querySelector('#testTone');test.disabled=!prefs.sound;
 const display=document.createElement('fieldset');display.className='displaySettings';
 display.innerHTML='<legend>Lectura y controles</legend>'+[['largeReading','Texto grande'],['strongEdges','Bordes de alto contraste']].map(([key,label])=>'<label><input type="checkbox" name="'+key+'" '+(prefs[key]?'checked':'')+'>'+label+'</label>').join('');
 dialog.querySelector('.soundSetting').before(display);
 display.insertAdjacentHTML('beforebegin',action('Estilo de Kive','openStylePicker()'));
 display.onchange=event=>{prefs[event.target.name]=event.target.checked;applyPreferences();saveLocal()};
 sound.onchange=()=>{prefs.sound=sound.checked;test.disabled=!prefs.sound;saveLocal();if(prefs.sound)playSound()};
 const layout=document.createElement('fieldset');layout.className='homeSettings';dialog.querySelector('.soundSetting').after(layout);
 function showLayout(){
  layout.innerHTML='<legend>Personalizar Inicio</legend>'+prefs.homeOrder.map((key,index)=>'<div class="layoutRow"><label><input type="checkbox" data-key="'+key+'" '+(prefs.homeHidden.includes(key)?'':'checked')+'> '+homeBlocks[key]+'</label><button type="button" aria-label="Subir '+homeBlocks[key]+'" data-step="-1" data-index="'+index+'" '+(!index?'disabled':'')+'>↑</button><button type="button" aria-label="Bajar '+homeBlocks[key]+'" data-step="1" data-index="'+index+'" '+(index===prefs.homeOrder.length-1?'disabled':'')+'>↓</button></div>').join('');
 }
 function updateHome(){if(state.tab===0)dashboard();saveLocal()}
 layout.onchange=event=>{const key=event.target.dataset.key;prefs.homeHidden=prefs.homeHidden.filter(value=>value!==key);if(!event.target.checked)prefs.homeHidden.push(key);updateHome()};
 layout.onclick=event=>{const button=event.target.closest('button');if(!button)return;const index=Number(button.dataset.index),target=index+Number(button.dataset.step);[prefs.homeOrder[index],prefs.homeOrder[target]]=[prefs.homeOrder[target],prefs.homeOrder[index]];showLayout();updateHome()};
 showLayout();test.onclick=playSound;dialog.querySelector('#closePrefs').onclick=()=>dialog.close();dialog.showModal();
}
document.addEventListener('submit',event=>{
 const form=event.target;
 queueMicrotask(()=>{if(!form.isConnected||form.closest('dialog')?.open===false)playSound()});
});
function reserved(item){return item.opening+item.deposits.reduce((total,entry)=>total+entry.amount,0)}
function houseReserved(){return state.workspace.house.reduce((sum,item)=>sum+(item.stage==='Ya tenemos'?0:reserved(item)),0)}
function freeBalance(){return balance()-houseReserved()}
function buyHouse(index){
 const item=state.workspace.house[index];if(!item||item.stage==='Ya tenemos')return;
 editor('Registrar compra · '+item.name,[field('amount','Precio pagado en COP','money'),field('date','Fecha de compra','date')],{amount:item.target||reserved(item)||undefined,date:today()},values=>{
  if(item.stage==='Ya tenemos')return 'Esta compra ya está registrada.';
  state.moves.push(['Casa · '+item.name,-values.amount,values.date,'Casa']);item.stage='Ya tenemos';item.purchase={...values};ui.financeMonth=values.date.slice(0,7);
 });
}
function houseCard(item,index){
 const saved=reserved(item),owned=item.stage==='Ya tenemos',planned=item.target>0;
 const percentage=planned?Math.min(100,Math.floor(100*saved/item.target)):0;
 const stage=owned?'owned':item.stage==='Queremos'?'wanted':'saving';
 const amount=owned?'':('<div class="houseBalance"><div><small>Ahorrado</small><strong>'+pesos(saved)+'</strong></div>'+(planned?'<span>'+percentage+' %</span>':'')+'</div>'+
  (planned?'<progress aria-label="Ahorro de '+safe(item.name)+'" max="'+item.target+'" value="'+Math.min(saved,item.target)+'"></progress><div class="houseAmounts"><span>Meta <b>'+pesos(item.target)+'</b></span><span>Faltan <b>'+pesos(Math.max(0,item.target-saved))+'</b></span></div>':'<p>Meta por definir</p>'));
 const history=item.deposits.length||item.opening?'<details><summary>Historial de ahorro</summary>'+row('Saldo inicial',pesos(item.opening))+item.deposits.map(entry=>row(safe(entry.date),pesos(entry.amount))).join('')+'</details>':'';
 return '<article class="panel houseItem '+stage+'"><div class="houseTitle"><div><small>'+safe(item.category)+'</small><h2>'+safe(item.name)+'</h2></div><span class="stage">'+safe(item.stage)+'</span></div>'+amount+'<div class="controls houseActions">'+(owned?'':action('＋ Aporte','depositHouse('+index+')'))+(owned?'':action('Registrar compra','buyHouse('+index+')'))+action('Editar','editHouse('+index+')')+'<details class="houseOptions"><summary aria-label="Más opciones para '+safe(item.name)+'">•••</summary>'+action('Eliminar','deleteHouse('+index+')')+'</details></div>'+history+'</article>';
}
function homeView(){
 const items=state.workspace.house,active=items.filter(item=>item.stage!=='Ya tenemos'),funds=active.reduce((total,item)=>total+reserved(item),0);
 by('view').innerHTML='<section class="houseCover"><div class="houseDrawing" aria-hidden="true"><svg viewBox="0 0 320 160"><g fill="none" stroke="currentColor" stroke-linejoin="round"><path d="m24 85 93-53 77 43-92 54z M24 85v28l78 43 92-54V75 M102 129v27 M24 85l17-45 93-53 60 88 M41 40l61 89 M62 133v-27l19 11v27 M133 111V92l22-13v19z"/><path transform="translate(109 5) scale(.86)" d="m24 85 93-53 77 43-92 54z M24 85v28l78 43 92-54V75 M102 129v27 M24 85l17-45 93-53 60 88 M41 40l61 89"/></g></svg></div><div><small>Casa · Pesos colombianos</small><h1>Nuestra futura casa</h1><div class="houseTotals"><div><span>Ahorro reservado</span><b>'+pesos(funds)+'</b></div><div><span>Por conseguir</span><b>'+active.length+'</b></div><div><span>Ya tenemos</span><b>'+(items.length-active.length)+'</b></div></div></div></section>'+
 action('Volver a Finanzas','go(1)')+'<div class="moduleHead"><h2>Objetos de la casa</h2>'+action('＋ Añadir objeto','editHouse()')+'</div><div class="areaTabs">'+['Todos',...houseStages].map(label=>'<button aria-pressed="'+(houseFilter===label)+'" onclick="houseFilter=\''+label+'\';render()">'+label+'</button>').join('')+'</div><div class="grid houseGrid">'+items.map((item,index)=>{
  if(houseFilter!=='Todos'&&houseFilter!==item.stage)return '';
  return houseCard(item,index);
 }).join('')+'</div>';
 if(!by('view').querySelector('.houseItem'))by('view').insertAdjacentHTML('beforeend','<p>Aún no hay objetos en esta lista.</p>');
}
function editHouse(index=-1){
 const items=state.workspace.house,item=items[index],fields=[field('name','Objeto'),field('category','Categoría','select',{values:['Electrodomésticos','Muebles','Cocina','Decoración','Otros']}),field('stage','Estado','select',{values:houseStages}),field('target','Meta en COP (0 si está por definir)','money',{zero:true}),field('opening','Ahorro inicial en COP','money',{zero:true})];
 editor(item?'Editar objeto':'Añadir objeto',fields,item||{stage:houseStages.includes(houseFilter)?houseFilter:'Queremos',target:0,opening:0},values=>{
  if(item&&item.purchase&&values.stage!=='Ya tenemos')return 'Esta compra ya figura en Finanzas. Crea otra meta para una nueva compra.';
  if(item&&item.stage!=='Ya tenemos'&&values.stage==='Ya tenemos'&&reserved(item)>0)return 'Usa Registrar compra para contabilizar el gasto y liberar la reserva.';
  if(item)Object.assign(item,values);else items.push({...values,deposits:[]});
  if(houseFilter!=='Todos')houseFilter=values.stage;
 });
}
function depositHouse(index){
 const item=state.workspace.house[index];editor('Aportar a '+item.name,[field('amount','Aporte en COP','money'),field('date','Fecha','date')],{date:today()},values=>{
  item.deposits.push(values);item.stage='Ahorrando';if(houseFilter!=='Todos')houseFilter='Ahorrando';
 });
}
function deleteHouse(index){if(confirm('¿Eliminar este objeto y su historial de aportes?')){state.workspace.house.splice(index,1);saveView()}}
