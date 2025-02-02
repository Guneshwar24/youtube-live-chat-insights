import React, { useState } from 'react';
import { Group } from '@visx/group';
import { Chord, Ribbon } from '@visx/chord';
import { Arc } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';

const TopicRelationships = ({ chatData }) => {
  const [activeNode, setActiveNode] = useState(null);
  
  // Extract topics and their relationships
  const topics = Array.from(new Set(chatData.trending.map(t => t.topic)));
  
  // Create a matrix of topic relationships
  const matrix = topics.map(topic1 => 
    topics.map(topic2 => {
      if (topic1 === topic2) return 0;
      // Count co-occurrences of topics in messages
      return chatData.messages.filter(msg => 
        msg.text.toLowerCase().includes(topic1) && 
        msg.text.toLowerCase().includes(topic2)
      ).length;
    })
  );

  const colors = scaleOrdinal({
    domain: topics,
    range: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9B786F', '#588C7E'
    ]
  });

  const [width, height] = [500, 500];
  const outerRadius = Math.min(width, height) * 0.5 - 40;
  const innerRadius = outerRadius - 10;

  return (
    <svg width={width} height={height}>
      <Group top={height / 2} left={width / 2}>
        <Chord matrix={matrix} padAngle={0.05}>
          {({ chords }) => (
            <g>
              {chords.groups.map((group, i) => (
                <Arc
                  key={`arc-${i}`}
                  data={group}
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  fill={colors(i)}
                  onClick={() => setActiveNode(i === activeNode ? null : i)}
                  onMouseEnter={() => setActiveNode(i)}
                  onMouseLeave={() => setActiveNode(null)}
                  opacity={activeNode === null || activeNode === i ? 1 : 0.3}
                />
              ))}

              {chords.map((chord, i) => (
                <Ribbon
                  key={`ribbon-${i}`}
                  chord={chord}
                  radius={innerRadius}
                  fill={colors(chord.source.index)}
                  fillOpacity={0.7}
                  opacity={
                    activeNode === null || 
                    activeNode === chord.source.index || 
                    activeNode === chord.target.index ? 0.7 : 0.1
                  }
                />
              ))}

              {/* Topic Labels */}
              {chords.groups.map((group, i) => {
                const angle = (group.startAngle + group.endAngle) / 2;
                const radius = outerRadius + 20;
                return (
                  <text
                    key={`label-${i}`}
                    x={radius * Math.cos(angle - Math.PI / 2)}
                    y={radius * Math.sin(angle - Math.PI / 2)}
                    dy=".35em"
                    textAnchor={angle > Math.PI ? "end" : "start"}
                    transform={`rotate(${(angle * 180) / Math.PI - 90})`}
                    fontSize={12}
                    opacity={activeNode === null || activeNode === i ? 1 : 0.3}
                  >
                    {topics[i]}
                  </text>
                );
              })}
            </g>
          )}
        </Chord>
      </Group>
    </svg>
  );
};

export default TopicRelationships;