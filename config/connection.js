const mongoClient = require('mongodb').MongoClient

const State={
    db:null
}


module.exports.connect = function(done){
  const url = 'mongodb+srv://ashiq123:ashiq123@cluster0.weom3j5.mongodb.net/?retryWrites=true&w=majority'
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