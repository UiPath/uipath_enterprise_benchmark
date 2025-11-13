import React, { useState, useEffect } from 'react';

interface Comment {
  lineNumber: number;
  severity: 'Blocker' | 'Major' | 'Minor';
  description: string;
  status: 'Unresolved' | 'Resolved' | 'Wontfix' | 'Needs Discussion';
  response: string;
}

interface PRReview {
  prReference: string;
  repositoryName: string;
  reviewerName: string;
  reviewDate: string;
  comments: Comment[];
  timestamp: string;
}

const severityColors = {
  'Blocker': 'bg-red-500 text-white',
  'Major': 'bg-orange-500 text-white',
  'Minor': 'bg-yellow-500 text-black',
};

export default function Task35() {
  const [prReference, setPrReference] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  
  const [comments, setComments] = useState<Comment[]>([
    { lineNumber: 0, severity: 'Minor', description: '', status: 'Unresolved', response: '' },
    { lineNumber: 0, severity: 'Minor', description: '', status: 'Unresolved', response: '' },
    { lineNumber: 0, severity: 'Minor', description: '', status: 'Unresolved', response: '' },
  ]);

  const [submittedPRs, setSubmittedPRs] = useState<PRReview[]>([]);

  // Calculate progress
  const resolvedCount = comments.filter(c => c.status !== 'Unresolved').length;
  const completionPercentage = (resolvedCount / 3) * 100;
  
  // Count by status
  const commentsByStatus = {
    resolved: comments.filter(c => c.status === 'Resolved').length,
    wontfix: comments.filter(c => c.status === 'Wontfix').length,
    needsDiscussion: comments.filter(c => c.status === 'Needs Discussion').length,
  };

  // Check if all comments are addressed with responses
  const allCommentsAddressed = comments.every(c => {
    if (c.status === 'Unresolved') return false;
    return c.response.trim().length >= 10;
  });

  const canSubmit = prReference.trim() !== '' && 
                    repositoryName.trim() !== '' && 
                    reviewerName.trim() !== '' && 
                    reviewDate.trim() !== '' && 
                    allCommentsAddressed;

  const handleCommentUpdate = (index: number, field: keyof Comment, value: any) => {
    const newComments = [...comments];
    newComments[index] = { ...newComments[index], [field]: value };
    setComments(newComments);
  };

  const handleSubmit = () => {
    if (canSubmit) {
      const newPR: PRReview = {
        prReference,
        repositoryName,
        reviewerName,
        reviewDate,
        comments: [...comments],
        timestamp: new Date().toISOString(),
      };
      setSubmittedPRs([...submittedPRs, newPR]);
      
      // Reset form
      setPrReference('');
      setRepositoryName('');
      setReviewerName('');
      setReviewDate('');
      setComments([
        { lineNumber: 0, severity: 'Minor', description: '', status: 'Unresolved', response: '' },
        { lineNumber: 0, severity: 'Minor', description: '', status: 'Unresolved', response: '' },
        { lineNumber: 0, severity: 'Minor', description: '', status: 'Unresolved', response: '' },
      ]);
    }
  };

  const handleFilterStatus = (status: string) => {
    // This would filter the display - for now just visual feedback
    console.log(`Filter by status: ${status}`);
  };

  // Expose state for testing
  useEffect(() => {
    (window as any).app_state = {
      prReference,
      repositoryName,
      reviewerName,
      reviewDate,
      comments: comments.map(c => ({
        lineNumber: c.lineNumber,
        severity: c.severity,
        description: c.description,
        status: c.status,
        response: c.response,
      })),
      commentsByStatus,
      completionPercentage,
      submittedPRs: submittedPRs.map(pr => ({
        prReference: pr.prReference,
        repositoryName: pr.repositoryName,
        reviewerName: pr.reviewerName,
        reviewDate: pr.reviewDate,
        comments: pr.comments.map(c => ({
          lineNumber: c.lineNumber,
          severity: c.severity,
          status: c.status,
          response: c.response,
        })),
      })),
    };
  }, [prReference, repositoryName, reviewerName, reviewDate, comments, commentsByStatus, completionPercentage, submittedPRs]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Code Review Resolution Tracker</h1>

      {/* PR Header Section */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">PR Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">PR Reference</label>
            <input
              type="text"
              placeholder="PR-2024-XXX"
              className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
              value={prReference}
              onChange={(e) => setPrReference(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Repository Name</label>
            <input
              type="text"
              placeholder="e.g., frontend-dashboard"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reviewer Name</label>
            <input
              type="text"
              placeholder="e.g., Sarah Chen"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Review Date</label>
            <input
              type="text"
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Resolution Progress</h3>
            <span className="text-lg font-bold">{resolvedCount}/10 Comments Resolved</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
            <div
              className={`h-4 rounded-full transition-all ${
                completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-medium text-green-600">Resolved:</span> {commentsByStatus.resolved}
            </div>
            <div>
              <span className="font-medium text-gray-600">Wontfix:</span> {commentsByStatus.wontfix}
            </div>
            <div>
              <span className="font-medium text-orange-600">Needs Discussion:</span> {commentsByStatus.needsDiscussion}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Cards */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Review Comments (10)</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => handleFilterStatus('Resolved')}
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Resolved
            </button>
            <button 
              onClick={() => handleFilterStatus('Wontfix')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Wontfix
            </button>
            <button 
              onClick={() => handleFilterStatus('Needs Discussion')}
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
            >
              Needs Discussion
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium text-blue-600">
                    Comment {index + 1}
                  </span>
                  <input
                    type="number"
                    placeholder="Line #"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    value={comment.lineNumber || ''}
                    onChange={(e) => handleCommentUpdate(index, 'lineNumber', parseInt(e.target.value) || 0)}
                  />
                  <select
                    className={`px-3 py-1 rounded text-sm font-medium ${severityColors[comment.severity]}`}
                    value={comment.severity}
                    onChange={(e) => handleCommentUpdate(index, 'severity', e.target.value)}
                  >
                    <option value="Blocker">Blocker</option>
                    <option value="Major">Major</option>
                    <option value="Minor">Minor</option>
                  </select>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-medium ${
                  comment.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                  comment.status === 'Wontfix' ? 'bg-gray-100 text-gray-700' :
                  comment.status === 'Needs Discussion' ? 'bg-orange-100 text-orange-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {comment.status}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Comment Description</label>
                <textarea
                  placeholder="Enter comment text from Markdown..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows={2}
                  value={comment.description}
                  onChange={(e) => handleCommentUpdate(index, 'description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    value={comment.status}
                    onChange={(e) => handleCommentUpdate(index, 'status', e.target.value)}
                  >
                    <option value="Unresolved">Unresolved</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Wontfix">Wontfix</option>
                    <option value="Needs Discussion">Needs Discussion</option>
                  </select>
                </div>
                <div className="row-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Response {comment.status !== 'Unresolved' && <span className="text-red-500">* (min 10 chars)</span>}
                  </label>
                  <textarea
                    placeholder={comment.status === 'Unresolved' ? 'Response not required for Unresolved status' : 'Enter resolution explanation...'}
                    className={`w-full px-3 py-2 border rounded text-sm ${
                      comment.status !== 'Unresolved' && comment.response.trim().length < 10
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    rows={3}
                    value={comment.response}
                    onChange={(e) => handleCommentUpdate(index, 'response', e.target.value)}
                    disabled={comment.status === 'Unresolved'}
                  />
                  {comment.status !== 'Unresolved' && comment.response.trim().length > 0 && comment.response.trim().length < 10 && (
                    <p className="text-xs text-red-500 mt-1">Response too short (current: {comment.response.trim().length} chars)</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mb-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-8 py-3 rounded-lg font-semibold text-lg ${
            canSubmit
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit PR Review
        </button>
        {!canSubmit && (
          <p className="text-sm text-red-500 mt-2">
            {!allCommentsAddressed 
              ? 'All 10 comments must be addressed with status and response (min 10 chars)'
              : 'Fill all PR information fields'}
          </p>
        )}
      </div>

      {/* Submitted PRs */}
      {submittedPRs.length > 0 && (
        <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Submitted PR Reviews ({submittedPRs.length})</h2>
          <div className="space-y-4">
            {submittedPRs.map((pr, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-mono font-bold text-lg">{pr.prReference}</div>
                    <div className="text-sm text-gray-600">
                      {pr.repositoryName} • Reviewed by {pr.reviewerName} • {pr.reviewDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Total Comments: 10</div>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {pr.comments.filter(c => c.status === 'Resolved').length} Resolved
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {pr.comments.filter(c => c.status === 'Wontfix').length} Wontfix
                      </span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        {pr.comments.filter(c => c.status === 'Needs Discussion').length} Needs Discussion
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resolution Tracking Table */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="px-3 py-2 text-left">Line</th>
                        <th className="px-3 py-2 text-left">Severity</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Response Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pr.comments.map((comment, cIdx) => (
                        <tr key={cIdx} className="border-b border-gray-200">
                          <td className="px-3 py-2 font-mono">Line {comment.lineNumber}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${severityColors[comment.severity]}`}>
                              {comment.severity}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              comment.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                              comment.status === 'Wontfix' ? 'bg-gray-100 text-gray-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {comment.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {comment.response.substring(0, 50)}
                            {comment.response.length > 50 && '...'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

