


const mongoClient = require('mongodb').MongoClient

const State={
    db:null
}


module.exports.connect = function(done){
  const url = process.env.MONGODB_URI
  const dbname = 'ART'

  mongoClient.connect(url,(err,data)=>{
      if(err) return done(err)
      State.db = data.db(dbname)
      done()
  })
}

module.exports.get =  function(){
  return State.db
}