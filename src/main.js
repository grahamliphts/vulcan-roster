
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('elzegang'); //The name of the sheet tab where you are sending the info
apiToken = getTokenblibli.getToken();

function main() {
    var rows = sheet.getDataRange().getValues();
    for (var columns = 1; columns < rows.length; columns++) {
        var slackeur = rows[columns][1].toString().toLowerCase()
        
        

        getStuff(columns + 1, slackeur)
        //getJobs('N' + (columns + 1), 'O' + (columns + 1), slackeur)
        //getIcon('A' + (columns + 1),slackeur)
        //getbossDown('P' + (columns + 1),'Q' + (columns + 1),'R' + (columns + 1),slackeur)
    }
  
  //var columnGroup = sheet.getColumnGroup(2, 1);
  //columnGroup.collapse();
}

function getEnchant(slot, destination, item) {
    var res = ' empty ';
    var returnVal = 0;
    if (item['slot'].type === slot) {
        if (item['enchantments'] == undefined)
        {
            res = "Pas d'enchantement "
            returnVal = 1;
        }
        else
        {
          res = item['enchantments'][0].display_string.replace("Enchanted: ", '');
          returnVal = 0;
        }
            
        sheet.getRange(destination).setValue(res)
    }
  return returnVal
}

function getStuff(column, slackeur) {
    var url = 'https://eu.api.blizzard.com/profile/wow/character/hyjal/' + slackeur + '/equipment?namespace=profile-eu&locale=en_US&access_token=' + apiToken; //api endpoint as a string       
  try {
    var response = UrlFetchApp.fetch(url); // get api endpoint
  }
  catch ( exception )
  {
    return;
  }
    var json = response.getContentText(); // get the response content as text
    var JsonRes = JSON.parse(json); //parse text into json
    var items = JsonRes['equipped_items']
    var ilvl = 0;
    var Ignored = 0
    var slackScore = 0;
  
    for (var it = 0; it < items.length; it++) {
        if (items[it]['level'].value > 50)
            ilvl += items[it]['level'].value;
        else
            Ignored++;
      
        
        slackScore += getEnchant('BACK', 'E' + column, items[it], sheet)
        slackScore += getEnchant('CHEST', 'F' + column, items[it], sheet)
        slackScore += getEnchant('WRIST', 'G' + column, items[it], sheet)
        slackScore += getEnchant('FEET', 'H' + column, items[it], sheet)
        slackScore += getEnchant('HANDS', 'I' + column, items[it], sheet)
        slackScore += getEnchant('MAIN_HAND', 'J' + column, items[it], sheet)
        slackScore += getEnchant('OFF_HAND', 'K' + column, items[it], sheet)
        slackScore += getEnchant('FINGER_1', 'L' + column, items[it], sheet)
        slackScore += getEnchant('FINGER_2', 'M' + column, items[it], sheet)
        
        

    }
    sheet.getRange('D' + column).setValue(parseInt(slackScore))
    ilvl = (ilvl / (items.length - Ignored)).toFixed(2);
    sheet.getRange('C' + column).setValue(parseFloat(ilvl))
}
function getJobs(destination_1, destination_2, slackeur) {
    var url = 'https://eu.api.blizzard.com/profile/wow/character/hyjal/' + slackeur + '/professions?namespace=profile-eu&locale=en_EU&access_token=' + apiToken; //api endpoint as a string   
    
 try {
    var response = UrlFetchApp.fetch(url); // get api endpoint
  }
  catch ( exception )
  {
    return;
  }
    var json = response.getContentText(); // get the response content as text
    var JsonRes = JSON.parse(json); //parse text into json

  if (JsonRes['primaries'] !== undefined && JsonRes['primaries'].length > 0) {
        var IDdemerde = JsonRes['primaries'][0]['tiers'].length - 1;

        var name = JsonRes['primaries'][0].profession.name;
        var lvl = JsonRes['primaries'][0]['tiers'][IDdemerde].skill_points
        var max_lvl = JsonRes['primaries'][0]['tiers'][IDdemerde].max_skill_points
        sheet.getRange(destination_1).setValue(name + ' ' + lvl + ' / ' + max_lvl)
    }

    if (JsonRes['primaries'] !== undefined && JsonRes['primaries'].length > 1) {
        var IDdemerde = JsonRes['primaries'][1]['tiers'].length - 1;
        name = JsonRes['primaries'][1].profession.name;
        lvl = JsonRes['primaries'][1]['tiers'][IDdemerde].skill_points
        max_lvl = JsonRes['primaries'][1]['tiers'][IDdemerde].max_skill_points
        sheet.getRange(destination_2).setValue(name + ' ' + lvl + ' / ' + max_lvl)
    }

}
function getIcon(destination,slackeur)
{
  var url = 'https://eu.api.blizzard.com/profile/wow/character/hyjal/' + slackeur + '/appearance?namespace=profile-eu&locale=en_EU&access_token=' + apiToken; //api endpoint as a string   
    
 try {
    var response = UrlFetchApp.fetch(url); // get api endpoint
  }
  catch ( exception )
  {
    return;
  }
    var json = response.getContentText(); // get the response content as text
    var JsonRes = JSON.parse(json); //parse text into json
    var class_ID = JsonRes.playable_class.id
    
    var url = 'https://eu.api.blizzard.com/data/wow/media/playable-class/'+ class_ID +'?namespace=static-eu&locale=en_US&access_token=' + apiToken; //api endpoint as a string   
    
 try {
    var response = UrlFetchApp.fetch(url); // get api endpoint
  }
  catch ( exception )
  {
    return;
  }
    var json = response.getContentText(); // get the response content as text
    var JsonRes = JSON.parse(json); //parse text into json
  
  sheet.getRange(destination).setValue('=IMAGE("'+ JsonRes['assets'][0].value + '")')
    
    var temp = "bababab"
}

function getbossDown(destination,destination_2,destination_3,slackeur)
{
  var url = 'https://raider.io/api/v1/characters/profile?region=eu&realm=hyjal&name=' + slackeur + '&fields=raid_progression'; //api endpoint as a string   
    
 try {
    var response = UrlFetchApp.fetch(url); // get api endpoint
  }
  catch ( exception )
  {
    return;
  }
    var json = response.getContentText(); // get the response content as text
    var JsonRes = JSON.parse(json); //parse text into json
  var tb = JsonRes['raid_progression']['castle-nathria'].total_bosses
  sheet.getRange(destination).setValue(JsonRes['raid_progression']['castle-nathria'].normal_bosses_killed + ' / '+ tb)
  sheet.getRange(destination_2).setValue(JsonRes['raid_progression']['castle-nathria'].heroic_bosses_killed + ' / '+ tb)
  sheet.getRange(destination_3).setValue(JsonRes['raid_progression']['castle-nathria'].mythic_bosses_killed + ' / '+ tb)
}
