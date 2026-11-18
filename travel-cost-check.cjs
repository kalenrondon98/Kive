const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const copy=path.join(await fs.mkdtemp(path.join(os.tmpdir(),'kive-travel-cost-')),'demo.html');
 await fs.copyFile(path.resolve('outputs/Kive.html'),copy);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(5000);
 await p.goto(pathToFileURL(copy).href);
 const click=name=>p.getByRole('button',{name,exact:true}).click(),form=p.locator('dialog[open]');
 await click('Kive Travel');const base=await p.evaluate(()=>trip().expenses.reduce((sum,item)=>sum+item.amount,0)),limit=await p.evaluate(()=>trip().limit);await click('Itinerario y mapa');await click('Día siguiente');await click('Añadir gasto de este día');
 assert.equal(await form.locator('[name=date]').inputValue(),'2027-03-13');
 await form.locator('[name=name]').fill('Taxi de prueba');await form.locator('[name=estimate]').fill('30000');await click('Guardar');await click('Gastos');
 const totals=()=>p.evaluate(()=>travelAmounts(trip().expenses));
 assert.deepEqual(await totals(),{estimated:30000,pending:30000,paid:base,forecast:base+30000});
 await p.locator('article.row').filter({hasText:'Taxi de prueba'}).getByText('Editar').click();await form.locator('[name=amount]').fill('25000');await click('Guardar');
 assert.deepEqual(await totals(),{estimated:30000,pending:0,paid:base+25000,forecast:base+25000});
 await p.reload();await click('Gastos');assert.equal((await totals()).forecast,base+25000);
 assert.equal(await p.evaluate(()=>travelBudgetLines(trip()).at(-1).amount),limit-base-25000);
 assert.deepEqual(errors,[]);console.log('Plan por día, pago real, saldo, datos anteriores y valores del folleto verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
