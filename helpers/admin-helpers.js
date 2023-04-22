const db = require('../config/connection')
const collection = require('../config/collections')
const { resolve } = require('promise')



module.exports = {
    
    getAllUsers: () => {
        return new Promise( async (resolve, reject) => {
          let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
          resolve(users)
        })
    },
    getAllOrders: () => {
        return new Promise( async (resolve, reject) => {
           let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
           resolve(orders)
        })
    }

}