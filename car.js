const carKinds=['Ingreso bruto','Comisión de Uber','Meriendas','Reparaciones','Gasolina','Otros'];
const carColors=['#afadff','#f6b178','#78cfbb','#83b8fa','#d998b6'];
let carDate=today();
function carEditor(expense,index=-1){
 const entries=state.workspace.carEntries;
 const fields=[{key:'date',label:'Fecha de la jornada',type:'date'}];
 if(expense)fields.push({key:'kind',label:'Categoría',type:'select',values:carKinds.slice(1)});
 fields.push({key:'amount',label:expense?'Gasto en COP':'Ingreso antes de comisión en COP',type:'money'},
  {key:'note',label:'Detalle (opcional)',type:'text',optional:true});
 editor(index>=0?'Editar movimiento':expense?'Registrar gasto':'Registrar ingreso',fields,entries[index]||{date:carDate},values=>{
  if(!Number.isSafeInteger(values.amount)||values.amount<=0)return 'Escribe un valor positivo en pesos enteros.';
  values.kind??=carKinds[0];
  if(index<0)entries.push(values);else entries[index]=values;
  carDate=values.date;
 });
}
function deleteCarEntry(index){
 if(confirm('¿Eliminar este movimiento del carro?')){state.workspace.carEntries.splice(index,1);saveView()}
}
function selectCarDate(date){if(date){carDate=date;render()}}
function carSummary(entries){
 const days={},categories=Array(5).fill(0);
 let income=0,expense=0;
 for(const entry of entries){
  const day=days[entry.date]??={income:0,expense:0};
  const kind=carKinds.indexOf(entry.kind);
  if(kind===0){day.income+=entry.amount;income+=entry.amount}
  else if(kind>0){day.expense+=entry.amount;expense+=entry.amount;categories[kind-1]+=entry.amount}
 }
 return {days,categories,income,expense};
}
function carCharts(summary){
 const days=Object.entries(summary.days).sort(([a],[b])=>a.localeCompare(b));
 const max=Math.max(1,...days.flatMap(([,day])=>[day.income,day.expense]));
 const bars=days.map(([date,day])=>`<button class="carBarRow" aria-label="Ver jornada del ${date}" onclick="selectCarDate('${date}')"><b>${date.slice(-2)}</b><span><i style="width:${day.income/max*100}%"></i><i style="width:${day.expense/max*100}%"></i></span><small>${pesos(day.income)}<br>${pesos(day.expense)}</small></button>`).join('');
 let start=0;const stops=[];
 const legend=summary.categories.map((amount,i)=>{
  const end=start+(summary.expense?amount/summary.expense*100:0);
  if(amount)stops.push(carColors[i]+' '+start+'% '+end+'%');
  start=end;
  return `<div class="carLegend"><i style="background:${carColors[i]}"></i><span>${carKinds[i+1]}</span><b>${pesos(amount)}</b><small>${summary.expense?(100*amount/summary.expense).toLocaleString('es-CO',{maximumFractionDigits:1}):0} %</small></div>`;
 }).join('');
 return `<div class="carCharts"><section class="panel"><h2>Ingresos y gastos por día</h2><p class="carKey"><i></i>Ingresos <i></i>Gastos</p><div class="carBars">${bars||'<p>Las barras aparecerán con tu primera jornada.</p>'}</div></section>
 <section class="panel"><h2>¿En qué se fue la plata?</h2><div class="carRing" aria-hidden="true" style="background:${stops.length?'conic-gradient('+stops.join(',')+')':'#343b50'}"><span>Gastos<br><b>${pesos(summary.expense)}</b></span></div>${legend}</section></div>`;
}
function carView(){
 const entries=state.workspace.carEntries??=[];
 const month=carDate.slice(0,7);
 const summary=carSummary(entries.filter(entry=>entry.date.startsWith(month)));
 const day=summary.days[carDate]||{income:0,expense:0};
 const count=Object.keys(summary.days).length;
 const list=entries.map((entry,index)=>entry.date===carDate?`<article class="carItem"><div><b>${safe(entry.kind)}</b>${entry.note?'<small>'+safe(entry.note)+'</small>':''}</div><strong>${entry.kind===carKinds[0]?'+':'−'} ${pesos(entry.amount)}</strong><details><summary>Opciones</summary>${action('Editar','carEditor('+String(entry.kind!==carKinds[0])+','+index+')')}${action('Eliminar','deleteCarEntry('+index+')')}</details></article>`:'').join('');
 by('view').innerHTML=`<div class="carPage"><section class="panel carTop"><small>Carro · Uber</small><h1>Mi jornada</h1><label>Día de trabajo<input class="field" type="date" value="${carDate}" onchange="selectCarDate(this.value)"></label>
 ${metrics([['Ingresos brutos',pesos(day.income)],['Gastos del día',pesos(day.expense)],['Ganancia del día',pesos(day.income-day.expense)]])}
 <div class="carActions"><button class="action" onclick="carEditor(false)">Registrar ingreso</button><button onclick="carEditor(true)">Registrar gasto</button></div></section>
 <section class="panel"><h2>Movimientos del día</h2>${list||'<p>Todavía no hay movimientos para esta fecha.</p>'}</section>
 <section class="panel"><h2>Balance mensual</h2><label>Mes del balance<input class="field" type="month" value="${month}" onchange="if(this.value)selectCarDate(this.value+'-01')"></label>
 ${metrics([['Ingresos brutos',pesos(summary.income)],['Gastos totales',pesos(summary.expense)],['Ganancia neta',pesos(summary.income-summary.expense)],['Promedio neto por día registrado',pesos(count?Math.round((summary.income-summary.expense)/count):0)]])}
 <small>${count} ${count===1?'día con movimientos':'días con movimientos'} · Valores en pesos colombianos</small></section>${carCharts(summary)}</div>`;
}
