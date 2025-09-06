
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  rating: number;
  createdAt: string;
}

const CommunitySection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    // Fetch comments from db.json
    const fetchComments = async () => {
      try {
        const response = await fetch('http://localhost:3001/community');
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchComments();
  }, []);

  const handleSubmitComment = async () => {
    if (newComment.trim() && rating > 0) {
      const newCommentData: Omit<Comment, 'id' | 'createdAt'> = {
        author: 'Anonymous', // Replace with actual user data later
        text: newComment,
        rating: rating,
      };

      try {
        const response = await fetch('http://localhost:3001/community', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCommentData),
        });

        if (response.ok) {
          const savedComment = await response.json();
          setComments([savedComment, ...comments]);
          setNewComment('');
          setRating(0);
        }
      } catch (error) {
        console.error('Error submitting comment:', error);
      }
    }
  };

  return (
    <div className="p-4 border-t">
      <h3 className="text-lg font-semibold mb-4">Community Feedback</h3>
      <div className="mb-4">
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`cursor-pointer ${
                (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
              }`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <Textarea
          placeholder="Share your thoughts, report a problem, or suggest an improvement..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleSubmitComment}>Submit</Button>
      </div>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 border rounded-lg">
            <div className="flex items-center mb-2">
              <div className="font-semibold">{comment.author}</div>
              <div className="flex items-center ml-auto">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      comment.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-700">{comment.text}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunitySection;
