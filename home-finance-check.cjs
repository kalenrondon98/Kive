const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  await page.locator('nav').getByText('Finanzas').click();const before=await page.evaluate(()=>[balance(),freeBalance(),state.moves.length]);
  await click('Abrir Casa');const card=page.locator('.houseItem').filter({has:page.getByRole('heading',{name:'Nevera'})});
  await card.getByText('＋ Aporte').click();await page.locator('dialog[open] [name=amount]').fill('50000');await click('Guardar');
  assert.deepEqual(await page.evaluate(()=>[balance(),freeBalance(),state.moves.length]),[before[0],before[1]-50000,before[2]]);
  await card.getByText('Registrar compra').click();await page.locator('dialog[open] [name=amount]').fill('420000');await click('Guardar');await click('Volver a Finanzas');
  assert.deepEqual(await page.evaluate(()=>[balance(),freeBalance(),state.moves.length]),[before[0]-420000,before[1]-120000,before[2]+1]);
  await page.locator('nav').getByText('Inicio').click();await click('Configuración');
  await page.getByLabel('Nuestra futura casa',{exact:true}).uncheck();await page.getByLabel('Pendientes de hoy',{exact:true}).check();await click('Subir Pendientes de hoy');await click('Listo');await page.reload();
  assert.ok(await page.locator('[data-home-block=house]').isHidden());assert.ok(await page.locator('[data-home-block=tasks]').isVisible());assert.equal(await page.evaluate(()=>[...document.querySelectorAll('[data-home-block]')][2].dataset.homeBlock),'tasks');
  await click('Configuración');await page.getByLabel('Organización',{exact:true}).uncheck();await click('Listo');await page.locator('#dailyAlert').click();assert.ok(await page.locator('#agendaDay').isVisible());assert.deepEqual(errors,[]);
  console.log('Aporte, compra única, saldo libre, accesos, orden, visibilidad y persistencia verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
