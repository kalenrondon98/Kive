const iconPaths={
 Casa:'M2 11 12 3l10 8 M5 10v11h14V10 M9 21v-7h6v7',
 Configuración:'M3 7h8m5 0h5M3 17h3m5 0h10 M15 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0 M11 17a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0',
 Inicio:'M3 10 12 3l9 7v10h-6v-6H9v6H3Z',
 Finanzas:'M3 7h16v13H3z M3 7l14-4v4 M15 11h6v5h-6z',
 Salud:'M2 12h5l3-8 4 16 3-8h5',
 Biblioteca:'M4 4h5v16H4z M11 4h3v16h-3z M16 5l3-1 3 15-3 1z',
 'Kive Travel':'M3 9l18-6-6 18-3-9z M12 12l9-9',
 Agenda:'M3 6h18v15H3z M3 10h18 M7 3v6 M17 3v6',
 Estudios:'M2 9l10-5 10 5-10 5z M6 12v5l6 3 6-3v-5',
 Negocios:'M3 8h18v12H3z M8 8V4h8v4 M3 12l9 2 9-2',
 Inventario:'M3 7l9-4 9 4v11l-9 4-9-4z M3 7l9 4 9-4 M12 11v11',
 Vehículos:'M3 14l2-6h14l2 6v5H3z M3 14h18 M6 17h2 M16 17h2',
 Buscar:'M15.5 15.5l5 5 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
 Salir:'M6 17 18 5 M7 5h11v11'
};
function glyph(key){return '<svg aria-hidden="true" class="glyph" viewBox="0 0 24 24"><path d="'+iconPaths[key]+'"/></svg>'}
function summaryCard(index,overline,value,detail){
 return '<button class="dashboardCard tone'+index+'" onclick="go('+index+')"><span class="cardTop"><span class="tileIcon">'+glyph(areas[index])+'</span><span>'+safe(areas[index])+'</span>'+glyph('Salir')+'</span><small>'+safe(overline)+'</small><strong>'+safe(value)+'</strong><span class="cardFoot">'+safe(detail)+'</span></button>';
}
function dashboard(){
 const current=trip(),health=healthTotals(today());
 const section=ui.area,workspace=by('view');
 workspace.innerHTML='<section class="deskHero"><div class="orbital" aria-hidden="true"><i></i><b></b><em></em></div><div class="heroCopy"><small>'+safe(new Intl.DateTimeFormat('es-CO',{weekday:'long',day:'numeric',month:'long'}).format(new Date()))+'</small><h1>Mi espacio<span>.</span></h1><div class="heroActions">'+action('＋ Registrar movimiento','jumpForm(1,\'movement\')')+action('Escribir nota','jumpForm(3,\'note\')')+'</div></div></section><div class="dashHeading"><h2>Vista general</h2></div><div class="dashCards">'+
 summaryCard(1,'Libre tras reservar para Casa',money(freeBalance()),state.moves.length+' movimientos registrados')+
 summaryCard(2,'Actividad de hoy',health.minutes+' min','Menú, ejercicio y progreso')+
 summaryCard(3,'Mi biblioteca',state.notes.length+' '+(state.notes.length===1?'nota':'notas'),'Libros EPUB y notas')+
 summaryCard(4,'Viaje seleccionado',current.name,dateLabel(current.start)+' — '+dateLabel(current.end))+'</div>'+
 dashboardMoney()+
 '<button class="homeShortcut" onclick="go(5)">'+glyph('Casa')+'<span><b>Nuestra futura casa</b><br>'+pesos(state.workspace.house.filter(item=>item.stage!=='Ya tenemos').reduce((total,item)=>total+reserved(item),0))+' COP reservados</span>'+glyph('Salir')+'</button>'+
 '<section class="organize"><div class="dashHeading"><h2>Organización</h2></div><div class="areaTabs">'+['Agenda','Estudios','Negocios','Inventario','Vehículos'].map(key=>'<button aria-pressed="'+(key===section)+'" onclick="ui.area=\''+key+'\';render()">'+glyph(key)+safe(key)+'</button>').join('')+'</div>'+moduleWorkspace()+'</section>';
 workspace.querySelector('.heroActions').insertAdjacentHTML('beforeend',action('Cambiar estilo','openStylePicker()'));
 arrangeDashboard();
}
function arrangeDashboard(){
 const view=by('view'),prefs=state.workspace.preferences,areas=document.createElement('section');
 areas.append(view.querySelector('.dashHeading'),view.querySelector('.dashCards'));
 const tasks=records('Agenda').filter(item=>!item.done&&item.date===today());
 const pending=document.createElement('section');pending.className='panel';pending.innerHTML='<h2>Pendientes de hoy</h2>'+(tasks.length?'<ul>'+tasks.map(item=>'<li>'+safe(item.name)+'</li>').join('')+'</ul>':'<p>Hoy estás al día.</p>')+action('Abrir agenda de hoy','openToday()');
 const blocks={areas,money:by('dashboardMoney'),house:view.querySelector('.homeShortcut'),tasks:pending,organize:view.querySelector('.organize')};
 for(const key of prefs.homeOrder){const block=blocks[key];block.dataset.homeBlock=key;block.hidden=prefs.homeHidden.includes(key);view.append(block)}
}
function jumpForm(tab,id){go(tab);const form=by(id);form.scrollIntoView({block:'center'});(form.elements.amount||form.querySelector('input,textarea'))?.focus({preventScroll:true})}
function refreshInterface(){
 document.body.dataset.area=String(state.tab);
 by('nav').querySelectorAll('button').forEach((button,index)=>button.insertAdjacentHTML('afterbegin',glyph(areas[index])));
 if(!by('carLink')){
  const header=document.querySelector('header');header.querySelector('strong').innerHTML='<span class="brandMark" aria-hidden="true"></span>kive';
  by('dailyAlert').insertAdjacentHTML('beforebegin','<button id="carLink" onclick="go(6)">'+glyph('Vehículos')+'<span>Carro</span></button>');
 }
 by('carLink').setAttribute('aria-current',state.tab===6?'page':'false');
 if(!state.tab)dashboard();
 refreshDayAlert();
 if(!by('settingsButton'))by('dailyAlert').insertAdjacentHTML('afterend','<button id="settingsButton" title="Configuración" aria-label="Configuración" onclick="openPreferences()">'+glyph('Configuración')+'</button>');
 if(state.tab===3){
  const hero=by('view').querySelector('.hero');hero.querySelector('h1').textContent='Mi biblioteca';hero.querySelector('p').textContent='Libros y notas en este dispositivo.';
  hero.insertAdjacentHTML('afterend',shelfPanel());loadShelf();
 }
 if(by('movement')||state.tab===3){
  const headings=[...by('view').querySelectorAll('.panel h2,.panel h3')].filter(heading=>!heading.closest('article')&&heading.parentElement.matches('.panel')&&!/^\d/.test(heading.textContent));
  if(headings.length>=3){
   const jump=document.createElement('label');jump.className='sectionJump';jump.innerHTML='<span>Ir a sección</span><select><option value="">Seleccionar…</option>'+headings.map((heading,index)=>'<option value="'+index+'">'+safe(heading.textContent)+'</option>').join('')+'</select>';
   jump.querySelector('select').onchange=event=>{if(event.target.value==='')return;const target=headings[Number(event.target.value)];target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});event.target.value=''};
   by('view').querySelector('.hero,.financeFront').after(jump);
  }
 }
}
