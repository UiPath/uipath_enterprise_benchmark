import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, MessageCircle, Flag, User, Clock } from 'lucide-react';

// Seeded random number generator for deterministic results
class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

interface Comment {
  id: string;
  parentId: string | null;
  author: string;
  content: string;
  timestamp: string;
  level: number;
  replies: Comment[];
  isSpam: boolean;
  spamKeywords: string[];
}

interface ModerationEntry {
  commentId: string;
  author: string;
  contentPreview: string;
  threadContext: string;
  spamKeywords: string[];
}

const Task11: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [moderationQueue, setModerationQueue] = useState<ModerationEntry[]>([]);

  const [flaggedComments, setFlaggedComments] = useState<Set<string>>(new Set());

  // Generate deterministic comment tree data
  useEffect(() => {
    const rng = new SeededRandom(12345);
    const generatedComments: Comment[] = [];
    let commentId = 1;
    let spamCount = 0;
    const targetSpamCount = 8;
    
    // Spam keywords to distribute - more diverse to make detection harder
    const spamKeywords = [
      'buy now', 'click here', 'free offer', 'limited time',
      'act fast', 'don\'t miss out', 'exclusive deal', 'instant access',
      'special discount', 'hurry up', 'order today', 'while supplies last'
    ];
    
    // Generate realistic usernames and content
    const usernames = [
      'TechGuru42', 'CodeMaster', 'DevExpert', 'BuilderBot', 'WebWizard', 'DataDave',
      'PixelPerfect', 'CloudNinja', 'ApiAnnie', 'ReactRob', 'JSJenna', 'CSSCarl',
      'HTMLHank', 'SQLSarah', 'GitGuru', 'DockerDan', 'KubernetesKate', 'AWSAlex',
      'PythonPaul', 'JavaJoe', 'RubyRose', 'GoGina', 'RustRyan', 'SwiftSam',
      'FlutterFred', 'VueVera', 'AngularAndy', 'SvelteSteve', 'NextNina', 'NuxtNate'
    ];

    const contentTemplates = [
      'This is really helpful, thanks for sharing!',
      'I had a similar issue and found this solution works well.',
      'Great explanation, very clear and detailed.',
      'Has anyone tried this approach with the latest version?',
      'Thanks for the tutorial, exactly what I needed.',
      'I\'m getting an error when I try this. Any suggestions?',
      'This worked perfectly for my use case.',
      'Could you elaborate on the configuration part?',
      'I recommend checking the documentation for more details.',
      'This is the best solution I\'ve seen so far.',
      'Make sure to handle edge cases when implementing this.',
      'Performance looks good with this approach.',
      'Security considerations should be reviewed here.',
      'Testing this implementation now, will report back.',
      'Updated my code based on this, working great!',
      'Browser compatibility might be an issue with older versions.',
      'Mobile responsiveness needs to be considered.',
      'Error handling could be improved in this example.',
      'Clean code structure, easy to follow.',
      'Deployment process was smooth with these steps.'
    ];

    const spamTemplates = [
      'Amazing product! {keyword} at our website for best deals.',
      'Don\'t miss out! {keyword} before this offer expires.',
      'Revolutionary software available now! {keyword} for instant access.',
      'Special discount today only. {keyword} to save 50%.',
      'You won\'t believe these results! {keyword} to see for yourself.',
      'Breaking: New method discovered! {keyword} to learn more.',
      'Exclusive offer for developers: {keyword} now!',
      'This changed my life completely. {keyword} and see the difference.',
      'Top secret technique revealed. {keyword} for details.',
      'Warning: This offer ends soon! {keyword} immediately.',
      'Incredible opportunity here. {keyword} while supplies last.',
      'Finally found the solution! {keyword} to get started.',
      'Must-see demonstration available. {keyword} for access.',
      'Game-changing tool just released. {keyword} today.',
      'Urgent: Don\'t wait any longer! {keyword} right now.',
      'I made $5000 last month with this simple trick. {keyword} to learn how.',
      'Professional developers are using this secret method. {keyword} for details.',
      'Stop struggling with bugs! {keyword} for the ultimate debugging tool.',
      'Your code will never be the same after this. {keyword} immediately.',
      'Industry leaders don\'t want you to know this. {keyword} to discover.',
      'I went from junior to senior in 3 months. {keyword} for my method.',
      'This framework will replace React. {keyword} to get early access.',
      'Free course: Become a 10x developer. {keyword} to enroll.',
      'Warning: Only 50 spots left in our bootcamp. {keyword} to secure yours.'
    ];

    // Generate main comment threads (5 threads)
    const threadTitles = [
      'Help with React Hooks implementation',
      'Best practices for API design',
      'CSS Grid vs Flexbox comparison', 
      'Database optimization techniques',
      'Modern JavaScript frameworks'
    ];

    // Create spam distribution plan
    const spamDistribution: { threadIndex: number; level: number }[] = [];
    for (let i = 0; i < targetSpamCount; i++) {
      spamDistribution.push({
        threadIndex: Math.floor(rng.next() * 5),
        level: Math.floor(rng.next() * 3) + 1 // Level 1-3
      });
    }

    const createComment = (
      parentId: string | null, 
      level: number,
      content?: string,
      isSpamComment = false
    ): Comment => {
      const author = usernames[Math.floor(rng.next() * usernames.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(rng.next() * 30)); // Random date within last 30 days
      date.setHours(Math.floor(rng.next() * 24), Math.floor(rng.next() * 60));
      
      let commentContent: string;
      let spamKeywordList: string[] = [];
      let isSpam = false;

      if (isSpamComment && spamCount < targetSpamCount) {
        // Create spam comment
        const keyword = spamKeywords[Math.floor(rng.next() * spamKeywords.length)];
        const template = spamTemplates[Math.floor(rng.next() * spamTemplates.length)];
        commentContent = template.replace('{keyword}', keyword);
        spamKeywordList = [keyword];
        isSpam = true;
        spamCount++;
      } else {
        // Create normal comment
        commentContent = content || contentTemplates[Math.floor(rng.next() * contentTemplates.length)];
      }

      return {
        id: `comment-${commentId++}`,
        parentId,
        author,
        content: commentContent,
        timestamp: date.toISOString(),
        level,
        replies: [],
        isSpam,
        spamKeywords: spamKeywordList
      };
    };

    // Build comment tree for each thread
    for (let threadIndex = 0; threadIndex < 5; threadIndex++) {
      // Create root comment
      const rootComment = createComment(null, 0, threadTitles[threadIndex]);
      generatedComments.push(rootComment);

      // Create nested replies (2-3 levels deep)
      const maxLevels = Math.floor(rng.next() * 2) + 2; // 2-3 levels
      let currentParents = [rootComment];

      for (let level = 1; level <= maxLevels; level++) {
        const nextParents: Comment[] = [];
        
        for (const parent of currentParents) {
          const replyCount = Math.floor(rng.next() * 2) + 1; // 1-2 replies per parent
          
          for (let i = 0; i < replyCount; i++) {
            // Check if this should be a spam comment
            const shouldBeSpam = spamDistribution.some(
              spam => spam.threadIndex === threadIndex && spam.level === level && spamCount < targetSpamCount
            );
            
            const reply = createComment(parent.id, level, undefined, shouldBeSpam);
            parent.replies.push(reply);
            generatedComments.push(reply);
            
            // Only add to next level if we haven't reached max depth and not all comments are generated
            if (level < maxLevels && generatedComments.length < 60) {
              nextParents.push(reply);
            }
          }
        }
        
        currentParents = nextParents;
        
        // Stop if we've reached target comment count
        if (generatedComments.length >= 60) break;
      }
    }

    // Ensure we have exactly 60 comments by trimming excess
    if (generatedComments.length > 60) {
      generatedComments.splice(60);
    }

    // Add any remaining spam comments if we're under the target
    while (spamCount < targetSpamCount && generatedComments.length > 0) {
      // Find a random non-spam comment to replace
      const nonSpamComments = generatedComments.filter(c => !c.isSpam && c.level > 0);
      if (nonSpamComments.length > 0) {
        const targetComment = nonSpamComments[Math.floor(rng.next() * nonSpamComments.length)];
        const keyword = spamKeywords[Math.floor(rng.next() * spamKeywords.length)];
        const template = spamTemplates[Math.floor(rng.next() * spamTemplates.length)];
        targetComment.content = template.replace('{keyword}', keyword);
        targetComment.isSpam = true;
        targetComment.spamKeywords = [keyword];
        spamCount++;
      } else {
        break;
      }
    }

    // Set initial expanded state - 70% open, 30% collapsed
    const initialExpanded = new Set<string>();
    const expansionRng = new SeededRandom(12345); // Use same seed for consistency
    
    generatedComments.forEach(comment => {
      if (comment.replies.length > 0) {
        // 70% chance to start expanded
        if (expansionRng.next() < 0.7) {
          initialExpanded.add(comment.id);
        }
      }
    });
    
    setComments(generatedComments);
    setExpandedNodes(initialExpanded);
  }, []);

  // Expose state for testing
  useEffect(() => {
    const spamComments = comments.filter(c => c.isSpam);
    const mainThreads = comments.filter(c => c.level === 0);
    
    (window as any).app_state = {
      comments,
      spamComments,
      moderationQueue,
      flaggedComments: Array.from(flaggedComments),
      expandedNodes: Array.from(expandedNodes),
      mainThreads,
      totalComments: comments.length,
      totalSpamComments: spamComments.length
    };
  }, [comments, moderationQueue, expandedNodes, flaggedComments]);

  const toggleExpanded = (commentId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getThreadContext = (comment: Comment): string => {
    // Find the root comment of this thread
    const rootComment = comments.find(c => c.level === 0 && (
      c.id === comment.id || 
      comment.id.startsWith(c.id) ||
      isInThread(comment, c)
    ));
    return rootComment ? rootComment.content : 'Unknown thread';
  };

  const isInThread = (comment: Comment, rootComment: Comment): boolean => {
    // Check if comment belongs to the thread started by rootComment
    let current = comment;
    while (current.parentId) {
      const parent = comments.find(c => c.id === current.parentId);
      if (!parent) break;
      if (parent.id === rootComment.id) return true;
      current = parent;
    }
    return false;
  };

  const flagForReview = (comment: Comment) => {
    const isCurrentlyFlagged = flaggedComments.has(comment.id);
    
    if (isCurrentlyFlagged) {
      // Remove from flag and moderation queue
      setFlaggedComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(comment.id);
        return newSet;
      });
      setModerationQueue(prev => prev.filter(entry => entry.commentId !== comment.id));
    } else {
      // Add to flag and moderation queue
      setFlaggedComments(prev => new Set(prev).add(comment.id));
      
      const threadContext = getThreadContext(comment);
      const newEntry: ModerationEntry = {
        commentId: comment.id,
        author: comment.author,
        contentPreview: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
        threadContext: threadContext.substring(0, 40) + (threadContext.length > 40 ? '...' : ''),
        spamKeywords: comment.spamKeywords
      };
      
      setModerationQueue(prev => [...prev, newEntry]);
    }
  };

  const removeFromQueue = (commentId: string) => {
    setModerationQueue(prev => prev.filter(entry => entry.commentId !== commentId));
    setFlaggedComments(prev => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  };

  const renderComment = (comment: Comment): React.ReactNode => {
    const hasReplies = comment.replies.length > 0;
    const isExpanded = expandedNodes.has(comment.id);
    const indentLevel = comment.level * 20; // 20px per level

    return (
      <div key={comment.id} className="border-l-2 border-gray-200">
        <div 
          className="flex flex-col p-3 hover:bg-gray-50"
          style={{ marginLeft: `${indentLevel}px` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              {hasReplies && (
                <button
                  onClick={() => toggleExpanded(comment.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {!hasReplies && <div className="w-6" />}
              
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm">{comment.author}</span>
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleDateString()}
                </span>
                {hasReplies && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {comment.replies.length} replies
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => flagForReview(comment)}
              className={`p-1 rounded transition-colors ${
                flaggedComments.has(comment.id)
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              title={flaggedComments.has(comment.id) ? "Remove Flag" : "Flag for Review"}
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mt-2 text-sm text-gray-700 ml-6">
            {comment.content}
          </div>
        </div>
        
        {hasReplies && isExpanded && (
          <div className="ml-4">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  // Get root comments (main threads)
  const rootComments = comments.filter(comment => comment.level === 0);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Comment Tree Panel */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Discussion Threads
            </h2>
          </div>
          
          <div className="divide-y">
            {rootComments.map(comment => renderComment(comment))}
          </div>
        </div>
      </div>

      {/* Moderation Queue Panel */}
      <div className="w-96 p-6 flex flex-col overflow-hidden">
        <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
          <div className="p-4 border-b flex-shrink-0">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-600" />
              Moderation Queue
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Comments flagged for spam review
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {moderationQueue.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Flag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No comments flagged yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {moderationQueue.map((entry, index) => (
                  <div key={index} className="p-4">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Comment ID</label>
                        <p className="text-sm font-mono">{entry.commentId}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Author</label>
                        <p className="text-sm">{entry.author}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Content Preview</label>
                        <p className="text-sm text-gray-700">{entry.contentPreview}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500">Thread Context</label>
                        <p className="text-sm text-gray-600">{entry.threadContext}</p>
                      </div>
                      <button
                        onClick={() => removeFromQueue(entry.commentId)}
                        className="w-full bg-red-500 text-white px-3 py-2 text-sm rounded hover:bg-red-600 transition-colors"
                      >
                        Remove from Queue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



export default Task11;
