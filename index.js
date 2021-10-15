const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// const appError = require('./appError') ;



const Product = require('./models/product');
const appError = require('./appError');
const { stat } = require('fs');

mongoose.connect('mongodb://localhost:27017/farmStand', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

const categories = ['fruit', 'vegetable', 'dairy'];

// To avoid redundancy of try and catch 
function wrapAsync(fn){
    return function(req,res,next){
        fn(req,res,next).catch(e=>{
            next(e) ;
        })
    }
}

// this is our index page

app.get('/products', wrapAsync(async (req, res,next) => {
    
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })

        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
}));


// To create New Product

app.get('/products/new', (req, res) => {
    //  throw new appError("Something Went Wrong",404) ;
    res.render('products/new', { categories })
})

app.post('/products', wrapAsync(async (req, res,next) => {
    
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`) ;
    

})) ;

// To show each store i.e ->>>>>> show.ejs

app.get('/products/:id', wrapAsync(async (req, res,next) => {
    
    const { id } = req.params;
    const product = await Product.findById(id);
    if(!product){
        throw new appError(404,'Broke') ;
    }
    res.render('products/show',{product}) ;
   
    


    // .then((product)=>{
    //     console.log(product) ;
    //     res.render('products/show',{product}) ;
    // })
    // .catch(()=>{
    //     return next(new appError(401,'Wrong App Validator')) ;
    // })
}))


// To edit the particular store

app.get('/products/:id/edit', wrapAsync(async (req, res,next) => {
   
    const { id } = req.params;
    const product = await Product.findById(id);
       
    if(!product){
        throw new appError(404,'broke') ;
    }
    res.render('products/edit', { product, categories });
   
})) ;

app.put('/products/:id', wrapAsync(async (req, res,next) => {
    
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`);
    
})) ;

// To delete

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})


const castError = err=>{
    console.log(err) ;
    return new appError(`Wrong Object Id.....${err.message}`,404) ;
}
const validationError = err=>{
    console.log(err) ;
    return new appError(`Validation Error.........${err.message}`,400) ;
}

// a middleware to handle error

app.use((err,req,res,next)=>{
    console.log(err.message) ;
    if(err.name==='CastError')  err = castError(err) ;
    if(err.name==='ValidationError') err = validationError(err) ;
    next(err) ;
})

app.use((err,req,res,next)=>{
    const {status=401,message='Something Went Wrong'} = err ; //we are destructuring it
    res.status(status).send(message) ;
})



app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})


