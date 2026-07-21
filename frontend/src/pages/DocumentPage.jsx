import React, { useState, useEffect, useMemo, useRef, useCallback, Profiler } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

import Toolbar from '../components/Toolbar';
import Ruler from '../components/Ruler';
import VerticalRuler from '../components/VerticalRuler';
import ShareModal from '../components/ShareModal';
import ErrorBoundary from '../components/ErrorBoundary';

import Header from '../components/Header';
import TitleInput from '../components/TitleInput';
import EditorContainer from '../components/EditorContainer';

const API_BASE = 'http://localhost:5000/documents';

const DocumentPage = () => {
    console.log('[PROFILER] DocumentPage rendered');

    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { getToken } = useAuth();
    
    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [pageMargins, setPageMargins] = useState({ left: 128, right: 128 }); // Default 8rem padding
    const [editor, setEditor] = useState(null);

    const handleEditorReady = useCallback((editorInstance) => {
        setEditor(editorInstance);
    }, []);

    const userInfo = useMemo(() => ({
        id: user?.id,
        name: user?.fullName || user?.username || 'Anonymous',
        color: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
        avatar: user?.imageUrl,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [user?.id, user?.fullName, user?.username, user?.imageUrl]);

    useEffect(() => {
        console.log('[DEBUG] Component mounted');
    }, []);

    // Keep a ref to the active collaboration instances across renders and Strict Mode remounts
    const activeCollabRef = useRef(null);
    const pendingCleanupRef = useRef(null);

    const collab = useMemo(() => {
        // If there was a previous session, and the ID has changed, destroy the old one!
        if (activeCollabRef.current && activeCollabRef.current.id !== id) {
            console.log('[DEBUG] Destroying old YJS session due to ID change');
            activeCollabRef.current.provider.destroy();
            activeCollabRef.current.ydoc.destroy();
            activeCollabRef.current = null;
        }

        // Recreate if not present or destroyed
        if (!activeCollabRef.current || activeCollabRef.current.provider.destroyed) {
            console.log('[DEBUG] Creating new YJS session');
            const ydoc = new Y.Doc();
            const provider = new WebsocketProvider('ws://localhost:1234', id, ydoc);
            provider.on('status', (event) => {
                console.log('YJS STATUS:', event.status);
            });
            activeCollabRef.current = { id, ydoc, provider };
        } else {
            console.log('[DEBUG] Reusing active YJS session');
        }
        return activeCollabRef.current;
    }, [id]);

    useEffect(() => {
        console.log('[DEBUG] Mount effect triggered');
        if (pendingCleanupRef.current) {
            console.log('[DEBUG] Canceling pending cleanup (Strict Mode remount detected)');
            clearTimeout(pendingCleanupRef.current);
            pendingCleanupRef.current = null;
        }
    }, [id]);

    useEffect(() => {
        return () => {
            console.log('[DEBUG] Cleanup scheduled');
            pendingCleanupRef.current = setTimeout(() => {
                if (activeCollabRef.current && activeCollabRef.current.id === id) {
                    console.log('[DEBUG] Genuine unmount: destroying collab session');
                    activeCollabRef.current.provider.destroy();
                    activeCollabRef.current.ydoc.destroy();
                    activeCollabRef.current = null;
                }
                pendingCleanupRef.current = null;
            }, 100);
        };
    }, [id]);

    const userEmails = useMemo(() => 
        user?.emailAddresses?.map(addr => addr.emailAddress.toLowerCase()) || []
    , [user]);

    const role = useMemo(() => {
        const userId = user?.id;
        if (!doc || !userId) return "viewer";

        if (doc.owner?.toString() === userId) return "owner";

        const collaborator = doc.collaborators?.find(
            (c) => c.userId?.toString() === userId || 
                   c.identifier?.toString() === userId ||
                   userEmails.includes(c.identifier?.toString()?.toLowerCase())
        );

        let detectedRole = collaborator?.role || "viewer";

        // Link access fallback
        if (detectedRole === 'viewer') {
            const searchParams = new URLSearchParams(window.location.search);
            const accessToken = searchParams.get('access');
            if (accessToken && accessToken === doc.shareToken && doc.linkAccess === 'editor') {
                detectedRole = 'editor';
            }
        }

        console.log("Current User ID:", userId);
        console.log("Document Owner:", doc.owner);
        console.log("Collaborators:", doc.collaborators);
        console.log("Detected Role:", detectedRole);

        return detectedRole;
    }, [doc, user, userEmails]);

    const canEdit = role === "owner" || role === "editor";

    // Sync local awareness details
    useEffect(() => {
        if (userInfo && userInfo.id && collab?.provider) {
            console.log('[DEBUG] Setting local awareness state:', userInfo.name, userInfo.id);
            collab.provider.awareness.setLocalStateField("user", {
                id: userInfo.id,
                name: userInfo.name,
                color: userInfo.color,
                avatar: userInfo.avatar
            });
        }
    }, [collab, userInfo]); 

    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');

    useEffect(() => {
        if (!collab?.ydoc) return;
        const ycomments = collab.ydoc.getArray('comments');
        
        // Load existing comments or set defaults if empty
        if (ycomments.length === 0) {
            ycomments.push([
                { id: 1, author: 'Alex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150', text: 'Looks great, Sam!', time: '1m ago', color: '#3b82f6' },
                { id: 2, author: 'Sam', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150', text: 'Updates made. Reviewing section 2.', time: 'Just Now', color: '#10b981' }
            ]);
        }
        
        setComments(ycomments.toArray());
        
        const observeComments = () => {
            setComments(ycomments.toArray());
        };
        ycomments.observe(observeComments);
        return () => {
            ycomments.unobserve(observeComments);
        };
    }, [collab]);

    const handleAddComment = useCallback(() => {
        if (!newCommentText.trim() || !collab?.ydoc) return;
        const ycomments = collab.ydoc.getArray('comments');
        ycomments.push([{
            id: Date.now(),
            author: userInfo.name || 'Anonymous',
            avatar: userInfo.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userInfo.name || 'Anonymous'}`,
            text: newCommentText,
            time: 'Just Now',
            color: userInfo.color || '#3b82f6'
        }]);
        setNewCommentText('');
    }, [newCommentText, collab, userInfo]);

    useEffect(() => {
        fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchDocument = async () => {
        try {
            const searchParams = new URLSearchParams(window.location.search);
            const access = searchParams.get('access');
            const token = await getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const url = `${API_BASE}/${id}${access ? `?access=${access}` : ''}`;
            const res = await axios.get(url, { headers });
            console.log('[DEBUG] Document fetch success:', res.data);
            setDoc(res.data);
        } catch (err) {
            console.error('Error fetching document:', err);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleTitleSave = useCallback(async (newTitle) => {
        setDoc(prev => prev ? { ...prev, title: newTitle } : null);
        setSaving(true);
        try {
            const token = await getToken();
            await axios.put(`${API_BASE}/${id}`, {
                title: newTitle
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Error saving title:', err);
        } finally {
            setSaving(false);
        }
    }, [id, getToken]);

    const logProfile = useCallback((id, phase, actualDuration) => {
        console.log(`[PROFILER] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
    }, []);

    if (loading) {
        return <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
    }
    if (!doc) {
        return <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>Document not found</div>;
    }

    return (
        <Profiler id="DocumentPage" onRender={logProfile}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <ErrorBoundary>
                    <Header 
                        docTitle={doc.title}
                        onNavigateBack={() => navigate('/')}
                        saving={saving}
                        provider={collab.provider}
                        currentUser={user}
                        showShareButton={doc.owner === user?.id}
                        onShareClick={() => setIsShareModalOpen(true)}
                        onSaveTitleClick={() => handleTitleSave(doc.title)}
                        saveDisabled={saving || !canEdit}
                        canEdit={canEdit}
                    />

                    {canEdit && (
                        <Profiler id="Toolbar" onRender={logProfile}>
                            <Toolbar editor={editor} />
                        </Profiler>
                    )}
                </ErrorBoundary>
                
                <ErrorBoundary>
                    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                        <div className="editor-wrapper" style={{ flex: 1 }}>
                            <div className="document-layout-container">
                                <div className="ruler-row">
                                    <div className="ruler-corner" />
                                    <Profiler id="Ruler" onRender={logProfile}>
                                        <Ruler margins={pageMargins} setMargins={setPageMargins} />
                                    </Profiler>
                                </div>
                                <div className="paper-row">
                                    <VerticalRuler />
                                    <div 
                                        className="paper fade-in" 
                                        style={{
                                            paddingLeft: `${pageMargins.left}px`,
                                            paddingRight: `${pageMargins.right}px`
                                        }}
                                    >
                                        <Profiler id="TitleInput" onRender={logProfile}>
                                            <TitleInput 
                                                initialTitle={doc.title}
                                                onSave={handleTitleSave}
                                                disabled={!canEdit}
                                            />
                                        </Profiler>
                                        
                                        <Profiler id="EditorContainer" onRender={logProfile}>
                                            <EditorContainer 
                                                id={id}
                                                role={role}
                                                ydoc={collab.ydoc}
                                                provider={collab.provider}
                                                userInfo={userInfo}
                                                onEditorReady={handleEditorReady}
                                            />
                                        </Profiler>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real-time Collaborative Comments Sidebar */}
                        <div className="comments-sidebar">
                            <div className="comments-header">
                                <h3>Comments</h3>
                                <button className="comments-options-btn">•••</button>
                            </div>
                            <div className="comments-list">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="comment-card">
                                        <div className="comment-card-header">
                                            <img 
                                                src={comment.avatar} 
                                                alt={comment.author} 
                                                className="comment-avatar"
                                                style={{ borderColor: comment.color || '#3b82f6' }}
                                            />
                                            <div className="comment-meta">
                                                <span className="comment-author">{comment.author}</span>
                                                <span className="comment-time">{comment.time}</span>
                                            </div>
                                        </div>
                                        <div className="comment-text">{comment.text}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="comment-input-area">
                                <input 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    value={newCommentText} 
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                />
                                <button onClick={handleAddComment}>Send</button>
                            </div>
                        </div>
                    </div>
                </ErrorBoundary>

                {isShareModalOpen && (
                    <ShareModal 
                        doc={doc} 
                        onClose={() => setIsShareModalOpen(false)}
                        onUpdate={(updatedDoc) => setDoc(updatedDoc)}
                    />
                )}
            </div>
        </Profiler>
    );
};

export default DocumentPage;
