import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;

const customers = [
    { id: 65010468, name: "Thanyatorn", birthdate: "2003-02-19" },
];

app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory

const url = "https://script.google.com/macros/s/AKfycbzwclqJRodyVjzYyY-NTQDb9cWG6Hoc5vGAABVtr5-jPA_ET_2IasrAJK4aeo5XoONiaA/exec";
const logs_url = "https://app-tracking.pockethost.io/api/collections/drone_logs/records";

// Endpoint to log temperature data
app.post("/logs", async (req, res) => {
    try {
        const rawData = await fetch(logs_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        if (!rawData.ok) {
            return res.status(500).send({ message: "Error logging data" });
        }

        res.send("OK");
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Endpoint to get logs
app.get("/logs", async (req, res) => {
    try {
        const rawData = await fetch(logs_url, { method: "GET" });
        const jsonData = await rawData.json();
        const logs = jsonData.items;
        res.send(logs);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Endpoint to get drone configuration by ID
app.get("/configs/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const rawData = await fetch(url, { method: "GET" });

        if (!rawData.ok) {
            return res.status(500).send({ message: "Error fetching data from external API" });
        }

        const jsonData = await rawData.json();
        const drones = jsonData.data || [];
        const myDrone = drones.find((item) => item.drone_id == id);

        if (!myDrone) {
            return res.status(404).send({ message: "Drone not found" });
        }

        myDrone.max_speed = !myDrone.max_speed ? 100 : myDrone.max_speed;
        myDrone.max_speed = myDrone.max_speed > 110 ? 110 : myDrone.max_speed;
        
        res.send(myDrone);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Endpoint to get drone status by ID
app.get("/status/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const rawData = await fetch(url, { method: "GET" });

        if (!rawData.ok) {
            return res.status(500).send({ message: "Error fetching data from external API" });
        }

        const jsonData = await rawData.json();
        const drones = jsonData.data || [];
        const myDrone = drones.find((item) => item.drone_id == id);

        if (!myDrone) {
            return res.status(404).send({ message: "Drone not found" });
        }

        const droneCondition = { condition: myDrone.condition };
        
        res.send(droneCondition);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Basic route for server status
app.get("/", (req, res) => {
    res.send("Server API Assignment 1");
});

// Endpoint to get all customers
app.get("/customers", (req, res) => {
    res.send(customers);
});

// Endpoint to get a specific customer by ID
app.get("/customers/:id", (req, res) => {
    const id = req.params.id;
    const myCustomer = customers.find((item) => item.id == id);

    if (!myCustomer) {
        return res.status(404).send({ status: "error", message: "Customer not found" });
    }
    
    res.send(myCustomer);
});

// Endpoint to delete a customer by ID
app.delete("/customers/:id", (req, res) => {
    const id = req.params.id;
    const index = customers.findIndex((item) => item.id == id);

    if (index !== -1) {
        customers.splice(index, 1);
        return res.send({ status: "success", message: "Customer deleted" });
    }

    return res.status(404).send({ status: "error", message: "Customer not found" });
});

// Endpoint to create a new customer
app.post("/customers", (req, res) => {
    const newCustomer = req.body;
    
    // Optionally validate newCustomer here

    customers.push(newCustomer);
    res.send({ status: "success", message: "Customer created" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
