const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {spawnSync}=require('node:child_process');
const html=fs.readFileSync('outputs/Kive.html','utf8');
const file=path.resolve('work/release.html'),profile=path.resolve('work/edge-release-'+Date.now());
function stage(test,options=[]){
 const checks=`function check(result,label){if(!result)throw Error(label)}
 function dialogSave(values){const form=document.querySelector('dialog[open] form');for(const [key,value] of Object.entries(values)){form.elements[key].value=value;form.elements[key].dispatchEvent(new Event('input',{bubbles:true}))}form.requestSubmit();check(!document.querySelector('dialog[open]'),'dialog '+JSON.stringify(values))}
 try{`+test+`;document.body.dataset.result='passed'}catch(error){document.body.dataset.result=error.stack}`;
 fs.writeFileSync(file,html.replace('</script></html>',()=>checks+'</script></html>'));
 const result=spawnSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--disable-background-networking','--user-data-dir='+profile,'--dump-dom',...options,pathToFileURL(file).href],{encoding:'utf8',timeout:45000,maxBuffer:4000000});
 const status=result.stdout?.match(/<body data-result="([^"]+)/)?.[1];if(status!=='passed')throw Error(status||result.stderr?.slice(-600)||'Script initialization');console.log('OK',test.slice(0,70));
}
stage(`check(by('view').querySelectorAll('.card').length===4,'home');go(1);
 const form=by('movement');form.elements.concept.value='Transporte';const amount=form.elements.amount;
 for(const digit of '1000000'){amount.setRangeText(digit,amount.value.length,amount.value.length,'end');amount.dispatchEvent(new Event('input'))}
 check(amount.value==='1.000.000','format');form.requestSubmit();editMove(2);dialogSave({amount:'100,50'});check(state.moves[2][1]===-100.5,'edit');
 editRow('goals');dialogSave({name:'Lectura',target:'200',saved:'30'});go(2);toggleDone('habits',0);check(records('habits')[0].last===today(),'habit');editRow('routines');dialogSave({name:'Salida',details:'15 minutos'});
 go(3);editRow('recipes');dialogSave({name:'Pera',ingredients:'Pera',steps:'Cortar'});by('findNote').value='Pera';by('findNote').dispatchEvent(new Event('input'));check(by('matches').textContent==='1 resultados','search');
 go(0);for(const key of ['Agenda','Estudios','Negocios','Inventario','Vehículos']){ui.area=key;render();check(by('view').textContent.includes(records(key)[0].name),'area')}
 go(4);tripEditor(true);dialogSave({name:'Ruta andina',place:'Valle de ejemplo',start:'2027-07-01',end:'2027-07-02',people:'Ana',limit:'250000',template:'Escapada'});check(trip().list.length===2,'template');
 ui.travel='Itinerario y mapa';render();editRow('stops');dialogSave({name:'Mirador',date:'2027-07-01',time:'09:00',place:'Cumbre',lat:'4.6',lon:'-74.1'});check(by('view').querySelectorAll('.route circle').length===1,'map');
 editRow('expenses');dialogSave({name:'Bus',amount:'25000'});trip().files.push({name:'Documento de prueba',data:'data:application/pdf;base64,JVBERg=='});
 state.book=true;render();check(by('printset').textContent.includes('Mirador')&&!by('printset').textContent.includes('Documento de prueba'),'book');
 state.url='javascript:alert(1)';state.allowed=true;preview();check(!by('printset').querySelector('.qr'),'invalid QR');state.url='https://example.org/';state.allowed=false;preview();check(!by('printset').querySelector('.qr'),'consent');state.allowed=true;preview();check(by('printset').querySelector('.qr'),'QR');toggleSection(5,false);check(!by('printset').textContent.includes('Bus'),'budget filter');state.letter=true;preview();check(by('size').textContent.includes('letter'),'letter');saveLocal()`);
stage(`check(trip().name==='Ruta andina'&&trip().stops[0].time==='09:00'&&state.book&&state.letter,'persist');switchTrip(state.workspace.trips[0].id);check(!state.url&&!state.allowed,'isolate QR');state.selected=sections.slice();state.letter=false;state.book=true;render();check(by('printset').children.length===4,'A4 pages');document.title='Patagonia austral · Kive Travel Book'`,['--no-pdf-header-footer','--print-to-pdf='+path.resolve('outputs/Patagonia.pdf')]);
stage(`go(0);check(document.documentElement.scrollWidth<=innerWidth,'mobile home');go(4);ui.travel='Itinerario y mapa';state.book=false;render();check(document.documentElement.scrollWidth<=innerWidth,'mobile trip');go(0)`,['--window-size=412,880','--screenshot='+path.resolve('work/mobile.png')]);
