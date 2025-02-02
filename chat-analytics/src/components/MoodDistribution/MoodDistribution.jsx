// MoodDistribution.jsx
import React from 'react';
import styles from './MoodDistribution.module.css';

const MoodDistribution = ({ chatData }) => {
  if (!chatData?.sentiment?.distributions) return null;

  const { sentiment } = chatData;
  const total = Object.values(sentiment.distributions).reduce((a, b) => a + b, 0);

  const getMoodClass = (mood) => {
    const moodClasses = {
      excited: styles.excited,
      amused: styles.amused,
      happy: styles.happy,
      concerned: styles.concerned,
      frustrated: styles.frustrated,
      sad: styles.sad,
      neutral: styles.neutral
    };
    return moodClasses[mood] || styles.neutral;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Mood Distribution</h2>
          {sentiment.overall_mood && (
            <span className={styles.badge}>
              Overall: {sentiment.overall_mood}
            </span>
          )}
        </div>

        <div className={styles.content}>
          {/* Distribution Bars */}
          <div className={styles.distributionList}>
            {Object.entries(sentiment.distributions).map(([mood, count]) => (
              <div key={mood} className={styles.distributionItem}>
                <div className={styles.distributionHeader}>
                  <span className={styles.moodLabel}>{mood}</span>
                  <div className={styles.stats}>
                    <span className={styles.count}>{count} messages</span>
                    <span className={styles.percentage}>
                      {((count / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={`${styles.progressFill} ${getMoodClass(mood)}`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Keywords */}
          {sentiment.mood_keywords && (
            <div className={styles.keywordsSection}>
              <h4 className={styles.keywordsTitle}>Common Keywords by Mood</h4>
              <div className={styles.keywordList}>
                {Object.entries(sentiment.mood_keywords).map(([mood, keywords]) => (
                  keywords.map((keyword) => (
                    <span 
                      key={`${mood}-${keyword}`}
                      className={`${styles.keyword} ${getMoodClass(mood)}`}
                    >
                      {keyword}
                      <small className={styles.moodTag}>({mood})</small>
                    </span>
                  ))
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div className={styles.card}>
        <h2 className={styles.title}>Trending Topics</h2>
        <div className={styles.trendingList}>
          {chatData.trending?.map((topic, index) => (
            <div key={index} className={styles.trendingItem}>
              <div className={styles.topicInfo}>
                <span className={styles.topicName}>{topic.topic}</span>
                <span className={styles.mentionCount}>
                  {topic.count} mentions
                </span>
              </div>
              <span className={styles.rankBadge}>#{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodDistribution;