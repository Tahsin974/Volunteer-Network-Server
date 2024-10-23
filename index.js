const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const ObjectId = require('mongodb').ObjectId;
const app = express();

const port = process.env.PORT || 5000;
// middleware
app.use(cors({
  origin:['https://tahsin-volunteer-network.web.app'],
  credentials:true
}));
app.use(express.json())
app.use(cookieParser())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3lwmdbh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// middleware 
const verifyToken = (req,res,next) =>{
  const token = req.cookies.token;
  if(!token){
    return res.status(401).send('unauthorized access')
  }

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded)=> {
    if(err){
      return res.status(401).send('unauthorized access')
      
    }
    else{
    req.user = decoded
    next()
      
    }
  });
  
  
}

async function run() {
  try {
    // await client.connect();
    const database = client.db("volunteer_database");
    const activityCollections = database.collection("activities");
    const volunteerCollections = database.collection("volunteers");
    // Auth related API
    app.post('/jwt',async (req,res) => {
      const user = req.body;
      console.log(user)
      const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, { expiresIn: '1h' });
      res
      .cookie('token',token,{httpOnly:true,secure:true,sameSite:'none'})
      .send({success:true})
    })

    // logout
    app.post('/logout',async (req,res) => {
      const user = req.body;
      console.log(user)
      res.clearCookie('token',{maxAge: 0})
      .send({success:true})
    })
    // activities related api
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

  app.get('/events' ,verifyToken, async(req,res) => {
    const email = req.query.email;
    const query = { email: email };
    const user = req.user;
    if(user.email === email){
      const cursor = volunteerCollections.find(query);
      const events = await cursor.toArray()
      return res.json(events)
    }
    return res.status(403).send('forbidden access')
    
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
    app.delete('/event' , async(req,res) =>{
      const title = req.query.name;
     
      const query = {eventName : title}
      
      
      const event = await volunteerCollections.deleteOne(query)
      console.log(event)

      res.json(event)
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
