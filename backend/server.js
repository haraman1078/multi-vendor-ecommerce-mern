const express=require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/userModel");
const userRoutes =require("./routes/user.Routes");

dotenv.config({path:__dirname + '/.env'});

connectDB();

const app=express();
app.use(cors());

//middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server Working");
});

//routes

app.use("/api/users",userRoutes);



app.get("/create-user", async (req, res) => {

   const user = new User({
      name: "Test User",
      email: "test@gmail.com",
      password: "123456",
      role: "vendor"
   });

   await user.save();

   res.send("User Created Successfully");

});

const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});