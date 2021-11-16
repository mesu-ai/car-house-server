const express= require('express');
const app=express();
const cors=require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId

const port=process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const { MongoClient } = require('mongodb');
const { query } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mzg8e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      const database = client.db("carhouse");
      const carsCollection = database.collection("cars");
      const reviewCollection = database.collection("reviews");
      const ordersCollection = database.collection("orders");
      const usersCollection = database.collection("users");
      
      
      console.log('connect to db');

      //post user

      app.post('/users',async(req,res)=>{
        const user=req.body;
        const result=await usersCollection.insertOne(user);
        res.json(result);

    });

    // users find
      app.get('/users',async(req,res)=>{
        const cursor= usersCollection.findOne({});
        const result=await cursor.toArray();
        res.json(result);

    });

    //user put

    app.put('/users',async(req,res)=>{
            
        const user=req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
       
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);

        res.json(result);
    });

    

    // make user admin
    app.put('/users/admin',async(req,res)=>{
        const user=req.body;
        console.log(user)
        const filter={email: user.email};
        const updateDoc={$set:{role:"admin"}};
        const result=await usersCollection.updateOne(filter,updateDoc);
        console.log(result);
        res.json(result);
               
    });
    //check user admin
    app.get('/users/:email',async(req,res)=>{
    
        const email=req.params.email;
        const query={email: email};
        const user=await usersCollection.findOne(query);
        let isAdmin= false;
        if(user?.role ==='admin'){
            isAdmin=true;
        }
        res.send({admin: isAdmin});
    })




    //   get car api
    app.get('/cars',async(req,res)=>{
        const cursor= carsCollection.find({});
        const result= await cursor.toArray();
        res.send(result);
    });

    //get selected car
    app.get('/cars/:id',async(req,res)=>{
        const id=req.params.id;
        const quary={_id:ObjectId(id)};
        const result=await carsCollection.findOne(quary);
        res.send(result);
    })

    //post new car

    app.post('/cars',async(req,res)=>{
        const addCar=req.body;
        const result=await carsCollection.insertOne(addCar);
        res.json(result);

    });

    //delete car
    app.delete('/cars/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await carsCollection.deleteOne(query);
        res.json(result);

    });

      // post review api
    app.post('/reviews',async(req,res)=>{
        const addReview= req.body;
        const result= await reviewCollection.insertOne(addReview);
        res.json(result);
    });

    // get review api
    app.get('/reviews',async(req,res)=>{

        const email=req.query.email;
        let cursor;
        if(email){
            
            const query = {email: email}
            cursor=reviewCollection.find(query);

        }else{
            cursor= reviewCollection.find({});

        }
        
        const result= await cursor.toArray();
        res.send(result);
    });

    // get selected review
    app.get('/reviews/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result= await reviewCollection.findOne(query);
        res.send(result);
    });

    // delete selected review
    app.delete('/reviews/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result= await reviewCollection.deleteOne(query);
        res.json(result);
    });

    // post order

    app.post('/orders',async(req,res)=>{
        const orderplace=req.body;
        const result= await ordersCollection.insertOne(orderplace);
        res.json(result);


    });

    app.get('/orders', async (req, res) => {

        const email = req.query.email;
        let cursor;

        if(email){
        const query = {email: email}
        cursor = ordersCollection.find(query);

        }else{
        cursor=ordersCollection.find({});

        }
        
        const result = await cursor.toArray();
        res.send(result);
    });

    
    // //get orders
    // app.get('/orders',async(req,res)=>{
    //     const cursor= ordersCollection.find({});
    //     const result= await cursor.toArray();
    //     res.json(result);
    // });

    // get selected order
    app.get('/orders/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result= await ordersCollection.findOne(query);
        res.json(result);
    });

    

    
    // delete selected order
    app.delete('/orders/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result= await ordersCollection.deleteOne(query);
        res.json(result);
    });

    // update order status
    app.put('/orders/orderStatus',async(req,res)=>{
        const user=req.body;
        console.log(user);
        const filter={_id:ObjectId(user._id)};
        const options = { upsert: true };
        const updateDoc={$set:{orderStatus:user.orderStatus}};
        const result=await ordersCollection.updateOne(filter,updateDoc,options);
        console.log(result);
        res.json(result);
               
    });


    


    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);


app.get('/',(req,res)=>{
    console.log('Car House Server');
    res.send('Car House');
});

app.listen(port,(req,res)=>{
    console.log('connect to port:',port);
});