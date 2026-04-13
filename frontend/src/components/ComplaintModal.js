import React, { useState } from 'react';
import toast from 'react-hot-toast';

const ComplaintModal = ({ isOpen, onClose, reportedUserId, reportedJobId, targetName, type = 'general' }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reportedUserId,
                    reportedJobId,
                    reason,
                    description
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                toast.success('Your complaint has been submitted successfully and will be reviewed by an admin.');
                setReason('');
                setDescription('');
                onClose();
            } else {
                toast.error(data.message || 'Failed to submit complaint.');
            }
        } catch (error) {
            console.error('Error submitting complaint:', error);
            toast.error('An error occurred while submitting. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex' }}>
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2>
                        {type === 'user' ? `Report User: ${targetName}` : 
                         type === 'job' ? `Report Job: ${targetName}` : 
                         'Report an Issue'}
                    </h2>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>
                <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
                    
                    <div className="form-group">
                        <label>Reason for Reporting</label>
                        <select 
                            className="form-input"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="">-- Select a Reason --</option>
                            {type === 'user' && (
                                <>
                                    <option value="inappropriate_behavior">Inappropriate Behavior or Language</option>
                                    <option value="fake_profile">Fake Profile or Scam</option>
                                    <option value="no_show">Did Not Show Up For Work</option>
                                    <option value="harassment">Harassment</option>
                                </>
                            )}
                            {type === 'job' && (
                                <>
                                    <option value="fake_job">Fake Job Posting or Scam</option>
                                    <option value="illegal_request">Requesting Illegal Work</option>
                                    <option value="inaccurate_description">Description Does Not Match Reality</option>
                                </>
                            )}
                            {type === 'general' && (
                                <>
                                    <option value="bug">Platform Bug or Technical Error</option>
                                    <option value="payment_issue">Payment or Billing Issue</option>
                                    <option value="other">Other Issue</option>
                                </>
                            )}
                            <option value="other_safety">Safety Concern</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description & Details</label>
                        <textarea 
                            className="form-input"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide specific details about your complaint..."
                            required
                        ></textarea>
                        <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                            Admins will review this information. False reports may lead to account suspension.
                        </small>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }} disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComplaintModal;
