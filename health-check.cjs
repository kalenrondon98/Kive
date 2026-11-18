const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
  const nav=name=>page.locator('nav').getByRole('button',{name,exact:true}).click();
  await nav('Salud');await page.getByText('＋ Registrar comida',{exact:true}).click();const dialog=page.locator('dialog[open]');
  await dialog.getByLabel('Usar una receta guardada').selectOption('0');await dialog.getByText('Guardar',{exact:true}).click();
  await page.getByText('＋ Registrar ejercicio',{exact:true}).click();await dialog.getByLabel('Usar una rutina guardada').selectOption('0');await dialog.locator('[name=minutes]').fill('35');await dialog.getByText('Guardar',{exact:true}).click();
  await nav('Inicio');assert.match(await page.locator('.tone2').innerText(),/1 comida[\s\S]*35 min/);await page.reload();await nav('Salud');
  await page.locator('#healthDay').fill('2020-01-02');assert.match(await page.locator('.dailyHealth').innerText(),/0 comidas/);
  await page.locator('#healthDay').fill(await page.evaluate(()=>today()));await page.locator('.dailyHealth .row').filter({hasText:'35 min'}).getByText('Editar').click();await dialog.locator('[name=minutes]').fill('40');await dialog.getByText('Guardar',{exact:true}).click();
  await nav('Inicio');assert.match(await page.locator('.tone2').innerText(),/40 min/);assert.ok(!/vasos de agua/i.test(await page.locator('body').innerText()));assert.deepEqual(errors,[]);console.log('Receta, rutina, fechas, edición, resumen diario y persistencia verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
