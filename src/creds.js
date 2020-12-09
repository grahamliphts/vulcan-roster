function JsonFetch(url) {
  return fetch(url)
           .then(response => response.json())
           .catch(err => alert(err))
}

async function getToken(callback) {

    let url = 'https://eu.battle.net/oauth/token?client_id=3aa739b8c70c4af2993a6331178bd348&client_secret=HSBnqaMlHXHa3vQC6EJZOd8D5116F41k&grant_type=client_credentials' //api endpoint as a string       
    let token = (await JsonFetch(url)).access_token
    return callback(token)
}
