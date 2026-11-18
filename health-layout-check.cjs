const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
  const click=name=>page.getByRole('button',{name,exact:true}).click();
  await click('Salud');await click('Almuerzo');assert.equal(await page.locator('.dailyDish article').count(),1);
  const title=await page.locator('.dailyDish h3').textContent();await click('Otra idea');assert.notEqual(await page.locator('.dailyDish h3').textContent(),title);
  assert.equal(await page.getByRole('button',{name:/Registrar comida|Registrar en mi diario/}).count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1280,height:1040});await page.locator('.kitchen').screenshot({path:'outputs/Salud-menu.png',style:'nav{visibility:hidden}'});
  await click('Actividad');await click('＋ Registrar ejercicio');const form=page.locator('dialog[open]');
  await form.locator('[name=name]').fill('Caminata');await form.locator('[name=minutes]').fill('25');await form.getByText('Guardar',{exact:true}).click();assert.match(await page.locator('#view').innerText(),/25 min de ejercicio/);
  await click('Progreso');await page.locator('#weightForm').waitFor();await click('Inicio');assert.match(await page.locator('.tone2').innerText(),/25 min/);assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
