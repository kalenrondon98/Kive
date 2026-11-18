const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const copy=path.join(await fs.mkdtemp(path.join(os.tmpdir(),'kive-styles-')),'demo.html');
 await fs.copyFile(path.resolve('outputs/Kive.html'),copy);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
  const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(5000);
  await p.goto(pathToFileURL(copy).href);const click=name=>p.getByRole('button',{name,exact:true}).click();
  for(const width of [360,1200]){
   await p.setViewportSize({width,height:800});
   for(const style of ['original','estudio','marea','cobre']){
    await click('Cambiar estilo');await p.locator('button[data-style='+style+']').click();await click('Listo');
    assert.equal(await p.locator('html').getAttribute('data-app-style'),style);
    const nav=await p.locator('#nav').boundingBox();assert.ok(nav.x>=-1&&nav.x+nav.width<=width+1);
    await click('Finanzas');await click('Inicio');
   }
  }
  await p.reload();assert.equal(await p.locator('html').getAttribute('data-app-style'),'cobre');
  await click('Configuración');await click('Estilo de Kive');await p.locator('button[data-style=original]').click();
  await p.locator('dialog.stylePicker .action').click();await click('Listo');assert.deepEqual(errors,[]);
  console.log('Cuatro estilos, navegación, acceso desde Inicio y Configuración y persistencia verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
