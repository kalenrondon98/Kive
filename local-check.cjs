const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {spawnSync}=require('node:child_process');
const html=fs.readFileSync('outputs/Kive.html','utf8');
const file=path.resolve('work/local-check.html');
const profile=path.resolve('work/qa-'+Date.now());
const edge='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const stages=[
 `go(1);const form=by('movement'),field=form.elements.amount;
 function verify(ok){if(!ok)throw Error('Importe incorrecto')}
 function type(value){field.setRangeText(value,field.selectionStart,field.selectionEnd,'end');field.dispatchEvent(new Event('input'))}
 verify(field.inputMode==='decimal');for(const digit of '1000000')type(digit);verify(field.value==='1.000.000');
 field.setSelectionRange(2,3);type('2');verify(field.value==='1.200.000'&&field.selectionStart===3);
 field.select();const clipboard=new DataTransfer();clipboard.setData('text/plain','1.000.000,50');field.dispatchEvent(new ClipboardEvent('paste',{clipboardData:clipboard,cancelable:true}));verify(field.value==='1.000.000,50');
 form.elements.concept.value='Prueba';form.requestSubmit();verify(state.moves.at(-1)[1]===-1000000.5);
 const budget=by('budgetForm');budget.elements.amount.value='850';budget.elements.amount.dispatchEvent(new Event('input'));budget.requestSubmit();verify(state.budget===850);
 go(2);const weight=by('weightForm');weight.elements.date.value='2027-01-01';weight.elements.kg.value='71,3';weight.requestSubmit();verify(state.weights.at(-1).kg===71.3);
 go(3);by('findNote').value='avena';by('findNote').dispatchEvent(new Event('input'));verify(by('matches').textContent==='1 resultados');
 go(4);by('planForm').elements.title0.value='Visita de prueba';by('planForm').requestSubmit();by('view').querySelector('button').click();verify(by('printset').textContent.includes('Visita de prueba'));state.book=false;go(0);
 saveLocal();document.title='Importe validado';`,
 `document.querySelectorAll('nav button')[2].click();document.querySelector('.panel button').click();go(4);document.querySelector('.panel input').click();by('view').querySelector('button').click();by('next').click();document.title='Setup completo';`,
 `if(state.water===4&&state.packed[0]&&state.tab===4&&state.book&&state.page===1&&by('counter').textContent==='Página 2 de 4'&&!document.querySelector('.qr'))document.title='Validado';`
];
for(const [index,stage] of stages.entries()){
 fs.writeFileSync(file,html.replace('</script></html>',stage+'</script></html>'));
 const result=spawnSync(edge,['--headless','--disable-gpu','--no-first-run','--disable-background-networking','--user-data-dir='+profile,'--dump-dom',pathToFileURL(file).href],{encoding:'utf8',timeout:30000});
 const expected=['Importe validado','Setup completo','Validado'][index];
 if(!result.stdout?.includes('<title>'+expected+'</title>'))throw Error(result.stderr?.slice(-700)||'Prueba fallida');
 console.log(expected);
}
