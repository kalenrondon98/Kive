const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);await page.locator('nav').getByText('Kive Travel').click();await page.getByText('Itinerario y mapa',{exact:true}).click();
 const map=page.locator('#liveTravelMap');await map.waitFor();assert.equal(await map.locator('.routePin').count(),3);
 await map.locator('.routePin').nth(1).click();assert.equal(await page.evaluate(()=>ui.stop),1);
 const before=await page.evaluate(()=>liveMap.getZoom());await map.locator('.leaflet-control-zoom-in').click();await page.waitForFunction(prev=>liveMap.getZoom()>prev,before);
 await page.getByText('Activar calles en línea').click();let online=true;try{await page.waitForFunction(()=>[...document.querySelectorAll('.leaflet-tile')].some(img=>img.naturalWidth===256),{},{timeout:12000})}catch{online=false}
 console.log('Teselas reales cargadas:',online);
 if(online)await page.waitForFunction(()=>!liveTiles.isLoading()&&[...document.querySelectorAll('.leaflet-tile-loaded')].every(tile=>getComputedStyle(tile).opacity==='1'));
 await page.locator('#routeBoard').screenshot({path:'outputs/Mapa-interactivo.png',style:'nav{visibility:hidden}'});
 await page.getByText('Volver al mapa sin conexión').click();await page.getByText('Añadir parada aquí').click();await map.click({position:{x:70,y:120}});const dialog=page.locator('dialog[open]');await dialog.locator('[name=name]').fill('Parada de prueba');await dialog.locator('[name=place]').fill('Mirador');await dialog.getByText('Guardar',{exact:true}).click();
 assert.equal(await map.locator('.routePin').count(),4);await page.reload();await page.getByText('Itinerario y mapa',{exact:true}).click();assert.equal(await map.locator('.routePin').count(),4);
 await page.setViewportSize({width:390,height:844});await page.getByText('Ver todo el viaje').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
