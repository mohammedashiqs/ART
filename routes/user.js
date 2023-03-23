const express = require('express');
const { helpers } = require('handlebars');
const router = express.Router();
const productHelper = require('../helpers/product-helpers')
const userHelper = require('../helpers/user-helpers')

const varifyLogin = (req, res, next) => {
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async (req, res) => {
  let user = req.session.user
  let cartCount = null
  if(req.session.user){
    cartCount = await userHelper.getCartCount(req.session.user._id)
  }
  
  productHelper.getAllProducts().then((products) => {
    res.render('user/view-products', {products, user, cartCount});
  })
 
  
});

router.get('/login', (req, res) => {
  console.log(req.session.loggedIn)
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login', {loginError:req.session.loginError})
    req.session.loginError = false
  }
  
})

router.get('/signup', (req, res) => {
  res.render('user/signup')
})

router.post('/signup', (req, res) => {
  console.log(req.body)
  userHelper.doSignup(req.body).then((response) => {
    req.session.loggedIn = true
    req.session.user = response   //now we can't get inserted doc detail as return so i have to change later
    res.redirect('/')
  })
})

router.post('/login', (req, res) => {
  userHelper.doLogin(req.body).then((response) => {
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginError = "Invalid username or password"
      res.redirect('/login')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', varifyLogin, async (req, res) => {
  let products = await userHelper.getCartProducts(req.session.user._id)
  res.render('user/cart',{products, user: req.session.user})
})


router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call");
  userHelper.addToCart(req.params.id, req.session.user._id).then((resoponse) => {
    res.json({status:true})
  })
})

router.post('/change-product-quantity', (req, res) => {
  userHelper.changeProductQuantity(req.body).then(() => {

  })
})



module.exports = router;
