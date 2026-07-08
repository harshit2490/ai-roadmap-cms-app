import { supabase } from "../supabaseClient";

// Helper to get max ID from any table to generate a new primary key
async function getNextId(table) {
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .order("id", { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) return 1;
  return Number(data[0].id) + 1;
}

// === Phases ===
export async function upsertPhase(phase) {
  const id = phase.id || (await getNextId("phases"));
  const { data, error } = await supabase
    .from("phases")
    .upsert({
      id,
      label: phase.label,
      title: phase.title,
      weeks: phase.weeks,
      color: phase.color,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePhase(id) {
  const { error } = await supabase.from("phases").delete().eq("id", id);
  if (error) throw error;
}

// === Weeks ===
export async function upsertWeek(week) {
  const id = week.id || (await getNextId("weeks"));
  const { data, error } = await supabase
    .from("weeks")
    .upsert({
      id,
      course_id: week.courseId || 1,
      phase_no: week.phaseNo,
      week_no: week.weekNo,
      title: week.title,
      slug: week.slug,
      order_no: week.order || week.weekNo,
      focus: week.focus,
      revision_checkpoint: week.revisionCheckpoint,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeek(id) {
  const { error } = await supabase.from("weeks").delete().eq("id", id);
  if (error) throw error;
}

// === Lessons ===
export async function upsertLesson(lesson, sections = []) {
  const id = lesson.id || (await getNextId("lessons"));
  const { data, error } = await supabase
    .from("lessons")
    .upsert({
      id,
      week_id: lesson.weekId,
      lesson_no: lesson.lessonNo,
      order_no: lesson.order || lesson.lessonNo,
      slug: lesson.slug,
      title: lesson.title,
      estimated_minutes: lesson.estimatedMinutes,
      difficulty: lesson.difficulty,
      exercise: lesson.exercise,
      interview_question: lesson.interviewQuestion,
    })
    .select()
    .single();

  if (error) throw error;

  // Sync explanation sections if provided
  if (sections && sections.length > 0) {
    // Delete existing sections for this lesson
    await supabase.from("explanation_sections").delete().eq("lesson_id", id);

    // Insert new sections
    const insertData = sections.map((sec, index) => ({
      lesson_id: id,
      order_no: sec.order || index + 1,
      heading: sec.heading,
      body: sec.body,
      example: sec.example || null,
    }));

    const { error: secError } = await supabase
      .from("explanation_sections")
      .insert(insertData);

    if (secError) throw secError;
  }

  return data;
}

export async function deleteLesson(id) {
  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw error;
}

// === Weekend Projects & Milestones ===
export async function upsertWeekendProject(project, milestones = []) {
  const id = project.id || (await getNextId("weekend_projects"));
  const { data, error } = await supabase
    .from("weekend_projects")
    .upsert({
      id,
      week_id: project.weekId,
      order_no: project.order || 1,
      slug: project.slug,
      title: project.title,
      description: project.description,
    })
    .select()
    .single();

  if (error) throw error;

  // Sync milestones if provided
  if (milestones) {
    // Delete existing milestones
    await supabase.from("project_milestones").delete().eq("weekend_project_id", id);

    if (milestones.length > 0) {
      // Get starting milestone ID
      let startId = await getNextId("project_milestones");
      const insertData = milestones.map((m, index) => ({
        id: startId + index,
        weekend_project_id: id,
        order_no: m.order || index + 1,
        title: m.title,
      }));

      const { error: mileError } = await supabase
        .from("project_milestones")
        .insert(insertData);

      if (mileError) throw mileError;
    }
  }

  return data;
}

export async function deleteWeekendProject(id) {
  const { error } = await supabase.from("weekend_projects").delete().eq("id", id);
  if (error) throw error;
}

// === Mock Interviews & Questions ===
export async function upsertMockInterview(interview, questions = []) {
  const id = interview.id || (await getNextId("mock_interviews"));
  const { data, error } = await supabase
    .from("mock_interviews")
    .upsert({
      id,
      week_id: interview.weekId,
      order_no: interview.order || 1,
      format: interview.format,
    })
    .select()
    .single();

  if (error) throw error;

  // Sync questions if provided
  if (questions) {
    // Delete existing questions
    await supabase.from("mock_interview_questions").delete().eq("mock_interview_id", id);

    if (questions.length > 0) {
      // Get starting question ID
      let startId = await getNextId("mock_interview_questions");
      const insertData = questions.map((q, index) => ({
        id: startId + index,
        mock_interview_id: id,
        order_no: q.order || index + 1,
        question: q.question,
      }));

      const { error: qError } = await supabase
        .from("mock_interview_questions")
        .insert(insertData);

      if (qError) throw qError;
    }
  }

  return data;
}

export async function deleteMockInterview(id) {
  const { error } = await supabase.from("mock_interviews").delete().eq("id", id);
  if (error) throw error;
}

// === Profiles (Users) ===
export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateProfileRole(id, role) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
