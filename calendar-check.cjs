const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},timezoneId:'America/Bogota'});
  await page.clock.install({time:new Date('2026-11-18T12:00:00-05:00')});
  await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
  await page.locator('#dailyAlert').click();
  async function add(name,date){
   await page.getByText('＋ Evento este día',{exact:true}).click();const form=page.locator('dialog[open]');await form.locator('[name=name]').fill(name);await form.locator('[name=date]').fill(date);await form.locator('textarea').fill('Ejemplo');await form.getByText('Guardar',{exact:true}).click();
  }
  await add('Comprar víveres','2026-11-18');await add('Revisar gastos','2026-11-19');
  assert.equal(await page.locator('#dailyAlert').textContent(),'1 pendiente hoy');
  assert.match(await page.locator('.calDay').filter({hasText:'Revisar gastos'}).textContent(),/^19/);
  await page.locator('nav').getByText('Finanzas').click();await page.locator('#dailyAlert').click();assert.equal(await page.locator('.calDay.active .calTask').textContent(),'Comprar víveres');
  await page.getByRole('button',{name:'Completar',exact:true}).click();await page.reload();assert.equal(await page.locator('#dailyAlert').textContent(),'Hoy al día');
  await page.clock.fastForward('12:01:00');assert.equal(await page.locator('#dailyAlert').textContent(),'1 pendiente hoy');await page.locator('#dailyAlert').click();assert.match(await page.locator('.calDay.active').textContent(),/Revisar gastos/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));console.log('Fechas, aviso, acceso directo, completar, recarga y cambio de día verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
