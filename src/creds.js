function getToken() {

    let url = 'https://eu.battle.net/oauth/token?client_id=3aa739b8c70c4af2993a6331178bd348&client_secret=HSBnqaMlHXHa3vQC6EJZOd8D5116F41k&grant_type=client_credentials'; //api endpoint as a string       
    var temp  = await JsonFetch(url)
    var token = await JsonFetch(url).access_token
    return token ;
}
function test() {
    document.write('<p>' + "coucou" + '</p>');
}

async function JsonFetch(url) {
    return fetch(url)
        .then((response) => {
            console.log(response)
            return response.json()
        })
        .then((data) => {
            // Work with JSON data here 
            console.log(data)
            return data
        })
        .catch((err) => {
            // Do something for an error here
        })
}
