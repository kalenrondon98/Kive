const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const copy=path.join(await fs.mkdtemp(path.join(os.tmpdir(),'kive-display-')),'preview.html');
 await fs.copyFile(path.resolve('outputs/Kive.html'),copy);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const page=await browser.newPage();
  await page.goto(pathToFileURL(copy).href);
  for(const width of [320,390,1200]){
   await page.setViewportSize({width,height:800});
   const settings=await page.locator('#settingsButton').boundingBox(),alert=await page.locator('#dailyAlert').boundingBox();
   assert.ok(settings.x>=alert.x+alert.width-1&&settings.x+settings.width<=width);
  }
  await page.setViewportSize({width:320,height:700});await page.locator('#settingsButton').click();
  for(const label of ['Texto grande','Bordes de alto contraste'])await page.getByLabel(label).check();
  const dialog=page.locator('dialog[open]');
  assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  assert.ok(await page.getByLabel('Texto grande').evaluate(el=>parseFloat(getComputedStyle(el.parentElement).fontSize)>=18));
  await page.getByRole('button',{name:'Listo',exact:true}).click();await page.reload();
  assert.ok(await page.locator('html.largeReading.strongEdges').count());await page.locator('#settingsButton').click();
  for(const label of ['Texto grande','Bordes de alto contraste']){assert.ok(await page.getByLabel(label).isChecked());await page.getByLabel(label).uncheck()}
  console.log('Cabecera verificada en tres anchos. Lectura, contraste y persistencia verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
