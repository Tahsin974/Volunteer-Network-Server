const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();

const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3lwmdbh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("volunteer_database");
    const activityCollections = database.collection("activities");
    const volunteerCollections = database.collection("volunteers");

    app.get('/activities' , async(req,res) =>{
        const cursor = activityCollections.find({});
        const activities = await cursor.toArray()
        res.json(activities);

    })

    app.get('/activities/:id', async(req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const activity = await activityCollections.findOne(query)
      res.json(activity)
    })

    app.get('/volunteers' , async(req,res) =>{
      const cursor = volunteerCollections.find({});
      const volunteers = await cursor.toArray()
      res.json(volunteers);

  })

  app.get('/events' , async(req,res) => {
    const email = req.query.email;
    console.log(email)
    const query = { email: email };
    const cursor = volunteerCollections.find(query);
    const events = await cursor.toArray()
    res.json(events)
  })

    app.post('/activities' , async(req,res)=>{
      const doc = req.body;
      const result = await activityCollections.insertOne(doc);

      res.json(result)


    })
    app.post('/volunteers' , async(req,res)=>{
      const doc = req.body;
      const result = await volunteerCollections.insertOne(doc);

      res.json(result)


    })

    app.delete('/volunteers' , async(req,res) =>{
      const id = req.query.id;
      const query = {_id: new ObjectId(id)}
      const volunteer = await volunteerCollections.deleteOne(query)

      res.json(volunteer)
    })

  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Welcome To Volunteer Network Server");
});

app.listen(port, () => {
  console.log("listening to the port:", port);
});
