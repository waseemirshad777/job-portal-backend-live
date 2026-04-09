
require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const resumeRoutes = require('./routes/resume');
const companiesRoutes = require('./routes/companies');
const jobRoutes = require('./routes/job'); 
const jobApplyRoutes = require('./routes/jobApplications');
const statsRoutes = require('./routes/stats');
const subscriptionRoutes = require('./routes/subscription');
const categoryRoutes = require('./routes/category');
const savedJobsRoutes = require('./routes/savedJobs');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require("./routes/upload");
const cors = require('cors');
const connectToMongo = require("./db/db");

const app = express();
const PORT = process.env.PORT || 3000;

connectToMongo();

app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api', userRoutes);
app.use('/api', resumeRoutes);
app.use('/api', companiesRoutes);
app.use('/api', jobRoutes); 
app.use('/api', jobApplyRoutes); 
app.use('/api', statsRoutes); 
app.use('/api', subscriptionRoutes);
app.use('/api', categoryRoutes);
app.use('/api', savedJobsRoutes);
app.use('/api', blogRoutes);
app.use('/api', contactRoutes);
app.use("/api/upload", uploadRoutes);

/*
Health check route (optional but recommended)
*/
app.get("/", (req, res) => {
  res.send("API is running...");
});


app.listen(PORT, () => {
    console.log(`Server running on port:${PORT}`);
});
