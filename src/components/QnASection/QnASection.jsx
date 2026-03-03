import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getProductQnA, askQuestion, answerQuestion, upvoteQuestion } from '../../services/qnaService.js';
import { useToast } from '../Toast/ToastProvider.jsx';
import './QnASection.css';

export default function QnASection({ productId }) {
  const toast = useToast();
  const { user } = useSelector(s => s.auth);
  const [qnas, setQnas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [answerMap, setAnswerMap] = useState({});
  const [answeringId, setAnsweringId] = useState(null);

  useEffect(() => {
    if (!productId) return;
    getProductQnA(productId)
      .then(data => setQnas(Array.isArray(data) ? data : (data.qnas || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to ask a question'); return; }
    if (!question.trim()) return;
    setSubmitting(true);
    try {
      const data = await askQuestion(productId, question);
      setQnas(prev => [data, ...prev]);
      setQuestion('');
      toast.success('Question submitted!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit question');
    } finally { setSubmitting(false); }
  };

  const handleAnswer = async (qnaId) => {
    const text = answerMap[qnaId];
    if (!text?.trim()) return;
    try {
      const updated = await answerQuestion(qnaId, text);
      setQnas(prev => prev.map(q => q._id === qnaId ? updated : q));
      setAnswerMap(prev => ({ ...prev, [qnaId]: '' }));
      setAnsweringId(null);
      toast.success('Answer posted!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post answer');
    }
  };

  const handleUpvote = async (qnaId) => {
    if (!user) { toast.error('Please login to upvote'); return; }
    try {
      const updated = await upvoteQuestion(qnaId);
      setQnas(prev => prev.map(q => q._id === qnaId ? { ...q, upvoteCount: updated.upvoteCount } : q));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to upvote');
    }
  };

  return (
    <div className="qna-section">
      <h2 className="qna-title">Questions &amp; Answers</h2>

      {/* Ask form */}
      <form className="qna-ask-form" onSubmit={handleAsk}>
        <input
          className="qna-input"
          placeholder={user ? 'Ask a question about this product…' : 'Login to ask a question'}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          disabled={!user}
        />
        <button className="qna-ask-btn" type="submit" disabled={!user || submitting}>
          {submitting ? 'Posting…' : 'Ask'}
        </button>
      </form>

      {loading && <p className="qna-loading">Loading questions…</p>}

      {!loading && qnas.length === 0 && (
        <p className="qna-empty">No questions yet. Be the first to ask!</p>
      )}

      <div className="qna-list">
        {qnas.map(q => (
          <div key={q._id} className="qna-item">
            <div className="qna-question-row">
              <div className="qna-q-icon">Q</div>
              <div className="qna-q-body">
                <div className="qna-q-text">{q.question}</div>
                <div className="qna-q-meta">
                  <span>{q.userName}</span>
                  <span>{new Date(q.createdAt).toLocaleDateString('en-IN')}</span>
                  <button className="qna-upvote-btn" onClick={() => handleUpvote(q._id)}>
                    👍 {q.upvoteCount || 0}
                  </button>
                </div>
              </div>
            </div>

            {q.answers?.map((a, i) => (
              <div key={i} className="qna-answer-row">
                <div className={`qna-a-icon ${a.isAdmin ? 'admin' : ''}`}>{a.isAdmin ? '✓' : 'A'}</div>
                <div className="qna-a-body">
                  <div className="qna-a-text">{a.answer}</div>
                  <div className="qna-a-meta">
                    <span>{a.userName}</span>
                    {a.isAdmin && <span className="qna-admin-badge">Official Answer</span>}
                    {a.isVerifiedBuyer && <span className="qna-verified-badge">Verified Buyer</span>}
                  </div>
                </div>
              </div>
            ))}

            {/* Answer input for admins/users */}
            {user && (
              <div className="qna-answer-form">
                {answeringId === q._id ? (
                  <div className="qna-answer-input-row">
                    <input
                      className="qna-input"
                      placeholder="Write your answer…"
                      value={answerMap[q._id] || ''}
                      onChange={e => setAnswerMap(prev => ({ ...prev, [q._id]: e.target.value }))}
                    />
                    <button className="qna-answer-post-btn" onClick={() => handleAnswer(q._id)}>Post</button>
                    <button className="qna-cancel-btn" onClick={() => setAnsweringId(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="qna-reply-btn" onClick={() => setAnsweringId(q._id)}>Answer this question</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
