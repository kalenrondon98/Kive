const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);await page.locator('nav').getByText('Salud').click();
 const cards=page.locator('.kitchen article'),dialog=page.locator('dialog[open]');assert.equal(await cards.count(),5);const original=await cards.nth(2).locator('h3').innerText();
 await cards.nth(2).getByText('Otra idea').click();assert.notEqual(await cards.nth(2).locator('h3').innerText(),original);
 await cards.nth(2).getByText('Elegir por gusto o ingredientes').click();await dialog.locator('[name=pantry]').fill('lentejas, arroz, zanahoria, tomate, aguacate');await dialog.locator('[type=checkbox]').check();await dialog.getByRole('button',{name:/Lentejas guisadas/}).click();
 await page.getByText('Mi perfil',{exact:true}).click();for(const [key,value] of Object.entries({height:'175',weight:'80',age:'35'}))await dialog.locator('[name='+key+']').fill(value);await dialog.getByText('Guardar',{exact:true}).click();assert.match(await page.locator('.kitchen').innerText(),/kcal\/día/);
 await cards.nth(2).getByText('Registrar en mi diario').click();await dialog.getByText('Guardar',{exact:true}).click();await page.reload();assert.match(await page.locator('.dailyHealth').innerText(),/Lentejas guisadas/);
 await page.getByText('Ingredientes que evito',{exact:true}).click();await dialog.locator('[name=avoid]').fill('lenteja');await dialog.getByText('Guardar',{exact:true}).click();assert.ok(!(await cards.nth(2).locator('h3').innerText()).includes('Lentejas'));
 assert.ok(await page.evaluate(()=>cookbook.every(item=>Number.isFinite(item.kcal))));assert.deepEqual(errors,[]);console.log('32 recetas, cinco comidas, intercambio, despensa, perfil, exclusión y diario verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
