import { useState, useEffect } from 'react';
import { shareAPI } from '../utils/api';
import Button from './ui/Button';
import { X, Copy, Trash2, Globe, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareModal({ noteId, onClose }) {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [expiresInDays, setExpiresInDays] = useState(7); // Default 7 days

    useEffect(() => {
        loadLinks();
    }, [noteId]);

    const loadLinks = async () => {
        try {
            const response = await shareAPI.getShareLinks(noteId);
            setLinks(response.data.shareLinks);
        } catch (error) {
            toast.error('Failed to load share links');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLink = async () => {
        setCreating(true);
        try {
            const response = await shareAPI.createShareLink(noteId, { expiresInDays });
            setLinks([response.data.shareLink, ...links]);
            toast.success('Share link created');
        } catch (error) {
            toast.error('Failed to create share link');
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteLink = async (linkId) => {
        if (!confirm('Delete this share link? It will no longer work.')) return;
        try {
            await shareAPI.deleteShareLink(noteId, linkId);
            setLinks(links.filter(l => l.id !== linkId));
            toast.success('Link deleted');
        } catch (error) {
            toast.error('Failed to delete link');
        }
    };

    const copyToClipboard = (token) => {
        const url = `${window.location.origin}/shared/${token}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe size={20} />
                        Share to Web
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-800 mb-3">
                        Publish this note to the web. Anyone with the link can view it.
                    </p>
                    <div className="flex items-center gap-2">
                        <select
                            value={expiresInDays}
                            onChange={(e) => setExpiresInDays(Number(e.target.value))}
                            className="text-sm border border-blue-200 rounded px-2 py-1 bg-white"
                        >
                            <option value={1}>Expires in 1 day</option>
                            <option value={7}>Expires in 7 days</option>
                            <option value={30}>Expires in 30 days</option>
                            <option value={0}>Never expires</option>
                        </select>
                        <Button onClick={handleCreateLink} loading={creating} size="sm">
                            <Plus size={16} className="mr-1" />
                            Create Link
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Loading...</div>
                    ) : links.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            No active share links. Create one above!
                        </div>
                    ) : (
                        links.map((link) => (
                            <div key={link.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} />
                                        {link.expires_at
                                            ? `Expires ${new Date(link.expires_at).toLocaleDateString()}`
                                            : 'Never expires'}
                                    </div>
                                    <button
                                        onClick={() => handleDeleteLink(link.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${window.location.origin}/shared/${link.token}`}
                                        className="flex-1 text-xs p-2 bg-white border border-gray-200 rounded text-gray-600 font-mono truncate"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(link.token)}
                                        className="p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-600"
                                        title="Copy Link"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
