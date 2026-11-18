const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());page.setDefaultTimeout(4500);
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
 const click=name=>page.getByRole('button',{name,exact:true}).click();
 assert.equal(await page.getByText('Buscar en Kive',{exact:true}).count(),0);
 await click('Configuración');await page.keyboard.press('Escape');await click('Carro');
 async function add(date,kind,amount){
  await click(kind?'Registrar gasto':'Registrar ingreso');
  const form=page.locator('dialog[open]');await form.locator('[name=date]').fill(date);
  if(kind)await form.locator('[name=kind]').selectOption(kind);
  await form.locator('[name=amount]').fill(amount);await click('Guardar');
 }
 await add('2026-10-31','Reparaciones','50000');
 await add('2026-11-01','','200000');await add('2026-11-01','Comisión de Uber','40000');
 await add('2026-11-02','Gasolina','30000');await add('2026-11-02','Meriendas','10000');
 await add('2026-11-02','Otros','8000');await add('2026-11-02','','150000');
 await page.locator('.carItem').first().locator('summary').click();await click('Editar');
 await page.locator('dialog[open] [name=amount]').fill('35000');await click('Guardar');
 await page.locator('.carItem').filter({hasText:'Otros'}).locator('summary').click();await click('Eliminar');
 assert.match(await page.locator('.carTop').innerText(),/105\.000/);
 assert.match(await page.locator('.carPage').innerText(),/265\.000/);
 assert.match(await page.locator('.carPage').innerText(),/132\.500/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.reload();await page.getByLabel('Mes del balance').fill('2026-10');assert.match(await page.locator('.carPage').innerText(),/50\.000/);
 await page.getByLabel('Mes del balance').fill('2026-11');await click('Ver jornada del 2026-11-02');
 await page.setViewportSize({width:1200,height:900});await page.screenshot({path:'outputs/Carro-ejemplo.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('Jornadas, estadísticas, edición, eliminación, fechas, persistencia y ancho móvil verificados.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
