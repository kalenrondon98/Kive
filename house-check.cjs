const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:940}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
  assert.equal(await page.locator('nav button').count(),5);
  await page.getByRole('button',{name:/Nuestra futura casa/}).click();
  await page.screenshot({path:'outputs/Casa.png'});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'outputs/Casa-movil.png'});await page.setViewportSize({width:1280,height:940});
  const fridge=page.locator('.houseItem').filter({has:page.getByRole('heading',{name:'Nevera'})});
  assert.match(await fridge.innerText(),/300\.000/);
  await fridge.getByText('＋ Aporte').click();const dialog=page.locator('dialog[open]');
  await dialog.locator('[name=amount]').pressSequentially('50000');assert.equal(await dialog.locator('[name=amount]').inputValue(),'50.000');await dialog.getByText('Guardar',{exact:true}).click();
  assert.match(await fridge.innerText(),/350\.000/);
  await page.getByRole('button',{name:'Configuración',exact:true}).click();await dialog.getByLabel('Bosque').check();await dialog.getByRole('checkbox').check();await dialog.getByText('Probar sonido').click();assert.equal(await page.evaluate(()=>audioContext.state),'running');await dialog.getByText('Listo').click();await page.reload();
  assert.match(await fridge.innerText(),/350\.000/);
  await page.getByRole('button',{name:'Configuración'}).click();assert.ok(await dialog.getByLabel('Bosque').isChecked());assert.ok(await dialog.getByRole('checkbox').isChecked());await dialog.getByRole('checkbox').uncheck();assert.ok(await dialog.getByText('Probar sonido').isDisabled());await dialog.getByText('Listo').click();
  assert.match(await fridge.innerText(),/14 %/);await fridge.locator('.houseOptions summary').click();assert.ok(await fridge.getByText('Eliminar',{exact:true}).isVisible());await fridge.locator('.houseOptions summary').click();
  await fridge.getByText('Editar',{exact:true}).click();await dialog.locator('[name=stage]').selectOption('Ya tenemos');await dialog.getByText('Guardar',{exact:true}).click();await page.getByRole('button',{name:'Ya tenemos',exact:true}).click();assert.equal(await page.locator('.houseItem').count(),2);
  await page.getByText('＋ Añadir objeto').click();await dialog.locator('[name=name]').fill('Licuadora');await dialog.getByText('Guardar',{exact:true}).click();await page.getByRole('heading',{name:'Licuadora'}).waitFor();
  await page.setViewportSize({width:360,height:800});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);console.log('Casa, filtros, aportes, formato COP, colores, audio, persistencia y móvil verificados.');
  await page.locator('nav').getByRole('button',{name:'Finanzas'}).click();await page.locator('.sectionJump select').selectOption({label:'Metas de ahorro'});assert.equal(await page.locator(':focus').innerText(),'Metas de ahorro');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
