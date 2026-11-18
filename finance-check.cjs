const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:930}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);await page.locator('nav').getByRole('button',{name:'Finanzas'}).click();
 assert.ok(!(await page.locator('#view').innerText()).includes('USD'));await page.screenshot({path:'outputs/Finanzas-COP.png'});
 const form=page.locator('#movement');await form.locator('[name=concept]').fill('Arriendo');await form.locator('[name=amount]').pressSequentially('1000000');assert.equal(await form.locator('[name=amount]').inputValue(),'1.000.000');await form.locator('[name=category]').selectOption('Vivienda');await form.getByText('Registrar gasto',{exact:true}).click();
 assert.match(await page.locator('#budgetForm h3').innerText(),/293\.000/);
 await page.locator('#budgetForm [name=amount]').fill('800000');await page.getByText('Guardar límite',{exact:true}).click();assert.match(await page.locator('#budgetForm h3').innerText(),/Exceso.*407\.000/);
 await page.reload();assert.match(await page.locator('#budgetForm h3').innerText(),/407\.000/);
 await form.locator('[value="1"]').check();await form.locator('[name=concept]').fill('Pago');await form.locator('[name=amount]').fill('60000');await form.getByText('Registrar ingreso',{exact:true}).click();
 await page.locator('nav').getByRole('button',{name:'Inicio'}).click();const charts=page.locator('#dashboardMoney');assert.match(await charts.innerText(),/3\.260\.000/);assert.match(await charts.innerText(),/1\.207\.000/);
 await charts.screenshot({path:'outputs/Resumen-financiero.png',style:'nav{visibility:hidden}'});await charts.getByText('Ver finanzas').click();await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('#financeMonth').fill('2030-02');assert.match(await page.locator('#view').innerText(),/Aún no hay movimientos/);
 await page.evaluate(()=>{delete state.workspace.financeCurrency;state.moves=[['Trabajo anterior',140],['Compra anterior',-30]];state.budget=80;state.workspace.goals=[{name:'Lectura',saved:15,target:80}];saveLocal()});await page.reload();
 assert.equal(await page.evaluate(()=>balance()),0);await page.getByText('Historial de la versión anterior · USD').click();assert.match(await page.locator('details.panel[open]').innerText(),/Trabajo anterior/);assert.equal(await page.evaluate(()=>state.workspace.legacyUSD.goals[0].saved),15);
 await page.reload();assert.equal(await page.evaluate(()=>state.workspace.legacyUSD.moves.length),2);assert.deepEqual(errors,[]);
 console.log('COP, formato, flujo mensual, exceso, persistencia y migración USD verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
