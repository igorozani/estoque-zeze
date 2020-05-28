if(process.env.NODE_ENV == "production"){
    module.exports = {mongoUri: "mongodb+srv://igorozani:UQ97B6MUgMhWed1k@cluster0-jar0r.gcp.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    module.exports = {mongoUri: "mongodb://localhost/estoque"}
}