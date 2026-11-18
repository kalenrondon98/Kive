const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1320,height:1080},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const click=name=>page.getByRole('button',{name,exact:true}).first().click();
 const snap=(selector,name)=>page.locator(selector).screenshot({path:path.resolve('outputs/'+name+'.png'),style:'nav{visibility:hidden}'});
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
 await click('Kive Travel');await click('Itinerario y mapa');await click('Ver parada 2');
 assert.match(await page.locator('#planner .routeCard h3').textContent(),/Laguna/);
 assert.match(await page.getByRole('link',{name:'Calcular ruta en Maps'}).getAttribute('href'),/destination=/);
 await snap('#routeBoard','Mapa-e-itinerario');
 await page.locator('#placeSearch').fill('laguna');await click('＋ Laguna Amarga');
 await page.locator('dialog[open] input[name=name]').fill('Picnic');await click('Guardar');assert.equal(await page.locator('#routeBoard circle').count(),4);
 await page.route('**/geocoding-api.open-meteo.com/**',route=>route.fulfill({json:{results:[{name:'Cusco',country:'Perú',latitude:-13.52,longitude:-71.97}]}}));
 await page.locator('#placeSearch').fill('Cusco');await click('Buscar ciudad en línea');await page.getByRole('button',{name:'＋ Cusco, Perú'}).waitFor();
 await page.route('**/www.openstreetmap.org/**',route=>route.fulfill({body:'Mapa simulado de prueba'}));await click('Ver calles en línea');assert.match(await page.locator('#streetView iframe').getAttribute('src'),/marker=/);
 await click('Gastos');await page.getByLabel('Quién pagó Dos noches').selectOption('Alex');assert.match(await page.locator('#view').innerText(),/Aporta/);
 await click('Inicio');await click('Negocios');await snap('#moduleWorkspace','Negocios');
 async function register(values){await click('＋ Registrar');const dialog=page.locator('dialog[open]');for(const [key,value] of Object.entries(values)){const input=dialog.locator('[name='+key+']');if(await input.evaluate(el=>el.tagName==='SELECT'))await input.selectOption(value);else await input.fill(value)}await dialog.getByRole('button',{name:'Guardar',exact:true}).click()}
 await register({name:'Impresión',amount:'10',kind:'Gasto'});assert.match(await page.locator('.entity .metrics').innerText(),/145/);
 await click('Estudios');await register({name:'Repaso',minutes:'25',status:'Por repasar'});assert.match(await page.locator('.entity .metrics').innerText(),/100 min/);await snap('#moduleWorkspace','Estudios');
 await click('Inventario');await register({name:'Salida de prueba',units:'4',kind:'Salida'});assert.match(await page.locator('dialog[open] [role=alert]').innerText(),/supera/);await page.locator('dialog[open] input[name=units]').fill('1');await click('Guardar');await snap('#moduleWorkspace','Inventario');
 await click('Vehículos');await register({name:'Revisión de cadena',km:'1600',amount:'8'});await snap('#moduleWorkspace','Vehiculos');
 await click('Agenda');await click('＋ Evento este día');const dialog=page.locator('dialog[open]');await dialog.locator('[name=name]').fill('Revisar presupuesto');await dialog.locator('[name=details]').fill('Comparar los gastos de noviembre');await click('Guardar');await snap('#calendar','Agenda');
 await page.reload();await click('Negocios');assert.match(await page.locator('#moduleWorkspace').innerText(),/Impresión/);await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.deepEqual(errors,[]);console.log('6 capturas verificadas. Planificador, reparto, calendario, historiales, validación y persistencia correctos.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
