import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, User, Link2, Image } from 'lucide-react';

class SeededRandom {
  private seed: number;
  constructor(seed: number) { this.seed = seed; }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate data synchronously to avoid timing issues with tests
const generateInitialData = () => {
  const rng = new SeededRandom(12345);
  
  // Generate 25 social media posts
  const contentTypes = ['text', 'image', 'link'];
  const postTopics = [
    'New product launch announcement',
    'Behind the scenes in our office',
    'Industry insights and trends',
    'Customer success story',
    'Team building activity',
    'Tips for productivity',
    'Company milestone celebration',
    'Thought leadership article',
    'Technology innovation update',
    'Community engagement event',
    'Expert interview highlights',
    'Best practices guide',
    'Market research findings',
    'Product feature demonstration',
    'Company culture spotlight'
  ];
  
  const usernames = [
    'TechInsights', 'InnovateDaily', 'BizGrowth', 'StartupLife', 'ProductGuru', 
    'MarketingPro', 'DesignFirst', 'CodeCraft', 'DataDriven', 'FutureThink'
  ];
  
  // Generate posts with only 5 having >100 likes - randomly distributed (indices: 3, 8, 11, 17, 22)
  const highLikeIndices = [3, 8, 11, 17, 22];
  // Assign specific target dates for each high-performing post
  const targetDates = [5, 12, 20, 25, 28]; // Corresponding to highLikeIndices
  
  const generatedPosts = Array.from({ length: 25 }, (_, index) => {
    const isHighLike = highLikeIndices.includes(index);
    const highLikePosition = highLikeIndices.indexOf(index);
    const contentType = contentTypes[Math.floor(rng.next() * contentTypes.length)];
    const topic = postTopics[Math.floor(rng.next() * postTopics.length)];
    const username = usernames[Math.floor(rng.next() * usernames.length)];
    
    // Generate like count: 15-100 for normal posts, 101-350 for high-performing posts
    const likeCount = isHighLike 
      ? Math.floor(rng.next() * 250) + 101  // 101-350
      : Math.floor(rng.next() * 86) + 15;   // 15-100
    
    const commentCount = Math.floor(rng.next() * 30) + 2;
    
    // No timestamp needed to avoid past date conflicts
    
    // Assign target date for high-performing posts
    const targetDate = isHighLike ? targetDates[highLikePosition] : null;
    
    return {
      id: `post-${index + 1}`,
      username,
      content: `${topic} - Sharing valuable insights with our community! #growth #innovation`,
      contentType,
      likes: likeCount,
      comments: commentCount,
      isHighPerforming: isHighLike,
      targetDate: targetDate
    };
  });
  
  // Generate calendar for next month (30 days)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const calendarDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(nextMonth);
    date.setDate(index + 1);
    return {
      date: date.getDate(),
      dateStr: date.toLocaleDateString(),
      scheduledPost: null
    };
  });
  
  return { posts: generatedPosts, calendar: calendarDays };
};

const Task16: React.FC = () => {
  const initialData = generateInitialData();
  const [posts] = useState<any[]>(initialData.posts);
  const [calendar, setCalendar] = useState<any[]>(initialData.calendar);
  const [draggedPost, setDraggedPost] = useState<any>(null);
  const [draggedFromCalendar, setDraggedFromCalendar] = useState<any>(null);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  
  // Expose app state for testing
  useEffect(() => {
    const highPerformingPosts = posts.filter(post => post.likes > 100);
    const expectedScheduledPosts = scheduledPosts.filter(sp => 
      highPerformingPosts.some(hp => hp.id === sp.postId)
    );
    
    (window as any).app_state = {
      posts,
      scheduledPosts,
      highPerformingPosts,
      expectedScheduledPosts,
      calendar,
      targetDates: highPerformingPosts.map(p => ({ postId: p.id, targetDate: p.targetDate }))
    };
  }, [posts, scheduledPosts, calendar]);
  
  const handleDragStart = (e: React.DragEvent, post: any) => {
    setDraggedPost(post);
    setDraggedFromCalendar(null);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleScheduledPostDragStart = (e: React.DragEvent, scheduledPost: any, fromDay: any) => {
    setDraggedPost(scheduledPost);
    setDraggedFromCalendar(fromDay);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, calendarDay: any) => {
    e.preventDefault();
    
    if (!draggedPost) return;
    
    const postId = draggedPost.postId || draggedPost.id;
    
    // Create new scheduled post
    const newScheduledPost = {
      postId: postId,
      date: calendarDay.dateStr,
      content: draggedPost.content,
      likes: draggedPost.likes,
      username: draggedPost.username
    };
    
    // Update scheduled posts array - remove any existing instance of this post and any post on target date
    setScheduledPosts(prev => {
      // Remove the dragged post from any previous location
      let filtered = prev.filter(sp => sp.postId !== postId);
      // Remove any existing post on the target date
      filtered = filtered.filter(sp => sp.date !== calendarDay.dateStr);
      // Add the new scheduled post
      return [...filtered, newScheduledPost];
    });
    
    // Update calendar - clear old location and set new location
    setCalendar(prev => prev.map(day => {
      // Clear the old location if dragging from calendar
      if (draggedFromCalendar && day.dateStr === draggedFromCalendar.dateStr) {
        return { ...day, scheduledPost: null };
      }
      // Set the new location
      if (day.dateStr === calendarDay.dateStr) {
        return { ...day, scheduledPost: newScheduledPost };
      }
      // Clear any other location that had this post
      if (day.scheduledPost && day.scheduledPost.postId === postId) {
        return { ...day, scheduledPost: null };
      }
      return day;
    }));
    
    setDraggedPost(null);
    setDraggedFromCalendar(null);
  };
  
  const removeScheduledPost = (calendarDay: any) => {
    if (calendarDay.scheduledPost) {
      setScheduledPosts(prev => prev.filter(sp => sp.postId !== calendarDay.scheduledPost.postId));
      setCalendar(prev => prev.map(day => 
        day.dateStr === calendarDay.dateStr 
          ? { ...day, scheduledPost: null }
          : day
      ));
    }
  };
  
  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'image':
        return <Image className="w-4 h-4 text-blue-500" />;
      case 'link':
        return <Link2 className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Social Media Feed */}
      <div className="w-[35%] p-6 overflow-y-auto border-r border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Social Media Feed</h2>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              draggable
              onDragStart={(e) => handleDragStart(e, post)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-move hover:shadow-lg transition-shadow ${
                post.likes > 100 ? 'border-2 border-yellow-400' : 'border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-gray-800">{post.username}</span>
                    {getContentIcon(post.contentType)}
                    {post.targetDate && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                        Schedule: {post.targetDate}th
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  <div className="flex items-center space-x-4 text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className={`w-5 h-5 ${post.likes > 100 ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                      <span className={`font-medium ${post.likes > 100 ? 'text-red-500' : 'text-gray-600'}`}>
                        {post.likes}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-5 h-5 text-gray-400" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content Calendar */}
      <div className="w-[65%] p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Content Calendar - Next Month</h2>
        <div className="grid grid-cols-7 gap-2 grid-rows-[auto_repeat(5,1fr)]">
          {/* Calendar headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-100 rounded">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendar.map((day, index) => (
            <div
              key={index}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day)}
              className={`h-[120px] p-2 border rounded-lg transition-colors ${
                day.scheduledPost 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              } ${draggedPost ? 'hover:bg-yellow-50 hover:border-yellow-300' : ''}`}
            >
              <div className="text-xs font-medium text-gray-700 mb-1">{day.date}</div>
              {day.scheduledPost && (
                <div 
                  draggable
                  onDragStart={(e) => handleScheduledPostDragStart(e, day.scheduledPost, day)}
                  className="text-xs bg-blue-100 p-1.5 rounded border-l-2 border-blue-400 cursor-move hover:bg-blue-200 transition-colors"
                >
                  <div className="font-medium text-blue-800 mb-0.5 text-[10px]">
                    @{day.scheduledPost.username}
                  </div>
                  <div className="text-blue-700 mb-0.5 leading-tight text-[9px]">
                    {day.scheduledPost.content.substring(0, 40)}...
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 text-[9px]">
                      ♥ {day.scheduledPost.likes}
                    </span>
                    <button
                      onClick={() => removeScheduledPost(day)}
                      className="text-red-500 text-[9px] hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
              {!day.scheduledPost && draggedPost && (
                <div className="text-center text-gray-400 text-[10px] mt-4">
                  <Calendar className="w-4 h-4 mx-auto mb-1 opacity-50" />
                  Drop here
                </div>
              )}
              {day.scheduledPost && draggedPost && (
                <div className="text-center text-yellow-600 text-[10px] mt-1 font-medium">
                  Drop to replace
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-gray-800 mb-2">Scheduling Summary</h3>
          <p className="text-sm text-gray-600">
            Posts scheduled: {scheduledPosts.length} / 5 high-performing posts
          </p>
          <p className="text-sm text-gray-600">
            Calendar coverage: {calendar.filter(day => day.scheduledPost).length} / 30 days
          </p>
          {scheduledPosts.length !== calendar.filter(day => day.scheduledPost).length && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ State mismatch detected - refresh page if issues persist
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task16;
