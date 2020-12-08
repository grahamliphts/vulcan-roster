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