import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import current data files
import { phases, weeks, lessons, weekendProjects, weekendProjectMilestones, mockInterviews, mockInterviewQuestions } from '../src/data/roadmap.js';
import { explanations } from '../src/data/explanations.js';

let sql = `-- Seeding roadmap and explanation data\n\n`;

// Helper to escape single quotes for SQL
function escape(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// 1. Seed phases
sql += `-- 1. Seed phases\n`;
phases.forEach(p => {
  sql += `INSERT INTO public.phases (id, label, title, weeks, color) VALUES (${p.id}, ${escape(p.label)}, ${escape(p.title)}, ${escape(p.weeks)}, ${escape(p.color)}) ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, title = EXCLUDED.title, weeks = EXCLUDED.weeks, color = EXCLUDED.color;\n`;
});
sql += `\n`;

// 2. Seed weeks
sql += `-- 2. Seed weeks\n`;
weeks.forEach(w => {
  sql += `INSERT INTO public.weeks (id, course_id, phase_no, week_no, title, slug, order_no, focus, revision_checkpoint) VALUES (${w.id}, ${w.courseId}, ${w.phaseNo}, ${w.weekNo}, ${escape(w.title)}, ${escape(w.slug)}, ${w.order}, ${escape(w.focus)}, ${escape(w.revisionCheckpoint)}) ON CONFLICT (id) DO UPDATE SET course_id = EXCLUDED.course_id, phase_no = EXCLUDED.phase_no, week_no = EXCLUDED.week_no, title = EXCLUDED.title, slug = EXCLUDED.slug, order_no = EXCLUDED.order_no, focus = EXCLUDED.focus, revision_checkpoint = EXCLUDED.revision_checkpoint;\n`;
});
sql += `\n`;

// 3. Seed lessons
sql += `-- 3. Seed lessons\n`;
lessons.forEach(l => {
  sql += `INSERT INTO public.lessons (id, week_id, lesson_no, order_no, slug, title, estimated_minutes, difficulty, exercise, interview_question) VALUES (${l.id}, ${l.weekId}, ${l.lessonNo}, ${l.order}, ${escape(l.slug)}, ${escape(l.title)}, ${l.estimatedMinutes}, ${escape(l.difficulty)}, ${escape(l.exercise)}, ${escape(l.interviewQuestion)}) ON CONFLICT (id) DO UPDATE SET week_id = EXCLUDED.week_id, lesson_no = EXCLUDED.lesson_no, order_no = EXCLUDED.order_no, slug = EXCLUDED.slug, title = EXCLUDED.title, estimated_minutes = EXCLUDED.estimated_minutes, difficulty = EXCLUDED.difficulty, exercise = EXCLUDED.exercise, interview_question = EXCLUDED.interview_question;\n`;
});
sql += `\n`;

// 4. Seed explanation_sections
sql += `-- 4. Seed explanation sections\n`;
sql += `TRUNCATE TABLE public.explanation_sections CASCADE;\n`; // Since they generate IDs, clean start is safest

explanations.forEach(exp => {
  // Find week by weekNo
  const week = weeks.find(w => w.weekNo === exp.weekNo);
  if (!week) {
    console.error(`Week not found for explanation: weekNo=${exp.weekNo}`);
    return;
  }
  // Find lesson by lessonNo and weekId
  const lesson = lessons.find(l => l.lessonNo === exp.lessonNo && l.weekId === week.id);
  if (!lesson) {
    console.error(`Lesson not found for explanation: lessonNo=${exp.lessonNo}, weekNo=${exp.weekNo}`);
    return;
  }

  exp.sections.forEach(sec => {
    sql += `INSERT INTO public.explanation_sections (lesson_id, order_no, heading, body, example) VALUES (${lesson.id}, ${sec.order}, ${escape(sec.heading)}, ${escape(sec.body)}, ${escape(sec.example)});\n`;
  });
});
sql += `\n`;

// 5. Seed weekend_projects
sql += `-- 5. Seed weekend projects\n`;
weekendProjects.forEach(wp => {
  sql += `INSERT INTO public.weekend_projects (id, week_id, order_no, slug, title, description) VALUES (${wp.id}, ${wp.weekId}, ${wp.order}, ${escape(wp.slug)}, ${escape(wp.title)}, ${escape(wp.description)}) ON CONFLICT (id) DO UPDATE SET week_id = EXCLUDED.week_id, order_no = EXCLUDED.order_no, slug = EXCLUDED.slug, title = EXCLUDED.title, description = EXCLUDED.description;\n`;
});
sql += `\n`;

// 6. Seed project_milestones
sql += `-- 6. Seed project milestones\n`;
weekendProjectMilestones.forEach(m => {
  sql += `INSERT INTO public.project_milestones (id, weekend_project_id, order_no, title) VALUES (${m.id}, ${m.weekendProjectId}, ${m.order}, ${escape(m.title)}) ON CONFLICT (id) DO UPDATE SET weekend_project_id = EXCLUDED.weekend_project_id, order_no = EXCLUDED.order_no, title = EXCLUDED.title;\n`;
});
sql += `\n`;

// 7. Seed mock_interviews
sql += `-- 7. Seed mock interviews\n`;
mockInterviews.forEach(mi => {
  sql += `INSERT INTO public.mock_interviews (id, week_id, order_no, format) VALUES (${mi.id}, ${mi.weekId}, ${mi.order}, ${escape(mi.format)}) ON CONFLICT (id) DO UPDATE SET week_id = EXCLUDED.week_id, order_no = EXCLUDED.order_no, format = EXCLUDED.format;\n`;
});
sql += `\n`;

// 8. Seed mock_interview_questions
sql += `-- 8. Seed mock interview questions\n`;
mockInterviewQuestions.forEach(q => {
  sql += `INSERT INTO public.mock_interview_questions (id, mock_interview_id, order_no, question) VALUES (${q.id}, ${q.mockInterviewId}, ${q.order}, ${escape(q.question)}) ON CONFLICT (id) DO UPDATE SET mock_interview_id = EXCLUDED.mock_interview_id, order_no = EXCLUDED.order_no, question = EXCLUDED.question;\n`;
});
sql += `\n`;

const outputPath = join(__dirname, '../supabase/02_seed_data.sql');
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, sql, 'utf8');
console.log(`Successfully generated seed data script at: ${outputPath}`);
