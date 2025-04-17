# AI Prompt Engineering System

## Overview
This document outlines the AI prompt engineering system for the Rapid Consumer Sentiment Analysis service. The system is designed to create effective AI-moderated interviews that elicit meaningful emotional responses and gather rich qualitative data while maintaining a natural conversation flow. It also includes prompt engineering for the analysis phase to generate insightful and actionable recommendations.

## Interview Prompt Engineering

### Interview Structure Framework

The interview structure follows a carefully designed flow to maximize emotional engagement and insight generation:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Interview Flow Structure                         │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Introduction│      Rapport Building           │   Context Setting     │
│             │                                 │                       │
└─────┬───────┴──────────────┬──────────────────┴───────────┬───────────┘
      │                      │                              │
      ▼                      ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Core Interview Phases                            │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Experience  │      Emotional                  │   Behavioral          │
│ Exploration │      Deep Dive                  │   Investigation       │
└─────┬───────┴──────────────┬──────────────────┴───────────┬───────────┘
      │                      │                              │
      ▼                      ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Insight Generation                               │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Comparative │      Hypothetical               │   Reflective          │
│ Questions   │      Scenarios                  │   Synthesis           │
└─────┬───────┴──────────────┬──────────────────┴───────────┬───────────┘
      │                      │                              │
      ▼                      ▼                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        Conclusion                                       │
│                                                                         │
├─────────────┬─────────────────────────────────┬───────────────────────┤
│ Summary     │      Final Thoughts             │   Appreciation        │
│             │                                 │                       │
└─────────────┴─────────────────────────────────┴───────────────────────┘
```

### Base Interview Template

```javascript
// interview-template.js
const baseInterviewTemplate = {
  title: "Consumer Experience Interview",
  description: "This interview explores your experiences, feelings, and thoughts about [PRODUCT_CATEGORY].",
  settings: {
    language: "en",
    maxDuration: 300, // 5 minutes
    aiModeration: true,
    emotionDetection: true
  },
  sections: [
    {
      id: "introduction",
      title: "Introduction",
      description: "Setting the stage for a comfortable conversation",
      questions: [
        {
          id: "intro_welcome",
          text: "Hi there! Thank you for taking the time to share your thoughts with us today. I'd like to have a conversation about your experiences with [PRODUCT_CATEGORY]. This is a casual conversation, so please feel free to express yourself naturally. Could you start by telling me a little bit about yourself?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Thanks for sharing that. It's great to get to know you a bit.",
            encouragement: "Don't worry about giving the 'right' answer - I'm interested in your genuine thoughts and feelings."
          }
        }
      ]
    },
    {
      id: "rapport_building",
      title: "Rapport Building",
      description: "Establishing comfort and trust",
      questions: [
        {
          id: "rapport_general",
          text: "Before we dive into [PRODUCT_CATEGORY] specifically, could you tell me about your typical day and how [PRODUCT_CATEGORY] might fit into it?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's interesting. It helps me understand your daily context better.",
            encouragement: "Feel free to share as much detail as you're comfortable with."
          }
        }
      ]
    },
    {
      id: "context_setting",
      title: "Context Setting",
      description: "Understanding the consumer's relationship with the product category",
      questions: [
        {
          id: "context_history",
          text: "How long have you been using products in the [PRODUCT_CATEGORY] category? What got you started?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Thanks for sharing your history with [PRODUCT_CATEGORY].",
            encouragement: "I'd love to hear more about what initially attracted you to these products."
          }
        },
        {
          id: "context_importance",
          text: "On a scale of 1-10, how important would you say [PRODUCT_CATEGORY] is in your life? Could you explain why you chose that number?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's helpful to understand how [PRODUCT_CATEGORY] fits into your priorities.",
            encouragement: "The 'why' behind your rating is what's most valuable to us."
          }
        }
      ]
    },
    {
      id: "experience_exploration",
      title: "Experience Exploration",
      description: "Exploring specific experiences with the product category",
      questions: [
        {
          id: "experience_recent",
          text: "Could you walk me through your most recent experience with [PRODUCT_CATEGORY]? What were you doing, and what was going through your mind?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Thank you for sharing that experience in such detail.",
            encouragement: "Try to recall the specific moments and what you were thinking and feeling at each step."
          }
        },
        {
          id: "experience_best",
          text: "Now, think about the best experience you've ever had with [PRODUCT_CATEGORY]. What made it so positive?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That sounds like a really positive experience.",
            encouragement: "What specific elements made this stand out compared to other experiences?"
          }
        },
        {
          id: "experience_worst",
          text: "And what about a disappointing or frustrating experience with [PRODUCT_CATEGORY]? What happened and how did it make you feel?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "I appreciate you sharing that difficult experience.",
            encouragement: "Don't hold back - understanding pain points is incredibly valuable."
          }
        }
      ]
    },
    {
      id: "emotional_deep_dive",
      title: "Emotional Deep Dive",
      description: "Exploring emotional connections with the product category",
      questions: [
        {
          id: "emotional_words",
          text: "If you had to describe your feelings about [PRODUCT_CATEGORY] in three emotional words, what would they be and why?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Those are interesting emotional words to choose.",
            encouragement: "Take a moment to really connect with how [PRODUCT_CATEGORY] makes you feel emotionally."
          }
        },
        {
          id: "emotional_changes",
          text: "How have your feelings about [PRODUCT_CATEGORY] changed over time? Was there a specific moment that shifted your perspective?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "It's fascinating how our relationships with products evolve over time.",
            encouragement: "Think about whether there was a specific moment or gradual change in how you felt."
          }
        },
        {
          id: "emotional_surprise",
          text: "What's something about [PRODUCT_CATEGORY] that surprised you or challenged your expectations?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's an interesting observation about how your expectations were challenged.",
            encouragement: "Surprises - whether positive or negative - often reveal our underlying assumptions."
          }
        }
      ]
    },
    {
      id: "behavioral_investigation",
      title: "Behavioral Investigation",
      description: "Understanding behaviors and decision-making around the product category",
      questions: [
        {
          id: "behavioral_decision",
          text: "Walk me through how you typically decide which [PRODUCT_CATEGORY] to purchase. What factors matter most to you?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That gives me good insight into your decision process.",
            encouragement: "Try to recall your actual thought process during a recent purchase decision."
          }
        },
        {
          id: "behavioral_alternatives",
          text: "Have you ever considered alternatives to [PRODUCT_CATEGORY]? What keeps you using these products versus alternatives?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "It's helpful to understand what keeps you loyal to this category.",
            encouragement: "Feel free to be honest about what might tempt you away from this category."
          }
        },
        {
          id: "behavioral_influence",
          text: "Who or what influences your choices about [PRODUCT_CATEGORY]? This could be people, media, or other factors.",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Those influences make a lot of sense.",
            encouragement: "Sometimes we're influenced in ways we don't immediately recognize - take a moment to think broadly."
          }
        }
      ]
    },
    {
      id: "comparative_questions",
      title: "Comparative Questions",
      description: "Exploring preferences and comparisons",
      questions: [
        {
          id: "comparative_brands",
          text: "If you use different brands within [PRODUCT_CATEGORY], how would you compare them emotionally? What feelings do different brands evoke?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's a nuanced comparison of how different brands make you feel.",
            encouragement: "Try to articulate the subtle emotional differences between brands you've experienced."
          }
        },
        {
          id: "comparative_evolution",
          text: "How do you feel [PRODUCT_CATEGORY] has evolved over the years? Are these changes aligned with your needs and preferences?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Your perspective on how the category has evolved is valuable.",
            encouragement: "Consider both positive evolutions and changes that perhaps weren't as welcome."
          }
        }
      ]
    },
    {
      id: "hypothetical_scenarios",
      title: "Hypothetical Scenarios",
      description: "Exploring reactions to potential scenarios",
      questions: [
        {
          id: "hypothetical_improvement",
          text: "If you could wave a magic wand and improve one thing about [PRODUCT_CATEGORY], what would it be and why?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's a thoughtful improvement that would make a real difference.",
            encouragement: "Don't worry about what's technically possible - focus on what would truly delight you."
          }
        },
        {
          id: "hypothetical_future",
          text: "Imagine [PRODUCT_CATEGORY] five years from now. How do you hope it will have changed? How do you fear it might change?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Your vision of the future highlights some important considerations.",
            encouragement: "Both your hopes and fears can reveal what you truly value about this category."
          }
        }
      ]
    },
    {
      id: "reflective_synthesis",
      title: "Reflective Synthesis",
      description: "Bringing together thoughts and feelings",
      questions: [
        {
          id: "reflective_relationship",
          text: "If your relationship with [PRODUCT_CATEGORY] was a relationship with a person, how would you describe it? Is it a close friend, an acquaintance, a complicated relationship?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's a revealing metaphor for your relationship with this category.",
            encouragement: "Metaphors often help us express complex feelings that are hard to put into direct words."
          }
        },
        {
          id: "reflective_advice",
          text: "If you were giving advice to someone new to [PRODUCT_CATEGORY], what would you tell them based on your emotional journey with these products?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "That's advice that comes from real experience and wisdom.",
            encouragement: "Think about what you wish someone had told you when you were first exploring this category."
          }
        }
      ]
    },
    {
      id: "conclusion",
      title: "Conclusion",
      description: "Wrapping up the conversation",
      questions: [
        {
          id: "conclusion_missed",
          text: "Is there anything important about your experience with [PRODUCT_CATEGORY] that we haven't covered that you'd like to share?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Thank you for adding those additional thoughts.",
            encouragement: "This is your chance to share anything that's been on your mind that we haven't touched on."
          }
        },
        {
          id: "conclusion_thanks",
          text: "Thank you so much for sharing your experiences and feelings with me today. Your insights are incredibly valuable and will help shape the future of [PRODUCT_CATEGORY]. Is there anything you'd like to ask me before we wrap up?",
          type: "open",
          required: true,
          aiModeration: {
            followUp: "Thank you again for your time and thoughtful responses.",
            encouragement: "I appreciate how open you've been throughout our conversation."
          }
        }
      ]
    }
  ]
};

module.exports = baseInterviewTemplate;
```

### Dynamic Question Generation System

```javascript
// dynamic-question-generator.js
const { OpenAI } = require('openai');
const baseInterviewTemplate = require('./interview-template');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate dynamic interview questions based on project context and product category
 */
async function generateDynamicInterview(projectData) {
  try {
    logger.info(`Generating dynamic interview for project: ${projectData.id}`);
    
    // Clone the base template
    const interviewTemplate = JSON.parse(JSON.stringify(baseInterviewTemplate));
    
    // Replace placeholders with actual product category
    const productCategory = projectData.productCategory;
    interviewTemplate.title = `Consumer Experience Interview: ${productCategory}`;
    interviewTemplate.description = `This interview explores your experiences, feelings, and thoughts about ${productCategory}.`;
    
    // Replace all instances of [PRODUCT_CATEGORY] in questions
    interviewTemplate.sections.forEach(section => {
      section.questions.forEach(question => {
        question.text = question.text.replace(/\[PRODUCT_CATEGORY\]/g, productCategory);
        
        if (question.aiModeration) {
          question.aiModeration.followUp = question.aiModeration.followUp.replace(/\[PRODUCT_CATEGORY\]/g, productCategory);
          question.aiModeration.encouragement = question.aiModeration.encouragement.replace(/\[PRODUCT_CATEGORY\]/g, productCategory);
        }
      });
    });
    
    // Generate additional category-specific questions
    const categorySpecificQuestions = await generateCategorySpecificQuestions(
      productCategory,
      projectData.objectives,
      projectData.targetAudience
    );
    
    // Insert category-specific questions into appropriate sections
    if (categorySpecificQuestions.experienceQuestions.length > 0) {
      const experienceSection = interviewTemplate.sections.find(s => s.id === 'experience_exploration');
      experienceSection.questions = experienceSection.questions.concat(categorySpecificQuestions.experienceQuestions);
    }
    
    if (categorySpecificQuestions.emotionalQuestions.length > 0) {
      const emotionalSection = interviewTemplate.sections.find(s => s.id === 'emotional_deep_dive');
      emotionalSection.questions = emotionalSection.questions.concat(categorySpecificQuestions.emotionalQuestions);
    }
    
    if (categorySpecificQuestions.behavioralQuestions.length > 0) {
      const behavioralSection = interviewTemplate.sections.find(s => s.id === 'behavioral_investigation');
      behavioralSection.questions = behavioralSection.questions.concat(categorySpecificQuestions.behavioralQuestions);
    }
    
    // Update question IDs to ensure uniqueness
    interviewTemplate.sections.forEach(section => {
      section.questions.forEach((question, index) => {
        question.id = `${section.id}_q${index + 1}`;
      });
    });
    
    return interviewTemplate;
  } catch (error) {
    logger.error(`Error generating dynamic interview: ${error.message}`);
    throw error;
  }
}

/**
 * Generate category-specific questions using LLM
 */
async function generateCategorySpecificQuestions(productCategory, objectives, targetAudience) {
  try {
    logger.info(`Generating category-specific questions for: ${productCategory}`);
    
    const prompt = `
      You are an expert in consumer research and emotional intelligence. I need you to create additional interview questions for a qualitative research study about ${productCategory}.

      Project Objectives: ${objectives}
      Target Audience: ${targetAudience}
      
      Please generate 6 additional questions that will help uncover deep emotional insights about ${productCategory}:
      
      1. Two questions for the "Experience Exploration" section that explore specific experiences with ${productCategory} that might be unique to this category.
      2. Two questions for the "Emotional Deep Dive" section that explore emotional connections specific to ${productCategory}.
      3. Two questions for the "Behavioral Investigation" section that explore behaviors and decision-making specific to ${productCategory}.
      
      For each question, also provide:
      - A follow-up comment the AI moderator can use to acknowledge the response
      - An encouragement the AI moderator can use if the respondent needs prompting
      
      Format your response as a JSON object with this structure:
      {
        "experienceQuestions": [
          {
            "text": "Question text here",
            "aiModeration": {
              "followUp": "Follow-up comment here",
              "encouragement": "Encouragement here"
            }
          }
        ],
        "emotionalQuestions": [
          {
            "text": "Question text here",
            "aiModeration": {
              "followUp": "Follow-up comment here",
              "encouragement": "Encouragement here"
            }
          }
        ],
        "behavioralQuestions": [
          {
            "text": "Question text here",
            "aiModeration": {
              "followUp": "Follow-up comment here",
              "encouragement": "Encouragement here"
            }
          }
        ]
      }
      
      Make sure the questions are open-ended, emotionally evocative, and specific to ${productCategory}. Avoid generic questions that could apply to any product category.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in consumer research and emotional intelligence." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    // Add required fields to each question
    const addRequiredFields = questions => {
      return questions.map(q => ({
        ...q,
        type: "open",
        required: true
      }));
    };
    
    return {
      experienceQuestions: addRequiredFields(result.experienceQuestions),
      emotionalQuestions: addRequiredFields(result.emotionalQuestions),
      behavioralQuestions: addRequiredFields(result.behavioralQuestions)
    };
  } catch (error) {
    logger.error(`Error generating category-specific questions: ${error.message}`);
    return {
      experienceQuestions: [],
      emotionalQuestions: [],
      behavioralQuestions: []
    };
  }
}

module.exports = {
  generateDynamicInterview,
  generateCategorySpecificQuestions
};
```

### AI Moderation System

```javascript
// ai-moderation-system.js
const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate AI moderation response based on user's answer
 */
async function generateModerationResponse(question, answer, interviewContext) {
  try {
    logger.info(`Generating moderation response for question: ${question.id}`);
    
    // If the answer is too short, use the default encouragement
    if (answer.length < 20) {
      return {
        response: question.aiModeration.encouragement,
        followUpQuestion: null
      };
    }
    
    // Extract relevant context
    const productCategory = interviewContext.productCategory;
    const previousAnswers = interviewContext.previousAnswers || [];
    const currentSectionId = question.sectionId;
    
    // Create a context summary from previous answers
    const contextSummary = createContextSummary(previousAnswers);
    
    const prompt = `
      You are an empathetic AI interviewer conducting a qualitative research interview about ${productCategory}. Your goal is to help the respondent share deep, emotionally rich insights.

      Current question: "${question.text}"
      
      Respondent's answer: "${answer}"
      
      Previous context: ${contextSummary}
      
      Based on this response, generate:
      1. A brief, empathetic acknowledgment of what they shared (1-2 sentences)
      2. A natural follow-up question that digs deeper into their emotional response or asks for more specific details about something they mentioned (if appropriate)
      
      Your response should feel conversational and natural, not scripted. If their answer was thorough and emotionally rich, you might not need a follow-up question.
      
      Format your response as a JSON object:
      {
        "acknowledgment": "Your empathetic acknowledgment here",
        "followUpQuestion": "Your follow-up question here or null if not needed"
      }
      
      Keep the acknowledgment under 150 characters and the follow-up question (if any) under 200 characters.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an empathetic AI interviewer with expertise in qualitative research." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      response: result.acknowledgment,
      followUpQuestion: result.followUpQuestion
    };
  } catch (error) {
    logger.error(`Error generating moderation response: ${error.message}`);
    
    // Fallback to default response
    return {
      response: question.aiModeration.followUp,
      followUpQuestion: null
    };
  }
}

/**
 * Create a summary of previous answers for context
 */
function createContextSummary(previousAnswers) {
  if (!previousAnswers || previousAnswers.length === 0) {
    return "No previous context available.";
  }
  
  // Only use the last 3 answers for context
  const recentAnswers = previousAnswers.slice(-3);
  
  return recentAnswers.map(a => 
    `Question: "${a.question}"\nAnswer: "${truncateText(a.answer, 100)}"`
  ).join("\n\n");
}

/**
 * Truncate text to a maximum length
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + "...";
}

module.exports = {
  generateModerationResponse
};
```

## Analysis Prompt Engineering

### Emotion Analysis Prompt System

```javascript
// emotion-analysis-prompts.js
const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate enhanced emotion analysis by combining Hume AI results with LLM analysis
 */
async function enhanceEmotionAnalysis(humeResults, transcription) {
  try {
    logger.info('Enhancing emotion analysis with LLM');
    
    // Extract emotion segments from Hume results
    const emotionSegments = humeResults.emotions || [];
    
    // Create a summary of the emotion data
    const emotionSummary = createEmotionSummary(emotionSegments);
    
    const prompt = `
      You are an expert in emotional analysis and consumer psychology. I have data from an advanced voice emotion recognition system that analyzed a consumer interview about a product or service. I need you to enhance this analysis with deeper psychological insights.

      Emotion data from voice analysis:
      ${JSON.stringify(emotionSummary, null, 2)}
      
      Interview transcription:
      ${transcription}
      
      Please analyze this data and provide:
      
      1. Emotional Journey: A narrative description of how the respondent's emotions evolved throughout the interview
      2. Emotional Triggers: Identify specific topics or moments that triggered strong emotional responses
      3. Emotional Patterns: Identify any recurring emotional patterns or contradictions
      4. Underlying Motivations: Based on the emotional responses, what might be the deeper psychological needs or motivations
      5. Authenticity Assessment: Evaluate how genuine the emotional responses seem to be
      
      Format your response as a JSON object with this structure:
      {
        "emotionalJourney": "Narrative description here",
        "emotionalTriggers": [
          {
            "trigger": "Topic or moment that triggered emotion",
            "emotions": ["Emotion1", "Emotion2"],
            "intensity": "High/Medium/Low",
            "transcript": "Relevant portion of transcript"
          }
        ],
        "emotionalPatterns": [
          {
            "pattern": "Description of pattern",
            "significance": "Why this pattern matters"
          }
        ],
        "underlyingMotivations": [
          {
            "motivation": "Description of motivation",
            "supportingEvidence": "Evidence from emotional data"
          }
        ],
        "authenticityAssessment": {
          "overall": "High/Medium/Low",
          "observations": ["Observation 1", "Observation 2"]
        }
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in emotional analysis and consumer psychology." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error(`Error enhancing emotion analysis: ${error.message}`);
    throw error;
  }
}

/**
 * Create a summary of emotion data for the prompt
 */
function createEmotionSummary(emotionSegments) {
  // Calculate overall emotion distribution
  const emotionCounts = {};
  const emotionScores = {};
  
  emotionSegments.forEach(segment => {
    Object.entries(segment.emotions).forEach(([emotion, score]) => {
      if (!emotionCounts[emotion]) {
        emotionCounts[emotion] = 0;
        emotionScores[emotion] = 0;
      }
      
      emotionCounts[emotion]++;
      emotionScores[emotion] += score;
    });
  });
  
  // Calculate average scores
  const emotionDistribution = {};
  Object.entries(emotionScores).forEach(([emotion, totalScore]) => {
    emotionDistribution[emotion] = totalScore / emotionCounts[emotion];
  });
  
  // Get predominant emotions (top 5)
  const predominantEmotions = Object.entries(emotionDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([emotion, score]) => ({
      emotion,
      score
    }));
  
  // Create emotional journey (simplified)
  const emotionalJourney = emotionSegments.map((segment, index) => {
    // Find the strongest emotion in this segment
    const strongestEmotion = Object.entries(segment.emotions)
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      timepoint: index,
      startTime: segment.startTime,
      endTime: segment.endTime,
      primaryEmotion: strongestEmotion ? strongestEmotion[0] : 'neutral',
      primaryScore: strongestEmotion ? strongestEmotion[1] : 0,
      allEmotions: segment.emotions
    };
  });
  
  // Find emotional shifts
  const emotionalShifts = [];
  for (let i = 1; i < emotionalJourney.length; i++) {
    const current = emotionalJourney[i];
    const previous = emotionalJourney[i-1];
    
    if (current.primaryEmotion !== previous.primaryEmotion) {
      emotionalShifts.push({
        timepoint: i,
        from: previous.primaryEmotion,
        to: current.primaryEmotion,
        startTime: current.startTime
      });
    }
  }
  
  return {
    predominantEmotions,
    emotionDistribution,
    emotionalJourney: emotionalJourney.slice(0, 10), // Limit to first 10 for brevity
    emotionalShifts
  };
}

module.exports = {
  enhanceEmotionAnalysis
};
```

### Language Analysis Prompt System

```javascript
// language-analysis-prompts.js
const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate comprehensive language analysis from interview transcription
 */
async function generateLanguageAnalysis(transcription, productCategory) {
  try {
    logger.info('Generating language analysis');
    
    const prompt = `
      You are an expert in consumer linguistics and sentiment analysis. I have a transcription from a consumer interview about ${productCategory}. I need you to perform a comprehensive language analysis to uncover insights about the consumer's relationship with this product category.

      Interview transcription:
      ${transcription}
      
      Please analyze this transcription and provide:
      
      1. Key Themes: Identify the main themes discussed in the interview
      2. Sentiment Analysis: Analyze the overall sentiment and how it varies by topic
      3. Language Patterns: Identify notable language patterns (metaphors, repeated phrases, etc.)
      4. Implicit Needs: Uncover unstated needs or desires based on language used
      5. Contradictions: Identify any contradictions or inconsistencies in the responses
      6. Brand Perceptions: Extract perceptions of specific brands mentioned
      7. Decision Factors: Identify factors that influence purchase decisions
      
      Format your response as a JSON object with this structure:
      {
        "keyThemes": [
          {
            "theme": "Theme name",
            "description": "Description of theme",
            "quotes": ["Quote 1", "Quote 2"],
            "sentiment": "Positive/Negative/Neutral"
          }
        ],
        "sentimentAnalysis": {
          "overall": "Positive/Negative/Neutral",
          "score": 0.5, // -1.0 to 1.0
          "byTopic": [
            {
              "topic": "Topic name",
              "sentiment": "Positive/Negative/Neutral",
              "score": 0.5
            }
          ]
        },
        "languagePatterns": [
          {
            "pattern": "Pattern description",
            "examples": ["Example 1", "Example 2"],
            "significance": "Why this pattern matters"
          }
        ],
        "implicitNeeds": [
          {
            "need": "Description of need",
            "evidence": "Evidence from language",
            "confidence": "High/Medium/Low"
          }
        ],
        "contradictions": [
          {
            "description": "Description of contradiction",
            "statement1": "First statement",
            "statement2": "Contradicting statement"
          }
        ],
        "brandPerceptions": [
          {
            "brand": "Brand name",
            "perceptions": ["Perception 1", "Perception 2"],
            "sentiment": "Positive/Negative/Neutral",
            "quotes": ["Quote 1", "Quote 2"]
          }
        ],
        "decisionFactors": [
          {
            "factor": "Factor name",
            "importance": "High/Medium/Low",
            "quotes": ["Quote 1", "Quote 2"]
          }
        ]
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in consumer linguistics and sentiment analysis." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error(`Error generating language analysis: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateLanguageAnalysis
};
```

### Insight Generation Prompt System

```javascript
// insight-generation-prompts.js
const { OpenAI } = require('openai');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generate comprehensive insights by combining emotion and language analysis
 */
async function generateComprehensiveInsights(emotionAnalysis, languageAnalysis, projectContext) {
  try {
    logger.info('Generating comprehensive insights');
    
    const prompt = `
      You are an expert consumer insights analyst with deep expertise in emotional intelligence and consumer behavior. I have data from a comprehensive analysis of a consumer interview about ${projectContext.productCategory}, including both emotion analysis from voice and language analysis from transcription.

      Project Context:
      ${JSON.stringify(projectContext, null, 2)}
      
      Emotion Analysis:
      ${JSON.stringify(emotionAnalysis, null, 2)}
      
      Language Analysis:
      ${JSON.stringify(languageAnalysis, null, 2)}
      
      Please synthesize this data to generate comprehensive insights and actionable recommendations. Include:
      
      1. Key Insights: The most important findings from combining emotion and language data
      2. Emotional Drivers: What emotions are driving consumer behavior and why
      3. Unmet Needs: Identify unmet needs based on both explicit statements and emotional responses
      4. Opportunity Areas: Specific opportunities for innovation or improvement
      5. Recommendations: Actionable recommendations based on the insights
      6. Priority Areas: Areas that require immediate attention
      
      Format your response as a JSON object with this structure:
      {
        "keyInsights": [
          {
            "title": "Insight title",
            "description": "Detailed description of the insight",
            "supportingData": "Reference to the data that supports this insight",
            "importance": "high/medium/low"
          }
        ],
        "emotionalDrivers": [
          {
            "emotion": "Emotion name",
            "description": "Description of how this emotion influences behavior",
            "triggers": ["Trigger 1", "Trigger 2"],
            "implications": "What this means for the brand"
          }
        ],
        "unmetNeeds": [
          {
            "need": "Description of unmet need",
            "evidence": {
              "emotional": "Evidence from emotional data",
              "linguistic": "Evidence from language data"
            },
            "opportunity": "How this need could be addressed"
          }
        ],
        "opportunityAreas": [
          {
            "area": "Opportunity area name",
            "description": "Description of the opportunity",
            "potentialImpact": "high/medium/low",
            "implementationComplexity": "high/medium/low"
          }
        ],
        "recommendations": [
          {
            "title": "Recommendation title",
            "description": "Detailed description of the recommendation",
            "rationale": "Why this recommendation is important",
            "implementation": "How to implement this recommendation",
            "priority": "high/medium/low"
          }
        ],
        "priorityAreas": [
          {
            "area": "Area name",
            "reason": "Why this area needs immediate attention",
            "potentialImpact": "The potential impact of addressing this area"
          }
        ]
      }
      
      Make your insights specific, actionable, and directly tied to the data. Avoid generic insights that could apply to any product category.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert consumer insights analyst with deep expertise in emotional intelligence and consumer behavior." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error(`Error generating comprehensive insights: ${error.message}`);
    throw error;
  }
}

/**
 * Generate executive summary from comprehensive insights
 */
async function generateExecutiveSummary(insights, projectContext) {
  try {
    logger.info('Generating executive summary');
    
    const prompt = `
      You are an expert consumer insights analyst presenting findings to senior executives. I have comprehensive insights from a consumer interview analysis about ${projectContext.productCategory}.

      Project Context:
      ${JSON.stringify(projectContext, null, 2)}
      
      Comprehensive Insights:
      ${JSON.stringify(insights, null, 2)}
      
      Please create a concise executive summary that highlights the most important findings and recommendations. The summary should be strategic, business-focused, and actionable. It should help executives quickly understand the key takeaways and their business implications.
      
      Format your response as a JSON object with this structure:
      {
        "summary": "A 2-3 paragraph executive summary",
        "keyTakeaways": [
          {
            "title": "Takeaway title",
            "description": "Brief description"
          }
        ],
        "strategicImplications": [
          {
            "implication": "Strategic implication",
            "businessImpact": "Description of business impact"
          }
        ],
        "topRecommendations": [
          {
            "recommendation": "Recommendation title",
            "rationale": "Brief rationale",
            "priority": "high/medium/low"
          }
        ]
      }
      
      Keep the executive summary under 500 words total, with each section being concise and impactful.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert consumer insights analyst presenting findings to senior executives." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error(`Error generating executive summary: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateComprehensiveInsights,
  generateExecutiveSummary
};
```

## Prompt Management System

### Prompt Template Manager

```javascript
// prompt-template-manager.js
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class PromptTemplateManager {
  constructor(templatesDir) {
    this.templatesDir = templatesDir;
    this.templates = {};
    this.initialized = false;
  }
  
  /**
   * Initialize the template manager by loading all templates
   */
  async initialize() {
    try {
      logger.info(`Initializing prompt template manager from ${this.templatesDir}`);
      
      // Read all template files
      const files = await fs.readdir(this.templatesDir);
      const templateFiles = files.filter(file => file.endsWith('.json'));
      
      // Load each template
      for (const file of templateFiles) {
        const templateName = path.basename(file, '.json');
        const templatePath = path.join(this.templatesDir, file);
        const templateContent = await fs.readFile(templatePath, 'utf8');
        
        this.templates[templateName] = JSON.parse(templateContent);
        logger.info(`Loaded template: ${templateName}`);
      }
      
      this.initialized = true;
      logger.info(`Prompt template manager initialized with ${Object.keys(this.templates).length} templates`);
      
      return true;
    } catch (error) {
      logger.error(`Error initializing prompt template manager: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get a template by name
   */
  getTemplate(templateName) {
    if (!this.initialized) {
      throw new Error('Prompt template manager not initialized');
    }
    
    const template = this.templates[templateName];
    
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    return JSON.parse(JSON.stringify(template)); // Return a deep copy
  }
  
  /**
   * Fill a template with variables
   */
  fillTemplate(templateName, variables) {
    const template = this.getTemplate(templateName);
    
    // Convert template to string for variable replacement
    const templateString = JSON.stringify(template);
    
    // Replace all variables
    const filledTemplateString = templateString.replace(
      /\{\{(\w+)\}\}/g,
      (match, variable) => {
        if (variables[variable] === undefined) {
          logger.warn(`Variable not provided for template: ${variable}`);
          return match; // Keep the placeholder if variable not provided
        }
        
        return variables[variable];
      }
    );
    
    // Parse back to object
    return JSON.parse(filledTemplateString);
  }
  
  /**
   * Save a new template
   */
  async saveTemplate(templateName, template) {
    try {
      logger.info(`Saving template: ${templateName}`);
      
      const templatePath = path.join(this.templatesDir, `${templateName}.json`);
      await fs.writeFile(templatePath, JSON.stringify(template, null, 2));
      
      // Update in-memory template
      this.templates[templateName] = template;
      
      return true;
    } catch (error) {
      logger.error(`Error saving template: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Update an existing template
   */
  async updateTemplate(templateName, template) {
    if (!this.templates[templateName]) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    return this.saveTemplate(templateName, template);
  }
  
  /**
   * Delete a template
   */
  async deleteTemplate(templateName) {
    try {
      logger.info(`Deleting template: ${templateName}`);
      
      if (!this.templates[templateName]) {
        throw new Error(`Template not found: ${templateName}`);
      }
      
      const templatePath = path.join(this.templatesDir, `${templateName}.json`);
      await fs.unlink(templatePath);
      
      // Remove from in-memory templates
      delete this.templates[templateName];
      
      return true;
    } catch (error) {
      logger.error(`Error deleting template: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * List all available templates
   */
  listTemplates() {
    return Object.keys(this.templates);
  }
}

// Create a singleton instance
const templateManager = new PromptTemplateManager(
  process.env.TEMPLATES_DIR || path.join(__dirname, '../templates')
);

module.exports = templateManager;
```

### Prompt Performance Tracker

```javascript
// prompt-performance-tracker.js
const { createRecord, queryRecords, updateRecord } = require('../services/airtable.service');
const { TABLES } = require('../config/airtable.config');
const logger = require('../utils/logger');

/**
 * Track prompt performance
 */
async function trackPromptPerformance(data) {
  try {
    logger.info(`Tracking prompt performance for ${data.promptType}`);
    
    // Create performance record
    const record = await createRecord(TABLES.PROMPT_PERFORMANCE, {
      promptType: data.promptType,
      promptId: data.promptId,
      promptTemplate: data.promptTemplate,
      variables: JSON.stringify(data.variables || {}),
      responseQuality: data.responseQuality,
      processingTime: data.processingTime,
      tokenCount: data.tokenCount,
      modelUsed: data.modelUsed,
      timestamp: new Date().toISOString()
    });
    
    // Update prompt statistics
    await updatePromptStatistics(data.promptType);
    
    return record;
  } catch (error) {
    logger.error(`Error tracking prompt performance: ${error.message}`);
    // Don't throw error to avoid disrupting main flow
    return null;
  }
}

/**
 * Update prompt statistics
 */
async function updatePromptStatistics(promptType) {
  try {
    // Get all performance records for this prompt type
    const records = await queryRecords(
      TABLES.PROMPT_PERFORMANCE,
      `{promptType} = "${promptType}"`,
      [{ field: 'timestamp', direction: 'desc' }]
    );
    
    if (records.length === 0) {
      return null;
    }
    
    // Calculate statistics
    const totalRecords = records.length;
    
    // Calculate average response quality
    const qualitySum = records.reduce((sum, record) => sum + (record.responseQuality || 0), 0);
    const averageQuality = qualitySum / totalRecords;
    
    // Calculate average processing time
    const timeSum = records.reduce((sum, record) => sum + (record.processingTime || 0), 0);
    const averageTime = timeSum / totalRecords;
    
    // Calculate average token count
    const tokenSum = records.reduce((sum, record) => sum + (record.tokenCount || 0), 0);
    const averageTokens = tokenSum / totalRecords;
    
    // Get existing statistics record or create new one
    const existingStats = await queryRecords(
      TABLES.PROMPT_STATISTICS,
      `{promptType} = "${promptType}"`
    );
    
    if (existingStats.length > 0) {
      // Update existing record
      await updateRecord(TABLES.PROMPT_STATISTICS, existingStats[0].id, {
        totalUses: totalRecords,
        averageQuality: averageQuality,
        averageProcessingTime: averageTime,
        averageTokenCount: averageTokens,
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Create new record
      await createRecord(TABLES.PROMPT_STATISTICS, {
        promptType: promptType,
        totalUses: totalRecords,
        averageQuality: averageQuality,
        averageProcessingTime: averageTime,
        averageTokenCount: averageTokens,
        lastUpdated: new Date().toISOString()
      });
    }
    
    return true;
  } catch (error) {
    logger.error(`Error updating prompt statistics: ${error.message}`);
    return null;
  }
}

/**
 * Get prompt performance statistics
 */
async function getPromptStatistics(promptType = null) {
  try {
    let filterFormula = '';
    
    if (promptType) {
      filterFormula = `{promptType} = "${promptType}"`;
    }
    
    const statistics = await queryRecords(
      TABLES.PROMPT_STATISTICS,
      filterFormula,
      [{ field: 'totalUses', direction: 'desc' }]
    );
    
    return statistics;
  } catch (error) {
    logger.error(`Error getting prompt statistics: ${error.message}`);
    throw error;
  }
}

/**
 * Get recent prompt performances
 */
async function getRecentPromptPerformances(promptType = null, limit = 10) {
  try {
    let filterFormula = '';
    
    if (promptType) {
      filterFormula = `{promptType} = "${promptType}"`;
    }
    
    const performances = await queryRecords(
      TABLES.PROMPT_PERFORMANCE,
      filterFormula,
      [{ field: 'timestamp', direction: 'desc' }]
    );
    
    return performances.slice(0, limit);
  } catch (error) {
    logger.error(`Error getting recent prompt performances: ${error.message}`);
    throw error;
  }
}

module.exports = {
  trackPromptPerformance,
  getPromptStatistics,
  getRecentPromptPerformances
};
```

### Prompt Optimization System

```javascript
// prompt-optimization-system.js
const { OpenAI } = require('openai');
const templateManager = require('./prompt-template-manager');
const { trackPromptPerformance, getPromptStatistics } = require('./prompt-performance-tracker');
const logger = require('../utils/logger');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Optimize a prompt template based on performance data
 */
async function optimizePromptTemplate(promptType) {
  try {
    logger.info(`Optimizing prompt template for ${promptType}`);
    
    // Get current template
    const currentTemplate = templateManager.getTemplate(promptType);
    
    // Get performance statistics
    const statistics = await getPromptStatistics(promptType);
    
    if (statistics.length === 0) {
      logger.warn(`No performance data available for ${promptType}`);
      return null;
    }
    
    const stats = statistics[0];
    
    // Only optimize if performance is below threshold
    if (stats.averageQuality > 0.8) {
      logger.info(`Prompt performance is already good (${stats.averageQuality}), skipping optimization`);
      return currentTemplate;
    }
    
    // Get recent performances for analysis
    const recentPerformances = await getRecentPromptPerformances(promptType, 20);
    
    // Generate optimization suggestions
    const optimizationSuggestions = await generateOptimizationSuggestions(
      promptType,
      currentTemplate,
      stats,
      recentPerformances
    );
    
    // Apply suggestions to create new template
    const optimizedTemplate = applyOptimizationSuggestions(
      currentTemplate,
      optimizationSuggestions
    );
    
    // Save new template with version suffix
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const newTemplateName = `${promptType}_optimized_${timestamp}`;
    
    await templateManager.saveTemplate(newTemplateName, optimizedTemplate);
    
    return {
      originalTemplate: currentTemplate,
      optimizedTemplate: optimizedTemplate,
      newTemplateName: newTemplateName,
      suggestions: optimizationSuggestions
    };
  } catch (error) {
    logger.error(`Error optimizing prompt template: ${error.message}`);
    throw error;
  }
}

/**
 * Generate optimization suggestions using LLM
 */
async function generateOptimizationSuggestions(promptType, currentTemplate, stats, recentPerformances) {
  try {
    logger.info(`Generating optimization suggestions for ${promptType}`);
    
    // Extract examples of good and poor performances
    const goodPerformances = recentPerformances
      .filter(p => p.responseQuality >= 0.7)
      .slice(0, 3);
      
    const poorPerformances = recentPerformances
      .filter(p => p.responseQuality < 0.7)
      .slice(0, 3);
    
    const prompt = `
      You are an expert in prompt engineering and optimization. I need your help to improve a prompt template that is used for ${promptType} in our consumer research system.

      Current template:
      ${JSON.stringify(currentTemplate, null, 2)}
      
      Performance statistics:
      - Average quality rating: ${stats.averageQuality} (target: > 0.8)
      - Average processing time: ${stats.averageProcessingTime}ms
      - Average token count: ${stats.averageTokenCount}
      - Total uses: ${stats.totalUses}
      
      Examples of good performances:
      ${JSON.stringify(goodPerformances, null, 2)}
      
      Examples of poor performances:
      ${JSON.stringify(poorPerformances, null, 2)}
      
      Please analyze the current template and performance data, and suggest specific improvements to make the prompt more effective. Consider:
      
      1. Clarity: Is the prompt clear and unambiguous?
      2. Structure: Is the prompt structured effectively?
      3. Examples: Are examples helpful and relevant?
      4. Constraints: Are constraints clearly defined?
      5. Output format: Is the requested output format clear?
      
      Format your response as a JSON object with this structure:
      {
        "analysis": "Your analysis of the current template and its performance",
        "suggestions": [
          {
            "type": "addition/modification/removal",
            "location": "Where in the template to make the change",
            "currentText": "Current text (if applicable)",
            "suggestedText": "Suggested text",
            "rationale": "Why this change will improve performance"
          }
        ],
        "expectedImpact": "Description of expected impact on performance"
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert in prompt engineering and optimization." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    logger.error(`Error generating optimization suggestions: ${error.message}`);
    throw error;
  }
}

/**
 * Apply optimization suggestions to a template
 */
function applyOptimizationSuggestions(template, suggestions) {
  try {
    logger.info('Applying optimization suggestions');
    
    // Create a deep copy of the template
    const optimizedTemplate = JSON.parse(JSON.stringify(template));
    
    // Apply each suggestion
    for (const suggestion of suggestions.suggestions) {
      const { type, location, currentText, suggestedText } = suggestion;
      
      // Parse location path
      const path = location.split('.');
      
      // Navigate to the target location
      let target = optimizedTemplate;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        
        // Handle array indices
        if (key.includes('[') && key.includes(']')) {
          const arrayName = key.substring(0, key.indexOf('['));
          const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
          
          target = target[arrayName][index];
        } else {
          target = target[key];
        }
        
        if (!target) {
          logger.warn(`Invalid path: ${location}`);
          continue;
        }
      }
      
      // Get the final key
      const finalKey = path[path.length - 1];
      
      // Apply the suggestion
      switch (type) {
        case 'addition':
          target[finalKey] = suggestedText;
          break;
        case 'modification':
          if (target[finalKey] === currentText) {
            target[finalKey] = suggestedText;
          } else {
            logger.warn(`Current text doesn't match: ${currentText} vs ${target[finalKey]}`);
          }
          break;
        case 'removal':
          delete target[finalKey];
          break;
        default:
          logger.warn(`Unknown suggestion type: ${type}`);
      }
    }
    
    return optimizedTemplate;
  } catch (error) {
    logger.error(`Error applying optimization suggestions: ${error.message}`);
    throw error;
  }
}

module.exports = {
  optimizePromptTemplate,
  generateOptimizationSuggestions
};
```

## Implementation Plan

### Phase 1: Core Prompt Templates (Week 1-2)
1. Set up prompt template structure and management system
2. Implement base interview template with sections and questions
3. Create AI moderation system for interview flow
4. Develop dynamic question generation system
5. Set up prompt performance tracking

### Phase 2: Analysis Prompts (Week 3-4)
1. Implement emotion analysis prompt system
2. Create language analysis prompt system
3. Develop insight generation prompt system
4. Set up executive summary generation
5. Implement prompt optimization system

### Phase 3: Integration and Testing (Week 5-6)
1. Integrate prompt systems with backend services
2. Connect with Voiceform for interview delivery
3. Integrate with Hume AI for emotion analysis
4. Connect with Gemini API for language analysis
5. Set up end-to-end testing of prompt flows

### Phase 4: Optimization and Refinement (Week 7-8)
1. Analyze prompt performance data
2. Optimize prompts based on performance metrics
3. Refine interview flow based on user feedback
4. Enhance analysis prompts for deeper insights
5. Document prompt engineering system for future maintenance

## Conclusion
This AI prompt engineering system provides a comprehensive framework for conducting emotionally rich interviews and generating deep insights from the collected data. The system is designed to be modular, allowing for continuous improvement and optimization based on performance metrics. The combination of structured templates and dynamic generation ensures that interviews are both consistent and tailored to specific product categories and project objectives.

The system's strength lies in its ability to combine voice emotion analysis with sophisticated language processing, creating a dual-layer analysis that captures both explicit statements and implicit emotional responses. This approach enables the generation of insights that would be difficult to obtain through traditional research methods.

By implementing this prompt engineering system, Jade Kite will be able to deliver unique, high-value insights to clients while maintaining efficiency and scalability in the research process.
