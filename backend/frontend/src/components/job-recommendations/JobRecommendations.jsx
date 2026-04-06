import JobList from './JobList';
import SkillGapAnalysis from './SkillGapAnalysis';

const JobRecommendations = ({ jobs, loading, resumes, onApply, darkMode }) => {
  
  const extractSkillsFromResumes = (resumes) => {
    if (!resumes || resumes.length === 0) return [];
    const skills = new Set();
    resumes.forEach(resume => {
      resume.skills?.forEach(skill => {
        if (typeof skill === 'string') {
          skills.add(skill);
        } else if (skill.name) {
          skills.add(skill.name);
        }
      });
    });
    return Array.from(skills);
  };

  const extractSkillsFromJobs = (jobs) => {
    if (!jobs || jobs.length === 0) return [];
    const skills = new Set();
    jobs.forEach(job => {
      job.requiredSkills?.forEach(skill => skills.add(skill));
      job.skills?.forEach(skill => skills.add(skill));
    });
    return Array.from(skills);
  };

  const userSkills = extractSkillsFromResumes(resumes);
  const jobSkills = extractSkillsFromJobs(jobs);

  return (
    <div className="space-y-6">
      <SkillGapAnalysis 
        userSkills={userSkills}
        jobSkills={jobSkills}
        darkMode={darkMode}
      />
      <JobList 
        jobs={jobs}
        loading={loading}
        onApply={onApply}
        darkMode={darkMode}
      />
    </div>
  );
};

export default JobRecommendations;