const db = require('../config/connection')
const collection = require('../config/collections')
const { resolve, reject } = require('promise')
const { ObjectId } = require('mongodb')



module.exports = {

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let categories = await db.get().collection(collection.SUBCATEGORY_COLLECTION).find().toArray()
            resolve(categories)
        })
    },
    addCategory: (categoryDetails) => {
        return new Promise(async (resolve, reject) => {

            let category = await db.get().collection(collection.SUBCATEGORY_COLLECTION).findOne({ categoryName: categoryDetails.subCategoryName })

            if (category) {
                console.log('category already exists');
            } else {

                await db.get().collection(collection.SUBCATEGORY_COLLECTION).insertOne(categoryDetails).then((response)=>{
                    resolve(response.insertedId)
                })


            }



        })
    },
    deleteCategory: (categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: ObjectId(categoryId) })
        })
        
    }


}