const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),os=require('node:os');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 const copy=path.join(await fs.mkdtemp(path.join(os.tmpdir(),'kive-deudas-')),'prueba.html');
 await fs.copyFile(path.resolve('outputs/Kive.html'),copy);
 await page.goto(pathToFileURL(copy).href);assert.equal(await page.evaluate(()=>state.workspace.debts.length),0);
 const click=text=>page.getByRole('button',{name:text,exact:true}).click();
 await click('Finanzas');await click('Deudas');await click('＋ Nueva deuda');const form=page.locator('dialog[open]');
 for(const [key,value] of Object.entries({name:'Carro de prueba',creditor:'Entidad de ejemplo',amount:'500000'}))await form.locator('[name='+key+']').fill(value);
 await click('Guardar');const before=await page.evaluate(()=>balance());
 await click('Editar deuda');await form.locator('[name=usualPayment]').fill('300000');await click('Guardar');
 await click('Registrar abono');assert.equal(await form.locator('[name=amount]').inputValue(),'300.000');await form.locator('[name=amount]').fill('600000');await click('Guardar');assert.match(await form.innerText(),/no superar/);
 await form.locator('[name=amount]').fill('100000');await form.locator('[name=date]').fill('2025-12-12');await click('Guardar');assert.equal(await page.evaluate(()=>balance()),before-100000);
 await page.reload();await click('Deudas');assert.match(await page.locator('#view').innerText(),/400\.000/);
 await click('Registrar abono');assert.equal(await form.locator('[name=amount]').inputValue(),'300.000');await click('Guardar');
 await click('Registrar abono');assert.equal(await form.locator('[name=amount]').inputValue(),'100.000');await click('Cancelar');
 await page.locator('article summary').click();await page.getByRole('button',{name:'Eliminar',exact:true}).first().click();
 await click('Estadísticas');await page.getByLabel('Mes de referencia').fill('2025-12');assert.match(await page.locator('#view').innerText(),/Pago de deudas/);assert.match(await page.locator('#view').innerText(),/100 %/);await page.getByLabel('Período').selectOption('Histórico');await page.locator('.statMonth').first().click();assert.equal(await page.getByLabel('Período').inputValue(),'Mes');
 await click('Deudas');await page.locator('article summary').click();await click('Editar');await form.locator('[name=amount]').fill('500000');await click('Guardar');assert.match(await page.locator('article small').innerText(),/pagada/i);
 await page.locator('article summary').click();await click('Eliminar');assert.equal(await page.evaluate(()=>balance()),before);assert.deepEqual(errors,[]);console.log('Deuda, abono, edición, liquidación, eliminación, recarga, porcentajes e histórico verificados.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
