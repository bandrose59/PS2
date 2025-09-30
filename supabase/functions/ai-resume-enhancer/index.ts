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

    const { student_id, action, resume_text, target_job_id } = await req.json();

    console.log('AI Resume Enhancer called with action:', action);

    // Get student profile and related data
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', student_id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    // Get student's projects, skills, and certifications
    const [projectsResult, skillsResult, certificationsResult] = await Promise.all([
      supabaseClient
        .from('projects')
        .select('*')
        .eq('student_id', student_id),
      supabaseClient
        .from('student_skills')
        .select(`
          skills!inner(name, category),
          proficiency_level
        `)
        .eq('student_id', student_id),
      supabaseClient
        .from('certifications')
        .select('*')
        .eq('student_id', student_id)
    ]);

    const projects = projectsResult.data || [];
    const skills = skillsResult.data || [];
    const certifications = certificationsResult.data || [];

    // Get target job details if provided
    let targetJob = null;
    if (target_job_id) {
      const { data: jobData } = await supabaseClient
        .from('job_opportunities')
        .select('*')
        .eq('id', target_job_id)
        .single();
      targetJob = jobData;
    }

    // Prepare comprehensive student data
    const studentData = {
      profile: {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        year_of_study: profile.year_of_study,
        gpa: profile.gpa,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url
      },
      projects: projects.map(p => ({
        title: p.title,
        description: p.description,
        tech_stack: p.tech_stack,
        github_url: p.github_url,
        live_url: p.live_url,
        status: p.status
      })),
      skills: skills.map((s: any) => ({
        name: s.skills.name,
        category: s.skills.category,
        proficiency: s.proficiency_level
      })),
      certifications: certifications.map(c => ({
        title: c.title,
        organization: c.issuing_organization,
        issue_date: c.issue_date,
        credential_url: c.credential_url
      }))
    };

    console.log('Student data prepared for AI analysis');

    // Call Lovable AI for resume enhancement
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'analyze') {
      systemPrompt = `You are an expert resume analyzer and career counselor. Your job is to analyze a student's profile and provide actionable feedback to improve their employability.

      Analyze the student's:
      1. Skills gaps compared to industry standards
      2. Project portfolio strength and areas for improvement
      3. Profile completeness and missing elements
      4. Resume formatting and content suggestions
      5. Specific recommendations for skill development

      Return a JSON response with:
      {
        "overall_score": 85,
        "strengths": ["Strong technical skills", "Good project portfolio"],
        "weaknesses": ["Missing soft skills", "No leadership experience"],
        "missing_skills": ["Docker", "AWS", "System Design"],
        "project_suggestions": ["Build a full-stack application", "Contribute to open source"],
        "profile_improvements": ["Add a professional summary", "Include quantified achievements"],
        "certification_recommendations": ["AWS Cloud Practitioner", "Google Analytics"],
        "action_plan": [
          {
            "priority": "high",
            "action": "Complete AWS certification",
            "timeline": "2 months",
            "impact": "Increases job opportunities by 40%"
          }
        ]
      }`;

      userPrompt = `Please analyze this student's profile and provide comprehensive feedback:

      Student Data:
      ${JSON.stringify(studentData, null, 2)}

      ${targetJob ? `Target Job:
      ${JSON.stringify(targetJob, null, 2)}

      Please also analyze how well the student matches this specific job and what they need to improve.` : ''}`;

    } else if (action === 'enhance') {
      systemPrompt = `You are an expert resume writer specializing in student and entry-level positions. Your job is to take a student's profile data and create a professional, ATS-friendly resume.

      Guidelines:
      1. Use a clean, professional format
      2. Quantify achievements where possible
      3. Use action verbs and industry keywords
      4. Tailor content to highlight relevant skills
      5. Keep it concise but comprehensive
      6. Include all relevant sections: Contact, Summary, Education, Projects, Skills, Certifications

      Return a JSON response with:
      {
        "enhanced_resume": "Full resume text in a professional format",
        "improvements_made": ["Added quantified achievements", "Improved action verbs"],
        "ats_score": 92,
        "keywords_added": ["React", "Node.js", "Agile"],
        "formatting_tips": ["Use consistent bullet points", "Keep consistent spacing"]
      }`;

      userPrompt = `Please create an enhanced resume for this student:

      Student Data:
      ${JSON.stringify(studentData, null, 2)}

      ${resume_text ? `Current Resume Text:
      ${resume_text}

      Please improve and enhance the existing resume.` : 'Please create a new professional resume from the profile data.'}

      ${targetJob ? `Target Job:
      ${JSON.stringify(targetJob, null, 2)}

      Please tailor the resume for this specific position.` : ''}`;

    } else {
      throw new Error('Invalid action. Use "analyze" or "enhance".');
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
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
    console.log('AI response received for action:', action);

    let result;
    try {
      const content = aiData.choices[0].message.content;
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback response
      if (action === 'analyze') {
        result = {
          overall_score: 70,
          strengths: ["Technical foundation"],
          weaknesses: ["Profile needs completion"],
          missing_skills: ["Communication", "Leadership"],
          project_suggestions: ["Build more complex projects"],
          profile_improvements: ["Complete all profile sections"],
          certification_recommendations: ["Industry-relevant certifications"],
          action_plan: [{
            priority: "high",
            action: "Complete profile",
            timeline: "1 week",
            impact: "Improves visibility to recruiters"
          }]
        };
      } else {
        result = {
          enhanced_resume: "Resume enhancement failed. Please try again.",
          improvements_made: [],
          ats_score: 0,
          keywords_added: [],
          formatting_tips: ["Please provide more details for better enhancement"]
        };
      }
    }

    console.log('Final result prepared for action:', action);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Error in ai-resume-enhancer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        overall_score: 0,
        enhanced_resume: "Error occurred during processing"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});