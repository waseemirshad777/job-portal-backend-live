const mongoose = require('mongoose');

const savedjobSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        required: true 
    },
    jobId: { 
        type: mongoose.Types.ObjectId, 
        ref: 'Job',
        required: true 
    }
}, { timestamps: true }); 

const Saved = mongoose.model('SavedJob', savedjobSchema);

module.exports = Saved;
