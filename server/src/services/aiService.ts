import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import natural from 'natural';
import nlp from 'compromise';
import sharp from 'sharp';
import _ from 'lodash';
import moment from 'moment';

// Enhanced AI Analysis Interface
export interface AIAnalysis {
  category: 'roads' | 'garbage' | 'water' | 'electricity' | 'sewage' | 'traffic' | 'streetlight' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  estimatedResolutionTime: string;
  keywords: string[];
  confidence: number;
  suggestions: string[];
  aiModel: string;
  processingTime: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgencyScore: number;
  complexityScore: number;
  relatedComplaints?: string[];
  predictedResolutionSteps: string[];
}

export interface PhotoAnalysis {
  description: string;
  severity: 'low' | 'medium' | 'high';
  additionalDetails: string[];
  aiModel: string;
  processingTime: number;
  imageQuality: 'poor' | 'fair' | 'good' | 'excellent';
  detectedIssues: string[];
  locationMarkers?: Array<{x: number, y: number, label: string}>;
  enhancedImage?: string;
}

export interface PredictiveAnalysis {
  trendAnalysis: {
    categoryTrends: Array<{category: string, trend: 'increasing' | 'decreasing' | 'stable', percentage: number}>;
    priorityDistribution: Record<string, number>;
    resolutionTimePredictions: Record<string, string>;
  };
  recommendations: string[];
  riskAssessment: {
    highRiskAreas: string[];
    seasonalPatterns: string[];
    capacityPlanning: string[];
  };
}

export interface AIChatResponse {
  message: string;
  suggestions: string[];
  confidence: number;
  aiModel: string;
  processingTime: number;
}

export class AIService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  private static readonly ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  private static readonly OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

  private static openai: OpenAI | null = null;
  private static anthropic: Anthropic | null = null;
  private static tokenizer = new natural.WordTokenizer();
  private static tfidf = new natural.TfIdf();

  // Initialize AI clients
  static initialize() {
    if (this.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: this.OPENAI_API_KEY });
    }
    if (this.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: this.ANTHROPIC_API_KEY });
    }
  }

  // Enhanced complaint analysis with multiple AI models
  static async analyzeComplaint(description: string, language: string, photos?: string[]): Promise<AIAnalysis> {
    const startTime = Date.now();
    
    try {
      // If no AI API keys, fall back to basic categorization
      if (!this.OPENAI_API_KEY && !this.ANTHROPIC_API_KEY) {
        return this.basicCategorization(description, startTime);
      }

      // Try multiple AI models for better accuracy
      const analyses = await Promise.allSettled([
        this.analyzeWithOpenAI(description, language, photos),
        this.analyzeWithClaude(description, language, photos)
      ]);

      // Combine results for better accuracy
      const validAnalyses = analyses
        .filter((result): result is PromiseFulfilledResult<AIAnalysis> => result.status === 'fulfilled')
        .map(result => result.value);

      if (validAnalyses.length === 0) {
        return this.basicCategorization(description, startTime);
      }

      // Use ensemble method to combine results
      return this.ensembleAnalysis(validAnalyses, startTime);
    } catch (error) {
      console.error('AI analysis failed, falling back to basic categorization:', error);
      return this.basicCategorization(description, startTime);
    }
  }

  // Enhanced photo analysis with vision capabilities
  static async analyzePhoto(photoBase64: string): Promise<PhotoAnalysis> {
    const startTime = Date.now();
    
    try {
      if (!this.OPENAI_API_KEY && !this.ANTHROPIC_API_KEY) {
        return this.basicPhotoAnalysis(startTime);
      }

      // Enhance image quality first
      const enhancedImage = await this.enhanceImage(photoBase64);
      
      // Analyze with multiple models
      const analyses = await Promise.allSettled([
        this.analyzePhotoWithOpenAI(enhancedImage),
        this.analyzePhotoWithClaude(enhancedImage)
      ]);

      const validAnalyses = analyses
        .filter((result): result is PromiseFulfilledResult<PhotoAnalysis> => result.status === 'fulfilled')
        .map(result => result.value);

      if (validAnalyses.length === 0) {
        return this.basicPhotoAnalysis(startTime);
      }

      return this.ensemblePhotoAnalysis(validAnalyses, enhancedImage, startTime);
    } catch (error) {
      console.error('Photo analysis failed:', error);
      return this.basicPhotoAnalysis(startTime);
    }
  }

  // Real-time AI chat assistant
  static async chatWithAI(message: string, context?: any): Promise<AIChatResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.OPENAI_API_KEY && !this.ANTHROPIC_API_KEY) {
        return {
          message: "I'm sorry, AI chat is currently unavailable. Please contact support for assistance.",
          suggestions: ["Submit a complaint", "Check status", "Contact support"],
          confidence: 0.5,
          aiModel: 'basic',
          processingTime: Date.now() - startTime
        };
      }

      const contextPrompt = context ? `\n\nContext: ${JSON.stringify(context)}` : '';
      const fullPrompt = `You are a helpful AI assistant for the Brihanmumbai Municipal Corporation (BMC) complaint system. 
      Help citizens with their queries about civic issues, complaint submission, and status updates.
      
      User message: ${message}${contextPrompt}
      
      Provide a helpful response and suggest relevant actions.`;

      const response = await this.callOpenAI(fullPrompt, 'gpt-4o-mini');
      
      return {
        message: response,
        suggestions: this.extractSuggestions(response),
        confidence: 0.9,
        aiModel: 'gpt-4o-mini',
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('AI chat failed:', error);
      return {
        message: "I'm sorry, I'm having trouble processing your request. Please try again later.",
        suggestions: ["Try again", "Contact support"],
        confidence: 0.3,
        aiModel: 'error',
        processingTime: Date.now() - startTime
      };
    }
  }

  // Predictive analytics for trends and patterns
  static async analyzeTrends(complaints: any[]): Promise<PredictiveAnalysis> {
    try {
      // Analyze category trends
      const categoryTrends = this.analyzeCategoryTrends(complaints);
      
      // Analyze priority distribution
      const priorityDistribution = this.analyzePriorityDistribution(complaints);
      
      // Predict resolution times
      const resolutionTimePredictions = this.predictResolutionTimes(complaints);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(complaints);
      
      // Risk assessment
      const riskAssessment = this.assessRisks(complaints);

      return {
        trendAnalysis: {
          categoryTrends,
          priorityDistribution,
          resolutionTimePredictions
        },
        recommendations,
        riskAssessment
      };
    } catch (error) {
      console.error('Trend analysis failed:', error);
      return this.basicTrendAnalysis();
    }
  }

  // Smart complaint routing based on AI analysis
  static async routeComplaint(analysis: AIAnalysis, location: any): Promise<{
    department: string;
    priority: number;
    estimatedTime: string;
    escalationLevel: number;
    assignedTeam?: string;
  }> {
    try {
      // Enhanced routing logic based on multiple factors
      const urgencyScore = this.calculateUrgencyScore(analysis);
      const locationFactor = this.calculateLocationFactor(location);
      const complexityFactor = this.calculateComplexityFactor(analysis);
      
      const priority = Math.min(urgencyScore * locationFactor * complexityFactor, 10);
      
      return {
        department: analysis.department,
        priority: Math.round(priority),
        estimatedTime: analysis.estimatedResolutionTime,
        escalationLevel: priority > 8 ? 3 : priority > 6 ? 2 : 1,
        assignedTeam: this.determineAssignedTeam(analysis, location)
      };
    } catch (error) {
      console.error('Smart routing failed:', error);
      return {
        department: analysis.department,
        priority: 5,
        estimatedTime: analysis.estimatedResolutionTime,
        escalationLevel: 1
      };
    }
  }

  // Private methods for AI model interactions
  private static async analyzeWithOpenAI(description: string, language: string, photos?: string[]): Promise<AIAnalysis> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const prompt = this.buildAdvancedAnalysisPrompt(description, language, photos);
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert civic complaint analyzer for BMC. Provide detailed, actionable analysis with high accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseAdvancedAIResponse(content, 'gpt-4o');
  }

  private static async analyzeWithClaude(description: string, language: string, photos?: string[]): Promise<AIAnalysis> {
    // Temporarily disabled due to API compatibility issues
    throw new Error('Claude analysis temporarily disabled');
  }

  private static async analyzePhotoWithOpenAI(photoBase64: string): Promise<PhotoAnalysis> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this civic complaint photo and provide detailed insights about the issue, severity, and specific details visible.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${photoBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parsePhotoResponse(content, 'gpt-4o');
  }

  private static async analyzePhotoWithClaude(photoBase64: string): Promise<PhotoAnalysis> {
    // Temporarily disabled due to API compatibility issues
    throw new Error('Claude photo analysis temporarily disabled');
  }

  // Image enhancement
  private static async enhanceImage(photoBase64: string): Promise<string> {
    try {
      const buffer = Buffer.from(photoBase64, 'base64');
      const enhanced = await sharp(buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      return enhanced.toString('base64');
    } catch (error) {
      console.error('Image enhancement failed:', error);
      return photoBase64;
    }
  }

  // Ensemble methods for combining multiple AI model results
  private static ensembleAnalysis(analyses: AIAnalysis[], startTime: number): AIAnalysis {
    if (analyses.length === 1) return analyses[0];

    // Weighted voting based on confidence
    const weightedCategory = this.weightedVote(analyses.map(a => ({ value: a.category, weight: a.confidence })));
    const weightedPriority = this.weightedVote(analyses.map(a => ({ value: a.priority, weight: a.confidence })));
    
    // Average confidence and other numeric values
    const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
    const avgUrgencyScore = analyses.reduce((sum, a) => sum + a.urgencyScore, 0) / analyses.length;
    const avgComplexityScore = analyses.reduce((sum, a) => sum + a.complexityScore, 0) / analyses.length;

    // Combine suggestions
    const allSuggestions = analyses.flatMap(a => a.suggestions);
    const uniqueSuggestions = _.uniq(allSuggestions);

    return {
      ...analyses[0],
      category: weightedCategory,
      priority: weightedPriority,
      confidence: avgConfidence,
      urgencyScore: avgUrgencyScore,
      complexityScore: avgComplexityScore,
      suggestions: uniqueSuggestions.slice(0, 5),
      aiModel: `ensemble-${analyses.map(a => a.aiModel).join('-')}`,
      processingTime: Date.now() - startTime
    };
  }

  private static ensemblePhotoAnalysis(analyses: PhotoAnalysis[], enhancedImage: string, startTime: number): PhotoAnalysis {
    if (analyses.length === 1) return { ...analyses[0], enhancedImage };

    const avgSeverity = this.weightedVote(analyses.map(a => ({ value: a.severity, weight: 1 })));
    const allDetails = analyses.flatMap(a => a.additionalDetails);
    const uniqueDetails = _.uniq(allDetails);

    return {
      ...analyses[0],
      severity: avgSeverity,
      additionalDetails: uniqueDetails.slice(0, 5),
      enhancedImage,
      aiModel: `ensemble-${analyses.map(a => a.aiModel).join('-')}`,
      processingTime: Date.now() - startTime
    };
  }

  // Utility methods
  private static weightedVote<T>(items: Array<{value: T, weight: number}>): T {
    const votes = new Map<T, number>();
    
    items.forEach(item => {
      votes.set(item.value, (votes.get(item.value) || 0) + item.weight);
    });
    
    return Array.from(votes.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  private static buildAdvancedAnalysisPrompt(description: string, language: string, photos?: string[]): string {
    const photoContext = photos && photos.length > 0 
      ? `\n\nPhotos have been attached to this complaint. Consider visual evidence in your analysis.`
      : '';

    return `Analyze this civic complaint and provide comprehensive categorization:

Complaint Description: "${description}"
Language: ${language}${photoContext}

Please provide a JSON response with the following structure:
{
  "category": "roads|garbage|water|electricity|sewage|traffic|streetlight|other",
  "priority": "low|medium|high|urgent",
  "department": "Specific BMC department name",
  "estimatedResolutionTime": "Estimated time to resolve (e.g., '2-3 days', '1 week')",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.95,
  "suggestions": ["suggestion1", "suggestion2"],
  "sentiment": "positive|neutral|negative",
  "urgencyScore": 8.5,
  "complexityScore": 6.2,
  "predictedResolutionSteps": ["step1", "step2", "step3"]
}

Consider:
- Category should be specific and actionable
- Priority based on public safety and urgency
- Department should be the actual BMC department responsible
- Keywords should help with search and filtering
- Confidence should reflect certainty (0.0 to 1.0)
- Suggestions should be helpful for resolution
- Sentiment analysis of the complaint
- Urgency score (0-10) based on safety and impact
- Complexity score (0-10) based on resolution difficulty
- Predicted steps for resolution

Respond with only the JSON object.`;
  }

  private static parseAdvancedAIResponse(response: string, model: string): AIAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        category: parsed.category || 'other',
        priority: parsed.priority || 'medium',
        department: parsed.department || 'General Department',
        estimatedResolutionTime: parsed.estimatedResolutionTime || '1-2 weeks',
        keywords: parsed.keywords || [],
        confidence: parsed.confidence || 0.8,
        suggestions: parsed.suggestions || [],
        aiModel: model,
        processingTime: 0,
        sentiment: parsed.sentiment || 'neutral',
        urgencyScore: parsed.urgencyScore || 5,
        complexityScore: parsed.complexityScore || 5,
        predictedResolutionSteps: parsed.predictedResolutionSteps || []
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.basicCategorization('', 0);
    }
  }

  private static parsePhotoResponse(response: string, model: string): PhotoAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        description: parsed.description || 'Photo analysis unavailable',
        severity: parsed.severity || 'medium',
        additionalDetails: parsed.additionalDetails || [],
        aiModel: model,
        processingTime: 0,
        imageQuality: parsed.imageQuality || 'good',
        detectedIssues: parsed.detectedIssues || []
      };
    } catch (error) {
      console.error('Failed to parse photo analysis response:', error);
      return this.basicPhotoAnalysis(0);
    }
  }

  private static extractSuggestions(response: string): string[] {
    // Extract suggestions from AI response using NLP
    const doc = nlp(response);
    const sentences = doc.sentences().out('array');
    return sentences
      .filter((s: string) => s.toLowerCase().includes('suggest') || s.toLowerCase().includes('recommend'))
      .slice(0, 3);
  }

  // Enhanced basic categorization with NLP
  private static basicCategorization(description: string, startTime: number): AIAnalysis {
    const lowerDesc = description.toLowerCase();
    const doc = nlp(description);
    
    // Extract entities and keywords
    const entities = doc.match('#Noun+').out('array');
    const verbs = doc.match('#Verb+').out('array');
    
    let category: AIAnalysis['category'] = 'other';
    let priority: AIAnalysis['priority'] = 'medium';
    let department = 'General Department';
    let keywords: string[] = [];
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    let urgencyScore = 5;
    let complexityScore = 5;

         // Enhanced categorization with NLP
     if (/road|pothole|traffic|vehicle|car|bike/i.test(lowerDesc) || entities.some((e: string) => /road|traffic/i.test(e))) {
      category = 'roads';
      department = 'Roads Department';
      keywords = ['road', 'pothole', 'traffic', 'vehicle'];
      priority = /urgent|emergency|accident|danger/i.test(lowerDesc) ? 'urgent' : 'high';
       urgencyScore = /urgent|emergency|accident/i.test(lowerDesc) ? 9 : 7;
     } else if (/garbage|trash|waste|rubbish|dirt/i.test(lowerDesc) || entities.some((e: string) => /garbage|waste/i.test(e))) {
      category = 'garbage';
      department = 'Solid Waste Management';
      keywords = ['garbage', 'waste', 'trash', 'cleanliness'];
      priority = /overflow|spread|health/i.test(lowerDesc) ? 'high' : 'medium';
       urgencyScore = /overflow|spread|health/i.test(lowerDesc) ? 8 : 6;
     } else if (/water|leak|supply|pipe|drain/i.test(lowerDesc) || entities.some((e: string) => /water|pipe/i.test(e))) {
      category = 'water';
      department = 'Water Supply Department';
      keywords = ['water', 'leak', 'supply', 'pipe'];
      priority = /flood|overflow|damage/i.test(lowerDesc) ? 'urgent' : 'high';
       urgencyScore = /flood|overflow|damage/i.test(lowerDesc) ? 9 : 7;
     } else if (/electricity|power|wire|light|bulb/i.test(lowerDesc) || entities.some((e: string) => /electricity|power/i.test(e))) {
      category = 'electricity';
      department = 'Electricity Department';
      keywords = ['electricity', 'power', 'wire', 'light'];
      priority = /spark|danger|fire/i.test(lowerDesc) ? 'urgent' : 'high';
       urgencyScore = /spark|danger|fire/i.test(lowerDesc) ? 9 : 7;
     } else if (/sewage|drain|toilet|bathroom/i.test(lowerDesc) || entities.some((e: string) => /sewage|drain/i.test(e))) {
      category = 'sewage';
      department = 'Sewage Department';
      keywords = ['sewage', 'drain', 'sanitation'];
      priority = 'high';
       urgencyScore = 8;
     } else if (/streetlight|light|dark|night/i.test(lowerDesc) || entities.some((e: string) => /streetlight|light/i.test(e))) {
      category = 'streetlight';
      department = 'Street Lighting Department';
      keywords = ['streetlight', 'lighting', 'dark'];
      priority = 'medium';
       urgencyScore = 6;
     }

    // Sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'thank', 'appreciate', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'frustrated', 'angry', 'disappointed'];
    
    if (positiveWords.some(word => lowerDesc.includes(word))) {
      sentiment = 'positive';
    } else if (negativeWords.some(word => lowerDesc.includes(word))) {
      sentiment = 'negative';
    }

    return {
      category,
      priority,
      department,
      estimatedResolutionTime: priority === 'urgent' ? '24-48 hours' : 
                               priority === 'high' ? '3-5 days' : 
                               priority === 'medium' ? '1-2 weeks' : '2-4 weeks',
      keywords,
      confidence: 0.7,
      suggestions: [
        'Include specific location details',
        'Add photos if possible',
        'Mention any safety concerns'
      ],
      aiModel: 'basic-nlp',
      processingTime: Date.now() - startTime,
      sentiment,
      urgencyScore,
      complexityScore,
      predictedResolutionSteps: [
        'Issue verification',
        'Department assignment',
        'Resolution planning',
        'Implementation',
        'Verification'
      ]
    };
  }

  private static basicPhotoAnalysis(startTime: number): PhotoAnalysis {
    return {
      description: 'Photo analysis requires AI service',
      severity: 'medium',
      additionalDetails: ['Manual review recommended'],
      aiModel: 'basic',
      processingTime: Date.now() - startTime,
      imageQuality: 'fair',
      detectedIssues: []
    };
  }

  // Trend analysis methods
  private static analyzeCategoryTrends(complaints: any[]) {
    const categoryCounts = _.countBy(complaints, 'category');
    const total = complaints.length;
    
    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      trend: 'stable' as const,
      percentage: Math.round((count as number / total) * 100)
    }));
  }

  private static analyzePriorityDistribution(complaints: any[]) {
    return _.countBy(complaints, 'priority');
  }

  private static predictResolutionTimes(complaints: any[]) {
    const avgTimes = _.groupBy(complaints, 'category');
    const predictions: Record<string, string> = {};
    
    Object.entries(avgTimes).forEach(([category, categoryComplaints]) => {
      const resolvedComplaints = categoryComplaints.filter(c => c.status === 'resolved');
      if (resolvedComplaints.length > 0) {
        predictions[category] = '1-2 weeks'; // Simplified for now
      } else {
        predictions[category] = '2-4 weeks';
      }
    });
    
    return predictions;
  }

  private static generateRecommendations(complaints: any[]) {
    return [
      'Increase monitoring in high-complaint areas',
      'Improve response time for urgent issues',
      'Enhance communication with citizens'
    ];
  }

  private static assessRisks(complaints: any[]) {
    return {
      highRiskAreas: ['Downtown', 'Industrial Zone'],
      seasonalPatterns: ['Monsoon season increases water-related complaints'],
      capacityPlanning: ['Increase staff during peak seasons']
    };
  }

  private static basicTrendAnalysis(): PredictiveAnalysis {
    return {
      trendAnalysis: {
        categoryTrends: [],
        priorityDistribution: {},
        resolutionTimePredictions: {}
      },
      recommendations: ['Data analysis unavailable'],
      riskAssessment: {
        highRiskAreas: [],
        seasonalPatterns: [],
        capacityPlanning: []
      }
    };
  }

  // Smart routing methods
  private static calculateUrgencyScore(analysis: AIAnalysis): number {
    const priorityScores = { urgent: 10, high: 8, medium: 5, low: 2 };
    return priorityScores[analysis.priority] * (analysis.urgencyScore / 10);
  }

  private static calculateLocationFactor(location: any): number {
    // Simplified location factor
    return 1.0;
  }

  private static calculateComplexityFactor(analysis: AIAnalysis): number {
    return analysis.complexityScore / 10;
  }

  private static determineAssignedTeam(analysis: AIAnalysis, location: any): string | undefined {
    // Simplified team assignment
    return undefined;
  }

  // Legacy method for backward compatibility
  private static async callOpenAI(prompt: string, model: string = 'gpt-4o'): Promise<string> {
    if (!this.openai) throw new Error('OpenAI not initialized');

    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert civic complaint analyzer for the Brihanmumbai Municipal Corporation (BMC). Provide accurate, actionable analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices?.[0]?.message?.content || '';
  }
}

// Initialize AI service
AIService.initialize();