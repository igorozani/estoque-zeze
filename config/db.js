if(process.env.NODE_ENV == "production"){
    module.exports = {mongoUri: "mongodb+srv://igorozani:IguIn1995@cluster0-jar0r.gcp.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    module.exports = {mongoUri: "mongodb://localhost/estoque"}
}