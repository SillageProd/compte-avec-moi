/* Compte avec moi - synchronisation des profils et des resultats entre l'iPad et l'iPhone.
   A coller dans un nouveau projet sur script.google.com, en remplacant tout le contenu.
   Les donnees vont dans leurs propres onglets ("Maths - ...") : celles de Lis avec moi ne sont jamais touchees. */

// Lien du Google Sheet a utiliser (par exemple celui de Lis avec moi), entre les guillemets.
// Laisser vide si ce code est colle dans Extensions > Apps Script du Google Sheet lui-meme.
var LIEN_SHEET = "";
var PREFIXE = "Maths - ";

var ONGLETS = {
  Profils: ["id", "nom", "animal", "couleur"],
  Resultats: ["id", "profil", "mode", "duree", "nombre", "exo", "niveau", "justes", "faux", "total", "tempsMs", "date"],
  Supprimes: ["id"]
};

function feuille(nom) {
  if (!ONGLETS[nom]) throw new Error("Choisir doGet dans la liste avant de cliquer sur Executer.");
  var ss = LIEN_SHEET ? SpreadsheetApp.openByUrl(LIEN_SHEET) : SpreadsheetApp.getActiveSpreadsheet();
  var f = ss.getSheetByName(PREFIXE + nom);
  if (!f) {
    f = ss.insertSheet(PREFIXE + nom);
    f.getRange("A:Z").setNumberFormat("@");
  }
  // la premiere ligne doit toujours etre celle des titres (id, nom, ...) : on la remet si elle manque
  if (f.getLastRow() === 0 || String(f.getRange(1, 1).getValue()) !== "id") {
    if (f.getLastRow() > 0) f.insertRowBefore(1);
    f.getRange(1, 1, 1, ONGLETS[nom].length).setValues([ONGLETS[nom]]);
  }
  return f;
}

// Les colonnes sont lues dans l'ordre fixe de ONGLETS ; une meme ligne (meme id) n'est rendue qu'une fois.
function lireTout(nom) {
  var valeurs = feuille(nom).getDataRange().getValues();
  var colonnes = ONGLETS[nom];
  var liste = [], vus = {};
  for (var i = 1; i < valeurs.length; i++) {
    var id = String(valeurs[i][0]);
    if (id === "" || vus[id]) continue;
    vus[id] = true;
    var o = {};
    for (var j = 0; j < colonnes.length; j++) o[colonnes[j]] = valeurs[i][j];
    liste.push(o);
  }
  return liste;
}

// A executer une fois si un onglet "Maths - ..." contient des lignes en double : garde une seule ligne par id.
function nettoyer() {
  for (var nom in ONGLETS) {
    var f = feuille(nom), lignes = lireTout(nom), colonnes = ONGLETS[nom];
    if (f.getLastRow() > 1) f.getRange(2, 1, f.getLastRow() - 1, f.getLastColumn()).clearContent();
    if (lignes.length) f.getRange(2, 1, lignes.length, colonnes.length).setValues(lignes.map(function (o) {
      return colonnes.map(function (c) { return o[c] === null || o[c] === undefined ? "" : String(o[c]); });
    }));
  }
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
