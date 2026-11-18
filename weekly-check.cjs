const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),{pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
(async()=>{
 const copy=path.join(await fs.mkdtemp(path.join(os.tmpdir(),'kive-health-')),'preview.html');
 await fs.copyFile(path.resolve('outputs/Kive.html'),copy);
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
 try{
 const p=await browser.newPage();p.setDefaultTimeout(5000);
 const day=n=>new Date(2026,10,n,12);
 await p.clock.setFixedTime(day(1));await p.goto(pathToFileURL(copy).href);
 const click=name=>p.getByRole('button',{name,exact:true}).click(),form=p.locator('dialog[open]');
 await click('Salud');await click('Completar mi perfil');
 for(const [key,val] of Object.entries({height:'175',weight:'70',age:'30'}))await form.locator('[name='+key+']').fill(val);
 await click('Guardar');assert.match(await p.locator('#view').innerText(),/22,9/);
 await click('Progreso');await click('Corregir último peso');await form.locator('[name=kg]').fill('71');await click('Guardar');
 await p.clock.setFixedTime(day(7));await p.reload();await click('Corregir último peso');await click('Cancelar');
 const energy=()=>p.evaluate(()=>energyReference(state.workspace.kitchen.profile));
 const before=await energy();await p.clock.setFixedTime(day(8));await p.reload();await click('Registrar peso semanal');await form.locator('[name=kg]').fill('72');await click('Guardar');
 assert.ok(await energy()>before);await click('Progreso');assert.equal(await p.locator('#weightForm .row').count(),2);
 await p.reload();assert.equal(await p.evaluate(()=>state.workspace.kitchen.profile.weight),72);
 console.log('Perfil, IMC, corrección, aviso a siete días, historial y recálculo verificados.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
