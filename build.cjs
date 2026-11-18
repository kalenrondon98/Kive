const fs = require('node:fs');
const path = require('node:path');
const vendor = 'C:/Program Files/nodejs/node_modules/npm/node_modules/qrcode-terminal/vendor/QRCode';
const modules = fs.readdirSync(vendor).map(file => JSON.stringify('./'+path.basename(file,'.js'))+':function(require,module){'+fs.readFileSync(path.join(vendor,file),'utf8')+'\n}');
const library = 'const factories={'+modules.join(',')+'};const cache={};function load(key){if(!cache[key]){cache[key]={exports:{}};factories[key](load,cache[key])}return cache[key].exports}const Encoder=load("./index");';
const html=fs.readFileSync('work/app.html','utf8').replace('/*ENCODER*/',()=>library)
 .replace('<script>',()=>'<script>'+fs.readFileSync('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1117-835-0_26.1117.835.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/jszip/dist/jszip.min.js','utf8')+'</script><script>')
 .replace('/*FEATURES*/',()=>['features.js','planning.js','interface.js','home.js','finance.js','health.js','kitchen.js','books.js','travel-map.js','travel-expenses.js','car.js'].map(name=>fs.readFileSync('work/'+name,'utf8')).join('\n'))
 .replace('/*WORLD_ATLAS*/',()=>fs.readFileSync('work/atlas/package/countries-110m.json','utf8'))
 .replace('/*CITY_INDEX*/',()=>JSON.stringify(require('./cities/package/data/cityMap.json').filter(city=>city.city&&Number.isFinite(city.lat)&&Number.isFinite(city.lng)).sort((a,b)=>b.pop-a.pop).map(city=>[city.city,city.province,city.iso2,+city.lat.toFixed(5),+city.lng.toFixed(5)])))
 .replace('<script>',()=>'<style>'+fs.readFileSync('work/package/dist/leaflet.css','utf8')+'</style><script>/*'+fs.readFileSync('work/package/LICENSE','utf8')+'\n'+fs.readFileSync('work/atlas/package/LICENSE','utf8')+'*/\n'+fs.readFileSync('work/package/dist/leaflet.js','utf8')+'\n</script><script>')
 .replace('</style>',()=>['finish.css','interface.css','car.css','styles.css'].map(name=>fs.readFileSync('work/'+name,'utf8')).join('\n')+'</style>');
fs.writeFileSync('outputs/Kive.html',html);
