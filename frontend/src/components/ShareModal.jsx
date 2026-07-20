import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus, Link, Copy, Trash2 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

const ShareModal = ({ doc, onClose, onUpdate }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('editor');
    const [linkAccess, setLinkAccess] = useState(doc.linkAccess || 'none');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const { getToken } = useAuth();

    const handleShare = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const token = await getToken();
            const res = await axios.post(`http://localhost:5000/documents/${doc._id}/share`, 
            { email, role },
            { headers: { Authorization: `Bearer ${token}` } });
            setMessage({ type: 'success', text: 'User added successfully' });
            setEmail('');
            if (res.data.doc && onUpdate) onUpdate(res.data.doc);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to share document' });
        } finally {
            setLoading(false);
        }
    };

    const handleLinkAccessChange = async (newAccess) => {
        setLinkAccess(newAccess);
        try {
            const token = await getToken();
            const res = await axios.post(`http://localhost:5000/documents/${doc._id}/share`, 
            { linkAccess: newAccess },
            { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.doc && onUpdate) onUpdate(res.data.doc);
        } catch (err) {
            console.error('Failed to update link access', err);
        }
    };

    const handleRemoveUser = async (identifier) => {
        try {
            const token = await getToken();
            const res = await axios.delete(`http://localhost:5000/documents/${doc._id}/collaborators/${encodeURIComponent(identifier)}`, 
            { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.doc && onUpdate) onUpdate(res.data.doc);
        } catch (err) {
            console.error('Failed to remove user', err);
        }
    };

    const copyLink = () => {
        const link = `${window.location.origin}/documents/${doc._id}?access=${doc.shareToken}`;
        navigator.clipboard.writeText(link);
        setMessage({ type: 'success', text: 'Link copied to clipboard!' });
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div className="glass" style={{ width: '90%', maxWidth: '480px', padding: '2rem', borderRadius: '1.5rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserPlus className="text-primary" size={24} /> Share Document
                </h2>

                {/* Link Sharing Section */}
                <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'var(--bg)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                            <Link size={16} /> Get Link
                        </div>
                        <select 
                            value={linkAccess} 
                            onChange={(e) => handleLinkAccessChange(e.target.value)}
                            style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                        >
                            <option value="none" style={{ background: 'var(--card-bg)', color: 'var(--text)' }}>Restricted</option>
                            <option value="viewer" style={{ background: 'var(--card-bg)', color: 'var(--text)' }}>Anyone with link can view</option>
                            <option value="editor" style={{ background: 'var(--card-bg)', color: 'var(--text)' }}>Anyone with link can edit</option>
                        </select>
                    </div>
                    {linkAccess !== 'none' && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <input 
                                readOnly 
                                value={`${window.location.origin}/documents/${doc._id}?access=${doc.shareToken}`} 
                                style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}
                            />
                            <button type="button" className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={copyLink}>
                                <Copy size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Collaborator Section */}
                <form onSubmit={handleShare} style={{ marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Invite People (Email)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                style={{ flex: 1, height: '2.5rem', padding: '0 0.75rem', fontSize: '0.9rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                                placeholder="user@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <select 
                                value={role} 
                                onChange={(e) => setRole(e.target.value)}
                                style={{ height: '2.5rem', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '0.25rem', padding: '0 0.5rem', fontSize: '0.85rem' }}
                            >
                                <option value="editor" style={{ background: 'var(--card-bg)', color: 'var(--text)' }}>Editor</option>
                                <option value="viewer" style={{ background: 'var(--card-bg)', color: 'var(--text)' }}>Viewer</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '2.5rem', fontSize: '0.9rem' }} disabled={loading}>
                        {loading ? 'Adding...' : 'Invite User'}
                    </button>
                </form>

                {/* Current Collaborators */}
                <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-muted)' }}>People with access</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {/* Owner */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    O
                                </div>
                                <span style={{ fontSize: '0.9rem' }}>Owner</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Owner</span>
                        </div>
                        
                        {/* Collaborators */}
                        {doc.collaborators && doc.collaborators.map(c => (
                            <div key={c.identifier} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        {c.identifier.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.identifier}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{c.role}</span>
                                    <button type="button" onClick={() => handleRemoveUser(c.identifier)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {message && (
                    <div style={{ padding: '0.75rem', borderRadius: '0.5rem', marginTop: '1.5rem', fontSize: '0.9rem', textAlign: 'center', ...(message.type === 'success' ? { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' } : { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }) }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareModal;
