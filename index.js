const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectID;
const port = 5000;
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.skjt9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log(err);
  const productsCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_PRODUCT_COLLECTION);
  const ordersCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.DB_ORDER_COLLECTION);

  app.post("/addProduct", (req, res) => {
    const products = req.body;
    // console.log(products);
    productsCollection.insertOne(products).then((result) => {
      res.json(result.insertedCount);
    });
  });

  app.get("/products", (req, res) => {
    productsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/product/:id", (req, res) => {
    productsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });

  app.delete("/delete/:id", (req, res) => {
    productsCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        console.log(!!result.deletedCount);
        res.json(!!result.deletedCount);
      });
  });

  app.post("/addOrder", (req, res) => {
    const order = req.body;
    // console.log(order)
    ordersCollection.insertOne(order).then((result) => {
      // console.log(result);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/orders/:email", (req, res) => {
    ordersCollection
      .find({ userEmail: req.params.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
});

app.listen(process.env.PORT || port);
