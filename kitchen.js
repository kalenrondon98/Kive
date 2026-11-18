const mealSlots=['Desayuno','Media mañana','Almuerzo','Onces','Cena'];
const foodGroups={
 B:[
 ['Arepa con perico y papaya','arepa 70|huevo 100|tomate 60|cebolla 20|papaya 120','Asa la arepa. Cocina el tomate y la cebolla picados con un poco de agua. Agrega los huevos batidos y revuelve hasta que cuajen. Sirve con la papaya.'],
 ['Avena cremosa con banano','avena 50|leche 200|banano 100|maní 15','Hierve la avena con la leche a fuego bajo, revolviendo hasta espesar. Sirve con banano en rodajas y maní picado.'],
 ['Calentado de fríjol con huevo','fríjol 110|arroz integral 90|huevo 50|tomate 70|aguacate 35','Saltea el tomate con un chorrito de agua. Añade fríjol y arroz, calienta bien y sirve con huevo cocido y aguacate.'],
 ['Tostadas con ricota y mango','pan integral 70|ricota 70|mango 130|semillas de girasol 10','Tuesta el pan, unta la ricota y añade el mango en láminas. Termina con las semillas.'],
 ['Tortilla de espinaca y papa','huevo 100|papa 150|espinaca 65|mandarina 100|aceite 5','Dora la papa cocida en cubos con el aceite, incorpora la espinaca y vierte el huevo batido. Tapa hasta que cuaje. Acompaña con mandarina.'],
 ['Quinua con yogur y mora','quinua 150|yogur natural 170|mora 90|nueces 15','Deja enfriar la quinua cocida y mézclala con el yogur. Añade las moras lavadas y las nueces picadas.'],
 ['Arepa de aguacate y queso','arepa 80|aguacate 55|queso fresco 50|guayaba 100','Calienta la arepa, ábrela y rellena con aguacate machacado y queso. Sirve con guayaba.'],
 ['Pancakes de avena y pera','avena 45|huevo 50|leche 70|pera 130|yogur natural 70','Tritura avena, huevo, leche y media pera. Cocina porciones pequeñas en sartén antiadherente por ambos lados hasta que el centro esté cocido. Añade el yogur y la pera restante.']
 ],
 S:[
 ['Yogur con papaya','yogur natural 150|papaya 120','Corta la papaya en dados y sírvela con yogur natural.'],
 ['Manzana con maní tostado','manzana 140|maní 20','Corta la manzana en gajos y acompaña con maní tostado sin sal.'],
 ['Pepino con crema de garbanzo','pepino 120|garbanzo 90|limón 15|aceite 5','Tritura el garbanzo con el limón, aceite y agua hasta lograr una crema. Sirve con bastones de pepino.'],
 ['Mandarina y queso fresco','mandarina 150|queso fresco 45','Pela la mandarina y acompaña los gajos con cubos de queso.'],
 ['Tostada con aguacate','pan integral 40|aguacate 50|tomate 50','Tuesta el pan, cubre con aguacate machacado y termina con rodajas de tomate.'],
 ['Mango con yogur y avena','mango 100|yogur natural 100|avena 15','Cocina la avena en agua hasta ablandarla. Enfría y sirve con mango picado y yogur.'],
 ['Banano con nueces','banano 100|nueces 15','Corta el banano en rodajas y espolvorea las nueces picadas.'],
 ['Guayaba con ricota','guayaba 130|ricota 60','Lava la guayaba, córtala en cuartos y sirve con la ricota.']
 ],
 M:[
 ['Lentejas guisadas con arroz','lenteja 170|arroz integral 130|zanahoria 80|tomate 80|aguacate 45','Cocina tomate y zanahoria picados en un poco de agua. Incorpora las lentejas cocidas y deja espesar. Acompaña con arroz y aguacate.'],
 ['Trucha con papa y ensalada','trucha 150|papa 200|repollo 80|zanahoria 60|aceite 8','Asa la trucha con el aceite hasta que esté cocida. Sirve con papa cocida y ensalada de repollo y zanahoria rallada.'],
 ['Arroz con pollo y arvejas','pollo 120|arroz integral 150|arveja 80|pimentón 70|aceite 5','Ablanda el pimentón en aceite, añade las arvejas cocidas y el pollo cocido desmechado. Mezcla con el arroz y calienta bien.'],
 ['Garbanzos con ahuyama','garbanzo 160|ahuyama 180|quinua 110|tomate 80|aceite 5','Cocina la ahuyama y el tomate en cubos con un poco de agua. Añade los garbanzos, cocina hasta espesar y sirve sobre quinua con aceite.'],
 ['Pasta integral con atún','pasta integral 160|atún 100|tomate 130|espinaca 75|aceite 8','Cocina el tomate picado con aceite hasta formar una salsa. Agrega la espinaca y el atún escurrido. Mezcla con la pasta cocida.'],
 ['Fríjoles con plátano asado','fríjol 180|plátano 140|tomate 90|aguacate 45','Asa el plátano maduro en tajadas. Calienta los fríjoles con tomate picado y acompaña con el plátano y aguacate.'],
 ['Ensalada tibia de quinua y huevo','quinua 160|huevo 100|pepino 80|zanahoria 80|aguacate 40','Cuece los huevos hasta que estén firmes. Mezcla la quinua tibia con los vegetales picados y sirve con los huevos en cuartos.'],
 ['Sudado de pollo con yuca','pollo 130|yuca 160|tomate 100|cebolla 40|zanahoria 70','Haz un guiso de tomate y cebolla. Agrega agua y zanahoria; cuando esté blanda, añade yuca bien cocida y pollo cocido. Calienta todo junto.'],
 ['Crema de ahuyama con alubias','ahuyama 220|fríjol 140|leche 100|pan integral 65|aceite 5','Cuece la ahuyama hasta ablandarla y licúa con leche. Añade fríjoles cocidos, calienta y termina con aceite. Sirve con pan tostado.'],
 ['Arepa rellena de pollo','arepa 100|pollo 100|aguacate 50|repollo 80|tomate 80','Asa la arepa y rellena con pollo cocido desmechado, aguacate y tomate. Acompaña con repollo en tiras.'],
 ['Salteado de tofu y brócoli','tofu 160|brócoli 150|arroz integral 160|zanahoria 70|aceite 8','Dora cubos de tofu en aceite. Agrega las verduras picadas y un chorrito de agua; tapa hasta que estén tiernas. Sirve con arroz.'],
 ['Pasta con lentejas y tomate','pasta integral 150|lenteja 130|tomate 140|cebolla 40|aceite 5','Sofríe la cebolla en aceite, agrega el tomate picado y cocina hasta que se deshaga. Mezcla con las lentejas y sirve sobre la pasta.'],
 ['Bowl de maíz, fríjol y aguacate','maíz 140|fríjol 160|aguacate 60|pimentón 80|limón 15','Calienta maíz y fríjoles cocidos. Añade pimentón en cubos y aguacate, y termina con zumo de limón.'],
 ['Tortilla de garbanzos y espinaca','garbanzo 110|huevo 100|espinaca 80|papa 130|aceite 5','Machaca el garbanzo cocido y mézclalo con huevo batido y espinaca picada. Cocina en sartén con aceite hasta cuajar por ambos lados. Acompaña con papa cocida.'],
 ['Pescado con puré de yuca','trucha 130|yuca 160|leche 50|brócoli 150|aceite 5','Machaca la yuca bien cocida con leche caliente. Asa el pescado con aceite hasta que esté cocido y sirve con brócoli al vapor.'],
 ['Sopa espesa de arvejas','arveja 180|papa 160|zanahoria 80|pollo 80|cebolla 30','Cocina la cebolla y la zanahoria en agua; añade papa cocida y arvejas. Tritura una parte para espesar y termina con pollo cocido desmechado.']
 ]};
const energyPer100={arepa:215,huevo:145,tomate:18,cebolla:40,papaya:43,avena:380,leche:55,banano:89,maní:570,fríjol:127,'arroz integral':123,aguacate:160,'pan integral':247,ricota:160,mango:60,'semillas de girasol':580,papa:87,espinaca:23,mandarina:53,aceite:884,quinua:120,'yogur natural':61,mora:43,nueces:650,'queso fresco':250,guayaba:68,pera:57,manzana:52,pepino:15,garbanzo:164,limón:29,lenteja:116,zanahoria:41,trucha:168,repollo:25,pollo:165,arveja:84,pimentón:31,ahuyama:30,'pasta integral':149,atún:116,plátano:122,yuca:150,tofu:120,brócoli:35,maíz:96};
const cookbook=Object.entries(foodGroups).flatMap(([group,rows])=>rows.map(([name,list,steps],index)=>{
 const foods=list.split('|').map(part=>{const cut=part.lastIndexOf(' ');return {name:part.slice(0,cut),grams:Number(part.slice(cut+1))}});
 return {id:group+index,group,name,foods,steps,kcal:foods.reduce((sum,item)=>sum+item.grams*energyPer100[item.name]/100,0)};
}));
const fold=value=>value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function foodTerms(value){return fold(value).split(/[,;\n]/).map(term=>term.trim()).filter(Boolean)}
function containsFood(recipe,term){return recipe.foods.some(item=>fold(item.name).includes(term)||term===fold(item.name)+'s'||term===fold(item.name)+'es')}
function energyReference(profile){
 if(!profile||state.workspace.kitchen.standardPortions)return null;
 const female=profile.sex==='Femenina',index=['Inactiva','Poco activa','Activa','Muy activa'].indexOf(profile.activity);
 const [base,height,weight]=(female?[[584.90,5.72,11.71],[575.77,6.60,12.14],[710.25,6.54,12.34],[511.83,9.07,12.56]]:[[753.07,6.50,14.10],[581.47,8.30,14.94],[1004.82,6.52,15.91],[-517.88,15.61,19.11]])[index];
 return base-(female?7.01:10.83)*profile.age+height*profile.height+weight*profile.weight;
}
function kitchenProfile(){
 const model=state.workspace.kitchen;
 editor('Perfil orientativo · Adultos de 19 años o más',[field('age','Edad en años','number',{min:19,max:110,step:1}),field('height','Estatura en cm','number',{min:100,max:250}),...(!model.profile?[field('weight','Peso actual en kg','number',{min:30,max:350,step:0.01})]:[]),field('sex','Ecuación de referencia','select',{values:['Femenina','Masculina']}),field('activity','Actividad habitual','select',{values:['Inactiva','Poco activa','Activa','Muy activa']})],model.profile||{},values=>{model.profile={...model.profile,...values};if(values.weight)recordWeeklyWeight(values.weight)});
}
function candidates(slot){
 const blocked=foodTerms(state.workspace.kitchen.avoid),group=['B','S','M','S','M'][slot];
 return cookbook.filter(recipe=>recipe.group===group&&!blocked.some(term=>containsFood(recipe,term)));
}
function dayMenu(date){
 const model=state.workspace.kitchen,plan=model.plans[date]??=[],used=new Set(),seed=Math.floor(Date.parse(date)/86400000);
 return mealSlots.map((label,slot)=>{
  const allowed=candidates(slot),unique=allowed.filter(recipe=>!used.has(recipe.id)),pool=unique.length?unique:allowed;
  const recipe=allowed.find(item=>item.id===plan[slot])||pool[(seed+slot*3)%pool.length];
  if(recipe)used.add(recipe.id);return recipe;
 });
}
function recipeScale(recipe,slot){
 const reference=energyReference(state.workspace.kitchen.profile);
 if(!reference)return 1;
 return Math.min(1.75,Math.max(.75,Math.round(reference*[.25,.09,.32,.09,.25][slot]/recipe.kcal*4)/4));
}
function selectDish(date,slot,id){
 const model=state.workspace.kitchen;
 model.plans[date]=dayMenu(date).map(recipe=>recipe?.id||null);model.plans[date][slot]=id;saveView();
}
function swapDish(date,slot){
 const menu=dayMenu(date),options=candidates(slot).filter(item=>!menu.some((recipe,index)=>index!==slot&&recipe?.id===item.id));
 if(options.length<2)return;
 const index=options.findIndex(item=>item.id===menu[slot]?.id);selectDish(date,slot,options[(index+1)%options.length].id);
}
function dishSearch(date,slot){
 const dialog=document.createElement('dialog');dialog.className='editor';dialog.innerHTML='<h2>Elegir '+mealSlots[slot].toLowerCase()+'</h2><label>Qué te apetece<input class="field" name="wish" placeholder="Ej. sopa, arepa, pollo"></label><label>Ingredientes disponibles, separados por comas<input class="field" name="pantry" placeholder="Ej. arroz, tomate, pollo"></label><label><input type="checkbox" style="width:auto"> Solo recetas que puedo hacer con esos ingredientes</label><div class="dishResults"></div><button type="button">Cerrar</button>';
 document.body.append(dialog);dialog.onclose=()=>dialog.remove();dialog.querySelector('button').onclick=()=>dialog.close();
 function update(){const pantry=foodTerms(dialog.querySelector('[name=pantry]').value),wish=fold(dialog.querySelector('[name=wish]').value.trim()),strict=dialog.querySelector('[type=checkbox]').checked;
  const matches=candidates(slot).map(recipe=>{const missing=recipe.foods.filter(item=>!pantry.some(term=>containsFood({foods:[item]},term)));return {recipe,missing,score:recipe.foods.length-missing.length}})
  .filter(({recipe,missing,score})=>(!wish||wish.split(/\s+/).filter(word=>!['con','de','y','un','una'].includes(word)).every(word=>fold(recipe.name).includes(word)||containsFood(recipe,word)))&&(!pantry.length||score>0)&&(!strict||missing.length===0)).sort((a,b)=>b.score-a.score||a.missing.length-b.missing.length);
  const list=dialog.querySelector('.dishResults');list.innerHTML=matches.length?'':'<p>Sin coincidencias. Prueba con menos filtros o cambia los ingredientes.</p>';
  for(const {recipe,missing} of matches){const button=document.createElement('button');button.innerHTML='<b>'+safe(recipe.name)+'</b>'+(pantry.length?'<br><small>'+(missing.length?'Faltan: '+safe(missing.map(item=>item.name).join(', ')):'Tienes los ingredientes')+'</small>':'');button.onclick=()=>{dialog.close();selectDish(date,slot,recipe.id)};list.append(button)}
 }
 dialog.oninput=update;update();dialog.showModal();
}
function kitchenPanel(date){
 const section=document.createElement('section'),model=state.workspace.kitchen,ref=energyReference(model.profile),menu=dayMenu(date);
 section.className='panel kitchen';section.innerHTML='<small>Menú del día · '+safe(dateLabel(date))+'</small><div class="moduleHead"><h2>Qué cocinar</h2></div><details class="mealPrefs"><summary>Preferencias y porciones</summary>'+action('Mi perfil','kitchenProfile()')+'<p>'+ (ref?'Referencia aproximada de mantenimiento: '+Math.round(ref/50)*50+' kcal/día. Las cantidades se ajustan de forma orientativa por comida.':'Porciones de ejemplo para una persona. Con tu perfil puedes adaptar las cantidades a tu peso, estatura, edad y actividad.')+'</p><div class="controls">'+action('Ingredientes que evito','avoidFoods()')+(ref?action('Usar porciones estándar','state.workspace.kitchen.standardPortions=true;saveView()'):model.profile?action('Usar mi perfil','state.workspace.kitchen.standardPortions=false;saveView()'):'')+'</div>'+(model.avoid?'<p>Evitar: '+safe(model.avoid)+'</p>':'')+ '</details><div class="dishTabs" aria-label="Comida">'+mealSlots.map((name,index)=>'<button aria-pressed="'+((ui.dishSlot||0)===index)+'" onclick="ui.dishSlot='+index+';render()">'+safe(name)+'</button>').join('')+'</div><div class="dailyDish">'+menu.map((recipe,slot)=>{
  if(slot!==(ui.dishSlot||0))return '';
  const change=action('Elegir por gusto o ingredientes',"dishSearch('"+date+"',"+slot+")");
  if(!recipe)return '<article><small>'+mealSlots[slot]+'</small><p>Sin opciones con estos filtros.</p>'+change+'</article>';
  const scale=recipeScale(recipe,slot),ingredientList=recipe.foods.map(item=>'<li>'+Math.round(item.grams*scale)+' '+(item.name==='leche'?'ml':'g')+' · '+safe(item.name)+'</li>').join('');
  return '<article><small>'+mealSlots[slot]+([1,3].includes(slot)?' · opcional':'')+'</small><h3>'+safe(recipe.name)+'</h3><div class="dishBody"><section><h4>Ingredientes por persona</h4><ul>'+ingredientList+'</ul></section><section><h4>Preparación</h4><p>'+safe(recipe.steps)+'</p></section></div><div class="controls">'+(candidates(slot).some(item=>!menu.some(other=>other?.id===item.id))?action('Otra idea',"swapDish('"+date+"',"+slot+")"):'')+change+'</div></article>';
 }).join('')+'</div><details><summary>Cómo se miden las porciones</summary><p>Pesos comestibles. Arroz, quinua, pasta, tubérculos, leguminosas, pollo y pescado se pesan cocidos; avena en seco, atún escurrido y huevo sin cáscara (aprox. 50 g por unidad). Una cucharadita de aceite equivale aproximadamente a 5 g.</p><p>La estimación opcional es para adultos desde los 19 años, fuera del embarazo y la lactancia. Los ingredientes pueden variar en energía y las meriendas son opcionales. Si tienes una condición médica o una dieta indicada, adapta las recetas con tu profesional de salud.</p><a target="_blank" rel="noreferrer" href="https://www.icbf.gov.co/guias-alimentarias-para-mayores-de-2-anos">Guía alimentaria colombiana</a> · <a target="_blank" rel="noreferrer" href="https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/dietary-reference-intakes/tables/equations-estimate-energy-requirement.html">Ecuaciones de energía para adultos</a></details>';
 return section;
}
function avoidFoods(){const model=state.workspace.kitchen;editor('Ingredientes que prefiero evitar',[field('avoid','Nombres separados por comas (ej. maní, pollo)','text',{optional:true})],model,values=>{model.avoid=values.avoid})}
