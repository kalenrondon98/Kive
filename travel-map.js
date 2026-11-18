let liveMap=null,liveTiles=null,worldFeatures=null,activeMapTrip=null,pickLocation=false;
const mapViews=new Map(),streetTrips=new Set();
function worldBase(){
 if(worldFeatures)return worldFeatures;
 const atlas=/*WORLD_ATLAS*/;
 const arcs=atlas.arcs.map(arc=>{
  let x=0,y=0;
  return arc.map(([dx,dy])=>{x+=dx;y+=dy;return [x*atlas.transform.scale[0]+atlas.transform.translate[0],y*atlas.transform.scale[1]+atlas.transform.translate[1]]});
 });
 function ring(indices){
  const result=[];for(const index of indices){const points=index<0?arcs[~index].slice().reverse():arcs[index];result.push(...(result.length?points.slice(1):points))}return result;
 }
 worldFeatures=atlas.objects.countries.geometries.map(shape=>({type:shape.type,coordinates:shape.type==='Polygon'?shape.arcs.map(ring):shape.arcs.map(polygon=>polygon.map(ring))}));
 return worldFeatures;
}
function releaseTravelMap(){
 if(!liveMap)return;
 mapViews.set(activeMapTrip,{center:liveMap.getCenter(),zoom:liveMap.getZoom()});
 liveMap.remove();liveMap=null;liveTiles=null;pickLocation=false;
}
function travelMapPanel(){
 return '<div class="mapShell"><div id="liveTravelMap" aria-label="Mapa interactivo del viaje"></div><div class="mapTools">'+action('Ver todo el viaje','fitTravelMap()')+action('Añadir parada aquí','armMapPick()')+'<button id="streetLayer" onclick="toggleStreetLayer()"></button></div><p id="mapHint" role="status"></p></div>';
}
function fitTravelMap(){
 const stops=tripPath(trip()).map(stop=>[stop.lat,stop.lon]);if(!stops.length){liveMap.setView([4.6,-74.1],5);return}
 liveMap.fitBounds(L.latLngBounds(stops),{padding:[32,38],maxZoom:14,animate:false});
}
function armMapPick(){
 pickLocation=!pickLocation;liveMap.getContainer().classList.toggle('pickPoint',pickLocation);
 by('mapHint').textContent=pickLocation?'Toca el lugar de la nueva actividad. Vuelve a pulsar el botón para cancelar.':mapHintText();
}
function mapHintText(){return streetTrips.has(activeMapTrip)?'Calles en línea · Los segmentos unen las paradas en orden.':'Mapa general sin conexión · Activa las calles para ver más detalle.'}
function toggleStreetLayer(){
 if(streetTrips.has(activeMapTrip)){streetTrips.delete(activeMapTrip);if(liveTiles)liveTiles.remove();liveTiles=null}
 else streetTrips.add(activeMapTrip);
 syncStreetLayer();
}
function syncStreetLayer(){
 const online=streetTrips.has(activeMapTrip);by('streetLayer').textContent=online?'Volver al mapa sin conexión':'Activar calles en línea';by('streetLayer').setAttribute('aria-pressed',String(online));by('mapHint').textContent=mapHintText();
 if(!online||liveTiles)return;
 const tiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri · HERE, Garmin, INCREMENT P, USGS, OpenStreetMap y colaboradores · <a href="https://www.arcgis.com/home/item.html?id=3b93337983e943389a3b8a8b19c3cde3" target="_blank" rel="noreferrer">Fuentes</a>'});
 liveTiles=tiles;
 tiles.on('tileerror',()=>{if(liveTiles===tiles&&by('mapHint'))by('mapHint').textContent='Algunas calles no cargaron. Puedes seguir usando el mapa general y las paradas.'});
 tiles.addTo(liveMap);
}
function mountTravelMap(){
 activeMapTrip=trip().id;const container=by('liveTravelMap');
 liveMap=L.map(container,{minZoom:2,maxZoom:19,zoomControl:true,scrollWheelZoom:false,worldCopyJump:true});
 liveMap.createPane('land');liveMap.getPane('land').style.zIndex='190';
 L.geoJSON(worldBase(),{pane:'land',interactive:false,style:{fillColor:'#dce4d4',fillOpacity:1,color:'#8c9d91',weight:1}}).addTo(liveMap);
 liveMap.attributionControl.addAttribution('Natural Earth');
 const saved=mapViews.get(activeMapTrip);if(saved)liveMap.setView(saved.center,saved.zoom);else fitTravelMap();
 const points=tripPath(trip()).map(stop=>[stop.lat,stop.lon]);L.polyline(points,{color:'#6a439a',weight:3,dashArray:'6 6',interactive:false}).addTo(liveMap);
 for(const [point,label] of [[trip().originPoint,'Salida'],[trip().destinationPoint,'Destino']])if(mapped(point))L.circleMarker([point.lat,point.lon],{radius:7,color:'#215846',fillOpacity:.9}).bindTooltip(label).addTo(liveMap);
 trip().stops.forEach((stop,index)=>{
  if(!mapped(stop))return;
  const label='Parada '+(index+1)+' · '+stop.place;
  const icon=L.divIcon({className:'routePin'+(index===ui.stop?' chosenPin':''),html:String(index+1),iconSize:[30,30],iconAnchor:[15,15]});
  const marker=L.marker([stop.lat,stop.lon],{icon,title:label,alt:label,zIndexOffset:index===ui.stop?500:0}).addTo(liveMap);
  marker.getElement().setAttribute('aria-label',label);marker.on('click',()=>{if(!pickLocation)selectStop(index)});
 });
 liveMap.on('click',event=>{
  if(!pickLocation)return;armMapPick();const point=event.latlng.wrap();
  editRow('stops',-1,{lat:Number(point.lat.toFixed(6)),lon:Number(point.lng.toFixed(6)),place:'',date:planDate(),time:'09:00'});
 });syncStreetLayer();
}
