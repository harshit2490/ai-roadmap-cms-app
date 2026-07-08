import { supabase } from "../supabaseClient";

/**
 * Fetches all roadmap content from Supabase in parallel
 * and structures it identically to the original static data.
 */
export async function fetchFullRoadmapData() {
  const [
    { data: DBphases, error: errPhases },
    { data: DBweeks, error: errWeeks },
    { data: DBlessons, error: errLessons },
    { data: DBsections, error: errSections },
    { data: DBprojects, error: errProjects },
    { data: DBmilestones, error: errMilestones },
    { data: DBinterviews, error: errInterviews },
    { data: DBquestions, error: errQuestions },
  ] = await Promise.all([
    supabase.from("phases").select("*").order("id", { ascending: true }),
    supabase.from("weeks").select("*").order("order_no", { ascending: true }),
    supabase.from("lessons").select("*").order("week_id", { ascending: true }).order("order_no", { ascending: true }),
    supabase.from("explanation_sections").select("*").order("lesson_id", { ascending: true }).order("order_no", { ascending: true }),
    supabase.from("weekend_projects").select("*").order("order_no", { ascending: true }),
    supabase.from("project_milestones").select("*").order("weekend_project_id", { ascending: true }).order("order_no", { ascending: true }),
    supabase.from("mock_interviews").select("*").order("order_no", { ascending: true }),
    supabase.from("mock_interview_questions").select("*").order("mock_interview_id", { ascending: true }).order("order_no", { ascending: true }),
  ]);

  if (errPhases) throw errPhases;
  if (errWeeks) throw errWeeks;
  if (errLessons) throw errLessons;
  if (errSections) throw errSections;
  if (errProjects) throw errProjects;
  if (errMilestones) throw errMilestones;
  if (errInterviews) throw errInterviews;
  if (errQuestions) throw errQuestions;

  // Format to match frontend expected object keys (snake_case -> camelCase)
  const phases = DBphases.map(p => ({
    id: Number(p.id),
    label: p.label,
    title: p.title,
    weeks: p.weeks,
    color: p.color
  }));

  const weeks = DBweeks.map(w => ({
    id: Number(w.id),
    courseId: Number(w.course_id),
    phaseNo: Number(w.phase_no),
    weekNo: Number(w.week_no),
    title: w.title,
    slug: w.slug,
    order: Number(w.order_no),
    focus: w.focus,
    revisionCheckpoint: w.revision_checkpoint
  }));

  const lessons = DBlessons.map(l => ({
    id: Number(l.id),
    weekId: Number(l.week_id),
    lessonNo: Number(l.lesson_no),
    order: Number(l.order_no),
    slug: l.slug,
    title: l.title,
    estimatedMinutes: Number(l.estimated_minutes),
    difficulty: l.difficulty,
    exercise: l.exercise,
    interviewQuestion: l.interview_question
  }));

  // Build explanations array indexed similarly
  // Original structure: explanations = [{ courseId, phaseNo, weekNo, lessonNo, slug, title, estimatedMinutes, difficulty, sections: [...] }]
  const explanations = lessons.map(l => {
    const week = weeks.find(w => w.id === l.weekId);
    const sections = DBsections
      .filter(sec => Number(sec.lesson_id) === l.id)
      .map(sec => ({
        order: Number(sec.order_no),
        heading: sec.heading,
        body: sec.body,
        example: sec.example
      }));

    return {
      courseId: week?.courseId ?? 1,
      phaseNo: week?.phaseNo ?? 1,
      weekNo: week?.weekNo ?? 1,
      lessonNo: l.lessonNo,
      slug: l.slug,
      title: l.title,
      estimatedMinutes: l.estimatedMinutes,
      difficulty: l.difficulty,
      sections
    };
  });

  const weekendProjects = DBprojects.map(wp => ({
    id: Number(wp.id),
    weekId: Number(wp.week_id),
    order: Number(wp.order_no),
    slug: wp.slug,
    title: wp.title,
    description: wp.description
  }));

  const weekendProjectMilestones = DBmilestones.map(m => ({
    id: Number(m.id),
    weekendProjectId: Number(m.weekend_project_id),
    order: Number(m.order_no),
    title: m.title
  }));

  const mockInterviews = DBinterviews.map(mi => ({
    id: Number(mi.id),
    weekId: Number(mi.week_id),
    order: Number(mi.order_no),
    format: mi.format
  }));

  const mockInterviewQuestions = DBquestions.map(q => ({
    id: Number(q.id),
    mockInterviewId: Number(q.mock_interview_id),
    order: Number(q.order_no),
    question: q.question
  }));

  return {
    phases,
    weeks,
    lessons,
    explanations,
    weekendProjects,
    weekendProjectMilestones,
    mockInterviews,
    mockInterviewQuestions
  };
}
