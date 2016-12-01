var fs = require('fs'),
  path = require('path'),
  glob = require("glob"),
  conf = require('./config.js'),
  dataApp = {};

fromDir(conf.rootPath, 'informations.json');

//console.log(dataApp)
fs.writeFileSync('AllIn.json', JSON.stringify(dataApp), 'UTF-8');

Object.keys(dataApp).map((formation)=>{
  var html = '<!DOCTYPE html>\n<html>\n<head>';
  html += '\n\t<meta charset="utf-8" />';
  html += '\n\t<title>Candidature ' + formation + '</title>';
  html += '\n\t<link rel="stylesheet" type="text/css" href="http://cdn.datatables.net/1.10.12/css/jquery.dataTables.min.css">';
  html += '\n\t<script src="http://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>';
  html += '\n\t<script src="http://cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>';
  html += '\n</head>';
  html += '\n<body>';
  html += '\n\t<h2>' + formation + ' (fichier généré le ' + new Date().toISOString().split('T')[0] + ')</h2>';
  html += '\n\t<table id="' + formation + '">';
  html += '\n\t\t<thead>';
  html += '\n\t\t\t<tr>' + conf.tableHeaders[formation].map(header => '\n\t\t\t<th>' + header + '</th>').join('') + '\n\t\t\t</tr>' + '\n\t\t</thead>';
  html += dataApp[formation].map(user => '\n\t\t<tr>' + conf.tableHeaders[formation].map(header => {
    switch (header) {
      case 'datePostulation':
        var dP = user[header].split('-');
        return '\n\t\t\t<td>' + dP[2] + '-' + dP[1] + '-' + dP[0] + ' ' + dP[4] + '</td>';
      case 'addresseApprentiComplete':
        return '\n\t\t\t<td>' + user[header].rue +'<br />'+ user[header].NPA + '</td>';
      case 'connaissancesLinguistiques':
        return '\n\t\t\t<td>' + user[header].join(', ') + '</td>';
      case 'activitesProfessionnelles':
        return '\n\t\t\t<td>' + user[header].map(empl => empl.employeur).join('<br />') + '</td>';
      case 'stages':
        return '\n\t\t\t<td>' + user[header].map(stage => stage.employeur).join('<br />') + '</td>';
      default:
        return '\n\t\t\t<td>' + user[header] + '</td>';
    }
  }).join('') + '\n\t\t</tr>').join('');

  html += '\n\t</table>';
//  html += '\n<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>';
//  html += '\n<script src="//cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>';
  html += "\n<script>$(document).ready(function(){$('#" + formation + "').DataTable();});</script>";
  html += '\n</body>\n</html>';
  console.log(html);
  fs.writeFileSync('./results/'+formation+'.html', html, 'UTF-8');
});

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
      // Read the JSON file synchronously
      var obj = JSON.parse(fs.readFileSync(filename, 'utf8'));
      var form = filename.split(path.sep)[1];
      if (form in conf.tableHeaders === false) {
        console.log("The lookup index is not in table header, please check how the filename is splitted in fromDir function in app.js", form);
        return;
      }
      if (!dataApp[form]){
        dataApp[form] = [];
      }
      dataApp[form].push(obj);
    }
  }
}
