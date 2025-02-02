import asyncio
from typing import Dict, List, Any
from datetime import datetime, timedelta
import json

class StreamController:
    def __init__(self, analyzer):
        self.analyzer = analyzer
        self.active_polls = []
        self.current_highlights = []
        self.update_interval = 30  # seconds
        self.last_update = datetime.now()
        self.cached_insights = {}

    async def process_messages(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """Process new messages and update all insights."""
        current_time = datetime.now()
        
        # Only update if enough time has passed or cache is empty
        if (current_time - self.last_update).seconds >= self.update_interval or not self.cached_insights:
            analysis = self.analyzer.process_new_messages(messages)
            
            # Update polls if needed
            self._update_polls(analysis['polls'])
            
            # Update highlights
            self._update_highlights(analysis['highlights'])
            
            # Get engagement metrics
            metrics = self.analyzer.get_engagement_metrics()
            
            # Combine all insights
            self.cached_insights = {
                "polls": self.active_polls,
                "qa": analysis['qa'],
                "sentiment": analysis['sentiment'],
                "highlights": self.current_highlights,
                "metrics": metrics
            }
            
            self.last_update = current_time
        
        return self.cached_insights

    def _update_polls(self, poll_suggestion: Dict[str, Any]) -> None:
        """Update active polls based on new suggestions."""
        if not poll_suggestion:
            return
            
        # Remove expired polls
        current_time = datetime.now()
        self.active_polls = [
            poll for poll in self.active_polls 
            if current_time - poll['created_at'] < timedelta(minutes=5)
        ]
        
        # Add new poll if it's relevant enough and we don't have too many active polls
        if (
            poll_suggestion.get('relevance_score', 0) > 70 
            and len(self.active_polls) < 2
        ):
            new_poll = {
                **poll_suggestion,
                'created_at': current_time,
                'votes': {},
                'id': len(self.active_polls)
            }
            self.active_polls.append(new_poll)

    def _update_highlights(self, new_highlights: List[Dict[str, str]]) -> None:
        """Update stream highlights."""
        # Keep only recent highlights
        current_time = datetime.now()
        self.current_highlights = [
            h for h in self.current_highlights 
            if current_time - h['timestamp'] < timedelta(minutes=30)
        ]
        
        # Add new highlights
        for highlight in new_highlights:
            if highlight not in self.current_highlights:
                self.current_highlights.append({
                    **highlight,
                    'timestamp': current_time
                })
        
        # Keep only the most recent highlights
        self.current_highlights = sorted(
            self.current_highlights,
            key=lambda x: x['timestamp'],
            reverse=True
        )[:10]

    def record_poll_vote(self, poll_id: int, option: str, user: str) -> Dict[str, Any]:
        """Record a vote for a poll option."""
        for poll in self.active_polls:
            if poll['id'] == poll_id:
                if user not in poll['votes']:
                    poll['votes'][user] = option
                    return {
                        'success': True,
                        'poll': poll
                    }
                return {
                    'success': False,
                    'error': 'User already voted'
                }
        return {
            'success': False,
            'error': 'Poll not found'
        }

    async def start_monitoring(self, message_queue):
        """Start monitoring chat messages."""
        while True:
            try:
                messages = await message_queue.get()
                insights = await self.process_messages(messages)
                
                # Here you would emit the insights to your frontend
                # For example, using websockets or server-sent events
                print("New insights generated:", json.dumps(insights, indent=2))
                
            except Exception as e:
                print(f"Error processing messages: {e}")
            
            await asyncio.sleep(self.update_interval)

def create_stream_controller(nebius_api_key: str):
    """Create and initialize a new stream controller."""
    from chat_analyzer import StreamChatAnalyzer
    
    analyzer = StreamChatAnalyzer(nebius_api_key)
    controller = StreamController(analyzer)
    
    return controller