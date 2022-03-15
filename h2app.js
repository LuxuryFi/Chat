const express = require('express');
const h2app_router = express.Router();
const handlebars = require('handlebars');
const fs = require('fs');
const hbs = require('hbs');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');
const app = express();
const uri = "mongodb+srv://quocanh2105:quocanh123@waifuganktem.rwsm6.mongodb.net/miniproject?retryWrites=true&w=majority";
const mongo = require('mongodb');
const {
    MongoClient
} = require('mongodb');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const ws = require('ws');

const wss = new ws.Server({
    port: 2021,
})

const clients = [];

wss.on('connection', socket => {
    console.log(`[${clients.length}] New Socket.`);

    socket.on('message', message => {
        message = JSON.parse(message);
        console.log(message)

        if (message.type === 'authenticate') {
            const existedClient = clients.find(x => x.user.username == message.user.username);
            if (!existedClient) {
                clients.push({
                    user: message.user,
                    socket,
                })
            }
        }
    })
})

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
    extended: false
}));
// product_router.set('view engine', 'hbs');
// product_router.use(express.static(__dirname + '/public'));
const storage = multer.diskStorage({
    destination: function (req, file, cb) { // kiem tra xxem file co dc cham nhan hay ko
        cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
        cb(null, req.body.name + '-' + Date.now() + path.extname(file.originalname));
    }
})


const tokenExpired = process.env.TOKEN_EXPIRED_IN || '';
const refreshExpired = process.env.REFRESH_EXPIRED_IN || '';

handlebars.registerHelper('selected', function(option, value){
    if (option == value) {
        return ' selected';
    } else {
        return ''
    }
});

// index
h2app_router.get('/index', async (req, res) => {
    const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    });
    let db = client.db('miniproject');

    const collection = db.collection('movies');

    const token = req.cookies.jwt;
    const result = jwt.verify(token, 'test');

    console.log('token', result)

    const response = await fetch(`http://192.168.1.11:8000/${result.id}`, {
        method: 'GET',
      }).then((resN) => resN.json());


    const movie = JSON.parse(response);

    // console.log(movie);

    const movieIds = movie.map( (each) => {
        return each.movie_id.toString();
    })

    const movies = await collection.find({
        // movieId: { $in: [ Math.floor(Math.random() * 10) ]},
        img: {
            $exists: true
        }
    }).limit(5).skip(Math.floor(Math.random() * 100)).toArray();

    const movies3 = await collection.find({
        img: {
            $exists: true
        }
    }, {}).limit(6).skip(Math.floor(Math.random() * 125)).toArray();

    const movies2 = await collection.find({
        movieId: { $in: movieIds },
        img: {
            $exists: true
        }
    }).limit(3).skip(Math.floor(Math.random() * 12)).toArray();

    console.log(movies3);

    res.render('h2app/index.hbs', {
        recommend: movies,
        recommend2: movies2,
        recommend3: movies3,
        user: {
            fullname: result.fullname,
            avatar: result.avatar
        }
    });
})

//end index


//view
h2app_router.get('/view', async (req, res) => {
    var id = req.query.id;
    const client = await MongoClient.connect(uri, {

        useUnifiedTopology: true
    });
    const db = client.db('miniproject');
    const collection = db.collection('movies');

    const token = req.cookies.jwt;
    const result = jwt.verify(token, 'test');

    console.log('token', result)

    const response = await fetch(`http://192.168.1.11:8000/${result.id}`, {
        method: 'GET',
      }).then((resN) => resN.json());

    const movie = JSON.parse(response);
    // console.log(movie);

    const movieIds = movie.map( (each) => {
        return each.movie_id.toString();
    })

    const movies = await collection.findOne({
        movieId: id
    });

    const movies1 = await collection.find({
        movieId: { $in: movieIds },
        img: {
            $exists: true
        }
    }).limit(3).skip(5).toArray();

    console.log(movies);

    res.render('h2app/product.hbs', {
        recommend: movies,
        recommend1: movies1,
    })

})

//end view

//add

h2app_router.get('/', (req, res) => {
    res.render('h2app/login.hbs', {
    })
})

h2app_router.get('/chat', (req, res) => {
    console.log('chat')
    res.render('h2app/chat.hbs', {
    })
})

h2app_router.get('/userInfo', async (req, res) => {
    const token = req.cookies.jwt;
    const result = jwt.verify(token, 'test');
    console.log('userInfo', result);
    res.send({
        username: result.username,
    });
})

h2app_router.post('/send', async (req, res) => {
    const data = req.body;
    console.log('data', data);
    const client = await MongoClient.connect(uri, {

        useUnifiedTopology: true
    });
    const db = client.db('miniproject');
    const collection = db.collection('messages');

    console.log('chat')
    const token = req.cookies.jwt;
    const result = jwt.verify(token, 'test');

    console.log(req.body);
    const tmp = {
        sender: result.username,
        receiver: data.receiver,
        message: data.message,
    };
    console.log(tmp);
    let is_insert = await collection.insertOne(tmp);

    for (const client of clients) {
        // if (client.user.username === tmp.sender || client.user.username === tmp.receiver) {
            console.log('Send to', client.user.username)
            client.socket.send(JSON.stringify(tmp));
        // }
    }
    res.send('OK');
})

h2app_router.get('/message', async (req, res) => {
    const client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    });
    const db = client.db('miniproject');
    const collection = db.collection('messages');
    const messages = await collection.find({}).toArray();
    res.send(messages);
})


h2app_router.get('/logout', (req, res) => {
    res.clearCookie("jwt");

    res.redirect('/h2app/');
})



h2app_router.post('/login', async (req, res) => {
    const client = await MongoClient.connect(uri, {

        useUnifiedTopology: true
    });
    const db = client.db('miniproject');
    const collection = db.collection('users');

    const { username, password } = req.body;
    const userInDB = await collection.findOne(
        {
            username: username
        }
    );

    console.log('password', password)
    // if (userInDB) {
        let passwordHash = userInDB.password;
        let userData = {
            id: userInDB.id,
            username: userInDB.username,
            email: userInDB.email,
            fullname: userInDB.fullname,
            avatar: userInDB.avatar,
        }
    // }
    const getTimeNow = new Date();
    console.log(passwordHash);
    if (bcrypt.compareSync(password,passwordHash)) {
        console.log('true')
        let token = jwt.sign(userData ,'test', {
                expiresIn: getTimeNow.getSeconds() + 60000
        })

        // let refreshToken = jwt.sign(userData, refreshTokenSecret, {
        //         expiresIn: getTimeNow.getSeconds() + +refreshExpired
        // })

        res.set('Authorization', token);
        res.cookie('jwt',token, { httpOnly: true, secure: false, maxAge: 3600000 })

        res.redirect('/h2app/chat')
    }

        // const checkTokenExist = await authService.findUserByUsername(username);

        // if (checkTokenExist) {
        //     await authService.destroyToken(username)
        // }

        // await authService.insertToken(username, refreshToken);

    // }
});

//end updates

module.exports = h2app_router;
