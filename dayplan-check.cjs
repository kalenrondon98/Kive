const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);const click=name=>page.getByRole('button',{name,exact:true}).click(),dialog=page.locator('dialog[open]');
 await click('Kive Travel');await click('＋ Crear viaje');
 async function city(key,query){await dialog.locator('[name='+key+']').fill(query);await dialog.locator('.cityChoices button').first().click()}
 await city('origin','bogota');await city('place','medellin');await dialog.locator('[name=start]').fill('2027-01-05');await dialog.locator('[name=end]').fill('2027-01-07');await dialog.locator('[name=name]').fill('Antioquia en tres días');await dialog.locator('[name=people]').fill('Dos viajeros');assert.match(await dialog.innerText(),/3 días · 2 noches/);await click('Guardar');
 const day=page.locator('.tripDays');await day.waitFor();assert.match(await day.innerText(),/Bogotá.*Medellín/);
 async function activity(name,time){await click('＋ Actividad este día');await dialog.locator('[name=name]').fill(name);await dialog.locator('[name=time]').fill(time);await dialog.locator('[name=place]').fill('Punto de encuentro ficticio');await click('Guardar')}
 await activity('Visita al museo','14:00');await activity('Desayuno','08:00');assert.ok((await day.innerText()).indexOf('Desayuno')<(await day.innerText()).indexOf('Visita al museo'));
 async function hotel(name){await click('Elegir alojamiento');await dialog.locator('[name=name]').fill(name);await click('Guardar')}
 await hotel('Casa del Valle');await click('Día siguiente');await hotel('Posada del Río');await activity('Paseo por el río','10:30');await click('Día siguiente');assert.match(await day.innerText(),/Último día/);await click('Día anterior');await click('Día anterior');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.setViewportSize({width:1200,height:940});await day.screenshot({path:'outputs/Travel-dia-a-dia.png',style:'nav{visibility:hidden}'});
 await click('Exportar · Travel Book');const print=await page.locator('#printset').textContent();for(const name of ['Bogotá','Medellín','Casa del Valle','Posada del Río','Paseo por el río'])assert.ok(print.includes(name),name);
 await page.reload();assert.match(await page.locator('#printset').textContent(),/Posada del Río/);assert.deepEqual(errors,[]);console.log('Ciudades por nombre, ruta, tres días, horarios, lugar libre, alojamientos, móvil y folleto verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
