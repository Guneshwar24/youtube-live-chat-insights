import React from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const SentimentFlow = ({ chatData }) => {
  // Group messages by time and calculate sentiment distributions
  const timeWindows = chatData.map((message, index) => {
    const timeSlot = Math.floor(index / 10); // Group every 10 messages
    return {
      timeSlot,
      ...message.sentiments,
      total: Object.values(message.sentiments).reduce((a, b) => a + b, 0)
    };
  });

  // Normalize data for stacked area chart
  const normalizedData = timeWindows.map(window => {
    const total = window.total || 1;
    return {
      timeSlot: window.timeSlot,
      excited: (window.excited || 0) / total * 100,
      amused: (window.amused || 0) / total * 100,
      happy: (window.happy || 0) / total * 100,
      concerned: (window.concerned || 0) / total * 100,
      neutral: (window.neutral || 0) / total * 100
    };
  });

  const gradients = [
    { id: 'excited', color: '#FFD700' },
    { id: 'amused', color: '#4CAF50' },
    { id: 'happy', color: '#2196F3' },
    { id: 'concerned', color: '#FF9800' },
    { id: 'neutral', color: '#9E9E9E' }
  ];

  return (
    <div style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={normalizedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {gradients.map(({ id, color }) => (
              <linearGradient key={id} id={`color${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>

          <XAxis 
            dataKey="timeSlot" 
            label={{ value: 'Time', position: 'bottom' }}
          />
          <YAxis 
            label={{ value: 'Sentiment Distribution (%)', angle: -90, position: 'left' }}
          />
          <Tooltip 
            formatter={(value, name) => [`${value.toFixed(1)}%`, name]}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />

          {gradients.map(({ id }, index) => (
            <Area
              key={id}
              type="monotone"
              dataKey={id}
              stackId="1"
              stroke={gradients[index].color}
              fillOpacity={1}
              fill={`url(#color${id})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentFlow;