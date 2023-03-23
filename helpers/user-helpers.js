const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const objectId = require('mongodb').ObjectId

module.exports = {
    doSignup:(userData) => {
            return new Promise(async (resolve, reject) => {
                userData.password = await bcrypt.hash(userData.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(userData)
                    //resolve(data)    //data can't get inserted doc so pass userData as arg to resolve (have to change)
                })
            })
                
    },
    doLogin:(userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
          const user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
          if(user){
                bcrypt.compare(userData.password,user.password).then((status) => {
                    if(status){
                        console.log("login success")
                        response.user=user
                        response.status= true
                        resolve(response)
                    }else{
                        console.log("login failed");
                        resolve({status:false})
                    }
                })
          }else{
            console.log("login failed");
            resolve({status:false})
          }
        })
    },
    addToCart:(proId, userId) => {
        let prodObj = {
            item: objectId(proId),
            quantity:1
        }
        return new Promise( async (resolve, reject) => {
           let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({userId: objectId(userId)})
            if(userCart){
                let prodExist = userCart.products.findIndex(product => product.item == proId)
                if(prodExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({'products.item': objectId(proId)},
                    {
                        $inc:{'products.$.quantity': 1}       //$inc to increment the value  //$ use because     
                                                              //products is array
                    }
                    ).then(() => {
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({userId:objectId(userId)},
                    {
                        $push: {products:prodObj}
                    }).then((response) => {
                        resolve(response)
                    })
                }
            }else{
                let cartObj = {
                    userId: objectId(userId),
                    products: [prodObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
            
        })
    },
    getCartProducts:(userId) => {
        return new Promise( async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{userId:objectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project:{
                        item:1,
                        quantity:1,
                        product: { $arrayElemAt: ["$product", 0]}
                    }
                }
            ]).toArray()


            console.log(cartItems)
            resolve(cartItems)

        })
    },
    getCartCount:(userId) => {
        return new Promise( async (resolve, reject) => {
            let count = 0
          let cart = await db.get().collection(collection.CART_COLLECTION).findOne({userId:objectId(userId)})
          if(cart){
            count = cart.products.length
          }
          resolve(count)
        })
    },
    changeProductQuantity:(details) => {
        console.log(details)
        details.count = parseInt(details.count)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
            .updateOne({_id:objectId(details.cart), 'products.item': objectId(details.product)},
            {
                $inc: {'products.$.quantity':details.count}
            }
            ).then(()=>{
                resolve()
            })
        })
    }
}