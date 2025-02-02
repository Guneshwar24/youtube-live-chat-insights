import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, HelpCircle } from 'lucide-react';
import MoodDistribution from './mood-distribution';

const LivePoll = ({ pollData }) => {
  const [votes, setVotes] = useState({});

  const handleVote = (option) => {
    setVotes(prev => ({
      ...prev,
      [option]: (prev[option] || 0) + 1
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Live Poll
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-medium mb-4">{pollData.question}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {pollData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleVote(option)}
              className="p-3 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              {option}
              {votes[option] && <span className="ml-2">({votes[option]})</span>}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const CommonQuestions = ({ questions }) => {
  if (!questions?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Common Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <p className="font-medium">{question.question}</p>
                <Badge variant="secondary">{question.username}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const InteractiveFeatures = () => {
  const [chatData] = useState({
    sentiment: {
      distributions: {
        neutral: 48,
        concerned: 4,
        amused: 2,
        excited: 1
      },
      mood_keywords: {
        neutral: ["game", "arjun", "chess"],
        concerned: ["please", "help", "why"],
        amused: ["haha", "lol", "funny"],
        excited: ["wow", "amazing", "awesome"]
      },
      overall_mood: "neutral",
      basic_sentiment: {
        positive_count: 3,
        negative_count: 4,
        neutral_count: 48,
        total_messages: 55
      }
    },
    trending: [
      { topic: "arjun", count: 11 },
      { topic: "game", count: 6 },
      { topic: "pragg", count: 4 }
    ],
    questions: [
      { question: "vidit game???", username: "Rakshita" },
      { question: "Pragg lost?", username: "Sudesh Ranga" }
    ],
    pollData: {
      question: "What would you like to see next?",
      options: ["Game Analysis", "Chess24 Stream", "Technical Setup", "Community Games"]
    }
  });

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Features Column */}
        <div className="space-y-4">
          <LivePoll pollData={chatData.pollData} />
          <CommonQuestions questions={chatData.questions} />
        </div>
        
        {/* Analytics Column */}
        <div className="space-y-4">
          <MoodDistribution chatData={chatData} />
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeatures;