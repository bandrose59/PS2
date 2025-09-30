import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, student_id, resume_text, target_job_id } = await req.json();
    console.log(`AI Career Tools - Action: ${action}, Student: ${student_id}`);

    // Get student data
    const [profileResult, skillsResult, projectsResult, certificationsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', student_id),
      supabase.from('student_skills').select(`
        proficiency_level,
        skills!inner(name, category)
      `).eq('student_id', student_id),
      supabase.from('projects').select('*').eq('student_id', student_id),
      supabase.from('certifications').select('*').eq('student_id', student_id)
    ]);

    const profiles = profileResult.data || [];
    const skills = skillsResult.data || [];
    const projects = projectsResult.data || [];
    const certifications = certificationsResult.data || [];

    if (profiles.length === 0) {
      return new Response(JSON.stringify({
        error: 'Profile not found. Please complete your profile first to use AI tools.',
        fallback_data: generateFallbackData(action)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const profile = profiles[0];

    // Get target job if provided
    let targetJob = null;
    if (target_job_id) {
      const { data: jobData } = await supabase
        .from('job_opportunities')
        .select('*')
        .eq('id', target_job_id)
        .single();
      targetJob = jobData;
    }

    // Prepare student data for AI
    const studentData = {
      profile: {
        name: profile.full_name,
        department: profile.department,
        year_of_study: profile.year_of_study,
        gpa: profile.gpa,
        bio: profile.bio
      },
      skills: skills.map((s: any) => ({
        name: s.skills.name,
        category: s.skills.category,
        proficiency: s.proficiency_level
      })),
      projects: projects.map(p => ({
        title: p.title,
        description: p.description,
        tech_stack: p.tech_stack,
        status: p.status
      })),
      certifications: certifications.map(c => ({
        title: c.title,
        organization: c.issuing_organization
      }))
    };

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'resume_enhance':
        systemPrompt = "You are an expert resume enhancement AI. Analyze the resume and provide specific, actionable improvements for ATS optimization and recruiter appeal.";
        userPrompt = `Student Data: ${JSON.stringify(studentData)}
        
Resume Text: ${resume_text || 'No resume provided'}

${targetJob ? `Target Job: ${JSON.stringify(targetJob)}` : ''}

Please provide:
1. ATS optimization suggestions
2. Content improvements
3. Format recommendations
4. Skills gap analysis
5. Action items for improvement

Respond in JSON format with sections: ats_improvements, content_suggestions, format_tips, skill_gaps, action_items.`;
        break;

      case 'skill_gap_analysis':
        systemPrompt = "You are a career development expert specializing in skill gap analysis. Analyze the student's current skills against market demands and career goals.";
        userPrompt = `Student Data: ${JSON.stringify(studentData)}

${targetJob ? `Target Job Requirements: ${JSON.stringify(targetJob)}` : ''}

Analyze the skill gaps and provide:
1. Current skill assessment
2. Missing skills for career goals
3. Skill development roadmap
4. Recommended certifications
5. Learning resources

Respond in JSON format with sections: current_skills, missing_skills, development_roadmap, certifications, resources.`;
        break;

      case 'mock_interview':
        systemPrompt = "You are an AI interview coach. Generate relevant interview questions and provide feedback based on the student's profile and target role.";
        userPrompt = `Student Data: ${JSON.stringify(studentData)}

${targetJob ? `Target Role: ${JSON.stringify(targetJob)}` : ''}

Generate:
1. 5 technical questions relevant to their skills
2. 3 behavioral questions
3. 2 situational questions
4. Expected answer guidelines
5. Interview tips specific to their profile

Respond in JSON format with sections: technical_questions, behavioral_questions, situational_questions, answer_guidelines, interview_tips.`;
        break;

      case 'career_roadmap':
        systemPrompt = "You are a career planning expert. Create personalized career roadmaps based on student profiles and market trends.";
        userPrompt = `Student Data: ${JSON.stringify(studentData)}

Create a detailed career roadmap including:
1. Short-term goals (6 months)
2. Medium-term goals (1-2 years)
3. Long-term goals (3-5 years)
4. Required skills for each phase
5. Milestone achievements
6. Industry insights and trends

Respond in JSON format with sections: short_term, medium_term, long_term, skill_timeline, milestones, industry_trends.`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Call Lovable AI with Gemini
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          fallback_data: generateFallbackData(action)
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI service requires payment. Please add credits to your workspace.",
          fallback_data: generateFallbackData(action)
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content received from AI');
    }

    // Try to parse JSON response, fallback to structured format
    let result;
    try {
      result = JSON.parse(aiContent);
    } catch (e) {
      // If JSON parsing fails, structure the response manually
      result = {
        analysis: aiContent,
        recommendations: generateFallbackData(action)
      };
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      result,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`AI Career Tools error:`, error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      fallback_data: generateFallbackData('general')
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateFallbackData(action: string) {
  switch (action) {
    case 'resume_enhance':
      return {
        ats_improvements: [
          "Use standard section headings (Experience, Education, Skills)",
          "Include relevant keywords from job descriptions",
          "Use bullet points for achievements",
          "Quantify accomplishments with numbers"
        ],
        content_suggestions: [
          "Start bullet points with action verbs",
          "Focus on achievements, not responsibilities",
          "Tailor content to target role",
          "Keep descriptions concise and impactful"
        ],
        format_tips: [
          "Use consistent formatting throughout",
          "Choose a clean, professional layout",
          "Ensure good white space distribution",
          "Use 10-12pt font size"
        ]
      };
    
    case 'skill_gap_analysis':
      return {
        missing_skills: [
          "Cloud platforms (AWS, Azure, GCP)",
          "Advanced programming frameworks",
          "Data analysis tools",
          "Project management skills"
        ],
        development_roadmap: [
          "Complete online courses in missing skills",
          "Build projects showcasing new skills",
          "Obtain relevant certifications",
          "Join professional communities"
        ]
      };
    
    case 'mock_interview':
      return {
        technical_questions: [
          "Explain your most challenging project",
          "How do you stay updated with technology trends?",
          "Describe your problem-solving approach"
        ],
        behavioral_questions: [
          "Tell me about a time you worked in a team",
          "How do you handle tight deadlines?",
          "Describe a difficult situation you overcame"
        ]
      };
    
    case 'career_roadmap':
      return {
        short_term: [
          "Complete current degree with strong GPA",
          "Build 2-3 substantial projects",
          "Apply for internships",
          "Develop networking skills"
        ],
        medium_term: [
          "Secure entry-level position",
          "Gain 1-2 years professional experience",
          "Pursue relevant certifications",
          "Take on leadership responsibilities"
        ],
        long_term: [
          "Advance to senior technical role",
          "Consider specialization or management track",
          "Mentor junior developers",
          "Contribute to open source projects"
        ]
      };
    
    default:
      return {
        message: "AI service temporarily unavailable. Please try again later.",
        suggestions: [
          "Check your profile completeness",
          "Update your skills and projects",
          "Review job requirements carefully"
        ]
      };
  }
}