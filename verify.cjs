const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {spawnSync}=require('node:child_process');
const assertions=String.raw`
function check(condition){if(!condition)throw Error('Prueba fallida')}
document.querySelectorAll('nav button')[1].click();movement.elements.concept.value='Prueba';movement.elements.amount.value='25';movement.requestSubmit();check(balance()===1500);
go(2);document.querySelector('.panel button').click();check(state.water===4);
go(3);note.elements.title.value='Campo';note.elements.body.value='Ejemplo';note.requestSubmit();check(state.notes.length===2);
go(4);document.querySelector('.panel input').click();by('view').querySelector('button').click();check(by('printset').children.length===4);
by('next').click();check(by('sheet').textContent.includes('Laguna Amarga'));by('prev').click();
const field=document.querySelector('[type=url]');for(const value of ['javascript:void(0)','https://example.org/trip']){field.value=value;field.dispatchEvent(new Event('input'));check(!document.querySelector('.qr'));authorize.click();check(Boolean(document.querySelector('.qr'))===value.startsWith('https'))}
field.value='';field.dispatchEvent(new Event('input'));check(!document.querySelector('.qr'));
document.querySelectorAll('aside input[type=checkbox]').forEach((box,index)=>{if(index<8)box.click()});check(by('print').disabled);document.querySelectorAll('aside input[type=checkbox]').forEach((box,index)=>{if(index<8)box.click()});const paper=document.querySelector('select');paper.value='Carta';paper.dispatchEvent(new Event('change'));check(by('size').textContent.includes('letter'));paper.value='A4';paper.dispatchEvent(new Event('change'));state.packed[0]=false;preview();document.title='Kive Travel Book · Patagonia austral';document.body.dataset.verified='passed';
`;
const html=fs.readFileSync('outputs/Kive.html','utf8').replace('</script></html>',assertions+'</script></html>');
fs.writeFileSync('work/check.html',html);
const result=spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--disable-extensions','--no-first-run','--disable-background-networking','--user-data-dir='+path.resolve('work/edge'),'--no-pdf-header-footer','--print-to-pdf='+path.resolve('outputs/Patagonia.pdf'),'--dump-dom',pathToFileURL(path.resolve('work/check.html')).href],{encoding:'utf8',timeout:55000,maxBuffer:4000000});
console.log('Exit',result.status,'test',result.stdout?.includes('<body data-verified="passed">'),'pdf',fs.existsSync('outputs/Patagonia.pdf'),result.stderr?.slice(-1400));
