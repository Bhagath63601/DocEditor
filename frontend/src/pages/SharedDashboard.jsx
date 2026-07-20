import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clock, Users, FileText, LayoutGrid, List, User } from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton } from '../components/Skeleton';

const API_BASE = 'http://localhost:5000/documents/shared';

const SharedDashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching shared documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3.5rem' }}>
        <div className="fade-in-up">
          <h1 style={{ fontSize: '2.75rem', fontWeight: '900', letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: '0.25rem' }}>
            Shared with You
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: '500' }}>Documents shared by other collaborators.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="fade-in-up">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '1.25rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)',
              zIndex: 10,
              pointerEvents: 'none'
            }} />
            <input 
              type="text" 
              placeholder="Search shared documents..." 
              className="search-input"
              style={{ 
                paddingLeft: '3.25rem', 
                width: '380px',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(8px)'
              }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="glass" style={{ display: 'flex', padding: '0.35rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setViewMode('grid')}
              className="view-btn"
              style={{ 
                padding: '0.6rem', 
                borderRadius: 'var(--radius-md)', 
                background: viewMode === 'grid' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                border: 'none', 
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className="view-btn"
              style={{ 
                padding: '0.6rem', 
                borderRadius: 'var(--radius-md)', 
                background: viewMode === 'list' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                border: 'none', 
                color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="doc-grid">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass fade-in" style={{ padding: '6rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-2xl)', marginTop: '2rem' }}>
          <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', width: '80px', height: '80px', borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FileText className="text-primary" size={40} style={{ margin: 'auto', color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>No shared documents found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', maxWidth: '450px', margin: '0 auto 1rem' }}>
            Documents shared with you by other users will appear here.
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'doc-grid' : ''} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '1rem' } : {}}>
          {filteredDocs.map((doc) => (
            <div 
              key={doc._id} 
              className="doc-card" 
              onClick={() => navigate(`/documents/${doc._id}`)}
              style={viewMode === 'list' ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem' } : {}}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.875rem', borderRadius: 'var(--radius-xl)' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.375rem' }}>{doc.title || 'Untitled Document'}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Clock size={14} /> Modified: {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <User size={14} /> Owner: {doc.ownerName || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  color: 'var(--primary)', 
                  padding: '0.375rem 0.75rem', 
                  borderRadius: '2rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  {doc.userRole || 'Viewer'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedDashboard;
