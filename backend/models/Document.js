const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        default: 'Untitled Document'
    },
    content: {
        type: String,
        default: ''
    },
    owner: {
        type: String, // Clerk User ID
        required: true
    },
    collaborators: [{
        userId: { type: String },
        identifier: { type: String, required: true }, // email or username
        role: { type: String, enum: ['editor', 'viewer'], required: true }
    }],
    shareToken: {
        type: String,
        default: () => require('crypto').randomBytes(16).toString('hex')
    },
    linkAccess: {
        type: String,
        enum: ['none', 'viewer', 'editor'],
        default: 'none'
    },
    ydoc: {
        type: Buffer,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
