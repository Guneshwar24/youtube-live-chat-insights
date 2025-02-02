import json
from typing import List, Dict, Any
import re
from collections import Counter
from datetime import datetime
from openai import OpenAI

class StreamChatAnalyzer:
    def __init__(self, nebius_api_key: str):
        """Initialize the chat analyzer with Nebius API key."""
        self.client = OpenAI(
            base_url="https://api.studio.nebius.ai/v1/",
            api_key=nebius_api_key
        )
        self.message_history = []
        self.current_poll = None
        self.question_cache = {}

    def process_new_messages(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Process new chat messages and return comprehensive analysis."""
        self.message_history.extend(messages)
        
        return {
            "polls": self._generate_poll_suggestions(messages),
            "qa": self._process_questions(messages),
            "sentiment": self._analyze_sentiment(messages),
            "highlights": self._generate_highlights(messages)
        }

    def _generate_poll_suggestions(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Generate poll suggestions based on chat topics."""
        prompt = """
        Based on these chat messages, suggest a relevant poll question and options.
        Format response as JSON: {
            "question": "poll question",
            "options": ["option1", "option2", "option3", "option4"],
            "relevance_score": 0-100
        }
        """
        
        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Meta-Llama-3.1-70B-Instruct",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": str(messages)}
                ],
                temperature=0.7,
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error generating poll: {e}")
            return None

    def _process_questions(self, messages: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Identify and process questions from chat."""
        questions = []
        
        for msg in messages:
            if '?' in msg['message']:
                # Group similar questions
                similar_found = False
                for existing_q in self.question_cache.values():
                    if self._are_questions_similar(msg['message'], existing_q['question']):
                        existing_q['frequency'] += 1
                        existing_q['askers'].append(msg['username'])
                        similar_found = True
                        break
                
                if not similar_found:
                    question_id = len(self.question_cache)
                    self.question_cache[question_id] = {
                        'question': msg['message'],
                        'frequency': 1,
                        'askers': [msg['username']],
                        'timestamp': datetime.now()
                    }
        
        # Generate AI responses for top questions
        top_questions = sorted(
            self.question_cache.values(),
            key=lambda x: x['frequency'],
            reverse=True
        )[:5]

        for q in top_questions:
            ai_response = self._generate_ai_response(q['question'])
            q['ai_suggested_answer'] = ai_response

        return top_questions

    def _analyze_sentiment(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Analyze sentiment of chat messages."""
        prompt = """
        Analyze the sentiment of these chat messages and provide:
        1. Overall sentiment score (0-100)
        2. Percentage of positive and negative messages
        3. Key topics and their sentiment
        
        Format as JSON: {
            "score": number,
            "positive": number,
            "negative": number,
            "topics": [{"topic": string, "sentiment": "positive|negative"}]
        }
        """
        
        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Meta-Llama-3.1-70B-Instruct",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": str(messages)}
                ],
                temperature=0.7,
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return None

    def _generate_highlights(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Generate stream highlights based on chat activity."""
        prompt = """
        Create highlight summaries from these chat messages.
        Focus on:
        1. Key moments or events
        2. Popular reactions
        3. Important announcements
        4. Community interactions
        
        Format as JSON array: [{
            "title": string,
            "summary": string,
            "category": string,
            "timestamp": string
        }]
        """
        
        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Meta-Llama-3.1-70B-Instruct",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": str(messages)}
                ],
                temperature=0.7,
                response_format={ "type": "json_object" }
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"Error generating highlights: {e}")
            return []

    def _are_questions_similar(self, q1: str, q2: str) -> bool:
        """Check if two questions are similar using simple text comparison."""
        # Clean and tokenize questions
        def clean_text(text):
            text = text.lower()
            text = re.sub(r'[^\w\s]', '', text)
            return set(text.split())
        
        words1 = clean_text(q1)
        words2 = clean_text(q2)
        
        # Calculate Jaccard similarity
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union > 0.5 if union > 0 else False

    def _generate_ai_response(self, question: str) -> str:
        """Generate AI response for a question."""
        prompt = f"""
        As a stream moderator, provide a concise, helpful answer to this question:
        {question}
        
        Keep the response informative but brief.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="meta-llama/Meta-Llama-3.1-70B-Instruct",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": question}
                ],
                temperature=0.7,
                max_tokens=100
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error generating AI response: {e}")
            return "Unable to generate response at this time."

    def get_engagement_metrics(self) -> Dict[str, Any]:
        """Calculate engagement metrics from message history."""
        if not self.message_history:
            return {
                "total_messages": 0,
                "active_users": 0,
                "avg_response_time": 0,
                "peak_times": []
            }

        user_activity = Counter(msg['username'] for msg in self.message_history)
        message_times = [msg.get('timestamp') for msg in self.message_history if msg.get('timestamp')]

        metrics = {
            "total_messages": len(self.message_history),
            "active_users": len(user_activity),
            "most_active_users": user_activity.most_common(5),
            "peak_times": self._calculate_peak_times(message_times) if message_times else []
        }

        return metrics

    def _calculate_peak_times(self, timestamps: List[datetime]) -> List[Dict[str, Any]]:
        """Calculate peak activity times."""
        hour_counts = Counter(ts.hour for ts in timestamps)
        total_messages = len(timestamps)
        
        peak_times = [
            {
                "hour": hour,
                "message_count": count,
                "percentage": (count / total_messages) * 100
            }
            for hour, count in hour_counts.most_common(3)
        ]
        
        return peak_times