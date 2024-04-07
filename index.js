require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");
const redis = require("redis");
const PORT = process.env.PORT || 3000;

const redisClient = redis.createClient({
    password: process.env.REDIS_CLOUD_PASSWORD,
    socket: {
        host: process.env.REDIS_CLOUD_HOST,
        port: process.env.REDIS_CLOUD_PORT
    }
});

redisClient
    .connect(console.log("connected to redis"))
    .catch((error) => console.log(error, "redis connection error"));

app.get("/api/a2rp", (req, res) => {
    try {
        res.json({ success: true, message: "a2rp: an Ashish Ranjan presentation" });
    } catch (error) {
        console.log(error, "a2rp error");
        res.json({ success: false, message: error.message });
    }
});

app.get("/api/get-products", async (req, res) => {
    try {
        let products;
        if (redisClient.isReady) {
            products = await redisClient.get("products");
        }
        if (products) {
            console.log("Cache available");
            return res.json({ success: true, message: JSON.parse(products) });
        } else {
            console.log("Cache not available");
            products = await axios.get("https://dummyjson.com/products");
            if (redisClient.isReady) {
                redisClient.setEx("products", 10, JSON.stringify(products.data));
            }
        }
        // console.log(products, "products");
        res.json({ success: true, message: products.data });
    } catch (error) {
        console.log(error, "get prodicts error");
    }
});

app.listen(PORT, console.log(`server running http://localhost:${PORT}`));


