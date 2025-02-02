import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MoodBubbleChart = ({ sentimentData }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const moodColors = {
    excited: '#FFD700',
    amused: '#4CAF50',
    happy: '#2196F3',
    concerned: '#FF9800',
    frustrated: '#F44336',
    sad: '#9C27B0',
    neutral: '#9E9E9E'
  };

  const moodEmojis = {
    excited: '🤩',
    amused: '😄',
    happy: '😊',
    concerned: '😟',
    frustrated: '😤',
    sad: '😢',
    neutral: '😐'
  };

  // Transform sentiment data for visualization
  const data = Object.entries(sentimentData.distributions).map(([mood, count]) => ({
    name: mood,
    value: count,
    emoji: moodEmojis[mood],
    color: moodColors[mood]
  }));

  // Find dominant non-neutral mood
  const dominantMood = data
    .filter(item => item.name !== 'neutral')
    .reduce((prev, current) => 
      (prev.value > current.value) ? prev : current, 
      { name: 'neutral', value: 0 }
    );

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div style={{ height: '400px', position: 'relative' }}>
      {/* Central Emoji */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '4rem',
          zIndex: 1
        }}
      >
        {dominantMood.emoji}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  filter: activeIndex === index ? 'brightness(1.2)' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {data.map((entry, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              backgroundColor: activeIndex === index ? 'rgba(0,0,0,0.05)' : 'transparent',
              borderRadius: '8px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span style={{ fontSize: '1.2rem' }}>{entry.emoji}</span>
            <span>{entry.name}</span>
            <span style={{ color: '#666' }}>({entry.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodBubbleChart;