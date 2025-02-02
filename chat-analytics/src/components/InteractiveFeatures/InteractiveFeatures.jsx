import React, { useState } from 'react';
import MoodDistribution from '../MoodDistribution/MoodDistribution';
import styles from './InteractiveFeatures.module.css';
import TopicRelationships from '../TopicRelationship/TopicRelationship';
import SentimentFlow from '../SentimentFlow/SentimentFlow';
import MoodBubbleChart from '../MoodBubbleChart/MoodBubbleChart';

const LivePoll = ({ pollData }) => {
  const [votes, setVotes] = useState({});

  const handleVote = (option) => {
    setVotes(prev => ({
      ...prev,
      [option]: (prev[option] || 0) + 1
    }));
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Live Poll</h2>
      <h3 className={styles.pollQuestion}>{pollData.question}</h3>
      <div className={styles.optionsGrid}>
        {pollData.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleVote(option)}
            className={styles.pollOption}
          >
            <span className={styles.optionText}>{option}</span>
            {votes[option] && (
              <span className={styles.voteCount}>({votes[option]})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const CommonQuestions = ({ questions }) => {
  if (!questions?.length) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Common Questions</h2>
      <div className={styles.questionList}>
        {questions.map((question, index) => (
          <div key={index} className={styles.questionItem}>
            <p className={styles.questionText}>{question.question}</p>
            <span className={styles.username}>{question.username}</span>
          </div>
        ))}
      </div>
    </div>
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
      overall_mood: "neutral"
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
    <div className={styles.container}>
      <div className={styles.layout}>
        {/* Interactive Features Column */}
        <div className={styles.interactiveColumn}>
          <LivePoll pollData={chatData.pollData} />
          <CommonQuestions questions={chatData.questions} />
        </div>
        
        {/* Analytics Column */}
        <div className={styles.analyticsColumn}>
          <MoodDistribution chatData={chatData} />
          {/* <TopicRelationships chatData={chatData}/> */}
          {/* <SentimentFlow chatData={chatData}/> */}
          {/* <MoodBubbleChart sentimentData={chatData}/> */}
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeatures;