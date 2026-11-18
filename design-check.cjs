const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1360,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
  await page.screenshot({path:'outputs/Inicio-escritorio.png'});
  await page.getByRole('button',{name:'Escribir nota',exact:true}).click();assert.equal(await page.locator(':focus').getAttribute('name'),'title');
  await page.locator('#note [name=title]').fill('Idea nueva');await page.locator('#note textarea').fill('Revisar mi semana');await page.getByRole('button',{name:'Guardar nota'}).click();
  await page.locator('#findArea').click();await page.locator('dialog input').fill('Idea nueva');await page.locator('.finderResults button').click();assert.equal(await page.locator('dialog[open] [name=body]').inputValue(),'Revisar mi semana');await page.keyboard.press('Escape');
  await page.locator('nav').getByRole('button',{name:'Salud'}).click();await page.getByRole('button',{name:'Ver rutinas'}).click();await page.locator(':focus').click();assert.match(await page.locator('#view > .grid').first().innerText(),/1 de 1/);
  await page.locator('nav').getByRole('button',{name:'Inicio'}).click();await page.getByRole('button',{name:'＋ Registrar movimiento',exact:true}).click();assert.equal(await page.locator(':focus').getAttribute('name'),'concept');
  await page.setViewportSize({width:390,height:844});
  for(const area of ['Biblioteca','Salud','Finanzas','Kive Travel','Inicio']){
   await page.locator('nav').getByRole('button',{name:area,exact:true}).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,area);
  }
  await page.getByRole('button',{name:'Negocios',exact:true}).click();await page.locator('#moduleWorkspace').waitFor();
  await page.locator('#findArea').click();await page.locator('dialog input').fill('Patagonia');await page.locator('.finderResults button').click();await page.getByRole('button',{name:'Exportar · Travel Book'}).click();assert.equal(await page.locator('#printset .paper').count(),4);
  await page.reload();assert.equal(await page.locator('#printset .paper').count(),4);
  await page.locator('nav').getByRole('button',{name:'Inicio',exact:true}).click();await page.screenshot({path:'outputs/Inicio-movil.png'});
  assert.deepEqual(errors,[]);console.log('Comprobados escritorio y móvil, accesos rápidos, búsqueda, notas, rutinas, áreas, restauración y folleto.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
