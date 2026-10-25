/* Compte avec moi - synchronisation des profils et des resultats entre l'iPad et l'iPhone. A coller dans Extensions > Apps Script d'un Google Sheet, en remplacant tout le contenu. */

var ONGLETS = {
  Profils: ["id", "nom", "animal", "couleur"],
  Resultats: ["id", "profil", "mode", "duree", "nombre", "exo", "niveau", "justes", "faux", "total", "tempsMs", "date"],
  Supprimes: ["id"]
};

function feuille(nom) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var f = ss.getSheetByName(nom);
  if (!f) {
    f = ss.insertSheet(nom);
    f.getRange("A:Z").setNumberFormat("@");
    f.appendRow(ONGLETS[nom]);
  }
  return f;
}

function lireTout(nom) {
  var valeurs = feuille(nom).getDataRange().getValues();
  var titres = valeurs.shift();
  var liste = [];
  for (var i = 0; i < valeurs.length; i++) {
    if (valeurs[i][0] === "") continue;
    var o = {};
    for (var j = 0; j < titres.length; j++) o[titres[j]] = valeurs[i][j];
    liste.push(o);
  }
  return liste;
}

function etat() {
  var sup = lireTout("Supprimes");
  var ids = [];
  for (var i = 0; i < sup.length; i++) ids.push(String(sup[i].id));
  return { ok: true, profils: lireTout("Profils"), resultats: lireTout("Resultats"), supprimes: ids };
}

function repondre(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return repondre(etat());
}

function ajouter(nom, liste) {
  if (!liste || !liste.length) return;
  var f = feuille(nom);
  var existants = lireTout(nom);
  var deja = {};
  for (var i = 0; i < existants.length; i++) deja[String(existants[i].id)] = true;
  var colonnes = ONGLETS[nom];
  var lignes = [];
  for (var k = 0; k < liste.length; k++) {
    var o = liste[k];
    if (deja[String(o.id)]) continue;
    var ligne = [];
    for (var c = 0; c < colonnes.length; c++) {
      var v = o[colonnes[c]];
      ligne.push(v === null || v === undefined ? "" : String(v));
    }
    lignes.push(ligne);
    deja[String(o.id)] = true;
  }
  if (lignes.length) f.getRange(f.getLastRow() + 1, 1, lignes.length, colonnes.length).setValues(lignes);
}

function retirer(ids) {
  if (!ids || !ids.length) return;
  var aRetirer = {};
  for (var i = 0; i < ids.length; i++) aRetirer[String(ids[i])] = true;
  var f = feuille("Resultats");
  var valeurs = f.getDataRange().getValues();
  for (var l = valeurs.length - 1; l >= 1; l--) {
    if (aRetirer[String(valeurs[l][0])]) f.deleteRow(l + 1);
  }
}

function doPost(e) {
  var verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var sup = [];
    var ids = d.supprimes || [];
    for (var i = 0; i < ids.length; i++) sup.push({ id: ids[i] });
    ajouter("Profils", d.profils);
    ajouter("Resultats", d.resultats);
    ajouter("Supprimes", sup);
    retirer(d.retirer);
    return repondre(etat());
  } finally {
    verrou.releaseLock();
  }
}
