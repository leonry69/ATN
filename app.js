var express = require('express')
var hbs = require('hbs')

var app = express()
const session = require('express-session')
app.use(session({
    resave:true,
    saveIninitialized: true,
    secret:'some1232#$@!#$%@#$%',
    cookie:{maxAge: 60000}
}))

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false}))
app.set('view engine','hbs')
hbs.registerPartials(__dirname + '/views/partials')

var url = 'mongodb+srv://leonry:huy0966902734@cluster0.9n6mb.mongodb.net/test';
var MongoClient = require('mongodb').MongoClient;

app.get('/home', (req,res)=>{
    res.render('home')
})
app.get('/about', (req,res)=>{
    res.render('about',{
        pageTitle:'About page'
    })
})
app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/register', (req,res)=>{
    res.render('register')
})

app.post('/new',async(req,res)=>{
    var nameInput = req.body.txtName;
    var passInput = req.body.txtPassword;
    var roleInput = req.body.role;
    var newUser = {name: nameInput, password: passInput, role: roleInput};
    
    let client=await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("users").insertOne(newUser);
    res.redirect('/login')
})
app.post('/doLogin',async(req,res)=>{
    var nameInput = req.body.txtName;
    var passInput = req.body.txtPassword;
    let client=await MongoClient.connect(url);
    let dbo = client.db("ATN");

    const cursor = dbo.collection("users").
        find({$and: [{name:nameInput},{password:passInput}]})
    const count = await cursor.count();

    if (count == 0){
        res.render('login',{message:'Invalid user!'})
    } else{
        let name = '';
        let role ='';
        await cursor.forEach(doc=>{
            name = doc.name;
            role = doc.role;
        })
        req.session.User = {
            name : name,
            role : role
        }
        res.redirect('/home')
    }
})
app.get('/',(req,res)=>{
    var user = req.session.User;
    if(!user || user.name == ''){
        res.render('notLogin',{message:'user chua dang nhap'})
    }else{
        res.render('home', {name:user.name, role:user.role})
    }
})
app.get('/',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo= client.db("ATN");
    let results= await dbo.collection("product").find({}).toArray();
    res.render('home',{model:results})
})
app.post('/search',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATN");
    let nameInput = req.body.txtName;
    let searchCondition = new RegExp(nameInput,'i')
    let results = await dbo.collection("product").find({name:searchCondition}).toArray();
    res.render('home',{model:results})

})
app.get('/delete',async (req,res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("product").deleteOne(condition);
    res.redirect('/')

})
app.post('/update', async(req,res)=>{
    let id = req.body.txtId;
    let nameInput = req.body.txtName;
    let priceInput = req.body.txtPrice;
    let newValues ={$set:{name: nameInput, price:priceInput}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(id)};
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATN");
    await dbo.collection("product").updateOne(condition,newValues);
    res.redirect('/');
})
app.get('/edit',async (req,res)=>{
    let id = req.query.id;

    var ObjectID = require('mongodb').ObjectID;

    let condition = {"_id" : ObjectID(id)};


    let client= await MongoClient.connect(url);

    let dbo = client.db("ATN");

    let productToEdit = await dbo.collection("product").findOne(condition);

    res.render('edit',{product:productToEdit})

})
app.get('/insert',(req,res)=>{
    res.render('newProduct')
})
app.post('/doInsert', async(req,res)=>{
    var nameInput = req.body.txtName;
    var priceInput = req.body.txtPrice;
    var newProduct = {name:nameInput, price:priceInput};
    let client= await MongoClient.connect(url);
    let dbo= client.db("ATN");
    await dbo.collection("product").insertOne(newProduct)
    res.redirect('/')
})

const PORT = process.env.PORT || 5000
app.listen(PORT);
console.log('Sever is running ' + PORT)