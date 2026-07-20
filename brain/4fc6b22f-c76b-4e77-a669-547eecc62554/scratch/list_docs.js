const mongoose = require('mongoose');
const Document = require('./backend/models/Document');
require('dotenv').config({ path: './backend/.env' });

async function listDocs() {
  await mongoose.connect(process.env.MONGODB_URI);
  const docs = await Document.find({});
  console.log(JSON.stringify(docs.map(d => ({ id: d._id, title: d.title })), null, 2));
  await mongoose.disconnect();
}

listDocs();
