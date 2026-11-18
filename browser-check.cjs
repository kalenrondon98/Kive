const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(pathToFileURL(path.resolve('outputs/Kive.html')).href);
 await page.getByRole('navigation').getByRole('button',{name:'Kive Travel'}).click();
 await page.getByRole('button',{name:'Documentos',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'Documento de muestra.pdf',mimeType:'application/pdf',buffer:fs.readFileSync('outputs/Patagonia.pdf')});
 await page.getByRole('button',{name:'Descargar',exact:true}).waitFor();
 await page.getByRole('button',{name:'Álbum',exact:true}).click();
 await page.locator('input[type=file]').setInputFiles({name:'Foto de prueba.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/gWQAAAAASUVORK5CYII=','base64')});
 await page.getByRole('dialog').getByRole('button',{name:'Guardar',exact:true}).click();
 await page.getByRole('button',{name:'Usar en portada'}).click();
 await page.getByRole('button',{name:'Exportar · Travel Book'}).click();
 await page.locator('#sheet .photo').waitFor();
 await page.locator('aside select').selectOption({label:'Carta'});
 await page.locator('aside').getByLabel('Presupuesto',{exact:true}).uncheck();
 await page.pdf({path:'work/carta.pdf',preferCSSPageSize:true,printBackground:true});
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar folleto digital'}).click();
 const result=await download;const data=fs.readFileSync(await result.path(),'utf8');
 if(data.includes('Documento de muestra')||data.includes('USD 180')||data.includes('<script>'))throw Error('Publicación digital inesperada');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Desbordamiento móvil');
 await page.reload();await page.getByRole('button',{name:'Volver al viaje'}).click();await page.getByRole('button',{name:'Documentos',exact:true}).click();await page.getByText('Documento de muestra.pdf',{exact:false}).first().waitFor();
 if(errors.length)throw Error(errors.join('\n'));console.log('Adjunto, álbum, portada, carta, folleto digital, persistencia y ancho móvil verificados.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
