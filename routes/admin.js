var express = require('express');
var router = express.Router();
const productHelper = require('../helpers/product-helpers')
const adminHelper = require('../helpers/admin-helpers')


const adminInfo = {
  username: process.env.ADMIN_USERNAME,
  password: process.env.ADMIN_PASSWORD
}

const verifyLogin = (req, res, next) => {
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
 productHelper.getAllProducts().then((products) => {
  res.render('admin/view-products', {products, admin: true})
})

router.get('/login', (req, res) => {
  if(req.session.loggedIn){
    res.redirect('/admin')
  }else{
    res.render('admin/login')
  }
  
})

router.post('/login', (req, res) => {
  console.log(req.body);
  if(req.body.username == adminInfo.username && req.body.password == adminInfo.password){
    productHelper.getAllProducts().then((products) => {
      req.session.loggedIn = true
      res.redirect('/admin')
    })
  }else{
    console.log('fls');
  }
})
  
});

router.get('/add-product', verifyLogin, (req,res) => {
  res.render('admin/add-product')
})

router.post('/add-product', verifyLogin, (req, res) => {
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

router.get('/delete-product/:id', verifyLogin, (req, res) => {
    let  proId = req.params.id
    console.log(proId);
    productHelper.deleteProduct(proId).then((response) => {
      res.redirect("/admin/")
    })
})

router.get('/edit-product/:id', verifyLogin, async (req, res) => {

        let product = await productHelper.getProductDetails(req.params.id).then((productDetail) => {
          res.render('admin/edit-product', {productDetail})
        })

  
})

router.post('/edit-product/:id', verifyLogin, (req, res) => {
  productHelper.updateProduct(req.params.id, req.body).then((response) => {
    console.log(response);
    res.redirect('/admin')
    let image =  req.files.image
    image.mv('./public/product-images/'+req.params.id+'.jpg')
  })
})

router.get('/all-users', (req, res) => {

    adminHelper.getAllUsers().then((users) => {
      res.render('admin/all-users', {users, admin: true})
    })

  
})

router.get('/all-orders', (req, res) => {
    adminHelper.getAllOrders().then((orders) => {
      res.render('admin/all-orders', {orders, admin: true})
    })
    
})

module.exports = router;
