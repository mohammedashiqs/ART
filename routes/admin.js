var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
 

productHelper.getAllProducts().then((products) => {
  console.log(products)
  res.render('admin/view-products', {products, admin: true})
})
  
});

router.get('/add-product', (req,res) => {
  res.render('admin/add-product')
})

router.post('/add-product', (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    console.log(id)
    let image = req.files.image
    image.mv('./public/product-images/'+id+'.jpg', (err) => {
      if(!err){
        res.render('admin/add-product')
      }else{
        console.log(err)
      }
    }) //mv function (move) from the middleware of fileupload //to move file to folder (into public folder)
    
  })
})

module.exports = router;
