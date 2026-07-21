const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { clerkMiddleware, getAuth, clerkClient } = require('@clerk/express');
const ws = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('y-websocket/bin/utils');
require('dotenv').config();

const Document = require('./models/Document');
const throttle = require('./utils/throttle');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// --- Yjs Persistence Logic ---
const persistence = {
  bindState: async (docName, ydoc) => {
    try {
      const doc = await Document.findById(docName);
      if (doc && doc.ydoc) {
        Y.applyUpdate(ydoc, new Uint8Array(doc.ydoc));
      }
      
      const saveThrottled = throttle(async () => {
        const update = Y.encodeStateAsUpdate(ydoc);
        await Document.findByIdAndUpdate(docName, { 
          ydoc: Buffer.from(update),
          updatedAt: new Date()
        });
      }, 2000);

      ydoc.on('update', saveThrottled);
    } catch (err) {
      console.error('Yjs persistence error:', err);
    }
  }
};

const docs = require('y-websocket/bin/utils').docs;

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- Auth Utilities ---
const requireAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        return res.status(401).json({ error: 'Unauthenticated' });
    }
    req.userId = auth.userId;
    next();
};

const optionalAuth = (req, res, next) => {
    const auth = getAuth(req);
    if (auth.userId) {
        req.userId = auth.userId;
    }
    next();
};

// --- REST APIs ---

app.get('/documents', requireAuth, async (req, res) => {
    try {
        const currentUserId = req.userId;
        const ownedDocs = await Document.find({ owner: currentUserId }).sort({ updatedAt: -1 });
        const sharedDocs = await Document.find({
            owner: { $ne: currentUserId },
            collaborators: {
                $elemMatch: {
                    userId: currentUserId
                }
            }
        });

        console.log("Current User:", currentUserId);
        console.log("Owned Docs:", ownedDocs);
        console.log("Shared Docs:", sharedDocs);

        res.status(200).json(ownedDocs);
    } catch (err) {
        console.error('[ERROR] Error fetching documents:', err);
        res.status(500).json({ error: 'Failed to fetch documents', message: err.message });
    }
});

app.get('/documents/shared', requireAuth, async (req, res) => {
    try {
        const currentUserId = req.userId;
        const ownedDocs = await Document.find({ owner: currentUserId });
        const sharedDocs = await Document.find({
            owner: { $ne: currentUserId },
            collaborators: {
                $elemMatch: {
                    userId: currentUserId
                }
            }
        }).sort({ updatedAt: -1 });

        console.log("Current User:", currentUserId);
        console.log("Owned Docs:", ownedDocs);
        console.log("Shared Docs:", sharedDocs);

        // Fetch owner names and roles for the shared documents
        const enrichedSharedDocs = await Promise.all(sharedDocs.map(async (doc) => {
            let ownerName = 'Unknown';
            try {
                const ownerUser = await clerkClient.users.getUser(doc.owner);
                ownerName = ownerUser.fullName || `${ownerUser.firstName} ${ownerUser.lastName}`.trim() || ownerUser.username || 'Unknown';
            } catch (e) {
                console.error('[ERROR] Error fetching owner details from Clerk:', e);
            }
            const collaborator = doc.collaborators.find(c => c.userId === currentUserId);
            const userRole = collaborator ? (collaborator.role === 'editor' ? 'Editor' : 'Viewer') : 'Viewer';

            return {
                ...doc.toObject(),
                ownerName,
                userRole
            };
        }));

        res.status(200).json(enrichedSharedDocs);
    } catch (err) {
        console.error('[ERROR] Error fetching shared documents:', err);
        res.status(500).json({ error: 'Failed to fetch shared documents', message: err.message });
    }
});

app.post('/documents', requireAuth, async (req, res) => {
    try {
        const newDoc = new Document({ 
            title: 'Untitled Document', 
            content: '',
            owner: req.userId,
            collaborators: []
        });
        await newDoc.save();
        res.status(201).json(newDoc);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create document', message: err.message });
    }
});

app.get('/documents/:id', optionalAuth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });

        const { access } = req.query;
        let isAuthorized = false;

        if (req.userId) {
            if (doc.owner === req.userId) isAuthorized = true;
            else {
                const user = await clerkClient.users.getUser(req.userId);
                const emails = user.emailAddresses.map(addr => addr.emailAddress.toLowerCase());
                const isCollaborator = doc.collaborators.some(c => 
                    c.userId === req.userId || c.identifier === req.userId || emails.includes(c.identifier)
                );
                if (isCollaborator) isAuthorized = true;
            }
        }

        if (!isAuthorized && access && access === doc.shareToken && doc.linkAccess !== 'none') {
            isAuthorized = true;
        }

        if (!isAuthorized) return res.status(403).json({ error: 'Forbidden' });

        res.status(200).json(doc);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch document', message: err.message });
    }
});

app.put('/documents/:id', requireAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        if (title) doc.title = title;
        if (content !== undefined) doc.content = content;
        await doc.save();
        res.status(200).json(doc);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update document', message: err.message });
    }
});

app.delete('/documents/:id', requireAuth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc || doc.owner !== req.userId) return res.status(403).json({ error: 'Forbidden' });
        await doc.deleteOne();
        res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Error' });
    }
});

app.post('/documents/:id/share', requireAuth, async (req, res) => {
    try {
        const { email, role, linkAccess } = req.body;
        const doc = await Document.findById(req.params.id);
        if (!doc || doc.owner !== req.userId) return res.status(403).json({ error: 'Forbidden' });

        if (linkAccess) {
            doc.linkAccess = linkAccess;
        }
        
        if (email && role) {
            const normalizedEmail = email.toLowerCase();
            const userList = await clerkClient.users.getUserList({ emailAddress: [normalizedEmail] });
            const sharedUser = userList.data?.[0];
            if (!sharedUser) {
                return res.status(404).json({ error: 'User with this email not found' });
            }
            const sharedUserId = sharedUser.id;

            const existingIndex = doc.collaborators.findIndex(c => c.userId === sharedUserId || c.identifier === normalizedEmail);
            if (existingIndex !== -1) {
                doc.collaborators[existingIndex].role = role;
                doc.collaborators[existingIndex].userId = sharedUserId;
                doc.collaborators[existingIndex].identifier = normalizedEmail;
            } else {
                doc.collaborators.push({ userId: sharedUserId, identifier: normalizedEmail, role });
            }
        }
        
        await doc.save();
        res.status(200).json({ message: 'Settings updated', doc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/documents/:id/collaborators/:identifier', requireAuth, async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc || doc.owner !== req.userId) return res.status(403).json({ error: 'Forbidden' });

        const identifier = req.params.identifier.toLowerCase();
        doc.collaborators = doc.collaborators.filter(c => c.identifier !== identifier);
        await doc.save();
        res.status(200).json({ message: 'Collaborator removed', doc });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- WebSocket Server for Yjs (Dedicated Port 1234) ---
const yjsServer = new ws.Server({ port: 1234 });
yjsServer.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
  
  const docName = req.url.slice(1).split('?')[0];
  const ydoc = docs.get(docName);
  
  if (ydoc && !ydoc.persisted) {
    ydoc.persisted = true;
    persistence.bindState(docName, ydoc);
  }
});

console.log('Yjs WebSocket server running on port 1234');

io.on('connection', (socket) => {
    socket.on('join-document', ({ docId }) => {
        socket.join(docId);
    });
});

server.listen(PORT, () => console.log(`API Server running on port ${PORT}`));
