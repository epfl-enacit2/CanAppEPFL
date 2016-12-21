var fs = require('fs'),
  path = require('path'),
  glob = require("glob"),
  conf = require('./config.js'),
  dataApp = {};

// Create the dataApp object with all informations.json file of the folder's hierarchy
fromDir(conf.rootPath, 'informations.json');

// Fetch user's submitted annexes
Object.keys(dataApp).map((formation)=>{
  dataApp[formation].map(user =>{
    annexesPath = user.folder + path.sep + 'annexes' ;
    var annexes = fs.readdirSync(annexesPath);
    // Remove Thumbs.db
    annexes = annexes.filter(function(item) {
        return item !== 'Thumbs.db';
    });
    user['annexes'] = annexes
  });
});

// Save the concatenation of all information in json format
//                  - maybe it will be useful at some point
fs.writeFileSync('AllIn.json', JSON.stringify(dataApp), 'UTF-8');

// Create the HTML files and save it to the results directory
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
  html += '\n\t\t\t<tr>' + conf.tableHeaders[formation].headers.map(header => '\n\t\t\t<th nowrap>' + header + '</th>').join('') + '\n\t\t\t</tr>' + '\n\t\t</thead>';
  html += dataApp[formation].map(user => '\n\t\t<tr>' + conf.tableHeaders[formation].keys.map(header => {
    switch (header) {
      case 'datePostulation':
        var dP = user[header].split('-');
        // Fix 0 padding in case they are missing
        return '\n\t\t\t<td>' + dP[2] + '-' + ('00'+dP[1]).substring(dP[1].length)  + '-' + ('00'+dP[0]).substring(dP[0].length) + '&nbsp;' + dP[4] + '</td>';
        //return '\n\t\t\t<td>' + dP[2] + '-' + dP[1] + '-' + dP[0] + '&nbsp;' + dP[4] + '</td>';
      case 'addresseApprentiComplete':
        return '\n\t\t\t<td nowrap>' + user[header].rue +'<br />' + user[header].NPA + ' <a href="http://maps.google.com/?q=' + (user[header].rue + ' ' + user[header].NPA).split(' ').join('+') + '"><img src="../img/fff/icons/map_go.png" alt="' + user[header].NPA + '" /></a></td>';
      case 'filiere':
        switch (user[header]) {
          case 'entreprise':
            return '\n\t\t\t<td>Entreprise<img src="../img/fff/icons/computer.png" title="' + user[header] + '"/></td>';
          case 'developpementApplications':
            return '\n\t\t\t<td>Dev<img src="../img/fff/icons/script_code.png" title="' + user[header] + '"/></td>';
          case 'techniqueSysteme':
            return '\n\t\t\t<td>TechSys<img src="../img/fff/icons/server_link.png" title="' + user[header] + '"/></td>';
          case 'neSaisPas':
            return '\n\t\t\t<td>?<img src="../img/fff/icons/help.png" title="' + user[header] + '"/></td>';
          default:
            return '\n\t\t\t<td>' + user[header] + '</td>';
        }
      case 'mailApprenti':
        return '\n\t\t\t<td><a href="mailto:' + user[header] + '">' + user[header] + '</a></td>';
      case 'genreApprenti':
        return '\n\t\t\t<td>' + ((user[header] == 'Femme') ? 'F <img src="../img/fff/icons/female.png' : 'M <img src="../img/fff/icons/male.png') + '" title="' + user[header] + '" /></td>';
      case 'maturite':
      case 'majeur':
      case 'dejaCandidat':
        return '\n\t\t\t<td>' + ((user[header] == 'true') ? 'O <img src="../img/fff/icons/tick.png' : 'N <img src="../img/fff/icons/cross.png') + '" title="' + user[header] + '" /></td>';
      case 'connaissancesLinguistiques':
        return '\n\t\t\t<td>' + user[header].map(header => '\n\t\t\t\t' + header + '<img src="../img/fff/flags/' + header + '.png" title="' + header + '" />').join('&nbsp;') + '</td>';
      case 'dateNaissanceApprenti':
        var dob = user[header].split('/');
        var birthday = new Date(dob[2], dob[1], dob[0]);
        return '\n\t\t\t<td>' + dob[2] + ' (' + _calculateAge(birthday) + 'ans)</td>';
      case 'activitesProfessionnelles':
        return '\n\t\t\t<td>' + user[header].map(empl => empl.employeur).join('<br />') + '</td>';
      case 'telFixeApprenti':
        return '\n\t\t\t<td nowrap><img src="../img/fff/icons/telephone.png" />&nbsp;' + user[header].split(' ').join('&nbsp;') + '</td>';
      case 'telMobileApprenti':
        return '\n\t\t\t<td nowrap><img src="../img/fff/icons/phone.png" />&nbsp;' + user[header].split(' ').join('&nbsp;') + '</td>';
      case 'stages':
        return '\n\t\t\t<td nowrap>' + user[header].map(stage => stage.employeur).join(',<br />') + '</td>';
      case 'annexes':
        //var annexesPath = '..' + path.sep + user.folder + path.sep + 'annexes/' ;
        var annexesPath = './' + user.folderUser + path.sep + 'annexes' + path.sep ;
        return '\n\t\t\t<td nowrap><ul>' + user[header].map(annexe => '<li><a target="_blank" href="' + annexesPath + annexe + '">' + annexe + '</a></li>').join('\n') + '</ul></td>';
      default:
        return '\n\t\t\t<td>' + user[header] + '</td>';
    }
  }).join('') + '\n\t\t</tr>').join('');

  html += '\n\t</table>';
  html += "\n<script>$(document).ready(function(){$('#" + formation + "').DataTable({'pageLength': 100});});</script>";
  html += '\n</body>\n</html>';
  //console.log(html);
  fs.writeFileSync('./results/'+formation+'.html', html, 'UTF-8');
});

// Recurse into the startPath directory to find and read all the file matching filter
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
      obj.folder = filename.split(path.sep).slice(0, -2).join(path.sep);
      obj.folderUser = filename.split(path.sep).slice(2, -2).join(path.sep);
      //console.log(obj.folder2)
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

// Return an Human Readable Date Diff in Year (aka Age)
function _calculateAge(birthday) { // birthday is a date
  var birthday = new Date(birthday);
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
