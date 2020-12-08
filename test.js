function test() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); //get active spreadsheet (bound to this script)
var sheet = ss.getSheetByName('elzegang'); //The name of the sheet tab where you are sending the info
var bien = '#2ECC71'
var pasbien = '#E74C3C'
var rows = sheet.getDataRange().getValues();

var apiToken = 'USQSNaXtORv58jqjWJDTF0gGDeBhhnxuaH';

var test = rows[0][0];
  
for ( var columns = 1 ; columns < rows.length ; columns++ )
{
  var slackeur = rows[columns][0].toString().toLowerCase()
  var url = 'https://eu.api.blizzard.com/profile/wow/character/hyjal/'+ slackeur + '/equipment?namespace=profile-eu&locale=en_US&access_token=' + apiToken; //api endpoint as a string   
  var lalalala = columns[0]
  var response = UrlFetchApp.fetch(url); // get api endpoint
  var json = response.getContentText(); // get the response content as text
  var mae = JSON.parse(json); //parse text into json
  
  var cape = 'Je sais pas' 
  var brassards = 'Je sais pas'
  var gants = 'Je sais pas'
  var torse = 'Je sais pas'
  var bottes = 'Je sais pas'
  var anneau_1 = 'Je sais pas'
  var anneau_2 = 'Je sais pas' 
  var arme_1 = 'Je sais pas'
  var arme_2 = 'Je sais pas'
  
  var metier_1 = 'Je sais pas'
  var metier_2 = 'Je sais pas'
  
  var ilvl = 0;
  Logger.log(mae); //log data to logger
  var it = 0;
  var propre = 0
  for(var it = 0; it < mae['equipped_items'].length ; it++)
  {
    if ( mae['equipped_items'][it]['level'].value > 50 )
      ilvl += mae['equipped_items'][it]['level'].value;
    else
      propre ++;
    // check cape 
    if ( mae['equipped_items'][it]['slot'].type === 'BACK'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        cape = "Pas d'enchantement "
      else
        cape = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    // check torse 
    if ( mae['equipped_items'][it]['slot'].type === 'CHEST'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        torse = "Pas d'enchantement "
      else
        torse = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    // check gants 
    if ( mae['equipped_items'][it]['slot'].type === 'HANDS'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        gants = "Pas d'enchantement "
      else
        gants = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
     // check brassards 
    if ( mae['equipped_items'][it]['slot'].type === 'WRIST'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        brassards = "Pas d'enchantement "
      else
        brassards = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    // check bottes 
    if ( mae['equipped_items'][it]['slot'].type === 'FEET'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        bottes = "Pas d'enchantement "
      else
        bottes = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    
    // check anneau 1 
    if ( mae['equipped_items'][it]['slot'].type === 'FINGER_1'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        anneau_1 = "Pas d'enchantement "
      else
        anneau_1 = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    // check anneau 2 
    if ( mae['equipped_items'][it]['slot'].type === 'FINGER_2'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        anneau_2 = "Pas d'enchantement "
      else
        anneau_2 = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    // check anneau 2 
    if ( mae['equipped_items'][it]['slot'].type === 'MAIN_HAND'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        arme_1 = "Pas d'enchantement "
      else
        arme_1 = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    // check anneau 2 
    if ( mae['equipped_items'][it]['slot'].type === 'OFF_HAND'  )
    {
      if (mae['equipped_items'][it]['enchantments'] == undefined )
        arme_2 = "Pas d'enchantement "
      else
        arme_2 = mae['equipped_items'][it]['enchantments'][0].display_string.replace("Enchanted: ",'');
    }
    
  }
  ilvl = (ilvl /(mae['equipped_items'].length - propre)).toFixed(2);
  
  sheet.getRange('B'+ (columns + 1) ).setValue(parseFloat(ilvl)) 
  sheet.getRange('C'+ (columns + 1) ).setValue(cape.toString()) 
  sheet.getRange('D'+ (columns + 1) ).setValue(torse.toString()) 
  sheet.getRange('E'+ (columns + 1) ).setValue(brassards.toString())  
  sheet.getRange('F'+ (columns + 1) ).setValue(bottes.toString())  
  sheet.getRange('G'+ (columns + 1) ).setValue(gants.toString())  
  sheet.getRange('H'+ (columns + 1) ).setValue(arme_1.toString())  
  sheet.getRange('I'+ (columns + 1) ).setValue(arme_2.toString()) 
  sheet.getRange('J'+ (columns + 1) ).setValue(anneau_1.toString())
  sheet.getRange('K'+ (columns + 1) ).setValue(anneau_2.toString())
  sheet.getRange('L'+ (columns + 1) ).setValue(metier_1.toString())
  sheet.getRange('M'+ (columns + 1) ).setValue(metier_2.toString())

}

 

//
//var date = new Date(); //create new date for timestamp
//
////The number in brackets refers to which instance we are looking at - soonest upcoming call is [0], next after that is [1], etc.
//stats.push(date); //timestamp
//stats.push(mae.value.conference[0].name);
//stats.push(mae.value.conference[0].scheduledStartTime);
//stats.push(mae.value.conference[0].UID);
//
////append the stats array to the active sheet 
//sheet.appendRow(stats);
}
