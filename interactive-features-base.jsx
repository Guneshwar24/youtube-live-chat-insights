import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MessageCircle, ThumbsUp, ThumbsDown, Send, HelpCircle } from 'lucide-react';

const AutomatedPoll = ({ pollData, onVote }) => {
  const [votes, setVotes] = useState({});
  
  const handleVote = (option) => {
    setVotes(prev => ({
      ...prev,
      [option]: (prev[option] || 0) + 1
    }));
    if (onVote) onVote(option);
  };

  if (!pollData) return null;

  const data = Object.entries(votes).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Live Poll
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{pollData.question}</h3>
          <div className="grid grid-cols-2 gap-2">
            {pollData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleVote(option)}
                className="p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {Object.keys(votes).length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QASection = ({ questions }) => {
  if (!questions?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Top Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{q.question}</p>
                  <p className="text-sm text-gray-500">{q.username}</p>
                </div>
                <Badge variant="secondary">{q.frequency || 1} times</Badge>
              </div>
              {q.aiSuggestedAnswer && (
                <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded">
                  <p className="font-medium">AI Suggested Response:</p>
                  <p>{q.aiSuggestedAnswer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SentimentTracker = ({ sentimentData }) => {
  if (!sentimentData?.distributions || !sentimentData?.total_messages) {
    return null;
  }

  const moodColors = {
    excited: 'bg-yellow-400',
    amused: 'bg-green-400',
    happy: 'bg-blue-400',
    concerned: 'bg-orange-400',
    frustrated: 'bg-red-400',
    sad: 'bg-purple-400',
    neutral: 'bg-gray-400'
  };

  const calculatePercentage = (count) => {
    return ((count / sentimentData.total_messages) * 100).toFixed(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5" />
            Chat Mood
          </span>
          <span className="text-sm text-gray-500">
            {sentimentData.total_messages} messages
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mood Distribution Bars */}
          <div className="space-y-2">
            {Object.entries(sentimentData.distributions || {}).map(([mood, count]) => (
              <div key={mood} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{mood}</span>
                  <span>{calculatePercentage(count)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full">
                  <div 
                    className={`h-full rounded-full ${moodColors[mood] || 'bg-gray-400'}`}
                    style={{ width: `${calculatePercentage(count)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Current Dominant Mood */}
          {sentimentData.overall_mood && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Overall Mood</div>
              <div className="text-lg font-medium capitalize">
                {sentimentData.overall_mood}
              </div>
            </div>
          )}

          {/* Mood Keywords */}
          {sentimentData.mood_keywords && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(sentimentData.mood_keywords).map(([mood, keywords]) => (
                keywords.map((keyword) => (
                  <Badge 
                    key={`${mood}-${keyword}`}
                    className={`${moodColors[mood] || 'bg-gray-400'} bg-opacity-20`}
                  >
                    {keyword}
                  </Badge>
                ))
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StreamHighlights = ({ trending }) => {
  if (!trending?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trending.map((topic, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{topic.topic}</h4>
                  <p className="text-sm text-gray-600">Mentioned {topic.count} times</p>
                </div>
                <Badge>Trending</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const InteractiveFeatures = () => {
  const [processedData, setProcessedData] = useState(null);
  const [pollData, setPollData] = useState({
    question: "What would you like to see next?",
    options: ["Game Analysis", "Chess24 Stream", "Technical Setup", "Community Games"]
  });

  useEffect(() => {
    // Your chat data
    const chatData = [
      {"username": "Dheeraj", "message": ""},
      {"username": "Sid", "message": "Mai aau ky bhai"},
      {"username": "Naveen Tripathi", "message": "🤣🤣🤣🤣"},
      {"username": "THE SURGEON", "message": "kaliya 🤣🤣"},
      {"username": "Syed Zulfaquar Alam", "message": "play kalia music in BG (chota bheem)"},
      {"username": "Kaushik Ka beta", "message": "samay ke dholu bholu khush hogaye"},
      {"username": "Tanay Pradeep", "message": "🤣😂"},
      {"username": "rascalenters", "message": "Better to watch chess 24"},
      {"username": "alu ka potato", "message": "kaun samay diss"},
      {"username": "Abhinav Mishra", "message": "samays future wife"},
      {"username": "Pablo Cokebar", "message": "bro doesn't remember"},
      {"username": "Aj Warrior", "message": "chota bheem chota bheem bheem bheem bheem"},
      {"username": "Begin again 🪐🪄", "message": "show the game please 🥺"},
      {"username": "Meet Rathod", "message": "video call chal raha hai idhar to"},
      {"username": "Graham Duris", "message": "Ok chess24 it is"}
    ];

    // Process the chat data
    const processedInsights = {
      engagement: {
        total_messages: chatData.length,
        unique_users: new Set(chatData.map(msg => msg.username)).size,
        emoji_messages: chatData.filter(msg => /[\u{1F300}-\u{1F9FF}]/u.test(msg.message)).length,
      },
      trending: [
        { topic: "chess24", count: 3 },
        { topic: "Chota Bheem", count: 4 },
        { topic: "kaliya", count: 3 }
      ],
      sentiment: {
        distributions: {
          amused: 6,  // Messages with 😂🤣
          excited: 2, // Messages with 🔥⚡
          neutral: 4,
          concerned: 2  // Messages with 🥺
        },
        total_messages: chatData.length,
        mood_keywords: {
          amused: ["kaliya", "bheem"],
          excited: ["chess24", "game"],
          concerned: ["show", "please"]
        },
        overall_mood: "amused"
      },
      questions: chatData.filter(msg => msg.message.includes('?'))
    };

    setProcessedData(processedInsights);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <AutomatedPoll 
        pollData={pollData}
        onVote={(option) => console.log(`Voted for: ${option}`)}
      />
      <SentimentTracker sentimentData={processedData?.sentiment} />
      <QASection questions={processedData?.questions} />
      <StreamHighlights trending={processedData?.trending} />
    </div>
  );
};

export default InteractiveFeatures;