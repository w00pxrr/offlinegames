(function() {
 var chunkAmnt = 2;
 var fileName = "fireice.zip";
 
 function loadScript(src) {
  return new Promise(function(r) {
   var script = document.createElement("script");
   script.src = src;
   document.head.appendChild(script);
   script.onload = r;
  });
 }
 
 function dataUrlToBlobUrl(dataUrl) {
  const byteString = atob(dataUrl.split(',')[1]);
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
   ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });
  return URL.createObjectURL(blob);
 }

 
 window[fileName] = new Promise(function(resolve) {
  var loadAll = [];
  for (i = 0; i < chunkAmnt; i++) {
   loadAll.push(loadScript(`${fileName}-chunk${i}.js`));
  }
  Promise.all(loadAll).then(function() {
   var fullDataURL = "";
   for (i = 0; i < chunkAmnt; i++) {
    fullDataURL += window[`${fileName}-chunk${i}`];
   }
   resolve(dataUrlToBlobUrl(fullDataURL));
  });
 });
})()