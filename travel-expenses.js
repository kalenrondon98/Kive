const travelCosts=['Taxi o traslado','Transporte terrestre','Transporte aéreo','Comidas','Tours y entradas','Alojamiento','Equipaje','Seguro de viaje','Otro'];
function travelAmounts(expenses){
 let estimated=0,paid=0,pending=0;
 for(const item of expenses){
  estimated+=item.estimate||0;paid+=item.amount;
  if(!item.amount)pending+=item.estimate||0;
 }
 return {estimated,paid,pending,forecast:pending+paid};
}
function travelExpenseEditor(index=-1){
 const current=trip(),item=current.expenses[index],categories=[...travelCosts];
 if(item&&!categories.includes(item.category))categories.push(item.category);
 const initial=item?{...item,date:item.date||planDate(),amount:item.amount||null,estimate:item.estimate||null}:{date:planDate()};
 const form=editor(item?'Editar gasto del viaje':'Añadir gasto al viaje',[
  field('name','Concepto (por ejemplo, taxi de casa al aeropuerto)'),field('date','Día del itinerario','date'),
  field('category','Categoría','select',{values:categories}),field('estimate','Costo planeado en '+current.currency+' (opcional)','money',{optional:true}),
  field('amount','Costo final pagado en '+current.currency+' (opcional)','money',{optional:true})
 ],initial,values=>{
  if(!values.estimate&&!values.amount)return 'Ingresa el costo planeado o el costo final pagado.';
  if(values.date<current.start||values.date>current.end)return 'Elige un día entre la salida y el regreso.';
  if(item){Object.assign(item,values);if(!values.amount)delete item.payer}else current.expenses.push(values);
 });
 form.elements.date.min=current.start;form.elements.date.max=current.end;
}
function travelExpensePanel(current){
 const totals=travelAmounts(current.expenses),dates=new Map();
 current.expenses.forEach((item,index)=>{const date=item.date||'';if(!dates.has(date))dates.set(date,[]);dates.get(date).push({item,index})});
 const groups=[...dates.keys()].sort((a,b)=>!a?1:!b?-1:a.localeCompare(b)).map(date=>{
  const entries=dates.get(date),total=travelAmounts(entries.map(entry=>entry.item));
  return '<section class="panel"><small>'+ (date?'Día '+tripDays(current.start,date):'Gastos anteriores')+'</small><h2>'+(date?dateLabel(date):'Sin fecha asignada')+'</h2>'+
   entries.map(({item,index})=>'<article class="row"><div><small>'+safe(item.category)+'</small><h3>'+safe(item.name)+'</h3><p>Planeado · '+(item.estimate?cost(item.estimate):'Sin estimación')+'<br>Pagado · '+(item.amount?cost(item.amount):'Pendiente')+'</p></div><div class="controls">'+action('Editar','travelExpenseEditor('+index+')')+action('Eliminar',"removeRow('expenses',"+index+")")+'</div></article>').join('')+
   row('Costo previsto del día',cost(total.forecast))+'</section>';
 }).join('');
 return '<section class="panel"><small>'+safe(current.currency)+'</small><h2>Presupuesto del viaje</h2>'+
 metrics([['Presupuesto disponible al iniciar',cost(current.limit)],['Suma de estimaciones',cost(totals.estimated)],['Total pagado',cost(totals.paid)],['Pendiente estimado',cost(totals.pending)],['Costo previsto al finalizar',cost(totals.forecast)],['Saldo previsto al regresar',cost(current.limit-totals.forecast)]])+
 '<p>Al registrar el costo final de un gasto, ese valor reemplaza su estimación en el total previsto.</p><div class="controls">'+action('Añadir gasto','travelExpenseEditor()')+action('Ajustar presupuesto','tripEditor(false)')+'</div></section>'+groups;
}
function travelBudgetLines(current){
 const totals=travelAmounts(current.expenses);
 return [{name:'Presupuesto inicial',amount:current.limit},...current.expenses.slice().sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')).map(item=>({name:(item.date?dateLabel(item.date)+' · ':'')+item.name+' · '+(item.amount?'Pagado':'Planeado'),amount:item.amount||item.estimate})),
 {name:'Pagado',amount:totals.paid},{name:'Pendiente estimado',amount:totals.pending},{name:'Costo previsto al finalizar',amount:totals.forecast},{name:'Saldo previsto',amount:current.limit-totals.forecast}];
}
