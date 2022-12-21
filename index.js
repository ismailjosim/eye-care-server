
require('dotenv').config()
require('colors');
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${ process.env.DB_USER }:${ process.env.DB_PASSWORD }@cluster0.s9x13go.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// connect database
const dbConnect = async () => {
    try {
        await client.connect();
        console.log("Database Connected!".gray.italic);

    } catch (error) {
        console.log(error.name, error.message);

    }
}
dbConnect()


const verifyJWT = (req, res, next) => {
	
    const authHeader = req.headers.authorization;
	
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized Access' });
    }


    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}


// database collection
const ServiceCollection = client.db('eyeCaredb').collection('services');
const reviewCollection = client.db('eyeCaredb').collection('reviews');

// check server
app.get('/', (req, res) => {
    res.send('Eye Care Server Is Connected')
})


// show all user review according to user email
app.get('/reviews', verifyJWT, async (req, res) => {
    try {
        const decoded = req.decoded;

        if (decoded.email !== req.query.email) {
            req.status(403).send({ message: "Unauthorized Access" })
        }

        let query = {};
        if (req.query.email) {
            query = { email: req.query.email }
        }
        const cursor = reviewCollection.find(query);
        const reviews = await cursor.toArray();
        res.send({
            success: true,
            reviews: reviews
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }

})




// get all services
app.get('/services', async (req, res) => {
    try {
        const query = {};
        const cursor = ServiceCollection.find(query)
        const services = await cursor.toArray()
        res.send({
            success: true,
            services: services
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})
// homepage card
app.get('/service', async (req, res) => {
    try {
        const query = {};
        const cursor = ServiceCollection.find(query);
        const service = await cursor.limit(3).toArray()
        res.send({
            success: true,
            services: service
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// send single product
app.get('/service/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const service = await ServiceCollection.findOne(query);
        res.send({
            success: true,
            service: service
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// add new service to database
app.post('/services', async (req, res) => {
    try {
        const service = req.body;
        const services = await ServiceCollection.insertOne(service);
        res.send({
            success: true,
            services: services
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

// add service review to database
app.post('/reviews', async (req, res) => {
    try {
        const review = req.body;
        const reviews = await reviewCollection.insertOne(review);
        res.send({
            success: true,
            reviews: reviews
        })

    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { service_id: id };
        const cursor = reviewCollection.find(query);
        const reviews = await cursor.sort({ timer: -1 }).toArray()
        res.send({
            success: true,
            reviews: reviews
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})



// Delete Reviews
app.delete('/review/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const review = await reviewCollection.deleteOne(query);
        res.send({
            success: true,
            review: review
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


// update Review
app.patch('/reviews/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const feedback = req.body.feedback;
        const reviews = await reviewCollection.updateOne({ _id: ObjectId(id) }, { $set: { feedback: feedback } });
        res.send({
            success: true,
            reviews: reviews
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})


app.post('/jwt', (req, res) => {
    const user = req.body;


    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    res.send({ token })
})




app.listen(port, () => console.log(`Server Running On Port ${ port }`))
