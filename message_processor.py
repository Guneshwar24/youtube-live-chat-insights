import json
from datetime import datetime
from typing import List, Dict, Any, Set
from collections import Counter, defaultdict
import re

class MessageProcessor:
    # Class-level constants
    EMOJI_PATTERN = r'[\U0001F300-\U0001F9FF]'
    COMMON_WORDS = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'}
    MIN_WORD_LENGTH = 3
    TRENDING_TOPICS_LIMIT = 10
    KEYWORDS_PER_MOOD = 2
    TOP_KEYWORDS_LIMIT = 3

    # Mood and sentiment indicators
    MOOD_INDICATORS = {
        'excited': {'🔥', '💯', '🤩', '⚡', '🎉', '🎊', '🥳'},
        'amused': {'😂', '🤣', '😅', '😆', '😄', '😃'},
        'happy': {'😊', '🙂', '😌', '👍', '♥️', '❤️'},
        'concerned': {'😕', '😟', '😨', '😰', '😥'},
        'frustrated': {'😤', '😠', '😡', '🤬', '👎'},
        'sad': {'😢', '😭', '😞', '😔', '💔'},
        'neutral': {'🤔', '😐', '😶'}
    }

    POSITIVE_EMOJIS = {'😊', '😄', '😃', '🤣', '😂', '👍', '♥️', '❤️', '🔥', '💯', '🤩', '⚡', '🎉'}
    NEGATIVE_EMOJIS = {'😢', '😭', '😤', '😠', '😡', '👎', '💔', '😕', '😟', '😨'}

    MOOD_KEYWORDS = {
        'amused': ['lol', 'haha', 'lmao'],
        'excited': ['wow', 'amazing', 'awesome'],
        'concerned': ['please', 'help', 'why']
    }

    def __init__(self):
        self.messages = []
        self.processed_data = defaultdict(list)
        self.current_batch_size = 100

    def load_messages(self, messages: List[Dict[str, str]]) -> None:
        """Load messages with timestamps and metadata."""
        current_time = datetime.now()
        self.messages = [
            {
                **msg,
                'timestamp': current_time,
                'id': idx,
                'has_emoji': bool(self._find_emojis(msg['message'])),
                'tags': self._generate_tags(msg['message'])
            }
            for idx, msg in enumerate(messages)
        ]
        self._process_current_batch()

    def _find_emojis(self, text: str) -> Set[str]:
        """Utility method to find emojis in text."""
        return set(re.findall(self.EMOJI_PATTERN, text))

    def _generate_tags(self, message: str) -> List[str]:
        """Generate tags based on message content."""
        tags = []
        message_lower = message.lower()
        
        # Tag rules
        tag_rules = {
            'chess': lambda m: 'chess' in m,
            'game': lambda m: 'game' in m,
            'technical': lambda m: any(word in m for word in ['video', 'stream', 'quality']),
            'entertainment': lambda m: any(word in m for word in ['bheem', 'kaliya']),
            'reaction': lambda m: bool(self._find_emojis(m))
        }

        return [tag for tag, rule in tag_rules.items() if rule(message_lower)]

    def _process_current_batch(self) -> None:
        """Process the current batch of messages."""
        if not self.messages:
            return

        # Group messages by tags
        tag_groups = self._group_messages_by_tags()
        
        self.processed_data.update({
            'engagement': self._analyze_engagement(tag_groups),
            'trending': self._extract_trending_topics(),
            'sentiment': self._analyze_sentiment(),
            'questions': self._extract_questions()
        })

    def _group_messages_by_tags(self) -> Dict[str, List[Dict]]:
        """Group messages by their tags."""
        tag_groups = defaultdict(list)
        for msg in self.messages:
            for tag in msg['tags']:
                tag_groups[tag].append(msg)
        return tag_groups

    def _analyze_engagement(self, tag_groups: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Analyze engagement metrics."""
        return {
            'total_messages': len(self.messages),
            'unique_users': len(set(msg['username'] for msg in self.messages)),
            'emoji_messages': len([msg for msg in self.messages if msg['has_emoji']]),
            'tag_distribution': {tag: len(msgs) for tag, msgs in tag_groups.items()}
        }

    def _extract_trending_topics(self) -> List[Dict[str, Any]]:
        """Extract trending topics from messages."""
        word_counts = Counter(
            word for msg in self.messages
            for word in msg['message'].lower().split()
            if word not in self.COMMON_WORDS and len(word) > self.MIN_WORD_LENGTH
        )
        
        return sorted(
            [{'topic': word, 'count': count} for word, count in word_counts.items()],
            key=lambda x: x['count'],
            reverse=True
        )[:self.TRENDING_TOPICS_LIMIT]

    def _analyze_sentiment(self) -> Dict[str, Any]:
        """Analyze message sentiment and moods."""
        mood_data = {
            'distributions': {},  # Changed from defaultdict to regular dict
            'mood_keywords': {},  # Changed from defaultdict to regular dict
            'overall_mood': '',
            'mood_heatmap': self._generate_mood_heatmap(),
            'basic_sentiment': self._get_basic_sentiment()
        }

        # Temporary defaultdict for counting
        temp_distributions = defaultdict(int)
        temp_keywords = defaultdict(list)

        for msg in self.messages:
            detected_moods = self._detect_message_moods(msg)
            self._update_mood_data(temp_distributions, temp_keywords, msg, detected_moods)

        # Convert defaultdict to regular dict for JSON serialization
        mood_data['distributions'] = dict(temp_distributions)
        mood_data['mood_keywords'] = {
            mood: self._get_top_keywords(keywords)
            for mood, keywords in temp_keywords.items()
        }

        # Calculate overall mood
        if temp_distributions:
            mood_data['overall_mood'] = max(
                temp_distributions.items(),
                key=lambda x: x[1]
            )[0]

        return mood_data

    def _generate_mood_heatmap(self) -> Dict[str, Any]:
        """Generate mood heatmap data."""
        # Initialize time slots (24 slots of 1 hour each)
        time_slots = {str(i).zfill(2): {
            'total': 0,
            'moods': defaultdict(int)
        } for i in range(24)}

        for msg in self.messages:
            hour = msg.get('timestamp').strftime('%H')
            moods = self._detect_message_moods(msg)
            
            time_slots[hour]['total'] += 1
            for mood in moods:
                time_slots[hour]['moods'][mood] += 1

        # Convert defaultdict to regular dict for JSON serialization
        return {
            hour: {
                'total': data['total'],
                'moods': dict(data['moods']),
                'dominant_mood': max(data['moods'].items(), key=lambda x: x[1])[0] if data['moods'] else 'neutral',
                'intensity': data['total']  # For heatmap intensity
            }
            for hour, data in time_slots.items()
        }

    def _update_mood_data(self, distributions: Dict, keywords: Dict, 
                         message: Dict, detected_moods: List[str]) -> None:
        """Update mood data with message information."""
        for mood in detected_moods:
            # Update distributions
            distributions[mood] += 1

            # Update keywords
            words = [word for word in message['message'].split() 
                    if len(word) > self.MIN_WORD_LENGTH]
            if words:
                keywords[mood].extend(words[:self.KEYWORDS_PER_MOOD])

    def _get_top_keywords(self, keywords: List[str]) -> List[str]:
        """Get top keywords with counts."""
        word_counter = Counter(keywords)
        return [word for word, _ in word_counter.most_common(self.TOP_KEYWORDS_LIMIT)]

    def _get_basic_sentiment(self) -> Dict[str, int]:
        """Calculate basic sentiment counts."""
        sentiment = {'positive_count': 0, 'negative_count': 0, 'neutral_count': 0}
        
        for msg in self.messages:
            emojis = self._find_emojis(msg['message'])
            if any(emoji in self.POSITIVE_EMOJIS for emoji in emojis):
                sentiment['positive_count'] += 1
            elif any(emoji in self.NEGATIVE_EMOJIS for emoji in emojis):
                sentiment['negative_count'] += 1
            else:
                sentiment['neutral_count'] += 1
                
        sentiment['total_messages'] = len(self.messages)
        return sentiment

    def _detect_message_moods(self, message: Dict) -> List[str]:
        """Detect moods in a single message."""
        emojis = self._find_emojis(message['message'])
        detected_moods = []

        # Check emoji-based moods
        for mood, indicators in self.MOOD_INDICATORS.items():
            if any(emoji in indicators for emoji in emojis):
                detected_moods.append(mood)

        # Check keyword-based moods if no emojis detected
        if not detected_moods:
            message_lower = message['message'].lower()
            for mood, keywords in self.MOOD_KEYWORDS.items():
                if any(word in message_lower for word in keywords):
                    detected_moods.append(mood)

        return detected_moods or ['neutral']

    def _update_mood_data(self, mood_data: Dict, message: Dict, detected_moods: List[str]) -> None:
        """Update mood data with message information."""
        for mood in detected_moods:
            # Update distributions
            mood_data['distributions'][mood] += 1

            # Update keywords
            words = [word for word in message['message'].split() 
                    if len(word) > self.MIN_WORD_LENGTH]
            if words:
                mood_data['mood_keywords'][mood].extend(words[:self.KEYWORDS_PER_MOOD])

            # Update timeline
            mood_data['mood_timeline'].append({
                'timestamp': message.get('timestamp', datetime.now()),
                'mood': mood,
                'message': message['message']
            })

    def _finalize_mood_analysis(self, mood_data: Dict) -> None:
        """Finalize mood analysis by calculating overall mood and cleaning up keywords."""
        if mood_data['distributions']:
            mood_data['overall_mood'] = max(
                mood_data['distributions'].items(),
                key=lambda x: x[1]
            )[0]

        # Clean up keyword lists
        for mood in mood_data['mood_keywords']:
            word_counter = Counter(mood_data['mood_keywords'][mood])
            mood_data['mood_keywords'][mood] = [
                word for word, count in word_counter.most_common(self.TOP_KEYWORDS_LIMIT)
            ]

    def _extract_questions(self) -> List[Dict[str, str]]:
        """Extract questions from messages."""
        return [
            {
                'question': msg['message'],
                'username': msg['username'],
                'timestamp': msg['timestamp']
            }
            for msg in self.messages if '?' in msg['message']
        ]

    def get_processed_data(self) -> Dict[str, Any]:
        """Get the processed data."""
        return dict(self.processed_data)

    def get_messages_by_tag(self, tag: str) -> List[Dict[str, Any]]:
        """Get messages filtered by tag."""
        return [msg for msg in self.messages if tag in msg['tags']]

def process_chat_data(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """Process chat data and return analyzed results."""
    processor = MessageProcessor()
    processor.load_messages(messages)
    return processor.get_processed_data()