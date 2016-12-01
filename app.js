var fs = require('fs')
var path = require('path')
var glob = require("glob")
var conf = require('./config.js')
var dataApp = {}

fromDir(conf.rootPath, 'informations.json')

//console.log(dataApp)
fs.writeFileSync('AllIn.json', JSON.stringify(dataApp), 'UTF-8')

Object.keys(dataApp).map((formation)=>{
  var html = '<!DOCTYPE html>\n<html>\n<head>\n\t<meta charset="utf-8" />\n<title>Cadidature ' + formation + '</title>\n</head>\n<body>\n<h2>' + formation + ' (fichier généré le : ' + new Date().toISOString() + ')</h2>\n<table>';
  html += '\n<tr>' + conf.tableHeaders[formation].map(header => '\n<th>' + header + '</th>').join('') + '\n</tr>';
  html += dataApp[formation].map(user => '\n<tr>' + conf.tableHeaders[formation].map(header => {
    switch (header) {
      case 'addresseApprentiComplete':
        return '\n<td>' + user[header].rue +'<br />'+ user[header].NPA+'</td>';
      case 'connaissancesLinguistiques':
        return '\n<td>' + user[header].join(', ') +'</td>';
      case 'activitesProfessionnelles':
        return '\n<td>' + user[header].map(empl => empl.employeur).join('<br />') + '</td>';
      case 'stages':
        return '\n<td>' + user[header].map(stage => stage.employeur).join('<br />') + '</td>';
      default:
        return '\n<td>' + user[header] + '</td>';
    }
    
  }).join('') + '\n</tr>').join('');
  
  html += '</table>\n</body>\n</html>';
  console.log(html);
  fs.writeFileSync('./results/'+formation+'.html', html, 'UTF-8');

})

function fromDir(startPath, filter) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);

    if (stat.isDirectory()) {
      fromDir(filename, filter); //recurse
    } else if (filename.indexOf(filter) >= 0) {
      // console.log('— found: ',filename);
      // Read the JSON file synchronously
      var obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
      var form = filename.split('\\')[2]
      // console.log(obj);
      if(!dataApp[form]){
        dataApp[form] = []
      }
      dataApp[form].push(obj)
    }
  }
}

/*
formations = {
  Informaticien: [
    { sciper: 'g13123'},
    { sciper: 'g13123'},
    { sciper: 'g13123'}
  ],

}

*/