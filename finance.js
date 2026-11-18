const financeCategories=['Alimentación','Vivienda','Casa','Transporte','Salud','Estudios','Salidas','Viajes','Ocio','Salario','Otros'];
const usd=value=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'USD'}).format(value)+' USD';
function initializeFinance(previous){
 const workspace=state.workspace;
 workspace.debts??=[];
 if(workspace.financeCurrency==='COP')return;
 if(previous){
  workspace.legacyUSD={moves:state.moves,budget:state.budget,goals:workspace.goals};
  state.moves=[];workspace.goals=[];
  for(const item of [...workspace.Negocios,...workspace.Vehículos])for(const entry of item.logs||[])entry.currency='USD';
 }else{
  state.moves=[['Ingreso de ejemplo',3200000,today(),'Salario'],['Mercado semanal',-165000,today(),'Alimentación'],['Transporte',-42000,today(),'Transporte']];
  workspace.goals=[{name:'Próxima escapada',target:2500000,saved:450000}];
  for(const entry of workspace.Negocios[0].logs)entry.amount=entry.kind==='Ingreso'?840000:225000;
  workspace.Vehículos[0].logs[0].amount=48000;
  const sampleTrip=workspace.trips[0];sampleTrip.currency='COP';sampleTrip.limit=2200000;
  sampleTrip.expenses.forEach((expense,index)=>{expense.amount=[780000,320000,210000][index]});
 }
 state.budget=1500000;workspace.financeBudgets={};workspace.financeCurrency='COP';
}
function editMove(index){
 if(state.moves[index][4]){payDebt(state.moves[index][4],index);return}
 const [name,amount,date,category]=state.moves[index];
 editor('Editar movimiento',[field('name','Concepto'),field('amount','Importe en COP','money'),field('kind','Tipo','select',{values:['Ingreso','Gasto']}),field('date','Fecha','date'),field('category','Categoría','select',{values:financeCategories})],
 {name,amount:Math.abs(amount),date,category,kind:amount<0?'Gasto':'Ingreso'},values=>{
  state.moves[index]=[values.name,values.amount*(values.kind==='Gasto'?-1:1),values.date,values.category];ui.financeMonth=values.date.slice(0,7);
 });
}
function usdArchive(){
 const history=state.workspace.legacyUSD;if(!history)return '';
 return '<details class="panel"><summary>Historial de la versión anterior · USD</summary><p>Importes originales, excluidos del saldo en pesos.</p>'+history.moves.map(([name,value])=>row(safe(name),usd(value))).join('')+row('Presupuesto anterior',usd(history.budget))+history.goals.map(item=>row(safe(item.name),usd(item.saved)+' de '+usd(item.target))).join('')+'</details>';
}
const debtKinds=['Carro','Familiar','Tarjeta de crédito','ICETEX','Otra'];
function debtPayments(id){return state.moves.map((move,index)=>({move,index})).filter(entry=>entry.move[4]===id)}
function paidAmount(id){return debtPayments(id).reduce((sum,entry)=>sum-entry.move[1],0)}
function debtEditor(id){
 const debt=state.workspace.debts.find(item=>item.id===id);
 editor(debt?'Editar deuda':'Nueva deuda',[field('name','Nombre de la deuda'),field('creditor','A quién le debemos'),field('kind','Tipo','select',{values:debtKinds}),field('amount','Saldo inicial pendiente en COP','money'),field('usualPayment','Abono habitual en COP (opcional)','money',{optional:true})],debt||{},values=>{
  values.usualPayment=values.usualPayment||null;
  if(debt&&values.amount<paidAmount(id))return 'El saldo inicial debe cubrir los abonos registrados.';
  if(debt)Object.assign(debt,values);else state.workspace.debts.push({id:crypto.randomUUID(),...values});
 });
}
function payDebt(id,index=-1){
 const debt=state.workspace.debts.find(item=>item.id===id);if(!debt)return;
 const previous=state.moves[index],available=Math.round((debt.amount-paidAmount(id)-(previous?.[1]||0))*100)/100;
 const suggested=debt.usualPayment?Math.min(debt.usualPayment,available):undefined;
 editor((previous?'Editar abono · ':'Abonar a ')+debt.name,[field('amount','Abono en COP','money'),field('date','Fecha del pago','date')],{amount:previous?-previous[1]:suggested,date:previous?.[2]||today()},values=>{
  if(!(values.amount>0)||values.amount>available)return 'El abono debe ser mayor que cero y no superar '+pesos(available)+'.';
  const move=['Abono · '+debt.name,-values.amount,values.date,'Pago de deudas',id];
  if(previous)state.moves[index]=move;else state.moves.push(move);ui.financeMonth=values.date.slice(0,7);
 });
}
function removeDebt(id){
 if(debtPayments(id).length)return;
 if(confirm('¿Eliminar esta deuda sin abonos?')){state.workspace.debts=state.workspace.debts.filter(item=>item.id!==id);saveView()}
}
function debtsView(){
 const debts=state.workspace.debts,total=debts.reduce((sum,item)=>sum+item.amount,0),paid=debts.reduce((sum,item)=>sum+paidAmount(item.id),0);
 return hero('Finanzas · COP','Nuestras deudas','Consulta cuánto debemos entre todas las cuentas y registra cada pago una sola vez.')+
 metrics([['Saldo pendiente',pesos(total-paid)],['Abonos registrados',pesos(paid)],['Deudas activas',debts.filter(item=>item.amount-paidAmount(item.id)>.005).length]])+
 '<div class="moduleHead"><h2>Cuentas por pagar</h2>'+action('＋ Nueva deuda','debtEditor()')+'</div>'+
 (!debts.length?'<p>Añade el saldo actual del carro, la tarjeta, ICETEX o un préstamo familiar. Puedes tener varias deudas del mismo tipo.</p>':'')+
 '<div class="grid">'+debts.map(debt=>{
  const payments=debtPayments(debt.id).sort((a,b)=>b.move[2].localeCompare(a.move[2])||b.index-a.index),paid=paidAmount(debt.id),remaining=Math.round((debt.amount-paid)*100)/100,ref="'"+debt.id+"'";
  return '<article class="panel"><small>'+safe(debt.kind)+' · '+(remaining?'Pendiente':'Pagada')+'</small><h2>'+safe(debt.name)+'</h2><p>Acreedor · '+safe(debt.creditor)+'</p>'+row('Pendiente',pesos(remaining))+row('Abonado',pesos(paid)+' de '+pesos(debt.amount))+'<progress aria-label="Deuda pagada" max="'+debt.amount+'" value="'+paid+'"></progress><div class="controls">'+(remaining?action('Registrar abono','payDebt('+ref+')'):'')+action('Editar deuda','debtEditor('+ref+')')+(payments.length?'':action('Eliminar','removeDebt('+ref+')'))+'</div>'+(payments.length?'<details><summary>Historial de abonos ('+payments.length+')</summary>'+payments.map(({move,index})=>'<div class="row">'+safe(move[2])+' · '+pesos(-move[1])+action('Editar','payDebt('+ref+','+index+')')+action('Eliminar','deleteMove('+index+')')+'</div>').join('')+'</details>':'')+'</article>';
 }).join('')+'</div>';
}
function statisticsView(){
 const period=ui.statsPeriod||'Mes',month=ui.statsMonth||ui.financeMonth||today().slice(0,7),year=month.slice(0,4);
 const keys=[...new Set(state.moves.map(move=>move[2].slice(0,7)))].sort();
 const monthsToShow=period==='Histórico'?keys:Array.from({length:12},(_,index)=>year+'-'+String(index+1).padStart(2,'0'));
 const monthly=monthsToShow.map(key=>financeSnapshot(key));
 const selected=period==='Mes'?[financeSnapshot(month)]:monthly;
 const spending=new Map();let income=0,spent=0;
 for(const snap of selected){income+=snap.income;spent+=snap.spent;for(const [category,amount] of snap.spending)spending.set(category,(spending.get(category)||0)+amount)}
 const top=[...spending].sort((a,b)=>b[1]-a[1])[0],scale=Math.max(1,...monthly.flatMap(item=>[item.income,item.spent]));
 const label=period==='Mes'?months(month):period==='Año'?year:'Todo el historial';
 return hero('Finanzas · COP','Estadísticas','Ingresos, salidas de dinero y distribución por categoría.')+
 '<section class="panel"><div class="moduleHead"><h2>'+safe(label)+'</h2><div class="controls"><label>Período <select onchange="ui.statsPeriod=this.value;render()">'+['Mes','Año','Histórico'].map(name=>'<option '+(period===name?'selected':'')+'>'+name+'</option>').join('')+'</select></label>'+(period!=='Histórico'?'<label>Mes de referencia <input type="month" class="field" value="'+month+'" onchange="if(this.value){ui.statsMonth=this.value;render()}"></label>':'')+'</div></div>'+
 metrics([['Ingresos',pesos(income)],['Salidas',pesos(spent)],['Flujo neto',pesos(income-spent)]])+(top?'<p>Mayor salida: <b>'+safe(top[0])+'</b> · '+pesos(top[1])+' ('+(100*top[1]/spent).toLocaleString('es-CO',{maximumFractionDigits:1})+' %).</p>':'<p>Sin salidas registradas en este período.</p>')+'</section>'+
 financeCharts({income,spent,spending,periodLabel:label})+
 '<section class="panel"><h2>Comparación mensual'+(period==='Histórico'?'':' · '+year)+'</h2><p>Ingresos en verde y salidas en violeta. Toca un mes para ver su distribución.</p>'+monthly.map(item=>'<button class="statMonth" onclick="ui.statsMonth=\''+item.month+'\';ui.statsPeriod=\'Mes\';render()"><b>'+safe(months(item.month))+'</b><span><i style="width:'+100*item.income/scale+'%"></i>'+pesos(item.income)+'</span><span><i style="width:'+100*item.spent/scale+'%"></i>'+pesos(item.spent)+'</span></button>').join('')+'</section><p>Los abonos aparecen en «Pago de deudas». Los ahorros reservados para Casa se contabilizan como gasto cuando registras la compra.</p>';
}
function financeSnapshot(month){
 const entries=state.moves.map(([name,amount,date,category],index)=>({name,amount,date,category,index})).filter(entry=>entry.date.slice(0,7)===month).sort((a,b)=>b.date.localeCompare(a.date)||b.index-a.index);
 const income=entries.reduce((sum,item)=>sum+Math.max(0,item.amount),0),spent=entries.reduce((sum,item)=>sum-Math.min(0,item.amount),0);
 const spending=new Map();for(const item of entries)if(item.amount<0)spending.set(item.category,(spending.get(item.category)||0)-item.amount);
 return {month,entries,income,spent,spending,limit:state.workspace.financeBudgets[month]??state.budget};
}
function financeCharts(snapshot){
 const {income,spent,spending}=snapshot,max=Math.max(1,income,spent),colors=['#b9a6f6','#77cdbd','#e7b488','#8abbe4','#d1b7d8','#a1b77c','#e09eb2','#96a4bc'];
 const slices=[...spending].sort((a,b)=>b[1]-a[1]);let offset=0;
 const stops=slices.map(([,amount],index)=>{const start=offset;offset+=amount/spent*100;return colors[index%colors.length]+' '+start+'% '+offset+'%'}).join(',');
 const bars=[['Ingresos',income,'#83cbb8'],['Gastos',spent,'#c2a5ec']].map(([label,value,color])=>'<div class="flowLine"><div><span>'+label+'</span><b>'+pesos(value)+'</b></div><i><em style="width:'+value/max*100+'%;background:'+color+'"></em></i></div>').join('');
 return '<div class="financeCharts"><section class="panel"><small>'+safe(snapshot.periodLabel||'Flujo del mes')+' · COP</small><h3>Ingresos y gastos</h3>'+bars+'<div class="netLine">Flujo neto <b>'+pesos(income-spent)+'</b></div></section><section class="panel"><small>Distribución del gasto</small><h3>¿En qué gasté?</h3><div class="distribution"><div aria-hidden="true" class="expenseRing" style="background:'+(slices.length?'conic-gradient('+stops+')':'#354051')+'"><i></i></div><div class="ringLegend">'+(slices.map(([name,amount],index)=>'<div><i style="background:'+colors[index%colors.length]+'"></i><span>'+safe(name)+' · '+(100*amount/spent).toLocaleString('es-CO',{maximumFractionDigits:1})+' %</span><b>'+pesos(amount)+'</b></div>').join('')||'<p>Sin gastos este mes.</p>')+'</div></div></section></div>';
}
function dashboardMoney(){
 const month=today().slice(0,7);return '<section id="dashboardMoney"><div class="moduleHead"><div><small>'+months(month)+'</small><h2>Resumen financiero</h2></div>'+action('Ver finanzas',"ui.financeMonth=today().slice(0,7);go(1)")+'</div>'+financeCharts(financeSnapshot(month))+'</section>';
}
function entryForm(date){
 return '<form class="panel entryForm" id="movement"><small>Finanzas · COP</small><h1>Registrar movimiento</h1><fieldset class="kindPicker"><legend>Tipo de movimiento</legend><label><input type="radio" name="sign" value="-1" checked>↗ Gasto</label><label><input type="radio" name="sign" value="1">↙ Ingreso</label></fieldset><label class="amountLabel">Monto en pesos colombianos<div class="amountField"><b>$</b><input name="amount" inputmode="decimal" placeholder="0" required></div></label><label>Concepto <input class="field" name="concept" maxlength="80" placeholder="Ej. Mercado semanal" required></label><div class="entryPair"><label>Fecha <input class="field" name="date" type="date" required value="'+date+'"></label><label>Categoría <select name="category">'+financeCategories.map(name=>'<option>'+name+'</option>').join('')+'</select></label></div><button class="action">Registrar gasto</button></form>';
}
function financeView(){
 const area=ui.financeArea||'Movimientos';
 const tabs='<div class="wellTabs" aria-label="Secciones de finanzas">'+['Movimientos','Deudas','Estadísticas'].map(name=>'<button aria-pressed="'+(area===name)+'" onclick="ui.financeArea=\''+name+'\';render()">'+name+'</button>').join('')+'</div>';
 if(area!=='Movimientos'){by('view').innerHTML=tabs+(area==='Deudas'?debtsView():statisticsView());return}
 const month=ui.financeMonth||today().slice(0,7),snapshot=financeSnapshot(month);
 const {entries,income,spent,spending,limit}=snapshot;
 const date=month===today().slice(0,7)?today():month+'-01';
 by('view').innerHTML='<div class="financeFront">'+entryForm(date)+'<div class="financeAside"><div class="balanceBox"><small>Saldo total · COP</small><strong>'+pesos(balance())+'</strong>'+row('Reservado para Casa',pesos(houseReserved()))+row('Dinero libre',pesos(freeBalance()))+(freeBalance()<0?'<p>Las reservas superan el saldo registrado.</p>':'')+action('Abrir Casa','go(5)')+'</div><label class="financePeriod">Resumen de <input class="field" type="month" id="financeMonth" value="'+safe(month)+'"></label>'+financeCharts(snapshot)+'</div></div>'+
 '<form class="panel" id="budgetForm"><h2>Presupuesto del mes</h2><p>'+money(spent)+' utilizados de '+money(limit)+'</p><progress aria-label="Presupuesto utilizado" max="'+limit+'" value="'+Math.min(spent,limit)+'"></progress><h3>'+(spent>limit?'Exceso de presupuesto · ':'Queda disponible · ')+money(Math.abs(limit-spent))+'</h3><label>Límite en COP <input class="field" name="amount" inputmode="decimal" required value="'+limit.toLocaleString('de-DE')+'"></label><button>Guardar límite</button></form>'+
 '<section class="panel"><h2>Movimientos del mes</h2>'+(entries.map(item=>'<div class="row"><div><b>'+safe(item.name)+'</b><br><small>'+dateLabel(item.date)+' · '+safe(item.category)+'</small></div><b>'+money(item.amount)+'</b><div class="controls">'+action('Editar','editMove('+item.index+')')+action('Eliminar','deleteMove('+item.index+')')+'</div></div>').join('')||'<p>Aún no hay movimientos este mes.</p>')+'</section>'+
 '<div class="grid"><section class="panel"><h2>Gastos por categoría</h2>'+([...spending].sort((a,b)=>b[1]-a[1]).map(([name,amount])=>row(safe(name),money(amount))+'<progress aria-label="'+safe(name)+'" value="'+amount+'" max="'+spent+'"></progress>').join('')||'<p>Aún no hay gastos este mes.</p>')+'</section>'+deck('goals','Metas de ahorro')+'</div>'+usdArchive();
 by('financeMonth').onchange=event=>{if(event.target.value){ui.financeMonth=event.target.value;render()}};
 by('view').insertAdjacentHTML('afterbegin',tabs);
 const movement=by('movement');
 movement.querySelector('.kindPicker').onchange=()=>{
  const incoming=movement.elements.sign.value==='1';
  movement.elements.category.value=incoming?'Salario':'Alimentación';
  movement.elements.concept.placeholder=incoming?'Ej. Pago de nómina':'Ej. Mercado semanal';
  movement.querySelector('.action').textContent=incoming?'Registrar ingreso':'Registrar gasto';
 };
 const form=by('budgetForm');setupMovement(form);form.onsubmit=event=>{event.preventDefault();if(form.reportValidity()){state.workspace.financeBudgets[month]=Number(form.elements.amount.value.replaceAll('.','').replace(',','.'));saveView()}};
}
