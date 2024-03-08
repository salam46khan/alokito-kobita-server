const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// console.log('hi', process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wueeg5w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});




async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const poemsCollection = client.db("alokitoKobitaDB").collection("poems")
        const faqCollection = client.db("alokitoKobitaDB").collection("faqs")
        const reviewCollection = client.db("alokitoKobitaDB").collection("reviews")
        const fevCollection = client.db("alokitoKobitaDB").collection("fev")
        const userCollection = client.db("alokitoKobitaDB").collection("users")


        app.get('/poems', async (req, res) => {
            const result = await poemsCollection.find().sort({ _id: -1 }).toArray()
            res.send(result)
        })
        app.post('/poem', async (req, res) => {
            const publishPoem = req.body
            // console.log(publishPoem);
            const result = await poemsCollection.insertOne(publishPoem)
            res.send(result)
        })
        app.get('/poem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await poemsCollection.findOne(query)
            res.send(result)
        })
        app.get('/mypoem', async (req, res) => {
            const email = req.query?.email;
            // const query = {email : email}
            let query = {}
            if (email) {
                query = { poetry_email: email }
            }
            const result = await poemsCollection.find(query).toArray()
            res.send(result)
        })
        app.patch('/mypoem/:id', async (req, res) => {
            const id = req.params.id;
            const updatePoem = req.body
            // console.log(updatePoem);
            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    poem: updatePoem.poem,
                    poem_name: updatePoem.poem_name,
                    category: updatePoem.category,
                    cover_photo: updatePoem.cover_photo
                }
            }

            const result = await poemsCollection.updateOne(filter, updateDoc,)
            res.send(result)
        })
        app.delete('/mypoem/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await poemsCollection.deleteOne(query)
            res.send(result)
        })



        app.get('/faqs', async (req, res) => {
            const result = await faqCollection.find().toArray()
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().sort({ _id: -1 }).toArray()
            res.send(result)
        })
        app.post('/reviews', async (req, res) => {
            const review = req.body
            // console.log(review);
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.get('/fevs', async (req, res) => {
            const result = await fevCollection.find().sort({ _id: -1 }).toArray()
            res.send(result)
        })
        app.post('/fev', async (req, res) => {
            const fevorite = req.body;
            const result = await fevCollection.insertOne(fevorite)
            res.send(result)
        })
        app.get('/myfev', async (req, res) => {
            const email = req.query?.email;
            // const query = {email : email}
            let query = {}
            if (email) {
                query = { user_email: email }
            }
            const result = await fevCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/fev/:id', async (req, res)=>{
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await fevCollection.deleteOne(query)
            res.send(result)
        })


        app.post('/users', async (req, res)=>{
            const user = req.body;
            
            const query = {email :  user.email}
            const existingUser = await userCollection.findOne(query)
            if(existingUser){
                return res.send({message: 'user exists', insertedId: null}) 
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
        })
        app.get('/user', async(req, res)=>{
            let query ={}
            if(req.query?.email){
                query = {email: req.query.email}
            }
            const cursor = userCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.put('/user/:id', async (req, res) => {
            const id = req.params.id;
            const updatePro = req.body;
            // console.log(updatePro);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const update = {
              $set: {
                address: updatePro.address,
                phone: updatePro.phone,
                birthday: updatePro.birthday,
                bio: updatePro.bio
              }
            }
            const result = await userCollection.updateOne(filter, update, options)
            res.send(result)
          })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`server is runing from ${port}`)
})