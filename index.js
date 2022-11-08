require('dotenv').config()
const express = require('express');
const cors = require('cors');
const colors = require('colors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express())


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

// database collection
const ServiceCollection = client.db('eyeCaredb').collection('services')

// check server
app.get('/', (req, res) => {
    res.send('Eye Care Server Is Connected')
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


app.listen(port, () => console.log(`Server Running On Port ${ port }`))
