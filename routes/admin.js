var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
 productHelper.getAllProducts().then((products) => {
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

router.get('/delete-product/:id', (req, res) => {
    let  proId = req.params.id
    console.log(proId);
    productHelper.deleteProduct(proId).then((response) => {
      res.redirect("/admin/")
    })
})

router.get('/edit-product/:id', async (req, res) => {

        let product = await productHelper.getProductDetails(req.params.id).then((productDetail) => {
          res.render('admin/edit-product', {productDetail})
        })

  
})

router.post('/edit-product/:id', (req, res) => {
  productHelper.updateProduct(req.params.id, req.body).then((response) => {
    console.log(response);
    res.redirect('/admin')
    let image = req.files.image
    image.mv('./public/product-images/'+req.params.id+'.jpg')
  })
})

module.exports = router;
