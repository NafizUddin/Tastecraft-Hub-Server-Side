const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wixlrgj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const brandsCollection = client.db("tasteCraftDB").collection("brands");
    const itemsCollection = client.db("tasteCraftDB").collection("items");
    const usersCollection = client.db("tasteCraftDB").collection("users");
    const cartCollection = client.db("tasteCraftDB").collection("cart");

    // Brand Related APIs
    app.get("/brands", async (req, res) => {
      const result = await brandsCollection.find().toArray();
      res.send(result);
    });

    app.get("/brands/:brand", async (req, res) => {
      const brand = req.params.brand;
      console.log(brand);
      const query = { brandName: brand };
      const result = await brandsCollection.findOne(query);
      res.send(result);
    });

    app.post("/brands", async (req, res) => {
      const newBrands = req.body;
      const result = await brandsCollection.insertOne(newBrands);
      res.send(result);
    });

    // Item Related APIs
    app.get("/items", async (req, res) => {
      const result = await itemsCollection.find().toArray();
      res.send(result);
    });

    app.get("/items/:id([0-9a-fA-F]{24})", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemsCollection.findOne(query);
      res.send(result);
    });

    app.post("/items", async (req, res) => {
      const newItems = req.body;
      const result = await itemsCollection.insertOne(newItems);
      res.send(result);
    });

    app.put("/items/:id([0-9a-fA-F]{24})", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedItems = req.body;
      const options = { upsert: true };
      const newItems = {
        $set: {
          name: updatedItems.name,
          brand: updatedItems.brand,
          type: updatedItems.type,
          price: updatedItems.price,
          photo: updatedItems.photo,
          rating: updatedItems.rating,
          description: updatedItems.description,
        },
      };
      const result = await itemsCollection.updateOne(filter, newItems, options);
      res.send(result);
    });

    // User related APIs

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // Cart Related APis

    app.get("/cart/:email", async (req, res) => {
      const requestedUserEmail = req.params.email;
      const query = {
        userEmail: requestedUserEmail,
      };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/cart/:email/:id([0-9a-fA-F]{24})", async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;
      const query = { _id: new ObjectId(id), userEmail: email };
      const result = await cartCollection.findOne(query);
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const newCartProduct = req.body;
      const result = await cartCollection.insertOne(newCartProduct);
      res.send(result);
    });

    app.delete("/cart/:email/:id([0-9a-fA-F]{24})", async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;
      const query = { _id: new ObjectId(id), userEmail: email };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
