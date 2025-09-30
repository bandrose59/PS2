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

    const { student_id } = await req.json();
    console.log(`AI Job Matching for student: ${student_id}`);

    // Get student data
    const [profileResult, skillsResult, projectsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', student_id).single(),
      supabase.from('student_skills').select(`
        proficiency_level,
        skills!inner(name, category)
      `).eq('student_id', student_id),
      supabase.from('projects').select('*').eq('student_id', student_id)
    ]);

    const profile = profileResult.data;
    const skills = skillsResult.data || [];
    const projects = projectsResult.data || [];

    if (!profile) {
      throw new Error('Student profile not found');
    }

    // Get active job opportunities
    const { data: jobs, error: jobsError } = await supabase
      .from('job_opportunities')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Jobs fetch error:', jobsError);
    }

    const studentData = {
      profile: {
        name: profile.full_name,
        department: profile.department,
        year_of_study: profile.year_of_study,
        gpa: profile.gpa
      },
      skills: skills.map((s: any) => ({
        name: s.skills.name,
        category: s.skills.category,
        proficiency: s.proficiency_level
      })),
      projects: projects.map(p => ({
        title: p.title,
        description: p.description,
        tech_stack: p.tech_stack
      }))
    };

    const systemPrompt = "You are an intelligent job matching AI. Analyze the student profile and available jobs to provide personalized job recommendations with match scores and explanations.";

    const userPrompt = `Student Profile: ${JSON.stringify(studentData)}

Available Jobs: ${JSON.stringify(jobs || [])}

Please analyze and provide:
1. Top 5 recommended job matches with match percentage (0-100%)
2. Explanation for each match
3. Skills alignment analysis
4. Areas for improvement for each job
5. Overall career suggestions

If no jobs are available, suggest job types and skills to develop based on the student's profile.

Respond in JSON format with sections: recommended_jobs (array with job_id, match_percentage, explanation, skills_match, improvement_areas), career_suggestions, skill_development_tips.`;

    // Call Lovable AI
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
        temperature: 0.3,
        max_tokens: 1500
      })
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          recommended_jobs: [],
          career_suggestions: generateFallbackCareerSuggestions(profile, skills)
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI service requires payment. Please add credits to your workspace.",
          recommended_jobs: [],
          career_suggestions: generateFallbackCareerSuggestions(profile, skills)
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

    let result;
    try {
      result = JSON.parse(aiContent);
    } catch (e) {
      // Fallback if JSON parsing fails
      result = {
        recommended_jobs: [],
        career_suggestions: generateFallbackCareerSuggestions(profile, skills),
        analysis: aiContent
      };
    }

    return new Response(JSON.stringify({
      success: true,
      ...result,
      total_jobs_analyzed: jobs?.length || 0,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`AI Job Matching error:`, error);
    
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      recommended_jobs: [],
      career_suggestions: [
        "Complete your profile with skills and projects",
        "Build a portfolio showcasing your abilities",
        "Network with professionals in your field",
        "Stay updated with industry trends"
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateFallbackCareerSuggestions(profile: any, skills: any[]) {
  const department = profile?.department?.toLowerCase() || '';
  const skillNames = skills.map(s => s.skills?.name || '').join(', ');

  const suggestions = [
    "Build a strong portfolio with 2-3 substantial projects",
    "Develop both technical and soft skills",
    "Create a compelling LinkedIn profile",
    "Practice coding problems and technical interviews"
  ];

  if (department.includes('computer') || department.includes('software')) {
    suggestions.push("Focus on full-stack development or specialized areas like AI/ML");
    suggestions.push("Contribute to open source projects");
  }

  if (skillNames.includes('React') || skillNames.includes('JavaScript')) {
    suggestions.push("Consider frontend developer roles");
    suggestions.push("Learn modern frameworks and tools");
  }

  if (skillNames.includes('Python') || skillNames.includes('Java')) {
    suggestions.push("Explore backend development opportunities");
    suggestions.push("Learn about databases and system design");
  }

  return suggestions;
}