import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { student_id } = await req.json();

    console.log('Getting AI recommendations for student:', student_id);

    // Get student profile and skills
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', student_id);

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({
        error: 'Profile not found. Please complete your profile first to get AI recommendations.',
        recommended_job_ids: [],
        reasoning: 'No profile data available'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const profile = profiles[0];

    // Get student skills
    const { data: studentSkills, error: skillsError } = await supabaseClient
      .from('student_skills')
      .select(`
        skills!inner(name, category),
        proficiency_level
      `)
      .eq('student_id', student_id);

    if (skillsError) {
      console.error('Skills error:', skillsError);
      throw skillsError;
    }

    // Get student projects
    const { data: projects, error: projectsError } = await supabaseClient
      .from('projects')
      .select('tech_stack')
      .eq('student_id', student_id);

    if (projectsError) {
      console.error('Projects error:', projectsError);
      throw projectsError;
    }

    // Get all active job opportunities
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('job_opportunities')
      .select('*')
      .eq('status', 'active');

    if (jobsError) {
      console.error('Jobs error:', jobsError);
      throw jobsError;
    }

    // Prepare data for AI analysis
    const studentData = {
      gpa: profile.gpa,
      department: profile.department,
      year_of_study: profile.year_of_study,
      skills: studentSkills?.map((s: any) => ({
        name: s.skills.name,
        category: s.skills.category,
        proficiency: s.proficiency_level
      })) || [],
      tech_stack: projects?.flatMap((p: any) => p.tech_stack || []) || []
    };

    console.log('Student data prepared:', studentData);

    // Call Lovable AI for recommendations
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
          {
            role: 'system',
            content: `You are an AI career advisor for a student placement platform. Your job is to analyze student profiles and recommend the most suitable job opportunities.

            You will receive:
            1. Student profile data (GPA, skills, tech stack, department, year of study)
            2. Available job opportunities with their requirements

            Your task is to:
            1. Analyze the match between student skills and job requirements
            2. Consider GPA requirements and student's GPA
            3. Factor in the student's experience level and year of study
            4. Prioritize opportunities with higher conversion chances
            5. Return a JSON array of recommended job IDs in order of suitability

            Response format:
            {
              "recommended_job_ids": ["job_id_1", "job_id_2", "job_id_3"],
              "reasoning": "Brief explanation of the recommendation logic"
            }

            Focus on practical skill matches, realistic expectations based on student level, and opportunities that align with their career progression.`
          },
          {
            role: 'user',
            content: `Student Profile:
            ${JSON.stringify(studentData, null, 2)}

            Available Job Opportunities:
            ${JSON.stringify(jobs, null, 2)}

            Please analyze and recommend the best matching opportunities for this student.`
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', aiData);

    let recommendations;
    try {
      // Try to parse the AI response as JSON
      const content = aiData.choices[0].message.content;
      recommendations = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback: create recommendations based on simple matching
      recommendations = {
        recommended_job_ids: jobs
          ?.filter((job: any) => {
            // Basic matching logic
            const hasGpaMatch = !job.min_gpa || (profile.gpa && profile.gpa >= job.min_gpa);
            const hasSkillMatch = job.required_skills?.some((skill: string) => 
              studentSkills?.some((s: any) => 
                s.skills.name.toLowerCase().includes(skill.toLowerCase())
              )
            );
            return hasGpaMatch && (hasSkillMatch || job.required_skills?.length === 0);
          })
          .slice(0, 5)
          .map((job: any) => job.id) || [],
        reasoning: "Fallback recommendations based on GPA and skill matching"
      };
    }

    console.log('Final recommendations:', recommendations);

    return new Response(
      JSON.stringify(recommendations),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in ai-job-recommendations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        recommended_job_ids: [],
        reasoning: "Error occurred during recommendation generation"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});