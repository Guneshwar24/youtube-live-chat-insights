import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, ThumbsUp, BarChart } from 'lucide-react';

const MoodDistribution = ({ sentimentData }) => {
  if (!sentimentData?.distributions) return null;

  const moodColors = {
    excited: 'bg-yellow-400',
    amused: 'bg-green-400',
    happy: 'bg-blue-400',
    concerned: 'bg-orange-400',
    frustrated: 'bg-red-400',
    sad: 'bg-purple-400',
    neutral: 'bg-gray-400'
  };

  // Calculate percentages
  const total = Object.values(sentimentData.distributions).reduce((a, b) => a + b, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Mood Distribution
          {sentimentData.overall_mood && (
            <Badge className="ml-auto">
              Overall: {sentimentData.overall_mood}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Distribution Bars */}
          <div className="space-y-3">
            {Object.entries(sentimentData.distributions).map(([mood, count]) => (
              <div key={mood} className="space-y-1">
                <div className="flex justify-between text-sm items-center">
                  <span className="capitalize">{mood}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {count} messages
                    </span>
                    <span className="font-medium">
                      {((count / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${moodColors[mood] || 'bg-gray-400'}`}
                    style={{ 
                      width: `${(count / total) * 100}%`,
                      transition: 'width 0.5s ease-in-out'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Mood Keywords */}
          {sentimentData.mood_keywords && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Common Keywords by Mood</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(sentimentData.mood_keywords).map(([mood, keywords]) => (
                  keywords.map((keyword) => (
                    <Badge 
                      key={`${mood}-${keyword}`}
                      className={`${moodColors[mood]} bg-opacity-20`}
                    >
                      {keyword}
                      <span className="ml-1 text-xs opacity-70">({mood})</span>
                    </Badge>
                  ))
                ))}
              </div>
            </div>
          )}

          {/* Basic Sentiment Summary */}
          {sentimentData.basic_sentiment && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Positive</div>
                  <div className="text-xl font-bold text-green-600">
                    {((sentimentData.basic_sentiment.positive_count / total) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Neutral</div>
                  <div className="text-xl font-bold text-gray-600">
                    {((sentimentData.basic_sentiment.neutral_count / total) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Negative</div>
                  <div className="text-xl font-bold text-red-600">
                    {((sentimentData.basic_sentiment.negative_count / total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StreamDashboard = () => {
  const [data, setData] = useState({
    sentimentData: {
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
    trendingTopics: [
      { topic: "arjun", count: 11 },
      { topic: "game", count: 6 },
      { topic: "pragg", count: 4 }
    ]
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 p-4">
      {/* Mood Distribution */}
      <MoodDistribution sentimentData={data.sentimentData} />

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.trendingTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{topic.topic}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {topic.count} mentions
                  </span>
                </div>
                <Badge>
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamDashboard;